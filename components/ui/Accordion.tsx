"use client";

import React, { useState } from "react";

interface AccordionItemProps {
  title: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  icon?: React.ReactNode;
  className?: string;
}

export function AccordionItem({
  title,
  children,
  defaultOpen = false,
  icon,
  className = "",
}: AccordionItemProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={`border border-[var(--card-border)] rounded-xl overflow-hidden ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between bg-white hover:bg-[var(--secondary)]/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          {icon && <span className="text-[var(--primary)]">{icon}</span>}
          <span className="font-medium text-[var(--foreground)] text-left">
            {title}
          </span>
        </div>
        <svg
          className={`w-5 h-5 text-[var(--muted)] transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${
          isOpen ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-4 py-4 bg-[var(--secondary)]/30 border-t border-[var(--card-border)]">
          {children}
        </div>
      </div>
    </div>
  );
}

interface AccordionProps {
  children: React.ReactNode;
  className?: string;
}

export function Accordion({ children, className = "" }: AccordionProps) {
  return <div className={`space-y-3 ${className}`}>{children}</div>;
}
