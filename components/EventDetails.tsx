"use client";

import React from "react";
import { Sparkle, ChatCircleText, UsersThree } from "@phosphor-icons/react";
import { eventConfig } from "@/lib/config";

export default function EventDetails() {
  const icons = [Sparkle, ChatCircleText, UsersThree];

  return (
    <section className="py-12 px-4 sm:px-6 border-t border-neutral-100 bg-neutral-50/50">
      <div className="max-w-3xl mx-auto">
        {/* About the Program */}
        <div className="mb-12">
          <span className="text-[11px] uppercase tracking-widest font-semibold text-brand block mb-2">
            About the Program
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-neutral-900 mb-4">
            Built for Tomorrow's Leaders
          </h2>
          <p className="text-neutral-600 text-sm sm:text-base leading-relaxed">
            {eventConfig.about.summary}
          </p>
        </div>

        {/* What to Expect */}
        <div>
          <span className="text-[11px] uppercase tracking-widest font-semibold text-brand block mb-2">
            What to Expect
          </span>
          <h3 className="font-serif text-xl sm:text-2xl font-bold text-neutral-900 mb-6">
            A Purposeful Experience
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {eventConfig.about.expectations.map((item, idx) => {
              const Icon = icons[idx] || Sparkle;
              return (
                <div
                  key={idx}
                  className="bg-white p-5 rounded-xl border border-neutral-200/80 shadow-xs flex flex-col justify-start"
                >
                  <div className="w-8 h-8 rounded-lg bg-brand-light flex items-center justify-center text-brand mb-3">
                    <Icon size={18} weight="duotone" />
                  </div>
                  <h4 className="font-serif font-bold text-neutral-900 text-base mb-1.5">
                    {item.title}
                  </h4>
                  <p className="text-neutral-500 text-xs sm:text-sm leading-normal">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
