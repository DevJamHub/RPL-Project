"use client";

import { PageWrapper } from "@/components/layout/PageWrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { formatIDR } from "@/lib/utils";
import { getIcon } from "@/lib/icons";
import { useFinTrackStore, EXPENSE_CATEGORIES } from "@/lib/store";
import { Wallet, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";

export default function BudgetPage() {
  const {
    globalBudget, setGlobalBudget,
    budgets, setBudget,
    getMonthExpense, getExpenseByCategory,
  } = useFinTrackStore();

  const now = new Date();
  const cm = now.getMonth() + 1;
  const cy = now.getFullYear();
  const totalExpense = getMonthExpense(cm, cy);
  const expenseByCategory = getExpenseByCategory(cm, cy);

  // Global budget percentage
  const globalPct = globalBudget > 0 ? (totalExpense / globalBudget) * 100 : 0;

  // ===== HANDLERS =====
  const handleSaveGlobal = (value: string) => {
    const num = parseInt(value.replace(/\D/g, ""));
    if (!isNaN(num) && num > 0) {
      setGlobalBudget(num);
      toast.success(`Batas bulanan diset ke ${formatIDR(num)}`);
    }
  };

  const handleSaveCategory = (name: string, value: string) => {
    const num = parseInt(value.replace(/\D/g, ""));
    if (!isNaN(num) && num > 0) {
      setBudget(name, num);
      toast.success(`Budget ${name} diset ke ${formatIDR(num)}`);
    }
  };

  // Format helper for inputs
  const fmtInput = (v: string) => {
    const n = v.replace(/\D/g, "");
    return n === "" ? "" : new Intl.NumberFormat("id-ID").format(parseInt(n));
  };

  return (
    <PageWrapper>
      <Toaster position="top-right" />
      <div className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Anggaran (Budget)</h2>

        {/* ===== GLOBAL BUDGET ===== */}
        <Card className="hover:shadow-md transition-shadow border-l-4 border-l-indigo-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-indigo-500" />Batas Pengeluaran Bulanan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-500">
              Atur total batas pengeluaran. Auto Alert Hedon akan memperingatkanmu saat mendekati/melampaui batas.
            </p>

            {/* Budget Input */}
            <div className="flex gap-3">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">Rp</span>
                <input
                  type="text"
                  defaultValue={globalBudget > 0 ? new Intl.NumberFormat("id-ID").format(globalBudget) : ""}
                  onBlur={(e) => handleSaveGlobal(e.target.value)}
                  onChange={(e) => { e.target.value = fmtInput(e.target.value); }}
                  placeholder="Contoh: 3.000.000"
                  className="flex h-10 w-full rounded-md border border-slate-300 bg-white pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Progress Bar Global */}
            {globalBudget > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Terpakai: {formatIDR(totalExpense)}</span>
                  <span className={`font-semibold ${globalPct >= 100 ? "text-red-600" : globalPct >= 75 ? "text-amber-600" : "text-green-600"}`}>
                    {Math.round(globalPct)}%
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(globalPct, 100)}%` }}
                    transition={{ duration: 0.8 }}
                    className={`h-3 rounded-full ${globalPct >= 100 ? "bg-red-500" : globalPct >= 90 ? "bg-orange-500" : globalPct >= 75 ? "bg-amber-400" : "bg-green-500"}`}
                  />
                </div>
                <p className="text-xs text-slate-500">Sisa: {formatIDR(Math.max(globalBudget - totalExpense, 0))}</p>
              </div>
            )}

            {/* Alert Level Legend */}
            <div className="grid grid-cols-3 gap-2 mt-2">
              <div className="flex items-center gap-2 text-xs p-2 bg-amber-50 rounded-lg">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span className="text-amber-800">Warning ≥75%</span>
              </div>
              <div className="flex items-center gap-2 text-xs p-2 bg-orange-50 rounded-lg">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                <span className="text-orange-800">Danger ≥90%</span>
              </div>
              <div className="flex items-center gap-2 text-xs p-2 bg-red-50 rounded-lg">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
                <span className="text-red-800">Critical ≥100%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ===== PER-CATEGORY BUDGET ===== */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader><CardTitle>Anggaran per Kategori</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              {EXPENSE_CATEGORIES.map((cat, index) => {
                const Icon = getIcon(cat.icon);
                const spent = expenseByCategory.find((e) => e.name === cat.name)?.amount || 0;
                const limit = budgets[cat.name] || 0;
                const pct = limit > 0 ? (spent / limit) * 100 : 0;
                const isOver = pct >= 100;
                const isWarning = pct >= 80 && !isOver;

                return (
                  <motion.div
                    key={cat.name}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04 }}
                    className={`p-3 rounded-lg transition-colors ${isOver ? "bg-red-50 border border-red-200" : isWarning ? "bg-amber-50 border border-amber-200" : "hover:bg-slate-50"}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full shrink-0" style={{ backgroundColor: `${cat.color}20` }}>
                        <Icon className="h-5 w-5" style={{ color: cat.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-slate-900">{cat.name}</span>
                            {isOver && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-500 text-white">OVER BUDGET</span>}
                            {isWarning && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-400 text-amber-900">HAMPIR HABIS</span>}
                          </div>
                          <span className="text-xs text-slate-500">{formatIDR(spent)} / {limit > 0 ? formatIDR(limit) : "–"}</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(pct, 100)}%` }}
                            transition={{ duration: 0.6, delay: index * 0.04 }}
                            className="h-2 rounded-full"
                            style={{ backgroundColor: isOver ? "#EF4444" : isWarning ? "#F59E0B" : cat.color }}
                          />
                        </div>
                      </div>
                      <div className="relative shrink-0 w-32">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">Rp</span>
                        <input
                          type="text"
                          defaultValue={limit > 0 ? new Intl.NumberFormat("id-ID").format(limit) : ""}
                          onBlur={(e) => handleSaveCategory(cat.name, e.target.value)}
                          onChange={(e) => { e.target.value = fmtInput(e.target.value); }}
                          placeholder="0"
                          className="flex h-9 w-full rounded-md border border-slate-300 bg-white pl-7 pr-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  );
}
