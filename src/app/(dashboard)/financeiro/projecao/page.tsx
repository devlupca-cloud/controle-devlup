import { getProjectionData } from "@/actions/projections";
import { Header } from "@/components/layout/header";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { STATUS_COLORS, PROJECT_STATUSES } from "@/lib/constants";
import {
  TrendingUp,
  Target,
  DollarSign,
  Layers,
  Users,
} from "lucide-react";

export default async function ProjecaoPage() {
  const data = await getProjectionData();

  const cards = [
    {
      title: "Receita Confirmada",
      subtitle: "Parcelas pendentes de projetos ativos",
      value: formatCurrency(data.confirmedTotal),
      perSocio: formatCurrency(data.confirmedTotal / 2),
      icon: DollarSign,
      color: "text-success",
    },
    {
      title: "Pipeline (Potencial)",
      subtitle: "Projetos em cotacao/negociacao",
      value: formatCurrency(data.pipelineTotal),
      perSocio: formatCurrency(data.pipelineTotal / 2),
      icon: Target,
      color: "text-purple-400",
    },
    {
      title: "Projecao Total",
      subtitle: "Se fechar tudo",
      value: formatCurrency(data.projectedTotal),
      perSocio: formatCurrency(data.projectedTotal / 2),
      icon: TrendingUp,
      color: "text-cyan-400",
    },
  ];

  return (
    <div>
      <Header title="Projecao Financeira" />

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
        {cards.map((card) => (
          <Card key={card.title} className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">{card.title}</p>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </div>
            <p className={`text-2xl font-bold mt-1 ${card.color}`}>
              {card.value}
            </p>
            <div className="flex items-center gap-1 mt-1">
              <Users className="h-3 w-3 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">
                Por socio: <span className="font-medium text-secondary">{card.perSocio}</span>
              </p>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {card.subtitle}
            </p>
          </Card>
        ))}
      </div>

      {/* Monthly Projection */}
      <Card className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Layers className="h-5 w-5 text-secondary" />
          <CardTitle>Projecao Mensal</CardTitle>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {data.months.map((m) => {
            const confirmado = m.recebido + m.aReceber;
            const total = confirmado + m.potencial;
            return (
              <div
                key={m.month}
                className="rounded-lg border border-border p-4"
              >
                <p className="text-sm font-medium capitalize">{m.month}</p>

                <div className="mt-2 space-y-1">
                  {m.recebido > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Recebido</span>
                      <span className="font-medium text-success">{formatCurrency(m.recebido)}</span>
                    </div>
                  )}
                  {m.aReceber > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">A receber</span>
                      <span className="font-medium text-warning">{formatCurrency(m.aReceber)}</span>
                    </div>
                  )}
                  {m.potencial > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Pipeline</span>
                      <span className="font-medium text-purple-400">{formatCurrency(m.potencial)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm border-t border-border pt-1">
                    <span className="text-muted-foreground">Total</span>
                    <span className="font-bold text-cyan-400">{formatCurrency(total)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 mt-2 pt-2 border-t border-border">
                  <Users className="h-3 w-3 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">
                    Por socio: <span className="font-medium text-secondary">{formatCurrency(total / 2)}</span>
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Pipeline Projects */}
      {data.pipelineProjects.length > 0 ? (
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Target className="h-5 w-5 text-purple-400" />
            <CardTitle>Pipeline - Projetos em Negociacao</CardTitle>
          </div>
          <div className="space-y-3">
            {data.pipelineProjects.map((project) => (
              <div
                key={project.id}
                className="flex items-center justify-between rounded-lg border border-border p-4"
              >
                <div>
                  <p className="font-medium">{project.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {project.client.name}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge
                    className={
                      STATUS_COLORS[
                        project.status as keyof typeof STATUS_COLORS
                      ]
                    }
                  >
                    {
                      PROJECT_STATUSES[
                        project.status as keyof typeof PROJECT_STATUSES
                      ]
                    }
                  </Badge>
                  <p className="text-sm font-bold">
                    {project.totalValue
                      ? formatCurrency(Number(project.totalValue))
                      : "Sem valor"}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-lg bg-muted/50 p-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                Total pipeline ({data.pipelineProjects.length} projetos)
              </span>
              <span className="font-bold text-purple-400">
                {formatCurrency(data.pipelineTotal)}
              </span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-muted-foreground">
                Se fechar tudo, por socio (50/50)
              </span>
              <span className="font-bold text-cyan-400">
                {formatCurrency(data.projectedTotal / 2)}
              </span>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="p-8 text-center">
          <Target className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground">
            Nenhum projeto em cotacao ou negociacao
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Crie um projeto com status &quot;Cotacao&quot; ou
            &quot;Negociacao&quot; para ver a projecao
          </p>
        </Card>
      )}
    </div>
  );
}
