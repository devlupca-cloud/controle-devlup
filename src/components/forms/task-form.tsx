"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createTask, updateTask, deleteTask } from "@/actions/tasks";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import type { Task, User } from "@prisma/client";

interface TaskFormProps {
  projectId: string;
  task?: Task;
  users: User[];
  onSuccess?: () => void;
}

export function TaskForm({ projectId, task, users, onSuccess }: TaskFormProps) {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      if (task) {
        await updateTask(task.id, projectId, formData);
        toast.success("Tarefa atualizada!");
      } else {
        await createTask(projectId, formData);
        toast.success("Tarefa criada!");
      }
      onSuccess?.();
    } catch {
      toast.error("Erro ao salvar tarefa");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!task || !confirm("Excluir esta tarefa?")) return;
    try {
      await deleteTask(task.id, projectId);
      toast.success("Tarefa excluída");
      onSuccess?.();
    } catch {
      toast.error("Erro ao excluir tarefa");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input id="title" name="title" label="Título *" defaultValue={task?.title} required />
      <Textarea id="description" name="description" label="Descrição" defaultValue={task?.description || ""} />
      <div className="grid grid-cols-2 gap-4">
        <Select
          id="status"
          name="status"
          label="Status"
          options={[
            { value: "TODO", label: "A Fazer" },
            { value: "IN_PROGRESS", label: "Fazendo" },
            { value: "DONE", label: "Feito" },
          ]}
          defaultValue={task?.status || "TODO"}
        />
        <Select
          id="priority"
          name="priority"
          label="Prioridade"
          options={[
            { value: "LOW", label: "Baixa" },
            { value: "MEDIUM", label: "Média" },
            { value: "HIGH", label: "Alta" },
            { value: "URGENT", label: "Urgente" },
          ]}
          defaultValue={task?.priority || "MEDIUM"}
        />
      </div>
      <Select
        id="assigneeId"
        name="assigneeId"
        label="Responsável"
        options={users.map((u) => ({ value: u.id, label: u.name }))}
        placeholder="Não atribuído"
        defaultValue={task?.assigneeId || ""}
      />
      <Input
        id="dueDate"
        name="dueDate"
        label="Data Limite"
        type="date"
        defaultValue={task?.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : ""}
      />
      <div className="flex gap-2">
        <Button type="submit" className="flex-1" disabled={loading}>
          {loading ? "Salvando..." : task ? "Atualizar" : "Criar Tarefa"}
        </Button>
        {task && (
          <Button type="button" variant="destructive" size="icon" onClick={handleDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </form>
  );
}
