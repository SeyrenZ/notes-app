import { Badge } from "@/components/ui/badge";
import { Note } from "@/types/note";
import { formatDistanceToNow } from "date-fns";
import React, { useMemo } from "react";
import { useNotesStore } from "@/store/notes-store";
import { cn } from "@/lib/utils";
import { Edit2Icon } from "lucide-react";

interface NoteCardProps {
  note: Note;
  onClick?: () => void;
}

const NoteCard: React.FC<NoteCardProps> = ({ note, onClick }) => {
  const { selectedNote, isEditing, editedNoteContent } = useNotesStore();
  const isSelected = selectedNote?.id === note.id;
  const isBeingEdited = isSelected && isEditing;

  // Use edited content if this note is being edited
  const displayTitle =
    isBeingEdited && editedNoteContent?.title
      ? editedNoteContent.title
      : note.title || "Untitled Note";

  const displayContent =
    isBeingEdited && editedNoteContent?.content !== undefined
      ? editedNoteContent.content
      : note.content || "No content";

  // Process tags for display
  const displayTags = useMemo(() => {
    if (isBeingEdited && editedNoteContent?.tags !== undefined) {
      // For edited notes, parse the comma-separated tags string
      return editedNoteContent.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0)
        .map((tagName, index) => ({
          id: `temp-${index}`,
          name: tagName,
          displayKey: `editing-tag-${index}`,
        }));
    } else if (note.tags && note.tags.length > 0) {
      // For existing notes, use the tags array
      return note.tags.map((tag) => ({
        ...tag,
        displayKey: `tag-${tag.id}`,
      }));
    }
    return [];
  }, [note.tags, isBeingEdited, editedNoteContent?.tags]);

  const formattedDate = formatDistanceToNow(new Date(note.updated_at), {
    addSuffix: true,
  });

  return (
    <div
      className={cn(
        "flex flex-col gap-2 pb-2 hover:cursor-pointer pt-4 hover:bg-accent/50 transition-all duration-200 px-2 mt-1 max-w-[270px]",
        isBeingEdited
          ? "bg-primary/5 border border-primary/20 rounded-md"
          : isSelected
          ? "bg-accent rounded-md"
          : "border-b border-border rounded-t-md"
      )}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="text-[16px] leading-[120%] font-bold">
          {displayTitle}
        </div>
        {isBeingEdited && <Edit2Icon className="h-4 w-4 text-primary/70" />}
      </div>
      <div className="text-xs text-muted-foreground line-clamp-3">
        {displayContent}
      </div>

      {displayTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {displayTags.map((tag) => (
            <Badge key={tag.displayKey} variant="neutral">
              {tag.name}
            </Badge>
          ))}
        </div>
      )}

      <div className="text-xs text-muted-foreground">
        {isBeingEdited ? "Currently Editing" : formattedDate}
      </div>
    </div>
  );
};

export default NoteCard;
