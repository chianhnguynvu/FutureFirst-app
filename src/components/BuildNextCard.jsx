import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Target } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { matchEvent } from "@/lib/futurefirst";
import { nextBadge } from "@/lib/skills";
import { useProfile, useSkillRecords, useEvents, useRegistrations, useProgress } from "@/hooks/useVolunteer";

/** "What will you build next?" — the retention loop's closing step. */
export default function BuildNextCard() {
  const { data: profile } = useProfile();
  const { data: records = [] } = useSkillRecords();
  const { data: events = [] } = useEvents();
  const { data: regs = [] } = useRegistrations();
  const { data: progress = [] } = useProgress();

  if (!profile) return null;

  const badge = nextBadge(records);
  const registeredIds = regs.filter((r) => r.status !== "cancelled").map((r) => r.event_id);
  const completedCauses = progress.filter((p) => p.completed).map((p) => p.cause);
  const ranked = events
    .filter((e) => !registeredIds.includes(e.id))
    .map((e) => ({
      event: e,
      builds: (e.skills_practised || []).includes(badge?.skill),
      ...matchEvent(e, profile, regs, completedCauses),
    }))
    .sort((a, b) => Number(b.builds) - Number(a.builds) || b.score - a.score);
  const next = ranked[0];

  return (
    <section className="rounded-3xl bg-primary p-5 text-primary-foreground">
      <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide opacity-80">
        <Target className="h-3.5 w-3.5" /> What will you build next?
      </p>

      {badge ? (
        <div className="mt-3">
          <p className="text-lg font-bold leading-snug">
            You're {badge.remaining} experience{badge.remaining === 1 ? "" : "s"} away from unlocking {badge.label}
          </p>
          <Progress value={badge.percent} className="mt-3 h-2 bg-white/25" />
          <p className="mt-2 text-sm opacity-90">
            {badge.count} / {badge.required} verified {badge.skill.toLowerCase()} experiences
          </p>
        </div>
      ) : (
        <p className="mt-3 text-lg font-bold leading-snug">
          Every badge unlocked — keep adding verified experiences to your Skill Passport.
        </p>
      )}

      {next && (
        <div className="mt-4 rounded-2xl bg-white/12 p-4">
          <p className="text-xs uppercase tracking-wide opacity-80">Recommended next event</p>
          <p className="mt-1 font-bold">{next.event.title}</p>
          <p className="text-sm opacity-90">
            {next.score}% match
            {(next.event.skills_practised || []).length
              ? ` · Build: ${next.event.skills_practised.slice(0, 2).join(" + ")}`
              : ""}
          </p>
        </div>
      )}

      <Link
        to={next ? `/event/${next.event.id}` : "/discover"}
        className="mt-4 flex min-h-[48px] items-center justify-center gap-2 rounded-2xl bg-white px-5 font-semibold text-primary"
      >
        Continue my journey <ArrowRight className="h-4 w-4" />
      </Link>
    </section>
  );
}