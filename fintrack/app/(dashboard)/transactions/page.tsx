"use client";

import { PageWrapper } from "@/components/layout/PageWrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

export default function TransactionsPage() {
  return (
    <PageWrapper>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Transaksi</h2>
        <Card>
          <CardHeader>
            <CardTitle>Daftar Transaksi</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-500">Halaman ini akan menampilkan daftar transaksi lengkap dengan filter.</p>
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  );
}
