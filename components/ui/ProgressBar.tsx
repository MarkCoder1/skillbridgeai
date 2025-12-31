"use client";

import React from "react";

interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  showValue?: boolean;
  size?: "sm" | "md" | "lg";
  color?: "primary" | "success" | "warning" | "error" | "accent";
  className?: string;
}

export function ProgressBar({
  value,
  max = 100,
  label,
  showValue = true,
  size = "md",
  color = "primary",
  className = "",
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const heights = {
    sm: "h-2",
    md: "h-3",
    lg: "h-4",
  };

  const colors = {
    primary: "bg-[var(--primary)]",
    success: "bg-[var(--success)]",
    warning: "bg-[var(--warning)]",
    error: "bg-[var(--error)]",
    accent: "bg-[var(--accent)]",
  };

  return (
    <div className={`w-full ${className}`}>
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-2">
          {label && (
            <span className="text-sm font-medium text-[var(--foreground)]">
              {label}
            </span>
          )}
          {showValue && (
            <span className="text-sm font-semibold text-[var(--muted)]">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}
      <div
        className={`w-full bg-[var(--secondary)] rounded-full overflow-hidden ${heights[size]}`}
      >
        <div
          className={`${heights[size]} ${colors[color]} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
