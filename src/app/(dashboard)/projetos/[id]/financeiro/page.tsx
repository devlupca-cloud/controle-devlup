import { getProject } from "@/actions/projects";
import { notFound } from "next/navigation";
import { ProjectFinancial } from "./project-financial";

export default async function FinanceiroPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await getProject(id);
  if (!project) notFound();

  return <ProjectFinancial project={project} />;
}
