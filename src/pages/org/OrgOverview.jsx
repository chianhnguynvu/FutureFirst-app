import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { format } from "date-fns";
import { Users, UserCheck, Repeat, Clock, CalendarDays, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";
import StatCard from "@/components/StatCard";

export default function OrgOverview() {
  const { data: events = [] } = useQuery({ queryKey: ["events-all"], queryFn: () => base44.entities.Event.list("date") });
  const { data: regs = [] } = useQuery({ queryKey: ["regs-all"], queryFn: () => base44.entities.Registration.list() });
  const { data: announcements = [] } = useQuery({
    queryKey: ["announcements"],
    queryFn: () => base44.entities.Announcement.list("-created_date"),
  });

  const volunteers = new Set(regs.map((r) => r.volunteer_email));
  const attended = regs.filter((r) => r.status === "attended");
  const activeVolunteers = new Set(attended.map((r) => r.volunteer_email));
  const counts = {};
  attended.forEach((r) => (counts[r.volunteer_email] = (counts[r.volunteer_email] || 0) + 1));
  const repeat = Object.values(counts).filter((n) => n > 1).length;
  const hours = attended.reduce((s, r) => s + (r.hours || 0), 0);
  const decided = regs.filter((r) => r.status === "attended" || r.status === "absent").length;
  const attendanceRate = decided ? Math.round((attended.length / decided) * 100) : 0;
  const retention = volunteers.size ? Math.round((repeat / volunteers.size) * 100) : 0;
  const upcoming = events.filter((e) => new Date(e.date) >= new Date() && e.status === "published");

  const chart = events.slice(0, 6).map((e) => ({
    name: e.title.split(" ").slice(0, 2).join(" "),
    Registered: regs.filter((r) => r.event_id === e.id).length,
    Attended: regs.filter((r) => r.event_id === e.id && r.status === "attended").length,
  }));

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-foreground">Overview</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        How your volunteer community is engaging over time.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="total volunteers" value={volunteers.size} icon={Users} />
        <StatCard label="active volunteers" value={activeVolunteers.size} icon={UserCheck} tone="green" />
        <StatCard label="repeat volunteers" value={repeat} icon={Repeat} tone="gold" />
        <StatCard label="volunteer retention" value={`${retention}%`} icon={TrendingUp} tone="slate" />
        <StatCard label="upcoming events" value={upcoming.length} icon={CalendarDays} />
        <StatCard label="total registrations" value={regs.length} icon={Users} tone="slate" />
        <StatCard label="attendance rate" value={`${attendanceRate}%`} icon={UserCheck} tone="green" />
        <StatCard label="volunteer hours" value={hours} icon={Clock} tone="gold" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="rounded-3xl bg-card p-5 soft-shadow lg:col-span-2">
          <h2 className="text-base font-bold text-foreground">Registrations vs attendance</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chart}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="Registered" fill="#0F766E" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Attended" fill="#22C55E" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-3xl bg-card p-5 soft-shadow">
          <h2 className="text-base font-bold text-foreground">Recent announcements</h2>
          <div className="mt-3 space-y-3">
            {announcements.slice(0, 4).map((a) => (
              <div key={a.id}>
                <p className="text-sm font-bold text-foreground">{a.title}</p>
                <p className="line-clamp-2 text-xs text-muted-foreground">{a.body}</p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {a.created_date ? format(new Date(a.created_date), "d MMM") : ""}
                </p>
              </div>
            ))}
            {!announcements.length && (
              <p className="text-sm text-muted-foreground">No announcements yet.</p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-3xl bg-card p-5 soft-shadow">
        <h2 className="text-base font-bold text-foreground">Upcoming events</h2>
        <div className="mt-3 divide-y divide-border">
          {upcoming.map((e) => (
            <div key={e.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
              <div>
                <p className="font-semibold text-foreground">{e.title}</p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(e.date), "EEE d MMM")} · {e.location}
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
                {regs.filter((r) => r.event_id === e.id).length}/{e.capacity} registered
              </p>
            </div>
          ))}
          {!upcoming.length && <p className="py-3 text-sm text-muted-foreground">No upcoming events.</p>}
        </div>
      </div>
    </div>
  );
}