"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createClient, updateClient } from "@/actions/clients";
import { toast } from "sonner";
import type { Client } from "@prisma/client";

interface ClientFormProps {
  client?: Client;
  onSuccess?: () => void;
}

export function ClientForm({ client, onSuccess }: ClientFormProps) {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      if (client) {
        await updateClient(client.id, formData);
        toast.success("Cliente atualizado!");
      } else {
        await createClient(formData);
        toast.success("Cliente criado!");
      }
      onSuccess?.();
    } catch {
      toast.error("Erro ao salvar cliente");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
      <Input id="client-name" name="name" label="Nome *" defaultValue={client?.name} required autoComplete="off" />
      <Input id="client-email" name="email" label="Email" type="email" defaultValue={client?.email || ""} autoComplete="off" />
      <Input id="client-phone" name="phone" label="Telefone" defaultValue={client?.phone || ""} autoComplete="off" />
      <Input id="client-company" name="company" label="Empresa" defaultValue={client?.company || ""} autoComplete="off" />
      <Input id="client-document" name="document" label="CPF/CNPJ" defaultValue={client?.document || ""} autoComplete="off" />
      <Textarea id="client-notes" name="notes" label="Observações" defaultValue={client?.notes || ""} />
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Salvando..." : client ? "Atualizar" : "Criar Cliente"}
      </Button>
    </form>
  );
}
