import React from "react";
import { useNotesStore } from "@/store/notes-store";
import { Tag } from "@/types/note";
import { TagIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface TagItemProps {
  tag: Tag;
  isSelected: boolean;
  onClick: (tag: Tag) => void;
}

const TagItem: React.FC<TagItemProps> = ({ tag, isSelected, onClick }) => {
  return (
    <button
      className={cn(
        "flex items-center w-full rounded-md px-3 py-2 text-sm gap-2 transition-colors",
        isSelected
          ? "bg-accent text-foreground font-medium"
          : "text-muted-foreground hover:bg-accent/50"
      )}
      onClick={() => onClick(tag)}
    >
      <TagIcon className={cn("h-4 w-4", isSelected && "text-primary")} />
      <span className="truncate">{tag.name}</span>
    </button>
  );
};

const TagsList = () => {
  const { allTags, selectedTag, selectTag, showArchived } = useNotesStore();

  const handleTagClick = (tag: Tag) => {
    if (selectedTag?.id === tag.id) {
      // If clicking the currently selected tag, deselect it
      selectTag(null);
    } else {
      // Otherwise, select the clicked tag
      selectTag(tag);
    }
  };

  if (allTags.length === 0) {
    return (
      <div className="flex flex-col gap-1">
        <div className="text-sm font-medium text-muted-foreground px-3 mb-1">
          Tags
        </div>
        <div className="px-3 py-2 text-sm text-muted-foreground">
          {showArchived
            ? "No tags found in archived notes."
            : "No tags found in your notes."}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="text-sm font-medium text-muted-foreground px-3 mb-1">
        {showArchived ? "Tags in Archived Notes" : "Tags"}
        <span className="ml-1 text-xs">({allTags.length})</span>
      </div>
      {allTags.map((tag) => (
        <TagItem
          key={tag.id}
          tag={tag}
          isSelected={selectedTag?.id === tag.id}
          onClick={handleTagClick}
        />
      ))}
    </div>
  );
};

export default TagsList;
