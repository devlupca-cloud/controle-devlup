"use client";

import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { TaskForm } from "@/components/forms/task-form";
import { TASK_PRIORITIES, PRIORITY_COLORS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { Calendar, User as UserIcon, GripVertical } from "lucide-react";
import type { Task, User } from "@prisma/client";

type TaskWithAssignee = Task & { assignee: User | null };

interface TaskCardProps {
  task: TaskWithAssignee;
  projectId: string;
  users: User[];
}

export function TaskCard({ task, projectId, users }: TaskCardProps) {
  const [editOpen, setEditOpen] = useState(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className="rounded-lg border border-border bg-card p-3 cursor-pointer hover:border-primary/50 transition-colors"
        onClick={() => setEditOpen(true)}
      >
        <div className="flex items-start gap-2">
          <button
            {...attributes}
            {...listeners}
            className="mt-0.5 cursor-grab text-muted-foreground hover:text-foreground"
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical className="h-4 w-4" />
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{task.title}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge className={PRIORITY_COLORS[task.priority as keyof typeof PRIORITY_COLORS]}>
                {TASK_PRIORITIES[task.priority as keyof typeof TASK_PRIORITIES]}
              </Badge>
              {task.assignee && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <UserIcon className="h-3 w-3" />
                  {task.assignee.name}
                </span>
              )}
              {task.dueDate && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {formatDate(task.dueDate)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <Dialog open={editOpen} onClose={() => setEditOpen(false)} title="Editar Tarefa">
        <TaskForm
          projectId={projectId}
          task={task}
          users={users}
          onSuccess={() => {
            setEditOpen(false);
            window.location.reload();
          }}
        />
      </Dialog>
    </>
  );
}
