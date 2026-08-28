"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight } from "@phosphor-icons/react";
import { eventConfig } from "@/lib/config";

export default function Navbar() {
  const pathname = usePathname();

  const navLinks = [
    { label: "Program", href: "/" },
    { label: "Payment", href: "/payment" },
    { label: "Register", href: "/register" },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-neutral-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
        {/* Brand / Title */}
        <Link
          href="/"
          className="group flex flex-col focus:outline-none"
        >
          <span className="font-serif text-lg sm:text-xl font-bold tracking-tight text-brand group-hover:text-neutral-900 transition-colors">
            {eventConfig.name}
          </span>
          <span className="text-[10px] sm:text-xs tracking-widest uppercase text-neutral-400 font-medium">
            {eventConfig.location}
          </span>
        </Link>

        {/* Navigation items & CTA */}
        <nav className="flex items-center gap-4 sm:gap-8">
          <div className="hidden sm:flex items-center gap-6 text-sm font-medium text-neutral-600">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`transition-colors py-1 relative ${
                    isActive
                      ? "text-brand font-semibold"
                      : "hover:text-brand"
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-brand rounded-full" />
                  )}
                </Link>
              );
            })}
          </div>

          {pathname !== "/payment" && (
            <Link
              href="/payment"
              className="inline-flex items-center gap-1.5 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full bg-brand text-white text-xs sm:text-sm font-medium hover:bg-brand-hover active:bg-brand-active transition-all shadow-sm hover:shadow"
            >
              <span>Pay to Register</span>
              <ArrowRight size={14} weight="bold" />
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
