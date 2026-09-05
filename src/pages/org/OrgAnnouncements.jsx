import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { format } from "date-fns";
import { Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { CAUSES } from "@/lib/futurefirst";
import { useRefresh } from "@/hooks/useVolunteer";

export default function OrgAnnouncements() {
  const refresh = useRefresh();
  const [form, setForm] = useState({
    title: "",
    body: "",
    organisation_name: "FutureFirst Community",
    audience: "all",
    target_event_id: "",
    target_interest: "",
  });
  const [saving, setSaving] = useState(false);

  const { data: events = [] } = useQuery({ queryKey: ["events-all"], queryFn: () => base44.entities.Event.list("-date") });
  const { data: announcements = [] } = useQuery({
    queryKey: ["announcements"],
    queryFn: () => base44.entities.Announcement.list("-created_date"),
  });

  const send = async () => {
    setSaving(true);
    await base44.entities.Announcement.create(form);
    refresh(["announcements"]);
    setForm({ ...form, title: "", body: "" });
    setSaving(false);
  };

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-extrabold text-foreground">Announcements</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Keep volunteers connected between events. Messages appear in their Updates feed.
      </p>

      <div className="mt-6 space-y-4 rounded-3xl bg-card p-6 soft-shadow">
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold">Title</Label>
          <Input className="h-12 rounded-2xl" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold">Message</Label>
          <Textarea rows={4} className="rounded-2xl" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold">Audience</Label>
            <Select value={form.audience} onValueChange={(v) => setForm({ ...form, audience: v })}>
              <SelectTrigger className="h-12 rounded-2xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All members</SelectItem>
                <SelectItem value="event">Event participants</SelectItem>
                <SelectItem value="interest">Volunteers by interest</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {form.audience === "event" && (
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Event</Label>
              <Select value={form.target_event_id} onValueChange={(v) => setForm({ ...form, target_event_id: v })}>
                <SelectTrigger className="h-12 rounded-2xl"><SelectValue placeholder="Choose event" /></SelectTrigger>
                <SelectContent>
                  {events.map((e) => <SelectItem key={e.id} value={e.id}>{e.title}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}
          {form.audience === "interest" && (
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Interest</Label>
              <Select value={form.target_interest} onValueChange={(v) => setForm({ ...form, target_interest: v })}>
                <SelectTrigger className="h-12 rounded-2xl"><SelectValue placeholder="Choose cause" /></SelectTrigger>
                <SelectContent>
                  {CAUSES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        <Button className="h-12 rounded-2xl" disabled={saving || !form.title || !form.body} onClick={send}>
          <Megaphone className="mr-1 h-4 w-4" /> {saving ? "Publishing…" : "Publish announcement"}
        </Button>
      </div>

      <h2 className="mt-8 text-base font-bold text-foreground">Announcement feed</h2>
      <div className="mt-3 space-y-3">
        {announcements.map((a) => (
          <div key={a.id} className="rounded-3xl bg-card p-5 soft-shadow">
            <p className="font-bold text-foreground">{a.title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{a.body}</p>
            <p className="mt-2 text-[11px] text-muted-foreground">
              {a.audience === "all" ? "All members" : a.audience === "event" ? "Event participants" : `Interest: ${a.target_interest}`}{" "}
              · {a.created_date ? format(new Date(a.created_date), "d MMM, h:mm a") : ""}
            </p>
          </div>
        ))}
        {!announcements.length && (
          <p className="rounded-3xl bg-card p-6 text-sm text-muted-foreground soft-shadow">No announcements yet.</p>
        )}
      </div>
    </div>
  );
}