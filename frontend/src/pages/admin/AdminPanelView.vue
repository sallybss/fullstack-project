<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";

import HeroSection from "../../components/common/HeroSection.vue";
import PaginationBar from "../../components/common/PaginationBar.vue";
import BaseButton from "../../components/common/BaseButton.vue";
import ProfileTabsBar from "../../components/profile/ProfileTabsBar.vue";
import { usePagination } from "../../composables/usePagination";

import { useUser } from "../../modules/auth/useUser";
import { useRecipes } from "../../modules/useRecipes";
import type { User } from "../../interfaces/user";

const router = useRouter();
const {
  user,
  fetchCurrentUser,
  fetchUsers,
  updateManagedUserStatus,
  deleteManagedUser,
} = useUser();
const { recipes, fetchRecipes } = useRecipes();

const search = ref("");
const pageSize = 5;
const loading = ref(true);
const error = ref("");
const users = ref<User[]>([]);

const filteredUsers = computed(() => {
  const q = search.value.trim().toLowerCase();

  return users.value.filter((entry) => {
    return (
      entry.username.toLowerCase().includes(q) ||
      entry.email.toLowerCase().includes(q)
    );
  });
});

const totalUsers = computed(() => users.value.length);
const activeUsers = computed(() => users.value.filter((entry) => entry.status === "active").length);
const blockedUsers = computed(() => users.value.filter((entry) => entry.status === "blocked").length);
const isAdmin = computed(() => user.value?.role === "admin");
const { page, totalItems: filteredUserCount, pagedItems: pagedUsers, resetPage } = usePagination(filteredUsers, pageSize);

function recipeCountForUser(userId: string) {
  return recipes.value.filter((recipe) => recipe.owner?._id === userId).length;
}

function formatJoined(date?: string) {
  if (!date) return "Unknown";
  return new Date(date).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
  });
}

function initialsForUser(entry: User) {
  return entry.username
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function avatarSrc(entry: User) {
  if (!entry.avatarUrl) return "";
  return entry.avatarUrl.startsWith("http")
    ? entry.avatarUrl
    : `${import.meta.env.VITE_API_URL}${entry.avatarUrl}`;
}

watch(search, () => {
  resetPage();
});

onMounted(async () => {
  try {
    loading.value = true;
    error.value = "";

    await Promise.all([fetchCurrentUser(), fetchRecipes()]);

    if (user.value?.role !== "admin") {
      router.replace({ name: "my-profile" });
      return;
    }

    users.value = await fetchUsers();
  } catch (err) {
    error.value = (err as Error).message || "Failed to load admin data";
  } finally {
    loading.value = false;
  }
});

async function toggleBlock(id: string) {
  const entry = users.value.find((item) => item._id === id);
  if (!entry) return;

  try {
    error.value = "";
    const nextStatus = entry.status === "blocked" ? "active" : "blocked";
    const updated = await updateManagedUserStatus(id, nextStatus);
    users.value = users.value.map((item) => (item._id === id ? updated : item));
  } catch (err) {
    error.value = (err as Error).message || "Failed to update user status";
  }
}

async function deleteUser(id: string) {
  if (!confirm("Delete this user and their recipes?")) return;

  await deleteManagedUser(id);
  users.value = users.value.filter((item) => item._id !== id);
}

function viewPosts(id: string) {
  router.push({ name: "profile", params: { id } });
}
</script>

<template>
  <div class="page">
    <HeroSection imageUrl="https://picsum.photos/seed/adminhero/1400/700" setting-key="admin-panel-hero" />

    <main class="container">
      <div class="card">
        <div class="top">
          <ProfileTabsBar
            active-tab="admin"
            :show-admin="isAdmin"
            back-fallback-name="my-profile"
          />

          <div class="searchWrap">
            <input v-model="search" class="searchInput" type="text" placeholder="Search users" />
          </div>
        </div>

        <div class="head">
          <div>
            <h1 class="title">All users</h1>
            <p class="subtitle">Manage user accounts and their content.</p>
          </div>
        </div>

        <div class="stats">
          <div class="statCard">
            <div class="statIcon"><i class="pi pi-users"></i></div>
            <div>
              <div class="statValue">{{ totalUsers }}</div>
              <div class="statLabel">Total users</div>
            </div>
          </div>

          <div class="statCard">
            <div class="statIcon"><i class="pi pi-verified"></i></div>
            <div>
              <div class="statValue">{{ activeUsers }}</div>
              <div class="statLabel">Active</div>
            </div>
          </div>

          <div class="statCard">
            <div class="statIcon"><i class="pi pi-shield"></i></div>
            <div>
              <div class="statValue">{{ blockedUsers }}</div>
              <div class="statLabel">Blocked</div>
            </div>
          </div>
        </div>

        <div v-if="loading" class="emptyState">
          <h2>Loading users...</h2>
        </div>

        <div v-else-if="error" class="emptyState">
          <h2>Something went wrong</h2>
          <p>{{ error }}</p>
        </div>

        <div v-else class="tableWrap">
          <table class="table">
            <thead>
              <tr>
                <th>User</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Recipes</th>
                <th class="actionsCol">Actions</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="entry in pagedUsers" :key="entry._id">
                <td>
                  <div class="userCell">
                    <div class="avatar">
                      <img
                        v-if="avatarSrc(entry)"
                        :src="avatarSrc(entry)"
                        alt="User avatar"
                        class="avatarImage"
                      />
                      <span v-else>{{ initialsForUser(entry) }}</span>
                    </div>
                    <div>
                      <div class="userName">{{ entry.username }}</div>
                      <div class="userEmail">{{ entry.email }}</div>
                    </div>
                  </div>
                </td>

                <td>
                  <span
                    class="status"
                    :class="entry.status === 'blocked' ? 'is-blocked' : 'is-active'"
                  >
                    {{ entry.status }}
                  </span>
                </td>

                <td>{{ formatJoined(entry.createdAt) }}</td>
                <td>{{ recipeCountForUser(entry._id) }}</td>

                <td>
                  <div class="rowActions">
                    <BaseButton variant="outline" type="button" @click="viewPosts(entry._id)">
                      View posts
                    </BaseButton>

                    <button class="circleBtn" type="button" @click="toggleBlock(entry._id)">
                      <i class="pi pi-shield"></i>
                    </button>

                    <button
                      v-if="entry._id !== user?._id"
                      class="circleBtn circleBtn--danger"
                      type="button"
                      @click="deleteUser(entry._id)"
                    >
                      <i class="pi pi-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>

              <tr v-if="pagedUsers.length === 0">
                <td colspan="5">
                  <div class="emptyState">
                    <h2>No users found</h2>
                    <p>Try another search term.</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <div class="pager" v-if="filteredUserCount > pageSize">
            <PaginationBar
              v-model:page="page"
              :pageSize="pageSize"
              :total="filteredUserCount"
            />
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.page {
  background: #f6f6fb;
  min-height: 100vh;
}

.container {
  max-width: 1180px;
  margin: -180px auto 60px;
  padding: 0 16px;
  position: relative;
  z-index: 2;
}

.card {
  background: #fff;
  border-radius: 28px;
  padding: 22px;
}

.top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.searchWrap {
  width: min(320px, 100%);
}

.searchInput {
  width: 100%;
  min-height: 44px;
  border: 1px solid #ddd;
  border-radius: 999px;
  padding: 0 16px;
  font: inherit;
  background: #fff;
}

.searchInput:focus {
  outline: none;
  border-color: rgba(255, 114, 76, 0.58);
  box-shadow: 0 0 0 4px rgba(255, 114, 76, 0.12);
}

.head {
  margin-top: 22px;
}

.title {
  margin: 0;
  font-size: 32px;
  line-height: 1.05;
  color: #1f1711;
}

.subtitle {
  margin: 8px 0 0;
  color: #7a6d61;
  font-size: 14px;
}

.stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  margin-top: 22px;
}

