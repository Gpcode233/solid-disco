# Minimal Youth Program Registration Website

A minimal, mobile-first, editorial registration website built with Next.js (App Router), TypeScript, Tailwind CSS, Phosphor Icons, and Google Sheets API.

The website follows a strict payment-first business flow:
**EVENT INFORMATION → PAY TO REGISTER → WHATSAPP PAYMENT VERIFICATION → REGISTRATION CODE → REGISTRATION FORM**

---

## Key Features

- **Editorial Aesthetic**: Playfair Display headlines, Inter body copy, clean white backgrounds, and deep purple accents.
- **Manual WhatsApp Verification**: No payment gateway or receipt uploads on the server; participants attach payment receipts directly in WhatsApp.
- **Code-Gated Registration**: Server-side verification ensures only participants with valid, unused registration codes issued by the organizer can access and submit the registration form.
- **Google Sheets Backend**: Direct server-side synchronization with Google Sheets for code validation and participant records.
- **Zero-Config Dev Mock**: Runs out of the box locally without needing Google Cloud credentials immediately (pre-seeded with test codes).

---

## Getting Started

### 1. Prerequisites

- [Node.js 18.17+](https://nodejs.org) (Node 20+ recommended)
- npm, pnpm, or yarn

### 2. Installation

Clone the repository and install dependencies:

```bash
git clone <your-repo-url>
cd <your-repo-dir>
npm install
```

### 3. Running Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

> **Local Development Mode**:
> If Google Sheets credentials are not set in `.env.local`, the app automatically runs in **Mock Store Mode**. You can immediately test the flow using:
> - **Available Codes**: `YIP-847291`, `YIP-492817`, `DEMO-2026`
> - **Already Used Code**: `YIP-183920`
> - **Invalid Code**: Any random string (e.g. `INVALID-123`)

---

## Google Sheets & Cloud Setup

To connect the application to a live Google Sheet:

### Step 1: Create a Google Cloud Project & Service Account

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project (e.g. `youth-program-registration`).
3. Navigate to **APIs & Services > Library** and search for **Google Sheets API**. Click **Enable**.
4. Navigate to **APIs & Services > Credentials** and click **Create Credentials > Service Account**.
5. Give the service account a name (e.g. `sheet-writer`) and click **Create and Continue**, then click **Done**.
6. Click on your newly created service account from the list.
7. Go to the **Keys** tab, click **Add Key > Create New Key**, select **JSON**, and click **Create**.
8. A JSON key file will download to your computer.

### Step 2: Set Up the Google Spreadsheet

1. Create a new Google Spreadsheet at [sheets.google.com](https://sheets.google.com).
2. Rename the spreadsheet (e.g. `Youth Program 2026 Database`).
3. Create **two sheets (tabs)** with the exact names:

#### Tab 1: `Codes`
Header Row (Row 1):
| Column A | Column B | Column C | Column D |
| :--- | :--- | :--- | :--- |
| `Registration Code` | `Status` | `Issued Date` | `Used Date` |

*Sample data for row 2+:*
- `YIP-847291` | `Available` | `2026-08-28` | *(empty)*
- `YIP-492817` | `Available` | `2026-08-28` | *(empty)*

#### Tab 2: `Registrations`
Header Row (Row 1):
| Column A | Column B | Column C | Column D | Column E | Column F | Column G | Column H | Column I | Column J | Column K | Column L | Column M |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `Registration Code` | `Full Name` | `Contact Number` | `Email` | `State of Origin` | `Denomination` | `Address` | `Sex` | `Age Bracket` | `Category of Interest` | `Suggestions` | `Future Contact` | `Registration Date` |

### Step 3: Share Spreadsheet with Service Account

1. Copy the `client_email` from your downloaded JSON key file (looks like `sheet-writer@your-project.iam.gserviceaccount.com`).
2. In your Google Spreadsheet, click the **Share** button in the top right.
3. Paste the service account email, grant it **Editor** permissions, and uncheck "Notify people", then click **Share**.

### Step 4: Configure Environment Variables

Create `.env.local` in your project root:

```env
# Extract from your Spreadsheet URL: https://docs.google.com/spreadsheets/d/<GOOGLE_SHEET_ID>/edit
GOOGLE_SHEET_ID=your_spreadsheet_id_here

# Extract from downloaded JSON key file
GOOGLE_SERVICE_ACCOUNT_EMAIL=sheet-writer@your-project.iam.gserviceaccount.com

# Extract private_key from downloaded JSON key file (keep quotes, keep \n intact)
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
```

---

## Customizing Event, Bank & WhatsApp Details

All event parameters live in a single centralized file: [`lib/config.ts`](lib/config.ts).

To change:
- **Event Name / Topic / Date / Location**: Modify `eventConfig.name`, `eventConfig.topic`, `eventConfig.date`, `eventConfig.location`.
- **Registration Fee**: Modify `eventConfig.fee` and `eventConfig.formattedFee`.
- **Bank Account Details**: Modify `eventConfig.payment.bankName`, `eventConfig.payment.accountName`, `eventConfig.payment.accountNumber`.
- **WhatsApp Phone & Pre-filled Message**: Modify `eventConfig.whatsapp.displayNumber`, `eventConfig.whatsapp.rawNumber`, and `eventConfig.whatsapp.defaultMessage`.
- **Form Options**: Modify `eventConfig.formOptions.categories`, `eventConfig.formOptions.ageBrackets`, etc.

---

## Workflow & Organizer Operations

```
1. Participant visits website ("/") and clicks "Pay to Register →".
2. Participant transfers ₦5,000 to PalmPay (9066091468 | BASSEY, MANFRED MBANG).
3. Participant clicks "I've Paid — Contact Organizer" to open WhatsApp and attach their payment screenshot.
4. Organizer checks their PalmPay app, verifies the incoming transfer, generates a code (e.g. YIP-847291), and adds it to the "Codes" tab with Status = "Available".
5. Organizer replies on WhatsApp with the code.
6. Participant goes to "/register", inputs the code, fills in their details, and submits.
7. The server records their information in the "Registrations" tab and flips the code Status in the "Codes" tab to "Used".
```

---

## Vercel Deployment

1. Push your code to GitHub / GitLab / Bitbucket.
2. Import the project into [Vercel](https://vercel.com).
3. In the project settings, add the Environment Variables:
   - `GOOGLE_SHEET_ID`
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL`
   - `GOOGLE_PRIVATE_KEY` (ensure `\n` linebreaks are preserved)
4. Click **Deploy**.

---

## License

MIT License. Designed and built for Youth Program 2026.
