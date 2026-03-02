"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { ProjectForm } from "@/components/forms/project-form";
import { deleteProject } from "@/actions/projects";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { Project } from "@prisma/client";

export function ProjectDetailActions({ project }: { project: Project }) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);

  async function handleDelete() {
    if (!confirm("Tem certeza que deseja excluir este projeto? Todos os dados associados serão removidos.")) return;
    try {
      await deleteProject(project.id);
      toast.success("Projeto excluído");
      router.push("/projetos");
    } catch {
      toast.error("Erro ao excluir projeto");
    }
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
        <Pencil className="h-4 w-4" />
        Editar
      </Button>
      <Button variant="destructive" size="sm" onClick={handleDelete}>
        <Trash2 className="h-4 w-4" />
        Excluir
      </Button>

      <Dialog open={editOpen} onClose={() => setEditOpen(false)} title="Editar Projeto">
        <ProjectForm
          project={project}
          onSuccess={() => {
            setEditOpen(false);
            router.refresh();
          }}
        />
      </Dialog>
    </>
  );
}
