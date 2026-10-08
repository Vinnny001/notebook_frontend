import { useQuery } from "@tanstack/react-query";
import { Archive, Pin, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

import { api } from "../lib/api";
import { useUiStore } from "../store/ui";
import type { Note } from "../types/api";

function preview(note: Note): string {
  return note.plain_text.trim() || "No content yet";
}

export function NoteList() {
  const selectedNotebookId = useUiStore((state) => state.selectedNotebookId);
  const selectedNoteId = useUiStore((state) => state.selectedNoteId);
  const setSelectedNoteId = useUiStore((state) => state.setSelectedNoteId);
  const [search, setSearch] = useState("");

  const params = useMemo(() => {
    const next = new URLSearchParams();
    if (selectedNotebookId) {
      next.set("notebook_id", selectedNotebookId);
    }
    if (search.trim()) {
      next.set("q", search.trim());
    }
    return next;
  }, [search, selectedNotebookId]);

  const notesQuery = useQuery({ queryKey: ["notes", params.toString()], queryFn: () => api.notes(params) });
  const notes = notesQuery.data ?? [];

  return (
    <section className="flex min-h-0 w-full flex-col border-r border-border md:w-80">
      <div className="border-b border-border p-3">
        <div className="flex h-10 items-center gap-2 rounded-md border border-border bg-background px-3">
          <Search size={16} />
          <input
            className="min-w-0 flex-1 bg-transparent outline-none"
            placeholder="Search notes"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-auto">
        {notesQuery.isLoading ? (
          <div className="space-y-3 p-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-20 animate-pulse rounded-md bg-muted" />
            ))}
          </div>
        ) : null}
        {notes.map((note) => (
          <button
            key={note.id}
            className={`block w-full border-b border-border p-3 text-left hover:bg-muted/60 ${selectedNoteId === note.id ? "bg-muted" : ""}`}
            onClick={() => setSelectedNoteId(note.id)}
          >
            <div className="flex items-center gap-2">
              <h2 className="min-w-0 flex-1 truncate text-sm font-semibold">{note.title}</h2>
              {note.is_pinned ? <Pin size={14} /> : null}
              {note.is_archived ? <Archive size={14} /> : null}
              {note.is_deleted ? <Trash2 size={14} /> : null}
            </div>
            <p className="mt-1 line-clamp-2 text-xs text-foreground/65">{preview(note)}</p>
            <div className="mt-2 flex flex-wrap gap-1">
              {note.tags.map((tag) => (
                <span key={tag.id} className="rounded px-1.5 py-0.5 text-[11px]" style={{ backgroundColor: tag.color, color: "white" }}>
                  {tag.name}
                </span>
              ))}
            </div>
          </button>
        ))}
        {!notesQuery.isLoading && notes.length === 0 ? <p className="p-4 text-sm text-foreground/65">No notes found.</p> : null}
      </div>
    </section>
  );
}
