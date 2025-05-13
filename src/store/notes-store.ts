import { create } from "zustand";
import { Note, NoteCreate, NoteUpdate, TagCreate } from "@/types/note";
import * as noteService from "@/services/note-service";

interface NotesState {
  notes: Note[];
  isLoading: boolean;
  error: string | null;
  selectedNote: Note | null;
  isEditing: boolean;
  showArchived: boolean;

  // Actions
  fetchNotes: (token: string) => Promise<void>;
  createNote: (note: NoteCreate, token: string) => Promise<Note>;
  updateNote: (id: number, note: NoteUpdate, token: string) => Promise<Note>;
  deleteNote: (id: number, token: string) => Promise<void>;
  selectNote: (note: Note | null) => void;
  addTagsToNote: (
    id: number,
    tags: TagCreate[],
    token: string
  ) => Promise<Note>;
  createAndProcessTags: (
    noteId: number,
    tagInput: string,
    token: string
  ) => Promise<Note>;
  setIsEditing: (isEditing: boolean) => void;
  archiveNote: (id: number, token: string) => Promise<Note>;
  unarchiveNote: (id: number, token: string) => Promise<Note>;
  setShowArchived: (showArchived: boolean) => void;
}

export const useNotesStore = create<NotesState>((set, get) => ({
  notes: [],
  isLoading: false,
  error: null,
  selectedNote: null,
  isEditing: false,
  showArchived: false,

  fetchNotes: async (token: string) => {
    set({ isLoading: true, error: null });
    try {
      const notes = await noteService.getNotes(token, get().showArchived);
      set({ notes, isLoading: false });
    } catch (error) {
      console.error("Error fetching notes:", error);
      set({
        error: error instanceof Error ? error.message : "Failed to fetch notes",
        isLoading: false,
      });
    }
  },

  createNote: async (note: NoteCreate, token: string) => {
    set({ isLoading: true, error: null });
    try {
      const newNote = await noteService.createNote(note, token);
      set((state) => ({
        notes: [newNote, ...state.notes],
        isLoading: false,
        selectedNote: newNote,
      }));
      return newNote;
    } catch (error) {
      console.error("Error creating note:", error);
      set({
        error: error instanceof Error ? error.message : "Failed to create note",
        isLoading: false,
      });
      throw error;
    }
  },

  updateNote: async (id: number, note: NoteUpdate, token: string) => {
    set({ isLoading: true, error: null });
    try {
      const updatedNote = await noteService.updateNote(id, note, token);
      set((state) => ({
        notes: state.notes.map((n) => (n.id === id ? updatedNote : n)),
        isLoading: false,
        selectedNote:
          state.selectedNote?.id === id ? updatedNote : state.selectedNote,
      }));
      return updatedNote;
    } catch (error) {
      console.error("Error updating note:", error);
      set({
        error: error instanceof Error ? error.message : "Failed to update note",
        isLoading: false,
      });
      throw error;
    }
  },

  deleteNote: async (id: number, token: string) => {
    set({ isLoading: true, error: null });
    try {
      await noteService.deleteNote(id, token);
      set((state) => ({
        notes: state.notes.filter((n) => n.id !== id),
        isLoading: false,
        selectedNote: state.selectedNote?.id === id ? null : state.selectedNote,
      }));
    } catch (error) {
      console.error("Error deleting note:", error);
      set({
        error: error instanceof Error ? error.message : "Failed to delete note",
        isLoading: false,
      });
      throw error;
    }
  },

  selectNote: (note: Note | null) => {
    set({ selectedNote: note });
  },

  addTagsToNote: async (id: number, tags: TagCreate[], token: string) => {
    set({ isLoading: true, error: null });
    try {
      const updatedNote = await noteService.addTagsToNote(id, tags, token);
      set((state) => ({
        notes: state.notes.map((n) => (n.id === id ? updatedNote : n)),
        isLoading: false,
        selectedNote:
          state.selectedNote?.id === id ? updatedNote : state.selectedNote,
      }));
      return updatedNote;
    } catch (error) {
      console.error("Error adding tags to note:", error);
      set({
        error: error instanceof Error ? error.message : "Failed to add tags",
        isLoading: false,
      });
      throw error;
    }
  },

  createAndProcessTags: async (
    noteId: number,
    tagInput: string,
    token: string
  ) => {
    if (!tagInput.trim()) return get().selectedNote as Note;

    const tagNames = tagInput
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag !== "");

    const tags = tagNames.map((name) => ({ name }));

    return await get().addTagsToNote(noteId, tags, token);
  },

  setIsEditing: (isEditing: boolean) => {
    set({ isEditing });
  },

  archiveNote: async (id: number, token: string) => {
    set({ isLoading: true, error: null });
    try {
      const updatedNote = await noteService.updateNote(
        id,
        { is_archived: true },
        token
      );

      // If we're not viewing archived notes, remove from the list
      set((state) => ({
        notes: state.showArchived
          ? state.notes.map((n) => (n.id === id ? updatedNote : n))
          : state.notes.filter((n) => n.id !== id),
        isLoading: false,
        selectedNote: state.showArchived
          ? state.selectedNote?.id === id
            ? updatedNote
            : state.selectedNote
          : state.selectedNote?.id === id
          ? null
          : state.selectedNote,
      }));

      return updatedNote;
    } catch (error) {
      console.error("Error archiving note:", error);
      set({
        error:
          error instanceof Error ? error.message : "Failed to archive note",
        isLoading: false,
      });
      throw error;
    }
  },

  unarchiveNote: async (id: number, token: string) => {
    set({ isLoading: true, error: null });
    try {
      const updatedNote = await noteService.updateNote(
        id,
        { is_archived: false },
        token
      );

      // If we're viewing archived notes, remove from the list
      set((state) => ({
        notes: state.showArchived
          ? state.notes.filter((n) => n.id !== id)
          : state.notes.map((n) => (n.id === id ? updatedNote : n)),
        isLoading: false,
        selectedNote: state.showArchived
          ? state.selectedNote?.id === id
            ? null
            : state.selectedNote
          : state.selectedNote?.id === id
          ? updatedNote
          : state.selectedNote,
      }));

      return updatedNote;
    } catch (error) {
      console.error("Error unarchiving note:", error);
      set({
        error:
          error instanceof Error ? error.message : "Failed to unarchive note",
        isLoading: false,
      });
      throw error;
    }
  },

  setShowArchived: (showArchived: boolean) => {
    set((state) => {
      // If changing view mode, deselect any selected note
      return {
        showArchived,
        selectedNote: null,
      };
    });
  },
}));
