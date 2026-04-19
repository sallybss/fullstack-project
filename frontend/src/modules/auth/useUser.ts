import { ref } from "vue";
import type { Profile, User, UserStatus } from "../../interfaces/user";
import { useAuthSession } from "../../composables/useAuthSession";

const API_URL = import.meta.env.VITE_API_URL;

const { token, isAuthenticated, setAuthSession, setStoredUserRole, clearAuthSession } = useAuthSession();
const isLoggedIn = isAuthenticated;
const error = ref<string | null>(null);
const user = ref<User | null>(null);
const profile = ref<Profile | null>(null);
const loadingProfile = ref<boolean>(false);
const initialized = ref<boolean>(false);

const name = ref<string>("");
const email = ref<string>("");
const password = ref<string>("");

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
        throw new Error(await readErrorMessage(userResponse, "Failed to fetch current user"));
      }

      const userPayload = await userResponse.json();
      user.value = userPayload.data;
      setStoredUserRole(userPayload.data.role);

      if (profileResponse.ok) {
        const profilePayload = await profileResponse.json();
        profile.value = profilePayload.data;
      }

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
        throw new Error(await readErrorMessage(response, "Login failed"));
      }

      const authResponse = await response.json();

      setAuthSession(authResponse.data.token);
      localStorage.setItem("userIDToken", authResponse.data.userId);

      await fetchCurrentUser();
    } catch (err) {
      error.value = (err as Error).message || "An error occurred";
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
        throw new Error(await readErrorMessage(response, "Failed to register user"));
      }
    } catch (err) {
      error.value = (err as Error).message || "An error occurred";
    }
  };

  const requestPasswordReset = async (
    resetEmail: string,
  ): Promise<{ message: string; resetLink?: string } | null> => {
    try {
      error.value = null;

      const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: resetEmail,
        }),
      });

      if (!response.ok) {
        throw new Error(await readErrorMessage(response, "Failed to send reset email"));
      }

      const payload = await response.json();
      return {
        message: payload?.data?.message || "If that email exists, a reset link has been sent.",
        resetLink: payload?.data?.resetLink || undefined,
      };
    } catch (err) {
      error.value = (err as Error).message || "Failed to send reset email";
      return null;
    }
  };

  const resetPasswordWithToken = async (resetToken: string, newPassword: string): Promise<boolean> => {
    try {
      error.value = null;

      const response = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: resetToken,
          newPassword,
        }),
      });

      if (!response.ok) {
        throw new Error(await readErrorMessage(response, "Failed to reset password"));
      }

      return true;
    } catch (err) {
      error.value = (err as Error).message || "Failed to reset password";
      return false;
    }
  };

  const logout = (): void => {
    user.value = null;
    profile.value = null;
    clearAuthSession();
    localStorage.removeItem("userIDToken");
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
        throw new Error(await readErrorMessage(response, "Failed to update profile"));
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

  const uploadAvatar = async (file: File): Promise<Profile | null> => {
    try {
      error.value = null;

      const formData = new FormData();
      formData.append("avatar", file);

      const response = await fetch(`${API_URL}/api/profiles/me/avatar`, {
        method: "POST",
        headers: getAuthHeaders(false),
        body: formData,
      });

      if (!response.ok) {
        throw new Error(await readErrorMessage(response, "Failed to upload avatar"));
      }

      const result = await response.json();
      profile.value = result.data;

      if (user.value) {
        user.value = {
          ...user.value,
          avatarUrl: result.data?.avatarUrl ?? user.value.avatarUrl,
        };
      }

      return profile.value;
    } catch (err) {
      error.value = (err as Error).message || "Failed to upload avatar";
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
        throw new Error(await readErrorMessage(response, "Failed to update password"));
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
    requestPasswordReset,
    resetPasswordWithToken,
    updateProfile,
    uploadAvatar,
    updatePassword,
    deleteAccount,
    fetchUsers,
    updateManagedUserStatus,
    deleteManagedUser,
    logout,
    resetForm,
  };
};
