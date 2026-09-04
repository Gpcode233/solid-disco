"use client";

import React from "react";
import Image from "next/image";
import {
  Calendar,
  Clock,
  MapPin,
  Ticket,
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
      value: eventConfig.locationShort,
      detail: eventConfig.location,
    },
    {
      icon: Ticket,
      label: "Registration Fee",
      value: eventConfig.formattedFee,
      highlight: true,
    },
  ];

  return (
    <section className="pt-8 sm:pt-14 pb-12 sm:pb-16 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto text-center">
        {/* Church Logo & Host / Presenter Section */}
        <div className="flex flex-col items-center justify-center mb-6">
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 mb-3 rounded-full overflow-hidden shadow-md border-2 border-brand-border/60 bg-white">
            <Image
              src={eventConfig.logo}
              alt="The Censers Church Inc Logo"
              fill
              className="object-cover"
              priority
            />
          </div>
          <p className="text-xs sm:text-sm uppercase font-bold tracking-widest text-brand">
            {eventConfig.organizer} Presents
          </p>
          <p className="text-xs text-neutral-500 font-medium max-w-md mt-0.5">
            {eventConfig.subtitle}
          </p>
        </div>

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

        {/* Theme Banner */}
        <div className="bg-neutral-50 border border-neutral-200/80 rounded-2xl p-5 sm:p-6 mb-8 text-center">
          <span className="text-[11px] sm:text-xs uppercase tracking-widest font-bold text-brand block mb-1">
            Official Theme
          </span>
          <p className="font-serif text-xl sm:text-2xl md:text-3xl font-bold text-neutral-900">
            {eventConfig.topic}
          </p>
        </div>

        {/* Event Key Detail Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6 text-left">
          {eventDetails.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-4 rounded-xl border border-neutral-100 bg-white hover:border-brand-border transition-colors shadow-xs flex flex-col justify-between"
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

        {/* Detailed Venue Banner */}
        <div className="bg-white border border-neutral-100 rounded-xl p-3.5 text-xs text-neutral-600 flex items-center justify-center gap-2 shadow-2xs">
          <MapPin size={16} className="text-brand shrink-0" weight="fill" />
          <span><strong>Venue:</strong> {eventConfig.location}</span>
        </div>
      </div>
    </section>
  );
}
