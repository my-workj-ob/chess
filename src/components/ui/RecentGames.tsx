"use client";

import React from "react";

const mock = [
  { vs: "Sherzodbek", result: "Mag'lubiyat", change: "-20" },
  { vs: "Rustamov", result: "G'alaba", change: "+15" },
  { vs: "Nodirbek", result: "Durang", change: "+0" },
];

export const RecentGames: React.FC = () => {
  return (
    <section className="bg-[#071019] p-4 rounded-2xl border border-slate-800">
      <h4 className="text-sm font-semibold">So'ngi o'yinlar</h4>
      <div className="mt-3 space-y-2">
        {mock.map((g, i) => (
          <div key={i} className="flex items-center justify-between bg-[#061018] p-2 rounded-md">
            <div>
              <div className="text-sm">vs {g.vs}</div>
              <div className="text-xs text-slate-400">2 soat oldin</div>
            </div>
            <div className={`text-sm ${g.result === "G'alaba" ? 'text-green-400' : g.result === "Mag'ubiyat" ? 'text-rose-400' : 'text-slate-300'}`}>
              {g.result} {g.change}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
