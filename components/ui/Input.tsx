"use client";

import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function Input({
  label,
  error,
  helperText,
  className = "",
  ...props
}: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
          {label}
        </label>
      )}
      <input
        className={`w-full px-4 py-3 bg-white border border-[var(--card-border)] rounded-xl text-[var(--foreground)] placeholder-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all duration-200 ${
          error ? "border-[var(--error)] focus:ring-[var(--error)]" : ""
        } ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-[var(--error)]">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-sm text-[var(--muted)]">{helperText}</p>
      )}
    </div>
  );
}

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function Textarea({
  label,
  error,
  helperText,
  className = "",
  ...props
}: TextareaProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
          {label}
        </label>
      )}
      <textarea
        className={`w-full px-4 py-3 bg-white border border-[var(--card-border)] rounded-xl text-[var(--foreground)] placeholder-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all duration-200 resize-none ${
          error ? "border-[var(--error)] focus:ring-[var(--error)]" : ""
        } ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-[var(--error)]">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-sm text-[var(--muted)]">{helperText}</p>
      )}
    </div>
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: { value: string; label: string }[];
}

export function Select({
  label,
  error,
  helperText,
  options,
  className = "",
  ...props
}: SelectProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
          {label}
        </label>
      )}
      <select
        className={`w-full px-4 py-3 bg-white border border-[var(--card-border)] rounded-xl text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all duration-200 cursor-pointer ${
          error ? "border-[var(--error)] focus:ring-[var(--error)]" : ""
        } ${className}`}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-sm text-[var(--error)]">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-sm text-[var(--muted)]">{helperText}</p>
      )}
    </div>
  );
}
