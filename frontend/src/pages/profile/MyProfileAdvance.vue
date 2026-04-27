<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";

import HeroSection from "../../components/common/HeroSection.vue";
import ImageCropperModal from "../../components/common/ImageCropperModal.vue";
import AvatarUploadPanel from "../../components/profile/AvatarUploadPanel.vue";
import DeleteAccountPanel from "../../components/profile/DeleteAccountPanel.vue";
import ForgotPasswordModal from "../../components/profile/ForgotPasswordModal.vue";
import PasswordChangeForm from "../../components/profile/PasswordChangeForm.vue";
import ProfileInfoForm from "../../components/profile/ProfileInfoForm.vue";
import ProfileTabsBar from "../../components/profile/ProfileTabsBar.vue";
import { useUser } from "../../modules/auth/useUser";

const router = useRouter();
const API_URL = import.meta.env.VITE_API_URL;
const {
  user,
  profile,
  error,
  fetchCurrentUser,
  requestPasswordReset,
  updateProfile,
  uploadAvatar,
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
const showPasswords = ref(false);
const profileMessage = ref("");
const passwordMessage = ref("");
const passwordError = ref("");
const forgotPasswordEmail = ref("");
const forgotPasswordError = ref("");
const showForgotPasswordModal = ref(false);
const avatarUploadMessage = ref("");
const isUploadingAvatar = ref(false);
const pendingAvatarFile = ref<File | null>(null);
const showAvatarCropper = ref(false);

const isAdmin = computed(() => user.value?.role === "admin");

const avatarSrc = computed(() => {
  const value = profile.value?.avatarUrl || user.value?.avatarUrl || avatarUrl.value;
  if (!value) return "";
  return value.startsWith("http") ? value : `${API_URL}${value}`;
});

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

function handleAvatarFileReady(file: File) {
  avatarUploadMessage.value = "";
  pendingAvatarFile.value = file;
  showAvatarCropper.value = true;
}

function closeAvatarCropper() {
  showAvatarCropper.value = false;
  pendingAvatarFile.value = null;
}

async function applyAvatarCrop(file: File) {
  showAvatarCropper.value = false;
  pendingAvatarFile.value = null;
  avatarUploadMessage.value = "";
  isUploadingAvatar.value = true;

  try {
    const updatedProfile = await uploadAvatar(file);
    if (!updatedProfile) return;

    avatarUrl.value = updatedProfile.avatarUrl || "";
    avatarUploadMessage.value = "Profile photo updated.";
  } finally {
    isUploadingAvatar.value = false;
  }
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

function openForgotPasswordModal() {
  forgotPasswordError.value = "";
  forgotPasswordEmail.value = user.value?.email || email.value || "";
  showForgotPasswordModal.value = true;
}

function closeForgotPasswordModal() {
  showForgotPasswordModal.value = false;
  forgotPasswordError.value = "";
}

async function submitForgotPasswordRequest() {
  forgotPasswordError.value = "";

  const result = await requestPasswordReset(forgotPasswordEmail.value);
  if (!result) {
    forgotPasswordError.value = error.value || "Failed to send reset email.";
    return;
  }

  closeForgotPasswordModal();
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
            <div class="avatar">
              <img v-if="avatarSrc" :src="avatarSrc" alt="Profile avatar" class="avatarImage" />
              <span v-else>{{ initials }}</span>
            </div>

            <div class="meta">
              <h1 class="name">{{ user?.username || "User" }}</h1>
              <p class="sub">Manage your account settings and profile details.</p>
            </div>
          </div>
        </div>

        <ProfileInfoForm
          v-model:full-name="fullName"
          v-model:email="email"
          v-model:description="description"
          :message="profileMessage"
          :error="error"
          @save="savePersonalInfo"
          @cancel="cancelPersonalInfo"
        >
          <AvatarUploadPanel
            :avatar-src="avatarSrc"
            :initials="initials"
            :is-uploading="isUploadingAvatar"
            :message="avatarUploadMessage"
            @clear-message="avatarUploadMessage = ''"
            @file-ready="handleAvatarFileReady"
          />
        </ProfileInfoForm>
      </div>

      <PasswordChangeForm
        v-model:current-password="currentPassword"
        v-model:new-password="newPassword"
        v-model:confirm-password="confirmPassword"
        v-model:show-passwords="showPasswords"
        :message="passwordMessage"
        :error="passwordError"
        @submit="submitPasswordUpdate"
        @cancel="cancelPassword"
        @forgot-password="openForgotPasswordModal"
      />

      <DeleteAccountPanel @delete="removeAccount" />
    </main>

    <ImageCropperModal
      :visible="showAvatarCropper"
      :file="pendingAvatarFile"
      title="Edit profile photo"
      confirm-label="Use photo"
      :aspect-ratio="1"
      :output-width="800"
      :output-height="800"
      :onClose="closeAvatarCropper"
      :onApply="applyAvatarCrop"
    />

    <ForgotPasswordModal
      v-if="showForgotPasswordModal"
      v-model:email="forgotPasswordEmail"
      :error="forgotPasswordError"
      @close="closeForgotPasswordModal"
      @submit="submitForgotPasswordRequest"
    />
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
  aspect-ratio: 1 / 1;
  flex: 0 0 56px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: #f1f1f6;
  color: #333;
  font-size: 22px;
  font-weight: 800;
  overflow: hidden;
}

.avatarImage {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  display: block;
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

@media (max-width: 900px) {
  .container {
    margin-top: -150px;
  }

  .header {
    align-items: flex-start;
    flex-direction: column;
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
