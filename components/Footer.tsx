"use client";

import React from "react";
import Image from "next/image";
import { WhatsappLogo } from "@phosphor-icons/react";
import { eventConfig } from "@/lib/config";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-neutral-100 bg-white py-12 px-4 sm:px-6 mt-auto">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-full overflow-hidden border border-brand-border/80 shrink-0">
            <Image
              src={eventConfig.logo}
              alt="The Censers Church Inc"
              fill
              className="object-cover"
            />
          </div>
          <div>
            <p className="font-serif font-bold text-neutral-900 text-base">
              {eventConfig.name}
            </p>
            <p className="text-xs text-brand font-semibold mt-0.5">
              {eventConfig.organizer}
            </p>
            <p className="text-xs text-neutral-500 mt-0.5">
              {eventConfig.date} • {eventConfig.locationShort}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 text-xs text-neutral-500">
          <a
            href={`https://wa.me/${eventConfig.whatsapp.rawNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-neutral-700 hover:text-brand transition-colors font-medium"
          >
            <WhatsappLogo size={16} weight="fill" className="text-brand" />
            <span>Need Help? Contact Organizer on WhatsApp</span>
          </a>

          <span className="hidden sm:inline text-neutral-300">•</span>
          <span>© {currentYear} All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}
