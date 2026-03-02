"use client";

import { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Dialog } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { getExpenses, getExpenseCategories, createExpenseCategory, deleteExpense, toggleExpenseStatus } from "@/actions/expenses";
import { getProjects } from "@/actions/projects";
import { ExpenseForm } from "@/components/forms/expense-form";
import { Plus, Search, Trash2, CheckCircle2, Clock } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useDebounce } from "@/hooks/use-debounce";
import type { ExpenseWithRelations } from "@/types";
import type { ExpenseCategory, Project, Client } from "@prisma/client";

type ProjectWithClient = Project & { client: Client };

export default function DespesasPage() {
  const [expenses, setExpenses] = useState<ExpenseWithRelations[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [projects, setProjects] = useState<ProjectWithClient[]>([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [projectFilter, setProjectFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const debouncedSearch = useDebounce(search, 300);

  const loadData = useCallback(async () => {
    const [expData, catData, projData] = await Promise.all([
      getExpenses({
        search: debouncedSearch || undefined,
        categoryId: categoryFilter || undefined,
        projectId: projectFilter || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      }),
      getExpenseCategories(),
      getProjects(),
    ]);
    setExpenses(expData as ExpenseWithRelations[]);
    setCategories(catData);
    setProjects(projData as ProjectWithClient[]);
  }, [debouncedSearch, categoryFilter, projectFilter, startDate, endDate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleCreateCategory(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      await createExpenseCategory(formData);
      toast.success("Categoria criada!");
      setCategoryDialogOpen(false);
      loadData();
    } catch {
      toast.error("Erro ao criar categoria");
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleStatus(id: string) {
    try {
      await toggleExpenseStatus(id);
      toast.success("Status atualizado!");
      loadData();
    } catch {
      toast.error("Erro ao atualizar status");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Excluir esta despesa?")) return;
    try {
      await deleteExpense(id);
      toast.success("Despesa excluída");
      loadData();
    } catch {
      toast.error("Erro ao excluir");
    }
  }

  const totalExpenses = expenses.reduce((s, e) => s + Number(e.value), 0);

  const isOverdue = (expense: ExpenseWithRelations) => {
    if (expense.status === "PAGO") return false;
    const due = (expense as any).dueDate;
    return due && new Date(due) < new Date();
  };

  const columns = [
    { key: "description", header: "Descrição" },
    {
      key: "category",
      header: "Categoria",
      render: (e: ExpenseWithRelations) => e.category.name,
    },
    {
      key: "project",
      header: "Projeto",
      render: (e: ExpenseWithRelations) => e.project?.name || "—",
    },
    {
      key: "value",
      header: "Valor",
      render: (e: ExpenseWithRelations) => formatCurrency(Number(e.value)),
    },
    {
      key: "date",
      header: "Data",
      render: (e: ExpenseWithRelations) => formatDate(e.date),
    },
    {
      key: "dueDate",
      header: "Vencimento",
      render: (e: ExpenseWithRelations) => {
        const due = (e as any).dueDate;
        if (!due) return "—";
        return (
          <span className={isOverdue(e) ? "text-destructive font-medium" : ""}>
            {formatDate(due)}
          </span>
        );
      },
    },
    {
      key: "status",
      header: "Status",
      render: (e: ExpenseWithRelations) => {
        const status = (e as any).status || "PENDENTE";
        if (status === "PAGO") {
          return <Badge variant="success">Pago</Badge>;
        }
        if (isOverdue(e)) {
          return <Badge variant="destructive">Vencido</Badge>;
        }
        return <Badge variant="warning">Pendente</Badge>;
      },
    },
    {
      key: "actions",
      header: "",
      render: (e: ExpenseWithRelations) => (
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleToggleStatus(e.id)}
            title={(e as any).status === "PAGO" ? "Marcar como pendente" : "Marcar como pago"}
          >
            {(e as any).status === "PAGO" ? (
              <Clock className="h-4 w-4 text-warning" />
            ) : (
              <CheckCircle2 className="h-4 w-4 text-success" />
            )}
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleDelete(e.id)}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
      className: "w-24",
    },
  ];

  return (
    <div>
      <Header title="Despesas">
        <Button variant="outline" size="sm" onClick={() => setCategoryDialogOpen(true)}>
          Categorias
        </Button>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4" />
          Nova Despesa
        </Button>
      </Header>

      <Card className="p-4 mb-4">
        <p className="text-xs text-muted-foreground">Total no Período</p>
        <p className="text-2xl font-bold text-destructive">{formatCurrency(totalExpenses)}</p>
      </Card>

      <div className="mb-4 flex flex-wrap gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 w-48"
          />
        </div>
        <Select
          options={categories.map((c) => ({ value: c.id, label: c.name }))}
          placeholder="Categoria"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="w-40"
        />
        <Select
          options={projects.map((p) => ({ value: p.id, label: p.name }))}
          placeholder="Projeto"
          value={projectFilter}
          onChange={(e) => setProjectFilter(e.target.value)}
          className="w-40"
        />
        <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-36" />
        <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-36" />
      </div>

      <div className="rounded-xl border border-border bg-card">
        <DataTable columns={columns} data={expenses} emptyMessage="Nenhuma despesa encontrada" />
      </div>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} title="Nova Despesa">
        <ExpenseForm
          categories={categories}
          projects={projects}
          onSuccess={() => {
            setDialogOpen(false);
            loadData();
          }}
        />
      </Dialog>

      <Dialog open={categoryDialogOpen} onClose={() => setCategoryDialogOpen(false)} title="Categorias de Despesa">
        <form onSubmit={handleCreateCategory} className="flex gap-2 mb-4">
          <Input id="cat-name" name="name" placeholder="Nova categoria..." required className="flex-1" />
          <Button type="submit" disabled={loading}>Adicionar</Button>
        </form>
        <div className="space-y-2">
          {categories.map((cat) => (
            <div key={cat.id} className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
              <span className="text-sm">{cat.name}</span>
            </div>
          ))}
        </div>
      </Dialog>
    </div>
  );
}
