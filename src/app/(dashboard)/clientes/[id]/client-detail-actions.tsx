"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { ClientForm } from "@/components/forms/client-form";
import { deleteClient } from "@/actions/clients";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { Client } from "@prisma/client";

export function ClientDetailActions({ client }: { client: Client }) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);

  async function handleDelete() {
    if (!confirm("Tem certeza que deseja excluir este cliente?")) return;
    try {
      await deleteClient(client.id);
      toast.success("Cliente excluído");
      router.push("/clientes");
    } catch {
      toast.error("Erro ao excluir cliente");
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

      <Dialog open={editOpen} onClose={() => setEditOpen(false)} title="Editar Cliente">
        <ClientForm
          client={client}
          onSuccess={() => {
            setEditOpen(false);
            router.refresh();
          }}
        />
      </Dialog>
    </>
  );
}
