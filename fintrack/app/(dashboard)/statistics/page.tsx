"use client";

import { useMemo } from "react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { formatIDR } from "@/lib/utils";
import { getIcon } from "@/lib/icons";
import { useFinTrackStore } from "@/lib/store";
import { BarChart3, PieChart as PieChartIcon, TrendingUp, Receipt } from "lucide-react";
import { motion } from "framer-motion";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
  LineChart, Line,
} from "recharts";

export default function StatisticsPage() {
  const { transactions, getMonthIncome, getMonthExpense, getExpenseByCategory } = useFinTrackStore();

  const now = new Date();
  const cm = now.getMonth() + 1;
  const cy = now.getFullYear();

  const income = getMonthIncome(cm, cy);
  const expense = getMonthExpense(cm, cy);
  const balance = income - expense;
  const totalTxn = transactions.filter((t) => {
    const d = new Date(t.date);
    return d.getMonth() + 1 === cm && d.getFullYear() === cy;
  }).length;

  // ===== PIE CHART DATA: breakdown pengeluaran =====
  const pieData = getExpenseByCategory(cm, cy);

  // ===== BAR CHART DATA: 6 bulan pemasukan vs pengeluaran =====
  const monthNames = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];
  const barData = useMemo(() => {
    const result = [];
    for (let i = 5; i >= 0; i--) {
      let m = cm - i;
      let y = cy;
      if (m <= 0) { m += 12; y -= 1; }
      result.push({
        name: `${monthNames[m - 1]} ${y.toString().slice(2)}`,
        Pemasukan: getMonthIncome(m, y),
        Pengeluaran: getMonthExpense(m, y),
      });
    }
    return result;
  }, [transactions, cm, cy]);

  // ===== LINE CHART DATA: tren saldo harian bulan ini =====
  const lineData = useMemo(() => {
    const daysInMonth = new Date(cy, cm, 0).getDate();
    const dailyMap: Record<number, number> = {};
    for (let d = 1; d <= daysInMonth; d++) dailyMap[d] = 0;
    transactions
      .filter((t) => { const d = new Date(t.date); return d.getMonth() + 1 === cm && d.getFullYear() === cy; })
      .forEach((t) => {
        const day = new Date(t.date).getDate();
        dailyMap[day] += t.type === "INCOME" ? t.amount : -t.amount;
      });
    let cumulative = 0;
    return Object.entries(dailyMap).map(([day, amount]) => {
      cumulative += amount;
      return { name: `${day}`, Saldo: cumulative };
    });
  }, [transactions, cm, cy]);

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-slate-200 text-sm">
          <p className="font-medium text-slate-700 mb-1">{label}</p>
          {payload.map((p: any, i: number) => (
            <p key={i} style={{ color: p.color }} className="font-semibold">{p.name}: {formatIDR(p.value)}</p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <PageWrapper>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Statistik</h2>

        {/* Summary */}
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
          {[
            { title: "Total Pemasukan", value: formatIDR(income), icon: TrendingUp, color: "text-green-600", iconColor: "text-green-500" },
            { title: "Total Pengeluaran", value: formatIDR(expense), icon: BarChart3, color: "text-red-600", iconColor: "text-red-500" },
            { title: "Saldo Bersih", value: formatIDR(balance), icon: PieChartIcon, color: balance >= 0 ? "text-indigo-600" : "text-red-600", iconColor: "text-indigo-500" },
            { title: "Total Transaksi", value: totalTxn.toString(), icon: Receipt, color: "text-slate-900", iconColor: "text-amber-500" },
          ].map((card, i) => (
            <motion.div key={card.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">{card.title}</CardTitle>
                  <card.icon className={`h-4 w-4 ${card.iconColor}`} />
                </CardHeader>
                <CardContent><div className={`text-lg sm:text-xl font-bold ${card.color}`}>{card.value}</div></CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Bar Chart */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <BarChart3 className="h-5 w-5 text-indigo-500" />Pemasukan vs Pengeluaran
              </CardTitle>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <div className="flex items-center justify-center h-64 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                  <p className="text-slate-400 text-sm">Tambahkan transaksi untuk melihat grafik</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={barData} margin={{ top: 5, right: 5, left: -15, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000000).toFixed(1)}jt`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar dataKey="Pemasukan" fill="#22C55E" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Pengeluaran" fill="#EF4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Pie Chart */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <PieChartIcon className="h-5 w-5 text-indigo-500" />Breakdown Pengeluaran
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pieData.length === 0 ? (
                <div className="flex items-center justify-center h-64 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                  <p className="text-slate-400 text-sm">Belum ada data pengeluaran bulan ini</p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={pieData} dataKey="amount" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={3}>
                        {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                      </Pie>
                      <Tooltip formatter={(value) => formatIDR(Number(value))} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-wrap gap-3 justify-center mt-2">
                    {pieData.map((d) => (
                      <div key={d.name} className="flex items-center gap-1.5 text-xs">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                        <span className="text-slate-600">{d.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Line Chart — Full Width */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-5 w-5 text-indigo-500" />Tren Saldo Harian Bulan Ini
            </CardTitle>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <div className="flex items-center justify-center h-64 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                <p className="text-slate-400 text-sm">Tambahkan transaksi untuk melihat tren</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={lineData} margin={{ top: 5, right: 5, left: -15, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000000).toFixed(1)}jt`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="Saldo" stroke="#6366F1" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  );
}
