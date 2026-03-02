"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { TaskCard } from "./task-card";
import { cn } from "@/lib/utils";
import type { Task, User } from "@prisma/client";

type TaskWithAssignee = Task & { assignee: User | null };

interface KanbanColumnProps {
  id: string;
  title: string;
  tasks: TaskWithAssignee[];
  projectId: string;
  users: User[];
}

const columnColors: Record<string, string> = {
  TODO: "border-t-blue-500",
  IN_PROGRESS: "border-t-yellow-500",
  DONE: "border-t-green-500",
};

export function KanbanColumn({ id, title, tasks, projectId, users }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "rounded-xl border border-border border-t-4 bg-card/50 p-3",
        columnColors[id],
        isOver && "ring-2 ring-primary/50"
      )}
    >
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold">{title}</h3>
        <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
          {tasks.length}
        </span>
      </div>

      <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2 min-h-[100px]">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} projectId={projectId} users={users} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}
