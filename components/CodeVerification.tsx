"use client";

import React, { useState } from "react";
import { Key, ArrowRight, SpinnerGap, WarningCircle, WhatsappLogo } from "@phosphor-icons/react";
import { eventConfig } from "@/lib/config";

interface CodeVerificationProps {
  onVerified: (code: string) => void;
}

export default function CodeVerification({ onVerified }: CodeVerificationProps) {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = code.trim().toUpperCase();

    if (!cleanCode) {
      setErrorMessage("Please enter the registration code sent by the organizer.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: cleanCode }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setErrorMessage(
          data.message || "Failed to verify registration code. Please try again."
        );
        return;
      }

      // Success
      onVerified(data.code || cleanCode);
    } catch (err: any) {
      console.error("Verification error:", err);
      setErrorMessage(
        "Network error. Please check your internet connection and try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white border border-neutral-200/90 rounded-2xl p-6 sm:p-8 shadow-xs">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-full bg-brand-light text-brand mx-auto flex items-center justify-center mb-4">
            <Key size={24} weight="duotone" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-neutral-900 mb-2">
            Enter Your Registration Code
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500">
            «Your payment must be verified before you can register.»
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="regCodeInput"
              className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 block mb-1.5"
            >
              Registration Code
            </label>
            <input
              id="regCodeInput"
              type="text"
              value={code}
              onChange={(e) => {
                setCode(e.target.value.toUpperCase());
                if (errorMessage) setErrorMessage(null);
              }}
              disabled={isLoading}
              className="w-full px-4 py-3.5 rounded-xl border border-neutral-300 text-neutral-900 font-mono text-base tracking-wider focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all disabled:bg-neutral-50"
              autoFocus
              autoComplete="off"
              spellCheck={false}
            />
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-purple-50/50 border border-brand-border text-brand text-xs sm:text-sm flex items-start gap-2.5 animate-fadeIn">
              <WarningCircle size={18} weight="fill" className="shrink-0 mt-0.5" />
              <div className="leading-snug">
                <span>{errorMessage}</span>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !code.trim()}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-brand text-white font-semibold text-sm hover:bg-brand-hover active:bg-brand-active disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            {isLoading ? (
              <>
                <SpinnerGap size={18} className="animate-spin" />
                <span>Verifying Code...</span>
              </>
            ) : (
              <>
                <span>Continue</span>
                <ArrowRight size={16} weight="bold" />
              </>
            )}
          </button>
        </form>

        {/* WhatsApp Help Footer */}
        <div className="mt-8 pt-6 border-t border-neutral-100 text-center">
          <p className="text-xs text-neutral-500 mb-2">
            Don't have a registration code yet?
          </p>
          <a
            href={`https://wa.me/${eventConfig.whatsapp.rawNumber}?text=${encodeURIComponent(
              "Hello organizer, I need assistance getting my registration code for the Youth Program 2026."
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand hover:underline"
          >
            <WhatsappLogo size={15} weight="fill" />
            <span>Contact Organizer on WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
}
