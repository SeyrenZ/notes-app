import React from "react";
import Logo from "../icon/logo";
import { Button } from "../ui/button";
import { ArchiveIcon, ChevronRight, HomeIcon, TagIcon } from "lucide-react";
import { Separator } from "../ui/separator";
import { useNotesStore } from "@/store/notes-store";
import { cn } from "@/lib/utils";
import TagsList from "./note/tags-list";

interface MenuButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  isActive?: boolean;
  count?: number;
}

const MenuButton: React.FC<MenuButtonProps> = ({
  icon,
  label,
  onClick,
  isActive = false,
  count,
}) => {
  return (
    <Button
      variant="ghost"
      className={cn(
        "w-full justify-between group",
        isActive
          ? "bg-accent text-foreground font-medium"
          : "text-muted-foreground"
      )}
      onClick={onClick}
    >
      <div className="flex items-center gap-2">
        <div className={cn(isActive && "text-primary")}>{icon}</div>
        <div className="flex-1">{label}</div>
        {count !== undefined && (
          <span className="text-xs py-0.5 rounded-full min-w-[20px] flex items-center justify-center">
            ( {count} )
          </span>
        )}
      </div>
      <ChevronRight
        className={cn(
          "w-4 h-4 group-hover:visible invisible",
          isActive && "visible"
        )}
      />
    </Button>
  );
};

const Sidebar = () => {
  const { showArchived, setShowArchived, selectedTag, allNotes } =
    useNotesStore();

  const handleToggleView = (archived: boolean) => {
    if (showArchived !== archived) {
      setShowArchived(archived);
    }
  };

  // Count regular and archived notes
  const activeNotesCount = allNotes.filter((note) => !note.is_archived).length;
  const archivedNotesCount = allNotes.filter((note) => note.is_archived).length;

  return (
    <div className="w-[clamp(240px,20%,272px)] bg-background min-h-[100dvh] border-r border-border px-3 py-4">
      <div className="flex flex-col gap-2">
        {/* Logo */}
        <div className="py-3">
          <Logo className="w-[95px] h-[28px]" />
        </div>
        {/* Menu */}
        <div className="flex flex-col gap-2">
          <MenuButton
            icon={<HomeIcon className="w-4 h-4 group-hover:text-primary" />}
            label="All Notes"
            onClick={() => handleToggleView(false)}
            isActive={!showArchived && !selectedTag}
            count={activeNotesCount}
          />
          <MenuButton
            icon={<ArchiveIcon className="w-4 h-4 group-hover:text-primary" />}
            label="Archived Notes"
            onClick={() => handleToggleView(true)}
            isActive={showArchived && !selectedTag}
            count={archivedNotesCount}
          />
        </div>
        <div className="w-full h-[1px] bg-border my-1" />
        {/* Tags */}
        <TagsList />
      </div>
    </div>
  );
};

export default Sidebar;
