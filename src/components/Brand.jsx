import React from "react";

export function BrandMark({ className = "w-9 h-9" }) {
  return (
    <div className={`${className} rounded-2xl bg-primary flex items-center justify-center shrink-0`}>
      <svg viewBox="0 0 32 32" className="w-5 h-5" fill="none" aria-hidden="true">
        <path d="M9 24V10a4 4 0 0 1 4-4h10" stroke="white" strokeWidth="3.2" strokeLinecap="round" />
        <path d="M9 16h9" stroke="#22C55E" strokeWidth="3.2" strokeLinecap="round" />
      </svg>
    </div>
  );
}

export default function Brand({ showTagline = false, size = "md" }) {
  return (
    <div className="flex items-center gap-2.5">
      <BrandMark className={size === "lg" ? "w-12 h-12" : "w-9 h-9"} />
      <div className="leading-tight">
        <p className={size === "lg" ? "text-2xl" : "text-lg"}>
          <span className="font-light text-foreground">Future</span>
          <span className="font-extrabold text-primary">First</span>
        </p>
        {showTagline && (
          <p className="text-xs text-muted-foreground">Volunteer Today. Change Future</p>
        )}
      </div>
    </div>
  );
}