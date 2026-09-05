import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { format } from "date-fns";
import {
  ArrowLeft, CalendarDays, Clock, MapPin, Users, ShieldCheck, ShieldAlert,
  HeartHandshake, BookOpen, CheckCircle2, Flag,
} from "lucide-react";
import { Image } from "@/components/ui/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import WhyThisMatch from "@/components/WhyThisMatch";
import SafeToVolunteer from "@/components/SafeToVolunteer";
import { matchEvent } from "@/lib/futurefirst";
import { useProfile, useRegistrations, useModules, useProgress, useRefresh } from "@/hooks/useVolunteer";

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const refresh = useRefresh();
  const { data: profile } = useProfile();
  const { data: regs = [] } = useRegistrations();
  const { data: modules = [] } = useModules();
  const { data: progress = [] } = useProgress();
  const [open, setOpen] = useState(false);
  const [confirmAvail, setConfirmAvail] = useState(false);
  const [confirmInfo, setConfirmInfo] = useState(false);
  const [done, setDone] = useState(false);
  const [saving, setSaving] = useState(false);

  const { data: event, isLoading } = useQuery({
    queryKey: ["event", id],
    queryFn: () => base44.entities.Event.get(id),
  });

  if (isLoading || !event) return <div className="p-6 text-muted-foreground">Loading…</div>;

  const registration = regs.find((r) => r.event_id === event.id && r.status !== "cancelled");
  const spots = Math.max(0, (event.capacity || 0) - (event.spots_taken || 0));
  const completedCauses = progress.filter((p) => p.completed).map((p) => p.cause);
  const { score, reasons } = matchEvent(event, profile, regs, completedCauses);
  const relatedModule = modules.find((m) => m.cause === event.cause);

  const submit = async () => {
    setSaving(true);
    await base44.entities.Registration.create({
      event_id: event.id,
      event_title: event.title,
      event_date: event.date,
      volunteer_email: profile.user_email,
      volunteer_name: profile.full_name,
      cause: event.cause,
      hours: event.volunteer_hours,
      status: "registered",
    });
    await base44.entities.Event.update(event.id, { spots_taken: (event.spots_taken || 0) + 1 });
    refresh(["registrations", "events", "event"]);
    setSaving(false);
    setDone(true);
  };

  const Row = ({ icon: Icon, children }) => (
    <div className="flex items-start gap-3 text-sm text-foreground">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
      <span>{children}</span>
    </div>
  );

  const Section = ({ title, children }) => (
    <section className="mt-6">
      <h2 className="text-base font-bold text-foreground">{title}</h2>
      <div className="mt-2 text-sm leading-relaxed text-muted-foreground">{children}</div>
    </section>
  );

  return (
    <div className="pb-8">
      <div className="relative aspect-video max-h-72 w-full overflow-hidden bg-muted">
        {event.image_url && (
          <Image
            src={event.image_url}
            alt={event.title}
            fittingType="fill"
            focalPointX={0.5}
            focalPointY={0.5}
            className="absolute inset-0 h-full w-full"
          />
        )}
        <button
          onClick={() => navigate(-1)}
          className="absolute left-4 top-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/95"
          aria-label="Back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
      </div>

      <div className="px-5">
        <div className="relative z-10 -mt-8 rounded-3xl bg-card p-5 soft-shadow">
          <div className="flex flex-wrap gap-2">
            <Badge className="bg-accent text-primary hover:bg-accent">{event.cause}</Badge>
            {event.verified && (
              <Badge className="gap-1 bg-primary text-primary-foreground hover:bg-primary">
                <ShieldCheck className="h-3 w-3" /> Verified organisation
              </Badge>
            )}
          </div>
          <h1 className="mt-3 text-xl font-extrabold leading-snug text-foreground">{event.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{event.organisation_name}</p>
          <div className="mt-4 space-y-2">
            <Row icon={CalendarDays}>{event.date ? format(new Date(event.date), "EEEE d MMMM yyyy") : "Date TBC"}</Row>
            <Row icon={Clock}>{event.start_time}–{event.end_time} · {event.volunteer_hours} volunteer hours</Row>
            <Row icon={MapPin}>{event.location} · {event.event_type}</Row>
            <Row icon={Users}>{spots} of {event.capacity} spots remaining</Row>
          </div>
        </div>

        {!registration && (
          <div className="mt-5">
            <WhyThisMatch score={score} reasons={reasons} />
          </div>
        )}

        {registration && (
          <div className="mt-5 rounded-3xl border border-[#16A34A]/30 bg-[#DCFCE7] p-4">
            <p className="flex items-center gap-2 font-bold text-[#166534]">
              <CheckCircle2 className="h-4 w-4" /> You're registered
            </p>
            <p className="mt-1 text-sm text-[#166534]/80">
              Bring water, comfortable shoes and arrive 15 minutes early. Your coordinator will confirm
              attendance on the day.
            </p>
            {relatedModule && (
              <Link
                to={`/learn/${relatedModule.id}`}
                className="mt-3 flex items-center gap-2 text-sm font-semibold text-primary"
              >
                <BookOpen className="h-4 w-4" /> Prepare: {relatedModule.title}
              </Link>
            )}
          </div>
        )}

        <Section title="Overview">{event.description}</Section>
        <Section title="Why this event matters">{event.why_it_matters}</Section>
        <Section title="Your volunteer role">{event.volunteer_tasks}</Section>
        <Section title="Expected impact">{event.expected_impact}</Section>

        <Section title="Required skills">
          <div className="flex flex-wrap gap-2">
            {(event.required_skills || []).map((s) => (
              <span key={s} className="rounded-full bg-secondary px-3 py-1.5 text-xs font-medium text-foreground">
                {s}
              </span>
            ))}
          </div>
          <p className="mt-2 text-xs">No experience needed — training is provided on the day.</p>
        </Section>

        {!!(event.skills_practised || []).length && (
          <Section title="Skills you'll practise">
            <p className="text-sm">
              Transferable skills you can build here — each one is added to your Skill Passport once your
              organiser verifies participation.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {event.skills_practised.map((s) => (
                <span key={s} className="rounded-full bg-accent px-3 py-1.5 text-xs font-semibold text-primary">
                  {s}
                </span>
              ))}
            </div>
          </Section>
        )}

        <SafeToVolunteer event={event} />

        <section className="mt-6 rounded-3xl bg-card p-5 soft-shadow">
          <p className="flex items-center gap-2 text-sm font-bold text-foreground">
            <HeartHandshake className="h-4 w-4 text-primary" /> The issue behind this event
          </p>
          <p className="mt-2 text-sm text-muted-foreground">{event.humanitarian_issue}</p>
          <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Related child right
          </p>
          <p className="text-sm text-foreground">{event.child_rights_topic}</p>
          {relatedModule && (
            <Link
              to={`/learn/${relatedModule.id}`}
              className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-primary"
            >
              <BookOpen className="h-4 w-4" /> Learn more in {relatedModule.read_minutes} minutes
            </Link>
          )}
        </section>

        <section className="mt-6 rounded-3xl border border-border bg-secondary/60 p-5">
          <p className="flex items-center gap-2 text-sm font-bold text-foreground">
            <ShieldAlert className="h-4 w-4 text-primary" /> Safety & eligibility
          </p>
          <p className="mt-2 text-sm text-muted-foreground">{event.safety_info}</p>
          <p className="mt-2 text-sm text-muted-foreground">{event.eligibility}</p>
          <button className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
            <Flag className="h-3.5 w-3.5" /> Report a concern or get support
          </button>
        </section>

        <div className="mt-8">
          {registration ? (
            <Button asChild variant="outline" className="h-14 w-full rounded-2xl text-base">
              <Link to="/impact">View your impact</Link>
            </Button>
          ) : (
            <Button
              className="h-14 w-full rounded-2xl text-base font-semibold"
              disabled={spots === 0 || event.status !== "published"}
              onClick={() => setOpen(true)}
            >
              {spots === 0 ? "Registrations full" : "Join event"}
            </Button>
          )}
        </div>
      </div>

      <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v && done) setDone(false); }}>
        <DialogContent className="max-w-md rounded-3xl">
          {done ? (
            <div className="py-4 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#DCFCE7]">
                <CheckCircle2 className="h-7 w-7 text-[#16A34A]" />
              </div>
              <h3 className="mt-4 text-lg font-extrabold">You're in, {(profile.full_name || "friend").split(" ")[0]}!</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {event.title} has been added to your upcoming events and profile history.
              </p>
              <Button className="mt-5 h-12 w-full rounded-2xl" onClick={() => setOpen(false)}>
                Done
              </Button>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="text-lg font-extrabold">Confirm your registration</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="rounded-2xl bg-secondary/60 p-4 text-sm">
                  <p className="font-bold text-foreground">{event.title}</p>
                  <p className="text-muted-foreground">
                    {event.date ? format(new Date(event.date), "EEE d MMM") : ""} · {event.start_time}–{event.end_time}
                  </p>
                  <p className="text-muted-foreground">{event.location}</p>
                </div>
                <label className="flex items-start gap-3 text-sm">
                  <Checkbox checked={confirmAvail} onCheckedChange={(v) => setConfirmAvail(!!v)} className="mt-0.5" />
                  <span>I'm available for the full session and will let the organiser know if that changes.</span>
                </label>
                <label className="flex items-start gap-3 text-sm">
                  <Checkbox checked={confirmInfo} onCheckedChange={(v) => setConfirmInfo(!!v)} className="mt-0.5" />
                  <span>
                    Share my name{profile?.university ? `, ${profile.university}` : ""} and relevant skills with{" "}
                    {event.organisation_name} for this event only.
                  </span>
                </label>
                <Button
                  className="h-14 w-full rounded-2xl text-base font-semibold"
                  disabled={!confirmAvail || !confirmInfo || saving}
                  onClick={submit}
                >
                  {saving ? "Submitting…" : "Submit registration"}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}