import { NextResponse } from "next/server";
import { google } from "googleapis";
import { getCleanSpreadsheetId } from "@/lib/googleSheets";

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

export async function GET() {
  const spreadsheetId = getCleanSpreadsheetId();
  const clientEmail = cleanEnvValue(process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL);
  const privateKeyRaw = cleanEnvValue(process.env.GOOGLE_PRIVATE_KEY);
  const privateKey = formatPrivateKey(privateKeyRaw);

  const diagnostics = {
    hasSpreadsheetId: Boolean(spreadsheetId),
    spreadsheetIdLength: spreadsheetId.length,
    spreadsheetIdPreview: spreadsheetId ? `${spreadsheetId.slice(0, 6)}...${spreadsheetId.slice(-6)}` : "MISSING",
    hasClientEmail: Boolean(clientEmail),
    clientEmail: clientEmail || "MISSING",
    hasPrivateKey: Boolean(privateKeyRaw),
    privateKeyHasBegin: privateKey.includes("BEGIN PRIVATE KEY"),
    privateKeyHasEnd: privateKey.includes("END PRIVATE KEY"),
    privateKeyLength: privateKey.length,
  };

  if (!spreadsheetId || !clientEmail || !privateKeyRaw) {
    return NextResponse.json(
      {
        success: false,
        message: "Missing environment variables in Vercel. Please check GOOGLE_SHEET_ID, GOOGLE_SERVICE_ACCOUNT_EMAIL, and GOOGLE_PRIVATE_KEY.",
        diagnostics,
      },
      { status: 400 }
    );
  }

  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: clientEmail,
        private_key: privateKey,
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    // 1. Test Reading Spreadsheet Metadata
    const response = await sheets.spreadsheets.get({ spreadsheetId });
    const spreadsheetTitle = response.data.properties?.title || "Untitled Spreadsheet";
    const existingSheets = (response.data.sheets || []).map((s) => s.properties?.title || "");

    // 2. Test writing a test row to Registrations or the primary sheet
    let targetSheet = existingSheets.find((t) => t.toLowerCase() === "registrations") || existingSheets[0] || "Sheet1";

    return NextResponse.json({
      success: true,
      message: "Successfully connected to Google Sheets!",
      spreadsheetTitle,
      existingSheetTabs: existingSheets,
      targetSheet,
      diagnostics,
    });
  } catch (error: any) {
    console.error("[Diagnostics /api/test-sheets] Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to connect to Google Sheets",
        errorCode: error.code,
        errorDetails: error.errors || null,
        diagnostics,
        hint:
          error.code === 403 || (error.message && error.message.includes("permission"))
            ? `Please make sure you shared your Google Sheet with '${clientEmail}' as an 'Editor'.`
            : error.message && error.message.includes("key")
            ? "There might be an issue with the format of GOOGLE_PRIVATE_KEY. Make sure you copied the exact private_key from the downloaded JSON file."
            : undefined,
      },
      { status: 500 }
    );
  }
}
