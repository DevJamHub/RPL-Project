"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { formatIDR, formatDate } from "@/lib/utils";
import { getIcon } from "@/lib/icons";
import {
  useFinTrackStore,
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
} from "@/lib/store";
import {
  ArrowDownRight,
  ArrowUpRight,
  Wallet,
  ReceiptText,
  Plus,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  XCircle,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  Trash2,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

export default function DashboardPage() {
  // ===== STATE =====
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState<"INCOME" | "EXPENSE">("EXPENSE");
  const [formAmount, setFormAmount] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formDate, setFormDate] = useState(new Date().toISOString().split("T")[0]);

  // ===== STORE =====
  const {
    transactions,
    addTransaction,
    deleteTransaction,
    getMonthIncome,
    getMonthExpense,
    getBalance,
    getAlertLevel,
    getExpenseByCategory,
  } = useFinTrackStore();

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  // ===== COMPUTED =====
  const income = getMonthIncome(currentMonth, currentYear);
  const expense = getMonthExpense(currentMonth, currentYear);
  const balance = getBalance();
  const alert = getAlertLevel();
  const topExpenses = getExpenseByCategory(currentMonth, currentYear).slice(0, 3);
  const recentTransactions = transactions.slice(0, 5);

  // Perbandingan bulan lalu
  const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
  const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;
  const prevExpense = getMonthExpense(prevMonth, prevYear);
  const expenseChange = prevExpense > 0 ? ((expense - prevExpense) / prevExpense) * 100 : 0;

  // Label hemat/boros
  const spendingRatio = income > 0 ? expense / income : 0;
  const spendingLabel =
    spendingRatio <= 0.5
      ? { text: "Hemat 🟢", color: "text-green-600", bg: "bg-green-50" }
      : spendingRatio <= 0.8
      ? { text: "Normal 🟡", color: "text-amber-600", bg: "bg-amber-50" }
      : { text: "Boros 🔴", color: "text-red-600", bg: "bg-red-50" };

  const activeCategories = formType === "EXPENSE" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  // ===== HANDLERS =====
  const handleAmountChange = (value: string) => {
    const num = value.replace(/\D/g, "");
    setFormAmount(num === "" ? "" : new Intl.NumberFormat("id-ID").format(parseInt(num)));
  };

  const handleSubmit = () => {
    if (!formAmount || !formCategory) {
      toast.error("Nominal dan kategori wajib diisi!");
      return;
    }
    const cat = activeCategories.find((c) => c.name === formCategory);
    addTransaction({
      type: formType,
      amount: parseFloat(formAmount.replace(/\./g, "")),
      category: formCategory,
      categoryIcon: cat?.icon || "more-horizontal",
      categoryColor: cat?.color || "#6B7280",
      description:
        formDescription || `${formType === "INCOME" ? "Pemasukan" : "Pengeluaran"} - ${formCategory}`,
      date: formDate,
    });
    toast.success("Transaksi berhasil disimpan!");

    // Cek alert setelah simpan
    const newAlert = useFinTrackStore.getState().getAlertLevel();
    if (newAlert.level === "CRITICAL") toast.error(newAlert.message, { duration: 5000, icon: "🚨" });
    else if (newAlert.level === "DANGER") toast(newAlert.message, { duration: 4000, icon: "⚠️" });
    else if (newAlert.level === "WARNING") toast(newAlert.message, { duration: 3000, icon: "💡" });

    // Reset form
    setFormAmount("");
    setFormCategory("");
    setFormDescription("");
    setFormDate(new Date().toISOString().split("T")[0]);
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("Yakin ingin menghapus transaksi ini?")) {
      deleteTransaction(id);
      toast.success("Transaksi dihapus.");
    }
  };

  return (
    <PageWrapper>
      <Toaster position="top-right" />
      <div className="space-y-6">
        {/* ===== HEADER ===== */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard</h2>
            <p className="text-sm text-slate-500 mt-1">Ringkasan keuanganmu bulan ini</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)}>
            {showForm ? "Tutup Form" : <><Plus className="mr-2 h-4 w-4" /> Catat Transaksi</>}
          </Button>
        </div>

        {/* ===== ALERT BANNER ===== */}
        {alert.level !== "SAFE" && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex items-center gap-3 p-4 rounded-lg border ${
              alert.level === "CRITICAL"
                ? "bg-red-50 border-red-200 text-red-800"
                : alert.level === "DANGER"
                ? "bg-orange-50 border-orange-200 text-orange-800"
                : "bg-amber-50 border-amber-200 text-amber-800"
            }`}
          >
            {alert.level === "CRITICAL" ? (
              <XCircle className="h-5 w-5 shrink-0" />
            ) : (
              <AlertTriangle className="h-5 w-5 shrink-0" />
            )}
            <p className="text-sm font-medium">{alert.message}</p>
            <span className="ml-auto text-xs font-bold">{Math.round(alert.percentage)}%</span>
          </motion.div>
        )}

        {/* ===== FORM INPUT TRANSAKSI ===== */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-indigo-200 border-2">
                <CardHeader>
                  <CardTitle>Catat Transaksi Baru</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Toggle Tipe */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setFormType("EXPENSE"); setFormCategory(""); }}
                      className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                        formType === "EXPENSE"
                          ? "bg-red-500 text-white shadow-md"
                          : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                      }`}
                    >
                      Pengeluaran
                    </button>
                    <button
                      onClick={() => { setFormType("INCOME"); setFormCategory(""); }}
                      className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                        formType === "INCOME"
                          ? "bg-green-500 text-white shadow-md"
                          : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                      }`}
                    >
                      Pemasukan
                    </button>
                  </div>

                  {/* Nominal */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nominal</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-medium">Rp</span>
                      <Input value={formAmount} onChange={(e) => handleAmountChange(e.target.value)} placeholder="0" className="pl-10 text-lg font-semibold" />
                    </div>
                  </div>

                  {/* Kategori */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Kategori</label>
                    <div className="grid grid-cols-4 gap-2">
                      {activeCategories.map((cat) => {
                        const Icon = getIcon(cat.icon);
                        return (
                          <button
                            key={cat.name}
                            onClick={() => setFormCategory(cat.name)}
                            className={`flex flex-col items-center gap-1.5 p-3 rounded-lg text-xs font-medium transition-all ${
                              formCategory === cat.name
                                ? "bg-indigo-50 text-indigo-700 ring-2 ring-indigo-400 scale-105 shadow-sm"
                                : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                            }`}
                          >
                            <Icon className="h-5 w-5" style={{ color: cat.color }} />
                            {cat.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Keterangan (WAJIB ADA) */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Keterangan / Deskripsi</label>
                    <Input
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      placeholder="Misal: Makan siang di kantin, GoJek ke kampus..."
                    />
                  </div>

                  {/* Tanggal */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal</label>
                    <Input
                      type="date"
                      value={formDate}
                      onChange={(e) => setFormDate(e.target.value)}
                      max={new Date().toISOString().split("T")[0]}
                    />
                  </div>

                  <Button onClick={handleSubmit} className="w-full h-11 text-base">
                    Simpan Transaksi
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ===== KARTU RINGKASAN ===== */}
        <div className="grid gap-4 md:grid-cols-3">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Saldo</CardTitle>
                <Wallet className="h-4 w-4 text-indigo-500" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${balance >= 0 ? "text-slate-900" : "text-red-600"}`}>
                  {formatIDR(balance)}
                </div>
                {income > 0 && (
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full mt-2 inline-block ${spendingLabel.bg} ${spendingLabel.color}`}>
                    {spendingLabel.text}
                  </span>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pemasukan Bulan Ini</CardTitle>
                <ArrowUpRight className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{formatIDR(income)}</div>
                <p className="text-xs text-slate-500 mt-1">
                  {income === 0 ? "Belum ada pemasukan" : `${transactions.filter(t => t.type === "INCOME").length} transaksi`}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pengeluaran Bulan Ini</CardTitle>
                <ArrowDownRight className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{formatIDR(expense)}</div>
                {prevExpense > 0 && (
                  <div className="flex items-center gap-1 mt-1">
                    {expenseChange > 0 ? (
                      <TrendingUp className="h-3 w-3 text-red-500" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-green-500" />
                    )}
                    <span className={`text-xs font-medium ${expenseChange > 0 ? "text-red-500" : "text-green-500"}`}>
                      {Math.abs(Math.round(expenseChange))}% vs bulan lalu
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* ===== KATEGORI TERBESAR + TRANSAKSI TERBARU ===== */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          {/* Pengeluaran Terbesar */}
          <Card className="col-span-3 hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-base">Pengeluaran Terbesar Bulan Ini</CardTitle>
            </CardHeader>
            <CardContent>
              {topExpenses.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-center space-y-2">
                  <div className="p-3 bg-slate-50 rounded-full">
                    <ShieldAlert className="w-7 h-7 text-slate-300" />
                  </div>
                  <p className="text-sm text-slate-400">Belum ada data pengeluaran</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {topExpenses.map((cat, i) => {
                    const Icon = getIcon(cat.icon);
                    const pctOfTotal = expense > 0 ? (cat.amount / expense) * 100 : 0;
                    return (
                      <motion.div
                        key={cat.name}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4" style={{ color: cat.color }} />
                            <span className="text-sm font-medium text-slate-700">{cat.name}</span>
                          </div>
                          <span className="text-sm font-semibold text-slate-900">{formatIDR(cat.amount)}</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(pctOfTotal, 100)}%` }}
                            transition={{ duration: 0.6, delay: i * 0.1 }}
                            className="h-2 rounded-full"
                            style={{ backgroundColor: cat.color }}
                          />
                        </div>
                        <p className="text-xs text-slate-400 text-right">{Math.round(pctOfTotal)}% dari total</p>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* 5 Transaksi Terakhir */}
          <Card className="col-span-4 hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-base">5 Transaksi Terakhir</CardTitle>
            </CardHeader>
            <CardContent>
              {recentTransactions.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-center space-y-3">
                  <div className="p-3 bg-indigo-50 rounded-full">
                    <ReceiptText className="w-8 h-8 text-indigo-300" />
                  </div>
                  <p className="text-sm text-slate-500">Belum ada riwayat transaksi</p>
                  <p className="text-xs text-slate-400">Klik &quot;Catat Transaksi&quot; di atas untuk memulai</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentTransactions.map((t) => {
                    const Icon = getIcon(t.categoryIcon);
                    return (
                      <motion.div
                        key={t.id}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center justify-between py-2 hover:bg-slate-50 -mx-2 px-2 rounded-lg transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="flex h-9 w-9 items-center justify-center rounded-full shrink-0"
                            style={{ backgroundColor: `${t.categoryColor}20` }}
                          >
                            <Icon className="h-4 w-4" style={{ color: t.categoryColor }} />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-900 line-clamp-1">{t.description}</p>
                            <p className="text-xs text-slate-500">{t.category} • {formatDate(t.date)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-semibold ${t.type === "INCOME" ? "text-green-600" : "text-red-600"}`}>
                            {t.type === "INCOME" ? "+" : "-"}{formatIDR(t.amount)}
                          </span>
                          <button onClick={() => handleDelete(t.id)} className="p-1 rounded hover:bg-red-50 text-slate-300 hover:text-red-500 transition-colors">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageWrapper>
  );
}
