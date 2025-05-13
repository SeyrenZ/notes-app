import React from "react";
import Logo from "../icon/logo";
import { Button } from "../ui/button";
import { ArchiveIcon, ChevronRight, HomeIcon, TagIcon } from "lucide-react";
import { Separator } from "../ui/separator";
import { useNotesStore } from "@/store/notes-store";
import { cn } from "@/lib/utils";

interface MenuButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  isActive?: boolean;
}

const MenuButton: React.FC<MenuButtonProps> = ({
  icon,
  label,
  onClick,
  isActive = false,
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
        {label}
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
  const { showArchived, setShowArchived, fetchNotes } = useNotesStore();

  const handleToggleView = (archived: boolean) => {
    if (showArchived !== archived) {
      setShowArchived(archived);
      // Note: fetchNotes needs to be called by the component with access to the token
    }
  };

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
            isActive={!showArchived}
          />
          <MenuButton
            icon={<ArchiveIcon className="w-4 h-4 group-hover:text-primary" />}
            label="Archived Notes"
            onClick={() => handleToggleView(true)}
            isActive={showArchived}
          />
        </div>
        <div className="w-full h-[1px] bg-border my-1" />
        {/* Tags */}
        <div className="flex flex-col gap-2">
          {/* <div className="text-sm font-medium text-muted-foreground px-3">
            Tags
          </div>
          <MenuButton
            icon={<TagIcon className="w-4 h-4 group-hover:text-primary" />}
            label="Tag 1"
            onClick={() => {}}
          /> */}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
