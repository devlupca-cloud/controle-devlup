"use server";

import { prisma } from "@/lib/prisma";
import { startOfMonth, endOfMonth, eachMonthOfInterval, format } from "date-fns";
import { ptBR } from "date-fns/locale";

export async function getReportData(startDate: string, endDate: string) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  const months = eachMonthOfInterval({ start, end });

  // Revenue by period
  const revenueByPeriod = await Promise.all(
    months.map(async (month) => {
      const mStart = startOfMonth(month);
      const mEnd = endOfMonth(month);

      const [inst, rec] = await Promise.all([
        prisma.installment.aggregate({
          where: { status: "PAGO", paidAt: { gte: mStart, lte: mEnd } },
          _sum: { value: true },
        }),
        prisma.recurringCharge.aggregate({
          where: { status: "PAGO", paidAt: { gte: mStart, lte: mEnd } },
          _sum: { value: true },
        }),
      ]);

      return {
        month: format(month, "MMM/yy", { locale: ptBR }),
        receita: Number(inst._sum.value || 0) + Number(rec._sum.value || 0),
      };
    })
  );

  // Revenue by client
  const clients = await prisma.client.findMany({
    include: {
      projects: {
        include: {
          installments: {
            where: { status: "PAGO", paidAt: { gte: start, lte: end } },
          },
          recurringCharges: {
            where: { status: "PAGO", paidAt: { gte: start, lte: end } },
          },
        },
      },
    },
  });

  const revenueByClient = clients
    .map((client) => {
      const total = client.projects.reduce((sum, p) => {
        const instTotal = p.installments.reduce((s, i) => s + Number(i.value), 0);
        const recTotal = p.recurringCharges.reduce((s, r) => s + Number(r.value), 0);
        return sum + instTotal + recTotal;
      }, 0);
      return { name: client.name, value: total };
    })
    .filter((c) => c.value > 0)
    .sort((a, b) => b.value - a.value);

  // Expenses by category
  const categories = await prisma.expenseCategory.findMany({
    include: {
      expenses: {
        where: { date: { gte: start, lte: end } },
      },
    },
  });

  const expensesByCategory = categories
    .map((cat) => ({
      name: cat.name,
      value: cat.expenses.reduce((sum, e) => sum + Number(e.value), 0),
    }))
    .filter((c) => c.value > 0)
    .sort((a, b) => b.value - a.value);

  // Profit by project
  const projects = await prisma.project.findMany({
    include: {
      client: true,
      installments: {
        where: { status: "PAGO", paidAt: { gte: start, lte: end } },
      },
      recurringCharges: {
        where: { status: "PAGO", paidAt: { gte: start, lte: end } },
      },
      expenses: {
        where: { date: { gte: start, lte: end } },
      },
    },
  });

  const profitByProject = projects
    .map((p) => {
      const revenue =
        p.installments.reduce((s, i) => s + Number(i.value), 0) +
        p.recurringCharges.reduce((s, r) => s + Number(r.value), 0);
      const expenses = p.expenses.reduce((s, e) => s + Number(e.value), 0);
      return {
        name: `${p.name} (${p.client.name})`,
        receita: revenue,
        despesa: expenses,
        lucro: revenue - expenses,
      };
    })
    .filter((p) => p.receita > 0 || p.despesa > 0)
    .sort((a, b) => b.lucro - a.lucro);

  return {
    revenueByPeriod,
    revenueByClient,
    expensesByCategory,
    profitByProject,
  };
}
