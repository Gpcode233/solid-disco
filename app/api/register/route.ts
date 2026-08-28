import { NextRequest, NextResponse } from "next/server";
import { submitRegistration, verifyRegistrationCode } from "@/lib/googleSheets";
import { validateRegistrationData, sanitizeCode } from "@/lib/validation";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));

    // 1. Validate payload structure
    const validation = validateRegistrationData(body);
    if (!validation.isValid) {
      return NextResponse.json(
        {
          success: false,
          message: "Please correct the errors in the form.",
          errors: validation.errors,
        },
        { status: 400 }
      );
    }

    const sanitizedCode = sanitizeCode(body.registrationCode);

    // 2. Server-side code re-verification
    const codeCheck = await verifyRegistrationCode(sanitizedCode);
    if (!codeCheck.success) {
      return NextResponse.json(
        {
          success: false,
          status: codeCheck.status,
          message: codeCheck.message,
        },
        { status: 400 }
      );
    }

    // 3. Record registration and mark code Used in Google Sheets
    const result = await submitRegistration({
      registrationCode: sanitizedCode,
      name: body.name.trim(),
      contactNumber: body.contactNumber.trim(),
      email: body.email.trim(),
      stateOfOrigin: body.stateOfOrigin.trim(),
      denomination: body.denomination.trim(),
      address: body.address.trim(),
      sex: body.sex.trim(),
      ageBracket: body.ageBracket.trim(),
      categoryOfInterest: body.categoryOfInterest.trim(),
      suggestions: body.suggestions.trim(),
      futureContact: body.futureContact.trim(),
    });

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: result.message || "Failed to complete registration.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Registration completed successfully.",
      registrationCode: sanitizedCode,
    });
  } catch (error: any) {
    console.error("[API register] Internal error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "An unexpected error occurred during submission. Please try again or contact the organizer.",
      },
      { status: 500 }
    );
  }
}
