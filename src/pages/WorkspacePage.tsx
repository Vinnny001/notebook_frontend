import { useEffect } from "react";

import { CommandPalette } from "../components/CommandPalette";
import { EditorPane } from "../components/EditorPane";
import { NotebookSidebar } from "../components/NotebookSidebar";
import { NoteList } from "../components/NoteList";
import { useUiStore } from "../store/ui";

export function WorkspacePage() {
  const setCommandPaletteOpen = useUiStore((state) => state.setCommandPaletteOpen);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandPaletteOpen(true);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setCommandPaletteOpen]);

  return (
    <main className="flex h-screen min-h-0 flex-col bg-background md:flex-row">
      <NotebookSidebar />
      <NoteList />
      <EditorPane />
      <CommandPalette />
    </main>
  );
}
