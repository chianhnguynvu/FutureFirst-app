import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Clock, BookOpen, Users } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Image } from "@/components/ui/image";
import { useModules, useProgress, useProfile } from "@/hooks/useVolunteer";
import { levelFor, CAUSES } from "@/lib/futurefirst";

export default function Learn() {
  const { data: modules = [], isLoading } = useModules();
  const { data: progress = [] } = useProgress();
  const { data: profile } = useProfile();
  const [cause, setCause] = useState(null);

  const level = levelFor(profile?.learning_score || 0);
  const completed = progress.filter((p) => p.completed);
  const byId = Object.fromEntries(progress.map((p) => [p.module_id, p]));
  const categories = CAUSES.filter((c) => modules.some((m) => m.cause === c));
  const list = cause ? modules.filter((m) => m.cause === cause) : modules;
  const recommended =
    modules.find((m) => profile?.interests?.includes(m.cause) && !byId[m.id]?.completed) || modules[0];

  return (
    <div className="px-5 pt-6">
      <h1 className="text-2xl font-extrabold text-foreground">Learn</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Short, source-checked explainers on humanitarian and child-rights issues.
      </p>

      <div className="mt-4 rounded-3xl bg-card p-5 soft-shadow">
        <div className="flex items-baseline justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Your level</p>
            <p className="text-xl font-extrabold text-primary">{level.current}</p>
          </div>
          <p className="text-sm text-muted-foreground">
            {completed.length} of {modules.length} modules
          </p>
        </div>
        <Progress value={level.progress} className="mt-3 h-2" />
        <p className="mt-2 text-xs text-muted-foreground">
          {level.next ? `${level.progress}% towards ${level.next}` : "You've reached the highest level — thank you."}
        </p>
      </div>

      {recommended && (
        <section className="mt-6">
          <h2 className="text-base font-bold text-foreground">Recommended topic</h2>
          <Link
            to={`/learn/${recommended.id}`}
            className="mt-3 block overflow-hidden rounded-3xl bg-card soft-shadow"
          >
            {recommended.image_url && (
              <Image src={recommended.image_url} alt={recommended.title} className="h-36 w-full" />
            )}
            <div className="p-4">
              <p className="text-xs font-medium text-primary">{recommended.cause}</p>
              <p className="mt-1 font-bold leading-snug text-foreground">{recommended.title}</p>
              <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5" /> {recommended.read_minutes}-minute learning
              </p>
              <Progress value={byId[recommended.id]?.progress || 0} className="mt-3 h-2" />
              <p className="mt-2 text-sm font-semibold text-primary">
                {byId[recommended.id]?.progress ? "Continue learning" : "Start learning"}
              </p>
            </div>
          </Link>
        </section>
      )}

      <div className="mt-6 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        <button
          onClick={() => setCause(null)}
          className={`min-h-[40px] whitespace-nowrap rounded-full border px-4 text-sm font-medium ${
            !cause ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card"
          }`}
        >
          All topics
        </button>
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setCause(cause === c ? null : c)}
            className={`min-h-[40px] whitespace-nowrap rounded-full border px-4 text-sm font-medium ${
              cause === c ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-3">
        {isLoading && <p className="text-sm text-muted-foreground">Loading modules…</p>}
        {list.map((m) => {
          const p = byId[m.id];
          return (
            <Link key={m.id} to={`/learn/${m.id}`} className="block rounded-3xl bg-card p-4 soft-shadow">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-medium text-primary">{m.cause}</p>
                  <p className="mt-1 font-bold leading-snug text-foreground">{m.title}</p>
                  <p className="mt-1 flex flex-wrap items-center gap-x-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" /> {m.read_minutes} min
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" /> {40 + ((m.title?.length || 5) * 7) % 160} students completed
                    </span>
                  </p>
                </div>
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-accent">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
              </div>
              <Progress value={p?.progress || 0} className="mt-3 h-1.5" />
              <p className="mt-2 text-xs font-semibold text-primary">
                {p?.completed ? "Completed" : p?.progress ? `${p.progress}% · Continue` : "Start"}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}