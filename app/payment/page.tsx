"use client";

import React from "react";
import Link from "next/link";
import {
  CreditCard,
  ArrowRight,
  Info,
} from "@phosphor-icons/react";
import PaymentCard from "@/components/PaymentCard";
import WhatsAppButton from "@/components/WhatsAppButton";
import { eventConfig } from "@/lib/config";

export default function PaymentPage() {
  const steps = [
    {
      number: "01",
      title: "Make your transfer",
      description: `Transfer the exact registration fee of ${eventConfig.formattedFee} to the official PalmPay account above.`,
    },
    {
      number: "02",
      title: "Save your receipt",
      description: "Take a clear screenshot or save a PDF of your successful transaction.",
    },
    {
      number: "03",
      title: "Contact the organizer",
      description: "Click the WhatsApp button below and send your payment receipt directly to the organizer.",
    },
    {
      number: "04",
      title: "Receive your registration code",
      description: "The organizer will manually verify your payment and send you a unique registration code.",
    },
  ];

  return (
    <div className="py-10 sm:py-16 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">
        {/* Page Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-light text-brand text-xs font-semibold uppercase tracking-wider mb-4 border border-brand-border">
            <CreditCard size={14} weight="fill" />
            <span>Step 1: Payment Verification</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-neutral-900 mb-3">
            Complete Your Payment
          </h1>

          <p className="text-sm sm:text-base text-neutral-600 max-w-lg mx-auto">
            «Registration is only available after your payment has been verified.»
          </p>
        </div>

        {/* Bank Details Card */}
        <div className="mb-10">
          <PaymentCard />
        </div>

        {/* How It Works Instructions */}
        <div className="bg-neutral-50/70 border border-neutral-200/80 rounded-2xl p-6 sm:p-8 mb-10">
          <div className="mb-6">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-brand block mb-1">
              Instructions
            </span>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-neutral-900">
              How it works
            </h2>
          </div>

          <div className="space-y-6">
            {steps.map((step) => (
              <div key={step.number} className="flex items-start gap-4">
                <span className="font-serif text-lg sm:text-xl font-bold text-brand shrink-0 w-8">
                  {step.number}
                </span>
                <div>
                  <h3 className="text-sm sm:text-base font-semibold text-neutral-900 mb-0.5">
                    {step.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* WhatsApp Call-To-Action */}
        <div className="text-center mb-10">
          <WhatsAppButton className="w-full sm:w-auto text-base py-4 px-8" />
          <p className="text-xs text-neutral-500 mt-3 flex items-center justify-center gap-1.5 font-medium">
            <span>Direct WhatsApp line:</span>
            <span className="font-semibold text-neutral-800">{eventConfig.whatsapp.displayNumber}</span>
          </p>
        </div>

        {/* Important Notice */}
        <div className="p-4 sm:p-5 rounded-2xl bg-brand-light/60 border border-brand-border mb-10 flex items-start gap-3">
          <Info size={20} className="text-brand shrink-0 mt-0.5" weight="fill" />
          <div className="text-xs sm:text-sm text-neutral-700 leading-relaxed">
            <span className="font-bold text-neutral-900 block mb-0.5">Important Notice:</span>
            «You cannot complete registration until your payment has been verified and you receive a unique registration code from the organizer.»
          </div>
        </div>

        {/* Already have code? Direct link to /register */}
        <div className="text-center border-t border-neutral-100 pt-8">
          <p className="text-xs text-neutral-500 mb-2">
            Already received your registration code from the organizer?
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:underline"
          >
            <span>Proceed to Registration Form</span>
            <ArrowRight size={16} weight="bold" />
          </Link>
        </div>
      </div>
    </div>
  );
}
