<script setup lang="ts">
import { computed, ref } from "vue";
import { useRouter } from "vue-router";

import HeroSection from "../components/common/HeroSection.vue";
import PaginationBar from "../components/common/PaginationBar.vue";
import BaseButton from "../components/common/BaseButton.vue";

const router = useRouter();

function goBack() {
  router.back();
}

const search = ref("");
const page = ref(1);
const pageSize = 5;

const users = ref([
  {
    id: "1",
    name: "Jane Doe",
    email: "john@example.com",
    initials: "JD",
    status: "Active",
    joined: "Jan 2026",
    recipes: 8,
  },
  {
    id: "2",
    name: "Jane Doe",
    email: "john@example.com",
    initials: "JD",
    status: "Active",
    joined: "Jan 2026",
    recipes: 8,
  },
  {
    id: "3",
    name: "Jane Doe",
    email: "john@example.com",
    initials: "JD",
    status: "Active",
    joined: "Jan 2026",
    recipes: 8,
  },
  {
    id: "4",
    name: "Jane Doe",
    email: "john@example.com",
    initials: "JD",
    status: "Blocked",
    joined: "Jan 2026",
    recipes: 8,
  },
  {
    id: "5",
    name: "Jane Doe",
    email: "john@example.com",
    initials: "JD",
    status: "Active",
    joined: "Jan 2026",
    recipes: 8,
  },
]);

const filteredUsers = computed(() => {
  const q = search.value.trim().toLowerCase();

  return users.value.filter((user) => {
    return (
      user.name.toLowerCase().includes(q) ||
      user.email.toLowerCase().includes(q)
    );
  });
});

const totalUsers = computed(() => users.value.length);
const activeUsers = computed(
  () => users.value.filter((u) => u.status === "Active").length,
);
const blockedUsers = computed(
  () => users.value.filter((u) => u.status === "Blocked").length,
);

const pagedUsers = computed(() => {
  const start = (page.value - 1) * pageSize;
  return filteredUsers.value.slice(start, start + pageSize);
});

function toggleBlock(id: string) {
  const user = users.value.find((u) => u.id === id);
  if (!user) return;

  user.status = user.status === "Blocked" ? "Active" : "Blocked";
}

function deleteUser(id: string) {
  const ok = confirm("Delete this user?");
  if (!ok) return;

  users.value = users.value.filter((u) => u.id !== id);
}

function viewPosts(id: string) {
  console.log("View posts for user", id);
}
</script>

<template>
  <div class="page">
    <HeroSection imageUrl="https://picsum.photos/seed/adminhero/1400/700" />

    <main class="container">
      <div class="card">
        <!-- top -->
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
            <button class="searchBtn" type="button">
              <i class="pi pi-search"></i>
            </button>
          </div>
        </div>

        <!-- title -->
        <div class="head">
          <div>
            <h1 class="title">All users</h1>
            <p class="subtitle">Manage user accounts and their content.</p>
          </div>
        </div>

        <!-- stats -->
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

        <!-- table -->
        <div class="tableWrap">
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
              <tr v-for="user in pagedUsers" :key="user.id">
                <td>
                  <div class="userCell">
                    <div class="avatar">{{ user.initials }}</div>
                    <div>
                      <div class="userName">{{ user.name }}</div>
                      <div class="userEmail">{{ user.email }}</div>
                    </div>
                  </div>
                </td>

                <td>
                  <span
                    class="status"
                    :class="user.status === 'Blocked' ? 'is-blocked' : 'is-active'"
                  >
                    {{ user.status }}
                  </span>
                </td>

                <td>{{ user.joined }}</td>
                <td>{{ user.recipes }}</td>

                <td>
                  <div class="rowActions">
                    <BaseButton
                      variant="outline"
                      type="button"
                      @click="viewPosts(user.id)"
                    >
                      View posts
                    </BaseButton>

                    <button
                      class="circleBtn"
                      type="button"
                      @click="toggleBlock(user.id)"
                    >
                      <i class="pi pi-shield"></i>
                    </button>

                    <button
                      class="circleBtn circleBtn--danger"
                      type="button"
                      @click="deleteUser(user.id)"
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
        </div>

        <!-- pagination -->
        <div class="pager" v-if="filteredUsers.length > pageSize">
          <PaginationBar
            v-model:page="page"
            :pageSize="pageSize"
            :total="filteredUsers.length"
          />
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

.topLeft {
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-width: 240px;
}

.back {
  border: 0;
  background: transparent;
  color: #666;
  padding: 6px 0;
  cursor: pointer;
  font-size: 14px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.tabs {
  display: inline-flex;
  gap: 10px;
}

.tab {
  border: 1px solid rgba(255, 114, 76, 0.35);
  background: transparent;
  color: rgba(255, 114, 76, 0.9);
  border-radius: 999px;
  padding: 6px 14px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.tab.is-active {
  background: var(--accent, #ff724c);
  border-color: var(--accent, #ff724c);
  color: #fff;
}

.searchWrap {
  display: flex;
  align-items: center;
  width: 320px;
  max-width: 100%;
  border-radius: 999px;
  overflow: hidden;
  background: #f4f2f8;
}

.searchInput {
  flex: 1;
  border: 0;
  background: transparent;
  padding: 12px 16px;
  font-size: 14px;
  outline: none;
}

.searchBtn {
  width: 54px;
  height: 46px;
  border: 0;
  background: var(--accent, #ff724c);
  color: #fff;
  cursor: pointer;
}

.head {
  margin-top: 24px;
}

.title {
  margin: 0;
  font-size: 24px;
  font-weight: 800;
}

.subtitle {
  margin: 6px 0 0;
  color: #888;
  font-size: 14px;
}

.stats {
  margin-top: 24px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.statCard {
  background: #f6f6fb;
  border-radius: 18px;
  padding: 18px;
  display: flex;
  align-items: center;
  gap: 14px;
}

.statIcon {
  font-size: 20px;
  color: #222;
}

.statValue {
  font-size: 28px;
  font-weight: 800;
  line-height: 1;
}

.statLabel {
  margin-top: 4px;
  color: #888;
  font-size: 13px;
}

.tableWrap {
  margin-top: 24px;
  overflow-x: auto;
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.table th,
.table td {
  padding: 16px 14px;
  text-align: left;
  border-bottom: 1px solid #ece8ee;
  vertical-align: middle;
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
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: #f1f1f6;
  display: grid;
  place-items: center;
  font-size: 12px;
  font-weight: 700;
  color: #444;
}

.userName {
  font-weight: 700;
  color: #222;
}

.userEmail {
  color: #999;
  font-size: 13px;
  margin-top: 3px;
}

.status {
  display: inline-flex;
  align-items: center;
  padding: 8px 14px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 700;
}

.is-active {
  background: #dff4e3;
  color: #2f7d43;
}

.is-blocked {
  background: #f8e6a8;
  color: #9b6b00;
}

.rowActions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 10px;
}

.circleBtn {
  width: 38px;
  height: 38px;
  border-radius: 999px;
  border: 1px solid #dfc9c3;
  background: #fff;
  color: #9b7f77;
  cursor: pointer;
}

.circleBtn--danger {
  border-color: #ff4d4f;
  color: #ff4d4f;
}

.emptyState {
  padding: 48px 24px;
  text-align: center;
}

.emptyState h2 {
  margin: 0 0 8px;
  font-size: 20px;
}

.emptyState p {
  margin: 0;
  color: #888;
}

.pager {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}

@media (max-width: 900px) {
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
</style>