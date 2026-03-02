import { getProject } from "@/actions/projects";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { PROJECT_STATUSES, PROJECT_TYPES, STATUS_COLORS } from "@/lib/constants";
import { ProjectDetailActions } from "./project-detail-actions";

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await getProject(id);
  if (!project) notFound();

  const totalPaid =
    project.installments.filter((i) => i.status === "PAGO").reduce((s, i) => s + Number(i.value), 0) +
    project.recurringCharges.filter((r) => r.status === "PAGO").reduce((s, r) => s + Number(r.value), 0);

  const totalPending =
    project.installments.filter((i) => i.status === "PENDENTE").reduce((s, i) => s + Number(i.value), 0) +
    project.recurringCharges.filter((r) => r.status === "PENDENTE").reduce((s, r) => s + Number(r.value), 0);

  const totalExpenses = project.expenses.reduce((s, e) => s + Number(e.value), 0);

  return (
    <div>
      <Header title={project.name}>
        <Badge className={STATUS_COLORS[project.status as keyof typeof STATUS_COLORS]}>
          {PROJECT_STATUSES[project.status as keyof typeof PROJECT_STATUSES]}
        </Badge>
        <ProjectDetailActions project={project} />
      </Header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Cliente</p>
          <p className="font-medium">{project.client.name}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Tipo</p>
          <p className="font-medium">{PROJECT_TYPES[project.type as keyof typeof PROJECT_TYPES]}</p>
        </Card>
        {project.startDate && (
          <Card className="p-4">
            <p className="text-xs text-muted-foreground">Início</p>
            <p className="font-medium">{formatDate(project.startDate)}</p>
          </Card>
        )}
        {project.totalValue && (
          <Card className="p-4">
            <p className="text-xs text-muted-foreground">Valor Total</p>
            <p className="font-medium">{formatCurrency(Number(project.totalValue))}</p>
          </Card>
        )}
      </div>

      {project.description && (
        <Card className="mb-6 p-4">
          <p className="text-xs text-muted-foreground mb-1">Descrição</p>
          <p className="text-sm">{project.description}</p>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Receita Recebida</p>
          <p className="text-xl font-bold text-success">{formatCurrency(totalPaid)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">A Receber</p>
          <p className="text-xl font-bold text-warning">{formatCurrency(totalPending)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Lucro</p>
          <p className="text-xl font-bold">{formatCurrency(totalPaid - totalExpenses)}</p>
        </Card>
      </div>
    </div>
  );
}
