"use client";

import { useState } from "react";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { generateInstallments, markInstallmentAsPaid, deleteProjectInstallments, cancelInstallment } from "@/actions/installments";
import { createRecurringCharge, markRecurringChargeAsPaid, deleteRecurringCharge } from "@/actions/recurring-charges";
import { formatCurrency, formatDate } from "@/lib/utils";
import { PAYMENT_STATUS_COLORS } from "@/lib/constants";
import { Plus, Trash2, Check, X } from "lucide-react";
import { toast } from "sonner";
import type { ProjectWithRelations, PaymentStatus } from "@/types";

function getPaymentDisplayStatus(status: string, dueDate: Date): PaymentStatus {
  if (status === "PENDENTE" && new Date(dueDate) < new Date()) return "VENCIDO";
  return status as PaymentStatus;
}

const statusLabels: Record<PaymentStatus, string> = {
  PENDENTE: "Pendente",
  PAGO: "Pago",
  CANCELADO: "Cancelado",
  VENCIDO: "Vencido",
};

export function ProjectFinancial({ project }: { project: ProjectWithRelations }) {
  const [installmentDialog, setInstallmentDialog] = useState(false);
  const [recurringDialog, setRecurringDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  const totalExpenses = project.expenses.reduce((s, e) => s + Number(e.value), 0);
  const totalPaidInst = project.installments
    .filter((i) => i.status === "PAGO")
    .reduce((s, i) => s + Number(i.value), 0);
  const totalPaidRec = project.recurringCharges
    .filter((r) => r.status === "PAGO")
    .reduce((s, r) => s + Number(r.value), 0);
  const totalRevenue = totalPaidInst + totalPaidRec;

  async function handleGenerateInstallments(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      await generateInstallments(
        project.id,
        Number(formData.get("totalValue")),
        Number(formData.get("numberOfInstallments")),
        formData.get("startDate") as string
      );
      toast.success("Parcelas geradas!");
      setInstallmentDialog(false);
      window.location.reload();
    } catch {
      toast.error("Erro ao gerar parcelas");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateRecurring(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      await createRecurringCharge(project.id, formData);
      toast.success("Cobrança criada!");
      setRecurringDialog(false);
      window.location.reload();
    } catch {
      toast.error("Erro ao criar cobrança");
    } finally {
      setLoading(false);
    }
  }

  async function handleMarkPaid(type: "installment" | "recurring", id: string) {
    try {
      if (type === "installment") {
        await markInstallmentAsPaid(id, project.id);
      } else {
        await markRecurringChargeAsPaid(id, project.id);
      }
      toast.success("Marcado como pago!");
      window.location.reload();
    } catch {
      toast.error("Erro");
    }
  }

  async function handleDeleteAllInstallments() {
    if (!confirm("Excluir todas as parcelas deste projeto?")) return;
    try {
      await deleteProjectInstallments(project.id);
      toast.success("Parcelas excluídas");
      window.location.reload();
    } catch {
      toast.error("Erro");
    }
  }

  async function handleDeleteRecurring(id: string) {
    if (!confirm("Excluir esta cobrança?")) return;
    try {
      await deleteRecurringCharge(id, project.id);
      toast.success("Cobrança excluída");
      window.location.reload();
    } catch {
      toast.error("Erro");
    }
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Receita Total</p>
          <p className="text-xl font-bold text-success">{formatCurrency(totalRevenue)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Despesas</p>
          <p className="text-xl font-bold text-destructive">{formatCurrency(totalExpenses)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Lucro</p>
          <p className="text-xl font-bold">{formatCurrency(totalRevenue - totalExpenses)}</p>
        </Card>
      </div>

      {/* Installments (Avulso) */}
      {project.type === "AVULSO" && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <CardTitle>Parcelas</CardTitle>
            <div className="flex gap-2">
              {project.installments.length > 0 && (
                <Button variant="destructive" size="sm" onClick={handleDeleteAllInstallments}>
                  <Trash2 className="h-4 w-4" />
                  Limpar
                </Button>
              )}
              <Button size="sm" onClick={() => setInstallmentDialog(true)}>
                <Plus className="h-4 w-4" />
                Gerar Parcelas
              </Button>
            </div>
          </div>

          {project.installments.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Nenhuma parcela gerada</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-4 py-2 text-left text-sm font-medium text-muted-foreground">#</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-muted-foreground">Valor</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-muted-foreground">Vencimento</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-muted-foreground">Status</th>
                    <th className="px-4 py-2 text-right text-sm font-medium text-muted-foreground">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {project.installments.map((inst) => {
                    const displayStatus = getPaymentDisplayStatus(inst.status, inst.dueDate);
                    return (
                      <tr key={inst.id} className="border-b border-border/50">
                        <td className="px-4 py-2 text-sm">{inst.number}</td>
                        <td className="px-4 py-2 text-sm">{formatCurrency(Number(inst.value))}</td>
                        <td className="px-4 py-2 text-sm">{formatDate(inst.dueDate)}</td>
                        <td className="px-4 py-2">
                          <Badge className={PAYMENT_STATUS_COLORS[displayStatus]}>
                            {statusLabels[displayStatus]}
                          </Badge>
                        </td>
                        <td className="px-4 py-2 text-right">
                          {inst.status === "PENDENTE" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMarkPaid("installment", inst.id)}
                            >
                              <Check className="h-4 w-4 text-success" />
                              Pagar
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* Recurring Charges */}
      {project.type === "RECORRENTE" && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <CardTitle>Cobranças Recorrentes</CardTitle>
            <Button size="sm" onClick={() => setRecurringDialog(true)}>
              <Plus className="h-4 w-4" />
              Nova Cobrança
            </Button>
          </div>

          {project.recurringCharges.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Nenhuma cobrança</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-4 py-2 text-left text-sm font-medium text-muted-foreground">Descrição</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-muted-foreground">Valor</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-muted-foreground">Vencimento</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-muted-foreground">Status</th>
                    <th className="px-4 py-2 text-right text-sm font-medium text-muted-foreground">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {project.recurringCharges.map((charge) => {
                    const displayStatus = getPaymentDisplayStatus(charge.status, charge.dueDate);
                    return (
                      <tr key={charge.id} className="border-b border-border/50">
                        <td className="px-4 py-2 text-sm">{charge.description}</td>
                        <td className="px-4 py-2 text-sm">{formatCurrency(Number(charge.value))}</td>
                        <td className="px-4 py-2 text-sm">{formatDate(charge.dueDate)}</td>
                        <td className="px-4 py-2">
                          <Badge className={PAYMENT_STATUS_COLORS[displayStatus]}>
                            {statusLabels[displayStatus]}
                          </Badge>
                        </td>
                        <td className="px-4 py-2 text-right flex justify-end gap-1">
                          {charge.status === "PENDENTE" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMarkPaid("recurring", charge.id)}
                            >
                              <Check className="h-4 w-4 text-success" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteRecurring(charge.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* Expenses linked to project */}
      {project.expenses.length > 0 && (
        <Card>
          <CardTitle className="mb-4">Despesas do Projeto</CardTitle>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-2 text-left text-sm font-medium text-muted-foreground">Descrição</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-muted-foreground">Categoria</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-muted-foreground">Valor</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-muted-foreground">Data</th>
                </tr>
              </thead>
              <tbody>
                {project.expenses.map((expense) => (
                  <tr key={expense.id} className="border-b border-border/50">
                    <td className="px-4 py-2 text-sm">{expense.description}</td>
                    <td className="px-4 py-2 text-sm">{expense.category.name}</td>
                    <td className="px-4 py-2 text-sm">{formatCurrency(Number(expense.value))}</td>
                    <td className="px-4 py-2 text-sm">{formatDate(expense.date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Generate Installments Dialog */}
      <Dialog open={installmentDialog} onClose={() => setInstallmentDialog(false)} title="Gerar Parcelas">
        <form onSubmit={handleGenerateInstallments} className="space-y-4">
          <Input
            id="totalValue"
            name="totalValue"
            label="Valor Total *"
            type="number"
            step="0.01"
            defaultValue={project.totalValue ? String(project.totalValue) : ""}
            required
          />
          <Input
            id="numberOfInstallments"
            name="numberOfInstallments"
            label="Número de Parcelas *"
            type="number"
            min="1"
            max="48"
            defaultValue="1"
            required
          />
          <Input
            id="startDate"
            name="startDate"
            label="Data Primeiro Vencimento *"
            type="date"
            required
          />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Gerando..." : "Gerar Parcelas"}
          </Button>
        </form>
      </Dialog>

      {/* Recurring Charge Dialog */}
      <Dialog open={recurringDialog} onClose={() => setRecurringDialog(false)} title="Nova Cobrança Recorrente">
        <form onSubmit={handleCreateRecurring} className="space-y-4">
          <Input id="description" name="description" label="Descrição *" required />
          <Input id="value" name="value" label="Valor *" type="number" step="0.01" required />
          <Input id="referenceMonth" name="referenceMonth" label="Mês Referência *" type="month" required />
          <Input id="dueDate" name="dueDate" label="Data Vencimento *" type="date" required />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Criando..." : "Criar Cobrança"}
          </Button>
        </form>
      </Dialog>
    </div>
  );
}
