"use server";

import { prisma } from "@/lib/prisma";

export async function getProjectionData() {
  // Confirmed revenue: projects ATIVO with PENDENTE installments/recurring
  const [confirmedInstallments, confirmedRecurring] = await Promise.all([
    prisma.installment.findMany({
      where: {
        status: "PENDENTE",
        project: { status: "ATIVO" },
      },
      include: { project: { include: { client: true } } },
      orderBy: { dueDate: "asc" },
    }),
    prisma.recurringCharge.findMany({
      where: {
        status: "PENDENTE",
        project: { status: "ATIVO" },
      },
      include: { project: { include: { client: true } } },
      orderBy: { dueDate: "asc" },
    }),
  ]);

  // Pipeline: projects in COTACAO or NEGOCIACAO
  const pipelineProjects = await prisma.project.findMany({
    where: { status: { in: ["COTACAO", "NEGOCIACAO"] } },
    include: { client: true },
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
  const months: { month: string; confirmado: number; potencial: number }[] = [];
  const now = new Date();

  for (let i = 0; i < 6; i++) {
    const mDate = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const mEnd = new Date(now.getFullYear(), now.getMonth() + i + 1, 0);
    const monthLabel = mDate.toLocaleDateString("pt-BR", {
      month: "short",
      year: "2-digit",
    });

    const confirmed = confirmedInstallments
      .filter((inst) => {
        const d = new Date(inst.dueDate);
        return d >= mDate && d <= mEnd;
      })
      .reduce((s, inst) => s + Number(inst.value), 0)
      + confirmedRecurring
        .filter((rc) => {
          const d = new Date(rc.dueDate);
          return d >= mDate && d <= mEnd;
        })
        .reduce((s, rc) => s + Number(rc.value), 0);

    months.push({
      month: monthLabel,
      confirmado: confirmed,
      potencial: 0,
    });
  }

  return {
    confirmedTotal,
    pipelineTotal,
    projectedTotal: confirmedTotal + pipelineTotal,
    pipelineProjects,
    confirmedInstallments,
    confirmedRecurring,
    months,
  };
}
