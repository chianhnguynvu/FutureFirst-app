import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import Brand from "@/components/Brand";
import ChipSelect from "@/components/ChipSelect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CAUSES, SKILLS, AVAILABILITY, EVENT_TYPES } from "@/lib/futurefirst";
import { useProfile } from "@/hooks/useVolunteer";
import { useQueryClient } from "@tanstack/react-query";
import { ShieldCheck } from "lucide-react";

export default function Onboarding() {
  const { data: profile } = useProfile();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    interests: [],
    skills: [],
    availability: [],
    preferred_event_type: ["Either"],
    location: "",
    university: "",
  });

  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

  const steps = [
    {
      title: "Which causes do you care about?",
      sub: "We'll use this to suggest opportunities — nothing is shared publicly.",
      body: <ChipSelect options={CAUSES} value={form.interests} onChange={set("interests")} />,
      valid: form.interests.length > 0,
    },
    {
      title: "What are you good at?",
      sub: "Skills help organisations match you to the right volunteer role.",
      body: <ChipSelect options={SKILLS} value={form.skills} onChange={set("skills")} />,
      valid: form.skills.length > 0,
    },
    {
      title: "When are you usually free?",
      sub: "Choose as many as you like.",
      body: <ChipSelect options={AVAILABILITY} value={form.availability} onChange={set("availability")} />,
      valid: form.availability.length > 0,
    },
    {
      title: "How do you prefer to volunteer?",
      sub: "In person, online, or both.",
      body: (
        <ChipSelect
          options={EVENT_TYPES}
          value={form.preferred_event_type}
          onChange={set("preferred_event_type")}
          single
        />
      ),
      valid: form.preferred_event_type.length > 0,
    },
    {
      title: "Where are you based?",
      sub: "Only your city and university — we keep personal details minimal.",
      body: (
        <div className="space-y-3">
          <Input
            className="h-14 rounded-2xl text-base"
            placeholder="City (e.g. Sydney)"
            value={form.location}
            onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
          />
          <Input
            className="h-14 rounded-2xl text-base"
            placeholder="University (optional)"
            value={form.university}
            onChange={(e) => setForm((f) => ({ ...f, university: e.target.value }))}
          />
        </div>
      ),
      valid: form.location.trim().length > 1,
    },
  ];

  const current = steps[step];

  const finish = async () => {
    setSaving(true);
    const updated = await base44.entities.VolunteerProfile.update(profile.id, {
      ...form,
      preferred_event_type: form.preferred_event_type[0] || "Either",
      preferred_location: form.location,
      onboarding_complete: true,
    });
    queryClient.setQueryData(["profile", profile.user_email], updated || { ...profile, ...form, onboarding_complete: true });
    navigate("/");
  };

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-lg flex-col px-5 py-8">
      <Brand showTagline />
      <div className="mt-8 flex gap-1.5">
        {steps.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full ${i <= step ? "bg-primary" : "bg-border"}`}
          />
        ))}
      </div>
      <h1 className="mt-8 text-2xl font-extrabold leading-tight text-foreground">{current.title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{current.sub}</p>
      <div className="mt-6 flex-1">{current.body}</div>

      <div className="mt-8 space-y-3">
        <Button
          className="h-14 w-full rounded-2xl text-base font-semibold"
          disabled={!current.valid || saving}
          onClick={() => (step === steps.length - 1 ? finish() : setStep(step + 1))}
        >
          {step === steps.length - 1 ? (saving ? "Setting up…" : "Start volunteering") : "Continue"}
        </Button>
        {step > 0 && (
          <button
            className="h-11 w-full text-sm font-medium text-muted-foreground"
            onClick={() => setStep(step - 1)}
          >
            Back
          </button>
        )}
        <p className="flex items-center justify-center gap-1.5 text-center text-[11px] text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5" /> You can edit or delete these preferences any time.
        </p>
      </div>
    </div>
  );
}