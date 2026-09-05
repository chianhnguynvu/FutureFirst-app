import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { CalendarDays, Users, Repeat, Clock, ClipboardCheck, ArrowRight, Inbox } from "lucide-react";
import StatCard from "@/components/StatCard";
import ReadinessCard from "@/components/org/ReadinessCard";
import SkillsPool from "@/components/org/SkillsPool";

export default function OrgOverview() {
  const { data: events = [] } = useQuery({ queryKey: ["events-all"], queryFn: () => base44.entities.Event.list("date") });
  const { data: regs = [] } = useQuery({ queryKey: ["regs-all"], queryFn: () => base44.entities.Registration.list("-created_date") });
  const { data: skillRecords = [] } = useQuery({
    queryKey: ["skill-records-all"],
    queryFn: () => base44.entities.SkillRecord.filter({ verified: true }),
  });

  const volunteers = new Set(regs.map((r) => r.volunteer_email));
  const attended = regs.filter((r) => r.status === "attended");
  const counts = {};
  attended.forEach((r) => (counts[r.volunteer_email] = (counts[r.volunteer_email] || 0) + 1));
  const repeat = Object.values(counts).filter((n) => n > 1).length;
  const hours = attended.reduce((s, r) => s + (r.hours || 0), 0);
  const decided = regs.filter((r) => r.status === "attended" || r.status === "absent").length;
  const attendanceRate = decided ? Math.round((attended.length / decided) * 100) : 0;
  const repeatRate = volunteers.size ? Math.round((repeat / volunteers.size) * 100) : 0;
  const upcoming = events.filter((e) => new Date(e.date) >= new Date() && e.status === "published");
  const newApplications = regs.filter((r) => r.status === "registered").slice(0, 5);
  const awaiting = events.filter(
    (e) => new Date(e.date) < new Date() && regs.some((r) => r.event_id === e.id && r.status === "registered")
  );

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-foreground">Operations</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Everything you need to run your next event and keep volunteers coming back.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="upcoming events" value={upcoming.length} icon={CalendarDays} />
        <StatCard label="registered volunteers" value={volunteers.size} icon={Users} tone="slate" />
        <StatCard label="repeat volunteer rate" value={`${repeatRate}%`} icon={Repeat} tone="green" />
        <StatCard label="total verified hours" value={hours} icon={Clock} tone="gold" />
      </div>

      <section className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">Event readiness</h2>
          <Link to="/org/events" className="flex items-center gap-1 text-sm font-semibold text-primary">
            All events <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-4 grid gap-4 xl:grid-cols-2">
          {upcoming.map((e) => (
            <ReadinessCard key={e.id} event={e} registered={regs.filter((r) => r.event_id === e.id).length} />
          ))}
          {!upcoming.length && (
            <div className="rounded-3xl bg-card p-6 text-sm text-muted-foreground soft-shadow">
              No upcoming events yet. Create one to start recruiting volunteers.
            </div>
          )}
        </div>
      </section>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl bg-card p-5 soft-shadow">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-base font-bold text-foreground">
              <Inbox className="h-4 w-4 text-primary" /> New volunteer applications
            </h2>
            <Link to="/org/members" className="text-sm font-semibold text-primary">View all</Link>
          </div>
          <div className="mt-3 space-y-2">
            {newApplications.map((r) => (
              <div key={r.id} className="flex items-center justify-between rounded-2xl bg-[#F8FAFC] px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">{r.volunteer_name || r.volunteer_email}</p>
                  <p className="truncate text-xs text-muted-foreground">{r.event_title}</p>
                </div>
                <span className="ml-3 shrink-0 rounded-full bg-accent px-2.5 py-1 text-[11px] font-semibold text-primary">
                  {r.event_date ? format(new Date(r.event_date), "d MMM") : "New"}
                </span>
              </div>
            ))}
            {!newApplications.length && (
              <p className="text-sm text-muted-foreground">No new applications right now.</p>
            )}
          </div>
        </div>

        <div className="rounded-3xl bg-card p-5 soft-shadow">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-base font-bold text-foreground">
              <ClipboardCheck className="h-4 w-4 text-primary" /> Attendance & retention
            </h2>
            <Link to="/org/attendance" className="text-sm font-semibold text-primary">Verify</Link>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-[#F8FAFC] p-4">
              <p className="text-2xl font-extrabold text-[#15803D]">{attendanceRate}%</p>
              <p className="text-xs text-muted-foreground">attendance rate</p>
            </div>
            <div className="rounded-2xl bg-[#F8FAFC] p-4">
              <p className="text-2xl font-extrabold text-primary">{repeat}</p>
              <p className="text-xs text-muted-foreground">volunteers returned</p>
            </div>
          </div>
          <div className="mt-3 rounded-2xl bg-[#FEF3C7] px-4 py-3">
            <p className="text-sm font-semibold text-[#B45309]">
              {awaiting.length
                ? `${awaiting.length} past event${awaiting.length === 1 ? "" : "s"} awaiting verification`
                : "All past events verified"}
            </p>
            <p className="mt-0.5 text-xs text-[#B45309]/80">
              Verifying participation issues certificates and unlocks volunteer skills.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <SkillsPool records={skillRecords} />
      </div>
    </div>
  );
}