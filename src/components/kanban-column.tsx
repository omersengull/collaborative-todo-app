"use client";

import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { Task, ColumnType } from "@/types";
import { TaskCard } from "./task-card";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Inbox } from "lucide-react";

interface KanbanColumnProps {
  column: ColumnType;
  tasks: Task[];
  onDeleteTask: (taskId: string) => void;
  onEditTask: (taskId: string, updates: Partial<Task>) => void;
}

export function KanbanColumn({ column, tasks, onDeleteTask, onEditTask }: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({
    id: column.id,
    data: {
      type: "Column",
      column,
    },
  });

  const taskIds = tasks.map((t) => t.id);

  return (
    <Card className="flex flex-col h-full bg-slate-50/50 dark:bg-secondary/30 border border-slate-200 dark:border-border/60 max-h-full shadow-sm ring-1 ring-slate-900/5">
      <CardHeader className="p-4 pb-2 sticky top-0 bg-white/80 dark:bg-background/95 backdrop-blur z-10 border-b rounded-t-xl mb-2 shadow-sm">
        <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            {column.title}
            </CardTitle>
            <Badge variant="secondary" className="ml-2 font-mono text-xs">
                {tasks.length}
            </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-2 flex flex-col gap-2 min-h-[150px] overflow-y-auto scrollbar-thin">
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          <div ref={setNodeRef} className="flex flex-col gap-2 min-h-full">
            {tasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground/50 border-2 border-dashed border-muted-foreground/20 rounded-lg">
                    <Inbox className="w-12 h-12 mb-2 opacity-50" />
                    <p className="text-sm font-medium">No tasks in {column.title}</p>
                </div>
            ) : (
                tasks.map((task) => (
                  <TaskCard key={task.id} task={task} onDelete={onDeleteTask} onEdit={onEditTask} />
                ))
            )}
          </div>
        </SortableContext>
      </CardContent>
    </Card>
  );
}
