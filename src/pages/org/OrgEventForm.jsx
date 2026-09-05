import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import ChipSelect from "@/components/ChipSelect";
import { CAUSES, SKILLS, AVAILABILITY } from "@/lib/futurefirst";
import { TRANSFERABLE_SKILLS } from "@/lib/skills";
import { useRefresh } from "@/hooks/useVolunteer";

const empty = {
  title: "",
  organisation_name: "",
  description: "",
  why_it_matters: "",
  cause: "Child Rights",
  date: "",
  start_time: "10:00",
  end_time: "14:00",
  location: "",
  event_type: "In person",
  availability_tag: "Weekend",
  capacity: 20,
  required_skills: [],
  skills_practised: [],
  contact_person: "",
  involves_children: false,
  wwcc_required: false,
  volunteer_tasks: "",
  volunteer_hours: 4,
  expected_impact: "",
  humanitarian_issue: "",
  child_rights_topic: "",
  safety_info: "",
  eligibility: "",
  image_url: "",
  registration_deadline: "",
  status: "published",
};

export default function OrgEventForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const refresh = useRefresh();
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const editing = id && id !== "new";

  useEffect(() => {
    if (!editing) return;
    base44.entities.Event.get(id).then((e) => setForm({ ...empty, ...e }));
  }, [id, editing]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const save = async (status) => {
    setSaving(true);
    const payload = { ...form, status, capacity: Number(form.capacity), volunteer_hours: Number(form.volunteer_hours) };
    delete payload.id;
    delete payload.created_date;
    delete payload.updated_date;
    delete payload.created_by_id;
    if (editing) await base44.entities.Event.update(id, payload);
    else await base44.entities.Event.create(payload);
    refresh(["events-all", "events"]);
    setSaving(false);
    navigate("/org/events");
  };

  const Field = ({ label, children }) => (
    <div className="space-y-1.5">
      <Label className="text-sm font-semibold">{label}</Label>
      {children}
    </div>
  );

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-extrabold text-foreground">{editing ? "Edit event" : "Create event"}</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Clear, honest details help volunteers decide with confidence.
      </p>

      <div className="mt-6 space-y-6 rounded-3xl bg-card p-6 soft-shadow">
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Event title">
            <Input className="h-12 rounded-2xl" value={form.title} onChange={(e) => set("title", e.target.value)} />
          </Field>
          <Field label="Organisation">
            <Input
              className="h-12 rounded-2xl"
              value={form.organisation_name}
              onChange={(e) => set("organisation_name", e.target.value)}
            />
          </Field>
        </div>

        <Field label="Description">
          <Textarea rows={3} className="rounded-2xl" value={form.description} onChange={(e) => set("description", e.target.value)} />
        </Field>
        <Field label="Why this event matters">
          <Textarea rows={2} className="rounded-2xl" value={form.why_it_matters} onChange={(e) => set("why_it_matters", e.target.value)} />
        </Field>

        <div className="grid gap-5 md:grid-cols-3">
          <Field label="Cause">
            <Select value={form.cause} onValueChange={(v) => set("cause", v)}>
              <SelectTrigger className="h-12 rounded-2xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                {CAUSES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Date">
            <Input type="date" className="h-12 rounded-2xl" value={form.date || ""} onChange={(e) => set("date", e.target.value)} />
          </Field>
          <Field label="Registration deadline">
            <Input
              type="date"
              className="h-12 rounded-2xl"
              value={form.registration_deadline || ""}
              onChange={(e) => set("registration_deadline", e.target.value)}
            />
          </Field>
          <Field label="Start time">
            <Input type="time" className="h-12 rounded-2xl" value={form.start_time} onChange={(e) => set("start_time", e.target.value)} />
          </Field>
          <Field label="End time">
            <Input type="time" className="h-12 rounded-2xl" value={form.end_time} onChange={(e) => set("end_time", e.target.value)} />
          </Field>
          <Field label="Volunteer hours">
            <Input
              type="number"
              className="h-12 rounded-2xl"
              value={form.volunteer_hours}
              onChange={(e) => set("volunteer_hours", e.target.value)}
            />
          </Field>
          <Field label="Location">
            <Input className="h-12 rounded-2xl" value={form.location} onChange={(e) => set("location", e.target.value)} />
          </Field>
          <Field label="Event type">
            <Select value={form.event_type} onValueChange={(v) => set("event_type", v)}>
              <SelectTrigger className="h-12 rounded-2xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="In person">In person</SelectItem>
                <SelectItem value="Online">Online</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Capacity">
            <Input type="number" className="h-12 rounded-2xl" value={form.capacity} onChange={(e) => set("capacity", e.target.value)} />
          </Field>
        </div>

        <Field label="Typical availability">
          <ChipSelect
            options={AVAILABILITY}
            value={[form.availability_tag]}
            onChange={(v) => set("availability_tag", v[0] || "Weekend")}
            single
          />
        </Field>

        <Field label="Required skills (volunteers should already have these)">
          <ChipSelect options={SKILLS} value={form.required_skills || []} onChange={(v) => set("required_skills", v)} />
        </Field>

        <Field label="Skills volunteers will build / practise">
          <ChipSelect
            options={TRANSFERABLE_SKILLS}
            value={form.skills_practised || []}
            onChange={(v) => set("skills_practised", v)}
          />
        </Field>

        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Contact person for volunteers">
            <Input className="h-12 rounded-2xl" value={form.contact_person} onChange={(e) => set("contact_person", e.target.value)} />
          </Field>
          <Field label="Child safety">
            <ChipSelect
              options={["Involves children", "Working With Children Check required"]}
              value={[
                ...(form.involves_children ? ["Involves children"] : []),
                ...(form.wwcc_required ? ["Working With Children Check required"] : []),
              ]}
              onChange={(v) => {
                set("involves_children", v.includes("Involves children"));
                set("wwcc_required", v.includes("Working With Children Check required"));
              }}
            />
          </Field>
        </div>

        <Field label="Volunteer tasks">
          <Textarea rows={2} className="rounded-2xl" value={form.volunteer_tasks} onChange={(e) => set("volunteer_tasks", e.target.value)} />
        </Field>
        <Field label="Expected impact">
          <Textarea rows={2} className="rounded-2xl" value={form.expected_impact} onChange={(e) => set("expected_impact", e.target.value)} />
        </Field>

        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Relevant humanitarian issue">
            <Textarea rows={2} className="rounded-2xl" value={form.humanitarian_issue} onChange={(e) => set("humanitarian_issue", e.target.value)} />
          </Field>
          <Field label="Related child-rights topic">
            <Textarea rows={2} className="rounded-2xl" value={form.child_rights_topic} onChange={(e) => set("child_rights_topic", e.target.value)} />
          </Field>
          <Field label="Safety information">
            <Textarea rows={2} className="rounded-2xl" value={form.safety_info} onChange={(e) => set("safety_info", e.target.value)} />
          </Field>
          <Field label="Eligibility">
            <Textarea rows={2} className="rounded-2xl" value={form.eligibility} onChange={(e) => set("eligibility", e.target.value)} />
          </Field>
        </div>

        <Field label="Event image URL">
          <Input className="h-12 rounded-2xl" value={form.image_url} onChange={(e) => set("image_url", e.target.value)} />
        </Field>

        <div className="flex flex-wrap gap-3 pt-2">
          <Button className="h-12 rounded-2xl" disabled={saving || !form.title} onClick={() => save("published")}>
            {saving ? "Saving…" : editing ? "Save & publish" : "Publish event"}
          </Button>
          <Button variant="outline" className="h-12 rounded-2xl" disabled={saving || !form.title} onClick={() => save("draft")}>
            Save as draft
          </Button>
          <Button variant="ghost" className="h-12 rounded-2xl" onClick={() => navigate("/org/events")}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}