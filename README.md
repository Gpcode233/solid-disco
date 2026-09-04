# Youth Exclusive Programme September 2026 - Registration Website

A minimal, mobile-first, editorial registration website built with Next.js (App Router), TypeScript, Tailwind CSS, Phosphor Icons, and Google Sheets API for **The Censers Church Inc**.

**Theme**: Being Youthful, Useful and Impactful  
**Date**: Saturday, September 26, 2026 | 4:30 PM – 7:30 PM  
**Location**: Church Main Auditorium, New Layout (by Ani Junction, opp. WTC Gate), Enugu  
**Registration Fee**: ₦2,000 (All Categories)

---

## Business Flow

```
EVENT INFORMATION → PAY TO REGISTER (₦2,000 to First Bank) → WHATSAPP VERIFICATION (+234 703 912 1611) → RECEIVE CODE → COMPLETE REGISTRATION FORM
```

1. **Pay First**: Participant transfers ₦2,000 to **FIRST BANK** (`3055319457` | `EDIM USANG USANG`).
2. **WhatsApp Receipt Submission**: Participant clicks **"I've Paid — Contact Organizer"** to send their payment screenshot via WhatsApp deep link.
3. **Code Issuance**: Organizer verifies the payment, creates a unique code in Google Sheets (`Codes` tab) with `Status = Available`, and sends it to the participant.
4. **Code-Gated Form**: Participant visits `/register`, unlocks the form with their code, and registers for their chosen category (Bible Quiz, Solo/Group Singing, Solo/Group Dance, or General Summit Participant).
5. **Google Sheets Sync**: The backend atomically records participant info to the `Registrations` tab and updates the code status to `Used`.

---

## Bank Details

- **Bank Name**: FIRST BANK
- **Account Name**: EDIM USANG USANG
- **Account Number**: 3055319457
- **Registration Fee**: ₦2,000

---

## Special Competitions & Cash Prizes

- **Bible Quiz Competition**: 1st Prize = ₦20,000 | 2nd Prize = ₦10,000 *(Target: Proverbs Chapter 4, 5 and 6 - NKJV)*
- **Solo Singing Competition**: 1st Prize = ₦20,000 | 2nd Prize = ₦10,000 *(Target: Amazing Grace)*
- **Group Singing Competition**: 1st Prize = ₦40,000 | 2nd Prize = ₦20,000 *(Target: Amazing Grace)*
- **Solo Dance Competition**: 1st Prize = ₦20,000 | 2nd Prize = ₦10,000 *(Target: "Jesus na you dey reign" by Mercy Chinwo)*
- **Group Dance Competition**: 1st Prize = ₦40,000 | 2nd Prize = ₦20,000 *(Target: "Jesus na you dey reign" by Mercy Chinwo)*
- **Bonus Activities**: Live Fastest Finger trivia game & Dinner Summit.

---

## Environment Variables Setup

Configure `.env.local` or your Vercel Project Settings with:

```env
# 1. Google Spreadsheet ID
GOOGLE_SHEET_ID=1GrJwG2u1WSyr6b27yjyw4ZKbK4mUYwjqcYWKHmXmzMo

# 2. Service Account Email
GOOGLE_SERVICE_ACCOUNT_EMAIL=youth-program@gen-lang-client-0794420466.iam.gserviceaccount.com

# 3. Service Account Private Key (keep quotes around the key, \n intact)
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
```

> **Important**: Share your Google Sheet with `youth-program@gen-lang-client-0794420466.iam.gserviceaccount.com` as an **Editor**.

---

## Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Deploying to Vercel

```bash
git add .
git commit -m "Update bank details to First Bank, add Censers Church logo, and refine hero section"
git push origin main
```
