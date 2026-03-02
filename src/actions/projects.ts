"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { projectSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";

export async function getProjects(filters?: {
  search?: string;
  status?: string;
  type?: string;
  clientId?: string;
}) {
  const where: Prisma.ProjectWhereInput = {};

  if (filters?.search) {
    where.name = { contains: filters.search, mode: "insensitive" };
  }
  if (filters?.status) {
    where.status = filters.status as any;
  }
  if (filters?.type) {
    where.type = filters.type as any;
  }
  if (filters?.clientId) {
    where.clientId = filters.clientId;
  }

  return prisma.project.findMany({
    where,
    include: { client: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getProject(id: string) {
  return prisma.project.findUnique({
    where: { id },
    include: {
      client: true,
      tasks: {
        include: { assignee: true },
        orderBy: { order: "asc" },
      },
      credentials: { orderBy: { createdAt: "desc" } },
      notes: { orderBy: { updatedAt: "desc" } },
      installments: { orderBy: { number: "asc" } },
      recurringCharges: { orderBy: { referenceMonth: "desc" } },
      expenses: {
        include: { category: true },
        orderBy: { date: "desc" },
      },
    },
  });
}

export async function createProject(formData: FormData) {
  const session = await auth();
  if (!session) throw new Error("Não autorizado");

  const data = projectSchema.parse({
    name: formData.get("name"),
    clientId: formData.get("clientId"),
    type: formData.get("type"),
    status: formData.get("status") || "ATIVO",
    description: formData.get("description") || undefined,
    startDate: formData.get("startDate") || undefined,
    endDate: formData.get("endDate") || undefined,
    totalValue: formData.get("totalValue") || undefined,
  });

  const numberOfInstallments = formData.get("numberOfInstallments");
  const installmentStartDate = formData.get("installmentStartDate");

  const project = await prisma.project.create({
    data: {
      name: data.name,
      clientId: data.clientId,
      type: data.type,
      status: data.status,
      description: data.description,
      startDate: data.startDate ? new Date(data.startDate) : undefined,
      endDate: data.endDate ? new Date(data.endDate) : undefined,
      totalValue: data.totalValue ? new Prisma.Decimal(data.totalValue) : undefined,
    },
  });

  // Generate installments if provided
  if (
    data.type === "AVULSO" &&
    data.totalValue &&
    numberOfInstallments &&
    installmentStartDate
  ) {
    const { addMonths } = await import("date-fns");
    const numInst = Number(numberOfInstallments);
    const totalVal = Number(data.totalValue);
    const start = new Date(installmentStartDate as string);

    if (numInst > 0 && totalVal > 0) {
      const installmentValue = totalVal / numInst;
      const installments = Array.from({ length: numInst }, (_, i) => ({
        projectId: project.id,
        number: i + 1,
        value: new Prisma.Decimal(installmentValue.toFixed(2)),
        dueDate: addMonths(start, i),
        status: "PENDENTE" as const,
      }));

      await prisma.installment.createMany({ data: installments });
    }
  }

  revalidatePath("/projetos");
}

export async function updateProject(id: string, formData: FormData) {
  const session = await auth();
  if (!session) throw new Error("Não autorizado");

  const data = projectSchema.parse({
    name: formData.get("name"),
    clientId: formData.get("clientId"),
    type: formData.get("type"),
    status: formData.get("status") || "ATIVO",
    description: formData.get("description") || undefined,
    startDate: formData.get("startDate") || undefined,
    endDate: formData.get("endDate") || undefined,
    totalValue: formData.get("totalValue") || undefined,
  });

  await prisma.project.update({
    where: { id },
    data: {
      name: data.name,
      clientId: data.clientId,
      type: data.type,
      status: data.status,
      description: data.description,
      startDate: data.startDate ? new Date(data.startDate) : null,
      endDate: data.endDate ? new Date(data.endDate) : null,
      totalValue: data.totalValue ? new Prisma.Decimal(data.totalValue) : null,
    },
  });

  revalidatePath(`/projetos/${id}`);
  revalidatePath("/projetos");
}

export async function deleteProject(id: string) {
  const session = await auth();
  if (!session) throw new Error("Não autorizado");

  await prisma.project.delete({ where: { id } });
  revalidatePath("/projetos");
}
