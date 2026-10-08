import { useQuery } from "@tanstack/react-query";
import { Search, X } from "lucide-react";
import { useMemo, useState } from "react";

import { api } from "../lib/api";
import { useUiStore } from "../store/ui";
import { Button } from "./ui/Button";

export function CommandPalette() {
  const open = useUiStore((state) => state.commandPaletteOpen);
  const setOpen = useUiStore((state) => state.setCommandPaletteOpen);
  const setSelectedNoteId = useUiStore((state) => state.setSelectedNoteId);
  const [query, setQuery] = useState("");
  const params = useMemo(() => {
    const next = new URLSearchParams();
    if (query) {
      next.set("q", query);
    }
    return next;
  }, [query]);
  const notesQuery = useQuery({ queryKey: ["palette-notes", params.toString()], queryFn: () => api.notes(params), enabled: open });

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/35 p-4" onMouseDown={() => setOpen(false)}>
      <section className="mx-auto mt-20 max-w-xl rounded-lg border border-border bg-background shadow-xl" onMouseDown={(event) => event.stopPropagation()}>
        <div className="flex h-12 items-center gap-2 border-b border-border px-3">
          <Search size={17} />
          <input className="min-w-0 flex-1 bg-transparent outline-none" autoFocus value={query} onChange={(event) => setQuery(event.target.value)} />
          <Button title="Close" variant="ghost" onClick={() => setOpen(false)}>
            <X size={16} />
          </Button>
        </div>
        <div className="max-h-96 overflow-auto p-2">
          {(notesQuery.data ?? []).map((note) => (
            <button
              key={note.id}
              className="block w-full rounded-md px-3 py-2 text-left hover:bg-muted"
              onClick={() => {
                setSelectedNoteId(note.id);
                setOpen(false);
              }}
            >
              <span className="block text-sm font-medium">{note.title}</span>
              <span className="block truncate text-xs text-foreground/60">{note.plain_text}</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
