import React from "react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { ShieldCheck, ShieldAlert, MapPin, ArrowRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

function unfilledRoles(event, gap) {
  const roles = event.skills_practised || [];
  if (!gap || !roles.length) return [];
  const out = [];
  let left = gap;
  roles.forEach((role, i) => {
    if (left <= 0) return;
    const take = i === roles.length - 1 ? left : Math.ceil(gap / roles.length);
    out.push({ role, count: Math.min(take, left) });
    left -= take;
  });
  return out;
}

export default function ReadinessCard({ event, registered }) {
  const required = event.capacity || 0;
  const gap = Math.max(required - registered, 0);
  const percent = required ? Math.min(Math.round((registered / required) * 100), 100) : 0;
  const safe = event.verified && (!event.wwcc_required || event.involves_children === false || event.safety_info);
  const needs = unfilledRoles(event, gap);

  return (
    <div className="rounded-3xl border border-border bg-card p-5 soft-shadow">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-base font-bold text-foreground">{event.title}</p>
          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
            {format(new Date(event.date), "d MMM")}
            {event.location && (
              <>
                <span>·</span>
                <MapPin className="h-3 w-3" /> {event.location}
              </>
            )}
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-bold ${
            percent >= 90
              ? "bg-[#DCFCE7] text-[#15803D]"
              : percent >= 60
              ? "bg-[#FEF3C7] text-[#B45309]"
              : "bg-secondary text-muted-foreground"
          }`}
        >
          {percent}% Ready
        </span>
      </div>

      <div className="mt-4">
        <div className="flex items-baseline justify-between">
          <p className="text-sm font-semibold text-foreground">
            {registered} / {required} volunteers
          </p>
          {gap > 0 && <p className="text-xs font-medium text-[#B45309]">{gap} spot{gap === 1 ? "" : "s"} open</p>}
        </div>
        <Progress value={percent} className="mt-2 h-2 bg-secondary" />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Needs</p>
          {needs.length ? (
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {needs.map(({ role, count }) => (
                <span key={role} className="rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-primary">
                  {count} {role}
                </span>
              ))}
            </div>
          ) : (
            <p className="mt-1.5 text-sm font-semibold text-[#15803D]">Fully staffed</p>
          )}
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Safety</p>
          <p
            className={`mt-1.5 flex items-center gap-1.5 text-sm font-semibold ${
              safe ? "text-[#15803D]" : "text-[#B45309]"
            }`}
          >
            {safe ? <ShieldCheck className="h-4 w-4" /> : <ShieldAlert className="h-4 w-4" />}
            {safe ? "Verified" : "Needs review"}
          </p>
        </div>
      </div>

      <Button asChild className="mt-4 h-11 w-full rounded-2xl sm:w-auto">
        <Link to={`/org/events/${event.id}`}>
          Manage Event <ArrowRight className="h-4 w-4" />
        </Link>
      </Button>
    </div>
  );
}