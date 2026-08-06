"use client";

import React from "react";
import { Plus, Lock } from "lucide-react";

export const CreateGameCard: React.FC = () => {
  return (
    <section className="bg-[#071019] p-5 rounded-2xl border border-slate-800">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Yangi o'yin</h2>
        <div className="text-sm text-slate-400">Reyting: 1170</div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <button className="col-span-2 bg-violet-600 text-white py-3 rounded-lg flex items-center justify-center gap-2 hover:brightness-110">
          <Plus size={16} /> Yangi o'yin yaratish
        </button>

        <button className="flex items-center justify-center gap-2 bg-[#0F1724] text-slate-200 py-2 rounded-lg">
          <span className="px-2 py-1 bg-slate-800 rounded">Ochik</span>
        </button>
        <button className="flex items-center justify-center gap-2 bg-[#0F1724] text-slate-200 py-2 rounded-lg">
          <Lock size={14} /> Yopiq
        </button>

        <input placeholder="O'yinga kod kiriting..." className="col-span-2 mt-3 px-3 py-2 rounded bg-[#061018] border border-slate-800 text-sm" />
      </div>
    </section>
  );
};
