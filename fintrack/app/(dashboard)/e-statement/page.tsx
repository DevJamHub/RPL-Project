"use client";

import { useState, useMemo } from "react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { formatIDR, formatDate } from "@/lib/utils";
import { getIcon } from "@/lib/icons";
import { useFinTrackStore } from "@/lib/store";
import { FileText, Download, FileSpreadsheet, Calendar, ReceiptText } from "lucide-react";
import { motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";

export default function EStatementPage() {
  const { transactions, getMonthIncome, getMonthExpense, getExpenseByCategory } = useFinTrackStore();

  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  const monthNames = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];

  const income = getMonthIncome(selectedMonth, selectedYear);
  const expense = getMonthExpense(selectedMonth, selectedYear);
  const net = income - expense;
  const breakdown = getExpenseByCategory(selectedMonth, selectedYear);

  const monthTransactions = useMemo(() => {
    return transactions
      .filter((t) => { const d = new Date(t.date); return d.getMonth() + 1 === selectedMonth && d.getFullYear() === selectedYear; })
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [transactions, selectedMonth, selectedYear]);

  // ===== PDF EXPORT =====
  const handleDownloadPDF = async () => {
    const { default: jsPDF } = await import("jspdf");
    const { default: autoTable } = await import("jspdf-autotable");

    const doc = new jsPDF();
    const period = `${monthNames[selectedMonth - 1]} ${selectedYear}`;

    // Header
    doc.setFontSize(20);
    doc.setTextColor(99, 102, 241); // Indigo
    doc.text("FinTrack", 14, 20);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("Sistem Manajemen Keuangan Mahasiswa", 14, 27);
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text(`E-Statement — ${period}`, 14, 40);

    // Ringkasan
    doc.setFontSize(11);
    doc.text(`Total Pemasukan : ${formatIDR(income)}`, 14, 52);
    doc.text(`Total Pengeluaran : ${formatIDR(expense)}`, 14, 59);
    doc.text(`Saldo Bersih : ${formatIDR(net)}`, 14, 66);

    // Tabel Transaksi
    if (monthTransactions.length > 0) {
      autoTable(doc, {
        startY: 75,
        head: [["Tanggal", "Kategori", "Deskripsi", "Tipe", "Nominal"]],
        body: monthTransactions.map((t) => [
          formatDate(t.date),
          t.category,
          t.description,
          t.type === "INCOME" ? "Masuk" : "Keluar",
          formatIDR(t.amount),
        ]),
        styles: { fontSize: 9 },
        headStyles: { fillColor: [99, 102, 241] },
      });
    }

    // Footer
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(`Digenerate oleh FinTrack — ${new Date().toLocaleDateString("id-ID")}`, 14, pageHeight - 10);

    doc.save(`FinTrack_Statement_${period.replace(" ", "_")}.pdf`);
    toast.success("PDF berhasil didownload!");
  };

  // ===== EXCEL EXPORT =====
  const handleDownloadExcel = async () => {
    const XLSX = await import("xlsx");
    const wb = XLSX.utils.book_new();

    // Sheet 1: Ringkasan
    const summaryData = [
      ["Periode", `${monthNames[selectedMonth - 1]} ${selectedYear}`],
      ["Total Pemasukan", income],
      ["Total Pengeluaran", expense],
      ["Saldo Bersih", net],
    ];
    const ws1 = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, ws1, "Ringkasan");

    // Sheet 2: Semua Transaksi
    const txnData = [["Tanggal", "Kategori", "Deskripsi", "Tipe", "Nominal"]];
    monthTransactions.forEach((t) => {
      txnData.push([formatDate(t.date), t.category, t.description, t.type === "INCOME" ? "Masuk" : "Keluar", t.amount.toString()]);
    });
    const ws2 = XLSX.utils.aoa_to_sheet(txnData);
    XLSX.utils.book_append_sheet(wb, ws2, "Transaksi");

    // Sheet 3: Breakdown per Kategori
    const breakdownData = [["Kategori", "Total Pengeluaran"]];
    breakdown.forEach((b) => { breakdownData.push([b.name, b.amount.toString()]); });
    const ws3 = XLSX.utils.aoa_to_sheet(breakdownData);
    XLSX.utils.book_append_sheet(wb, ws3, "Breakdown Kategori");

    XLSX.writeFile(wb, `FinTrack_Statement_${monthNames[selectedMonth - 1]}_${selectedYear}.xlsx`);
    toast.success("Excel berhasil didownload!");
  };

  return (
    <PageWrapper>
      <Toaster position="top-right" />
      <div className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">E-Statement</h2>

        {/* Period Selector */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-indigo-500" />Pilih Periode Laporan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-700 mb-1">Bulan</label>
                <select value={selectedMonth} onChange={(e) => setSelectedMonth(parseInt(e.target.value))} className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  {monthNames.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-700 mb-1">Tahun</label>
                <select value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))} className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  {[2024, 2025, 2026].map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Preview */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader><CardTitle>Preview — {monthNames[selectedMonth - 1]} {selectedYear}</CardTitle></CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3 mb-6">
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-4 bg-green-50 rounded-lg text-center">
                <p className="text-sm text-green-600 font-medium">Total Pemasukan</p>
                <p className="text-xl font-bold text-green-700 mt-1">{formatIDR(income)}</p>
              </motion.div>
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="p-4 bg-red-50 rounded-lg text-center">
                <p className="text-sm text-red-600 font-medium">Total Pengeluaran</p>
                <p className="text-xl font-bold text-red-700 mt-1">{formatIDR(expense)}</p>
              </motion.div>
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="p-4 bg-indigo-50 rounded-lg text-center">
                <p className="text-sm text-indigo-600 font-medium">Saldo Bersih</p>
                <p className={`text-xl font-bold mt-1 ${net >= 0 ? "text-indigo-700" : "text-red-700"}`}>{formatIDR(net)}</p>
              </motion.div>
            </div>

            {/* Transaction Table Preview */}
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="text-left py-3 px-4 font-medium text-slate-500">Tanggal</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-500">Kategori</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-500">Deskripsi</th>
                    <th className="text-right py-3 px-4 font-medium text-slate-500">Nominal</th>
                    <th className="text-center py-3 px-4 font-medium text-slate-500">Tipe</th>
                  </tr>
                </thead>
                <tbody>
                  {monthTransactions.length === 0 ? (
                    <tr><td colSpan={5} className="py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center gap-2">
                        <ReceiptText className="h-8 w-8 text-slate-300" />
                        Belum ada transaksi di periode ini
                      </div>
                    </td></tr>
                  ) : (
                    monthTransactions.map((t) => (
                      <tr key={t.id} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                        <td className="py-2.5 px-4 text-slate-700">{formatDate(t.date)}</td>
                        <td className="py-2.5 px-4">{t.category}</td>
                        <td className="py-2.5 px-4 text-slate-600 truncate max-w-[200px]">{t.description}</td>
                        <td className={`py-2.5 px-4 text-right font-medium ${t.type === "INCOME" ? "text-green-600" : "text-red-600"}`}>
                          {t.type === "INCOME" ? "+" : "-"}{formatIDR(t.amount)}
                        </td>
                        <td className="py-2.5 px-4 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${t.type === "INCOME" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                            {t.type === "INCOME" ? "Masuk" : "Keluar"}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Download Buttons */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer group" onClick={handleDownloadPDF}>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="p-3 bg-red-50 rounded-lg group-hover:bg-red-100 transition-colors">
                <FileText className="h-8 w-8 text-red-500" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900">Download PDF</h3>
                <p className="text-sm text-slate-500 mt-1">Laporan lengkap dengan ringkasan dan tabel transaksi</p>
              </div>
              <Button variant="outline" className="shrink-0"><Download className="mr-2 h-4 w-4" /> PDF</Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer group" onClick={handleDownloadExcel}>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="p-3 bg-green-50 rounded-lg group-hover:bg-green-100 transition-colors">
                <FileSpreadsheet className="h-8 w-8 text-green-500" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900">Download Excel</h3>
                <p className="text-sm text-slate-500 mt-1">Data 3 sheet: Ringkasan, Transaksi, Breakdown Kategori</p>
              </div>
              <Button variant="outline" className="shrink-0"><Download className="mr-2 h-4 w-4" /> Excel</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageWrapper>
  );
}
