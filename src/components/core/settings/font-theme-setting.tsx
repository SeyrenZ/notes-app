import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { updateUserPreferences, FontTheme } from "@/services/user-service";
import { useFont } from "@/lib/font-provider";
import FontSelector, { FontOptionItem } from "@/components/ui/font-selector";

const FontThemeSetting = () => {
  const { font, setFont } = useFont();
  const { data: session } = useSession();
  const [selectedFont, setSelectedFont] = useState<FontTheme>(font);
  const [isLoading, setIsLoading] = useState(false);

  // Update local state when the font context changes
  useEffect(() => {
    setSelectedFont(font);
  }, [font]);

  // Define font options with their samples and descriptions
  const fontOptions: FontOptionItem[] = [
    {
      id: "sans-serif",
      title: "Sans Serif",
      sample: "Aa Bb Cc",
      description: "Clean, modern font for easy readability",
    },
    {
      id: "serif",
      title: "Serif",
      sample: "Aa Bb Cc",
      description: "Traditional font with elegant letter design",
    },
    {
      id: "monospace",
      title: "Monospace",
      sample: "Aa Bb Cc",
      description: "Fixed-width font ideal for code",
    },
  ];

  const handleFontChange = (font: FontTheme) => {
    setSelectedFont(font);
  };

  const handleApplyChanges = async () => {
    if (!session?.accessToken) {
      toast.error("You must be logged in to update preferences");
      return;
    }

    try {
      setIsLoading(true);

      // First update the local font for instant feedback
      setFont(selectedFont);

      // Then update the font in the database
      await updateUserPreferences(
        { preferred_font: selectedFont },
        session.accessToken
      );

      toast.success(`Font changed to ${selectedFont}`);
    } catch (error) {
      console.error("Failed to update font preference:", error);
      toast.error("Failed to update font preference. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[625px] flex flex-col p-6">
      <div className="space-y-2 mb-6">
        <div className="text-[16px] leading-[120%] font-bold">Font</div>
        <div className="text-sm text-muted-foreground">
          Choose your preferred font family:
        </div>
      </div>

      <FontSelector
        options={fontOptions}
        selectedFont={selectedFont}
        onChange={handleFontChange}
        className={
          font === "sans-serif"
            ? "font-sans"
            : font === "serif"
            ? "font-serif"
            : "font-mono"
        }
      />

      <div className="pt-6 flex justify-end">
        <Button
          onClick={handleApplyChanges}
          disabled={selectedFont === font || isLoading}
          className="min-w-[120px]"
        >
          {isLoading ? "Saving..." : "Apply Changes"}
        </Button>
      </div>
    </div>
  );
};

export default FontThemeSetting;
