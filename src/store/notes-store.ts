import { create } from "zustand";
import { Note, NoteCreate, NoteUpdate, TagCreate, Tag } from "@/types/note";
import * as noteService from "@/services/note-service";

// Helper functions for localStorage
const LOCAL_STORAGE_KEY_BASE = "notes_app_cache";

// Get user-specific localStorage key
const getUserStorageKey = (userId?: string) => {
  return userId
    ? `${LOCAL_STORAGE_KEY_BASE}_${userId}`
    : LOCAL_STORAGE_KEY_BASE;
};

const saveToLocalStorage = (data: {
  notes: Note[];
  allNotes: Note[];
  allTags: Tag[];
  timestamp: number;
  userId?: string;
}) => {
  if (typeof window !== "undefined") {
    try {
      const { userId, ...storageData } = data;
      const key = getUserStorageKey(userId);
      localStorage.setItem(key, JSON.stringify(storageData));
    } catch (error) {
      console.error("Error saving to localStorage:", error);
    }
  }
};

const loadFromLocalStorage = (userId?: string) => {
  if (typeof window !== "undefined") {
    try {
      const key = getUserStorageKey(userId);
      const cachedData = localStorage.getItem(key);
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

// Helper function to extract user ID from JWT token
const extractUserIdFromToken = (token: string): string | undefined => {
  try {
    const tokenParts = token.split(".");
    if (tokenParts.length === 3) {
      const payload = JSON.parse(atob(tokenParts[1]));
      return payload.sub || payload.id || payload.user_id;
    }
  } catch (e) {
    console.error("Could not extract user ID from token:", e);
  }
  return undefined;
};

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
  searchQuery: string; // Search query for filtering notes
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
  setSearchQuery: (query: string) => void; // Set search query
  applyFilters: () => void; // Apply all filters (archive, tag, search)
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
  searchQuery: "",
  editedNoteContent: null,

  // Apply all filters to notes (archive, tag, search)
  applyFilters: () => {
    const { allNotes, showArchived, selectedTag, searchQuery } = get();

    // First filter by archive status
    let filteredNotes = allNotes.filter(
      (note) => note.is_archived === showArchived
    );

    // Then filter by tag if one is selected
    if (selectedTag) {
      filteredNotes = filteredNotes.filter((note) =>
        note.tags?.some((tag) => tag.id === selectedTag.id)
      );
    }

    // Finally filter by search query if one exists
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filteredNotes = filteredNotes.filter((note) => {
        // Search in title
        const titleMatch = note.title?.toLowerCase().includes(query);
        // Search in content
        const contentMatch = note.content?.toLowerCase().includes(query);
        // Search in tags
        const tagMatch = note.tags?.some((tag) =>
          tag.name.toLowerCase().includes(query)
        );

        return titleMatch || contentMatch || tagMatch;
      });
    }

    set({ notes: filteredNotes });
  },

  // Set search query and apply filters
  setSearchQuery: (query: string) => {
    set({ searchQuery: query });
    get().applyFilters();
  },

  fetchNotes: async (token: string) => {
    set({ isLoading: true, error: null });
    try {
      // Get user ID from token for caching
      const userId = extractUserIdFromToken(token);

      // Try to load from cache first
      const cachedData = loadFromLocalStorage(userId);

      // Check if we have valid cached data
      if (cachedData && isCacheValid(cachedData.timestamp)) {
        // Apply filters to cached data
        const allNotes = cachedData.allNotes;

        set({
          allNotes,
          allTags: cachedData.allTags,
          isLoading: false,
        });

        // Extract all unique tags from notes
        get().extractAllTags();
        // Apply filters to get the filtered notes
        get().applyFilters();

        return;
      }

      // If no valid cache, fetch from the server
      const notes = await noteService.getNotes(token, get().showArchived);
      set(() => {
        // Store all notes for filtering
        const allNotes = [...notes];

        // Save to local storage
        saveToLocalStorage({
          notes: [], // Will be populated by applyFilters
          allNotes,
          allTags: [], // Will be populated by extractAllTags
          timestamp: Date.now(),
          userId,
        });

        return {
          allNotes,
          isLoading: false,
        };
      });

      // Extract all unique tags from notes
      get().extractAllTags();
      // Apply filters to get the filtered notes
      get().applyFilters();

      // Update the cache with tags
      const currentState = get();
      saveToLocalStorage({
        notes: currentState.notes,
        allNotes: currentState.allNotes,
        allTags: currentState.allTags,
        timestamp: Date.now(),
        userId,
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
      // Extract userId from token for caching
      const userId = extractUserIdFromToken(token);

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
          userId,
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
        userId,
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
      // Extract userId from token for caching
      const userId = extractUserIdFromToken(token);

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
          userId,
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
        userId,
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
      // Extract userId from token for caching
      const userId = extractUserIdFromToken(token);

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
          userId,
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
        userId,
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
      // Extract userId from token for caching
      const userId = extractUserIdFromToken(token);

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
          userId,
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
      // Extract userId from token for caching
      const userId = extractUserIdFromToken(token);

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
          userId,
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
    set({
      showArchived,
      selectedNote: null,
      selectedTag: null,
    });

    // After updating the view mode, refilter the tags list to show only relevant tags
    get().extractAllTags();
    // Apply filters to update the notes list
    get().applyFilters();
  },

  selectTag: (tag: Tag | null) => {
    set({ selectedTag: tag, selectedNote: null });
    get().applyFilters();
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
