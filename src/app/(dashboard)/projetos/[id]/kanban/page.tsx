import { getProject } from "@/actions/projects";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { KanbanBoard } from "@/components/kanban/board";

export default async function KanbanPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await getProject(id);
  if (!project) notFound();

  const users = await prisma.user.findMany({ orderBy: { name: "asc" } });

  return (
    <KanbanBoard
      projectId={id}
      tasks={project.tasks}
      users={users}
    />
  );
}
