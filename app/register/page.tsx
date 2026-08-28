"use client";

import React, { useState } from "react";
import CodeVerification from "@/components/CodeVerification";
import RegistrationForm from "@/components/RegistrationForm";
import SuccessView from "@/components/SuccessView";
import { RegistrationFormData } from "@/lib/validation";
import { eventConfig } from "@/lib/config";

export default function RegisterPage() {
  const [verifiedCode, setVerifiedCode] = useState<string | null>(null);
  const [submittedData, setSubmittedData] = useState<RegistrationFormData | null>(null);

  return (
    <div className="py-10 sm:py-16 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Step 3: Success State */}
        {submittedData ? (
          <SuccessView registrationData={submittedData} />
        ) : verifiedCode ? (
          /* Step 2: Unlocked Registration Form */
          <RegistrationForm
            registrationCode={verifiedCode}
            onSuccess={(data) => {
              setSubmittedData(data);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
        ) : (
          /* Step 1: Code Verification Gate */
          <CodeVerification
            onVerified={(code) => {
              setVerifiedCode(code);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
        )}
      </div>
    </div>
  );
}
