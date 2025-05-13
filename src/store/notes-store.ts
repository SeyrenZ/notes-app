import { create } from "zustand";
import { Note, NoteCreate, NoteUpdate, TagCreate, Tag } from "@/types/note";
import * as noteService from "@/services/note-service";

// Helper functions for localStorage
const LOCAL_STORAGE_KEY = "notes_app_cache";

const saveToLocalStorage = (data: {
  notes: Note[];
  allNotes: Note[];
  allTags: Tag[];
  timestamp: number;
}) => {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error("Error saving to localStorage:", error);
    }
  }
};

const loadFromLocalStorage = () => {
  if (typeof window !== "undefined") {
    try {
      const cachedData = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (cachedData) {
        return JSON.parse(cachedData);
      }
    } catch (error) {
      console.error("Error loading from localStorage:", error);
    }
  }
  return null;
};

// Cache expiration time (24 hours in milliseconds)
const CACHE_EXPIRATION = 24 * 60 * 60 * 1000;

// Check if the cache is valid (not expired)
const isCacheValid = (timestamp: number) => {
  return Date.now() - timestamp < CACHE_EXPIRATION;
};

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
  editedNoteContent: {
    title?: string;
    content?: string;
    tags?: string;
  } | null;

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
  updateEditedContent: (content: {
    title?: string;
    content?: string;
    tags?: string;
  }) => void;
  clearEditedContent: () => void;
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
  editedNoteContent: null,

  fetchNotes: async (token: string) => {
    set({ isLoading: true, error: null });
    try {
      // Try to load from cache first
      const cachedData = loadFromLocalStorage();

      // Check if we have valid cached data
      if (cachedData && isCacheValid(cachedData.timestamp)) {
        // Apply filters to cached data
        const allNotes = cachedData.allNotes;

        // Filter by archive status
        const archiveFiltered = allNotes.filter(
          (note: Note) => note.is_archived === get().showArchived
        );

        // Apply tag filter if one is selected
        const filteredNotes = get().selectedTag
          ? archiveFiltered.filter((note: Note) =>
              note.tags?.some((tag: Tag) => tag.id === get().selectedTag?.id)
            )
          : archiveFiltered;

        set({
          notes: filteredNotes,
          allNotes,
          allTags: cachedData.allTags,
          isLoading: false,
        });

        // Extract all unique tags from notes
        get().extractAllTags();

        return;
      }

      // If no valid cache, fetch from the server
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

        // Save to local storage
        saveToLocalStorage({
          notes: filteredNotes,
          allNotes,
          allTags: [], // Will be populated by extractAllTags
          timestamp: Date.now(),
        });

        return {
          notes: filteredNotes,
          allNotes,
          isLoading: false,
        };
      });

      // Extract all unique tags from notes
      get().extractAllTags();

      // Update the cache with tags
      const currentState = get();
      saveToLocalStorage({
        notes: currentState.notes,
        allNotes: currentState.allNotes,
        allTags: currentState.allTags,
        timestamp: Date.now(),
      });
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

        // Update the cache
        const returnState = {
          notes: updatedNotes,
          allNotes,
          isLoading: false,
          selectedNote: newNote,
        };

        saveToLocalStorage({
          notes: updatedNotes,
          allNotes,
          allTags: state.allTags,
          timestamp: Date.now(),
        });

        return returnState;
      });

      // Update tags list
      get().extractAllTags();

      // Also update cache with the new tags
      const currentState = get();
      saveToLocalStorage({
        notes: currentState.notes,
        allNotes: currentState.allNotes,
        allTags: currentState.allTags,
        timestamp: Date.now(),
      });

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

        // Update the cache
        const returnState = {
          notes: updatedNotes,
          allNotes,
          isLoading: false,
          selectedNote:
            state.selectedNote?.id === id ? updatedNote : state.selectedNote,
        };

        saveToLocalStorage({
          notes: updatedNotes,
          allNotes,
          allTags: state.allTags,
          timestamp: Date.now(),
        });

        return returnState;
      });

      // Update tags list
      get().extractAllTags();

      // Also update cache with the new tags
      const currentState = get();
      saveToLocalStorage({
        notes: currentState.notes,
        allNotes: currentState.allNotes,
        allTags: currentState.allTags,
        timestamp: Date.now(),
      });

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
      set((state) => {
        const updatedNotes = state.notes.filter((n) => n.id !== id);
        const updatedAllNotes = state.allNotes.filter((n) => n.id !== id);

        // Update the cache
        saveToLocalStorage({
          notes: updatedNotes,
          allNotes: updatedAllNotes,
          allTags: state.allTags,
          timestamp: Date.now(),
        });

        return {
          notes: updatedNotes,
          allNotes: updatedAllNotes,
          isLoading: false,
          selectedNote:
            state.selectedNote?.id === id ? null : state.selectedNote,
        };
      });

      // Update tags list
      get().extractAllTags();

      // Also update cache with the new tags
      const currentState = get();
      saveToLocalStorage({
        notes: currentState.notes,
        allNotes: currentState.allNotes,
        allTags: currentState.allTags,
        timestamp: Date.now(),
      });
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

  updateEditedContent: (content: {
    title?: string;
    content?: string;
    tags?: string;
  }) => {
    set({ editedNoteContent: content });
  },

  clearEditedContent: () => {
    set({ editedNoteContent: null });
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

        // Update the localStorage cache
        saveToLocalStorage({
          notes: updatedNotes,
          allNotes,
          allTags: state.allTags,
          timestamp: Date.now(),
        });

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

        // Update the localStorage cache
        saveToLocalStorage({
          notes: updatedNotes,
          allNotes,
          allTags: state.allTags,
          timestamp: Date.now(),
        });

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

    // After updating the view mode, refilter the tags list to show only relevant tags
    get().extractAllTags();
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
    const { allNotes, showArchived } = get();

    // Collect all tags from notes in the current view (archived or non-archived)
    const tagsMap = new Map<number, Tag>();

    // Only consider notes that match the current archive status
    const relevantNotes = allNotes.filter(
      (note) => note.is_archived === showArchived
    );

    relevantNotes.forEach((note) => {
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
