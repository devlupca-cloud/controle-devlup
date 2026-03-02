"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { noteSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";

export async function createNote(projectId: string, formData: FormData) {
  const session = await auth();
  if (!session) throw new Error("Não autorizado");

  const data = noteSchema.parse({
    title: formData.get("title"),
    content: (formData.get("content") as string) || "",
  });

  await prisma.note.create({
    data: { ...data, projectId },
  });

  revalidatePath(`/projetos/${projectId}/notas`);
}

export async function updateNote(id: string, projectId: string, data: { title?: string; content?: string }) {
  const session = await auth();
  if (!session) throw new Error("Não autorizado");

  await prisma.note.update({ where: { id }, data });
  revalidatePath(`/projetos/${projectId}/notas`);
}

export async function deleteNote(id: string, projectId: string) {
  const session = await auth();
  if (!session) throw new Error("Não autorizado");

  await prisma.note.delete({ where: { id } });
  revalidatePath(`/projetos/${projectId}/notas`);
}
