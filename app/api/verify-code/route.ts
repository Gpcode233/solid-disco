import { NextRequest, NextResponse } from "next/server";
import { verifyRegistrationCode } from "@/lib/googleSheets";
import { validateCodeFormat } from "@/lib/validation";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const rawCode = body.code || "";

    const formatCheck = validateCodeFormat(rawCode);
    if (!formatCheck.isValid) {
      return NextResponse.json(
        {
          success: false,
          status: "INVALID",
          message: formatCheck.error || "Invalid registration code.",
        },
        { status: 400 }
      );
    }

    const result = await verifyRegistrationCode(rawCode);

    if (!result.success) {
      // 422 Unprocessable Entity or 400
      return NextResponse.json(
        {
          success: false,
          status: result.status,
          message: result.message,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      status: "AVAILABLE",
      code: result.code,
      message: "Registration code is valid.",
    });
  } catch (error: any) {
    console.error("[API verify-code] Internal error:", error);
    return NextResponse.json(
      {
        success: false,
        status: "ERROR",
        message: "An unexpected error occurred while verifying your code. Please try again or contact the organizer.",
      },
      { status: 500 }
    );
  }
}
