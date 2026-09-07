import { google } from "googleapis";
import { sanitizeCode, RegistrationFormData } from "./validation";

// Structure of a code record in Sheet 1: Codes
export interface CodeRecord {
  code: string;
  status: "Available" | "Used" | string;
  issuedDate?: string;
  usedDate?: string;
  rowIndex?: number;
}

export type CodeVerificationResult =
  | { success: true; status: "AVAILABLE"; code: string }
  | { success: false; status: "USED"; message: string }
  | { success: false; status: "INVALID"; message: string };

// In-memory mock store for local development when credentials are not yet configured
interface MockStore {
  codes: Map<string, { status: "Available" | "Used"; issuedDate: string; usedDate?: string }>;
  registrations: Array<RegistrationFormData & { registrationDate: string }>;
}

const mockStore: MockStore = {
  codes: new Map([
    ["YIP-847291", { status: "Available", issuedDate: "2026-08-28" }],
    ["YIP-492817", { status: "Available", issuedDate: "2026-08-28" }],
    ["YIP-183920", { status: "Used", issuedDate: "2026-08-27", usedDate: "2026-08-28" }],
    ["DEMO-2026", { status: "Available", issuedDate: "2026-08-28" }],
  ]),
  registrations: [],
};

function cleanEnvValue(val?: string): string {
  if (!val) return "";
  let cleaned = val.trim();
  if (
    (cleaned.startsWith('"') && cleaned.endsWith('"')) ||
    (cleaned.startsWith("'") && cleaned.endsWith("'"))
  ) {
    cleaned = cleaned.slice(1, -1).trim();
  }
  return cleaned;
}

function formatPrivateKey(rawKey?: string): string {
  let key = cleanEnvValue(rawKey);
  key = key.replace(/\\n/g, "\n");
  if (!key.includes("BEGIN PRIVATE KEY") && key.trim()) {
    key = `-----BEGIN PRIVATE KEY-----\n${key.trim()}\n-----END PRIVATE KEY-----\n`;
  }
  return key;
}

export function getCleanSpreadsheetId(): string {
  let id = cleanEnvValue(process.env.GOOGLE_SHEET_ID);
  if (id.includes("/d/")) {
    const match = id.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (match) id = match[1];
  }
  return id;
}

export function getCleanClientEmail(): string {
  const email =
    cleanEnvValue(process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL) ||
    cleanEnvValue(process.env.GOOGLE_CLIENT_EMAIL) ||
    cleanEnvValue(process.env.CLIENT_EMAIL) ||
    cleanEnvValue(process.env.GOOGLE_SERVICE_ACCOUNT) ||
    "youth-program@gen-lang-client-0794420466.iam.gserviceaccount.com";
  return email;
}

function hasGoogleCredentials(): boolean {
  return Boolean(
    getCleanSpreadsheetId() &&
      getCleanClientEmail() &&
      cleanEnvValue(process.env.GOOGLE_PRIVATE_KEY)
  );
}

function getGoogleSheetsClient() {
  const email = getCleanClientEmail();
  const privateKey = formatPrivateKey(process.env.GOOGLE_PRIVATE_KEY);

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: email,
      private_key: privateKey,
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  return google.sheets({ version: "v4", auth });
}

/**
 * Check if a code matches the organizer pattern (e.g. YIP-0001, YIP-1234)
 */
export function isStandardOrganizerCode(code: string): boolean {
  const sanitized = sanitizeCode(code);
  return /^YIP-\d{4}$/i.test(sanitized);
}

/**
 * Helper to inspect sheet tabs and auto-create Registrations/Codes tabs if needed
 */
