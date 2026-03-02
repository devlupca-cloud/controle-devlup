"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { recurringChargeSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";

export async function createRecurringCharge(projectId: string, formData: FormData) {
  const session = await auth();
  if (!session) throw new Error("Não autorizado");

  const data = recurringChargeSchema.parse({
    description: formData.get("description"),
    value: formData.get("value"),
    referenceMonth: formData.get("referenceMonth"),
    dueDate: formData.get("dueDate"),
  });

  await prisma.recurringCharge.create({
    data: {
      projectId,
      description: data.description,
      value: new Prisma.Decimal(data.value),
      referenceMonth: new Date(data.referenceMonth),
      dueDate: new Date(data.dueDate),
      status: "PENDENTE",
    },
  });

  revalidatePath(`/projetos/${projectId}/financeiro`);
}

export async function markRecurringChargeAsPaid(id: string, projectId: string) {
  const session = await auth();
  if (!session) throw new Error("Não autorizado");

  await prisma.recurringCharge.update({
    where: { id },
    data: { status: "PAGO", paidAt: new Date() },
  });

  revalidatePath(`/projetos/${projectId}/financeiro`);
  revalidatePath("/financeiro");
  revalidatePath("/dashboard");
}

export async function deleteRecurringCharge(id: string, projectId: string) {
  const session = await auth();
  if (!session) throw new Error("Não autorizado");

  await prisma.recurringCharge.delete({ where: { id } });
  revalidatePath(`/projetos/${projectId}/financeiro`);
}
