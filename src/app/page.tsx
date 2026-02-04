"use client";

import { useAuth } from "@/components/auth-provider";
import { KanbanBoard } from "@/components/kanban-board";
import { LandingPage } from "@/components/landing-page";
import { Loader2 } from "lucide-react";

export default function Home() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <LandingPage />;
  }

  return <KanbanBoard />;
}
