<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";

import HeroSection from "../../components/common/HeroSection.vue";
import PaginationBar from "../../components/common/PaginationBar.vue";
import BaseButton from "../../components/common/BaseButton.vue";

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
const page = ref(1);
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

const pagedUsers = computed(() => {
  const start = (page.value - 1) * pageSize;
  return filteredUsers.value.slice(start, start + pageSize);
});

function goBack() {
  router.back();
}

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

onMounted(async () => {
  try {
    loading.value = true;
    error.value = "";

    await Promise.all([fetchCurrentUser(), fetchRecipes()]);
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

  const nextStatus = entry.status === "blocked" ? "active" : "blocked";
  const updated = await updateManagedUserStatus(id, nextStatus);
  users.value = users.value.map((item) => (item._id === id ? updated : item));
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
    <HeroSection imageUrl="https://picsum.photos/seed/adminhero/1400/700" />

    <main class="container">
      <div class="card">
        <div class="top">
          <div class="topLeft">
            <button class="back" type="button" @click="goBack">← Go back</button>

            <div class="tabs">
              <button
                class="tab"
                type="button"
                @click="router.push({ name: 'my-profile' })"
              >
                Profile
              </button>

              <button
                class="tab"
                type="button"
                @click="router.push({ name: 'my-profile-advanced' })"
              >
                Advanced
              </button>

              <button class="tab is-active" type="button">Admin Panel</button>
            </div>
          </div>

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
                    <div class="avatar">{{ initialsForUser(entry) }}</div>
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

          <div class="pager" v-if="filteredUsers.length > pageSize">
            <PaginationBar
              v-model:page="page"
              :pageSize="pageSize"
              :total="filteredUsers.length"
            />
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
