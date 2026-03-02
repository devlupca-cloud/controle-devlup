"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { addMonths } from "date-fns";

export async function generateInstallments(
  projectId: string,
  totalValue: number,
  numberOfInstallments: number,
  startDate: string
) {
  const session = await auth();
  if (!session) throw new Error("Não autorizado");

  const installmentValue = totalValue / numberOfInstallments;
  const start = new Date(startDate);

  const installments = Array.from({ length: numberOfInstallments }, (_, i) => ({
    projectId,
    number: i + 1,
    value: new Prisma.Decimal(installmentValue.toFixed(2)),
    dueDate: addMonths(start, i),
    status: "PENDENTE" as const,
  }));

  await prisma.installment.createMany({ data: installments });
  revalidatePath(`/projetos/${projectId}/financeiro`);
}

export async function markInstallmentAsPaid(id: string, projectId: string) {
  const session = await auth();
  if (!session) throw new Error("Não autorizado");

  await prisma.installment.update({
    where: { id },
    data: { status: "PAGO", paidAt: new Date() },
  });

  revalidatePath(`/projetos/${projectId}/financeiro`);
  revalidatePath("/financeiro");
  revalidatePath("/dashboard");
}

export async function cancelInstallment(id: string, projectId: string) {
  const session = await auth();
  if (!session) throw new Error("Não autorizado");

  await prisma.installment.update({
    where: { id },
    data: { status: "CANCELADO" },
  });

  revalidatePath(`/projetos/${projectId}/financeiro`);
}

export async function deleteProjectInstallments(projectId: string) {
  const session = await auth();
  if (!session) throw new Error("Não autorizado");

  await prisma.installment.deleteMany({ where: { projectId } });
  revalidatePath(`/projetos/${projectId}/financeiro`);
}
