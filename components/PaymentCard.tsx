"use client";

import React, { useState } from "react";
import { Copy, Check, Bank } from "@phosphor-icons/react";
import { eventConfig } from "@/lib/config";

export default function PaymentCard() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(eventConfig.payment.accountNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error("Failed to copy account number:", err);
    }
  };

  return (
    <div className="bg-white border-2 border-brand-border/90 rounded-2xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
      {/* Decorative accent top bar */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-brand" />

      <div className="flex items-center justify-between gap-4 pb-5 border-b border-neutral-100 mb-6">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 block">
            Registration Fee
          </span>
          <span className="font-serif text-2xl sm:text-3xl font-bold text-brand">
            {eventConfig.formattedFee}
          </span>
        </div>

        <div className="w-10 h-10 rounded-full bg-brand-light flex items-center justify-center text-brand">
          <Bank size={22} weight="duotone" />
        </div>
      </div>

      <div className="space-y-4">
        {/* Bank Name */}
        <div>
          <label className="text-[11px] font-medium uppercase tracking-wider text-neutral-400 block mb-0.5">
            Bank Name
          </label>
          <p className="text-base font-semibold text-neutral-900">
            {eventConfig.payment.bankName}
          </p>
        </div>

        {/* Account Name */}
        <div>
          <label className="text-[11px] font-medium uppercase tracking-wider text-neutral-400 block mb-0.5">
            Account Name
          </label>
          <p className="text-base font-semibold text-neutral-900 tracking-wide">
            {eventConfig.payment.accountName}
          </p>
        </div>

        {/* Account Number with Copy Button */}
        <div>
          <label className="text-[11px] font-medium uppercase tracking-wider text-neutral-400 block mb-0.5">
            Account Number
          </label>
          <div className="flex items-center justify-between bg-neutral-50 rounded-xl px-4 py-3 border border-neutral-200">
            <span className="font-mono text-lg sm:text-xl font-bold text-neutral-900 tracking-wider">
              {eventConfig.payment.accountNumber}
            </span>

            <button
              type="button"
              onClick={handleCopy}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                copied
                  ? "bg-brand text-white"
                  : "bg-white text-neutral-700 hover:text-brand hover:border-brand-border border border-neutral-200 shadow-2xs"
              }`}
              aria-label="Copy account number"
            >
              {copied ? (
                <>
                  <Check size={14} weight="bold" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy size={14} weight="bold" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
