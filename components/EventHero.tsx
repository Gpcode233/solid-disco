"use client";

import React from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  MapPin,
  Ticket,
  ArrowRight,
  ShieldCheck,
} from "@phosphor-icons/react";
import { eventConfig } from "@/lib/config";

export default function EventHero() {
  const eventDetails = [
    {
      icon: Calendar,
      label: "Date",
      value: eventConfig.date,
    },
    {
      icon: Clock,
      label: "Time",
      value: eventConfig.time,
    },
    {
      icon: MapPin,
      label: "Location",
      value: eventConfig.location,
    },
    {
      icon: Ticket,
      label: "Registration Fee",
      value: eventConfig.formattedFee,
      highlight: true,
    },
  ];

  return (
    <section className="pt-10 sm:pt-16 pb-12 sm:pb-16 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto text-center">
        {/* Eyebrow */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-brand-light border border-brand-border text-brand text-xs font-semibold tracking-widest uppercase mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
          {eventConfig.eyebrow}
        </div>

        {/* Playfair Headline */}
        <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-neutral-900 leading-[1.15] mb-6">
          {eventConfig.headline}
        </h1>

        {/* Editorial Description */}
        <p className="text-base sm:text-lg text-neutral-600 leading-relaxed max-w-2xl mx-auto mb-8">
          «{eventConfig.description}»
        </p>

        {/* Topic Banner */}
        <div className="bg-neutral-50 border border-neutral-200/80 rounded-2xl p-4 sm:p-5 mb-10 text-center">
          <span className="text-[11px] sm:text-xs uppercase tracking-widest font-semibold text-brand block mb-1">
            Official Topic
          </span>
          <p className="font-serif text-lg sm:text-xl font-bold text-neutral-900">
            {eventConfig.topic}
          </p>
        </div>

        {/* Event Key Detail Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-10 text-left">
          {eventDetails.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-4 rounded-xl border border-neutral-100 bg-white hover:border-brand-border transition-colors shadow-sm flex flex-col justify-between"
              >
                <div className="w-8 h-8 rounded-lg bg-brand-light flex items-center justify-center text-brand mb-3">
                  <Icon size={18} weight="duotone" />
                </div>
                <div>
                  <span className="text-[11px] text-neutral-400 font-medium uppercase tracking-wider block">
                    {item.label}
                  </span>
                  <span
                    className={`text-sm sm:text-base font-semibold block mt-0.5 ${
                      item.highlight ? "text-brand font-bold" : "text-neutral-900"
                    }`}
                  >
                    {item.value}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Primary CTA Section */}
        <div className="flex flex-col items-center justify-center gap-3">
          <Link
            href="/payment"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full bg-brand text-white font-medium text-base hover:bg-brand-hover active:bg-brand-active transition-all shadow-md hover:shadow-lg group"
          >
            <span>Pay to Register</span>
            <ArrowRight
              size={18}
              weight="bold"
              className="group-hover:translate-x-1 transition-transform"
            />
          </Link>

          <p className="text-xs text-neutral-500 flex items-center gap-1.5 font-medium">
            <ShieldCheck size={14} className="text-brand" weight="fill" />
            Payment required before registration
          </p>
        </div>
      </div>
    </section>
  );
}
