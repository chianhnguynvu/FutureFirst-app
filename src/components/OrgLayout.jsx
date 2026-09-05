import React from "react";
import { NavLink, Outlet, Link } from "react-router-dom";
import { LayoutDashboard, CalendarDays, Users, ClipboardCheck, Megaphone, Smartphone } from "lucide-react";
import Brand from "@/components/Brand";

const items = [
  { to: "/org", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/org/events", label: "Events", icon: CalendarDays },
  { to: "/org/members", label: "Members", icon: Users },
  { to: "/org/attendance", label: "Attendance", icon: ClipboardCheck },
  { to: "/org/announcements", label: "Announcements", icon: Megaphone },
];

export default function OrgLayout() {
  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-card p-5 lg:flex">
        <Brand />
        <p className="mt-6 px-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Organisation
        </p>
        <nav className="mt-2 space-y-1">
          {items.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium ${
                  isActive ? "bg-accent text-primary" : "text-muted-foreground hover:bg-secondary"
                }`
              }
            >
              <Icon className="h-4 w-4" /> {label}
            </NavLink>
          ))}
        </nav>
        <Link
          to="/"
          className="mt-auto flex items-center gap-2 rounded-2xl px-3 py-2.5 text-sm text-muted-foreground hover:bg-secondary"
        >
          <Smartphone className="h-4 w-4" /> Volunteer app
        </Link>
      </aside>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between border-b border-border bg-card px-4 py-3 lg:hidden">
          <Brand />
          <Link to="/" className="text-sm font-medium text-primary">Volunteer app</Link>
        </div>
        <div className="flex gap-2 overflow-x-auto border-b border-border bg-card px-4 py-2 no-scrollbar lg:hidden">
          {items.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `whitespace-nowrap rounded-full px-3 py-2 text-sm font-medium ${
                  isActive ? "bg-accent text-primary" : "text-muted-foreground"
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </div>
        <main className="p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}