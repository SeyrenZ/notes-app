"use client";

import { SessionProvider, signOut } from "next-auth/react";
import { Toaster } from "sonner";
import { useEffect } from "react";

// This component will be automatically mounted for all pages
export function TokenExpirationManager() {
  useEffect(() => {
    // Set up a timer to check token every minute
    const intervalId = setInterval(() => {
      // Check if we're in a browser environment
      if (typeof window !== "undefined") {
        // Get the session data from localStorage
        const session = JSON.parse(
          localStorage.getItem("next-auth.session-token") || "{}"
        );

        // If there's no session data, we're not logged in
        if (!session) return;

        // Check if token is expired (this is a basic check, adjust based on your token structure)
        const now = Math.floor(Date.now() / 1000);
        if (session.exp && session.exp < now) {
          // Token is expired, sign out
          signOut({ callbackUrl: "/login" });
        }
      }
    }, 60000); // Check every minute

    return () => clearInterval(intervalId);
  }, []);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <TokenExpirationManager />
      <Toaster position="top-right" />
      {children}
    </SessionProvider>
  );
}
