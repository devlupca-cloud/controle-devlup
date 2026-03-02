"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { credentialSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";

export async function createCredential(projectId: string, formData: FormData) {
  const session = await auth();
  if (!session) throw new Error("Não autorizado");

  const data = credentialSchema.parse({
    platform: formData.get("platform"),
    url: formData.get("url") || undefined,
    username: formData.get("username"),
    password: formData.get("password"),
    notes: formData.get("notes") || undefined,
  });

  await prisma.credential.create({
    data: { ...data, projectId },
  });

  revalidatePath(`/projetos/${projectId}/acessos`);
}

export async function updateCredential(id: string, projectId: string, formData: FormData) {
  const session = await auth();
  if (!session) throw new Error("Não autorizado");

  const data = credentialSchema.parse({
    platform: formData.get("platform"),
    url: formData.get("url") || undefined,
    username: formData.get("username"),
    password: formData.get("password"),
    notes: formData.get("notes") || undefined,
  });

  await prisma.credential.update({ where: { id }, data });
  revalidatePath(`/projetos/${projectId}/acessos`);
}

export async function deleteCredential(id: string, projectId: string) {
  const session = await auth();
  if (!session) throw new Error("Não autorizado");

  await prisma.credential.delete({ where: { id } });
  revalidatePath(`/projetos/${projectId}/acessos`);
}
