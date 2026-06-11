"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ArrowLeftRight,
  TrendingUp,
  PieChart,
  Wallet,
  FileText,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useFinTrackStore } from "@/lib/store";
import { useState } from "react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Transaksi", href: "/transactions", icon: ArrowLeftRight },
  { name: "Arus Kas", href: "/cashflow", icon: TrendingUp },
  { name: "Statistik", href: "/statistics", icon: PieChart },
  { name: "Anggaran", href: "/budget", icon: Wallet },
  { name: "E-Statement", href: "/e-statement", icon: FileText },
];

export function Sidebar() {
  const pathname = usePathname();
  const getCategoryAlerts = useFinTrackStore((s) => s.getCategoryAlerts);
  const getAlertLevel = useFinTrackStore((s) => s.getAlertLevel);
  const categoryAlerts = getCategoryAlerts();
  const alertLevel = getAlertLevel();

  return (
    <div className="flex h-full w-64 flex-col bg-white border-r border-slate-200">
      {/* Logo */}
      <div className="flex h-16 shrink-0 items-center px-6 border-b border-slate-200">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">F</span>
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            FinTrack
          </h1>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 px-4 py-4 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
          // Badge untuk halaman Budget jika ada alert
          const showBadge = item.href === "/budget" && (categoryAlerts.length > 0 || alertLevel.level !== "SAFE");
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                isActive
                  ? "bg-indigo-50 text-indigo-600 shadow-sm"
                  : "text-slate-600 hover:bg-slate-50 hover:text-indigo-600",
                "group flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all"
              )}
            >
              <item.icon
                className={cn(
                  isActive ? "text-indigo-600" : "text-slate-400 group-hover:text-indigo-500",
                  "mr-3 h-5 w-5 shrink-0 transition-colors"
                )}
              />
              <span className="flex-1">{item.name}</span>
              {showBadge && (
                <span className={cn(
                  "ml-2 px-1.5 py-0.5 rounded-full text-[10px] font-bold",
                  alertLevel.level === "CRITICAL" ? "bg-red-500 text-white" :
                  alertLevel.level === "DANGER" ? "bg-orange-500 text-white" :
                  "bg-amber-400 text-amber-900"
                )}>
                  !
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="border-t border-slate-200 p-4">
        <button className="group flex w-full items-center rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all">
          <LogOut className="mr-3 h-5 w-5 shrink-0 text-slate-400 group-hover:text-red-500 transition-colors" />
          Keluar
        </button>
      </div>
    </div>
  );
}

/**
 * Sidebar mobile: toggle via hamburger menu di Navbar
 */
export function MobileSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const getAlertLevel = useFinTrackStore((s) => s.getAlertLevel);
  const getCategoryAlerts = useFinTrackStore((s) => s.getCategoryAlerts);
  const alertLevel = getAlertLevel();
  const categoryAlerts = getCategoryAlerts();

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      <div className="fixed inset-y-0 left-0 w-64 z-50 bg-white shadow-xl">
        <div className="flex h-16 items-center justify-between px-6 border-b border-slate-200">
          <h1 className="text-xl font-bold text-indigo-600">FinTrack</h1>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-slate-100">
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>
        <nav className="space-y-1 px-4 py-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            const showBadge = item.href === "/budget" && (categoryAlerts.length > 0 || alertLevel.level !== "SAFE");
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={cn(
                  isActive ? "bg-indigo-50 text-indigo-600" : "text-slate-600 hover:bg-slate-50",
                  "flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all"
                )}
              >
                <item.icon className={cn(isActive ? "text-indigo-600" : "text-slate-400", "mr-3 h-5 w-5")} />
                <span className="flex-1">{item.name}</span>
                {showBadge && (
                  <span className="ml-2 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-red-500 text-white">!</span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}
