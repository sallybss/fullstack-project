import { ref } from "vue";
import type { Profile, User, UserStatus } from "../../interfaces/user";

const API_URL = import.meta.env.VITE_API_URL;

const token = ref<string | null>(localStorage.getItem("lsToken"));
const isLoggedIn = ref<boolean>(Boolean(localStorage.getItem("lsToken")));
const error = ref<string | null>(null);
const user = ref<User | null>(null);
const profile = ref<Profile | null>(null);
const loadingProfile = ref<boolean>(false);
const initialized = ref<boolean>(false);

const name = ref<string>("");
const email = ref<string>("");
const password = ref<string>("");

function getAuthHeaders(includeContentType = true): HeadersInit {
  if (!token.value) {
    throw new Error("Authentication token missing");
  }

  const headers: HeadersInit = {
    "auth-token": token.value,
  };

  if (includeContentType) {
    headers["Content-Type"] = "application/json";
  }

  return headers;
}

export const useUser = () => {
  const fetchCurrentUser = async (): Promise<User | null> => {
    if (!token.value) {
      user.value = null;
      profile.value = null;
      initialized.value = true;
      return null;
    }

    loadingProfile.value = true;

    try {
      error.value = null;

      const [userResponse, profileResponse] = await Promise.all([
        fetch(`${API_URL}/api/auth/me`, {
          headers: {
            "auth-token": token.value,
          },
        }),
        fetch(`${API_URL}/api/profiles/me`, {
          headers: {
            "auth-token": token.value,
          },
        }),
      ]);

      if (!userResponse.ok) {
        throw new Error((await userResponse.text()) || "Failed to fetch current user");
      }

      const userPayload = await userResponse.json();
      user.value = userPayload.data;
      localStorage.setItem("userRole", userPayload.data.role);

      if (profileResponse.ok) {
        const profilePayload = await profileResponse.json();
        profile.value = profilePayload.data;
      }

      isLoggedIn.value = true;
      initialized.value = true;
      return user.value;
    } catch (err) {
      error.value = (err as Error).message || "Failed to fetch current user";
      logout();
      initialized.value = true;
      return null;
    } finally {
      loadingProfile.value = false;
    }
  };

  const fetchToken = async (): Promise<void> => {
    try {
      error.value = null;

      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.value,
          password: password.value,
        }),
      });

      if (!response.ok) {
        throw new Error((await response.text()) || "Login failed");
      }

      const authResponse = await response.json();

      token.value = authResponse.data.token;
      isLoggedIn.value = true;

      localStorage.setItem("lsToken", authResponse.data.token);
      localStorage.setItem("userIDToken", authResponse.data.userId);

      await fetchCurrentUser();
    } catch (err) {
      error.value = (err as Error).message || "An error occurred";
      isLoggedIn.value = false;
    }
  };

  const registerUser = async (): Promise<void> => {
    try {
      error.value = null;

      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: name.value,
          email: email.value,
          password: password.value,
        }),
      });

      if (!response.ok) {
        throw new Error((await response.text()) || "Failed to register user");
      }
    } catch (err) {
      error.value = (err as Error).message || "An error occurred";
    }
  };

  const logout = (): void => {
    token.value = null;
    user.value = null;
    profile.value = null;
    isLoggedIn.value = false;

    localStorage.removeItem("lsToken");
    localStorage.removeItem("userIDToken");
    localStorage.removeItem("userRole");
  };

  const resetForm = (): void => {
    name.value = "";
    email.value = "";
    password.value = "";
  };

  const updateProfile = async (payload: {
    username: string;
    bio: string;
    email: string;
    avatarUrl?: string;
  }): Promise<Profile | null> => {
    try {
      error.value = null;

      const response = await fetch(`${API_URL}/api/profiles/me`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error((await response.text()) || "Failed to update profile");
      }

      const result = await response.json();
      profile.value = result.data;

      if (user.value) {
        user.value = {
          ...user.value,
          username: payload.username,
          email: payload.email,
          bio: payload.bio,
          avatarUrl: payload.avatarUrl ?? user.value.avatarUrl,
        };
      }

      return profile.value;
    } catch (err) {
      error.value = (err as Error).message || "Failed to update profile";
      return null;
    }
  };

  const updatePassword = async (
    currentPassword: string,
    newPassword: string,
  ): Promise<boolean> => {
    try {
      error.value = null;

      const response = await fetch(`${API_URL}/api/auth/me/password`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (!response.ok) {
        throw new Error((await response.text()) || "Failed to update password");
      }

      return true;
    } catch (err) {
      error.value = (err as Error).message || "Failed to update password";
      return false;
    }
  };

  const deleteAccount = async (): Promise<boolean> => {
    try {
      error.value = null;

      const response = await fetch(`${API_URL}/api/auth/me`, {
        method: "DELETE",
        headers: getAuthHeaders(false),
      });

      if (!response.ok) {
        throw new Error((await response.text()) || "Failed to delete account");
      }

      logout();
      return true;
    } catch (err) {
      error.value = (err as Error).message || "Failed to delete account";
      return false;
    }
  };

  const fetchUsers = async (): Promise<User[]> => {
    const response = await fetch(`${API_URL}/api/auth/users`, {
      headers: getAuthHeaders(false),
    });

    if (!response.ok) {
      throw new Error((await response.text()) || "Failed to fetch users");
    }

    const payload = await response.json();
    return payload.data;
  };

  const updateManagedUserStatus = async (
    userId: string,
    status: UserStatus,
  ): Promise<User> => {
    const response = await fetch(`${API_URL}/api/auth/users/${userId}/status`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      throw new Error((await response.text()) || "Failed to update user status");
    }

    const payload = await response.json();
    return payload.data;
  };

  const deleteManagedUser = async (userId: string): Promise<void> => {
    const response = await fetch(`${API_URL}/api/auth/users/${userId}`, {
      method: "DELETE",
      headers: getAuthHeaders(false),
    });

    if (!response.ok) {
      throw new Error((await response.text()) || "Failed to delete user");
    }
  };

  return {
    token,
    isLoggedIn,
    error,
    user,
    profile,
    loadingProfile,
    initialized,
    name,
    email,
    password,
    fetchToken,
    fetchCurrentUser,
    registerUser,
    updateProfile,
    updatePassword,
    deleteAccount,
    fetchUsers,
    updateManagedUserStatus,
    deleteManagedUser,
    logout,
    resetForm,
  };
};
