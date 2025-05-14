import { handleAuthError } from "@/lib/auth-utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface UserPreferences {
  preferred_theme?: "light" | "dark" | "system";
}

interface UserResponse {
  id: string;
  username: string;
  email: string;
  preferred_theme?: "light" | "dark" | "system";
  is_active: boolean;
  profile_picture?: string;
}

/**
 * Update user preferences like theme
 */
export async function updateUserPreferences(
  preferences: UserPreferences,
  token: string
): Promise<UserResponse> {
  const response = await fetch(`${API_URL}/v1/auth/me/preferences`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(preferences),
  });

  if (response.status === 401) {
    handleAuthError();
    throw new Error("Authentication failed");
  }

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to update preferences");
  }

  return await response.json();
}
