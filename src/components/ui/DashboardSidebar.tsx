"use client";

import React from "react";
import { Home, Users, ShieldCheck, Calendar, Settings } from "lucide-react";

export const DashboardSidebar: React.FC = () => {
  const items = [
    { icon: <Home size={16} />, label: "Bosh sahifa" },
    { icon: <Users size={16} />, label: "Online o'yin" },
    { icon: <ShieldCheck size={16} />, label: "Bot AI" },
    { icon: <Calendar size={16} />, label: "Musobaqalar" },
    { icon: <Settings size={16} />, label: "Sozlamalar" },
  ];

  return (
    <nav className="bg-[#071019] p-4 rounded-xl border border-slate-800">
      <ul className="space-y-2">
        {items.map((it) => (
          <li key={it.label}>
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#0f1724] transition">
              <span className="text-slate-300">{it.icon}</span>
              <span className="text-sm font-medium">{it.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
};
