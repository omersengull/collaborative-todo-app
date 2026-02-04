"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth-provider";
import { ArrowRight, CheckCircle2, Layout, Users } from "lucide-react";

export function LandingPage() {
  const { signInWithGoogle, loading } = useAuth();

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="px-6 h-16 flex items-center border-b backdrop-blur-sm bg-background/50 sticky top-0 z-50">
        <div className="flex items-center gap-2 font-bold text-xl cursor-pointer hover:opacity-80 transition-opacity">
          <Layout className="w-6 h-6 text-primary" />
          <span>CollaborativeTasks</span>
        </div>
        <div className="ml-auto">
             <Button variant="ghost" className="cursor-pointer" onClick={signInWithGoogle} disabled={loading}>Login</Button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="py-24 px-6 text-center space-y-8 max-w-4xl mx-auto">
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent pb-2">
              Collaborate on tasks in real-time.
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              A modern, drag-and-drop Kanban board enabling seamless teamwork. 
              Sync tasks instantly across all devices.
            </p>
          </div>
          
          <div className="flex justify-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
            <Button size="lg" className="rounded-full shadow-lg h-12 px-8 text-lg cursor-pointer" onClick={signInWithGoogle} disabled={loading}>
              Get Started for Free <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button size="lg" variant="outline" className="rounded-full h-12 px-8 text-lg cursor-pointer">
              Learn More
            </Button>
          </div>
        </section>

        {/* Features Preview */}
        <section className="py-20 bg-secondary/30">
            <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-8">
                <div className="bg-card p-6 rounded-2xl border shadow-sm flex flex-col items-center text-center space-y-4">
                    <div className="p-3 bg-primary/10 rounded-full text-primary">
                        <Layout className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-semibold">Kanban Board</h3>
                    <p className="text-muted-foreground">Visualize workflow with an intuitive drag-and-drop interface.</p>
                </div>
                <div className="bg-card p-6 rounded-2xl border shadow-sm flex flex-col items-center text-center space-y-4">
                    <div className="p-3 bg-purple-500/10 rounded-full text-purple-500">
                        <Users className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-semibold">Realtime Sync</h3>
                    <p className="text-muted-foreground">Collaborate with your team. Changes reflect instantly for everyone.</p>
                </div>
                <div className="bg-card p-6 rounded-2xl border shadow-sm flex flex-col items-center text-center space-y-4">
                    <div className="p-3 bg-green-500/10 rounded-full text-green-500">
                        <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-semibold">Progress Tracking</h3>
                    <p className="text-muted-foreground">Stay on top of deadlines and track project completion status.</p>
                </div>
            </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-muted-foreground border-t">
        <p>© 2026 Collaborative Tasks. Built with Next.js 15 & Firebase.</p>
      </footer>
    </div>
  );
}
