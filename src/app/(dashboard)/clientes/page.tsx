"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/ui/data-table";
import { Dialog } from "@/components/ui/dialog";
import { ClientForm } from "@/components/forms/client-form";
import { getClients } from "@/actions/clients";
import { Plus, Search } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import type { Client, Project } from "@prisma/client";

type ClientWithProjects = Client & { projects: Project[] };

export default function ClientesPage() {
  const router = useRouter();
  const [clients, setClients] = useState<ClientWithProjects[]>([]);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const debouncedSearch = useDebounce(search, 300);

  const loadClients = useCallback(async () => {
    const data = await getClients(debouncedSearch || undefined);
    setClients(data as ClientWithProjects[]);
  }, [debouncedSearch]);

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  const columns = [
    { key: "name", header: "Nome" },
    { key: "company", header: "Empresa", render: (c: ClientWithProjects) => c.company || "—" },
    { key: "email", header: "Email", render: (c: ClientWithProjects) => c.email || "—" },
    { key: "phone", header: "Telefone", render: (c: ClientWithProjects) => c.phone || "—" },
    {
      key: "projects",
      header: "Projetos",
      render: (c: ClientWithProjects) => c.projects.length,
    },
  ];

  return (
    <div>
      <Header title="Clientes">
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4" />
          Novo Cliente
        </Button>
      </Header>

      <div className="mb-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar clientes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card">
        <DataTable
          columns={columns}
          data={clients}
          onRowClick={(client) => router.push(`/clientes/${client.id}`)}
          emptyMessage="Nenhum cliente encontrado"
        />
      </div>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} title="Novo Cliente">
        <ClientForm
          onSuccess={() => {
            setDialogOpen(false);
            loadClients();
          }}
        />
      </Dialog>
    </div>
  );
}
