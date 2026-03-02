"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { expenseSchema, expenseCategorySchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";

export async function getExpenses(filters?: {
  search?: string;
  categoryId?: string;
  projectId?: string;
  startDate?: string;
  endDate?: string;
}) {
  const where: Prisma.ExpenseWhereInput = {};

  if (filters?.search) {
    where.description = { contains: filters.search, mode: "insensitive" };
  }
  if (filters?.categoryId) {
    where.categoryId = filters.categoryId;
  }
  if (filters?.projectId) {
    where.projectId = filters.projectId;
  }
  if (filters?.startDate || filters?.endDate) {
    where.date = {};
    if (filters.startDate) where.date.gte = new Date(filters.startDate);
    if (filters.endDate) where.date.lte = new Date(filters.endDate);
  }

  return prisma.expense.findMany({
    where,
    include: { category: true, project: true },
    orderBy: { date: "desc" },
  });
}

export async function createExpense(formData: FormData) {
  const session = await auth();
  if (!session) throw new Error("Não autorizado");

  const data = expenseSchema.parse({
    description: formData.get("description"),
    value: formData.get("value"),
    date: formData.get("date"),
    dueDate: formData.get("dueDate") || undefined,
    status: formData.get("status") || "PENDENTE",
    categoryId: formData.get("categoryId"),
    projectId: formData.get("projectId") || undefined,
    notes: formData.get("notes") || undefined,
  });

  await prisma.expense.create({
    data: {
      description: data.description,
      value: new Prisma.Decimal(data.value),
      date: new Date(data.date),
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      status: data.status,
      paidAt: data.status === "PAGO" ? new Date() : undefined,
      categoryId: data.categoryId,
      projectId: data.projectId || undefined,
      notes: data.notes,
    },
  });

  revalidatePath("/financeiro/despesas");
  revalidatePath("/financeiro");
  revalidatePath("/dashboard");
}

export async function updateExpense(id: string, formData: FormData) {
  const session = await auth();
  if (!session) throw new Error("Não autorizado");

  const data = expenseSchema.parse({
    description: formData.get("description"),
    value: formData.get("value"),
    date: formData.get("date"),
    dueDate: formData.get("dueDate") || undefined,
    status: formData.get("status") || "PENDENTE",
    categoryId: formData.get("categoryId"),
    projectId: formData.get("projectId") || undefined,
    notes: formData.get("notes") || undefined,
  });

  await prisma.expense.update({
    where: { id },
    data: {
      description: data.description,
      value: new Prisma.Decimal(data.value),
      date: new Date(data.date),
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      status: data.status,
      categoryId: data.categoryId,
      projectId: data.projectId || null,
      notes: data.notes,
    },
  });

  revalidatePath("/financeiro/despesas");
  revalidatePath("/financeiro");
}

export async function toggleExpenseStatus(id: string) {
  const session = await auth();
  if (!session) throw new Error("Não autorizado");

  const expense = await prisma.expense.findUnique({ where: { id } });
  if (!expense) throw new Error("Despesa não encontrada");

  const newStatus = expense.status === "PAGO" ? "PENDENTE" : "PAGO";

  await prisma.expense.update({
    where: { id },
    data: {
      status: newStatus,
      paidAt: newStatus === "PAGO" ? new Date() : null,
    },
  });

  revalidatePath("/financeiro/despesas");
  revalidatePath("/financeiro");
  revalidatePath("/dashboard");
}

export async function deleteExpense(id: string) {
  const session = await auth();
  if (!session) throw new Error("Não autorizado");

  await prisma.expense.delete({ where: { id } });
  revalidatePath("/financeiro/despesas");
  revalidatePath("/financeiro");
}

export async function getExpenseCategories() {
  return prisma.expenseCategory.findMany({ orderBy: { name: "asc" } });
}

export async function createExpenseCategory(formData: FormData) {
  const session = await auth();
  if (!session) throw new Error("Não autorizado");

  const data = expenseCategorySchema.parse({
    name: formData.get("name"),
  });

  await prisma.expenseCategory.create({ data });
  revalidatePath("/financeiro/despesas");
}

export async function deleteExpenseCategory(id: string) {
  const session = await auth();
  if (!session) throw new Error("Não autorizado");

  await prisma.expenseCategory.delete({ where: { id } });
  revalidatePath("/financeiro/despesas");
}
