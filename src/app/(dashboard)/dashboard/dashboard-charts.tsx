"use client";

import { Card, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
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
  Legend,
} from "recharts";

interface DashboardChartsProps {
  revenueVsExpense: { month: string; receita: number; despesa: number }[];
  revenueComposition: { name: string; value: number }[];
  profitEvolution: { month: string; lucro: number }[];
}

const COLORS = ["#d76b2a", "#3c5cd5", "#22c55e", "#eab308", "#ef4444", "#8b5cf6", "#06b6d4", "#f97316"];

const formatValue = (value: number) =>
  new Intl.NumberFormat("pt-BR", { notation: "compact", compactDisplay: "short" }).format(value);

export function DashboardCharts({
  revenueVsExpense,
  revenueComposition,
  profitEvolution,
}: DashboardChartsProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Revenue vs Expense Line Chart */}
      <Card className="p-4 lg:col-span-2">
        <CardTitle className="mb-4">Receita vs Despesa (12 meses)</CardTitle>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={revenueVsExpense}>
            <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
            <XAxis dataKey="month" stroke="#a0a0a0" fontSize={12} />
            <YAxis stroke="#a0a0a0" fontSize={12} tickFormatter={formatValue} />
            <Tooltip
              contentStyle={{ backgroundColor: "#282828", border: "1px solid #404040", borderRadius: "8px" }}
              labelStyle={{ color: "#ededed" }}
              formatter={(value) => [formatValue(Number(value)), ""]}
            />
            <Legend />
            <Line type="monotone" dataKey="receita" stroke="#22c55e" strokeWidth={2} name="Receita" />
            <Line type="monotone" dataKey="despesa" stroke="#ef4444" strokeWidth={2} name="Despesa" />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Revenue Composition Pie Chart */}
      <Card className="p-4">
        <CardTitle className="mb-4">Composição da Receita</CardTitle>
        {revenueComposition.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-12">Sem dados</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={revenueComposition}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) => `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`}
                labelLine={false}
              >
                {revenueComposition.map((_, index) => (
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

      {/* Profit Evolution Bar Chart */}
      <Card className="p-4">
        <CardTitle className="mb-4">Evolução do Lucro</CardTitle>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={profitEvolution}>
            <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
            <XAxis dataKey="month" stroke="#a0a0a0" fontSize={12} />
            <YAxis stroke="#a0a0a0" fontSize={12} tickFormatter={formatValue} />
            <Tooltip
              contentStyle={{ backgroundColor: "#282828", border: "1px solid #404040", borderRadius: "8px" }}
              labelStyle={{ color: "#ededed" }}
              formatter={(value) => [formatValue(Number(value)), "Lucro"]}
            />
            <Bar dataKey="lucro" fill="#3c5cd5" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
