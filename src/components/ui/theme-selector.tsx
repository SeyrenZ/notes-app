import React from "react";
import { LucideIcon } from "lucide-react";

export type ThemeOption = "light" | "dark" | "system";

export interface ThemeOptionItem {
  id: ThemeOption;
  icon: LucideIcon;
  title: string;
  description: string;
}

interface ThemeSelectorProps {
  options: ThemeOptionItem[];
  selectedTheme: ThemeOption;
  onChange: (theme: ThemeOption) => void;
  className?: string;
}

const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  options,
  selectedTheme,
  onChange,
  className = "",
}) => {
  return (
    <div className={`space-y-3 ${className}`}>
      {options.map((option) => (
        <div
          key={option.id}
          className={`flex items-center p-4 rounded-lg border ${
            selectedTheme === option.id ? "bg-accent" : "border-border"
          } cursor-pointer`}
          onClick={() => onChange(option.id)}
        >
          <div className="bg-background border border-border rounded-md p-2 flex items-center justify-center">
            <option.icon className="w-5 h-5" />
          </div>
          <div className="ml-4 flex-1">
            <div className="font-medium">{option.title}</div>
            <div className="text-sm text-muted-foreground">
              {option.description}
            </div>
          </div>
          <div
            className={`w-5 h-5 rounded-full border ${
              selectedTheme === option.id
                ? "border-primary bg-primary"
                : "border-muted-foreground"
            } flex items-center justify-center`}
          >
            {selectedTheme === option.id && (
              <div className="w-2 h-2 rounded-full bg-white"></div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ThemeSelector;
