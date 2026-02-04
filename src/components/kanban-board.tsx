"use client";

import { useState, useEffect } from "react";
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates, arrayMove } from "@dnd-kit/sortable";
import { ref, onValue, push, set, update, remove } from "firebase/database";
import { db } from "@/lib/firebase";
import { COLUMNS, Task, TaskStatus, Subtask } from "@/types";
import { KanbanColumn } from "./kanban-column";
import { TaskCard } from "./task-card";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { v4 as uuidv4 } from "uuid";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea"; 
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Filter, Calendar as CalendarIcon, Loader2, Inbox, Settings, Image as ImageIcon, Trash2 } from "lucide-react";
import { Header } from "./header";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export function KanbanBoard() {
  const { user, logout } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newSubtasks, setNewSubtasks] = useState<Subtask[]>([]);
  const [newTaskPriority, setNewTaskPriority] = useState<"low" | "medium" | "high">("medium");
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<string | "all">("all");
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [isAdding, setIsAdding] = useState(false);

  const addNewSubtask = () => {
      setNewSubtasks([...newSubtasks, { id: uuidv4(), title: "", completed: false }]);
  };

  const updateNewSubtask = (id: string, title: string) => {
      setNewSubtasks(newSubtasks.map(st => st.id === id ? { ...st, title } : st));
  };

  const removeNewSubtask = (id: string) => {
      setNewSubtasks(newSubtasks.filter(st => st.id !== id));
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    // Listen to tasks
    const tasksRef = ref(db, "tasks");
    const unsubTasks = onValue(tasksRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const parsedTasks: Task[] = Object.values(data);
        setTasks(parsedTasks);
      } else {
        setTasks([]);
      }
    });

    return () => {
        unsubTasks();
    };
  }, []);


  
  const triggerConfetti = () => {
     confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
     });
  };

  const addTask = async () => {
    if (!newTaskTitle.trim() || !user) return;
    setIsAdding(true);
    
    try {
        const newTaskRef = push(ref(db, "tasks"));
        const newTask: Task = {
          id: newTaskRef.key!,
          title: newTaskTitle,
          description: newTaskDescription,
          status: "todo",
          userId: user.uid,
          createdAt: Date.now(),
          priority: newTaskPriority, 
          dueDate: dueDate ? dueDate.getTime() : undefined,
          subtasks: newSubtasks.filter(st => st.title.trim() !== "")
        };
        await set(newTaskRef, newTask);
        setNewTaskTitle("");
        setNewTaskDescription("");
        setNewSubtasks([]);
        setNewTaskPriority("medium");
        setDueDate(undefined);
        setIsAddTaskOpen(false);
        toast.success("Task created!");
        
        confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.9 },
            colors: ['#5bbad5', '#7f00ff']
        });

    } catch (error) {
        toast.error("Failed to add task");
    } finally {
        setIsAdding(false);
    }
  };

  const updateTask = (taskId: string, updates: Partial<Task>) => {
      // Check if task is completed (moved to done)
    if (updates.status === 'done') {
        const task = tasks.find(t => t.id === taskId);
        if (task && task.status !== 'done') {
            triggerConfetti();
        }
    }
    
    update(ref(db, `tasks/${taskId}`), updates)
        .then(() => toast.success("Task updated"))
        .catch(() => toast.error("Failed to update"));
  };

  const deleteTask = (taskId: string) => {
    remove(ref(db, `tasks/${taskId}`))
        .then(() => toast.success("Task deleted"))
        .catch(() => toast.error("Failed to delete"));
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;
    
    const activeTask = tasks.find((t) => t.id === activeId);
    if (!activeTask) return;

    // Dropped on a column
    const overColumn = COLUMNS.find((col) => col.id === overId);
    if (overColumn) {
        if (activeTask.status !== overColumn.id) {
             update(ref(db, `tasks/${activeId}`), { status: overColumn.id })
                .then(() => {
                    toast.success(`Moved to ${overColumn.title}`);
                    if (overColumn.id === 'done') triggerConfetti();
                });
        }
    } else {
        // ... existing reordering logic
        const overTask = tasks.find(t => t.id === overId);
        if (overTask && activeTask.status !== overTask.status) {
             update(ref(db, `tasks/${activeId}`), { status: overTask.status })
                .then(() => {
                    toast.success(`Moved to ${overTask.status}`);
                    if (overTask.status === 'done') triggerConfetti();
                });
        }
    }
  };
  
  const handleDragOver = (event: DragOverEvent) => {
      const { active, over } = event;
      if (!over) return;
      
      const activeId = active.id as string;
      const overId = over.id as string;

      // If over a column container
      const isOverColumn = COLUMNS.some(col => col.id === overId);
      if(isOverColumn && activeId) {
           const activeTask = tasks.find((t) => t.id === activeId);
           if (activeTask && activeTask.status !== overId) {
                // Optimistic UI update or wait for dragEnd?
                // For simplicity + realtime stability, we just update on DragOver if switching columns
                // BUT updating DB on drag over is too spammy. 
                // We will visualize standard sortable behavior and only commit on DragEnd usually.
                // However, dnd-kit sortable between lists needs the item to 'be' in the new list for the layout to adjust.
                // For this implementation, we will perform the update on DragEnd (see above), 
                // but to make it visual, dnd-kit handles the overlay. 
                // If we want reordering within same column:
           }
      }
  }

  // Group tasks by column
  const filteredTasks = tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter;
      return matchesSearch && matchesPriority;
  });

  const tasksByColumn = {
      todo: filteredTasks.filter(t => t.status === "todo"),
      "in-progress": filteredTasks.filter(t => t.status === "in-progress"),
      done: filteredTasks.filter(t => t.status === "done"),
  }

  const activeTask = tasks.find((t) => t.id === activeId);

  return (
    <div className="flex flex-col h-screen bg-background">
      <Header />

      <main className="flex-1 overflow-hidden flex flex-col p-4 gap-4 transition-all duration-500">
        {/* Mobile FAB */}
        <div className="md:hidden fixed bottom-6 right-6 z-50">
            <Button 
                size="icon" 
                className="h-14 w-14 rounded-full shadow-lg cursor-pointer" 
                onClick={() => setIsAddTaskOpen(true)}
            >
                <Plus className="h-6 w-6" />
            </Button>
        </div>

        {/* Task Creation Dialog */}
        <Dialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen}>
             <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add New Task</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="title">Task Title</Label>
                        <Input 
                            id="title" 
                            value={newTaskTitle} 
                            onChange={(e) => setNewTaskTitle(e.target.value)} 
                            placeholder="Do laundry..."
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label>Priority</Label>
                            <Select value={newTaskPriority} onValueChange={(v) => setNewTaskPriority(v as "low" | "medium" | "high")}>
                                <SelectTrigger className="cursor-pointer">
                                    <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="low" className="cursor-pointer">Low</SelectItem>
                                    <SelectItem value="medium" className="cursor-pointer">Medium</SelectItem>
                                    <SelectItem value="high" className="cursor-pointer">High</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                             <Label>Due Date</Label>
                             <Popover>
                              <PopoverTrigger asChild>
                                <Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal cursor-pointer", !dueDate && "text-muted-foreground")}>
                                  {dueDate ? format(dueDate, "PPP") : <span>Pick a date</span>}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={dueDate}
                                  onSelect={setDueDate}
                                  initialFocus
                                  className="cursor-pointer"
                                />
                              </PopoverContent>
                            </Popover>
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea 
                            id="description" 
                            value={newTaskDescription} 
                            onChange={(e) => setNewTaskDescription(e.target.value)} 
                            placeholder="Add details..."
                            className="min-h-[80px]"
                        />
                    </div>

                     <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <Label>Subtasks</Label>
                                <Button variant="outline" size="sm" onClick={addNewSubtask} className="h-6 text-xs cursor-pointer">
                                    <Plus className="h-3 w-3 mr-1" /> Add
                                </Button>
                            </div>
                            <div className="space-y-2 max-h-[150px] overflow-y-auto pr-1">
                                {newSubtasks.map(st => (
                                    <div key={st.id} className="flex items-center gap-2">
                                        <Input 
                                            value={st.title} 
                                            onChange={(e) => updateNewSubtask(st.id, e.target.value)}
                                            placeholder="Subtask..."
                                            className="h-7 text-sm"
                                        />
                                        <Button variant="ghost" size="icon" className="h-6 w-6 cursor-pointer text-muted-foreground hover:text-destructive" onClick={() => removeNewSubtask(st.id)}>
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                     </div>
                </div>
                <DialogFooter>
                    <Button onClick={addTask} disabled={isAdding} className="cursor-pointer">
                         {isAdding && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                         Create Task
                    </Button>
                </DialogFooter>
             </DialogContent>
        </Dialog>

        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
             <div className="flex gap-2 w-full sm:w-auto flex-1 max-w-2xl">
                <div className="relative flex-1">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="Search tasks..." 
                        className="pl-8" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                 <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="cursor-pointer">
                      <Filter className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Filter by Priority</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setPriorityFilter("all")} className="cursor-pointer">All</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setPriorityFilter("high")} className="cursor-pointer">High</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setPriorityFilter("medium")} className="cursor-pointer">Medium</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setPriorityFilter("low")} className="cursor-pointer">Low</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <Button onClick={() => setIsAddTaskOpen(true)} className="hidden md:flex cursor-pointer">
                    <Plus className="mr-2 h-4 w-4" /> Add Task
                </Button>
             </div>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex flex-col md:flex-row h-full gap-4 overflow-y-auto md:overflow-y-hidden md:overflow-x-auto pb-4 md:pb-2">
            {COLUMNS.map((col) => (
              <div key={col.id} className="w-full md:w-[320px] md:min-w-[320px] flex-shrink-0 flex flex-col h-auto md:h-full">
                <KanbanColumn
                  column={col}
                  tasks={tasksByColumn[col.id] || []}
                  onDeleteTask={deleteTask}
                  onEditTask={updateTask}
                />
              </div>
            ))}
          </div>

          <DragOverlay>
            {activeTask ? <TaskCard task={activeTask} onDelete={() => {}} onEdit={() => {}} /> : null}
          </DragOverlay>
        </DndContext>
      </main>
    </div>
  );
}
