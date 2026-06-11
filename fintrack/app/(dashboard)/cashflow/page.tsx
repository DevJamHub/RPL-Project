"use client";

import { useMemo } from "react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { formatIDR } from "@/lib/utils";
import { useFinTrackStore } from "@/lib/store";
import { TrendingUp, TrendingDown, Minus, CalendarDays, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

export default function CashflowPage() {
  const { transactions, getMonthIncome, getMonthExpense, getBalance } = useFinTrackStore();

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  // ===== DATA 6 BULAN TERAKHIR =====
  const monthNames = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
  const months = useMemo(() => {
    const result = [];
    for (let i = 5; i >= 0; i--) {
      let m = currentMonth - i;
      let y = currentYear;
      if (m <= 0) { m += 12; y -= 1; }
      const income = getMonthIncome(m, y);
      const expense = getMonthExpense(m, y);
      result.push({ period: `${monthNames[m - 1]} ${y}`, month: m, year: y, income, expense, net: income - expense });
    }
    return result;
  }, [transactions, currentMonth, currentYear]);

  // ===== RATA-RATA =====
  const avgIncome = months.reduce((s, m) => s + m.income, 0) / 6;
  const avgExpense = months.reduce((s, m) => s + m.expense, 0) / 6;
  const avgNet = avgIncome - avgExpense;

  // ===== PROYEKSI: jika pola berlanjut, saldo habis kapan? =====
  const balance = getBalance();
  const dailyExpense = useMemo(() => {
    const thisMonthExpense = getMonthExpense(currentMonth, currentYear);
    const daysPassed = now.getDate();
    return daysPassed > 0 ? thisMonthExpense / daysPassed : 0;
  }, [transactions]);

  const daysUntilZero = dailyExpense > 0 && balance > 0 ? Math.ceil(balance / dailyExpense) : null;
  const projectedDate = daysUntilZero ? new Date(Date.now() + daysUntilZero * 86400000) : null;

  // ===== TITIK TERENDAH SALDO BULAN INI =====
  const lowestPoint = useMemo(() => {
    const thisMonthTxns = transactions
      .filter((t) => { const d = new Date(t.date); return d.getMonth() + 1 === currentMonth && d.getFullYear() === currentYear; })
      .sort((a, b) => a.date.localeCompare(b.date));

    let runningBalance = balance;
    // Reverse compute: subtract future transactions back
    for (let i = thisMonthTxns.length - 1; i >= 0; i--) {
      const t = thisMonthTxns[i];
      runningBalance += t.type === "EXPENSE" ? t.amount : -t.amount;
    }
    // Now forward compute to find minimum
    let minBal = runningBalance;
    let minDate = "";
    for (const t of thisMonthTxns) {
      runningBalance += t.type === "INCOME" ? t.amount : -t.amount;
      if (runningBalance < minBal) {
        minBal = runningBalance;
        minDate = t.date;
      }
    }
    return { balance: minBal, date: minDate };
  }, [transactions, balance]);

  return (
    <PageWrapper>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Arus Kas</h2>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-slate-500">Rata-rata Pemasukan/Bulan</CardTitle></CardHeader>
              <CardContent><p className="text-2xl font-bold text-green-600">{formatIDR(avgIncome)}</p></CardContent>
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-slate-500">Rata-rata Pengeluaran/Bulan</CardTitle></CardHeader>
              <CardContent><p className="text-2xl font-bold text-red-600">{formatIDR(avgExpense)}</p></CardContent>
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-slate-500">Rata-rata Net Flow</CardTitle></CardHeader>
              <CardContent><p className={`text-2xl font-bold ${avgNet >= 0 ? "text-green-600" : "text-red-600"}`}>{formatIDR(avgNet)}</p></CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Proyeksi & Titik Terendah */}
        {(daysUntilZero || lowestPoint.date) && (
          <div className="grid gap-4 md:grid-cols-2">
            {daysUntilZero && projectedDate && (
              <Card className="border-l-4 border-l-amber-400 hover:shadow-md transition-shadow">
                <CardContent className="flex items-start gap-3 pt-5">
                  <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Proyeksi Saldo Habis</p>
                    <p className="text-sm text-slate-600 mt-1">
                      Jika pola pengeluaran saat ini berlanjut ({formatIDR(dailyExpense)}/hari), saldomu akan habis dalam <strong>{daysUntilZero} hari</strong> (sekitar {projectedDate.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}).
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
            {lowestPoint.date && (
              <Card className="border-l-4 border-l-indigo-400 hover:shadow-md transition-shadow">
                <CardContent className="flex items-start gap-3 pt-5">
                  <CalendarDays className="h-5 w-5 text-indigo-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Titik Terendah Saldo Bulan Ini</p>
                    <p className="text-sm text-slate-600 mt-1">
                      Saldo terendah bulan ini adalah <strong>{formatIDR(lowestPoint.balance)}</strong> pada tanggal {new Date(lowestPoint.date).toLocaleDateString("id-ID", { day: "numeric", month: "long" })}.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Tabel Arus Kas */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader><CardTitle>Tabel Arus Kas Bulanan (6 Bulan)</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 font-medium text-slate-500">Periode</th>
                    <th className="text-right py-3 px-4 font-medium text-slate-500">Total Masuk</th>
                    <th className="text-right py-3 px-4 font-medium text-slate-500">Total Keluar</th>
                    <th className="text-right py-3 px-4 font-medium text-slate-500">Net Flow</th>
                    <th className="text-center py-3 px-4 font-medium text-slate-500">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {months.map((m, i) => {
                    const status = m.net > 0 ? "SURPLUS" : m.net < 0 ? "DEFISIT" : "NETRAL";
                    return (
                      <motion.tr key={m.period} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 font-medium text-slate-900">{m.period}</td>
                        <td className="py-3 px-4 text-right text-green-600">{formatIDR(m.income)}</td>
                        <td className="py-3 px-4 text-right text-red-600">{formatIDR(m.expense)}</td>
                        <td className={`py-3 px-4 text-right font-semibold ${m.net >= 0 ? "text-green-700" : "text-red-700"}`}>{formatIDR(m.net)}</td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${status === "SURPLUS" ? "bg-green-100 text-green-700" : status === "DEFISIT" ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-600"}`}>
                            {status === "SURPLUS" && <TrendingUp className="h-3 w-3" />}
                            {status === "DEFISIT" && <TrendingDown className="h-3 w-3" />}
                            {status === "NETRAL" && <Minus className="h-3 w-3" />}
                            {status}
                          </span>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  );
}
