import { Badge } from "@/components/ui/badge";
import { Note } from "@/types/note";
import { formatDistanceToNow } from "date-fns";
import React from "react";
import { useNotesStore } from "@/store/notes-store";
import { cn } from "@/lib/utils";

interface NoteCardProps {
  note: Note;
  onClick?: () => void;
}

const NoteCard: React.FC<NoteCardProps> = ({ note, onClick }) => {
  const { selectedNote } = useNotesStore();
  const isSelected = selectedNote?.id === note.id;

  const formattedDate = formatDistanceToNow(new Date(note.updated_at), {
    addSuffix: true,
  });

  return (
    <div
      className={cn(
        "flex flex-col gap-2 pb-2 hover:cursor-pointer pt-4 hover:bg-accent/50 transition-all duration-200 px-2 mt-1 max-w-[270px]",
        isSelected
          ? "bg-accent rounded-md"
          : "border-b border-border rounded-t-md"
      )}
      onClick={onClick}
    >
      <div className="text-[16px] leading-[120%] font-bold">
        {note.title || "Untitled Note"}
      </div>
      <div className="text-xs text-muted-foreground line-clamp-3 whitespace-pre-wrap">
        {note.content || "No content"}
      </div>
      {note.tags && note.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {note.tags.map((tag) => (
            <Badge key={tag.id} variant="neutral">
              {tag.name}
            </Badge>
          ))}
        </div>
      )}
      <div className="text-xs text-muted-foreground">{formattedDate}</div>
    </div>
  );
};

export default NoteCard;
