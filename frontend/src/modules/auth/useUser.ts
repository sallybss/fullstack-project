import { ref, computed } from "vue"
import type { User, RegisterUser, LoginUser } from "../../interfaces/user"

const API_URL = import.meta.env.VITE_API_URL

const token = ref<string | null>(localStorage.getItem("token"))
const user = ref<User | null>(null)
const error = ref<string | null>(null)
const loading = ref<boolean>(false)

const username = ref<string>("")
const email = ref<string>("")
const password = ref<string>("")

const isLoggedIn = computed(() => !!token.value)

export const useUser = () => {
  const register = async (payload: RegisterUser): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error("Failed to register user")
      }

      const data = await response.json()
      console.log("Registered user:", data)
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Unknown error"
    } finally {
      loading.value = false
    }
  }

  const login = async (payload: LoginUser): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error("Failed to log in")
      }

      const data = await response.json()

      token.value = data.token
      user.value = data.user ?? null

      if (token.value) {
        localStorage.setItem("token", token.value)
      }

      console.log("Logged in:", data)
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Unknown error"
    } finally {
      loading.value = false
    }
  }

  const logout = () => {
    token.value = null
    user.value = null
    localStorage.removeItem("token")
  }

  return {
    token,
    user,
    error,
    loading,
    username,
    email,
    password,
    isLoggedIn,
    register,
    login,
    logout,
  }
}