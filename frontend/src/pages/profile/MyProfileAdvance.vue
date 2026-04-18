<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";

import HeroSection from "../../components/common/HeroSection.vue";
import BaseButton from "../../components/common/BaseButton.vue";
import { useUser } from "../../modules/auth/useUser";

const router = useRouter();
const {
  user,
  profile,
  error,
  fetchCurrentUser,
  updateProfile,
  updatePassword,
  deleteAccount,
} = useUser();

const fullName = ref("");
const description = ref("");
const email = ref("");
const avatarUrl = ref("");

const currentPassword = ref("");
const newPassword = ref("");
const confirmPassword = ref("");
const localMessage = ref("");
const passwordError = ref("");

const isAdmin = computed(() => user.value?.role === "admin");
const initials = computed(() => {
  const username = user.value?.username || "User";
  return username
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
});

onMounted(async () => {
  await fetchCurrentUser();
  resetFields();
});

function resetFields() {
  fullName.value = user.value?.username || "";
  description.value = profile.value?.bio || "";
  email.value = user.value?.email || "";
  avatarUrl.value = profile.value?.avatarUrl || user.value?.avatarUrl || "";
}

function goBack() {
  router.back();
}

async function savePersonalInfo() {
  const updated = await updateProfile({
    username: fullName.value,
    bio: description.value,
    email: email.value,
    avatarUrl: avatarUrl.value,
  });

  localMessage.value = updated ? "Profile updated." : "";
}

function cancelPersonalInfo() {
  localMessage.value = "";
  resetFields();
}

async function submitPasswordUpdate() {
  passwordError.value = "";

  if (!currentPassword.value || !newPassword.value || !confirmPassword.value) {
    passwordError.value = "Please fill all password fields.";
    return;
  }
  if (newPassword.value !== confirmPassword.value) {
    passwordError.value = "Passwords do not match.";
    return;
  }

  const ok = await updatePassword(currentPassword.value, newPassword.value);
  if (!ok) return;

  passwordError.value = "";
  currentPassword.value = "";
  newPassword.value = "";
  confirmPassword.value = "";
  localMessage.value = "Password updated.";
}

function cancelPassword() {
  passwordError.value = "";
  currentPassword.value = "";
  newPassword.value = "";
  confirmPassword.value = "";
}

async function removeAccount() {
  if (!confirm("Delete account permanently? This cannot be undone.")) return;

  const ok = await deleteAccount();
  if (ok) {
    router.push("/");
  }
}
</script>

