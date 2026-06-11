"use client";

import { Bell, Menu } from "lucide-react";
import { useFinTrackStore } from "@/lib/store";

export function Navbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const getAlertLevel = useFinTrackStore((s) => s.getAlertLevel);
  const getCategoryAlerts = useFinTrackStore((s) => s.getCategoryAlerts);
  const alertLevel = getAlertLevel();
  const categoryAlerts = getCategoryAlerts();
  const totalAlerts = (alertLevel.level !== "SAFE" ? 1 : 0) + categoryAlerts.length;

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
      {/* Mobile menu button */}
      <button
        onClick={onMenuClick}
        className="md:hidden p-2 rounded-md text-slate-500 hover:bg-slate-100"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="flex-1" />

      <div className="flex items-center space-x-4">
        {/* Notifikasi */}
        <button className="relative rounded-full p-2 text-slate-400 hover:text-slate-500 hover:bg-slate-100 transition-colors">
          <Bell className="h-5 w-5" />
          {totalAlerts > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
              {totalAlerts}
            </span>
          )}
        </button>

        {/* User */}
        <div className="flex items-center space-x-3">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-sm font-medium text-slate-900">Mahasiswa</span>
            <span className="text-xs text-slate-500">demo@fintrack.com</span>
          </div>
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center shadow-sm">
            <span className="text-white font-semibold text-sm">M</span>
          </div>
        </div>
      </div>
    </header>
  );
}
