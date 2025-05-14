import React, { useState, useEffect } from "react";
import { SunIcon, MoonIcon, ComputerIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import ThemeSelector, {
  ThemeOption,
  ThemeOptionItem,
} from "@/components/ui/theme-selector";
import { useTheme } from "@/lib/theme-provider";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { updateUserPreferences } from "@/services/user-service";

const ColorThemeSetting = () => {
  const { theme, setTheme } = useTheme();
  const { data: session } = useSession();
  const [selectedTheme, setSelectedTheme] = useState<ThemeOption>(
    theme as ThemeOption
  );
  const [isLoading, setIsLoading] = useState(false);

  // Update local state when the theme context changes
  useEffect(() => {
    setSelectedTheme(theme as ThemeOption);
  }, [theme]);

  // Define theme options with their icons and descriptions
  const themeOptions: ThemeOptionItem[] = [
    {
      id: "light",
      icon: <SunIcon className="w-5 h-5" />,
      title: "Light Mode",
      description: "Pick a clean and classic light theme",
    },
    {
      id: "dark",
      icon: <MoonIcon className="w-5 h-5" />,
      title: "Dark Mode",
      description: "Select a sleek and modern dark theme",
    },
    {
      id: "system",
      icon: <ComputerIcon className="w-5 h-5" />,
      title: "System",
      description: "Adapts to your device's theme",
    },
  ];

  const handleThemeChange = (theme: ThemeOption) => {
    setSelectedTheme(theme);
  };

  const handleApplyChanges = async () => {
    if (!session?.accessToken) {
      toast.error("You must be logged in to update preferences");
      return;
    }

    try {
      setIsLoading(true);

      // First update the local theme for instant feedback
      setTheme(selectedTheme);

      // Then update the theme in the database
      await updateUserPreferences(
        { preferred_theme: selectedTheme },
        session.accessToken
      );

      toast.success(`Theme changed to ${selectedTheme} mode`);
    } catch (error) {
      console.error("Failed to update theme preference:", error);
      toast.error("Failed to update theme preference. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[625px] flex flex-col p-6">
      <div className="space-y-2 mb-6">
        <div className="text-[16px] leading-[120%] font-bold">Color Theme</div>
        <div className="text-sm text-muted-foreground">
          Choose your color theme:
        </div>
      </div>

      <ThemeSelector
        options={themeOptions}
        selectedTheme={selectedTheme}
        onChange={handleThemeChange}
      />

      <div className="pt-6 flex justify-end">
        <Button
          onClick={handleApplyChanges}
          disabled={selectedTheme === theme || isLoading}
          className="min-w-[120px]"
        >
          {isLoading ? "Saving..." : "Apply Changes"}
        </Button>
      </div>
    </div>
  );
};

export default ColorThemeSetting;
