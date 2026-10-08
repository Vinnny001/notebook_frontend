import { create } from "zustand";

interface UiState {
  selectedNoteId: string | null;
  selectedNotebookId: string | null;
  commandPaletteOpen: boolean;
  setSelectedNoteId: (noteId: string | null) => void;
  setSelectedNotebookId: (notebookId: string | null) => void;
  setCommandPaletteOpen: (open: boolean) => void;
}

export const useUiStore = create<UiState>((set) => ({
  selectedNoteId: null,
  selectedNotebookId: null,
  commandPaletteOpen: false,
  setSelectedNoteId: (selectedNoteId) => set({ selectedNoteId }),
  setSelectedNotebookId: (selectedNotebookId) => set({ selectedNotebookId }),
  setCommandPaletteOpen: (commandPaletteOpen) => set({ commandPaletteOpen })
}));
