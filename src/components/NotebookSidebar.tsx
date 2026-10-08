import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BookOpen, FolderPlus, LogOut, Plus, Search } from "lucide-react";

import { api } from "../lib/api";
import { useAuthStore } from "../store/auth";
import { useUiStore } from "../store/ui";
import type { Notebook } from "../types/api";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "./ui/Button";

function depthOf(notebook: Notebook, notebooks: Notebook[]): number {
  let depth = 0;
  let current = notebook;
  while (current.parent_id) {
    const parent = notebooks.find((item) => item.id === current.parent_id);
    if (!parent) {
      break;
    }
    current = parent;
    depth += 1;
  }
  return depth;
}

export function NotebookSidebar() {
  const queryClient = useQueryClient();
  const clearTokens = useAuthStore((state) => state.clearTokens);
  const selectedNotebookId = useUiStore((state) => state.selectedNotebookId);
  const setSelectedNotebookId = useUiStore((state) => state.setSelectedNotebookId);
  const setSelectedNoteId = useUiStore((state) => state.setSelectedNoteId);
  const setCommandPaletteOpen = useUiStore((state) => state.setCommandPaletteOpen);

  const notebooksQuery = useQuery({ queryKey: ["notebooks"], queryFn: api.notebooks });
  const createNotebook = useMutation({
    mutationFn: () => api.createNotebook("Untitled notebook"),
    onSuccess: (notebook) => {
      queryClient.invalidateQueries({ queryKey: ["notebooks"] });
      setSelectedNotebookId(notebook.id);
    }
  });
  const createNote = useMutation({
    mutationFn: () => api.createNote({ notebook_id: selectedNotebookId, title: "Untitled note", content: {}, plain_text: "" }),
    onSuccess: (note) => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      setSelectedNoteId(note.id);
    }
  });

  const notebooks = notebooksQuery.data ?? [];

  return (
    <aside className="flex min-h-0 w-full flex-col border-r border-border bg-muted/40 md:w-72">
      <header className="flex h-14 items-center justify-between border-b border-border px-3">
        <div className="flex items-center gap-2 font-semibold">
          <BookOpen size={18} />
          Notebook
        </div>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <Button aria-label="Command palette" title="Command palette" variant="ghost" onClick={() => setCommandPaletteOpen(true)}>
            <Search size={16} />
          </Button>
        </div>
      </header>

      <div className="flex gap-2 p-3">
        <Button className="flex-1" title="New note" onClick={() => createNote.mutate()}>
          <Plus size={16} /> Note
        </Button>
        <Button title="New notebook" variant="ghost" onClick={() => createNotebook.mutate()}>
          <FolderPlus size={16} />
        </Button>
      </div>

      <nav className="min-h-0 flex-1 overflow-auto px-2">
        <button
          className={`mb-1 flex h-9 w-full items-center rounded-md px-3 text-left text-sm ${selectedNotebookId === null ? "bg-background shadow-sm" : "hover:bg-background/70"}`}
          onClick={() => setSelectedNotebookId(null)}
        >
          All notes
        </button>
        {notebooks.map((notebook) => (
          <button
            key={notebook.id}
            className={`mb-1 flex h-9 w-full items-center rounded-md px-3 text-left text-sm ${selectedNotebookId === notebook.id ? "bg-background shadow-sm" : "hover:bg-background/70"}`}
            style={{ paddingLeft: `${12 + depthOf(notebook, notebooks) * 18}px` }}
            onClick={() => setSelectedNotebookId(notebook.id)}
          >
            {notebook.name}
          </button>
        ))}
      </nav>

      <footer className="border-t border-border p-3">
        <Button className="w-full" variant="ghost" onClick={clearTokens}>
          <LogOut size={16} /> Sign out
        </Button>
      </footer>
    </aside>
  );
}
