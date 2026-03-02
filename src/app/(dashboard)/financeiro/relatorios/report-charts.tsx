"use client";

import { Card, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface ReportChartsProps {
  revenueByPeriod: { month: string; receita: number }[];
  revenueByClient: { name: string; value: number }[];
  expensesByCategory: { name: string; value: number }[];
}

const COLORS = ["#d76b2a", "#3c5cd5", "#22c55e", "#eab308", "#ef4444", "#8b5cf6", "#06b6d4", "#f97316"];

const formatValue = (value: number) =>
  new Intl.NumberFormat("pt-BR", { notation: "compact", compactDisplay: "short" }).format(value);

export function ReportCharts({
  revenueByPeriod,
  revenueByClient,
  expensesByCategory,
}: ReportChartsProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Revenue by Period */}
      <Card className="p-4 lg:col-span-2">
        <CardTitle className="mb-4">Receita por Período</CardTitle>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={revenueByPeriod}>
            <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
            <XAxis dataKey="month" stroke="#a0a0a0" fontSize={12} />
            <YAxis stroke="#a0a0a0" fontSize={12} tickFormatter={formatValue} />
            <Tooltip
              contentStyle={{ backgroundColor: "#282828", border: "1px solid #404040", borderRadius: "8px" }}
              labelStyle={{ color: "#ededed" }}
              formatter={(value) => [formatValue(Number(value)), "Receita"]}
            />
            <Bar dataKey="receita" fill="#22c55e" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Revenue by Client */}
      <Card className="p-4">
        <CardTitle className="mb-4">Receita por Cliente</CardTitle>
        {revenueByClient.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-12">Sem dados</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={revenueByClient}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) => `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`}
                labelLine={false}
              >
                {revenueByClient.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: "#282828", border: "1px solid #404040", borderRadius: "8px" }}
                formatter={(value) => [formatValue(Number(value)), "Receita"]}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </Card>

      {/* Expenses by Category */}
      <Card className="p-4">
        <CardTitle className="mb-4">Despesas por Categoria</CardTitle>
        {expensesByCategory.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-12">Sem dados</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={expensesByCategory}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) => `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`}
                labelLine={false}
              >
                {expensesByCategory.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: "#282828", border: "1px solid #404040", borderRadius: "8px" }}
                formatter={(value) => [formatValue(Number(value)), "Despesa"]}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </Card>
    </div>
  );
}
