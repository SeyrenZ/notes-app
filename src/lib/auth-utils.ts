import { signOut } from "next-auth/react";
import { toast } from "sonner";

/**
 * Handles authentication errors by signing out the user and redirecting to login
 */
export function handleAuthError(): void {
  // Show notification to user
  toast.error("Your session has expired. Please log in again.", {
    duration: 5000,
    position: "top-center",
  });

  // Sign out and redirect to login
  signOut({ callbackUrl: "/login" }).catch((error) => {
    console.error("Error signing out:", error);
    // Fallback: force redirect after a delay
    setTimeout(() => {
      window.location.href = "/login";
    }, 1000);
  });
}

/**
 * Add an authorization header to a fetch request
 */
export function addAuthHeader(token: string | undefined): HeadersInit {
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

/**
 * Check if a session is valid
 */
export function isValidSession(session: any): boolean {
  return !!session?.accessToken;
}
