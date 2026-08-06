"use client";

import React from "react";
import { User } from "lucide-react";

const mock = [
  { name: "GrandMaster", rating: 1200 },
  { name: "Sherzodbek", rating: 1105 },
  { name: "Muhammadali", rating: 1020 },
  { name: "Rustamov", rating: 980 },
  { name: "Nodirbek", rating: 950 },
];

export const OnlineUsers: React.FC = () => {
  return (
    <section className="bg-[#071019] p-4 rounded-2xl border border-slate-800">
      <h4 className="text-sm font-semibold">Online foydalanuvchilar</h4>
      <div className="mt-3 space-y-2">
        {mock.map((u) => (
          <div key={u.name} className="flex items-center justify-between bg-[#061018] p-2 rounded-md">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-amber-500 rounded-full flex items-center justify-center text-white">
                <User size={14} />
              </div>
              <div>
                <div className="text-sm font-medium">{u.name}</div>
                <div className="text-xs text-slate-400">{u.rating} • ● Online</div>
              </div>
            </div>
            <div className="text-xs text-amber-400">{u.rating}</div>
          </div>
        ))}
      </div>
    </section>
  );
};
