import Placeholder from "@tiptap/extension-placeholder";
import Table from "@tiptap/extension-table";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TableRow from "@tiptap/extension-table-row";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import Underline from "@tiptap/extension-underline";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Archive, Clock, Link2, Pin, Trash2, Wifi, WifiOff } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { useRealtime } from "../hooks/useRealtime";
import { api } from "../lib/api";
import { useUiStore } from "../store/ui";
import { EditorToolbar } from "./EditorToolbar";
import { Button } from "./ui/Button";

type SaveStatus = "idle" | "saving" | "saved" | "error";

export function EditorPane() {
  const queryClient = useQueryClient();
  const selectedNoteId = useUiStore((state) => state.selectedNoteId);
  const [title, setTitle] = useState("");
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");

  const noteQuery = useQuery({ queryKey: ["note", selectedNoteId], queryFn: () => api.note(selectedNoteId ?? ""), enabled: Boolean(selectedNoteId) });
  const versionsQuery = useQuery({ queryKey: ["versions", selectedNoteId], queryFn: () => api.versions(selectedNoteId ?? ""), enabled: Boolean(selectedNoteId) });
  const note = noteQuery.data;

  const saveMutation = useMutation({
    mutationFn: () => {
      if (!selectedNoteId || !editor) {
        throw new Error("No note selected");
      }
      setSaveStatus("saving");
      return api.updateNote(selectedNoteId, {
        title,
        content: editor.getJSON() as Record<string, unknown>,
        plain_text: editor.getText()
      });
    },
    onSuccess: () => {
      setSaveStatus("saved");
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      queryClient.invalidateQueries({ queryKey: ["note", selectedNoteId] });
      queryClient.invalidateQueries({ queryKey: ["versions", selectedNoteId] });
    },
    onError: () => setSaveStatus("error")
  });

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TaskList,
      TaskItem.configure({ nested: true }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      Placeholder.configure({ placeholder: "Write, paste, or type / for ideas..." })
    ],
    content: note?.content ?? {},
    editorProps: {
      attributes: {
        class: "prose max-w-none px-6 py-5"
      }
    },
    onUpdate: () => setSaveStatus("idle")
  });

  useEffect(() => {
    if (note && editor && !editor.isFocused) {
      setTitle(note.title);
      editor.commands.setContent(note.content);
      setSaveStatus("saved");
    }
  }, [editor, note]);

  useEffect(() => {
    if (!selectedNoteId || !editor || saveStatus !== "idle") {
      return;
    }
    const timeout = window.setTimeout(() => saveMutation.mutate(), 900);
    return () => window.clearTimeout(timeout);
  }, [editor, saveMutation, saveStatus, selectedNoteId, title]);

  const onRealtimeMessage = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["note", selectedNoteId] });
  }, [queryClient, selectedNoteId]);
  const connectionStatus = useRealtime(selectedNoteId, onRealtimeMessage);

  const statusLabel = useMemo(() => {
    if (saveStatus === "saving") {
      return "Saving...";
    }
    if (saveStatus === "error") {
      return "Save failed";
    }
    if (saveStatus === "saved") {
      return "Saved";
    }
    return "Unsaved";
  }, [saveStatus]);

  function patchFlag(payload: { is_pinned?: boolean; is_archived?: boolean; is_deleted?: boolean }) {
    if (!selectedNoteId) {
      return;
    }
    api.updateNote(selectedNoteId, payload).then(() => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      queryClient.invalidateQueries({ queryKey: ["note", selectedNoteId] });
    });
  }

  if (!selectedNoteId) {
    return <section className="grid min-h-0 flex-1 place-items-center p-6 text-sm text-foreground/65">Select or create a note.</section>;
  }

  return (
    <section className="flex min-h-0 flex-1 flex-col">
      <header className="border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <input
            className="min-w-0 flex-1 bg-transparent text-xl font-semibold outline-none"
            value={title}
            onChange={(event) => {
              setTitle(event.target.value);
              setSaveStatus("idle");
            }}
          />
          <Button title="Pin" variant="ghost" onClick={() => patchFlag({ is_pinned: !note?.is_pinned })}>
            <Pin size={16} />
          </Button>
          <Button title="Archive" variant="ghost" onClick={() => patchFlag({ is_archived: !note?.is_archived })}>
            <Archive size={16} />
          </Button>
          <Button title="Move to trash" variant="ghost" onClick={() => patchFlag({ is_deleted: true })}>
            <Trash2 size={16} />
          </Button>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-foreground/60">
          <span className="inline-flex items-center gap-1">
            <Clock size={13} /> {statusLabel}
          </span>
          <span className="inline-flex items-center gap-1">
            {connectionStatus === "online" ? <Wifi size={13} /> : <WifiOff size={13} />} {connectionStatus}
          </span>
          <span className="inline-flex items-center gap-1">
            <Link2 size={13} /> {versionsQuery.data?.length ?? 0} revisions
          </span>
        </div>
      </header>
      <EditorToolbar editor={editor} onSave={() => saveMutation.mutate()} />
      <div className="min-h-0 flex-1 overflow-auto">
        <EditorContent editor={editor} />
      </div>
    </section>
  );
}
