import React from "react";
import { FontTheme } from "@/services/user-service";
import { cn } from "@/lib/utils";

export interface FontOptionItem {
  id: FontTheme;
  title: string;
  description: string;
  sample: string;
}

interface FontSelectorProps {
  options: FontOptionItem[];
  selectedFont: FontTheme;
  onChange: (font: FontTheme) => void;
  className?: string;
}

const FontSelector: React.FC<FontSelectorProps> = ({
  options,
  selectedFont,
  onChange,
  className = "",
}) => {
  return (
    <div className={cn("space-y-3", className)}>
      {options.map((option) => (
        <div
          key={option.id}
          className={`flex items-center p-4 rounded-lg border ${
            selectedFont === option.id ? "bg-accent" : "border-border"
          } cursor-pointer`}
          onClick={() => onChange(option.id)}
        >
          <div
            className={`bg-background border border-border rounded-md p-3 flex items-center justify-center min-w-[100px] text-center ${
              option.id === "sans-serif"
                ? "font-sans"
                : option.id === "serif"
                ? "font-serif"
                : "font-mono"
            }`}
          >
            {option.sample}
          </div>
          <div className="ml-4 flex-1">
            <div
              className={`font-medium ${
                option.id === "sans-serif"
                  ? "font-sans"
                  : option.id === "serif"
                  ? "font-serif"
                  : "font-mono"
              }`}
            >
              {option.title}
            </div>
            <div
              className={`text-sm text-muted-foreground ${
                option.id === "sans-serif"
                  ? "font-sans"
                  : option.id === "serif"
                  ? "font-serif"
                  : "font-mono"
              }`}
            >
              {option.description}
            </div>
          </div>
          <div
            className={`w-5 h-5 rounded-full border ${
              selectedFont === option.id
                ? "border-primary bg-primary"
                : "border-muted-foreground"
            } flex items-center justify-center`}
          >
            {selectedFont === option.id && (
              <div className="w-2 h-2 rounded-full bg-white"></div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default FontSelector;
