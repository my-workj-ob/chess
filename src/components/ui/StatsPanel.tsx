"use client";

import React from "react";

export const StatsPanel: React.FC = () => {
  return (
    <section className="bg-[#071019] p-5 rounded-2xl border border-slate-800">
      <h3 className="text-base font-semibold">Statistikalar</h3>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="bg-[#061018] p-3 rounded-lg text-center">
          <div className="text-2xl font-bold">0</div>
          <div className="text-xs text-slate-400">Bugungi o'yinlar</div>
        </div>
        <div className="bg-[#061018] p-3 rounded-lg text-center">
          <div className="text-2xl font-bold">0%</div>
          <div className="text-xs text-slate-400">G'alaba foizi</div>
        </div>
        <div className="bg-[#061018] p-3 rounded-lg text-center">
          <div className="text-2xl font-bold">1170</div>
          <div className="text-xs text-slate-400">Reyting</div>
        </div>
        <div className="bg-[#061018] p-3 rounded-lg text-center">
          <div className="text-2xl font-bold">0</div>
          <div className="text-xs text-slate-400">Eng uzun seriya</div>
        </div>
      </div>
    </section>
  );
};