async function resolveSheetTabs(sheets: any, spreadsheetId: string): Promise<{ codesTab: string; regTab: string }> {
  try {
    const meta = await sheets.spreadsheets.get({ spreadsheetId });
    const sheetTitles: string[] = (meta.data.sheets || []).map((s: any) => s.properties?.title || "");

    let codesTab = sheetTitles.find((t) => t.toLowerCase() === "codes") || "";
    let regTab = sheetTitles.find((t) => t.toLowerCase() === "registrations" || t.toLowerCase() === "registration") || "";

    // If Registrations tab doesn't exist, try finding any sheet with 'reg' or use first sheet
    if (!regTab) {
      const fallbackReg = sheetTitles.find((t) => t.toLowerCase().includes("reg")) || sheetTitles[0] || "Sheet1";
      try {
        await sheets.spreadsheets.batchUpdate({
          spreadsheetId,
          requestBody: {
            requests: [
              {
                addSheet: {
                  properties: { title: "Registrations" },
                },
              },
            ],
          },
        });
        regTab = "Registrations";
        // Add header row
        await sheets.spreadsheets.values.update({
          spreadsheetId,
          range: "Registrations!A1:M1",
          valueInputOption: "USER_ENTERED",
          requestBody: {
            values: [
              [
                "Registration Code",
                "Full Name",
                "Contact Number",
                "Email",
                "State of Origin",
                "Denomination",
                "Address",
                "Sex",
                "Age Bracket",
                "Category of Interest",
                "Suggestions",
                "Future Contact",
                "Registration Date",
              ],
            ],
          },
        });
      } catch (addErr) {
        console.warn("[GoogleSheets] Could not create Registrations tab, using fallback:", fallbackReg);
        regTab = fallbackReg;
      }
    }

    // If Codes tab doesn't exist, try creating it
    if (!codesTab) {
      try {
        await sheets.spreadsheets.batchUpdate({
          spreadsheetId,
          requestBody: {
            requests: [
              {
                addSheet: {
                  properties: { title: "Codes" },
                },
              },
            ],
          },
        });
        codesTab = "Codes";
        // Add header row
        await sheets.spreadsheets.values.update({
          spreadsheetId,
          range: "Codes!A1:D1",
          valueInputOption: "USER_ENTERED",
          requestBody: {
            values: [["Registration Code", "Status", "Issued Date", "Used Date"]],
          },
        });
      } catch (addCodesErr) {
        console.warn("[GoogleSheets] Could not create Codes tab:", addCodesErr);
        codesTab = "Codes";
      }
    }

    return { codesTab, regTab };
  } catch (err) {
    console.warn("[GoogleSheets] Error resolving tabs:", err);
    return { codesTab: "Codes", regTab: "Registrations" };
  }
}

/**
 * Verify if a registration code exists/is valid and is Available in Google Sheets (or Mock Store in dev)
 */
export async function verifyRegistrationCode(rawCode: string): Promise<CodeVerificationResult> {
  const code = sanitizeCode(rawCode);

  if (!code) {
    return {
      success: false,
      status: "INVALID",
      message: "Please enter your registration code.",
    };
  }

  const isOrganizerPattern = isStandardOrganizerCode(code);

  if (!hasGoogleCredentials()) {
    console.warn(
      "[GoogleSheets] Google Sheets credentials not detected. Operating in Local Dev Mock mode."
    );
    const mockEntry = mockStore.codes.get(code);

    if (mockEntry) {
      if (mockEntry.status.toLowerCase() === "used") {
        return {
          success: false,
          status: "USED",
          message: "This registration code has already been used. Please contact the organizer if you believe this is an error.",
        };
      }
      return {
        success: true,
        status: "AVAILABLE",
        code,
      };
    }

    if (isOrganizerPattern) {
      const isAlreadyUsed = mockStore.registrations.some(
        (r) => sanitizeCode(r.registrationCode) === code
      );
      if (isAlreadyUsed) {
        return {
          success: false,
          status: "USED",
          message: "This registration code has already been used. Please contact the organizer if you believe this is an error.",
        };
      }
      return {
        success: true,
        status: "AVAILABLE",
        code,
      };
    }

    return {
      success: false,
      status: "INVALID",
      message: "This registration code is invalid. Please check the code sent to you by the organizer.",
    };
  }

  try {
    const sheets = getGoogleSheetsClient();
    const spreadsheetId = getCleanSpreadsheetId();
    const { codesTab, regTab } = await resolveSheetTabs(sheets, spreadsheetId);

    // 1. Check Codes tab
    let foundInCodes = false;
    let foundStatus = "";

    try {
      const codesResponse = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${codesTab}!A2:D`,
      });

      const rows = codesResponse.data.values || [];
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const rowCode = sanitizeCode(row[0] || "");
        if (rowCode === code) {
          foundInCodes = true;
          foundStatus = (row[1] || "").trim();
          break;
        }
      }
    } catch (codesErr) {
      console.warn("[GoogleSheets] Notice reading Codes sheet:", codesErr);
    }

    if (foundInCodes) {
      if (foundStatus.toLowerCase() === "used") {
        return {
          success: false,
          status: "USED",
          message: "This registration code has already been used. Please contact the organizer if you believe this is an error.",
        };
      }

      return {
        success: true,
        status: "AVAILABLE",
        code,
      };
    }

    // 2. Check Registrations tab to confirm whether this code has already been registered
    try {
      const regResponse = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${regTab}!A2:A`,
      });

      const regRows = regResponse.data.values || [];
      for (const row of regRows) {
        if (sanitizeCode(row[0] || "") === code) {
          return {
            success: false,
            status: "USED",
            message: "This registration code has already been used. Please contact the organizer if you believe this is an error.",
          };
        }
      }
    } catch (regErr) {
      console.warn("[GoogleSheets] Notice reading Registrations sheet:", regErr);
    }

    // 3. If it matches the organizer pattern (YIP-XXXX where XXXX is 4 digits), and was not used above, it is valid!
    if (isOrganizerPattern) {
      return {
        success: true,
        status: "AVAILABLE",
        code,
      };
    }

    return {
      success: false,
      status: "INVALID",
      message: "This registration code is invalid. Please check the code sent to you by the organizer.",
    };
  } catch (error: any) {
    console.error("[GoogleSheets] Error verifying code:", error);
    if (isOrganizerPattern) {
      return {
        success: true,
        status: "AVAILABLE",
        code,
      };
    }
    throw new Error(error.message || "Failed to communicate with Google Sheets.");
  }
}

