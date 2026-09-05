import { base44 } from "@/api/base44Client";

/** Marks a registration attended/absent and keeps the volunteer's impact record in sync. */
export async function setAttendance(registration, status) {
  if (registration.status === status) return;
  await base44.entities.Registration.update(registration.id, { status });

  const profiles = await base44.entities.VolunteerProfile.filter({
    user_email: registration.volunteer_email,
  });
  const profile = profiles[0];
  if (!profile) return;

  const wasAttended = registration.status === "attended";
  const nowAttended = status === "attended";
  if (wasAttended === nowAttended) return;

  const sign = nowAttended ? 1 : -1;
  const hours = Math.max(0, (profile.volunteer_hours || 0) + sign * (registration.hours || 0));
  const events = Math.max(0, (profile.events_completed || 0) + sign);

  const achievements = new Set(profile.achievements || []);
  if (nowAttended) {
    achievements.add("first_event");
    if (hours >= 5) achievements.add("hours_5");
    if (hours >= 10) achievements.add("hours_10");
    if (events >= 2) achievements.add("repeat_volunteer");
    if (registration.cause === "Community Support") achievements.add("community_supporter");
  }

  await base44.entities.VolunteerProfile.update(profile.id, {
    volunteer_hours: hours,
    events_completed: events,
    streak: nowAttended ? (profile.streak || 0) + 1 : Math.max(0, (profile.streak || 0) - 1),
    achievements: [...achievements],
  });
}

export async function issueCertificate(registration, organisationName, extra = {}) {
  return base44.entities.Certificate.create({
    volunteer_email: registration.volunteer_email,
    volunteer_name: registration.volunteer_name,
    event_id: registration.event_id,
    event_title: registration.event_title,
    organisation_name: organisationName || "FutureFirst Partner",
    hours: extra.hours ?? registration.hours,
    role: extra.role,
    skills_demonstrated: extra.skills || [],
    feedback: extra.feedback,
    issued_date: new Date().toISOString().slice(0, 10),
    verification_code: `FF-${new Date().getFullYear()}-${registration.id.slice(-5).toUpperCase()}`,
  });
}

/**
 * Organiser verification: confirms attendance + hours, records verified skill
 * experiences and issues the event certificate.
 */
export async function verifyParticipation(registration, event, { hours, role, skills = [], feedback }) {
  const verifiedHours = Number(hours) || 0;
  await base44.entities.Registration.update(registration.id, { hours: verifiedHours });
  await setAttendance({ ...registration, hours: verifiedHours }, "attended");

  if (skills.length) {
    await base44.entities.SkillRecord.bulkCreate(
      skills.map((skill) => ({
        volunteer_email: registration.volunteer_email,
        volunteer_name: registration.volunteer_name,
        skill,
        source: "event",
        event_id: registration.event_id,
        event_title: registration.event_title,
        organisation_name: event?.organisation_name,
        role,
        hours: verifiedHours,
        verified: true,
        verified_date: new Date().toISOString().slice(0, 10),
        note: feedback,
      }))
    );
  }

  return issueCertificate({ ...registration, hours: verifiedHours }, event?.organisation_name, {
    hours: verifiedHours,
    role,
    skills,
    feedback,
  });
}