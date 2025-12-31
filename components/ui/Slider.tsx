"use client";

import React from "react";

interface SliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  showLabels?: boolean;
  className?: string;
}

export function Slider({
  label,
  value,
  onChange,
  min = 0,
  max = 5,
  step = 1,
  showLabels = true,
  className = "",
}: SliderProps) {
  const percentage = ((value - min) / (max - min)) * 100;

  const getLevelLabel = (val: number) => {
    if (val === 0) return "Not rated";
    if (val === 1) return "Beginner";
    if (val === 2) return "Basic";
    if (val === 3) return "Intermediate";
    if (val === 4) return "Advanced";
    if (val === 5) return "Expert";
    return "";
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="flex justify-between items-center mb-2">
        <label className="text-sm font-medium text-[var(--foreground)]">
          {label}
        </label>
        <span className="text-sm font-semibold text-[var(--primary)]">
          {value} / {max} {showLabels && `• ${getLevelLabel(value)}`}
        </span>
      </div>
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-3 bg-[var(--secondary)] rounded-full appearance-none cursor-pointer slider-thumb"
          style={{
            background: `linear-gradient(to right, var(--primary) 0%, var(--primary) ${percentage}%, var(--secondary) ${percentage}%, var(--secondary) 100%)`,
          }}
        />
      </div>
      {showLabels && (
        <div className="flex justify-between mt-1 text-xs text-[var(--muted)]">
          <span>{min}</span>
          <span>{max}</span>
        </div>
      )}
      <style jsx>{`
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: var(--primary);
          cursor: pointer;
          border: 3px solid white;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
          transition: transform 0.2s;
        }
        input[type="range"]::-webkit-slider-thumb:hover {
          transform: scale(1.1);
        }
        input[type="range"]::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: var(--primary);
          cursor: pointer;
          border: 3px solid white;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </div>
  );
}
