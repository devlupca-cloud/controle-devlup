"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { DataTable } from "@/components/ui/data-table";
import { Dialog } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ProjectForm } from "@/components/forms/project-form";
import { getProjects } from "@/actions/projects";
import { Plus, Search } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { PROJECT_STATUSES, PROJECT_TYPES, STATUS_COLORS } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import type { Project, Client } from "@prisma/client";

type ProjectWithClient = Project & { client: Client };

export default function ProjetosPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<ProjectWithClient[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const debouncedSearch = useDebounce(search, 300);

  const loadProjects = useCallback(async () => {
    const data = await getProjects({
      search: debouncedSearch || undefined,
      status: statusFilter || undefined,
      type: typeFilter || undefined,
    });
    setProjects(data as ProjectWithClient[]);
  }, [debouncedSearch, statusFilter, typeFilter]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const columns = [
    { key: "name", header: "Nome" },
    {
      key: "client",
      header: "Cliente",
      render: (p: ProjectWithClient) => p.client.name,
    },
    {
      key: "type",
      header: "Tipo",
      render: (p: ProjectWithClient) => PROJECT_TYPES[p.type as keyof typeof PROJECT_TYPES],
    },
    {
      key: "status",
      header: "Status",
      render: (p: ProjectWithClient) => (
        <Badge className={STATUS_COLORS[p.status as keyof typeof STATUS_COLORS]}>
          {PROJECT_STATUSES[p.status as keyof typeof PROJECT_STATUSES]}
        </Badge>
      ),
    },
    {
      key: "totalValue",
      header: "Valor",
      render: (p: ProjectWithClient) =>
        p.totalValue ? formatCurrency(Number(p.totalValue)) : "—",
    },
  ];

  return (
    <div>
      <Header title="Projetos">
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4" />
          Novo Projeto
        </Button>
      </Header>

      <div className="mb-4 flex flex-wrap gap-3">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar projetos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          options={[
            { value: "COTACAO", label: "Cotação" },
            { value: "NEGOCIACAO", label: "Negociação" },
            { value: "ATIVO", label: "Ativo" },
            { value: "PAUSADO", label: "Pausado" },
            { value: "CONCLUIDO", label: "Concluído" },
            { value: "CANCELADO", label: "Cancelado" },
          ]}
          placeholder="Todos os status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-40"
        />
        <Select
          options={[
            { value: "AVULSO", label: "Avulso" },
            { value: "RECORRENTE", label: "Recorrente" },
          ]}
          placeholder="Todos os tipos"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="w-40"
        />
      </div>

      <div className="rounded-xl border border-border bg-card">
        <DataTable
          columns={columns}
          data={projects}
          onRowClick={(project) => router.push(`/projetos/${project.id}`)}
          emptyMessage="Nenhum projeto encontrado"
        />
      </div>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} title="Novo Projeto">
        <ProjectForm
          onSuccess={() => {
            setDialogOpen(false);
            loadProjects();
          }}
        />
      </Dialog>
    </div>
  );
}
