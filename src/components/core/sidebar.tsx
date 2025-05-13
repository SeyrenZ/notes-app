import React from "react";
import Logo from "../icon/logo";
import { Button } from "../ui/button";
import { ArchiveIcon, ChevronRight, HomeIcon, TagIcon } from "lucide-react";
import { Separator } from "../ui/separator";

const MenuButton = ({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) => {
  return (
    <Button
      variant="ghost"
      className="w-full justify-between text-muted-foreground group"
    >
      <div className="flex items-center gap-2">
        {icon}
        {label}
      </div>
      <ChevronRight className="w-4 h-4 group-hover:visible invisible" />
    </Button>
  );
};

const Sidebar = () => {
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
            onClick={() => {}}
          />
          <MenuButton
            icon={<ArchiveIcon className="w-4 h-4 group-hover:text-primary" />}
            label="Archived Notes"
            onClick={() => {}}
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
