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
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Transaksi", href: "/transactions", icon: ArrowLeftRight },
  { name: "Arus Kas", href: "/cashflow", icon: TrendingUp },
  { name: "Statistik", href: "/statistics", icon: PieChart },
  { name: "Anggaran (Budget)", href: "/budget", icon: Wallet },
  { name: "E-Statement", href: "/e-statement", icon: FileText },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col bg-white border-r border-slate-200">
      <div className="flex h-16 shrink-0 items-center px-6 border-b border-slate-200">
        <h1 className="text-xl font-bold text-indigo-600">FinTrack</h1>
      </div>
      <div className="flex flex-1 flex-col overflow-y-auto">
        <nav className="flex-1 space-y-1 px-4 py-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  isActive
                    ? "bg-indigo-50 text-indigo-600"
                    : "text-slate-700 hover:bg-slate-50 hover:text-indigo-600",
                  "group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors"
                )}
              >
                <item.icon
                  className={cn(
                    isActive ? "text-indigo-600" : "text-slate-400 group-hover:text-indigo-600",
                    "mr-3 h-5 w-5 shrink-0 transition-colors"
                  )}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-slate-200 p-4">
          <button
            onClick={() => alert("Logout logic to be implemented with NextAuth")}
            className="group flex w-full items-center rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut className="mr-3 h-5 w-5 shrink-0 text-slate-400 group-hover:text-red-600 transition-colors" />
            Keluar
          </button>
        </div>
      </div>
    </div>
  );
}
