"use client";

import { Bell } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function Navbar() {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6">
      <div className="flex flex-1 items-center justify-end space-x-4">
        {/* Notifikasi Bell */}
        <button className="relative rounded-full bg-white p-1 text-slate-400 hover:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
          <span className="sr-only">Lihat notifikasi</span>
          <Bell className="h-6 w-6" aria-hidden="true" />
          {/* Badge Alert Hedon dummy */}
          <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
        </button>

        {/* User Profile Dummy */}
        <div className="flex items-center space-x-3">
          <div className="flex flex-col text-right">
            <span className="text-sm font-medium text-slate-900">Mahasiswa Demo</span>
            <span className="text-xs text-slate-500">demo@fintrack.com</span>
          </div>
          <div className="h-10 w-10 overflow-hidden rounded-full bg-indigo-100 flex items-center justify-center">
            <span className="text-indigo-800 font-semibold">MD</span>
          </div>
        </div>
      </div>
    </header>
  );
}
