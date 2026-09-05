import React from "react";
import { Sparkles, Info } from "lucide-react";

export default function WhyThisMatch({ score, reasons = [] }) {
  return (
    <div className="rounded-3xl border border-border bg-accent/60 p-4">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-primary" />
        <p className="text-sm font-bold text-primary">{score}% Match · Suggested for you</p>
      </div>
      <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Why am I seeing this?
      </p>
      <ul className="mt-1 space-y-1 text-sm text-foreground">
        {reasons.length ? (
          reasons.map((r) => (
            <li key={r} className="flex gap-2">
              <span className="text-primary">•</span>
              {r}
            </li>
          ))
        ) : (
          <li className="text-muted-foreground">
            Shown because it's an upcoming opportunity from a verified organisation.
          </li>
        )}
      </ul>
      <p className="mt-3 flex items-start gap-1.5 text-[11px] leading-relaxed text-muted-foreground">
        <Info className="mt-0.5 h-3 w-3 shrink-0" />
        This suggestion is generated automatically from the preferences you saved. You can change them any
        time in your profile.
      </p>
    </div>
  );
}