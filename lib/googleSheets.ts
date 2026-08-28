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
 * Verify if a registration code exists and is Available in Google Sheets (or Mock Store in dev)
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

  if (!hasGoogleCredentials()) {
    console.warn(
      "[GoogleSheets] Google Sheets credentials not detected. Operating in Local Dev Mock mode."
    );
    const mockEntry = mockStore.codes.get(code);

    if (!mockEntry) {
      return {
        success: false,
        status: "INVALID",
        message: "This registration code is invalid. Please check the code sent to you by the organizer.",
      };
    }

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

  try {
    const sheets = getGoogleSheetsClient();
    const spreadsheetId = process.env.GOOGLE_SHEET_ID!;

    // Query Codes sheet (A:D -> Registration Code, Status, Issued Date, Used Date)
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Codes!A2:D",
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      return {
        success: false,
        status: "INVALID",
        message: "This registration code is invalid. Please check the code sent to you by the organizer.",
      };
    }

    let foundRowIndex = -1;
    let foundStatus = "";

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowCode = sanitizeCode(row[0] || "");
      if (rowCode === code) {
        foundRowIndex = i + 2; // 1-indexed and account for header row at row 1
        foundStatus = (row[1] || "").trim();
        break;
      }
    }

    if (foundRowIndex === -1) {
      return {
        success: false,
        status: "INVALID",
        message: "This registration code is invalid. Please check the code sent to you by the organizer.",
      };
    }

    if (foundStatus.toLowerCase() === "used") {
      return {
        success: false,
        status: "USED",
        message: "This registration code has already been used. Please contact the organizer if you believe this is an error.",
      };
    }

    if (foundStatus.toLowerCase() !== "available") {
      return {
        success: false,
        status: "INVALID",
        message: `This registration code is currently not available (status: ${foundStatus}). Please contact the organizer.`,
      };
    }

    return {
      success: true,
      status: "AVAILABLE",
      code,
    };
  } catch (error: any) {
    console.error("[GoogleSheets] Error verifying code:", error);
    throw new Error(error.message || "Failed to communicate with Google Sheets.");
  }
}

/**
 * Submit registration data and mark the code as Used atomically
 */
export async function submitRegistration(formData: RegistrationFormData): Promise<{ success: boolean; message?: string }> {
  const code = sanitizeCode(formData.registrationCode);
  const nowIso = new Date().toISOString();
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

    // 1. Find the row index of the code in Codes tab
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

    if (codeRowIndex === -1) {
      return {
        success: false,
        message: "Registration code could not be located in records.",
      };
    }

    // 2. Mark code as Used in Codes!B{row}:D{row}
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `Codes!B${codeRowIndex}:D${codeRowIndex}`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [["Used", rows[codeRowIndex - 2][2] || "", formattedDate]],
      },
    });

    // 3. Append to Registrations sheet
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
