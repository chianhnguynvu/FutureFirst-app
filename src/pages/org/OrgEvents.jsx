import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { format } from "date-fns";
import { Plus, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRefresh } from "@/hooks/useVolunteer";

const statusTone = {
  published: "bg-[#DCFCE7] text-[#166534]",
  draft: "bg-secondary text-muted-foreground",
  closed: "bg-[#FEF3C7] text-[#B45309]",
  cancelled: "bg-red-100 text-red-700",
  completed: "bg-accent text-primary",
};

export default function OrgEvents() {
  const refresh = useRefresh();
  const { data: events = [] } = useQuery({ queryKey: ["events-all"], queryFn: () => base44.entities.Event.list("-date") });
  const { data: regs = [] } = useQuery({ queryKey: ["regs-all"], queryFn: () => base44.entities.Registration.list() });

  const update = async (event, status) => {
    await base44.entities.Event.update(event.id, { status });
    refresh(["events-all", "events"]);
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">Events</h1>
          <p className="mt-1 text-sm text-muted-foreground">Create and manage volunteer opportunities.</p>
        </div>
        <Button asChild className="h-12 rounded-2xl">
          <Link to="/org/events/new"><Plus className="mr-1 h-4 w-4" /> Create event</Link>
        </Button>
      </div>

      <div className="mt-6 space-y-3">
        {events.map((e) => {
          const registered = regs.filter((r) => r.event_id === e.id).length;
          return (
            <div key={e.id} className="rounded-3xl bg-card p-5 soft-shadow">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-bold text-foreground">{e.title}</h2>
                    <Badge className={`${statusTone[e.status] || ""} hover:opacity-100`}>{e.status}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {e.date ? format(new Date(e.date), "EEE d MMM yyyy") : "Date TBC"} · {e.start_time}–{e.end_time} ·{" "}
                    {e.location}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {registered}/{e.capacity} volunteers registered · {e.cause}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button asChild variant="outline" className="h-11 rounded-2xl">
                    <Link to={`/org/events/${e.id}`}><Pencil className="mr-1 h-4 w-4" /> Edit</Link>
                  </Button>
                  <Button asChild variant="outline" className="h-11 rounded-2xl">
                    <Link to={`/org/attendance?event=${e.id}`}>Volunteers</Link>
                  </Button>
                  {e.status === "draft" && (
                    <Button className="h-11 rounded-2xl" onClick={() => update(e, "published")}>Publish</Button>
                  )}
                  {e.status === "published" && (
                    <Button variant="outline" className="h-11 rounded-2xl" onClick={() => update(e, "closed")}>
                      Close registrations
                    </Button>
                  )}
                  {e.status !== "cancelled" && e.status !== "completed" && (
                    <Button
                      variant="ghost"
                      className="h-11 rounded-2xl text-destructive"
                      onClick={() => update(e, "cancelled")}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {!events.length && (
          <p className="rounded-3xl bg-card p-6 text-sm text-muted-foreground soft-shadow">No events yet.</p>
        )}
      </div>
    </div>
  );
}