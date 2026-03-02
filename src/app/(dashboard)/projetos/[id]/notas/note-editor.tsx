"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { updateNote } from "@/actions/notes";
import { useDebounce } from "@/hooks/use-debounce";
import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import type { Note } from "@prisma/client";

interface NoteEditorProps {
  note: Note;
  projectId: string;
}

export function NoteEditor({ note, projectId }: NoteEditorProps) {
  const [content, setContent] = useState(note.content);
  const debouncedContent = useDebounce(content, 1000);
  const isFirstRender = useRef(true);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: "Comece a escrever..." }),
    ],
    content: note.content,
    onUpdate: ({ editor }) => {
      setContent(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "tiptap prose prose-invert max-w-none p-4 min-h-[400px] focus:outline-none",
      },
    },
  });

  useEffect(() => {
    if (editor && note.content !== editor.getHTML()) {
      editor.commands.setContent(note.content);
      setContent(note.content);
    }
  }, [note.id]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (debouncedContent !== note.content) {
      updateNote(note.id, projectId, { content: debouncedContent }).then(() => {
        toast.success("Nota salva", { duration: 1000 });
      });
    }
  }, [debouncedContent]);

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="border-b border-border px-4 py-2">
        <p className="text-sm font-medium">{note.title}</p>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
