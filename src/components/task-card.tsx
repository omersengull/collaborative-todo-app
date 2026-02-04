"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Task } from "@/types";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Clock, Edit2, Trash2, GripVertical, Plus } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { v4 as uuidv4 } from "uuid";

interface TaskCardProps {
  task: Task;
  onDelete: (taskId: string) => void;
  onEdit: (taskId: string, updates: Partial<Task>) => void;
}

export function TaskCard({ task, onDelete, onEdit }: TaskCardProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDesc, setEditDesc] = useState(task.description || "");
  const [editPriority, setEditPriority] = useState<"low" | "medium" | "high">(task.priority || "medium");

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: "Task",
      task,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="opacity-30 bg-primary/10 border-2 border-primary/20 h-[100px] rounded-lg"
      />
    );
  }

  const handleSave = () => {
    onEdit(task.id, { 
        title: editTitle, 
        description: editDesc,
        priority: editPriority 
    });
    setIsEditOpen(false);
  };

  const addSubtask = () => {
      const newSubtask = { id: uuidv4(), title: "New Subtask", completed: false };
      const updatedSubtasks = [...(task.subtasks || []), newSubtask];
      onEdit(task.id, { subtasks: updatedSubtasks });
  };

  const toggleSubtask = (subtaskId: string, completed: boolean) => {
      const updatedSubtasks = task.subtasks?.map(st => 
          st.id === subtaskId ? { ...st, completed } : st
      );
      onEdit(task.id, { subtasks: updatedSubtasks });
  };

  const updateSubtaskTitle = (subtaskId: string, title: string) => {
      const updatedSubtasks = task.subtasks?.map(st => 
          st.id === subtaskId ? { ...st, title } : st
      );
      onEdit(task.id, { subtasks: updatedSubtasks });
  };

  const deleteSubtask = (subtaskId: string) => {
      const updatedSubtasks = task.subtasks?.filter(st => st.id !== subtaskId);
      onEdit(task.id, { subtasks: updatedSubtasks });
  };

  const completedSubtasks = task.subtasks?.filter(st => st.completed).length || 0;
  const totalSubtasks = task.subtasks?.length || 0;
  const progress = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

  return (
    <motion.div
        ref={setNodeRef}
        style={style}
        layoutId={task.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        whileHover={{ scale: 1.02 }}
        className="group relative"
    >
      <Card className="hover:shadow-md transition-all border-l-4 shadow-sm border-slate-200 dark:border-muted/40 bg-white dark:bg-card" style={{ borderLeftColor: getPriorityColor(task.priority) }}>
        <CardContent className="p-3 pb-2 space-y-2">
            <div className="flex justify-between items-start gap-2">
                 <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing mt-1 text-muted-foreground/60 hover:text-foreground transition-colors">
                    <GripVertical className="h-4 w-4" />
                 </div>
                 <div className="flex-1 space-y-1">
                    <p className="font-semibold text-sm leading-snug text-slate-900 dark:text-slate-100">{task.title}</p>
                    {task.description && <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">{task.description}</p>}
                 </div>
            </div>
            
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-medium">
                {task.dueDate && (
                    <div className="flex items-center gap-1 bg-secondary/50 px-1.5 py-0.5 rounded">
                        <Calendar className="h-3 w-3" />
                        <span>{format(new Date(task.dueDate), "MMM d")}</span>
                    </div>
                )}
                 {task.priority && (
                    <Badge variant="outline" className={cn("text-[10px] h-5 px-1.5 uppercase border-0 text-white", getPriorityColor(task.priority))}>
                        {task.priority}
                    </Badge>
                )}
            </div>
            
            {totalSubtasks > 0 && (
                <div className="pt-1 space-y-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Progress value={progress} className="h-1.5 flex-1" />
                        <span>{completedSubtasks}/{totalSubtasks}</span>
                    </div>
                    
                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="subtasks" className="border-0">
                            <AccordionTrigger className="py-1 text-[11px] font-medium text-muted-foreground hover:no-underline hover:text-foreground">
                                View Subtasks
                            </AccordionTrigger>
                            <AccordionContent className="pb-1">
                                <ul className="space-y-1 mt-1">
                                    {task.subtasks?.map(st => (
                                        <li key={st.id} className="flex items-center gap-2 group/st">
                                            <Checkbox 
                                                checked={st.completed} 
                                                onCheckedChange={(c) => toggleSubtask(st.id, c as boolean)}
                                                className="h-3.5 w-3.5 cursor-pointer"
                                            />
                                            <span className={cn(
                                                "text-[11px] flex-1 truncate",
                                                st.completed && "line-through text-muted-foreground"
                                            )}>
                                                {st.title}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </div>
            )}
        </CardContent>
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
             <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                 <DialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6 cursor-pointer">
                        <Edit2 className="h-3 w-3" />
                    </Button>
                 </DialogTrigger>
                 <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Task</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label>Title</Label>
                            <Input value={editTitle} onChange={e => setEditTitle(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Input value={editDesc} onChange={e => setEditDesc(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Priority</Label>
                            <Select value={editPriority} onValueChange={(v: any) => setEditPriority(v)}>
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
                        
                         <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <Label>Subtasks</Label>
                                <Button variant="outline" size="sm" onClick={addSubtask} className="h-6 text-xs cursor-pointer">
                                    <Plus className="h-3 w-3 mr-1" /> Add
                                </Button>
                            </div>
                            <div className="space-y-2 max-h-[150px] overflow-y-auto pr-1">
                                {task.subtasks?.map(st => (
                                    <div key={st.id} className="flex items-center gap-2">
                                        <Checkbox 
                                            checked={st.completed} 
                                            onCheckedChange={(c) => toggleSubtask(st.id, c as boolean)}
                                            className="cursor-pointer"
                                        />
                                        <Input 
                                            value={st.title} 
                                            onChange={(e) => updateSubtaskTitle(st.id, e.target.value)}
                                            className={cn("h-7 text-sm", st.completed && "line-through text-muted-foreground")}
                                        />
                                        <Button variant="ghost" size="icon" className="h-6 w-6 cursor-pointer text-muted-foreground hover:text-destructive" onClick={() => deleteSubtask(st.id)}>
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                         </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleSave} className="cursor-pointer">Save Changes</Button>
                    </DialogFooter>
                 </DialogContent>
             </Dialog>
            
            <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 hover:text-destructive cursor-pointer"
                onClick={() => onDelete(task.id)}
            >
                <Trash2 className="h-3 w-3" />
            </Button>
        </div>
      </Card>
    </motion.div>
  );
}

function getPriorityColor(priority?: string) {
    if (priority === 'high') return 'bg-red-500 hover:bg-red-600';
    if (priority === 'medium') return 'bg-yellow-500 hover:bg-yellow-600';
    return 'bg-green-500 hover:bg-green-600';
}
