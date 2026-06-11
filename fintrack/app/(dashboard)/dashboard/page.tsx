import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { ArrowDownRight, ArrowUpRight, Wallet, ReceiptText } from "lucide-react";
import { formatIDR } from "@/lib/utils";
import { PageWrapper } from "@/components/layout/PageWrapper";

export default function DashboardPage() {
  return (
    <PageWrapper>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard</h2>
        </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Saldo</CardTitle>
            <Wallet className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatIDR(0)}</div>
            <p className="text-xs text-slate-500 mt-1">Belum ada transaksi</p>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pemasukan Bulan Ini</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatIDR(0)}</div>
            <p className="text-xs text-slate-500 mt-1">Masih kosong</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pengeluaran Bulan Ini</CardTitle>
            <ArrowDownRight className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatIDR(0)}</div>
            <p className="text-xs text-slate-500 mt-1">Belum ada pengeluaran</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle>Ringkasan Arus Kas</CardTitle>
          </CardHeader>
          <CardContent className="pl-2 flex justify-center items-center h-64 bg-slate-50 rounded-md border border-slate-100 m-6 mt-0">
            <p className="text-slate-400 text-sm">Grafik akan dimuat di sini...</p>
          </CardContent>
        </Card>
        
        <Card className="col-span-3 hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle>Transaksi Terakhir</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center h-48 text-center space-y-3">
              <div className="p-3 bg-indigo-50 rounded-full">
                <ReceiptText className="w-8 h-8 text-indigo-300" />
              </div>
              <p className="text-sm text-slate-500">Belum ada riwayat transaksi</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  );
}
