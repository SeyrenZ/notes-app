import React, { useState, useEffect } from "react";
import { Note } from "@/types/note";
import { Badge } from "@/components/ui/badge";
import {
  TagIcon,
  ClockIcon,
  Edit2Icon,
  TrashIcon,
  SaveIcon,
  XIcon,
  ArchiveIcon,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { useNotesStore } from "@/store/notes-store";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

interface NoteViewProps {
  note: Note;
}

const NoteView: React.FC<NoteViewProps> = ({ note }) => {
  const { data: session } = useSession();
  const {
    deleteNote,
    selectNote,
    updateNote,
    createAndProcessTags,
    isEditing,
    setIsEditing,
    updateEditedContent,
    clearEditedContent,
    editedNoteContent,
  } = useNotesStore();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editedTitle, setEditedTitle] = useState(note.title);
  const [editedContent, setEditedContent] = useState(note.content);
  const [editedTags, setEditedTags] = useState(
    note.tags ? note.tags.map((tag) => tag.name).join(", ") : ""
  );

  // Update local state when the note changes
  useEffect(() => {
    setEditedTitle(note.title);
    setEditedContent(note.content);
    setEditedTags(note.tags ? note.tags.map((tag) => tag.name).join(", ") : "");
  }, [note]);

  // When editing mode is turned off, clear the edited content
  useEffect(() => {
    if (!isEditing) {
      clearEditedContent();
    }
  }, [isEditing, clearEditedContent]);

  const formattedDate = formatDistanceToNow(new Date(note.updated_at), {
    addSuffix: true,
  });

  const handleDelete = async () => {
    if (!session?.accessToken) {
      toast.error("You must be logged in to delete notes");
      return;
    }

    try {
      setIsDeleting(true);
      await deleteNote(note.id, session.accessToken);
      selectNote(null);
      toast.success("Note deleted successfully");
    } catch (error) {
      console.error("Failed to delete note:", error);
      toast.error("Failed to delete note. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    // Initialize edited content in the store
    updateEditedContent({
      title: editedTitle,
      content: editedContent,
      tags: editedTags,
    });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    clearEditedContent();
    // Reset to original values
    setEditedTitle(note.title);
    setEditedContent(note.content);
    setEditedTags(note.tags ? note.tags.map((tag) => tag.name).join(", ") : "");
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setEditedTitle(newTitle);
    updateEditedContent({
      title: newTitle,
      content: editedContent,
      tags: editedTags,
    });
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setEditedContent(newContent);
    updateEditedContent({
      title: editedTitle,
      content: newContent,
      tags: editedTags,
    });
  };

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTags = e.target.value;
    setEditedTags(newTags);
    updateEditedContent({
      title: editedTitle,
      content: editedContent,
      tags: newTags,
    });
  };

  const handleSaveEdit = async () => {
    if (!session?.accessToken) {
      toast.error("You must be logged in to update notes");
      return;
    }

    if (!editedTitle.trim()) {
      toast.error("Please enter a title for your note");
      return;
    }

    try {
      setIsSaving(true);

      // Update note content
      const updatedNote = await updateNote(
        note.id,
        {
          title: editedTitle.trim(),
          content: editedContent.trim(),
        },
        session.accessToken
      );

      // Process tags if they've changed
      const currentTagsString = note.tags
        ? note.tags.map((tag) => tag.name).join(", ")
        : "";
      if (editedTags !== currentTagsString) {
        await createAndProcessTags(note.id, editedTags, session.accessToken);
      }

      toast.success("Note updated successfully");
      setIsEditing(false);
      clearEditedContent();
    } catch (error) {
      console.error("Failed to update note:", error);
      toast.error("Failed to update note. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isEditing) {
    return (
      <div className="w-full h-full px-6 py-5 flex flex-col gap-4">
        <input
          type="text"
          value={editedTitle}
          onChange={handleTitleChange}
          className="text-2xl font-bold focus:outline-none w-full"
          placeholder="Enter a title..."
        />

        <div className="w-full flex flex-col gap-2">
          <div className="w-full flex items-center gap-2">
            <div className="flex items-center gap-2 w-full max-w-[107px]">
              <TagIcon className="w-4 h-4 text-muted-foreground" />
              <div className="text-sm text-muted-foreground">Tags</div>
            </div>
            <input
              type="text"
              value={editedTags}
              onChange={handleTagsChange}
              placeholder="Add tags separated by commas (e.g. Work, Planning)"
              className="text-sm w-full px-2 py-0.5 focus:outline-border rounded-md"
            />
          </div>
          <div className="w-full flex items-center gap-2">
            <div className="flex items-center gap-2 w-full max-w-[115px]">
              <ClockIcon className="w-4 h-4 text-muted-foreground" />
              <div className="text-sm text-muted-foreground">Last Edited</div>
            </div>
            <div className="text-sm text-muted-foreground">{formattedDate}</div>
          </div>
        </div>

        <div className="w-full h-[1px] bg-border mt-1 mb-2" />

        <textarea
          value={editedContent}
          onChange={handleContentChange}
          placeholder="Start typing your note here..."
          className="w-full h-full focus:outline-none resize-none text-sm"
        />

        <div className="w-full pt-4 border-t border-border flex items-center gap-2">
          <Button onClick={handleSaveEdit} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Note"}
          </Button>
          <Button
            variant="secondary"
            onClick={handleCancelEdit}
            className="text-muted-foreground"
            disabled={isSaving}
          >
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full px-6 py-5 flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{note.title || "Untitled Note"}</h1>
      </div>

      <div className="w-full flex flex-col gap-2">
        <div className="w-full flex items-center gap-2">
          <div className="flex items-center gap-2 w-full max-w-[107px]">
            <TagIcon className="w-4 h-4 text-muted-foreground" />
            <div className="text-sm text-muted-foreground">Tags</div>
          </div>
          <div className="flex flex-wrap gap-2">
            {note.tags && note.tags.length > 0 ? (
              note.tags.map((tag) => (
                <Badge key={tag.id} variant="neutral">
                  {tag.name}
                </Badge>
              ))
            ) : (
              <span className="text-sm text-muted-foreground">No tags</span>
            )}
          </div>
        </div>
        {note.is_archived && (
          <div className="w-full flex items-center gap-2">
            <div className="flex items-center gap-2 w-full max-w-[115px]">
              <ArchiveIcon className="w-4 h-4 text-muted-foreground" />
              <div className="text-sm text-muted-foreground">Status</div>
            </div>
            <div className="text-sm text-muted-foreground">Archived</div>
          </div>
        )}
        <div className="w-full flex items-center gap-2">
          <div className="flex items-center gap-2 w-full max-w-[115px]">
            <ClockIcon className="w-4 h-4 text-muted-foreground" />
            <div className="text-sm text-muted-foreground">Last Edited</div>
          </div>
          <div className="text-sm text-muted-foreground">{formattedDate}</div>
        </div>
      </div>

      <div className="w-full h-[1px] bg-border mt-1 mb-2" />

      <div className="w-full h-full overflow-auto whitespace-pre-wrap">
        {note.content || (
          <span className="text-muted-foreground italic">No content</span>
        )}
      </div>
    </div>
  );
};

export default NoteView;
