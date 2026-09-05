import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Award, BadgeCheck, Search } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import BuildNextCard from "@/components/BuildNextCard";
import { badgeProgress, skillCounts, TRANSFERABLE_SKILLS } from "@/lib/skills";
import { useProfile, useSkillRecords } from "@/hooks/useVolunteer";

export default function SkillPassport() {
  const { data: profile } = useProfile();
  const { data: records = [] } = useSkillRecords();

  if (!profile) return <div className="p-6 text-muted-foreground">Loading…</div>;

  const counts = skillCounts(records);
  const badges = badgeProgress(records);
  const listed = TRANSFERABLE_SKILLS.filter(
    (s) => counts[s] || (profile.skills || []).includes(s) || (profile.skills_to_build || []).includes(s)
  );

  return (
    <div className="px-5 pt-6">
      <Link to="/impact" className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <ArrowLeft className="h-4 w-4" /> My Impact & Growth
      </Link>
      <h1 className="mt-4 text-2xl font-extrabold text-foreground">My Skill Passport</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Every verified event adds transferable experience you can use for study, work and leadership.
      </p>

      <section className="mt-5">
        <h2 className="text-base font-bold text-foreground">Verified experience</h2>
        {listed.length ? (
          <div className="mt-3 space-y-3">
            {listed.map((skill) => {
              const count = counts[skill] || 0;
              const evidence = records.filter((r) => r.skill === skill);
              const badge = badges.find((b) => b.skill === skill);
              return (
                <div key={skill} className="rounded-3xl bg-card p-4 soft-shadow">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-bold text-foreground">{skill}</p>
                    <span className="flex items-center gap-1 text-xs font-semibold text-primary">
                      <BadgeCheck className="h-4 w-4" /> {count} verified experience{count === 1 ? "" : "s"}
                    </span>
                  </div>
                  {badge && (
                    <>
                      <Progress value={badge.percent} className="mt-3 h-2" />
                      <p className="mt-1.5 text-xs text-muted-foreground">
                        {badge.earned
                          ? `${badge.label} badge earned`
                          : `${badge.remaining} more to unlock ${badge.label}`}
                      </p>
                    </>
                  )}
                  {!!evidence.length && (
                    <div className="mt-3 space-y-1">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                        Demonstrated at
                      </p>
                      {evidence.map((e) => (
                        <p key={e.id} className="text-xs text-muted-foreground">
                          {e.event_title} · {e.organisation_name}
                        </p>
                      ))}
                    </div>
                  )}
                  {!count && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Skill you want to build — join an event to add verified experience.
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="mt-3 rounded-3xl bg-card p-5 text-sm text-muted-foreground soft-shadow">
            Add skills in your profile, then verified experiences appear here after each event.
          </p>
        )}
      </section>

      <section className="mt-7">
        <h2 className="text-base font-bold text-foreground">Skill badges</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Personal progress only — no leaderboards, no rankings.
        </p>
        <div className="mt-3 grid grid-cols-2 gap-3">
          {badges.map((b) => (
            <div
              key={b.id}
              className={`rounded-3xl p-4 ${b.earned ? "bg-card soft-shadow" : "border border-dashed border-border"}`}
            >
              <Award className={`h-5 w-5 ${b.earned ? "text-[#F59E0B]" : "text-muted-foreground/50"}`} />
              <p className={`mt-2 text-sm font-bold ${b.earned ? "text-foreground" : "text-muted-foreground"}`}>
                {b.label}
              </p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                {b.earned ? "Unlocked" : `${b.count} / ${b.required} ${b.skill.toLowerCase()} experiences`}
              </p>
              {!b.earned && (
                <Link to="/discover" className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-primary">
                  <Search className="h-3 w-3" /> Find an opportunity
                </Link>
              )}
            </div>
          ))}
        </div>
      </section>

      <div className="mt-7">
        <BuildNextCard />
      </div>
    </div>
  );
}