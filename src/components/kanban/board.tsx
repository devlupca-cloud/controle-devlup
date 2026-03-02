"use client";

import { useState, useCallback } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  type DragOverEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { KanbanColumn } from "./column";
import { TaskCard } from "./task-card";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { TaskForm } from "@/components/forms/task-form";
import { reorderTasks } from "@/actions/tasks";
import { Plus } from "lucide-react";
import { TASK_STATUSES } from "@/lib/constants";
import type { Task, User } from "@prisma/client";

type TaskWithAssignee = Task & { assignee: User | null };

interface KanbanBoardProps {
  projectId: string;
  tasks: TaskWithAssignee[];
  users: User[];
}

const columns = ["TODO", "IN_PROGRESS", "DONE"] as const;

export function KanbanBoard({ projectId, tasks: initialTasks, users }: KanbanBoardProps) {
  const [tasks, setTasks] = useState(initialTasks);
  const [activeTask, setActiveTask] = useState<TaskWithAssignee | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const getTasksByStatus = useCallback(
    (status: string) =>
      tasks
        .filter((t) => t.status === status)
        .sort((a, b) => a.order - b.order),
    [tasks]
  );

  function handleDragStart(event: DragStartEvent) {
    const task = tasks.find((t) => t.id === event.active.id);
    setActiveTask(task || null);
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeTask = tasks.find((t) => t.id === activeId);
    if (!activeTask) return;

    // Determine target column
    const overTask = tasks.find((t) => t.id === overId);
    const targetStatus = overTask ? overTask.status : overId;

    if (activeTask.status !== targetStatus && columns.includes(targetStatus as any)) {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === activeId ? { ...t, status: targetStatus as Task["status"] } : t
        )
      );
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    // Recompute orders
    const updated: { id: string; status: string; order: number }[] = [];
    for (const col of columns) {
      const colTasks = tasks
        .filter((t) => t.status === col)
        .sort((a, b) => a.order - b.order);
      colTasks.forEach((t, i) => {
        updated.push({ id: t.id, status: col, order: i });
      });
    }

    setTasks((prev) =>
      prev.map((t) => {
        const u = updated.find((u) => u.id === t.id);
        return u ? { ...t, status: u.status as Task["status"], order: u.order } : t;
      })
    );

    await reorderTasks(updated, projectId);
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Tarefas</h2>
        <Button size="sm" onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4" />
          Nova Tarefa
        </Button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {columns.map((status) => (
            <KanbanColumn
              key={status}
              id={status}
              title={TASK_STATUSES[status]}
              tasks={getTasksByStatus(status)}
              projectId={projectId}
              users={users}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask && <TaskCard task={activeTask} projectId={projectId} users={users} />}
        </DragOverlay>
      </DndContext>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} title="Nova Tarefa">
        <TaskForm
          projectId={projectId}
          users={users}
          onSuccess={() => {
            setDialogOpen(false);
            window.location.reload();
          }}
        />
      </Dialog>
    </div>
  );
}
