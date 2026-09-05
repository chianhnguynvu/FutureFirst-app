import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import ChipSelect from "@/components/ChipSelect";
import { CAUSES } from "@/lib/futurefirst";

export default function OrgMembers() {
  const [q, setQ] = useState("");
  const [interests, setInterests] = useState([]);
  const { data: profiles = [] } = useQuery({
    queryKey: ["profiles"],
    queryFn: () => base44.entities.VolunteerProfile.list("-volunteer_hours"),
  });
  const { data: regs = [] } = useQuery({ queryKey: ["regs-all"], queryFn: () => base44.entities.Registration.list() });

  const filtered = profiles.filter((p) => {
    const text = `${p.full_name} ${p.university} ${p.location}`.toLowerCase();
    if (q && !text.includes(q.toLowerCase())) return false;
    if (interests.length && !(p.interests || []).some((i) => interests.includes(i))) return false;
    return true;
  });

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-foreground">Members</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {profiles.length} volunteers in your community. Only details volunteers chose to share are shown.
      </p>

      <div className="mt-5 space-y-4">
        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search members"
            className="h-12 rounded-2xl bg-card pl-11"
          />
        </div>
        <ChipSelect options={CAUSES} value={interests} onChange={setInterests} />
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((p) => {
          const mine = regs.filter((r) => r.volunteer_email === p.user_email);
          const attended = mine.filter((r) => r.status === "attended");
          const hidden = p.profile_visibility === "private";
          return (
            <div key={p.id} className="rounded-3xl bg-card p-5 soft-shadow">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent font-bold text-primary">
                  {(p.full_name || "V").charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-bold text-foreground">{p.full_name || "Volunteer"}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {hidden ? "Profile kept private" : [p.university, p.location].filter(Boolean).join(" · ")}
                  </p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-2xl bg-secondary/70 py-2">
                  <p className="font-extrabold text-primary">{p.volunteer_hours || 0}</p>
                  <p className="text-[11px] text-muted-foreground">hours</p>
                </div>
                <div className="rounded-2xl bg-secondary/70 py-2">
                  <p className="font-extrabold text-primary">{attended.length}</p>
                  <p className="text-[11px] text-muted-foreground">attended</p>
                </div>
                <div className="rounded-2xl bg-secondary/70 py-2">
                  <p className="font-extrabold text-primary">{mine.length}</p>
                  <p className="text-[11px] text-muted-foreground">signed up</p>
                </div>
              </div>

              {!hidden && (
                <>
                  <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Interests</p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {(p.interests || []).map((i) => (
                      <span key={i} className="rounded-full bg-accent px-2.5 py-1 text-[11px] text-primary">{i}</span>
                    ))}
                  </div>
                  <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Skills</p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {(p.skills || []).map((s) => (
                      <span key={s} className="rounded-full bg-secondary px-2.5 py-1 text-[11px] text-foreground">{s}</span>
                    ))}
                  </div>
                </>
              )}

              <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Volunteer history
              </p>
              <div className="mt-1.5 space-y-1">
                {mine.length ? (
                  mine.slice(0, 4).map((r) => (
                    <p key={r.id} className="text-xs text-muted-foreground">
                      {r.event_title} · {r.status}
                    </p>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground">No events yet</p>
                )}
              </div>
            </div>
          );
        })}
        {!filtered.length && (
          <p className="rounded-3xl bg-card p-6 text-sm text-muted-foreground soft-shadow">No members match.</p>
        )}
      </div>
    </div>
  );
}