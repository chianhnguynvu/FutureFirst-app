import React, { useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import EventCard from "@/components/EventCard";
import ChipSelect from "@/components/ChipSelect";
import { CAUSES, AVAILABILITY, SKILLS, matchEvent } from "@/lib/futurefirst";
import { useEvents, useProfile, useRegistrations, useProgress } from "@/hooks/useVolunteer";

export default function Discover() {
  const { data: events = [], isLoading } = useEvents();
  const { data: profile } = useProfile();
  const { data: regs = [] } = useRegistrations();
  const { data: progress = [] } = useProgress();
  const [q, setQ] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [causes, setCauses] = useState([]);
  const [avail, setAvail] = useState([]);
  const [skills, setSkills] = useState([]);
  const [types, setTypes] = useState([]);

  const completedCauses = progress.filter((p) => p.completed).map((p) => p.cause);
  const activeFilters = causes.length + avail.length + skills.length + types.length;

  const filtered = events
    .filter((e) => {
      const text = `${e.title} ${e.organisation_name} ${e.cause} ${e.location}`.toLowerCase();
      if (q && !text.includes(q.toLowerCase())) return false;
      if (causes.length && !causes.includes(e.cause)) return false;
      if (avail.length && !avail.includes(e.availability_tag)) return false;
      if (types.length && !types.includes(e.event_type)) return false;
      if (skills.length && !(e.required_skills || []).some((s) => skills.includes(s))) return false;
      return true;
    })
    .map((e) => ({ event: e, ...matchEvent(e, profile, regs, completedCauses) }))
    .sort((a, b) => b.score - a.score);

  return (
    <div className="px-5 pt-6">
      <h1 className="text-2xl font-extrabold text-foreground">Discover</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Opportunities from verified organisations, all in one place.
      </p>

      <div className="mt-4 flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search events, causes, places"
            className="h-13 rounded-2xl border-border bg-card pl-11 text-base h-[52px]"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setShowFilters((s) => !s)}
          className="h-[52px] w-[52px] shrink-0 rounded-2xl bg-card p-0"
          aria-label="Filters"
        >
          <SlidersHorizontal className="h-5 w-5" />
        </Button>
      </div>

      {!showFilters && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {CAUSES.slice(0, 7).map((c) => {
            const active = causes.includes(c);
            return (
              <button
                key={c}
                onClick={() => setCauses(active ? causes.filter((x) => x !== c) : [...causes, c])}
                className={`min-h-[40px] whitespace-nowrap rounded-full border px-4 text-sm font-medium ${
                  active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card"
                }`}
              >
                {c}
              </button>
            );
          })}
        </div>
      )}

      {showFilters && (
        <div className="mt-4 space-y-5 rounded-3xl bg-card p-4 soft-shadow">
          <div>
            <p className="mb-2 text-sm font-bold">Cause</p>
            <ChipSelect options={CAUSES} value={causes} onChange={setCauses} />
          </div>
          <div>
            <p className="mb-2 text-sm font-bold">Availability</p>
            <ChipSelect options={AVAILABILITY} value={avail} onChange={setAvail} />
          </div>
          <div>
            <p className="mb-2 text-sm font-bold">Skills</p>
            <ChipSelect options={SKILLS} value={skills} onChange={setSkills} />
          </div>
          <div>
            <p className="mb-2 text-sm font-bold">Event type</p>
            <ChipSelect options={["In person", "Online"]} value={types} onChange={setTypes} />
          </div>
          {!!activeFilters && (
            <button
              onClick={() => {
                setCauses([]); setAvail([]); setSkills([]); setTypes([]);
              }}
              className="flex items-center gap-1 text-sm font-medium text-primary"
            >
              <X className="h-4 w-4" /> Clear all filters
            </button>
          )}
        </div>
      )}

      <p className="mt-5 text-sm text-muted-foreground">
        {isLoading ? "Loading opportunities…" : `${filtered.length} opportunities`}
      </p>
      <div className="mt-3 space-y-4">
        {filtered.map(({ event, score }) => (
          <EventCard key={event.id} event={event} match={score} />
        ))}
        {!isLoading && !filtered.length && (
          <div className="rounded-3xl bg-card p-8 text-center soft-shadow">
            <p className="font-bold text-foreground">No events match yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Try removing a filter — new opportunities are added regularly.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}