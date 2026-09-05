/** Transferable skills language: we record verified *experiences*, never fake skill scores. */
export const TRANSFERABLE_SKILLS = [
  "Communication",
  "Teamwork",
  "Leadership",
  "Problem Solving",
  "Event Management",
  "Fundraising",
  "Public Speaking",
  "Social Media",
  "Administration",
  "Project Coordination",
  "Community Engagement",
  "Research",
  "Digital Skills",
];

export const CAREER_INTERESTS = [
  "Marketing",
  "Business",
  "Consulting",
  "Data",
  "Technology",
  "Project Management",
  "Community Services",
  "Education",
  "Leadership",
  "Design",
  "Communications",
];

export const SKILL_BADGES = [
  { id: "community_starter", label: "Community Starter", skill: "Community Engagement", required: 1 },
  { id: "team_player", label: "Team Player", skill: "Teamwork", required: 3 },
  { id: "advocate", label: "Advocate", skill: "Communication", required: 3 },
  { id: "emerging_leader", label: "Emerging Leader", skill: "Leadership", required: 2 },
  { id: "event_champion", label: "Event Champion", skill: "Event Management", required: 3 },
  { id: "voice_for_change", label: "Voice for Change", skill: "Public Speaking", required: 2 },
];

/** Verified experience count per skill. */
export function skillCounts(records = []) {
  return records.reduce((acc, r) => {
    if (!r.skill) return acc;
    acc[r.skill] = (acc[r.skill] || 0) + 1;
    return acc;
  }, {});
}

export function badgeProgress(records = []) {
  const counts = skillCounts(records);
  return SKILL_BADGES.map((b) => {
    const count = Math.min(counts[b.skill] || 0, b.required);
    return {
      ...b,
      count,
      earned: count >= b.required,
      remaining: Math.max(0, b.required - count),
      percent: Math.round((count / b.required) * 100),
    };
  });
}

/** The next badge the volunteer is closest to unlocking (but hasn't yet). */
export function nextBadge(records = []) {
  return badgeProgress(records)
    .filter((b) => !b.earned)
    .sort((a, b) => a.remaining - b.remaining || b.count - a.count)[0];
}

/** Skills the volunteer said they want to build, plus the next badge's skill. */
export function growthSkills(profile, records = []) {
  const wanted = new Set(profile?.skills_to_build || []);
  const badge = nextBadge(records);
  if (badge) wanted.add(badge.skill);
  return [...wanted];
}

export function eventBuildSkills(event) {
  return event?.skills_practised || [];
}