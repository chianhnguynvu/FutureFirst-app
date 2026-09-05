import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { HeartHandshake, LayoutDashboard } from "lucide-react";
import { base44 } from "@/api/base44Client";
import Brand from "@/components/Brand";
import { useProfile, useRefresh } from "@/hooks/useVolunteer";

const OPTIONS = [
  {
    role: "volunteer",
    icon: HeartHandshake,
    title: "I'm a Volunteer",
    text: "Discover opportunities, build transferable skills, learn about causes, track your impact, and grow your volunteer journey.",
    to: "/",
  },
  {
    role: "organiser",
    icon: LayoutDashboard,
    title: "I'm an Organisation / Event Organiser",
    text: "Create events, manage volunteers, verify participation, track skills, monitor event preparation, and improve volunteer retention.",
    to: "/org",
  },
];

export default function RoleSelect() {
  const { data: profile } = useProfile();
  const refresh = useRefresh();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(null);

  const choose = async (option) => {
    setSaving(option.role);
    if (profile) {
      const existing = profile.platform_role;
      const role = existing && existing !== option.role ? "both" : option.role;
      await base44.entities.VolunteerProfile.update(profile.id, { platform_role: role });
      refresh(["profile"]);
    }
    navigate(option.to);
  };

  return (
    <div className="mx-auto min-h-screen w-full max-w-3xl px-5 py-10">
      <Brand />
      <h1 className="mt-8 text-2xl font-extrabold text-foreground md:text-3xl">
        How will you use FutureFirst?
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        We'll remember your choice. You can switch any time from your profile.
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {OPTIONS.map((o) => (
          <button
            key={o.role}
            onClick={() => choose(o)}
            disabled={!!saving}
            className="rounded-3xl bg-card p-6 text-left soft-shadow transition-transform hover:-translate-y-0.5 disabled:opacity-60"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent">
              <o.icon className="h-7 w-7 text-primary" />
            </span>
            <p className="mt-4 text-lg font-extrabold leading-snug text-foreground">{o.title}</p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{o.text}</p>
            <p className="mt-4 text-sm font-semibold text-primary">
              {saving === o.role ? "Setting up…" : "Continue"}
            </p>
          </button>
        ))}
      </div>

      <p className="mt-8 text-center text-sm font-semibold text-primary">
        The event ends. The volunteer journey shouldn't.
      </p>
    </div>
  );
}