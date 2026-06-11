"use client";

import { PageWrapper } from "@/components/layout/PageWrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

export default function EStatementPage() {
  return (
    <PageWrapper>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">E-Statement</h2>
        <Card>
          <CardHeader>
            <CardTitle>Unduh Laporan Keuangan</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-500">Di halaman ini, kamu bisa men-download E-Statement ke format PDF dan Excel.</p>
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  );
}
