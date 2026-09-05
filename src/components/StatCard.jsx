import React from "react";

export default function StatCard({ label, value, icon: Icon, tone = "primary" }) {
  const tones = {
    primary: "bg-accent text-primary",
    green: "bg-[#DCFCE7] text-[#16A34A]",
    gold: "bg-[#FEF3C7] text-[#B45309]",
    slate: "bg-secondary text-muted-foreground",
  };
  return (
    <div className="rounded-3xl bg-card p-4 soft-shadow">
      {Icon && (
        <div className={`mb-3 inline-flex h-9 w-9 items-center justify-center rounded-2xl ${tones[tone]}`}>
          <Icon className="h-4.5 w-4.5" />
        </div>
      )}
      <p className="text-2xl font-extrabold leading-none text-foreground">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{label}</p>
    </div>
  );
}