import React, { useState } from "react";
import { BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ChipSelect from "@/components/ChipSelect";
import { TRANSFERABLE_SKILLS } from "@/lib/skills";
import { verifyParticipation } from "@/lib/attendance";

export default function VerifyParticipationDialog({ registration, event, open, onOpenChange, onVerified }) {
  const [hours, setHours] = useState(String(registration?.hours ?? event?.volunteer_hours ?? 0));
  const [role, setRole] = useState("");
  const [skills, setSkills] = useState(event?.skills_practised || []);
  const [feedback, setFeedback] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    setSaving(true);
    await verifyParticipation(registration, event, { hours, role, skills, feedback });
    setSaving(false);
    onOpenChange(false);
    onVerified?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-extrabold">
            Verify {registration?.volunteer_name || registration?.volunteer_email}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <p className="mb-1.5 text-sm font-semibold">Volunteer hours</p>
              <Input
                type="number"
                min="0"
                className="h-[52px] rounded-2xl text-base"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
              />
            </div>
            <div>
              <p className="mb-1.5 text-sm font-semibold">Role completed</p>
              <Input
                className="h-[52px] rounded-2xl text-base"
                placeholder="e.g. Packing team"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              />
            </div>
          </div>
          <div>
            <p className="mb-2 text-sm font-semibold">Skills demonstrated</p>
            <ChipSelect options={TRANSFERABLE_SKILLS} value={skills} onChange={setSkills} />
          </div>
          <div>
            <p className="mb-1.5 text-sm font-semibold">Participation note (optional)</p>
            <Textarea
              rows={3}
              className="rounded-2xl text-base"
              placeholder="Worked effectively with the packing team and communicated clearly with participants."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Verifying marks attendance, updates the volunteer's Skill Passport and badge progress, and issues
            their verified impact certificate.
          </p>
          <Button
            className="h-14 w-full rounded-2xl text-base font-semibold"
            disabled={saving}
            onClick={submit}
          >
            <BadgeCheck className="mr-2 h-4 w-4" /> {saving ? "Verifying…" : "Verify participation"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}