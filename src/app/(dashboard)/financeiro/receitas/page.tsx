import { prisma } from "@/lib/prisma";
import { Header } from "@/components/layout/header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { PAYMENT_STATUS_COLORS } from "@/lib/constants";
import type { PaymentStatus } from "@/types";

function getDisplayStatus(status: string, dueDate: Date): PaymentStatus {
  if (status === "PENDENTE" && new Date(dueDate) < new Date()) return "VENCIDO";
  return status as PaymentStatus;
}

const statusLabels: Record<PaymentStatus, string> = {
  PENDENTE: "Pendente",
  PAGO: "Pago",
  CANCELADO: "Cancelado",
  VENCIDO: "Vencido",
};

export default async function ReceitasPage() {
  const [installments, recurringCharges] = await Promise.all([
    prisma.installment.findMany({
      include: { project: { include: { client: true } } },
      orderBy: { dueDate: "desc" },
    }),
    prisma.recurringCharge.findMany({
      include: { project: { include: { client: true } } },
      orderBy: { dueDate: "desc" },
    }),
  ]);

  return (
    <div>
      <Header title="Receitas" />

      {/* Installments */}
      <Card className="mb-6">
        <h2 className="text-lg font-semibold mb-4">Parcelas</h2>
        {installments.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">Nenhuma parcela</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-2 text-left text-sm font-medium text-muted-foreground">Projeto</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-muted-foreground">Cliente</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-muted-foreground">#</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-muted-foreground">Valor</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-muted-foreground">Vencimento</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {installments.map((inst) => {
                  const displayStatus = getDisplayStatus(inst.status, inst.dueDate);
                  return (
                    <tr key={inst.id} className="border-b border-border/50">
                      <td className="px-4 py-2 text-sm">{inst.project.name}</td>
                      <td className="px-4 py-2 text-sm">{inst.project.client.name}</td>
                      <td className="px-4 py-2 text-sm">{inst.number}</td>
                      <td className="px-4 py-2 text-sm">{formatCurrency(Number(inst.value))}</td>
                      <td className="px-4 py-2 text-sm">{formatDate(inst.dueDate)}</td>
                      <td className="px-4 py-2">
                        <Badge className={PAYMENT_STATUS_COLORS[displayStatus]}>
                          {statusLabels[displayStatus]}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Recurring Charges */}
      <Card>
        <h2 className="text-lg font-semibold mb-4">Cobranças Recorrentes</h2>
        {recurringCharges.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">Nenhuma cobrança</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-2 text-left text-sm font-medium text-muted-foreground">Projeto</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-muted-foreground">Cliente</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-muted-foreground">Descrição</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-muted-foreground">Valor</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-muted-foreground">Vencimento</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {recurringCharges.map((charge) => {
                  const displayStatus = getDisplayStatus(charge.status, charge.dueDate);
                  return (
                    <tr key={charge.id} className="border-b border-border/50">
                      <td className="px-4 py-2 text-sm">{charge.project.name}</td>
                      <td className="px-4 py-2 text-sm">{charge.project.client.name}</td>
                      <td className="px-4 py-2 text-sm">{charge.description}</td>
                      <td className="px-4 py-2 text-sm">{formatCurrency(Number(charge.value))}</td>
                      <td className="px-4 py-2 text-sm">{formatDate(charge.dueDate)}</td>
                      <td className="px-4 py-2">
                        <Badge className={PAYMENT_STATUS_COLORS[displayStatus]}>
                          {statusLabels[displayStatus]}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
