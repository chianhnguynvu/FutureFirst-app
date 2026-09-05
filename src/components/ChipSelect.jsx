import React from "react";

export default function ChipSelect({ options, value = [], onChange, single = false }) {
  const toggle = (opt) => {
    if (single) return onChange(value.includes(opt) ? [] : [opt]);
    onChange(value.includes(opt) ? value.filter((v) => v !== opt) : [...value, opt]);
  };
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const active = value.includes(opt);
        return (
          <button
            key={opt}
            type="button"
            onClick={() => toggle(opt)}
            className={`min-h-[44px] rounded-full border px-4 text-sm font-medium transition-colors ${
              active
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-foreground"
            }`}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}