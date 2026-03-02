import { getDashboardData } from "@/actions/dashboard";
import { Header } from "@/components/layout/header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { PAYMENT_STATUS_COLORS } from "@/lib/constants";
import { DollarSign, TrendingUp, TrendingDown, Users, AlertCircle, Clock, CircleDollarSign, CheckCircle2 } from "lucide-react";
import { DashboardCharts } from "./dashboard-charts";
import type { PaymentStatus } from "@/types";

export default async function DashboardPage() {
  const data = await getDashboardData();

  const cards = [
    { title: "Recebido este Mês", value: formatCurrency(data.monthlyRevenue), icon: CheckCircle2, color: "text-success" },
    { title: "A Receber este Mês", value: formatCurrency(data.monthlyReceivable), icon: CircleDollarSign, color: "text-warning" },
    { title: "Despesas do Mês", value: formatCurrency(data.monthlyExpenses), icon: TrendingDown, color: "text-destructive" },
    { title: "Lucro do Mês", value: formatCurrency(data.monthlyProfit), icon: TrendingUp, color: data.monthlyProfit >= 0 ? "text-success" : "text-destructive" },
    { title: "Divisão por Sócio (50/50)", value: formatCurrency(data.partnerSplit), icon: Users, color: "text-secondary" },
    { title: "Parcelas Pendentes", value: String(data.pendingInstallments), icon: Clock, color: "text-warning" },
    { title: "Parcelas Vencidas", value: String(data.overdueInstallments), icon: AlertCircle, color: "text-destructive" },
  ];

  return (
    <div>
      <Header title="Dashboard" />

      {/* Summary Cards */}
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

      {/* Charts */}
      <DashboardCharts
        revenueVsExpense={data.revenueVsExpense}
        revenueComposition={data.revenueComposition}
        profitEvolution={data.profitEvolution}
      />

      {/* Upcoming Payments */}
      {data.upcomingPayments.length > 0 && (
        <Card className="mt-6 p-4">
          <h3 className="text-lg font-semibold mb-4">Próximos Vencimentos</h3>
          <div className="space-y-2">
            {data.upcomingPayments.map((payment: any) => (
              <div
                key={payment.id}
                className="flex items-center justify-between rounded-lg border border-border p-3"
              >
                <div>
                  <p className="text-sm font-medium">
                    {payment.project?.name} — {payment.project?.client?.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {"number" in payment ? `Parcela ${payment.number}` : payment.description}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{formatCurrency(Number(payment.value))}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(payment.dueDate)}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
