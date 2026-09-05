import React from "react";
import { Link, Navigate } from "react-router-dom";
import { Bell, ArrowRight, Clock, CalendarDays, Sparkles } from "lucide-react";
import { format } from "date-fns";
import Brand from "@/components/Brand";
import EventCard from "@/components/EventCard";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  useProfile,
  useEvents,
  useRegistrations,
  useModules,
  useProgress,
} from "@/hooks/useVolunteer";
import { greeting, matchEvent, levelFor } from "@/lib/futurefirst";

export default function Home() {
  const { data: profile, isLoading } = useProfile();
  const { data: events = [] } = useEvents();
  const { data: regs = [] } = useRegistrations();
  const { data: modules = [] } = useModules();
  const { data: progress = [] } = useProgress();

  if (isLoading || !profile) return <div className="p-6 text-muted-foreground">Loading…</div>;
  if (!profile.onboarding_complete) return <Navigate to="/onboarding" replace />;

  const registeredIds = regs.filter((r) => r.status !== "cancelled").map((r) => r.event_id);
  const completedCauses = progress.filter((p) => p.completed).map((p) => p.cause);
  const recommended = events
    .filter((e) => !registeredIds.includes(e.id))
    .map((e) => ({ event: e, ...matchEvent(e, profile, regs, completedCauses) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  const upcoming = regs
    .filter((r) => r.status === "registered")
    .sort((a, b) => new Date(a.event_date) - new Date(b.event_date))[0];

  const inProgress = progress.find((p) => !p.completed && p.progress > 0);
  const nextModule =
    modules.find((m) => m.id === inProgress?.module_id) ||
    modules.find((m) => profile.interests?.includes(m.cause) && !completedCauses.includes(m.cause)) ||
    modules[0];
  const nextModuleProgress = progress.find((p) => p.module_id === nextModule?.id)?.progress || 0;

  const causesSupported = new Set(regs.filter((r) => r.status === "attended").map((r) => r.cause)).size;
  const level = levelFor(profile.learning_score);

  return (
    <div className="px-5 pt-6">
      <header className="flex items-start justify-between">
        <Brand />
        <div className="flex items-center gap-2">
          <Link
            to="/notifications"
            className="flex h-11 w-11 items-center justify-center rounded-2xl bg-card soft-shadow"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5 text-foreground" />
          </Link>
          <Link to="/profile" className="h-11 w-11 overflow-hidden rounded-2xl bg-accent">
            {profile.photo_url ? (
              <img src={profile.photo_url} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="flex h-full w-full items-center justify-center font-bold text-primary">
                {(profile.full_name || "V").charAt(0)}
              </span>
            )}
          </Link>
        </div>
      </header>

      <div className="mt-6">
        <h1 className="text-2xl font-extrabold leading-tight text-foreground">
          {greeting()}, {(profile.full_name || "there").split(" ")[0]}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">Ready to make your next impact?</p>
      </div>

      {/* Next action */}
      <div className="mt-5 rounded-3xl bg-primary p-5 text-primary-foreground">
        <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide opacity-80">
          <Sparkles className="h-3.5 w-3.5" /> Your next action
        </p>
        <p className="mt-2 text-lg font-bold leading-snug">
          {upcoming
            ? `Prepare for ${upcoming.event_title}`
            : recommended[0]
            ? `Join ${recommended[0].event.title}`
            : "Explore a learning topic you care about"}
        </p>
        <Button
          asChild
          className="mt-4 h-12 w-full rounded-2xl bg-white text-primary hover:bg-white/90"
        >
          <Link to={upcoming ? `/event/${upcoming.event_id}` : recommended[0] ? `/event/${recommended[0].event.id}` : "/learn"}>
            {upcoming ? "View event details" : "Take a look"} <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </div>

      {/* Impact summary */}
      <section className="mt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-foreground">Your impact</h2>
          <Link to="/impact" className="text-sm font-medium text-primary">See all</Link>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-3">
          {[
            { v: profile.volunteer_hours || 0, l: "hours" },
            { v: profile.events_completed || 0, l: "events" },
            { v: causesSupported, l: "causes" },
          ].map((s) => (
            <div key={s.l} className="rounded-3xl bg-card p-4 text-center soft-shadow">
              <p className="text-2xl font-extrabold text-primary">{s.v}</p>
              <p className="text-xs text-muted-foreground">{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Upcoming */}
      {upcoming && (
        <section className="mt-6">
          <h2 className="text-base font-bold text-foreground">Upcoming event</h2>
          <Link
            to={`/event/${upcoming.event_id}`}
            className="mt-3 flex items-center gap-3 rounded-3xl bg-card p-4 soft-shadow"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-accent">
              <CalendarDays className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="truncate font-bold text-foreground">{upcoming.event_title}</p>
              <p className="text-xs text-muted-foreground">
                {upcoming.event_date ? format(new Date(upcoming.event_date), "EEEE d MMMM") : "Date TBC"}
              </p>
            </div>
            <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground" />
          </Link>
        </section>
      )}

      {/* Recommended */}
      <section className="mt-7">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-foreground">Recommended for you</h2>
          <Link to="/discover" className="text-sm font-medium text-primary">Discover</Link>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Matched to the preferences you saved — tap any event to see why.
        </p>
        <div className="mt-3 space-y-4">
          {recommended.map(({ event, score }) => (
            <EventCard key={event.id} event={event} match={score} />
          ))}
        </div>
      </section>

      {/* Continue learning */}
      {nextModule && (
        <section className="mt-7">
          <h2 className="text-base font-bold text-foreground">Continue learning</h2>
          <Link to={`/learn/${nextModule.id}`} className="mt-3 block rounded-3xl bg-card p-4 soft-shadow">
            <p className="text-xs font-medium text-primary">{nextModule.cause}</p>
            <p className="mt-1 font-bold leading-snug text-foreground">{nextModule.title}</p>
            <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" /> {nextModule.read_minutes}-minute learning · Level {level.current}
            </p>
            <Progress value={nextModuleProgress} className="mt-3 h-2" />
            <p className="mt-2 text-sm font-semibold text-primary">
              {nextModuleProgress > 0 ? `Continue learning · ${nextModuleProgress}%` : "Start learning"}
            </p>
          </Link>
        </section>
      )}
    </div>
  );
}