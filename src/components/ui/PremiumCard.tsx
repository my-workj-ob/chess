"use client";

import React from "react";
import { Crown } from "lucide-react";

export const PremiumCard: React.FC = () => {
  return (
    <div className="bg-gradient-to-br from-[#0f0720] to-[#111827] p-4 rounded-2xl border border-slate-800 flex items-center gap-3">
      <div className="p-3 bg-amber-500/10 rounded-lg">
        <Crown size={18} className="text-amber-400" />
      </div>
      <div>
        <div className="text-sm font-semibold">Premiumga o'ting</div>
        <div className="text-xs text-slate-400">Cheksiz imkoniyatlar va eksklyuziv bonuslar</div>
      </div>
    </div>
  );
};
