import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { format } from "date-fns";
import { ArrowLeft, Megaphone, CalendarCheck, Sparkles } from "lucide-react";
import { useRegistrations, useProfile } from "@/hooks/useVolunteer";

export default function Notifications() {
  const navigate = useNavigate();
  const { data: profile } = useProfile();
  const { data: regs = [] } = useRegistrations();
  const { data: announcements = [] } = useQuery({
    queryKey: ["announcements"],
    queryFn: () => base44.entities.Announcement.list("-created_date"),
  });

  const relevant = announcements.filter(
    (a) =>
      a.audience === "all" ||
      (a.audience === "event" && regs.some((r) => r.event_id === a.target_event_id)) ||
      (a.audience === "interest" && (profile?.interests || []).includes(a.target_interest))
  );

  return (
    <div className="px-5 pt-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="flex h-11 w-11 items-center justify-center rounded-2xl bg-card soft-shadow"
          aria-label="Back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-extrabold text-foreground">Updates</h1>
      </div>

      <section className="mt-6">
        <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Announcements</h2>
        <div className="mt-3 space-y-3">
          {relevant.length ? (
            relevant.map((a) => (
              <div key={a.id} className="rounded-3xl bg-card p-4 soft-shadow">
                <p className="flex items-center gap-2 text-xs font-medium text-primary">
                  <Megaphone className="h-3.5 w-3.5" /> {a.organisation_name}
                </p>
                <p className="mt-1 font-bold text-foreground">{a.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{a.body}</p>
                <p className="mt-2 text-[11px] text-muted-foreground">
                  {a.created_date ? format(new Date(a.created_date), "d MMM, h:mm a") : ""}
                </p>
              </div>
            ))
          ) : (
            <p className="rounded-3xl bg-card p-5 text-sm text-muted-foreground soft-shadow">
              No announcements right now.
            </p>
          )}
        </div>
      </section>

      <section className="mt-7">
        <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Your registrations</h2>
        <div className="mt-3 space-y-3">
          {regs.length ? (
            regs.map((r) => (
              <Link key={r.id} to={`/event/${r.event_id}`} className="block rounded-3xl bg-card p-4 soft-shadow">
                <p className="flex items-center gap-2 text-xs font-medium text-[#16A34A]">
                  <CalendarCheck className="h-3.5 w-3.5" />
                  {r.status === "attended" ? "Attendance confirmed" : "Registration confirmed"}
                </p>
                <p className="mt-1 font-bold text-foreground">{r.event_title}</p>
                <p className="text-xs text-muted-foreground">
                  {r.event_date ? format(new Date(r.event_date), "EEE d MMM") : ""}
                </p>
              </Link>
            ))
          ) : (
            <p className="rounded-3xl bg-card p-5 text-sm text-muted-foreground soft-shadow">
              Join an event and your confirmations will appear here.
            </p>
          )}
        </div>
      </section>

      <p className="mt-7 flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
        <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
        In-app updates only for now — you'll always be able to choose email or reminders later.
      </p>
    </div>
  );
}