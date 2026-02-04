export type TaskStatus = "todo" | "in-progress" | "done";

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  userId: string;
  createdAt: number;
  priority?: "low" | "medium" | "high";
  dueDate?: number;
  subtasks?: Subtask[];
}

export type ColumnType = {
  id: TaskStatus;
  title: string;
};

export const COLUMNS: ColumnType[] = [
  { id: "todo", title: "To Do" },
  { id: "in-progress", title: "In Progress" },
  { id: "done", title: "Done" },
];
