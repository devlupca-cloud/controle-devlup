"use server";

import { prisma } from "@/lib/prisma";
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns";
import { ptBR } from "date-fns/locale";

export async function getDashboardData() {
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  // Monthly revenue (paid installments + recurring charges this month)
  const [paidInstallments, paidRecurring] = await Promise.all([
    prisma.installment.aggregate({
      where: { status: "PAGO", paidAt: { gte: monthStart, lte: monthEnd } },
      _sum: { value: true },
    }),
    prisma.recurringCharge.aggregate({
      where: { status: "PAGO", paidAt: { gte: monthStart, lte: monthEnd } },
      _sum: { value: true },
    }),
  ]);

  const monthlyRevenue =
    Number(paidInstallments._sum.value || 0) +
    Number(paidRecurring._sum.value || 0);

  // Monthly expenses
  const expensesAgg = await prisma.expense.aggregate({
    where: { date: { gte: monthStart, lte: monthEnd } },
    _sum: { value: true },
  });
  const monthlyExpenses = Number(expensesAgg._sum.value || 0);

  // Pending and overdue
  const pendingInstallments = await prisma.installment.count({
    where: { status: "PENDENTE" },
  });

  const overdueInstallments = await prisma.installment.count({
    where: { status: "PENDENTE", dueDate: { lt: now } },
  });

  const overdueRecurring = await prisma.recurringCharge.count({
    where: { status: "PENDENTE", dueDate: { lt: now } },
  });

  // Revenue vs Expense (last 12 months)
  const revenueVsExpense = [];
  for (let i = 11; i >= 0; i--) {
    const mStart = startOfMonth(subMonths(now, i));
    const mEnd = endOfMonth(subMonths(now, i));

    const [inst, rec, exp] = await Promise.all([
      prisma.installment.aggregate({
        where: { status: "PAGO", paidAt: { gte: mStart, lte: mEnd } },
        _sum: { value: true },
      }),
      prisma.recurringCharge.aggregate({
        where: { status: "PAGO", paidAt: { gte: mStart, lte: mEnd } },
        _sum: { value: true },
      }),
      prisma.expense.aggregate({
        where: { date: { gte: mStart, lte: mEnd } },
        _sum: { value: true },
      }),
    ]);

    revenueVsExpense.push({
      month: format(mStart, "MMM/yy", { locale: ptBR }),
      receita: Number(inst._sum.value || 0) + Number(rec._sum.value || 0),
      despesa: Number(exp._sum.value || 0),
    });
  }

  // Revenue composition (by client)
  const clients = await prisma.client.findMany({
    include: {
      projects: {
        include: {
          installments: { where: { status: "PAGO" } },
          recurringCharges: { where: { status: "PAGO" } },
        },
      },
    },
  });

  const revenueComposition = clients
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

  // Upcoming payments
  const upcomingInstallments = await prisma.installment.findMany({
    where: { status: "PENDENTE", dueDate: { gte: now } },
    include: { project: { include: { client: true } } },
    orderBy: { dueDate: "asc" },
    take: 10,
  });

  const upcomingRecurring = await prisma.recurringCharge.findMany({
    where: { status: "PENDENTE", dueDate: { gte: now } },
    include: { project: { include: { client: true } } },
    orderBy: { dueDate: "asc" },
    take: 10,
  });

  // Receivable this month (pending installments + recurring with dueDate this month)
  const [receivableInstallments, receivableRecurring] = await Promise.all([
    prisma.installment.aggregate({
      where: { status: "PENDENTE", dueDate: { gte: monthStart, lte: monthEnd } },
      _sum: { value: true },
    }),
    prisma.recurringCharge.aggregate({
      where: { status: "PENDENTE", dueDate: { gte: monthStart, lte: monthEnd } },
      _sum: { value: true },
    }),
  ]);

  const monthlyReceivable =
    Number(receivableInstallments._sum.value || 0) +
    Number(receivableRecurring._sum.value || 0);

  const monthlyProfit = monthlyRevenue - monthlyExpenses;

  return {
    monthlyRevenue,
    monthlyReceivable,
    monthlyExpenses,
    monthlyProfit,
    pendingInstallments,
    overdueInstallments: overdueInstallments + overdueRecurring,
    partnerSplit: monthlyProfit / 2,
    revenueVsExpense,
    revenueComposition,
    profitEvolution: revenueVsExpense.map((item) => ({
      month: item.month,
      lucro: item.receita - item.despesa,
    })),
    upcomingPayments: [...upcomingInstallments, ...upcomingRecurring].sort(
      (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    ).slice(0, 10),
  };
}
