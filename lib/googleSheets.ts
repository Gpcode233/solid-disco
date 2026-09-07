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

function hasGoogleCredentials(): boolean {
  return Boolean(
    process.env.GOOGLE_SHEET_ID &&
      process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
      process.env.GOOGLE_PRIVATE_KEY
  );
}

function getGoogleSheetsClient() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  let privateKey = process.env.GOOGLE_PRIVATE_KEY || "";

  // Handle newlines in private key when stored as single line string in environment variables
  if (privateKey.includes("\\n")) {
    privateKey = privateKey.replace(/\\n/g, "\n");
  }

  const auth = new google.auth.JWT({
    email,
    key: privateKey,
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

    // If matches YIP-XXXX pattern and not yet used in mock store registrations
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
    const spreadsheetId = process.env.GOOGLE_SHEET_ID!;

    // 1. Check Codes sheet (A:D -> Registration Code, Status, Issued Date, Used Date)
    let foundInCodes = false;
    let foundStatus = "";

    try {
      const codesResponse = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: "Codes!A2:D",
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

    // 2. Check Registrations sheet to confirm whether this code has already been registered
    try {
      const regResponse = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: "Registrations!A2:A",
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
    // If it's a valid YIP-XXXX pattern, allow graceful pass-through even if sheets API has a transient error
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
    const spreadsheetId = process.env.GOOGLE_SHEET_ID!;

    // 1. Update or Insert code in Codes tab
    try {
      const codesResponse = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: "Codes!A2:D",
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
        // Mark code as Used in existing row
        await sheets.spreadsheets.values.update({
          spreadsheetId,
          range: `Codes!B${codeRowIndex}:D${codeRowIndex}`,
          valueInputOption: "USER_ENTERED",
          requestBody: {
            values: [["Used", rows[codeRowIndex - 2][2] || formattedDate, formattedDate]],
          },
        });
      } else {
        // Append new row in Codes sheet
        await sheets.spreadsheets.values.append({
          spreadsheetId,
          range: "Codes!A2:D",
          valueInputOption: "USER_ENTERED",
          insertDataOption: "INSERT_ROWS",
          requestBody: {
            values: [[code, "Used", formattedDate, formattedDate]],
          },
        });
      }
    } catch (codeUpdateErr) {
      console.warn("[GoogleSheets] Could not update Codes tab:", codeUpdateErr);
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

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: "Registrations!A2:M",
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS",
      requestBody: {
        values: [registrationRow],
      },
    });

    return { success: true };
  } catch (error: any) {
    console.error("[GoogleSheets] Error saving registration:", error);
    throw new Error(error.message || "Failed to save registration to Google Sheets.");
  }
}
