import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { format } from "date-fns";
import { Check, X, Award, BadgeCheck } from "lucide-react";
import VerifyParticipationDialog from "@/components/org/VerifyParticipationDialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { setAttendance, issueCertificate } from "@/lib/attendance";
import { useRefresh } from "@/hooks/useVolunteer";

export default function OrgAttendance() {
  const [params] = useSearchParams();
  const refresh = useRefresh();
  const [eventId, setEventId] = useState(params.get("event") || "");
  const [busy, setBusy] = useState(false);
  const [verifying, setVerifying] = useState(null);

  const { data: events = [] } = useQuery({ queryKey: ["events-all"], queryFn: () => base44.entities.Event.list("-date") });
  const { data: regs = [] } = useQuery({ queryKey: ["regs-all"], queryFn: () => base44.entities.Registration.list() });

  useEffect(() => {
    if (!eventId && events.length) setEventId(events[0].id);
  }, [events, eventId]);

  const event = events.find((e) => e.id === eventId);
  const list = regs.filter((r) => r.event_id === eventId);

  const mark = async (reg, status) => {
    setBusy(true);
    await setAttendance(reg, status);
    refresh(["regs-all", "profiles", "registrations", "profile"]);
    setBusy(false);
  };

  const markAll = async (status) => {
    setBusy(true);
    for (const reg of list.filter((r) => r.status === "registered")) {
      await setAttendance(reg, status);
    }
    refresh(["regs-all", "profiles", "registrations", "profile"]);
    setBusy(false);
  };

  const certify = async (reg) => {
    setBusy(true);
    await issueCertificate(reg, event?.organisation_name);
    refresh(["certificates"]);
    setBusy(false);
  };

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-foreground">Attendance</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Confirming attendance updates each volunteer's hours and impact record.
      </p>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Select value={eventId} onValueChange={setEventId}>
          <SelectTrigger className="h-12 w-full max-w-md rounded-2xl bg-card"><SelectValue placeholder="Select event" /></SelectTrigger>
          <SelectContent>
            {events.map((e) => (
              <SelectItem key={e.id} value={e.id}>
                {e.title} — {e.date ? format(new Date(e.date), "d MMM") : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" className="h-12 rounded-2xl" disabled={busy || !list.length} onClick={() => markAll("attended")}>
          Mark all attended
        </Button>
        <Button variant="ghost" className="h-12 rounded-2xl" disabled={busy || !list.length} onClick={() => markAll("absent")}>
          Mark all absent
        </Button>
      </div>

      <div className="mt-6 space-y-3">
        {list.map((r) => (
          <div key={r.id} className="flex flex-wrap items-center justify-between gap-3 rounded-3xl bg-card p-4 soft-shadow">
            <div>
              <p className="font-bold text-foreground">{r.volunteer_name || r.volunteer_email}</p>
              <p className="text-xs text-muted-foreground">
                {r.hours} hours · {r.cause}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                className={
                  r.status === "attended"
                    ? "bg-[#DCFCE7] text-[#166534]"
                    : r.status === "absent"
                    ? "bg-red-100 text-red-700"
                    : "bg-secondary text-muted-foreground"
                }
              >
                {r.status}
              </Badge>
              <Button variant="outline" className="h-11 rounded-2xl" disabled={busy} onClick={() => mark(r, "attended")}>
                <Check className="mr-1 h-4 w-4" /> Attended
              </Button>
              <Button variant="outline" className="h-11 rounded-2xl" disabled={busy} onClick={() => mark(r, "absent")}>
                <X className="mr-1 h-4 w-4" /> Absent
              </Button>
              <Button className="h-11 rounded-2xl" disabled={busy} onClick={() => setVerifying(r)}>
                <BadgeCheck className="mr-1 h-4 w-4" /> Verify participation
              </Button>
              {r.status === "attended" && (
                <Button className="h-11 rounded-2xl" disabled={busy} onClick={() => certify(r)}>
                  <Award className="mr-1 h-4 w-4" /> Issue certificate
                </Button>
              )}
            </div>
          </div>
        ))}
        {verifying && (
          <VerifyParticipationDialog
            registration={verifying}
            event={event}
            open
            onOpenChange={(v) => !v && setVerifying(null)}
            onVerified={() =>
              refresh(["regs-all", "registrations", "profile", "certificates", "skill-records"])
            }
          />
        )}
        {!list.length && (
          <p className="rounded-3xl bg-card p-6 text-sm text-muted-foreground soft-shadow">
            No volunteers registered for this event yet.
          </p>
        )}
      </div>
    </div>
  );
}