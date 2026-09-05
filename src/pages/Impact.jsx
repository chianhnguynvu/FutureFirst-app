import React from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { Clock, CalendarCheck, HeartHandshake, BookOpen, Flame, Award, ArrowRight, BadgeCheck } from "lucide-react";
import StatCard from "@/components/StatCard";
import WhyThisMatch from "@/components/WhyThisMatch";
import BuildNextCard from "@/components/BuildNextCard";
import { ACHIEVEMENTS, matchEvent } from "@/lib/futurefirst";
import {
  useProfile, useRegistrations, useProgress, useEvents, useSkillRecords, useCertificates,
} from "@/hooks/useVolunteer";

export default function Impact() {
  const { data: profile } = useProfile();
  const { data: regs = [] } = useRegistrations();
  const { data: progress = [] } = useProgress();
  const { data: events = [] } = useEvents();
  const { data: certificates = [] } = useCertificates();
  const { data: records = [] } = useSkillRecords();

  if (!profile) return <div className="p-6 text-muted-foreground">Loading…</div>;

  const attended = regs.filter((r) => r.status === "attended");
  const causes = new Set(attended.map((r) => r.cause));
  const completedModules = progress.filter((p) => p.completed);
  const completedCauses = completedModules.map((p) => p.cause);
  const earned = new Set(profile.achievements || []);
  const registeredIds = regs.filter((r) => r.status !== "cancelled").map((r) => r.event_id);
  const next = events
    .filter((e) => !registeredIds.includes(e.id))
    .map((e) => ({ event: e, ...matchEvent(e, profile, regs, completedCauses) }))
    .sort((a, b) => b.score - a.score)[0];

  const timeline = [...attended].sort((a, b) => new Date(b.event_date) - new Date(a.event_date));

  return (
    <div className="px-5 pt-6">
      <h1 className="text-2xl font-extrabold text-foreground">My Impact & Growth</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        The event ends. The volunteer journey shouldn't — here's everything you've built so far.
      </p>

      <Link
        to="/passport"
        className="mt-4 flex min-h-[56px] items-center gap-3 rounded-3xl bg-card px-5 soft-shadow"
      >
        <BadgeCheck className="h-5 w-5 text-primary" />
        <span className="text-sm font-bold text-foreground">
          My Skill Passport · {records.length} verified experience{records.length === 1 ? "" : "s"}
        </span>
        <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground" />
      </Link>

      <div className="mt-4">
        <BuildNextCard />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <StatCard label="volunteer hours" value={profile.volunteer_hours || 0} icon={Clock} />
        <StatCard label="events completed" value={profile.events_completed || 0} icon={CalendarCheck} tone="green" />
        <StatCard label="causes supported" value={causes.size} icon={HeartHandshake} tone="gold" />
        <StatCard label="learning modules" value={completedModules.length} icon={BookOpen} tone="slate" />
      </div>

      <div className="mt-3 flex items-center gap-3 rounded-3xl bg-card p-4 soft-shadow">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#FEF3C7]">
          <Flame className="h-5 w-5 text-[#B45309]" />
        </div>
        <div>
          <p className="font-bold text-foreground">{profile.streak || 0} month impact streak</p>
          <p className="text-xs text-muted-foreground">Every contribution counts, big or small.</p>
        </div>
      </div>

      <section className="mt-7">
        <h2 className="text-base font-bold text-foreground">Impact timeline</h2>
        {timeline.length ? (
          <div className="mt-3 space-y-0">
            {timeline.map((r, i) => (
              <div key={r.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="h-3 w-3 rounded-full bg-primary" />
                  {i < timeline.length - 1 && <div className="w-0.5 flex-1 bg-border" />}
                </div>
                <div className="pb-6">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {r.event_date ? format(new Date(r.event_date), "MMMM yyyy") : ""}
                  </p>
                  <p className="font-bold text-foreground">{r.event_title}</p>
                  <p className="text-sm text-muted-foreground">{r.hours} hours · {r.cause}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-3 rounded-3xl bg-card p-5 text-sm text-muted-foreground soft-shadow">
            Your completed events will appear here once your coordinator confirms attendance.
          </p>
        )}
      </section>

      {next && (
        <section className="mt-4">
          <h2 className="text-base font-bold text-foreground">Your next impact</h2>
          <div className="mt-3 space-y-3">
            <WhyThisMatch score={next.score} reasons={next.reasons} />
            <Link
              to={`/event/${next.event.id}`}
              className="flex items-center gap-3 rounded-3xl bg-card p-4 soft-shadow"
            >
              <div className="min-w-0">
                <p className="truncate font-bold text-foreground">{next.event.title}</p>
                <p className="text-xs text-muted-foreground">
                  {next.event.date ? format(new Date(next.event.date), "EEE d MMM") : ""} · {next.event.location}
                </p>
              </div>
              <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground" />
            </Link>
          </div>
        </section>
      )}

      <section className="mt-7">
        <h2 className="text-base font-bold text-foreground">Achievements</h2>
        <div className="mt-3 grid grid-cols-2 gap-3">
          {ACHIEVEMENTS.map((a) => {
            const has = earned.has(a.id);
            return (
              <div
                key={a.id}
                className={`rounded-3xl p-4 ${has ? "bg-card soft-shadow" : "border border-dashed border-border"}`}
              >
                <Award className={`h-5 w-5 ${has ? "text-[#F59E0B]" : "text-muted-foreground/50"}`} />
                <p className={`mt-2 text-sm font-bold ${has ? "text-foreground" : "text-muted-foreground"}`}>
                  {a.label}
                </p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">{has ? "Earned" : a.hint}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mt-7">
        <h2 className="text-base font-bold text-foreground">Certificates</h2>
        {certificates.length ? (
          <div className="mt-3 space-y-3">
            {certificates.map((c) => (
              <div key={c.id} className="rounded-3xl bg-card p-4 soft-shadow">
                <p className="font-bold text-foreground">{c.event_title}</p>
                <p className="text-sm text-muted-foreground">
                  {c.organisation_name} · {c.hours} hours ·{" "}
                  {c.issued_date ? format(new Date(c.issued_date), "d MMM yyyy") : ""}
                </p>
                {!!(c.skills_demonstrated || []).length && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {c.skills_demonstrated.map((s) => (
                      <span key={s} className="rounded-full bg-accent px-2.5 py-1 text-[11px] font-semibold text-primary">
                        {s}
                      </span>
                    ))}
                  </div>
                )}
                <p className="mt-2 flex items-center gap-1 text-xs font-semibold text-[#166534]">
                  <BadgeCheck className="h-3.5 w-3.5" /> Verified impact certificate
                </p>
                <p className="mt-1 font-mono text-xs text-muted-foreground">Certificate ID: {c.verification_code}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-3 rounded-3xl bg-card p-5 text-sm text-muted-foreground soft-shadow">
            Organisations can issue a certificate after you complete an event.
          </p>
        )}
      </section>
    </div>
  );
}