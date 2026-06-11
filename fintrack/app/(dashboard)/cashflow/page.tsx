"use client";

import { PageWrapper } from "@/components/layout/PageWrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

export default function CashflowPage() {
  return (
    <PageWrapper>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Arus Kas</h2>
        <Card>
          <CardHeader>
            <CardTitle>Arus Kas Bulanan</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-500">Halaman ini akan menampilkan tabel arus kas bulanan (Surplus/Defisit).</p>
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  );
}
