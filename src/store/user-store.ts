import { create } from "zustand";

interface UserState {
  isOAuthUser: boolean;
  isLoading: boolean;
  error: string | null;
  fetchUserInfo: (token: string) => Promise<void>;
}

export const useUserStore = create<UserState>((set) => ({
  isOAuthUser: false,
  isLoading: false,
  error: null,

  fetchUserInfo: async (token: string) => {
    set({ isLoading: true, error: null });

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/v1/users/me`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch user information");
      }

      const userData = await response.json();

      // Set isOAuthUser based on the is_oauth_user flag from the API
      set({
        isOAuthUser: userData.is_oauth_user || false,
        isLoading: false,
      });
    } catch (error) {
      console.error("Error fetching user information:", error);
      set({
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
        isLoading: false,
      });
    }
  },
}));
