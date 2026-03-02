import { getDashboardData } from "@/actions/dashboard";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/layout/header";
import { Card, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { DollarSign, TrendingUp, TrendingDown, Users, Clock, AlertCircle } from "lucide-react";
import Link from "next/link";

export default async function FinanceiroPage() {
  const [data, users] = await Promise.all([
    getDashboardData(),
    prisma.user.findMany({ orderBy: { name: "asc" } }),
  ]);

  const cards = [
    {
      title: "Receita do Mês",
      value: formatCurrency(data.monthlyRevenue),
      icon: DollarSign,
      color: "text-success",
    },
    {
      title: "Despesas do Mês",
      value: formatCurrency(data.monthlyExpenses),
      icon: TrendingDown,
      color: "text-destructive",
    },
    {
      title: "Lucro do Mês",
      value: formatCurrency(data.monthlyProfit),
      icon: TrendingUp,
      color: data.monthlyProfit >= 0 ? "text-success" : "text-destructive",
    },
  ];

  return (
    <div>
      <Header title="Financeiro" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
        {cards.map((card) => (
          <Card key={card.title} className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">{card.title}</p>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </div>
            <p className={`text-2xl font-bold mt-1 ${card.color}`}>{card.value}</p>
          </Card>
        ))}
      </div>

      {/* Partner Split */}
      <Card className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Users className="h-5 w-5 text-secondary" />
          <CardTitle>Divisão entre Sócios (50/50)</CardTitle>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {users.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between rounded-lg border border-border p-4"
            >
              <div>
                <p className="font-medium">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-secondary">
                  {formatCurrency(data.partnerSplit)}
                </p>
                <p className="text-xs text-muted-foreground">este mês</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 rounded-lg bg-muted/50 p-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Lucro total do mês</span>
            <span className="font-medium">{formatCurrency(data.monthlyProfit)}</span>
          </div>
          <div className="flex justify-between text-sm mt-1">
            <span className="text-muted-foreground">Por sócio ({users.length})</span>
            <span className="font-medium text-secondary">{formatCurrency(data.partnerSplit)}</span>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 mb-6">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Parcelas Pendentes</p>
            <Clock className="h-4 w-4 text-warning" />
          </div>
          <p className="text-3xl font-bold text-warning mt-1">{data.pendingInstallments}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Parcelas Vencidas</p>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </div>
          <p className="text-3xl font-bold text-destructive mt-1">{data.overdueInstallments}</p>
        </Card>
      </div>

      {/* Quick links */}
      <div className="grid gap-3 sm:grid-cols-3">
        <Link
          href="/financeiro/receitas"
          className="rounded-xl border border-border p-4 hover:bg-muted/50 transition-colors"
        >
          <p className="font-medium">Receitas</p>
          <p className="text-xs text-muted-foreground">Parcelas e cobranças recorrentes</p>
        </Link>
        <Link
          href="/financeiro/despesas"
          className="rounded-xl border border-border p-4 hover:bg-muted/50 transition-colors"
        >
          <p className="font-medium">Despesas</p>
          <p className="text-xs text-muted-foreground">Gerenciar despesas e categorias</p>
        </Link>
        <Link
          href="/financeiro/relatorios"
          className="rounded-xl border border-border p-4 hover:bg-muted/50 transition-colors"
        >
          <p className="font-medium">Relatórios</p>
          <p className="text-xs text-muted-foreground">Análises por período</p>
        </Link>
      </div>
    </div>
  );
}
