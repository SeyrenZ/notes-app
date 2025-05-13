import { Badge } from "@/components/ui/badge";
import { Note } from "@/types/note";
import React from "react";
import { cn } from "@/lib/utils";
import { PenSquare } from "lucide-react";

interface DraftNoteCardProps {
  note: Partial<Note>;
  onClick?: () => void;
}

const DraftNoteCard: React.FC<DraftNoteCardProps> = ({ note, onClick }) => {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 pb-2 pt-4 px-2 mt-1 max-w-[270px] bg-primary/5 border border-primary/20 rounded-md transition-all duration-200"
      )}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="text-[16px] leading-[120%] font-bold">
          {note.title || "Untitled Note"}
        </div>
        <PenSquare className="h-4 w-4 text-primary/70" />
      </div>
      <div className="text-xs text-muted-foreground line-clamp-3">
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
      <div className="text-xs text-primary/70">Currently Editing</div>
    </div>
  );
};

export default DraftNoteCard;
