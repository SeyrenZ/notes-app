import React, { useState, useEffect, useRef } from "react";
import { Input } from "../ui/input";
import { SearchIcon, SettingsIcon, XCircleIcon } from "lucide-react";
import { Button } from "../ui/button";
import { useNotesStore } from "@/store/notes-store";

interface NavbarProps {
  onToggleSettings: (show: boolean) => void;
  showSettings: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ onToggleSettings, showSettings }) => {
  const { showArchived, searchQuery, setSearchQuery } = useNotesStore();
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sync local state with store only on initial render and when explicitly cleared
  useEffect(() => {
    if (!searchQuery) {
      setLocalSearchQuery("");
    }
  }, [searchQuery]);

  // Handle input change with debounce
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setLocalSearchQuery(query);

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      setSearchQuery(query);
    }, 300);
  };

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Clear search
  const handleClearSearch = () => {
    setLocalSearchQuery("");
    setSearchQuery("");
  };

  // Toggle settings
  const handleSettingsClick = () => {
    onToggleSettings(!showSettings);
  };

  return (
    <div className="w-full h-[81px] bg-background px-8 flex items-center justify-between border-b border-border">
      <div className="text-2xl font-bold">
        {showSettings
          ? "Settings"
          : showArchived
          ? "Archived Notes"
          : "All Notes"}
        {!showSettings && searchQuery && (
          <div className="text-sm font-normal mt-1 text-muted-foreground">
            Search results: {searchQuery}
          </div>
        )}
      </div>
      <div className="flex items-center gap-4">
        {!showSettings && (
          <div className="relative">
            <SearchIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by title, content, or tags..."
              className="w-[300px] h-[44px] rounded-md pl-10 pr-10"
              value={localSearchQuery}
              onChange={handleSearchChange}
            />
            {localSearchQuery && (
              <button
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <XCircleIcon className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
        <Button
          variant={showSettings ? "default" : "ghost"}
          size="icon"
          className={
            showSettings
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : "text-muted-foreground hover:text-primary"
          }
          onClick={handleSettingsClick}
          aria-label="Settings"
        >
          <SettingsIcon className="min-w-5 min-h-5" />
        </Button>
      </div>
    </div>
  );
};

export default Navbar;
