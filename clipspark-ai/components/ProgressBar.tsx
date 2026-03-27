"use client";

import { Check } from "lucide-react";

interface Step {
  label: string;
  status: "pending" | "active" | "done" | "error";
}

export default function ProgressBar({ steps }: { steps: Step[] }) {
  return (
    <div className="flex items-center gap-2 w-full mb-8">
      {steps.map((step, i) => (
        <div key={step.label} className="flex items-center gap-2 flex-1">
          <div
            className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium shrink-0 ${
              step.status === "done"
                ? "bg-green-500 text-white"
                : step.status === "active"
                  ? "bg-blue-500 text-white animate-pulse"
                  : step.status === "error"
                    ? "bg-red-500 text-white"
                    : "bg-gray-200 text-gray-600"
            }`}
          >
            {step.status === "done" ? <Check className="w-4 h-4" /> : i + 1}
          </div>
          <span
            className={`text-sm truncate ${
              step.status === "active"
                ? "text-blue-600"
                : step.status === "done"
                  ? "text-green-600"
                  : "text-gray-500"
            }`}
          >
            {step.label}
          </span>
          {i < steps.length - 1 && (
            <div
              className={`flex-1 h-px ${step.status === "done" ? "bg-green-500" : "bg-gray-200"}`}
            />
          )}
        </div>
      ))}
    </div>
  );
}
