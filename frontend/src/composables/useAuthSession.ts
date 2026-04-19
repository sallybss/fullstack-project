import { computed, ref } from "vue";

const token = ref<string | null>(localStorage.getItem("lsToken"));
const userRole = ref<string | null>(localStorage.getItem("userRole"));

function syncAuthSessionFromStorage() {
  token.value = localStorage.getItem("lsToken");
  userRole.value = localStorage.getItem("userRole");
}

function setAuthSession(nextToken: string, nextUserRole?: string | null) {
  token.value = nextToken;
  localStorage.setItem("lsToken", nextToken);

  if (nextUserRole) {
    userRole.value = nextUserRole;
    localStorage.setItem("userRole", nextUserRole);
  }
}

function setStoredUserRole(nextUserRole: string | null) {
  userRole.value = nextUserRole;

  if (nextUserRole) {
    localStorage.setItem("userRole", nextUserRole);
    return;
  }

  localStorage.removeItem("userRole");
}

function clearAuthSession() {
  token.value = null;
  userRole.value = null;
  localStorage.removeItem("lsToken");
  localStorage.removeItem("userRole");
}

export function useAuthSession() {
  return {
    token,
    userRole,
    isAuthenticated: computed(() => Boolean(token.value)),
    isAdmin: computed(() => userRole.value === "admin"),
    syncAuthSessionFromStorage,
    setAuthSession,
    setStoredUserRole,
    clearAuthSession,
  };
}