.statCard {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px;
  border-radius: 20px;
  background: #f6f6fb;
}

.statIcon {
  width: 48px;
  height: 48px;
  border-radius: 16px;
  display: grid;
  place-items: center;
  background: #fff;
  color: #ff724c;
  font-size: 18px;
}

.statValue {
  font-size: 24px;
  font-weight: 800;
  color: #1f1711;
}

.statLabel {
  color: #7a6d61;
  font-size: 13px;
}

.tableWrap {
  margin-top: 24px;
  overflow-x: auto;
}

.table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

.table th,
.table td {
  padding: 16px 14px;
  text-align: left;
  border-bottom: 1px solid #eee6db;
}

.table th {
  color: #7f7368;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.actionsCol {
  text-align: right;
}

.userCell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: #f1f1f6;
  color: #333;
  font-weight: 800;
  overflow: hidden;
}

.avatarImage {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.userName {
  font-weight: 700;
  color: #1f1711;
}

.userEmail {
  color: #7a6d61;
  font-size: 13px;
}

.status {
  display: inline-flex;
  align-items: center;
  padding: 8px 12px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 700;
  text-transform: capitalize;
}

.status.is-active {
  background: #edf8ef;
  color: #24663a;
}

.status.is-blocked {
  background: #fff0f0;
  color: #a33b3b;
}

.rowActions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  align-items: center;
}

.circleBtn {
  width: 40px;
  height: 40px;
  border-radius: 999px;
  border: 1px solid rgba(255, 114, 76, 0.24);
  background: #fff;
  color: #ff724c;
  cursor: pointer;
}

.circleBtn--danger {
  border-color: #efc8be;
  color: #c95f45;
  background: #fff7f4;
}

.emptyState {
  margin-top: 24px;
  padding: 28px;
  border-radius: 22px;
  background: #f6f6fb;
  text-align: center;
  color: #6d6359;
}

.emptyState h2 {
  margin: 0;
  color: #1f1711;
}

.emptyState p {
  margin: 8px 0 0;
}

.pager {
  display: flex;
  justify-content: center;
  margin-top: 18px;
}

@media (max-width: 900px) {
  .container {
    margin-top: -150px;
  }

  .top {
    flex-direction: column;
  }

  .searchWrap {
    width: 100%;
  }

  .stats {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .container {
    width: min(94vw, 1180px);
    margin-top: -120px;
  }

  .card {
    padding: 18px;
  }

  .table th,
  .table td {
    padding: 12px 10px;
  }

  .rowActions {
    justify-content: flex-start;
    flex-wrap: wrap;
  }
}
</style>
