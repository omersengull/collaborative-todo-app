# Collaborative Kanban Todo App

A modern, realtime collaborative task manager inspired by Trello/Kanban boards. Built as a full-stack web app to showcase Next.js + Firebase integration with AI-assisted development (using Google Antigravity agent).

### Live Demo
[https://your-vercel-link.vercel.app](https://collaborative-todo-app-lime.vercel.app/)]

### Features
- Google Authentication & user avatars
- Realtime collaborative Kanban board (To Do, In Progress, Done columns)
- Drag-and-drop tasks with smooth animations (dnd-kit + framer-motion)
- Task sub-tasks / checklists (nested tasks)
- Priority levels, toast notifications, confetti on task completion
- Dark/light mode with system preference sync
- Responsive design (mobile-friendly vertical stacking)
- Secure Firebase rules (authenticated access only)

### Tech Stack
- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn/ui, framer-motion, dnd-kit, canvas-confetti
- **Backend**: Firebase (Realtime Database, Authentication)
- **Deployment**: Vercel

Built with assistance from Google Antigravity AI coding agent 🚀

### Getting Started
1. Clone the repo: `git clone https://github.com/omersengull/collaborative-todo-app.git`
2. Install dependencies: `npm install`
3. Create `.env.local` with your Firebase config (see env.example or your values)
4. Run locally: `npm run dev`

### Security Note
Firebase Realtime Database & Storage rules are set to authenticated users only. Update rules in Firebase console for production use.

Feel free to fork, star ⭐, or contribute!
