import type { Recipe } from "../interfaces/recipe";
import type { Profile } from "../interfaces/user";

const API_URL = import.meta.env.VITE_API_URL;

export type ProfilePerson = {
  _id: string;
  username: string;
};

type ApiPayload<T> = {
  data?: T;
  error?: string | null;
};

async function readErrorMessage(response: Response, fallback: string): Promise<string> {
  const raw = await response.text();
  if (!raw) return fallback;

  try {
    const parsed = JSON.parse(raw) as { error?: string; message?: string };
    return parsed.error || parsed.message || fallback;
  } catch {
    return raw;
  }
}

async function fetchJson<T>(path: string, fallback: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, init);
  if (!response.ok) {
    throw new Error(await readErrorMessage(response, fallback));
  }

  const payload = (await response.json()) as ApiPayload<T>;
  return payload.data as T;
}

export async function fetchProfile(profileId: string): Promise<Profile> {
  return fetchJson<Profile>(`/api/profiles/${profileId}`, "Failed to fetch profile");
}

export async function fetchProfileRecipes(profileId: string): Promise<Recipe[]> {
  return fetchJson<Recipe[]>(`/api/profiles/${profileId}/recipes`, "Failed to fetch user recipes");
}

export async function fetchProfileSavedRecipes(profileId: string): Promise<Recipe[]> {
  return fetchJson<Recipe[]>(`/api/profiles/${profileId}/saved`, "Failed to fetch saved recipes");
}

export async function fetchProfileFollowers(profileId: string): Promise<ProfilePerson[]> {
  return fetchJson<ProfilePerson[]>(`/api/profiles/${profileId}/followers`, "Failed to fetch followers");
}

export async function fetchProfileFollowing(profileId: string): Promise<ProfilePerson[]> {
  return fetchJson<ProfilePerson[]>(`/api/profiles/${profileId}/following`, "Failed to fetch following");
}

export async function fetchMySavedRecipes(token: string): Promise<Recipe[]> {
  return fetchJson<Recipe[]>("/api/profiles/me/saved", "Failed to fetch saved recipes", {
    headers: {
      "auth-token": token,
    },
  });
}

export async function updateFollowStatus(
  profileUserId: string,
  isFollowing: boolean,
  token: string,
): Promise<void> {
  const response = await fetch(`${API_URL}/api/profiles/${profileUserId}/follow`, {
    method: isFollowing ? "DELETE" : "POST",
    headers: {
      "auth-token": token,
    },
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response, "Failed to update follow status"));
  }
}
