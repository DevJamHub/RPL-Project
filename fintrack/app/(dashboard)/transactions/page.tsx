"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { formatIDR, formatDate } from "@/lib/utils";
import { getIcon } from "@/lib/icons";
import {
  useFinTrackStore,
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
} from "@/lib/store";
import {
  Plus, Search, X, Trash2, ReceiptText, SlidersHorizontal,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

export default function TransactionsPage() {
  // ===== STORE =====
  const { transactions, addTransaction, deleteTransaction } = useFinTrackStore();

  // ===== FORM STATE =====
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState<"INCOME" | "EXPENSE">("EXPENSE");
  const [formAmount, setFormAmount] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formDate, setFormDate] = useState(new Date().toISOString().split("T")[0]);

  // ===== FILTER STATE =====
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"ALL" | "INCOME" | "EXPENSE">("ALL");
  const [showFilters, setShowFilters] = useState(false);
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterMinAmount, setFilterMinAmount] = useState("");
  const [filterMaxAmount, setFilterMaxAmount] = useState("");

  const activeCategories = formType === "EXPENSE" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  // ===== FILTERING LOGIC =====
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      if (filterType !== "ALL" && t.type !== filterType) return false;
      if (searchQuery && !t.description.toLowerCase().includes(searchQuery.toLowerCase()) && !t.category.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (filterDateFrom && t.date < filterDateFrom) return false;
      if (filterDateTo && t.date > filterDateTo) return false;
      if (filterCategory && t.category !== filterCategory) return false;
      if (filterMinAmount) { const min = parseInt(filterMinAmount.replace(/\D/g, "")); if (min && t.amount < min) return false; }
      if (filterMaxAmount) { const max = parseInt(filterMaxAmount.replace(/\D/g, "")); if (max && t.amount > max) return false; }
      return true;
    });
  }, [transactions, filterType, searchQuery, filterDateFrom, filterDateTo, filterCategory, filterMinAmount, filterMaxAmount]);

  // ===== HANDLERS =====
  const handleAmountChange = (value: string) => {
    const num = value.replace(/\D/g, "");
    setFormAmount(num === "" ? "" : new Intl.NumberFormat("id-ID").format(parseInt(num)));
  };

  const handleSubmit = () => {
    if (!formAmount || !formCategory) { toast.error("Nominal dan kategori wajib diisi!"); return; }
    const cat = activeCategories.find((c) => c.name === formCategory);
    addTransaction({
      type: formType,
      amount: parseFloat(formAmount.replace(/\./g, "")),
      category: formCategory,
      categoryIcon: cat?.icon || "more-horizontal",
      categoryColor: cat?.color || "#6B7280",
      description: formDescription || `${formType === "INCOME" ? "Pemasukan" : "Pengeluaran"} - ${formCategory}`,
      date: formDate,
    });
    toast.success("Transaksi berhasil disimpan!");
    // Cek alert
    const newAlert = useFinTrackStore.getState().getAlertLevel();
    if (newAlert.level === "CRITICAL") toast.error(newAlert.message, { duration: 5000, icon: "🚨" });
    else if (newAlert.level === "DANGER") toast(newAlert.message, { duration: 4000, icon: "⚠️" });
    else if (newAlert.level === "WARNING") toast(newAlert.message, { duration: 3000, icon: "💡" });
    setFormAmount(""); setFormCategory(""); setFormDescription(""); setFormDate(new Date().toISOString().split("T")[0]); setShowForm(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("Yakin ingin menghapus transaksi ini?")) { deleteTransaction(id); toast.success("Transaksi dihapus."); }
  };

  const clearFilters = () => {
    setSearchQuery(""); setFilterType("ALL"); setFilterDateFrom(""); setFilterDateTo(""); setFilterCategory(""); setFilterMinAmount(""); setFilterMaxAmount("");
  };

  return (
    <PageWrapper>
      <Toaster position="top-right" />
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Transaksi</h2>
            <p className="text-sm text-slate-500 mt-1">{transactions.length} transaksi tercatat</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)}>
            {showForm ? <><X className="mr-2 h-4 w-4" /> Batal</> : <><Plus className="mr-2 h-4 w-4" /> Tambah</>}
          </Button>
        </div>

        {/* ===== FORM ===== */}
        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }}>
              <Card className="border-indigo-200 border-2">
                <CardHeader><CardTitle>Tambah Transaksi Baru</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <button onClick={() => { setFormType("EXPENSE"); setFormCategory(""); }} className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${formType === "EXPENSE" ? "bg-red-500 text-white shadow-md" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}>Pengeluaran</button>
                    <button onClick={() => { setFormType("INCOME"); setFormCategory(""); }} className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${formType === "INCOME" ? "bg-green-500 text-white shadow-md" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}>Pemasukan</button>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nominal</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-medium">Rp</span>
                      <Input value={formAmount} onChange={(e) => handleAmountChange(e.target.value)} placeholder="0" className="pl-10 text-lg font-semibold" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Kategori</label>
                    <div className="grid grid-cols-4 gap-2">
                      {activeCategories.map((cat) => {
                        const Icon = getIcon(cat.icon);
                        return (
                          <button key={cat.name} onClick={() => setFormCategory(cat.name)} className={`flex flex-col items-center gap-1.5 p-3 rounded-lg text-xs font-medium transition-all ${formCategory === cat.name ? "bg-indigo-50 text-indigo-700 ring-2 ring-indigo-400 scale-105 shadow-sm" : "bg-slate-50 text-slate-600 hover:bg-slate-100"}`}>
                            <Icon className="h-5 w-5" style={{ color: cat.color }} />
                            {cat.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Keterangan / Deskripsi</label>
                    <Input value={formDescription} onChange={(e) => setFormDescription(e.target.value)} placeholder="Misal: Makan siang di kantin, GoJek ke kampus..." />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal</label>
                    <Input type="date" value={formDate} onChange={(e) => setFormDate(e.target.value)} max={new Date().toISOString().split("T")[0]} />
                  </div>
                  <Button onClick={handleSubmit} className="w-full h-11 text-base">Simpan Transaksi</Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ===== SEARCH & FILTER ===== */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input type="text" placeholder="Cari berdasarkan deskripsi atau kategori..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
            </div>
            <div className="flex gap-2">
              {(["ALL", "INCOME", "EXPENSE"] as const).map((type) => (
                <button key={type} onClick={() => setFilterType(type)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filterType === type ? "bg-indigo-600 text-white shadow-sm" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"}`}>
                  {type === "ALL" ? "Semua" : type === "INCOME" ? "Masuk" : "Keluar"}
                </button>
              ))}
              <button onClick={() => setShowFilters(!showFilters)} className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all ${showFilters ? "bg-indigo-50 border-indigo-300 text-indigo-700" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
                <SlidersHorizontal className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Advanced Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                <Card>
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      <div>
                        <label className="text-xs font-medium text-slate-500 mb-1 block">Dari Tanggal</label>
                        <Input type="date" value={filterDateFrom} onChange={(e) => setFilterDateFrom(e.target.value)} />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-slate-500 mb-1 block">Sampai Tanggal</label>
                        <Input type="date" value={filterDateTo} onChange={(e) => setFilterDateTo(e.target.value)} />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-slate-500 mb-1 block">Kategori</label>
                        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                          <option value="">Semua Kategori</option>
                          {[...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES].map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
                        </select>
                      </div>
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <label className="text-xs font-medium text-slate-500 mb-1 block">Min (Rp)</label>
                          <Input value={filterMinAmount} onChange={(e) => setFilterMinAmount(e.target.value)} placeholder="0" />
                        </div>
                        <div className="flex-1">
                          <label className="text-xs font-medium text-slate-500 mb-1 block">Max (Rp)</label>
                          <Input value={filterMaxAmount} onChange={(e) => setFilterMaxAmount(e.target.value)} placeholder="∞" />
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 flex justify-end">
                      <button onClick={clearFilters} className="text-xs text-indigo-600 hover:underline">Reset semua filter</button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ===== DAFTAR TRANSAKSI ===== */}
        <Card>
          <CardContent className="p-0">
            {filteredTransactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
                <div className="p-4 bg-indigo-50 rounded-full"><ReceiptText className="w-10 h-10 text-indigo-300" /></div>
                <p className="text-slate-500 font-medium">Belum ada transaksi</p>
                <p className="text-slate-400 text-sm">Klik &quot;Tambah&quot; untuk memulai pencatatan keuanganmu</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredTransactions.map((t) => {
                  const Icon = getIcon(t.categoryIcon);
                  return (
                    <motion.div key={t.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full shrink-0" style={{ backgroundColor: `${t.categoryColor}20` }}>
                          <Icon className="h-5 w-5" style={{ color: t.categoryColor }} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-900 truncate">{t.description}</p>
                          <p className="text-xs text-slate-500">{t.category} • {formatDate(t.date)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0 ml-4">
                        <span className={`text-sm font-semibold ${t.type === "INCOME" ? "text-green-600" : "text-red-600"}`}>
                          {t.type === "INCOME" ? "+" : "-"}{formatIDR(t.amount)}
                        </span>
                        <button onClick={() => handleDelete(t.id)} className="p-1.5 rounded-md hover:bg-red-50 text-slate-300 hover:text-red-500 transition-colors">
                          <Trash2 className="h-4 w-4" />
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
    </PageWrapper>
  );
}
