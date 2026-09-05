export const CAUSES = [
  "Child Rights",
  "Education",
  "Food Insecurity",
  "Refugee Support",
  "Humanitarian Relief",
  "Climate Action",
  "Mental Health",
  "Online Safety",
  "Emergency Relief",
  "Fundraising",
  "Community Support",
];

export const SKILLS = [
  "Event Support",
  "Social Media",
  "Photography",
  "Graphic Design",
  "Public Speaking",
  "Administration",
  "Fundraising",
  "Technology",
  "Research",
  "Leadership",
];

export const AVAILABILITY = [
  "Weekday morning",
  "Weekday afternoon",
  "Weekday evening",
  "Weekend",
];

export const EVENT_TYPES = ["In person", "Online", "Either"];

export const LEVELS = [
  { name: "Explorer", min: 0 },
  { name: "Advocate", min: 150 },
  { name: "Changemaker", min: 400 },
  { name: "Impact Leader", min: 800 },
];

export function levelFor(score = 0) {
  const current = [...LEVELS].reverse().find((l) => score >= l.min) || LEVELS[0];
  const next = LEVELS[LEVELS.indexOf(current) + 1];
  const span = next ? next.min - current.min : 1;
  const progress = next ? Math.round(((score - current.min) / span) * 100) : 100;
  return { current: current.name, next: next?.name || null, progress };
}

export const ACHIEVEMENTS = [
  { id: "first_event", label: "First Event", hint: "Complete your first event" },
  { id: "hours_5", label: "5 Volunteer Hours", hint: "Contribute 5 hours" },
  { id: "hours_10", label: "10 Volunteer Hours", hint: "Contribute 10 hours" },
  { id: "first_module", label: "First Learning Module", hint: "Finish a module" },
  { id: "child_rights_explorer", label: "Child Rights Explorer", hint: "Learn about child rights" },
  { id: "community_supporter", label: "Community Supporter", hint: "Support a community cause" },
  { id: "repeat_volunteer", label: "Repeat Volunteer", hint: "Volunteer more than once" },
];

/** Transparent, explainable matching — no hidden scoring. */
export function matchEvent(event, profile, history = [], completedCauses = []) {
  if (!profile) return { score: 60, reasons: [] };
  const reasons = [];
  let score = 45;

  if ((profile.interests || []).includes(event.cause)) {
    score += 25;
    reasons.push(`You're interested in ${event.cause.toLowerCase()}.`);
  }
  if ((profile.availability || []).includes(event.availability_tag)) {
    score += 15;
    reasons.push(`You're available on ${event.availability_tag.toLowerCase()}s.`);
  }
  const skillMatch = (event.required_skills || []).filter((s) => (profile.skills || []).includes(s));
  if (skillMatch.length) {
    score += 12;
    reasons.push(`Your ${skillMatch[0].toLowerCase()} skill fits this role.`);
  }
  if (profile.location && event.location && event.location.toLowerCase().includes(profile.location.toLowerCase())) {
    score += 8;
    reasons.push(`It's near ${profile.location}.`);
  }
  if (profile.preferred_event_type && profile.preferred_event_type !== "Either" && profile.preferred_event_type === event.event_type) {
    score += 5;
    reasons.push(`You prefer ${event.event_type.toLowerCase()} volunteering.`);
  }
  if (history.some((r) => r.cause === event.cause)) {
    score += 5;
    reasons.push(`You've volunteered for this cause before.`);
  }
  if (completedCauses.includes(event.cause)) {
    score += 5;
    reasons.push(`You completed a learning module on this topic.`);
  }
  const buildMatch = (event.skills_practised || []).filter((s) => (profile.skills_to_build || []).includes(s));
  if (buildMatch.length) {
    score += 10;
    reasons.push(`This event helps you practise ${buildMatch.slice(0, 2).join(" and ")}.`);
  }
  return { score: Math.min(99, score), reasons };
}

export function greeting(d = new Date()) {
  const h = d.getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}