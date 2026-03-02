"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createProject, updateProject } from "@/actions/projects";
import { getClients } from "@/actions/clients";
import { toast } from "sonner";
import type { Project, Client } from "@prisma/client";

interface ProjectFormProps {
  project?: Project;
  onSuccess?: () => void;
}

export function ProjectForm({ project, onSuccess }: ProjectFormProps) {
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [type, setType] = useState(project?.type || "AVULSO");
  const [totalValue, setTotalValue] = useState(project?.totalValue ? String(project.totalValue) : "");
  const [numInstallments, setNumInstallments] = useState("1");

  useEffect(() => {
    getClients().then((data) => setClients(data));
  }, []);

  const showInstallments = !project && type === "AVULSO" && totalValue !== "";
  const installmentValue = totalValue && numInstallments
    ? (Number(totalValue) / (Number(numInstallments) || 1)).toFixed(2).replace(".", ",")
    : null;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      if (project) {
        await updateProject(project.id, formData);
        toast.success("Projeto atualizado!");
      } else {
        await createProject(formData);
        toast.success("Projeto criado!");
      }
      onSuccess?.();
    } catch {
      toast.error("Erro ao salvar projeto");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
      <Input id="proj-name" name="name" label="Nome *" defaultValue={project?.name} required autoComplete="off" />
      <Select
        id="clientId"
        name="clientId"
        label="Cliente *"
        options={clients.map((c) => ({ value: c.id, label: c.name }))}
        placeholder="Selecione um cliente"
        defaultValue={project?.clientId}
        required
      />
      <Select
        id="type"
        name="type"
        label="Tipo *"
        options={[
          { value: "AVULSO", label: "Avulso" },
          { value: "RECORRENTE", label: "Recorrente" },
        ]}
        value={type}
        onChange={(e) => setType(e.target.value as "AVULSO" | "RECORRENTE")}
        required
      />
      {project && (
        <Select
          id="status"
          name="status"
          label="Status"
          options={[
            { value: "ATIVO", label: "Ativo" },
            { value: "PAUSADO", label: "Pausado" },
            { value: "CONCLUIDO", label: "Concluído" },
            { value: "CANCELADO", label: "Cancelado" },
          ]}
          defaultValue={project.status}
        />
      )}
      <Textarea id="proj-description" name="description" label="Descrição" defaultValue={project?.description || ""} />
      <div className="grid grid-cols-2 gap-4">
        <Input
          id="startDate"
          name="startDate"
          label="Data Início"
          type="date"
          defaultValue={project?.startDate ? new Date(project.startDate).toISOString().split("T")[0] : ""}
        />
        <Input
          id="endDate"
          name="endDate"
          label="Data Fim"
          type="date"
          defaultValue={project?.endDate ? new Date(project.endDate).toISOString().split("T")[0] : ""}
        />
      </div>
      <Input
        id="totalValue"
        name="totalValue"
        label="Valor Total"
        type="number"
        step="0.01"
        value={totalValue}
        onChange={(e) => setTotalValue(e.target.value)}
        autoComplete="off"
      />

      {showInstallments && (
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 space-y-3">
          <p className="text-sm font-medium text-primary">Parcelas</p>
          <div className="grid grid-cols-2 gap-4">
            <Input
              id="numberOfInstallments"
              name="numberOfInstallments"
              label="Nº de Parcelas"
              type="number"
              min="1"
              max="48"
              value={numInstallments}
              onChange={(e) => setNumInstallments(e.target.value)}
            />
            <Input
              id="installmentStartDate"
              name="installmentStartDate"
              label="1º Vencimento"
              type="date"
            />
          </div>
          {installmentValue && (
            <p className="text-xs text-muted-foreground">
              Valor por parcela: <span className="font-medium text-foreground">R$ {installmentValue}</span>
            </p>
          )}
        </div>
      )}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Salvando..." : project ? "Atualizar" : "Criar Projeto"}
      </Button>
    </form>
  );
}
