"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { CredentialForm } from "@/components/forms/credential-form";
import { deleteCredential } from "@/actions/credentials";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { Plus, Eye, EyeOff, Copy, Check, ExternalLink, Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";
import type { Credential } from "@prisma/client";

interface CredentialsListProps {
  projectId: string;
  credentials: Credential[];
}

export function CredentialsList({ projectId, credentials }: CredentialsListProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCredential, setEditingCredential] = useState<Credential | null>(null);
  const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set());
  const { copied, copy } = useCopyToClipboard();
  const [copiedField, setCopiedField] = useState<string>("");

  function togglePassword(id: string) {
    setVisiblePasswords((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleCopy(text: string, fieldId: string) {
    await copy(text);
    setCopiedField(fieldId);
    toast.success("Copiado!");
    setTimeout(() => setCopiedField(""), 2000);
  }

  async function handleDelete(id: string) {
    if (!confirm("Excluir esta credencial?")) return;
    try {
      await deleteCredential(id, projectId);
      toast.success("Credencial excluída");
      window.location.reload();
    } catch {
      toast.error("Erro ao excluir");
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Acessos</h2>
        <Button size="sm" onClick={() => { setEditingCredential(null); setDialogOpen(true); }}>
          <Plus className="h-4 w-4" />
          Nova Credencial
        </Button>
      </div>

      {credentials.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">Nenhuma credencial cadastrada</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {credentials.map((cred) => (
            <Card key={cred.id} className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{cred.platform}</h3>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => { setEditingCredential(cred); setDialogOpen(true); }}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(cred.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>

              {cred.url && (
                <div>
                  <p className="text-xs text-muted-foreground">URL</p>
                  <a href={cred.url} target="_blank" rel="noopener noreferrer" className="text-sm text-secondary hover:underline flex items-center gap-1">
                    {cred.url} <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Usuário</p>
                  <p className="text-sm">{cred.username}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => handleCopy(cred.username, `user-${cred.id}`)}>
                  {copiedField === `user-${cred.id}` ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Senha</p>
                  <p className="text-sm font-mono">
                    {visiblePasswords.has(cred.id) ? cred.password : "••••••••"}
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => togglePassword(cred.id)}>
                    {visiblePasswords.has(cred.id) ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleCopy(cred.password, `pass-${cred.id}`)}>
                    {copiedField === `pass-${cred.id}` ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {cred.notes && (
                <div>
                  <p className="text-xs text-muted-foreground">Notas</p>
                  <p className="text-sm">{cred.notes}</p>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title={editingCredential ? "Editar Credencial" : "Nova Credencial"}
      >
        <CredentialForm
          projectId={projectId}
          credential={editingCredential || undefined}
          onSuccess={() => {
            setDialogOpen(false);
            window.location.reload();
          }}
        />
      </Dialog>
    </div>
  );
}
