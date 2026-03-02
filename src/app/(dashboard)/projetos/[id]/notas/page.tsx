import { getProject } from "@/actions/projects";
import { notFound } from "next/navigation";
import { NotesList } from "./notes-list";

export default async function NotasPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await getProject(id);
  if (!project) notFound();

  return <NotesList projectId={id} notes={project.notes} />;
}
