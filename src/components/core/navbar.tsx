import React from "react";
import { Input } from "../ui/input";
import { SearchIcon, SettingsIcon } from "lucide-react";
import { Button } from "../ui/button";
const Navbar = () => {
  return (
    <div className="w-full h-[81px] bg-background px-8 flex items-center justify-between border-b border-border">
      <div className="text-2xl font-bold">All Notes</div>
      <div className="flex items-center gap-4">
        <div className="relative">
          <SearchIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by title, content, or tags..."
            className="w-[300px] h-[44px] rounded-md pl-10"
          />
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-primary"
        >
          <SettingsIcon className="min-w-5 min-h-5" />
        </Button>
      </div>
    </div>
  );
};

export default Navbar;