/**
 * Submit registration data and mark the code as Used atomically
 */
export async function submitRegistration(formData: RegistrationFormData): Promise<{ success: boolean; message?: string }> {
  const code = sanitizeCode(formData.registrationCode);
  const formattedDate = new Date().toLocaleString("en-NG", {
    timeZone: "Africa/Lagos",
    dateStyle: "medium",
    timeStyle: "short",
  });

  // Re-verify code first to avoid race conditions
  const verification = await verifyRegistrationCode(code);
  if (!verification.success) {
    return {
      success: false,
      message: verification.message,
    };
  }

  if (!hasGoogleCredentials()) {
    console.warn(
      "[GoogleSheets] Dev Mock Mode: Saving registration and marking code as Used."
    );
    const mockEntry = mockStore.codes.get(code);
    if (mockEntry) {
      mockEntry.status = "Used";
      mockEntry.usedDate = formattedDate;
    } else {
      mockStore.codes.set(code, {
        status: "Used",
        issuedDate: formattedDate,
        usedDate: formattedDate,
      });
    }

    mockStore.registrations.push({
      ...formData,
      registrationCode: code,
      registrationDate: formattedDate,
    });

    return { success: true };
  }

  try {
    const sheets = getGoogleSheetsClient();
    const spreadsheetId = getCleanSpreadsheetId();
    const { codesTab, regTab } = await resolveSheetTabs(sheets, spreadsheetId);

    // 1. Update or Insert code in Codes tab
    try {
      const codesResponse = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${codesTab}!A2:D`,
      });

      const rows = codesResponse.data.values || [];
      let codeRowIndex = -1;

      for (let i = 0; i < rows.length; i++) {
        if (sanitizeCode(rows[i][0] || "") === code) {
          codeRowIndex = i + 2;
          break;
        }
      }

      if (codeRowIndex !== -1) {
        await sheets.spreadsheets.values.update({
          spreadsheetId,
          range: `${codesTab}!B${codeRowIndex}:D${codeRowIndex}`,
          valueInputOption: "USER_ENTERED",
          requestBody: {
            values: [["Used", rows[codeRowIndex - 2][2] || formattedDate, formattedDate]],
          },
        });
      } else {
        await sheets.spreadsheets.values.append({
          spreadsheetId,
          range: `${codesTab}!A2:D`,
          valueInputOption: "USER_ENTERED",
          insertDataOption: "INSERT_ROWS",
          requestBody: {
            values: [[code, "Used", formattedDate, formattedDate]],
          },
        });
      }
    } catch (codeUpdateErr) {
      console.warn("[GoogleSheets] Notice updating Codes tab:", codeUpdateErr);
    }

    // 2. Append to Registrations sheet
    // Columns: Registration Code, Full Name, Contact Number, Email, State of Origin, Denomination, Address, Sex, Age Bracket, Category of Interest, Suggestions, Future Contact, Registration Date
    const registrationRow = [
      code,
      formData.name.trim(),
      formData.contactNumber.trim(),
      formData.email.trim(),
      formData.stateOfOrigin.trim(),
      formData.denomination.trim(),
      formData.address.trim(),
      formData.sex.trim(),
      formData.ageBracket.trim(),
      formData.categoryOfInterest.trim(),
      formData.suggestions.trim(),
      formData.futureContact.trim(),
      formattedDate,
    ];

    console.log(`[GoogleSheets] Appending registration for ${formData.name} to ${regTab}!A2:M`);

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${regTab}!A2:M`,
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS",
      requestBody: {
        values: [registrationRow],
      },
    });

    console.log(`[GoogleSheets] Successfully appended registration to Google Sheets.`);
    return { success: true };
  } catch (error: any) {
    console.error("[GoogleSheets] Error saving registration:", error);
    throw new Error(error.message || "Failed to save registration to Google Sheets.");
  }
}
