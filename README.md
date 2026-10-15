# My To-Do List

A clean, responsive to-do list application with dark/light theme support and persistent cloud storage via Supabase.

[![Open in Bolt](https://bolt.new/static/open-in-bolt.svg)](https://bolt.new/~/sb1-umrajxpb)

## Features

- **Add tasks** — Type a task and press Enter or click Add to create it instantly.
- **Mark as complete** — Click the checkbox next to any task to toggle its completion status. Completed tasks show a strikethrough and a "Done" badge.
- **Delete tasks** — Remove individual tasks with the trash icon on each row.
- **Clear all** — Wipe the entire list with a single button.
- **Dark / light theme** — Toggle between light and dark mode. Your preference is saved to `localStorage` and restores on reload. Defaults to your system's color scheme on first visit.
- **Persistent storage** — All tasks are stored in a Supabase Postgres database, so they survive page reloads and browser restarts.
- **Responsive design** — Works seamlessly on mobile and desktop.

## Tech Stack

- **React 18** + **TypeScript** — UI framework with static typing
- **Vite 5** — Build tool and dev server
- **Tailwind CSS 3** — Utility-first styling with dark mode support
- **Lucide React** — Icon library
- **Supabase** — Postgres database backend with Row Level Security

## Getting Started

### Prerequisites

- Node.js 18+
- A Supabase project (or use the one provisioned by Bolt)

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env` file in the project root with the following variables (already provisioned on Bolt):

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

The production build outputs static files to `dist/`, which can be deployed to any static hosting provider.

### Type Check

```bash
npm run typecheck
```

## Database Schema

The app uses a single `todos` table:

| Column       | Type         | Description                          |
| ------------ | ------------ | ------------------------------------ |
| `id`         | uuid (PK)    | Auto-generated unique identifier     |
| `title`      | text         | The task description                 |
| `completed`  | boolean      | Whether the task is done (default false) |
| `created_at` | timestamptz  | Creation timestamp (default now())   |

Row Level Security is enabled with policies allowing anonymous and authenticated users full CRUD access, since this is a single-tenant shared to-do list without authentication.

## Project Structure

```
src/
├── App.tsx           # Main application component with all to-do logic
├── main.tsx          # React entry point
├── index.css         # Tailwind CSS directives
├── vite-env.d.ts     # Vite + environment variable type declarations
└── lib/
    └── supabase.ts   # Supabase client initialization and Todo type
```
