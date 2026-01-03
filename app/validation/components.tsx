"use client";

import { useState } from "react";
import type { TestHistoryItem } from "./data";

// =============================================================================
// VALIDATION COMPONENTS - Reusable components for validation page
// =============================================================================

// Accordion Component
export function Accordion({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 flex items-center justify-between text-left transition-colors"
      >
        <span className="font-medium text-gray-800">{title}</span>
        <svg
          className={`w-5 h-5 text-gray-500 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && <div className="px-4 py-3 bg-white">{children}</div>}
    </div>
  );
}

// Test History Table Component
export function TestHistoryTable({ data }: { data: TestHistoryItem[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-2 px-3 font-medium text-gray-600">Test ID</th>
            <th className="text-left py-2 px-3 font-medium text-gray-600">Timestamp</th>
            <th className="text-left py-2 px-3 font-medium text-gray-600">Grade</th>
            <th className="text-left py-2 px-3 font-medium text-gray-600">Status</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="py-2 px-3 font-mono text-xs text-gray-500">{item.id}</td>
              <td className="py-2 px-3 text-gray-600">{item.timestamp}</td>
              <td className="py-2 px-3 text-gray-600">Grade {item.grade}</td>
              <td className="py-2 px-3">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                    item.status === "valid"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {item.status === "valid" ? "✓ Valid" : "✗ Invalid"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Metrics Card Component
export function MetricsCard({
  icon,
  title,
  children,
}: {
  icon: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">{icon}</span>
        <h3 className="font-semibold text-gray-900">{title}</h3>
      </div>
      <div className="space-y-2 text-sm">{children}</div>
    </div>
  );
}

// Metric Row Component
export function MetricRow({
  label,
  value,
  color = "gray",
  isBold = false,
  hasBorder = false,
}: {
  label: string;
  value: string | number;
  color?: "gray" | "green" | "red";
  isBold?: boolean;
  hasBorder?: boolean;
}) {
  const colorClasses = {
    gray: "text-gray-900",
    green: "text-green-600",
    red: "text-red-600",
  };

  return (
    <div className={`flex justify-between ${hasBorder ? "pt-2 border-t border-gray-100" : ""}`}>
      <span className="text-gray-500">{label}</span>
      <span className={`${isBold ? "font-bold" : "font-semibold"} ${colorClasses[color]}`}>
        {value}
      </span>
    </div>
  );
}
