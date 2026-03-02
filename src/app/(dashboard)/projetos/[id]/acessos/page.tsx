import { getProject } from "@/actions/projects";
import { notFound } from "next/navigation";
import { CredentialsList } from "./credentials-list";

export default async function AcessosPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await getProject(id);
  if (!project) notFound();

  return <CredentialsList projectId={id} credentials={project.credentials} />;
}
