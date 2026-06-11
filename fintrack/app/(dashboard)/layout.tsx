"use client";

import { useState, useEffect } from "react";
import { Sidebar, MobileSidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import { useFinTrackStore } from "@/lib/store";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { fetchInitialData, isInitialized } = useFinTrackStore();

  useEffect(() => {
    if (!isInitialized) {
      fetchInitialData();
    }
  }, [fetchInitialData, isInitialized]);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar Desktop */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-50">
        <Sidebar />
      </div>

      {/* Sidebar Mobile */}
      <MobileSidebar open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      {/* Main Content */}
      <div className="flex flex-col flex-1 md:pl-64 w-full h-full">
        <Navbar onMenuClick={() => setMobileMenuOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
