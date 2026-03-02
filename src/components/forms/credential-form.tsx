"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createCredential, updateCredential } from "@/actions/credentials";
import { toast } from "sonner";
import type { Credential } from "@prisma/client";

interface CredentialFormProps {
  projectId: string;
  credential?: Credential;
  onSuccess?: () => void;
}

export function CredentialForm({ projectId, credential, onSuccess }: CredentialFormProps) {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      if (credential) {
        await updateCredential(credential.id, projectId, formData);
        toast.success("Credencial atualizada!");
      } else {
        await createCredential(projectId, formData);
        toast.success("Credencial criada!");
      }
      onSuccess?.();
    } catch {
      toast.error("Erro ao salvar credencial");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input id="platform" name="platform" label="Plataforma *" defaultValue={credential?.platform} required />
      <Input id="url" name="url" label="URL" type="url" defaultValue={credential?.url || ""} />
      <Input id="username" name="username" label="Usuário *" defaultValue={credential?.username} required />
      <Input id="password" name="password" label="Senha *" defaultValue={credential?.password} required />
      <Textarea id="notes" name="notes" label="Notas" defaultValue={credential?.notes || ""} />
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Salvando..." : credential ? "Atualizar" : "Criar Credencial"}
      </Button>
    </form>
  );
}
