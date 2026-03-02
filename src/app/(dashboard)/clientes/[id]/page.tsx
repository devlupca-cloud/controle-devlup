import { getClient } from "@/actions/clients";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { PROJECT_STATUSES, STATUS_COLORS } from "@/lib/constants";
import { ClientDetailActions } from "./client-detail-actions";
import Link from "next/link";

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const client = await getClient(id);
  if (!client) notFound();

  const totalRevenue = client.projects.reduce((sum, p) => {
    const instTotal = p.installments
      .filter((i) => i.status === "PAGO")
      .reduce((s, i) => s + Number(i.value), 0);
    const recTotal = p.recurringCharges
      .filter((r) => r.status === "PAGO")
      .reduce((s, r) => s + Number(r.value), 0);
    return sum + instTotal + recTotal;
  }, 0);

  const pendingRevenue = client.projects.reduce((sum, p) => {
    const instTotal = p.installments
      .filter((i) => i.status === "PENDENTE")
      .reduce((s, i) => s + Number(i.value), 0);
    const recTotal = p.recurringCharges
      .filter((r) => r.status === "PENDENTE")
      .reduce((s, r) => s + Number(r.value), 0);
    return sum + instTotal + recTotal;
  }, 0);

  return (
    <div>
      <Header title={client.name}>
        <ClientDetailActions client={client} />
      </Header>

      {/* Client info */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        {client.email && (
          <Card className="p-4">
            <p className="text-xs text-muted-foreground">Email</p>
            <p className="text-sm">{client.email}</p>
          </Card>
        )}
        {client.phone && (
          <Card className="p-4">
            <p className="text-xs text-muted-foreground">Telefone</p>
            <p className="text-sm">{client.phone}</p>
          </Card>
        )}
        {client.company && (
          <Card className="p-4">
            <p className="text-xs text-muted-foreground">Empresa</p>
            <p className="text-sm">{client.company}</p>
          </Card>
        )}
        {client.document && (
          <Card className="p-4">
            <p className="text-xs text-muted-foreground">CPF/CNPJ</p>
            <p className="text-sm">{client.document}</p>
          </Card>
        )}
      </div>

      {/* Financial summary */}
      <div className="grid gap-4 sm:grid-cols-3 mb-6">
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Receita Recebida</p>
          <p className="text-xl font-bold text-success">{formatCurrency(totalRevenue)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">A Receber</p>
          <p className="text-xl font-bold text-warning">{formatCurrency(pendingRevenue)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Total de Projetos</p>
          <p className="text-xl font-bold">{client.projects.length}</p>
        </Card>
      </div>

      {/* Projects */}
      <Card>
        <CardTitle className="mb-4">Projetos</CardTitle>
        <CardContent>
          {client.projects.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum projeto</p>
          ) : (
            <div className="space-y-3">
              {client.projects.map((project) => (
                <Link
                  key={project.id}
                  href={`/projetos/${project.id}`}
                  className="flex items-center justify-between rounded-lg border border-border p-3 hover:bg-muted/50 transition-colors"
                >
                  <div>
                    <p className="font-medium">{project.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {project.type === "AVULSO" ? "Avulso" : "Recorrente"} · Criado em {formatDate(project.createdAt)}
                    </p>
                  </div>
                  <Badge className={STATUS_COLORS[project.status as keyof typeof STATUS_COLORS]}>
                    {PROJECT_STATUSES[project.status as keyof typeof PROJECT_STATUSES]}
                  </Badge>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
