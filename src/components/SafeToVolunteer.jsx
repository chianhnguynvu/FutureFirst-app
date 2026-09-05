import React, { useState } from "react";
import { ShieldCheck, Check, ChevronDown } from "lucide-react";

export default function SafeToVolunteer({ event }) {
  const [open, setOpen] = useState(false);
  const checks = [
    { label: "Verified organisation", ok: !!event.verified },
    { label: "Verified event details", ok: !!(event.date && event.start_time) },
    { label: "Clear role expectations", ok: !!event.volunteer_tasks },
    { label: "Confirmed location", ok: !!event.location },
    { label: "Contact person available", ok: !!(event.contact_person || event.organisation_name) },
    { label: "Safety information provided", ok: !!event.safety_info },
    { label: "Privacy-conscious registration", ok: true },
  ];

  const knowBefore = [
    ["What will I be doing?", event.volunteer_tasks || "Your coordinator will confirm your tasks before the event."],
    ["Who will I be working with?", `${event.organisation_name || "The organising team"} and other FutureFirst volunteers.`],
    ["Where do I go?", event.location || "Location shared once registered."],
    ["Who do I contact?", event.contact_person || `${event.organisation_name || "Your coordinator"} — details in your confirmation.`],
    ["What personal information is shared?", "Your name and relevant skills, for this event only."],
    ["Does this event involve children?", event.involves_children ? "Yes." : "No."],
    ["Is a Working With Children Check required?", event.wwcc_required ? "Yes — bring your current check." : "No."],
  ];

  return (
    <section className="mt-6 rounded-3xl border border-[#16A34A]/30 bg-[#F0FDF4] p-5">
      <p className="flex items-center gap-2 text-sm font-bold text-[#166534]">
        <ShieldCheck className="h-4 w-4" /> Safe to volunteer
      </p>
      <ul className="mt-3 space-y-1.5">
        {checks.map((c) => (
          <li key={c.label} className={`flex items-center gap-2 text-sm ${c.ok ? "text-[#166534]" : "text-muted-foreground"}`}>
            <Check className={`h-4 w-4 shrink-0 ${c.ok ? "text-[#16A34A]" : "text-muted-foreground/50"}`} />
            {c.label}
            {!c.ok && <span className="text-xs">— ask your coordinator</span>}
          </li>
        ))}
      </ul>

      <button
        onClick={() => setOpen(!open)}
        className="mt-4 flex w-full items-center justify-between text-sm font-semibold text-[#166534]"
      >
        Know before you go
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <dl className="mt-3 space-y-3">
          {knowBefore.map(([q, a]) => (
            <div key={q}>
              <dt className="text-sm font-semibold text-foreground">{q}</dt>
              <dd className="text-sm text-muted-foreground">{a}</dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  );
}