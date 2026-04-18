<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";

import HeroSection from "../../components/common/HeroSection.vue";
import BaseButton from "../../components/common/BaseButton.vue";
import ProfileTabsBar from "../../components/profile/ProfileTabsBar.vue";
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
const profileMessage = ref("");
const passwordMessage = ref("");
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

async function savePersonalInfo() {
  const updated = await updateProfile({
    username: fullName.value,
    bio: description.value,
    email: email.value,
    avatarUrl: avatarUrl.value,
  });

  profileMessage.value = updated ? "Profile updated." : "";
  passwordMessage.value = "";
}

function cancelPersonalInfo() {
  profileMessage.value = "";
  resetFields();
}

async function submitPasswordUpdate() {
  passwordError.value = "";
  passwordMessage.value = "";

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
  passwordMessage.value = "Password updated.";
}

function cancelPassword() {
  passwordError.value = "";
  passwordMessage.value = "";
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
    <HeroSection imageUrl="https://picsum.photos/seed/myprofilehero/1400/700" setting-key="my-profile-advanced-hero" />

    <main class="container">
      <div class="card">
        <div class="top">
          <ProfileTabsBar
            active-tab="advanced"
            :show-admin="isAdmin"
            back-fallback-name="my-profile"
          />
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

        <section class="sectionCard sectionCard--plain">
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

          <p v-if="profileMessage" class="success">{{ profileMessage }}</p>
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

          <p v-if="passwordMessage" class="success">{{ passwordMessage }}</p>
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
  background: #f6f6fb;
  min-height: 100vh;
}

.container {
  max-width: 1180px;
  margin: -180px auto 60px;
  padding: 0 16px;
  position: relative;
  z-index: 2;
  display: grid;
  gap: 22px;
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

.sectionCardOuter {
  padding: 24px;
}

.header {
  margin-top: 18px;
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 18px;
  align-items: center;
}

.left {
  display: flex;
  gap: 14px;
  align-items: center;
}

.avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: #f1f1f6;
  color: #333;
  font-size: 22px;
  font-weight: 800;
}

.meta {
  display: grid;
  gap: 4px;
}

.name {
  margin: 0;
  font-size: 24px;
  font-weight: 800;
}

.sub {
  margin: 0;
  color: #888;
  font-size: 13px;
  line-height: 1.5;
}

.sectionCard {
  margin-top: 28px;
}

.sectionCard--plain {
  padding: 0;
  border: 0;
  background: transparent;
  border-radius: 0;
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
  border: 1px solid #ddd;
  background: #fff;
  border-radius: 14px;
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

  .header {
    align-items: flex-start;
    flex-direction: column;
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
    width: min(94vw, 1180px);
    margin-top: -120px;
  }

  .card,
  .sectionCardOuter {
    padding: 18px;
  }

  .sectionCard--plain {
    padding: 0;
  }

  .left {
    align-items: flex-start;
  }

  .avatar {
    width: 56px;
    height: 56px;
    font-size: 18px;
  }

  .name {
    font-size: 1.8rem;
  }
}
</style>
