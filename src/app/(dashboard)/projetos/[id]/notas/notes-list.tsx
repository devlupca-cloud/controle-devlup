"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { NoteEditor } from "./note-editor";
import { createNote, deleteNote } from "@/actions/notes";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";
import type { Note } from "@prisma/client";

interface NotesListProps {
  projectId: string;
  notes: Note[];
}

export function NotesList({ projectId, notes }: NotesListProps) {
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      await createNote(projectId, formData);
      toast.success("Nota criada!");
      setCreateOpen(false);
      window.location.reload();
    } catch {
      toast.error("Erro ao criar nota");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Excluir esta nota?")) return;
    try {
      await deleteNote(id, projectId);
      toast.success("Nota excluída");
      setSelectedNote(null);
      window.location.reload();
    } catch {
      toast.error("Erro ao excluir");
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Notas</h2>
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" />
          Nova Nota
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
        {/* Notes list */}
        <div className="space-y-2">
          {notes.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">Nenhuma nota</p>
          ) : (
            notes.map((note) => (
              <Card
                key={note.id}
                className={`p-3 cursor-pointer transition-colors ${
                  selectedNote?.id === note.id ? "ring-2 ring-primary" : "hover:bg-muted/50"
                }`}
                onClick={() => setSelectedNote(note)}
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium truncate">{note.title}</p>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(note.id);
                    }}
                  >
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">{formatDate(note.updatedAt)}</p>
              </Card>
            ))
          )}
        </div>

        {/* Note editor */}
        <div>
          {selectedNote ? (
            <NoteEditor note={selectedNote} projectId={projectId} />
          ) : (
            <div className="flex items-center justify-center h-[400px] text-muted-foreground">
              Selecione uma nota para editar
            </div>
          )}
        </div>
      </div>

      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} title="Nova Nota">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input id="title" name="title" label="Título *" required />
          <input type="hidden" name="content" value="" />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Criando..." : "Criar Nota"}
          </Button>
        </form>
      </Dialog>
    </div>
  );
}
