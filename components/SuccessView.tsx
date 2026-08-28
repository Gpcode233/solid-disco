"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  CheckCircle,
  Copy,
  Check,
  WhatsappLogo,
  ArrowLeft,
  Calendar,
  MapPin,
  Clock,
} from "@phosphor-icons/react";
import { eventConfig } from "@/lib/config";
import { RegistrationFormData } from "@/lib/validation";

interface SuccessViewProps {
  registrationData: RegistrationFormData;
}

export default function SuccessView({ registrationData }: SuccessViewProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(registrationData.registrationCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error("Failed to copy registration code:", err);
    }
  };

  const whatsappMessage = encodeURIComponent(
    `Hello organizer, I have successfully completed my registration for ${eventConfig.name} with code: ${registrationData.registrationCode}. My name is ${registrationData.name}.`
  );

  return (
    <div className="max-w-xl mx-auto">
      <div className="bg-white border border-neutral-200/90 rounded-2xl p-6 sm:p-10 shadow-xs text-center">
        {/* Success Icon */}
        <div className="w-16 h-16 rounded-full bg-brand-light text-brand mx-auto flex items-center justify-center mb-6">
          <CheckCircle size={36} weight="fill" />
        </div>

        {/* Title & Message */}
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-neutral-900 mb-2">
          You're Registered! 🎉
        </h2>
        <p className="text-sm sm:text-base text-neutral-600 mb-8">
          «Your registration has been successfully completed.»
        </p>

        {/* Registration Code Badge */}
        <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-6 mb-8 text-left">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
              Registration Code
            </span>
            <button
              type="button"
              onClick={handleCopyCode}
              className="inline-flex items-center gap-1 text-xs font-medium text-brand hover:underline"
            >
              {copied ? (
                <>
                  <Check size={14} weight="bold" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy size={14} weight="bold" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>

          <div className="font-mono text-2xl sm:text-3xl font-bold text-brand tracking-wider py-1">
            {registrationData.registrationCode}
          </div>

          <p className="text-xs text-neutral-500 mt-2 font-medium">
            «Please keep this code for your records and check-in at the venue.»
          </p>
        </div>

        {/* Participant Summary */}
        <div className="bg-white border border-neutral-100 rounded-xl p-4 mb-8 text-left text-xs space-y-2">
          <div className="flex justify-between py-1 border-b border-neutral-100">
            <span className="text-neutral-400">Participant:</span>
            <span className="font-semibold text-neutral-900">{registrationData.name}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-neutral-100">
            <span className="text-neutral-400">Contact:</span>
            <span className="font-medium text-neutral-800">{registrationData.contactNumber}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-neutral-100">
            <span className="text-neutral-400">Email:</span>
            <span className="font-medium text-neutral-800">{registrationData.email}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-neutral-400">Category:</span>
            <span className="font-medium text-neutral-800">{registrationData.categoryOfInterest}</span>
          </div>
        </div>

        {/* Event Quick Info */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-neutral-500 mb-8 py-3 border-y border-neutral-100">
          <span className="flex items-center gap-1">
            <Calendar size={14} className="text-brand" />
            {eventConfig.date}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Clock size={14} className="text-brand" />
            {eventConfig.time}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <MapPin size={14} className="text-brand" />
            {eventConfig.location}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href={`https://wa.me/${eventConfig.whatsapp.rawNumber}?text=${whatsappMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-brand text-white font-semibold text-sm hover:bg-brand-hover active:bg-brand-active transition-all shadow-sm"
          >
            <WhatsappLogo size={18} weight="fill" />
            <span>Contact Organizer on WhatsApp</span>
          </a>

          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-3.5 rounded-full border border-neutral-300 text-neutral-700 font-medium text-sm hover:bg-neutral-50 transition-all"
          >
            <ArrowLeft size={16} />
            <span>Back to Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
