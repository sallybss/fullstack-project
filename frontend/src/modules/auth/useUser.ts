import { ref } from "vue";
import type { User } from "../../interfaces/user";

const API_URL = import.meta.env.VITE_API_URL;

const token = ref<string | null>(localStorage.getItem("lsToken"));
const isLoggedIn = ref<boolean>(!!localStorage.getItem("lsToken"));
const error = ref<string | null>(null);
const user = ref<User | null>(null);

const name = ref<string>("");
const email = ref<string>("");
const password = ref<string>("");

export const useUser = () => {
  // Login user
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
        const errorText = await response.text();
        console.log(errorText || "Login failed");
        throw new Error(errorText || "No data available");
      }

      const authResponse = await response.json();

      // Backend returns token and userId inside data
      token.value = authResponse.data.token;
      isLoggedIn.value = true;

      localStorage.setItem("lsToken", authResponse.data.token);
      localStorage.setItem("userIDToken", authResponse.data.userId);

      console.log("user is logged in:", authResponse);
      console.log("token:", token.value);
    } catch (err) {
      error.value = (err as Error).message || "An error occurred";
      isLoggedIn.value = false;
    }
  };

  // Register user
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
        const errorText = await response.text();
        console.log(errorText || "Registration failed");
        throw new Error(errorText || "Failed to register user");
      }

      const registerResponse = await response.json();
      console.log("user is registered/created:", registerResponse);
    } catch (err) {
      error.value = (err as Error).message || "An error occurred";
    }
  };

  // Clear stored auth data
  const logout = (): void => {
    token.value = null;
    user.value = null;
    isLoggedIn.value = false;

    localStorage.removeItem("lsToken");
    localStorage.removeItem("userIDToken");
  };

  // Reset shared form fields after success
  const resetForm = (): void => {
    name.value = "";
    email.value = "";
    password.value = "";
  };

  return {
    token,
    isLoggedIn,
    error,
    user,
    name,
    email,
    password,
    fetchToken,
    registerUser,
    logout,
    resetForm,
  };
};