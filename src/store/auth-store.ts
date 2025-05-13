import { create } from "zustand";
import { signIn } from "next-auth/react";

interface AuthState {
  isLoading: boolean;
  error: string | null;
  handleGoogleSignIn: (callbackUrl?: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  isLoading: false,
  error: null,

  handleGoogleSignIn: async (callbackUrl = "/") => {
    set({ isLoading: true, error: null });

    try {
      const result = await signIn("google", {
        redirect: false,
        callbackUrl: "/",
      });

      if (result?.error) {
        set({ error: "Failed to sign in with Google. Please try again." });
        return;
      }

      if (result?.url) {
        window.location.href = "/";
      }
    } catch (error) {
      console.error("Google login error:", error);
      set({
        error: "An unexpected error occurred. Please try again.",
      });
    } finally {
      set({ isLoading: false });
    }
  },
}));
