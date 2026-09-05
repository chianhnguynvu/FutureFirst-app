import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import { Home, Compass, BookOpen, TrendingUp, User } from "lucide-react";

const items = [
  { to: "/", label: "Home", icon: Home },
  { to: "/discover", label: "Discover", icon: Compass },
  { to: "/learn", label: "Learn", icon: BookOpen },
  { to: "/impact", label: "Impact", icon: TrendingUp },
  { to: "/profile", label: "Profile", icon: User },
];

export default function VolunteerLayout() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-lg pb-28">
        <Outlet />
      </div>
      <nav className="fixed bottom-0 left-0 right-0 border-t border-border bg-card/95 backdrop-blur">
        <div className="mx-auto flex max-w-lg items-stretch justify-between px-2 py-1.5">
          {items.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                `flex min-h-[56px] flex-1 flex-col items-center justify-center gap-1 rounded-2xl px-1 text-[11px] font-medium transition-colors ${
                  isActive ? "text-primary bg-accent" : "text-muted-foreground"
                }`
              }
            >
              <Icon className="h-5 w-5" strokeWidth={2} />
              {label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}