"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { taskSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";

export async function createTask(projectId: string, formData: FormData) {
  const session = await auth();
  if (!session) throw new Error("Não autorizado");

  const data = taskSchema.parse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    status: (formData.get("status") as string) || "TODO",
    priority: (formData.get("priority") as string) || "MEDIUM",
    assigneeId: formData.get("assigneeId") || undefined,
    dueDate: formData.get("dueDate") || undefined,
  });

  const maxOrder = await prisma.task.aggregate({
    where: { projectId, status: data.status as any },
    _max: { order: true },
  });

  await prisma.task.create({
    data: {
      projectId,
      title: data.title,
      description: data.description,
      status: data.status,
      priority: data.priority,
      order: (maxOrder._max.order ?? -1) + 1,
      assigneeId: data.assigneeId || undefined,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
    },
  });

  revalidatePath(`/projetos/${projectId}/kanban`);
}

export async function updateTask(id: string, projectId: string, formData: FormData) {
  const session = await auth();
  if (!session) throw new Error("Não autorizado");

  const data = taskSchema.parse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    status: (formData.get("status") as string) || "TODO",
    priority: (formData.get("priority") as string) || "MEDIUM",
    assigneeId: formData.get("assigneeId") || undefined,
    dueDate: formData.get("dueDate") || undefined,
  });

  await prisma.task.update({
    where: { id },
    data: {
      title: data.title,
      description: data.description,
      status: data.status,
      priority: data.priority,
      assigneeId: data.assigneeId || null,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
    },
  });

  revalidatePath(`/projetos/${projectId}/kanban`);
}

export async function deleteTask(id: string, projectId: string) {
  const session = await auth();
  if (!session) throw new Error("Não autorizado");

  await prisma.task.delete({ where: { id } });
  revalidatePath(`/projetos/${projectId}/kanban`);
}

export async function reorderTasks(
  tasks: { id: string; status: string; order: number }[],
  projectId: string
) {
  const session = await auth();
  if (!session) throw new Error("Não autorizado");

  await prisma.$transaction(
    tasks.map((task) =>
      prisma.task.update({
        where: { id: task.id },
        data: { status: task.status as any, order: task.order },
      })
    )
  );

  revalidatePath(`/projetos/${projectId}/kanban`);
}
