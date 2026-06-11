"use client";

import { PageWrapper } from "@/components/layout/PageWrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

export default function BudgetPage() {
  return (
    <PageWrapper>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Anggaran (Budget)</h2>
        <Card>
          <CardHeader>
            <CardTitle>Pengaturan Anggaran Bulanan</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-500">Halaman ini akan digunakan untuk mengatur batas pengeluaran kategori (Auto Alert Hedon).</p>
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  );
}
