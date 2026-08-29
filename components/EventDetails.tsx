"use client";

import React from "react";
import {
  Sparkle,
  ChatCircleText,
  UsersThree,
  Trophy,
  BookOpen,
  MicrophoneStage,
  MusicNotes,
  UserCircle,
} from "@phosphor-icons/react";
import { eventConfig } from "@/lib/config";

export default function EventDetails() {
  const expectationIcons = [Sparkle, ChatCircleText, UsersThree];

  return (
    <section className="py-12 sm:py-16 px-4 sm:px-6 border-t border-neutral-100 bg-neutral-50/50">
      <div className="max-w-3xl mx-auto space-y-16">
        {/* 1. About the Program */}
        <div>
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

        {/* 2. What to Expect */}
        <div>
          <span className="text-[11px] uppercase tracking-widest font-semibold text-brand block mb-2">
            What to Expect
          </span>
          <h3 className="font-serif text-xl sm:text-2xl font-bold text-neutral-900 mb-6">
            A Purposeful Experience
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {eventConfig.about.expectations.map((item, idx) => {
              const Icon = expectationIcons[idx] || Sparkle;
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

        {/* 3. Special Programmes & Competitions Breakdown */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Trophy size={18} className="text-brand" weight="fill" />
            <span className="text-[11px] uppercase tracking-widest font-bold text-brand">
              Competitions & Prize Mandate
            </span>
          </div>
          <h3 className="font-serif text-xl sm:text-2xl font-bold text-neutral-900 mb-3">
            Special Programmes & Cash Prizes
          </h3>
          <p className="text-xs sm:text-sm text-neutral-500 mb-6">
            All categories share the flat registration fee of {eventConfig.formattedFee}. Compete and win cash awards!
          </p>

          <div className="space-y-4">
            {eventConfig.competitions.map((comp, idx) => (
              <div
                key={idx}
                className="bg-white p-5 rounded-xl border border-neutral-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-brand" />
                    <h4 className="font-bold text-neutral-900 text-sm sm:text-base">
                      {comp.category}
                    </h4>
                  </div>
                  <p className="text-xs text-neutral-500 mt-1 sm:pl-4">
                    {comp.details}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0 sm:text-right self-start sm:self-auto bg-brand-light/60 px-3.5 py-2 rounded-lg border border-brand-border">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold block">
                      1st Prize
                    </span>
                    <span className="font-mono text-sm font-bold text-brand">
                      {comp.firstPrize}
                    </span>
                  </div>
                  <span className="text-neutral-300">|</span>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold block">
                      2nd Prize
                    </span>
                    <span className="font-mono text-sm font-bold text-neutral-700">
                      {comp.secondPrize}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {/* Fastest Finger bonus highlight */}
            <div className="bg-purple-50/40 p-4 rounded-xl border border-brand-border/60 text-xs text-neutral-700 flex items-center gap-2.5">
              <Sparkle size={16} className="text-brand shrink-0" weight="fill" />
              <span>
                <strong>Also featuring:</strong> Fastest Finger live trivia game, Spoken Word ministration, and an exclusive Youth Dinner.
              </span>
            </div>
          </div>
        </div>

        {/* 4. Featured Ministers & Guests */}
        <div>
          <span className="text-[11px] uppercase tracking-widest font-semibold text-brand block mb-2">
            Ministers & Guests
          </span>
          <h3 className="font-serif text-xl sm:text-2xl font-bold text-neutral-900 mb-6">
            Ministers of the Summit
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {eventConfig.ministers.map((min, idx) => (
              <div
                key={idx}
                className="bg-white p-3.5 rounded-xl border border-neutral-100 shadow-2xs flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-full bg-brand-light text-brand flex items-center justify-center shrink-0">
                  <UserCircle size={20} weight="duotone" />
                </div>
                <div className="overflow-hidden">
                  <p className="font-bold text-neutral-900 text-xs truncate">
                    {min.name}
                  </p>
                  <p className="text-[11px] text-neutral-400 truncate">
                    {min.role}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
