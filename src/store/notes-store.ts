import { create } from "zustand";
import { Note, NoteCreate, NoteUpdate, TagCreate, Tag } from "@/types/note";
import * as noteService from "@/services/note-service";

interface NotesState {
  notes: Note[];
  allNotes: Note[]; // Cache of all notes for filtering
  isLoading: boolean;
  error: string | null;
  selectedNote: Note | null;
  isEditing: boolean;
  showArchived: boolean;
  selectedTag: Tag | null;
  allTags: Tag[]; // Unique tags from all notes

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
  selectTag: (tag: Tag | null) => void;
  extractAllTags: () => void;
}

export const useNotesStore = create<NotesState>((set, get) => ({
  notes: [],
  allNotes: [],
  isLoading: false,
  error: null,
  selectedNote: null,
  isEditing: false,
  showArchived: false,
  selectedTag: null,
  allTags: [],

  fetchNotes: async (token: string) => {
    set({ isLoading: true, error: null });
    try {
      const notes = await noteService.getNotes(token, get().showArchived);
      set((state) => {
        // Store all notes for filtering
        const allNotes = [...notes];

        // Apply tag filter if one is selected
        const filteredNotes = state.selectedTag
          ? notes.filter((note) =>
              note.tags?.some((tag) => tag.id === state.selectedTag?.id)
            )
          : notes;

        return {
          notes: filteredNotes,
          allNotes,
          isLoading: false,
        };
      });

      // Extract all unique tags from notes
      get().extractAllTags();
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
      set((state) => {
        // Add to all notes
        const allNotes = [newNote, ...state.allNotes];

        // Check if it should be in filtered notes
        let updatedNotes = state.notes;
        const matchesTagFilter =
          !state.selectedTag ||
          newNote.tags?.some((tag) => tag.id === state.selectedTag?.id);

        if (matchesTagFilter) {
          updatedNotes = [newNote, ...state.notes];
        }

        return {
          notes: updatedNotes,
          allNotes,
          isLoading: false,
          selectedNote: newNote,
        };
      });

      // Update tags list
      get().extractAllTags();

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
      set((state) => {
        // Update in all notes
        const allNotes = state.allNotes.map((n) =>
          n.id === id ? updatedNote : n
        );

        // Check if it matches current filter
        const matchesTagFilter =
          !state.selectedTag ||
          updatedNote.tags?.some((tag) => tag.id === state.selectedTag?.id);

        // Update filtered notes accordingly
        let updatedNotes;
        if (matchesTagFilter) {
          updatedNotes = state.notes.map((n) =>
            n.id === id ? updatedNote : n
          );
        } else {
          updatedNotes = state.notes.filter((n) => n.id !== id);
        }

        return {
          notes: updatedNotes,
          allNotes,
          isLoading: false,
          selectedNote:
            state.selectedNote?.id === id ? updatedNote : state.selectedNote,
        };
      });

      // Update tags list
      get().extractAllTags();

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
        allNotes: state.allNotes.filter((n) => n.id !== id),
        isLoading: false,
        selectedNote: state.selectedNote?.id === id ? null : state.selectedNote,
      }));

      // Update tags list
      get().extractAllTags();
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
      set((state) => {
        // Update in all notes
        const allNotes = state.allNotes.map((n) =>
          n.id === id ? updatedNote : n
        );

        // Check if it matches current filter
        const matchesTagFilter =
          !state.selectedTag ||
          updatedNote.tags?.some((tag) => tag.id === state.selectedTag?.id);

        // Update filtered notes accordingly
        let updatedNotes;
        if (matchesTagFilter) {
          updatedNotes = state.notes.map((n) =>
            n.id === id ? updatedNote : n
          );
        } else {
          updatedNotes = state.notes.filter((n) => n.id !== id);
        }

        return {
          notes: updatedNotes,
          allNotes,
          isLoading: false,
          selectedNote:
            state.selectedNote?.id === id ? updatedNote : state.selectedNote,
        };
      });

      // Update tags list
      get().extractAllTags();

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

      set((state) => {
        // Update in all notes
        const allNotes = state.allNotes.map((n) =>
          n.id === id ? updatedNote : n
        );

        // Remove from visible notes if we're not viewing archived
        let updatedNotes = state.notes;
        if (!state.showArchived) {
          updatedNotes = state.notes.filter((n) => n.id !== id);
        } else {
          // If viewing archived, update if it matches tag filter
          const matchesTagFilter =
            !state.selectedTag ||
            updatedNote.tags?.some((tag) => tag.id === state.selectedTag?.id);

          if (matchesTagFilter) {
            updatedNotes = state.notes.map((n) =>
              n.id === id ? updatedNote : n
            );
          } else {
            updatedNotes = state.notes.filter((n) => n.id !== id);
          }
        }

        return {
          notes: updatedNotes,
          allNotes,
          isLoading: false,
          selectedNote:
            state.selectedNote?.id === id
              ? state.showArchived
                ? updatedNote
                : null
              : state.selectedNote,
        };
      });

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

      set((state) => {
        // Update in all notes
        const allNotes = state.allNotes.map((n) =>
          n.id === id ? updatedNote : n
        );

        // Remove from visible notes if we're viewing archived
        let updatedNotes = state.notes;
        if (state.showArchived) {
          updatedNotes = state.notes.filter((n) => n.id !== id);
        } else {
          // If viewing regular notes, update if it matches tag filter
          const matchesTagFilter =
            !state.selectedTag ||
            updatedNote.tags?.some((tag) => tag.id === state.selectedTag?.id);

          if (matchesTagFilter) {
            updatedNotes = state.notes.map((n) =>
              n.id === id ? updatedNote : n
            );
          } else {
            updatedNotes = state.notes.filter((n) => n.id !== id);
          }
        }

        return {
          notes: updatedNotes,
          allNotes,
          isLoading: false,
          selectedNote:
            state.selectedNote?.id === id
              ? !state.showArchived
                ? updatedNote
                : null
              : state.selectedNote,
        };
      });

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
      // If changing view mode, deselect any selected note and tag
      return {
        showArchived,
        selectedNote: null,
        selectedTag: null,
      };
    });
  },

  selectTag: (tag: Tag | null) => {
    const { showArchived, allNotes } = get();

    set((state) => {
      if (!tag) {
        // If tag is null, show all notes based on archive status
        return {
          selectedTag: null,
          notes: allNotes.filter((note) => note.is_archived === showArchived),
          selectedNote: null,
        };
      }

      // Filter notes by tag and archive status
      const filteredNotes = allNotes.filter(
        (note) =>
          note.is_archived === showArchived &&
          note.tags?.some((noteTag) => noteTag.id === tag.id)
      );

      return {
        selectedTag: tag,
        notes: filteredNotes,
        selectedNote: null,
      };
    });
  },

  extractAllTags: () => {
    const { allNotes } = get();

    // Collect all tags from all notes
    const tagsMap = new Map<number, Tag>();

    allNotes.forEach((note) => {
      note.tags?.forEach((tag) => {
        if (!tagsMap.has(tag.id)) {
          tagsMap.set(tag.id, tag);
        }
      });
    });

    // Convert map to array and sort by name
    const allTags = Array.from(tagsMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );

    set({ allTags });
  },
}));
