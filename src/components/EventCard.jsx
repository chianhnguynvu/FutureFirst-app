import React from "react";
import { Link } from "react-router-dom";
import { Image } from "@/components/ui/image";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, MapPin, Clock, ShieldCheck, Users } from "lucide-react";
import { format } from "date-fns";

export default function EventCard({ event, match }) {
  const spots = Math.max(0, (event.capacity || 0) - (event.spots_taken || 0));
  return (
    <Link
      to={`/event/${event.id}`}
      className="block overflow-hidden rounded-3xl bg-card soft-shadow transition-transform active:scale-[0.99]"
    >
      <div className="relative aspect-video w-full overflow-hidden bg-muted">
        {event.image_url && (
          <Image
            src={event.image_url}
            alt={event.title}
            fittingType="fill"
            focalPointX={0.5}
            focalPointY={0.5}
            className="absolute inset-0 h-full w-full"
          />
        )}
        <div className="absolute left-3 top-3 flex gap-2">
          <Badge className="bg-white/95 text-foreground hover:bg-white">{event.cause}</Badge>
          {event.verified && (
            <Badge className="gap-1 bg-primary text-primary-foreground hover:bg-primary">
              <ShieldCheck className="h-3 w-3" /> Verified
            </Badge>
          )}
        </div>
        {match && (
          <div className="absolute bottom-3 right-3 rounded-full bg-[#F59E0B] px-3 py-1 text-xs font-bold text-white">
            {match}% Match
          </div>
        )}
      </div>
      <div className="space-y-2 p-4">
        <p className="text-xs font-medium text-muted-foreground">{event.organisation_name}</p>
        <h3 className="text-base font-bold leading-snug text-foreground">{event.title}</h3>
        <p className="line-clamp-2 text-sm text-muted-foreground">{event.description}</p>
        <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <CalendarDays className="h-3.5 w-3.5" />
            {event.date ? format(new Date(event.date), "EEE d MMM") : "TBC"}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {event.start_time}–{event.end_time} · {event.volunteer_hours}h
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            {event.location}
          </span>
          <span className="flex items-center gap-1 font-medium text-[#16A34A]">
            <Users className="h-3.5 w-3.5" />
            {spots} spots left
          </span>
        </div>
        {!!(event.required_skills || []).length && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {event.required_skills.map((s) => (
              <span key={s} className="rounded-full bg-secondary px-2.5 py-1 text-[11px] text-muted-foreground">
                {s}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}