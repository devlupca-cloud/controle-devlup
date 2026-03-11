"use server";

import { prisma } from "@/lib/prisma";

export async function getProjectionData() {
  // Confirmed revenue: projects ATIVO with PENDENTE or PAGO installments/recurring
  const [confirmedInstallments, confirmedRecurring] = await Promise.all([
    prisma.installment.findMany({
      where: {
        status: { in: ["PENDENTE", "PAGO"] },
        project: { status: "ATIVO" },
      },
      include: { project: { include: { client: true } } },
      orderBy: { dueDate: "asc" },
    }),
    prisma.recurringCharge.findMany({
      where: {
        status: { in: ["PENDENTE", "PAGO"] },
        project: { status: "ATIVO" },
      },
      include: { project: { include: { client: true } } },
      orderBy: { dueDate: "asc" },
    }),
  ]);

  // Pipeline: projects in COTACAO or NEGOCIACAO
  const pipelineProjects = await prisma.project.findMany({
    where: { status: { in: ["COTACAO", "NEGOCIACAO"] } },
    include: { client: true, installments: { orderBy: { dueDate: "asc" } } },
    orderBy: { createdAt: "desc" },
  });

  // Confirmed total
  const confirmedTotal =
    confirmedInstallments.reduce((s, i) => s + Number(i.value), 0) +
    confirmedRecurring.reduce((s, r) => s + Number(r.value), 0);

  // Pipeline total
  const pipelineTotal = pipelineProjects.reduce(
    (s, p) => s + Number(p.totalValue || 0),
    0
  );

  // Build monthly projection (next 6 months)
  const now = new Date();
  const months: { month: string; recebido: number; aReceber: number; potencial: number }[] = [];

  // Pre-calculate pipeline monthly distribution
  // Projects without installments: distribute totalValue evenly over 5 months starting now
  const pipelineMonthly: Record<string, number> = {};
  for (const project of pipelineProjects) {
    if (project.installments.length > 0) {
      // Has installments, use actual dates
      for (const inst of project.installments) {
        const d = new Date(inst.dueDate);
        const key = `${d.getFullYear()}-${d.getMonth()}`;
        pipelineMonthly[key] = (pipelineMonthly[key] || 0) + Number(inst.value);
      }
    } else if (project.totalValue) {
      // No installments, distribute over estimated months
      const total = Number(project.totalValue);
      const numParcelas = project.estimatedInstallments || 1;
      const valorParcela = total / numParcelas;
      for (let i = 0; i < numParcelas; i++) {
        const mDate = new Date(now.getFullYear(), now.getMonth() + i, 1);
        const key = `${mDate.getFullYear()}-${mDate.getMonth()}`;
        pipelineMonthly[key] = (pipelineMonthly[key] || 0) + valorParcela;
      }
    }
  }

  for (let i = 0; i < 6; i++) {
    const mDate = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const mEnd = new Date(now.getFullYear(), now.getMonth() + i + 1, 0);
    const monthKey = `${mDate.getFullYear()}-${mDate.getMonth()}`;
    const monthLabel = mDate.toLocaleDateString("pt-BR", {
      month: "short",
      year: "2-digit",
    });

    const monthInstallments = confirmedInstallments.filter((inst) => {
      const d = new Date(inst.dueDate);
      return d >= mDate && d <= mEnd;
    });
    const monthRecurring = confirmedRecurring.filter((rc) => {
      const d = new Date(rc.dueDate);
      return d >= mDate && d <= mEnd;
    });

    const recebido =
      monthInstallments.filter((i) => i.status === "PAGO").reduce((s, i) => s + Number(i.value), 0) +
      monthRecurring.filter((r) => r.status === "PAGO").reduce((s, r) => s + Number(r.value), 0);

    const aReceber =
      monthInstallments.filter((i) => i.status === "PENDENTE").reduce((s, i) => s + Number(i.value), 0) +
      monthRecurring.filter((r) => r.status === "PENDENTE").reduce((s, r) => s + Number(r.value), 0);

    months.push({
      month: monthLabel,
      recebido,
      aReceber,
      potencial: pipelineMonthly[monthKey] || 0,
    });
  }

  return {
    confirmedTotal,
    pipelineTotal,
    projectedTotal: confirmedTotal + pipelineTotal,
    pipelineProjects,
    months,
  };
}
