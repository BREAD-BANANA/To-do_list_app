import { useCallback, useEffect, useState } from 'react';
import { Plus, Trash2, Check, Loader2, Sun, Moon, CheckCircle2 } from 'lucide-react';
import { supabase, type Todo } from '@/lib/supabase';

export default function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [clearing, setClearing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [dark]);

  const fetchTodos = useCallback(async () => {
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      setError(error.message);
    } else {
      setTodos(data as Todo[]);
      setError(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    const title = newTitle.trim();
    if (!title) return;

    setAdding(true);
    const { data, error } = await supabase
      .from('todos')
      .insert({ title })
      .select()
      .single();

    if (error) {
      setError(error.message);
    } else {
      setTodos((prev) => [data as Todo, ...prev]);
      setNewTitle('');
      setError(null);
    }
    setAdding(false);
  };

  const deleteTodo = async (id: string) => {
    setDeletingId(id);
    const { error } = await supabase.from('todos').delete().eq('id', id);

    if (error) {
      setError(error.message);
    } else {
      setTodos((prev) => prev.filter((t) => t.id !== id));
      setError(null);
    }
    setDeletingId(null);
  };

  const toggleTodo = async (todo: Todo) => {
    setTogglingId(todo.id);
    const { data, error } = await supabase
      .from('todos')
      .update({ completed: !todo.completed })
      .eq('id', todo.id)
      .select()
      .single();

    if (error) {
      setError(error.message);
    } else {
      setTodos((prev) =>
        prev.map((t) => (t.id === todo.id ? (data as Todo) : t))
      );
      setError(null);
    }
    setTogglingId(null);
  };

  const clearAll = async () => {
    if (todos.length === 0) return;
    setClearing(true);
    const { error } = await supabase.from('todos').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    if (error) {
      setError(error.message);
    } else {
      setTodos([]);
      setError(null);
    }
    setClearing(false);
  };

  const completedCount = todos.filter((t) => t.completed).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 transition-colors dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="mx-auto max-w-xl px-4 py-10 sm:py-16">
        {/* Theme toggle */}
        <div className="mb-6 flex justify-end">
          <button
            onClick={() => setDark((d) => !d)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:border-slate-300 hover:shadow-md active:scale-95 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-slate-600"
            aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            <span>{dark ? 'Light' : 'Dark'}</span>
          </button>
        </div>

        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 shadow-lg shadow-blue-600/30">
            <Check className="h-7 w-7 text-white" strokeWidth={3} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-4xl">
            My To-Do List
          </h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            {loading
              ? 'Loading your tasks...'
              : todos.length === 0
                ? 'No tasks yet — add one below to get started.'
                : `${completedCount} of ${todos.length} task${todos.length === 1 ? '' : 's'} completed`}
          </p>
        </div>

        {/* Error banner */}
        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Add form */}
        <form onSubmit={addTodo} className="mb-6 flex gap-2">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="What needs to be done?"
            disabled={adding}
            className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 placeholder-slate-400 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500"
          />
          <button
            type="submit"
            disabled={adding || !newTitle.trim()}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-medium text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
          >
            {adding ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Plus className="h-5 w-5" />
            )}
            <span className="hidden sm:inline">Add</span>
          </button>
        </form>

        {/* Todo list */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : todos.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white/50 py-16 text-center dark:border-slate-700 dark:bg-slate-800/30">
            <p className="text-slate-400 dark:text-slate-500">Your list is empty.</p>
          </div>
        ) : (
          <>
            <ul className="space-y-2">
              {todos.map((todo) => (
                <li
                  key={todo.id}
                  className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition hover:border-slate-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-800 dark:hover:border-slate-600"
                >
                  {/* Checkbox */}
                  <button
                    onClick={() => toggleTodo(todo)}
                    disabled={togglingId === todo.id}
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 transition ${
                      todo.completed
                        ? 'border-blue-600 bg-blue-600 text-white'
                        : 'border-slate-300 text-transparent hover:border-blue-400 dark:border-slate-600 dark:hover:border-blue-400'
                    }`}
                    aria-label={todo.completed ? 'Mark as not done' : 'Mark as done'}
                  >
                    {togglingId === todo.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Check className="h-3.5 w-3.5" strokeWidth={3} />
                    )}
                  </button>

                  {/* Title */}
                  <span
                    className={`flex-1 text-sm sm:text-base ${
                      todo.completed
                        ? 'text-slate-400 line-through dark:text-slate-500'
                        : 'text-slate-800 dark:text-slate-100'
                    }`}
                  >
                    {todo.title}
                  </span>

                  {/* Completed badge */}
                  {todo.completed && (
                    <span className="hidden shrink-0 items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-600 dark:bg-blue-950/50 dark:text-blue-400 sm:inline-flex">
                      <CheckCircle2 className="h-3 w-3" />
                      Done
                    </span>
                  )}

                  {/* Delete */}
                  <button
                    onClick={() => deleteTodo(todo.id)}
                    disabled={deletingId === todo.id}
                    className="shrink-0 rounded-lg p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600 active:scale-90 disabled:opacity-50 dark:hover:bg-red-950/50 dark:hover:text-red-400"
                    aria-label="Delete task"
                  >
                    {deletingId === todo.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                </li>
              ))}
            </ul>

            {/* Clear all */}
            <div className="mt-6 flex justify-center">
              <button
                onClick={clearAll}
                disabled={clearing || todos.length === 0}
                className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-medium text-red-600 shadow-sm transition hover:bg-red-50 hover:shadow-md active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-900/50 dark:bg-slate-800 dark:text-red-400 dark:hover:bg-red-950/40"
              >
                {clearing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                Clear All Tasks
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
