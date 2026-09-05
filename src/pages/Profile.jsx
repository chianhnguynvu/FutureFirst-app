import React, { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { format } from "date-fns";
import {
  Pencil, LogOut, ShieldCheck, Eye, FileText, GraduationCap, MapPin, LayoutDashboard, Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import ChipSelect from "@/components/ChipSelect";
import { CAUSES, SKILLS, AVAILABILITY, levelFor } from "@/lib/futurefirst";
import { useProfile, useRegistrations, useProgress, useRefresh } from "@/hooks/useVolunteer";

export default function Profile() {
  const { data: profile } = useProfile();
  const { data: regs = [] } = useRegistrations();
  const { data: progress = [] } = useProgress();
  const refresh = useRefresh();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(null);

  if (!profile) return <div className="p-6 text-muted-foreground">Loading…</div>;

  const level = levelFor(profile.learning_score || 0);
  const completedModules = progress.filter((p) => p.completed);
  const history = regs.filter((r) => r.status !== "cancelled");

  const startEdit = () => {
    setForm({
      full_name: profile.full_name || "",
      bio: profile.bio || "",
      university: profile.university || "",
      study_area: profile.study_area || "",
      location: profile.location || "",
      volunteer_experience: profile.volunteer_experience || "",
      interests: profile.interests || [],
      skills: profile.skills || [],
      availability: profile.availability || [],
    });
    setEditing(true);
  };

  const save = async () => {
    setSaving(true);
    await base44.entities.VolunteerProfile.update(profile.id, form);
    refresh(["profile"]);
    setSaving(false);
    setEditing(false);
  };

  const uploadCV = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    await base44.entities.VolunteerProfile.update(profile.id, { cv_url: file_url, cv_summary: file.name });
    refresh(["profile"]);
  };

  const toggleVisibility = async (v) => {
    await base44.entities.VolunteerProfile.update(profile.id, {
      profile_visibility: v ? "organisations" : "private",
    });
    refresh(["profile"]);
  };

  const Card = ({ title, children, action }) => (
    <section className="mt-4 rounded-3xl bg-card p-5 soft-shadow">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-foreground">{title}</h2>
        {action}
      </div>
      <div className="mt-3">{children}</div>
    </section>
  );

  const Tags = ({ items }) => (
    <div className="flex flex-wrap gap-2">
      {(items || []).length ? (
        items.map((i) => (
          <span key={i} className="rounded-full bg-secondary px-3 py-1.5 text-xs font-medium text-foreground">
            {i}
          </span>
        ))
      ) : (
        <p className="text-sm text-muted-foreground">Not added yet</p>
      )}
    </div>
  );

  if (editing) {
    return (
      <div className="px-5 pt-6">
        <h1 className="text-2xl font-extrabold text-foreground">Edit profile</h1>
        <div className="mt-5 space-y-4">
          {[
            ["full_name", "Full name"],
            ["university", "University"],
            ["study_area", "Study area"],
            ["location", "Location"],
          ].map(([k, label]) => (
            <div key={k}>
              <p className="mb-1.5 text-sm font-semibold">{label}</p>
              <Input
                className="h-13 rounded-2xl h-[52px] text-base"
                value={form[k]}
                onChange={(e) => setForm({ ...form, [k]: e.target.value })}
              />
            </div>
          ))}
          <div>
            <p className="mb-1.5 text-sm font-semibold">Short bio</p>
            <Textarea
              rows={3}
              className="rounded-2xl text-base"
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
            />
          </div>
          <div>
            <p className="mb-1.5 text-sm font-semibold">Volunteer experience</p>
            <Textarea
              rows={3}
              className="rounded-2xl text-base"
              value={form.volunteer_experience}
              onChange={(e) => setForm({ ...form, volunteer_experience: e.target.value })}
            />
          </div>
          <div>
            <p className="mb-2 text-sm font-semibold">Causes you care about</p>
            <ChipSelect options={CAUSES} value={form.interests} onChange={(v) => setForm({ ...form, interests: v })} />
          </div>
          <div>
            <p className="mb-2 text-sm font-semibold">Skills</p>
            <ChipSelect options={SKILLS} value={form.skills} onChange={(v) => setForm({ ...form, skills: v })} />
          </div>
          <div>
            <p className="mb-2 text-sm font-semibold">Availability</p>
            <ChipSelect
              options={AVAILABILITY}
              value={form.availability}
              onChange={(v) => setForm({ ...form, availability: v })}
            />
          </div>
        </div>
        <div className="mt-6 space-y-3">
          <Button className="h-14 w-full rounded-2xl text-base font-semibold" onClick={save} disabled={saving}>
            {saving ? "Saving…" : "Save changes"}
          </Button>
          <Button variant="ghost" className="h-12 w-full rounded-2xl" onClick={() => setEditing(false)}>
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-5 pt-6">
      <div className="flex items-start gap-4">
        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-3xl bg-accent">
          {profile.photo_url ? (
            <img src={profile.photo_url} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-2xl font-extrabold text-primary">
              {(profile.full_name || "V").charAt(0)}
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-extrabold leading-tight text-foreground">
            {profile.full_name || "Your name"}
          </h1>
          <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
            <GraduationCap className="h-3.5 w-3.5" /> {profile.university || "Add university"}
            {profile.study_area ? ` · ${profile.study_area}` : ""}
          </p>
          <p className="mt-0.5 flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" /> {profile.location || "Add location"}
          </p>
        </div>
        <Button variant="outline" size="icon" className="h-11 w-11 rounded-2xl" onClick={startEdit} aria-label="Edit profile">
          <Pencil className="h-4 w-4" />
        </Button>
      </div>

      {profile.bio && <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{profile.bio}</p>}

      <div className="mt-5 grid grid-cols-3 gap-3">
        {[
          { v: profile.volunteer_hours || 0, l: "hours" },
          { v: profile.events_completed || 0, l: "events" },
          { v: completedModules.length, l: "modules" },
        ].map((s) => (
          <div key={s.l} className="rounded-3xl bg-card p-4 text-center soft-shadow">
            <p className="text-xl font-extrabold text-primary">{s.v}</p>
            <p className="text-xs text-muted-foreground">{s.l}</p>
          </div>
        ))}
      </div>

      <Card title="Learning progress">
        <p className="text-sm font-bold text-primary">{level.current}</p>
        <Progress value={level.progress} className="mt-2 h-2" />
        <p className="mt-2 text-xs text-muted-foreground">
          {level.next ? `${level.progress}% towards ${level.next}` : "Highest level reached"}
        </p>
      </Card>

      <Card title="Causes you care about"><Tags items={profile.interests} /></Card>
      <Card title="Skills"><Tags items={profile.skills} /></Card>
      <Card title="Availability"><Tags items={profile.availability} /></Card>

      <Card title="Volunteer experience">
        <p className="text-sm text-muted-foreground">
          {profile.volunteer_experience || "Add a short summary of what you've done before."}
        </p>
      </Card>

      <Card title="CV">
        {profile.cv_url ? (
          <a
            href={profile.cv_url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 text-sm font-semibold text-primary"
          >
            <FileText className="h-4 w-4" /> {profile.cv_summary || "View CV"}
          </a>
        ) : (
          <label className="flex min-h-[48px] cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-border text-sm font-medium text-muted-foreground">
            <Upload className="h-4 w-4" /> Upload CV (optional)
            <input type="file" className="hidden" onChange={uploadCV} />
          </label>
        )}
      </Card>

      <Card title="Event history">
        {history.length ? (
          <div className="space-y-3">
            {history.map((r) => (
              <Link key={r.id} to={`/event/${r.event_id}`} className="block">
                <p className="text-sm font-bold text-foreground">{r.event_title}</p>
                <p className="text-xs text-muted-foreground">
                  {r.event_date ? format(new Date(r.event_date), "d MMM yyyy") : ""} ·{" "}
                  {r.status === "attended" ? `${r.hours} hours completed` : r.status}
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">You haven't joined an event yet.</p>
        )}
      </Card>

      <Card title="Privacy & safety">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
              <Eye className="h-4 w-4" /> Share profile with organisations
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              When off, organisers only see your name for events you join.
            </p>
          </div>
          <Switch
            checked={profile.profile_visibility === "organisations"}
            onCheckedChange={toggleVisibility}
          />
        </div>
        <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
          <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
          We collect the minimum needed to match you with opportunities. Recommendations are generated from
          the preferences you choose, and are always labelled. You can delete your preferences any time.
        </p>
      </Card>

      <Link
        to="/org"
        className="mt-4 flex min-h-[52px] items-center gap-2 rounded-3xl bg-card px-5 font-semibold text-primary soft-shadow"
      >
        <LayoutDashboard className="h-4 w-4" /> Organisation dashboard
      </Link>

      <Button
        variant="ghost"
        className="mt-3 h-12 w-full rounded-2xl text-muted-foreground"
        onClick={() => base44.auth.logout()}
      >
        <LogOut className="mr-2 h-4 w-4" /> Sign out
      </Button>
    </div>
  );
}