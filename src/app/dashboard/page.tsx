"use client";

import React from "react";
import { Header } from "../../components/ui/Header";
import { DashboardSidebar } from "../../components/ui/DashboardSidebar";
import { CreateGameCard } from "../../components/ui/CreateGameCard";
import { StatsPanel } from "../../components/ui/StatsPanel";
import { OnlineUsers } from "../../components/ui/OnlineUsers";
import { RecentGames } from "../../components/ui/RecentGames";
import { PremiumCard } from "../../components/ui/PremiumCard";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-[#070812] text-slate-200">
      <Header
        username={"Baxtiyor"}
        userRating={1170}
        soundEnabled={true}
        onToggleSound={() => {}}
        onChangeUser={() => {}}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-12 gap-6">
        <aside className="col-span-12 lg:col-span-3">
          <DashboardSidebar />
          <div className="mt-6">
            <PremiumCard />
          </div>
        </aside>

        <main className="col-span-12 lg:col-span-6 space-y-6">
          <CreateGameCard />
          <StatsPanel />
        </main>

        <aside className="col-span-12 lg:col-span-3 space-y-6">
          <OnlineUsers />
          <RecentGames />
        </aside>
      </div>
    </div>
  );
}
