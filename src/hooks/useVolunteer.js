import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export function useMe() {
  return useQuery({ queryKey: ["me"], queryFn: () => base44.auth.me() });
}

export function useProfile() {
  const { data: me } = useMe();
  return useQuery({
    queryKey: ["profile", me?.email],
    enabled: !!me?.email,
    queryFn: async () => {
      const found = await base44.entities.VolunteerProfile.filter({ user_email: me.email });
      if (found.length) return found[0];
      return base44.entities.VolunteerProfile.create({
        user_email: me.email,
        full_name: me.full_name || "",
      });
    },
  });
}

export function useRegistrations() {
  const { data: me } = useMe();
  return useQuery({
    queryKey: ["registrations", me?.email],
    enabled: !!me?.email,
    queryFn: () => base44.entities.Registration.filter({ volunteer_email: me.email }, "-event_date"),
  });
}

export function useEvents() {
  return useQuery({
    queryKey: ["events"],
    queryFn: () => base44.entities.Event.filter({ status: "published" }, "date"),
  });
}

export function useModules() {
  return useQuery({ queryKey: ["modules"], queryFn: () => base44.entities.LearningModule.list() });
}

export function useProgress() {
  const { data: me } = useMe();
  return useQuery({
    queryKey: ["progress", me?.email],
    enabled: !!me?.email,
    queryFn: () => base44.entities.ModuleProgress.filter({ volunteer_email: me.email }),
  });
}

export function useRefresh() {
  const qc = useQueryClient();
  return (keys) => keys.forEach((k) => qc.invalidateQueries({ queryKey: [k] }));
}