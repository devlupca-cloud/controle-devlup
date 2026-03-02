"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { clientSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";

export async function getClients(search?: string) {
  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { company: { contains: search, mode: "insensitive" as const } },
          { email: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {};

  return prisma.client.findMany({
    where,
    include: { projects: true },
    orderBy: { name: "asc" },
  });
}

export async function getClient(id: string) {
  return prisma.client.findUnique({
    where: { id },
    include: {
      projects: {
        include: {
          installments: true,
          recurringCharges: true,
          expenses: { include: { category: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

export async function createClient(formData: FormData) {
  const session = await auth();
  if (!session) throw new Error("Não autorizado");

  const data = clientSchema.parse({
    name: formData.get("name"),
    email: formData.get("email") || undefined,
    phone: formData.get("phone") || undefined,
    company: formData.get("company") || undefined,
    document: formData.get("document") || undefined,
    notes: formData.get("notes") || undefined,
  });

  await prisma.client.create({ data });
  revalidatePath("/clientes");
}

export async function updateClient(id: string, formData: FormData) {
  const session = await auth();
  if (!session) throw new Error("Não autorizado");

  const data = clientSchema.parse({
    name: formData.get("name"),
    email: formData.get("email") || undefined,
    phone: formData.get("phone") || undefined,
    company: formData.get("company") || undefined,
    document: formData.get("document") || undefined,
    notes: formData.get("notes") || undefined,
  });

  await prisma.client.update({ where: { id }, data });
  revalidatePath(`/clientes/${id}`);
  revalidatePath("/clientes");
}

export async function deleteClient(id: string) {
  const session = await auth();
  if (!session) throw new Error("Não autorizado");

  await prisma.client.delete({ where: { id } });
  revalidatePath("/clientes");
}
