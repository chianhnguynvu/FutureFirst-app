import React from "react";
import { Sparkles } from "lucide-react";

export default function SkillsPool({ records }) {
  const counts = {};
  records.forEach((r) => {
    if (!r.skill) return;
    counts[r.skill] = counts[r.skill] || new Set();
    counts[r.skill].add(r.volunteer_email);
  });
  const list = Object.entries(counts)
    .map(([skill, set]) => ({ skill, people: set.size }))
    .sort((a, b) => b.people - a.people)
    .slice(0, 8);
  const max = list[0]?.people || 1;

  return (
    <div className="rounded-3xl bg-card p-5 soft-shadow">
      <h2 className="flex items-center gap-2 text-base font-bold text-foreground">
        <Sparkles className="h-4 w-4 text-[#F59E0B]" /> Skills in your volunteer pool
      </h2>
      <p className="mt-1 text-xs text-muted-foreground">Verified experience across your volunteers.</p>
      <div className="mt-4 space-y-3">
        {list.map(({ skill, people }) => (
          <div key={skill}>
            <div className="flex items-baseline justify-between text-sm">
              <span className="font-medium text-foreground">{skill}</span>
              <span className="text-xs text-muted-foreground">{people}</span>
            </div>
            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
              <div className="h-full rounded-full bg-primary" style={{ width: `${(people / max) * 100}%` }} />
            </div>
          </div>
        ))}
        {!list.length && (
          <p className="text-sm text-muted-foreground">
            Verify participation after an event to build your skills pool.
          </p>
        )}
      </div>
    </div>
  );
}