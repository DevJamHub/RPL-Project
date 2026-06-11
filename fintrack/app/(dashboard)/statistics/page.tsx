"use client";

import { PageWrapper } from "@/components/layout/PageWrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

export default function StatisticsPage() {
  return (
    <PageWrapper>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Statistik</h2>
        <Card>
          <CardHeader>
            <CardTitle>Grafik Dinamika Keuangan</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-500">Halaman ini akan menampilkan berbagai jenis chart menggunakan Recharts.</p>
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  );
}
