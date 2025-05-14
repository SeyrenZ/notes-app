import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { useSession } from "next-auth/react";
import { FontTheme } from "@/services/user-service";

interface FontContextType {
  font: FontTheme;
  setFont: (font: FontTheme) => void;
}

const FontContext = createContext<FontContextType | undefined>(undefined);

export function useFont() {
  const context = useContext(FontContext);
  if (context === undefined) {
    throw new Error("useFont must be used within a FontProvider");
  }
  return context;
}

export function FontProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [isInitialized, setIsInitialized] = useState(false);

  // Try to get the font from localStorage, default to 'sans-serif'
  const [font, setFontState] = useState<FontTheme>(() => {
    if (typeof window !== "undefined") {
      const savedFont = localStorage.getItem("font") as FontTheme;
      return savedFont || "sans-serif";
    }
    return "sans-serif";
  });

  // Apply font to document
  const applyFont = useCallback((newFont: FontTheme) => {
    if (typeof window === "undefined") return;

    const body = window.document.body;

    // Remove previous font classes
    body.classList.remove("font-sans", "font-serif", "font-mono");

    // Reset any inline styles previously set
    body.style.fontFamily = "";

    // Apply selected font
    switch (newFont) {
      case "sans-serif":
        body.classList.add("font-sans");
        break;
      case "serif":
        body.classList.add("font-serif");
        break;
      case "monospace":
        body.classList.add("font-mono");
        // Directly set the monospace font-family as a fallback
        body.style.fontFamily =
          "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace";
        console.log(
          "Applied monospace font:",
          newFont,
          body.classList.contains("font-mono")
        );
        break;
    }

    // Save to localStorage
    localStorage.setItem("font", newFont);
  }, []);

  // Combined setFont function that updates state and applies the font
  const setFont = useCallback(
    (newFont: FontTheme) => {
      setFontState(newFont);
      applyFont(newFont);
    },
    [applyFont]
  );

  // Initialize font on first render - handles server/client hydration
  useEffect(() => {
    // Only run this once to avoid flickering
    if (!isInitialized) {
      applyFont(font);
      setIsInitialized(true);
    }
  }, [applyFont, font, isInitialized]);

  // Fetch user's font preference from the API when session is available
  useEffect(() => {
    const fetchUserFont = async () => {
      if (!session?.accessToken) return;

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/v1/users/me`,
          {
            headers: {
              Authorization: `Bearer ${session.accessToken}`,
            },
          }
        );

        if (response.ok) {
          const userData = await response.json();
          if (userData.preferred_font && userData.preferred_font !== font) {
            setFont(userData.preferred_font as FontTheme);
          }
        }
      } catch (error) {
        console.error("Failed to fetch user font preference:", error);
      }
    };

    if (isInitialized) {
      fetchUserFont();
    }
  }, [session, font, setFont, isInitialized]);

  const value = {
    font,
    setFont,
  };

  return <FontContext.Provider value={value}>{children}</FontContext.Provider>;
}
