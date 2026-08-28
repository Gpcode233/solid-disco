"use client";

import React from "react";
import { WhatsappLogo } from "@phosphor-icons/react";
import { eventConfig } from "@/lib/config";

interface WhatsAppButtonProps {
  customMessage?: string;
  className?: string;
  label?: string;
}

export default function WhatsAppButton({
  customMessage,
  className = "",
  label = "I've Paid — Contact Organizer",
}: WhatsAppButtonProps) {
  const message = customMessage || eventConfig.whatsapp.defaultMessage;
  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${eventConfig.whatsapp.rawNumber}?text=${encodedMessage}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-full bg-brand text-white font-semibold text-base hover:bg-brand-hover active:bg-brand-active transition-all shadow-md hover:shadow-lg w-full sm:w-auto text-center ${className}`}
    >
      <WhatsappLogo size={22} weight="fill" />
      <span>{label}</span>
    </a>
  );
}
