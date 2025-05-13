import { TagIcon, ClockIcon, X } from "lucide-react";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "../../ui/button";
import { useSession } from "next-auth/react";
import { useNotesStore } from "@/store/notes-store";
import { toast } from "sonner";
import { Note, Tag } from "@/types/note";

interface CreateNewNoteProps {
  onClose: () => void;
  onDraftChange: (draftNote: Partial<Note>) => void;
}

const CreateNewNote: React.FC<CreateNewNoteProps> = ({
  onClose,
  onDraftChange,
}) => {
  const { data: session } = useSession();
  const { createNote, createAndProcessTags } = useNotesStore();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Use debounce to prevent too many updates
  const debouncedUpdateRef = useRef<NodeJS.Timeout | null>(null);

  // Create a function to prepare the draft note data
  const prepareDraftNote = useCallback(() => {
    const tagsList = tags
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0)
      .map(
        (name, index) =>
          ({
            id: -index - 1,
            name,
            created_at: new Date().toISOString(),
          } as Tag)
      );

    return {
      title: title || "Untitled Note",
      content: content,
      tags: tagsList.length > 0 ? tagsList : undefined,
      updated_at: new Date().toISOString(),
    };
  }, [title, content, tags]);

  // Update draft note immediately for title changes
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);

    // Update draft immediately for title changes
    const draftNote = prepareDraftNote();
    draftNote.title = newTitle || "Untitled Note";
    onDraftChange(draftNote);
  };

  // Update content with debouncing
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);

    // Content changes will be handled by the useEffect debounce
  };

  // Update tags with immediate response for small changes
  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTags = e.target.value;
    setTags(newTags);

    // Update immediately for small tag changes (like commas)
    if (Math.abs(newTags.length - tags.length) <= 1) {
      const draftNote = prepareDraftNote();
      draftNote.tags = newTags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0)
        .map(
          (name, index) =>
            ({
              id: -index - 1,
              name,
              created_at: new Date().toISOString(),
            } as Tag)
        );

      if (draftNote.tags.length === 0) {
        draftNote.tags = undefined;
      }

      onDraftChange(draftNote);
    }
  };

  // Update draft note with debouncing to prevent infinite loops
  useEffect(() => {
    // Clear any existing timeout
    if (debouncedUpdateRef.current) {
      clearTimeout(debouncedUpdateRef.current);
    }

    // Set a new timeout to update the draft note
    debouncedUpdateRef.current = setTimeout(() => {
      onDraftChange(prepareDraftNote());
    }, 100); // Reduced to 100ms for more responsiveness

    // Cleanup function
    return () => {
      if (debouncedUpdateRef.current) {
        clearTimeout(debouncedUpdateRef.current);
      }
    };
  }, [title, content, tags, onDraftChange, prepareDraftNote]);

  const handleSaveNote = async () => {
    if (!session?.accessToken) {
      toast.error("You must be logged in to create notes");
      return;
    }

    if (!title.trim()) {
      toast.error("Please enter a title for your note");
      return;
    }

    try {
      setIsSaving(true);
      // Create the note first
      const newNote = await createNote(
        {
          title: title.trim(),
          content: content.trim(),
          is_archived: false,
        },
        session.accessToken
      );

      // If tags were added, process them
      if (tags.trim()) {
        await createAndProcessTags(newNote.id, tags, session.accessToken);
      }

      toast.success("Note created successfully");
      onClose();
    } catch (error) {
      console.error("Failed to save note:", error);
      toast.error("Failed to save note. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full h-full px-6 py-5 flex flex-col gap-4">
      <input
        type="text"
        placeholder="Enter a title..."
        className="text-2xl font-bold placeholder:text-foreground focus:outline-none"
        value={title}
        onChange={handleTitleChange}
      />
      <div className="w-full flex flex-col gap-2">
        <div className="w-full flex items-center gap-2">
          <div className="flex items-center gap-2 w-full max-w-[107px]">
            <TagIcon className="w-4 h-4 text-muted-foreground" />
            <div className="text-sm text-muted-foreground">Tags</div>
          </div>
          <input
            type="text"
            placeholder="Add tags separated by commas (e.g. Work, Planning)"
            className="text-sm w-full px-2 py-0.5 focus:outline-border rounded-md"
            value={tags}
            onChange={handleTagsChange}
          />
        </div>
        <div className="w-full flex items-center gap-2">
          <div className="flex items-center gap-2 w-full max-w-[115px]">
            <ClockIcon className="w-4 h-4 text-muted-foreground" />
            <div className="text-sm text-muted-foreground">Last Edited</div>
          </div>
          <div className="text-sm text-muted-foreground">Not yet saved</div>
        </div>
      </div>
      <div className="w-full h-[1px] bg-border" />
      <textarea
        placeholder="Start typing your note here..."
        className="w-full h-full focus:outline-none text-sm placeholder:text-foreground/70"
        value={content}
        onChange={handleContentChange}
      />
      <div className="w-full pt-4 border-t border-border flex items-center gap-2">
        <Button onClick={handleSaveNote} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Note"}
        </Button>
        <Button
          variant="secondary"
          onClick={onClose}
          className="text-muted-foreground"
          disabled={isSaving}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default CreateNewNote;
