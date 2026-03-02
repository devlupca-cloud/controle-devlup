"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardTitle } from "@/components/ui/card";
import { getReportData } from "@/actions/reports";
import { formatCurrency } from "@/lib/utils";
import { ReportCharts } from "./report-charts";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";

export default function RelatoriosPage() {
  const defaultStart = format(startOfMonth(subMonths(new Date(), 11)), "yyyy-MM-dd");
  const defaultEnd = format(endOfMonth(new Date()), "yyyy-MM-dd");

  const [startDate, setStartDate] = useState(defaultStart);
  const [endDate, setEndDate] = useState(defaultEnd);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function handleGenerate() {
    setLoading(true);
    try {
      const result = await getReportData(startDate, endDate);
      setData(result);
    } catch {
      // handle error
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <Header title="Relatórios" />

      <div className="mb-6 flex flex-wrap gap-3 items-end">
        <Input
          label="Data Início"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="w-44"
        />
        <Input
          label="Data Fim"
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="w-44"
        />
        <Button onClick={handleGenerate} disabled={loading}>
          {loading ? "Gerando..." : "Gerar Relatório"}
        </Button>
      </div>

      {data && (
        <>
          <ReportCharts
            revenueByPeriod={data.revenueByPeriod}
            revenueByClient={data.revenueByClient}
            expensesByCategory={data.expensesByCategory}
          />

          {/* Profit by project ranking */}
          <Card className="mt-6">
            <CardTitle className="mb-4">Ranking de Projetos por Lucro</CardTitle>
            {data.profitByProject.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Sem dados</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-4 py-2 text-left text-sm font-medium text-muted-foreground">#</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-muted-foreground">Projeto</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-muted-foreground">Receita</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-muted-foreground">Despesa</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-muted-foreground">Lucro</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.profitByProject.map((p: any, i: number) => (
                      <tr key={p.name} className="border-b border-border/50">
                        <td className="px-4 py-2 text-sm">{i + 1}</td>
                        <td className="px-4 py-2 text-sm font-medium">{p.name}</td>
                        <td className="px-4 py-2 text-sm text-success">{formatCurrency(p.receita)}</td>
                        <td className="px-4 py-2 text-sm text-destructive">{formatCurrency(p.despesa)}</td>
                        <td className="px-4 py-2 text-sm font-bold">{formatCurrency(p.lucro)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