<template>
  <div class="page">
    <HeroSection imageUrl="https://picsum.photos/seed/myprofilehero/1400/700" />

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

              <button class="tab is-active" type="button">Advanced</button>

              <button
                v-if="isAdmin"
                class="tab"
                type="button"
                @click="router.push({ name: 'admin-panel' })"
              >
                Admin Panel
              </button>
            </div>
          </div>
        </div>

        <div class="header">
          <div class="left">
            <div class="avatar">{{ initials }}</div>

            <div class="meta">
              <h1 class="name">{{ user?.username || "User" }}</h1>
              <p class="sub">Manage your account settings and profile details.</p>
            </div>
          </div>
        </div>

        <section class="sectionCard">
          <div class="sectionHead">
            <div>
              <h2 class="sectionTitle">Personal Information</h2>
              <p class="sectionSub">Update your public profile and login email.</p>
            </div>
          </div>

          <div class="formGrid">
            <div class="field">
              <label>Full name</label>
              <input v-model="fullName" maxlength="100" type="text" />
            </div>

            <div class="field field--full">
              <label>Bio</label>
              <textarea v-model="description" maxlength="300" />
            </div>

            <div class="field">
              <label>Email address</label>
              <input v-model="email" maxlength="100" type="email" />
            </div>

            <div class="field">
              <label>Avatar URL</label>
              <input v-model="avatarUrl" maxlength="255" type="url" placeholder="https://..." />
            </div>
          </div>

          <p v-if="localMessage" class="success">{{ localMessage }}</p>
          <p v-if="error" class="error">{{ error }}</p>

          <div class="actions">
            <BaseButton variant="outline" type="button" @click="cancelPersonalInfo">
              Cancel
            </BaseButton>
            <BaseButton variant="primary" type="button" @click="savePersonalInfo">
              Save
            </BaseButton>
          </div>
        </section>
      </div>

      <section class="card sectionCardOuter">
        <div class="sectionHead">
          <div>
            <h2 class="sectionTitle">Change password</h2>
            <p class="sectionSub">Use a strong password with at least 6 characters.</p>
          </div>
        </div>

        <div class="formGrid">
          <div class="field field--full">
            <label>Current password</label>
            <input v-model="currentPassword" type="password" />
          </div>

          <div class="field field--full">
            <label>New password</label>
            <input v-model="newPassword" type="password" />
          </div>

          <div class="field field--full">
            <label>Confirm new password</label>
            <input v-model="confirmPassword" type="password" />
          </div>

          <p v-if="passwordError" class="error">{{ passwordError }}</p>
        </div>

        <div class="actions">
          <BaseButton variant="outline" type="button" @click="cancelPassword">
            Cancel
          </BaseButton>
          <BaseButton variant="primary" type="button" @click="submitPasswordUpdate">
            Update
          </BaseButton>
        </div>
      </section>

      <section class="card sectionCardOuter">
        <div class="sectionHead deleteHead">
          <div>
            <h2 class="sectionTitle">Delete account</h2>
            <p class="sectionSub">
              Permanently delete your account and your own recipes.
            </p>
          </div>

          <BaseButton variant="primary" type="button" class="dangerBtn" @click="removeAccount">
            Delete
          </BaseButton>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.page {
  min-height: 100vh;
  background:
    radial-gradient(circle at top left, rgba(255, 114, 76, 0.14), transparent 28%),
    linear-gradient(180deg, #f7f5f1 0%, #f4f0ea 100%);
}

.container {
  width: min(1100px, 92vw);
  margin: -180px auto 64px;
  position: relative;
  z-index: 2;
  display: grid;
  gap: 22px;
}

.card {
  background: rgba(255, 255, 255, 0.94);
  border: 1px solid rgba(168, 143, 112, 0.14);
  border-radius: 30px;
  box-shadow: 0 22px 60px rgba(68, 43, 24, 0.09);
  backdrop-filter: blur(12px);
}

.card:first-child {
  padding: 24px;
}

.sectionCardOuter {
  padding: 24px;
}

.top {
  display: flex;
  justify-content: space-between;
  gap: 16px;
}

.topLeft {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.back {
  align-self: flex-start;
  border: 0;
  background: transparent;
  color: #6c6257;
  padding: 0;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
}

.tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.tab {
  border: 1px solid rgba(255, 114, 76, 0.22);
  background: rgba(255, 255, 255, 0.78);
  color: #6b5443;
  border-radius: 999px;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s ease;
}

.tab:hover {
  border-color: rgba(255, 114, 76, 0.45);
  color: #2f241b;
}

.tab.is-active {
  background: linear-gradient(135deg, #ff8c63, #ff724c);
  border-color: transparent;
  color: white;
  box-shadow: 0 10px 24px rgba(255, 114, 76, 0.24);
}

.header {
  margin-top: 22px;
  padding: 24px 0 0;
  border-top: 1px solid rgba(107, 84, 67, 0.1);
}

.left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.avatar {
  width: 68px;
  height: 68px;
  border-radius: 24px;
  display: grid;
  place-items: center;
  background:
    linear-gradient(135deg, rgba(255, 114, 76, 0.18), rgba(255, 196, 146, 0.56));
  color: #7b341e;
  font-size: 22px;
  font-weight: 800;
  letter-spacing: 0.08em;
}

.meta {
  display: grid;
  gap: 6px;
}

.name {
  margin: 0;
  font-size: clamp(2rem, 3vw, 2.75rem);
  line-height: 1;
  letter-spacing: -0.04em;
  color: #1f1a16;
}

.sub {
  margin: 0;
  color: #74675c;
  font-size: 15px;
  line-height: 1.5;
  max-width: 540px;
}

.sectionCard {
  margin-top: 28px;
  padding: 28px;
  border-radius: 24px;
  background:
    linear-gradient(180deg, rgba(255, 249, 244, 0.96), rgba(255, 255, 255, 0.92));
  border: 1px solid rgba(168, 143, 112, 0.14);
}

.sectionHead {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
}

.sectionTitle {
  margin: 0;
  font-size: 1.8rem;
  line-height: 1.1;
  letter-spacing: -0.03em;
  color: #1f1a16;
}

.sectionSub {
  margin: 8px 0 0;
  color: #7a6d61;
  line-height: 1.5;
  font-size: 14px;
}

.formGrid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px 20px;
}

.field {
  display: grid;
  gap: 8px;
}

.field--full {
  grid-column: 1 / -1;
}

label {
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  color: #7a6756;
}

input,
textarea {
  width: 100%;
  border: 1px solid rgba(144, 118, 88, 0.18);
  background: rgba(255, 255, 255, 0.94);
  border-radius: 16px;
  padding: 14px 16px;
  color: #241d18;
  font: inherit;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
}

input::placeholder,
textarea::placeholder {
  color: #aa9a8d;
}

input:focus,
textarea:focus {
  outline: none;
  border-color: rgba(255, 114, 76, 0.58);
  box-shadow: 0 0 0 4px rgba(255, 114, 76, 0.12);
  background: white;
}

textarea {
  min-height: 150px;
  resize: vertical;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 22px;
}

.success,
.error {
  margin: 18px 0 0;
  padding: 14px 16px;
  border-radius: 14px;
  font-size: 14px;
  line-height: 1.5;
}

.success {
  background: rgba(60, 133, 80, 0.09);
  border: 1px solid rgba(60, 133, 80, 0.16);
  color: #25633a;
}

.error {
  background: rgba(196, 56, 44, 0.08);
  border: 1px solid rgba(196, 56, 44, 0.14);
  color: #a6342a;
}

.deleteHead {
  align-items: center;
}

.dangerBtn {
  flex-shrink: 0;
}

@media (max-width: 900px) {
  .container {
    margin-top: -150px;
  }

  .formGrid {
    grid-template-columns: 1fr;
  }

  .actions,
  .deleteHead {
    flex-direction: column;
    align-items: stretch;
  }

  .dangerBtn {
    width: 100%;
  }
}

@media (max-width: 640px) {
  .container {
    width: min(94vw, 1100px);
    margin-top: -120px;
  }

  .card:first-child,
  .sectionCardOuter,
  .sectionCard {
    padding: 18px;
  }

  .left {
    align-items: flex-start;
  }

  .avatar {
    width: 56px;
    height: 56px;
    border-radius: 18px;
    font-size: 18px;
  }

  .name {
    font-size: 1.8rem;
  }
}
</style>
