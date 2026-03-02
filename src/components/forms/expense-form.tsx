"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createExpense } from "@/actions/expenses";
import { toast } from "sonner";
import type { ExpenseCategory, Project, Client } from "@prisma/client";

type ProjectWithClient = Project & { client: Client };

interface ExpenseFormProps {
  categories: ExpenseCategory[];
  projects: ProjectWithClient[];
  onSuccess?: () => void;
}

export function ExpenseForm({ categories, projects, onSuccess }: ExpenseFormProps) {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      await createExpense(formData);
      toast.success("Despesa criada!");
      onSuccess?.();
    } catch {
      toast.error("Erro ao criar despesa");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input id="exp-description" name="description" label="Descrição *" required />
      <Input id="exp-value" name="value" label="Valor *" type="number" step="0.01" required />
      <div className="grid grid-cols-2 gap-4">
        <Input id="exp-date" name="date" label="Data da Despesa *" type="date" required />
        <Input id="exp-dueDate" name="dueDate" label="Vencimento da Fatura" type="date" />
      </div>
      <Select
        id="exp-status"
        name="status"
        label="Status"
        options={[
          { value: "PENDENTE", label: "Pendente" },
          { value: "PAGO", label: "Pago" },
        ]}
        defaultValue="PENDENTE"
      />
      <Select
        id="exp-categoryId"
        name="categoryId"
        label="Categoria *"
        options={categories.map((c) => ({ value: c.id, label: c.name }))}
        placeholder="Selecione"
        required
      />
      <Select
        id="exp-projectId"
        name="projectId"
        label="Projeto (opcional)"
        options={projects.map((p) => ({ value: p.id, label: `${p.name} - ${p.client.name}` }))}
        placeholder="Geral (sem projeto)"
      />
      <Textarea id="exp-notes" name="notes" label="Notas" />
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Salvando..." : "Criar Despesa"}
      </Button>
    </form>
  );
}
