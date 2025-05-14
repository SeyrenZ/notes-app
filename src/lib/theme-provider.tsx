import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { useSession } from "next-auth/react";

type Theme = "light" | "dark" | "system";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [isInitialized, setIsInitialized] = useState(false);

  // Try to get the theme from localStorage, default to 'system'
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme") as Theme;
      return savedTheme || "system";
    }
    return "system";
  });

  // Apply theme to document
  const applyTheme = useCallback((newTheme: Theme) => {
    if (typeof window === "undefined") return;

    const root = window.document.documentElement;

    // Remove previous theme classes
    root.classList.remove("light", "dark");

    if (newTheme === "system") {
      // Check system preference
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";
      root.classList.add(systemTheme);
    } else {
      // Apply selected theme
      root.classList.add(newTheme);
    }

    // Save to localStorage
    localStorage.setItem("theme", newTheme);
  }, []);

  // Combined setTheme function that updates state and applies the theme
  const setTheme = useCallback(
    (newTheme: Theme) => {
      setThemeState(newTheme);
      applyTheme(newTheme);
    },
    [applyTheme]
  );

  // Initialize theme on first render - handles server/client hydration
  useEffect(() => {
    // Only run this once to avoid flickering
    if (!isInitialized) {
      applyTheme(theme);
      setIsInitialized(true);
    }
  }, [applyTheme, theme, isInitialized]);

  // Fetch user's theme preference from the API when session is available
  useEffect(() => {
    const fetchUserTheme = async () => {
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
          if (userData.preferred_theme && userData.preferred_theme !== theme) {
            setTheme(userData.preferred_theme as Theme);
          }
        }
      } catch (error) {
        console.error("Failed to fetch user theme preference:", error);
      }
    };

    if (isInitialized) {
      fetchUserTheme();
    }
  }, [session, theme, setTheme, isInitialized]);

  // Listen for system preference changes if 'system' is selected
  useEffect(() => {
    if (theme !== "system" || typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = () => {
      const root = window.document.documentElement;
      root.classList.remove("light", "dark");
      root.classList.add(mediaQuery.matches ? "dark" : "light");
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  const value = {
    theme,
    setTheme,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}
