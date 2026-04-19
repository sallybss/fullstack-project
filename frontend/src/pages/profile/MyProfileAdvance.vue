<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";

import HeroSection from "../../components/common/HeroSection.vue";
import BaseButton from "../../components/common/BaseButton.vue";
import ProfileTabsBar from "../../components/profile/ProfileTabsBar.vue";
import ImageCropperModal from "../../components/common/ImageCropperModal.vue";
import { validateImageDimensions } from "../../composables/useImageValidation";
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
const forgotPasswordSuccess = ref("");
const showForgotPasswordModal = ref(false);
const avatarError = ref("");
const avatarUploadMessage = ref("");
const isUploadingAvatar = ref(false);
const avatarInput = ref<HTMLInputElement | null>(null);
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

async function openAvatarPicker() {
  avatarInput.value?.click();
}

async function onAvatarSelected(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;

  avatarError.value = "";
  avatarUploadMessage.value = "";

  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    avatarError.value = "Only JPG, PNG, or WebP images are allowed.";
    return;
  }

  if (file.size > 8 * 1024 * 1024) {
    avatarError.value = "Image must be under 8 MB.";
    return;
  }

  try {
    await validateImageDimensions(
      file,
      {
        minWidth: 300,
        minHeight: 300,
        maxWidth: 8000,
        maxHeight: 8000,
      },
      "Profile image",
    );

    pendingAvatarFile.value = file;
    showAvatarCropper.value = true;
  } catch (err) {
    avatarError.value = (err as Error).message || "Invalid image.";
  } finally {
    if (avatarInput.value) avatarInput.value.value = "";
  }
}

function closeAvatarCropper() {
  showAvatarCropper.value = false;
  pendingAvatarFile.value = null;
}

async function applyAvatarCrop(file: File) {
  showAvatarCropper.value = false;
  pendingAvatarFile.value = null;
  avatarError.value = "";
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
  forgotPasswordSuccess.value = "";

  const result = await requestPasswordReset(forgotPasswordEmail.value);
  if (!result) {
    forgotPasswordError.value = error.value || "Failed to send reset email.";
    return;
  }

  forgotPasswordSuccess.value = result.message;
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

        <section class="sectionCard sectionCard--plain">
          <div class="sectionHead">
            <div>
              <h2 class="sectionTitle">Personal Information</h2>
              <p class="sectionSub">Update your public profile and login email.</p>
            </div>
          </div>

          <div class="avatarPanel">
            <div class="avatar avatar--large">
              <img v-if="avatarSrc" :src="avatarSrc" alt="Profile avatar" class="avatarImage" />
              <span v-else>{{ initials }}</span>
            </div>

            <div class="avatarPanel__content">
              <h3>Profile photo</h3>
              <p>Upload a square photo. It will be cropped, resized, and compressed automatically.</p>

              <div class="avatarPanel__actions">
                <BaseButton
                  variant="outline"
                  type="button"
                  :disabled="isUploadingAvatar"
                  @click="openAvatarPicker"
                >
                  {{ isUploadingAvatar ? "Uploading..." : "Change photo" }}
                </BaseButton>
                <span class="avatarHint">JPG, PNG, WebP · max 8 MB</span>
              </div>

              <input
                ref="avatarInput"
                class="avatarInput"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                @change="onAvatarSelected"
              />

              <p v-if="avatarUploadMessage" class="success">{{ avatarUploadMessage }}</p>
              <p v-if="avatarError" class="error">{{ avatarError }}</p>
            </div>
          </div>

          <div class="formGrid">
            <div class="field">
              <div class="fieldHead">
                <label>Full name</label>
                <span class="counter">{{ fullName.length }}/100</span>
              </div>
              <input v-model="fullName" maxlength="100" type="text" />
            </div>

            <div class="field">
              <div class="fieldHead">
                <label>Email address</label>
                <span class="counter">{{ email.length }}/255</span>
              </div>
              <input v-model="email" maxlength="255" type="email" />
            </div>

            <div class="field field--full">
              <div class="fieldHead">
                <label>Bio</label>
                <span class="counter">{{ description.length }}/300</span>
              </div>
              <textarea v-model="description" maxlength="300" />
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
            <input v-model="currentPassword" maxlength="72" :type="showPasswords ? 'text' : 'password'" />
          </div>

          <div class="field field--full">
            <label>New password</label>
            <input v-model="newPassword" maxlength="72" :type="showPasswords ? 'text' : 'password'" />
          </div>

          <div class="field field--full">
            <label>Confirm new password</label>
            <input v-model="confirmPassword" maxlength="72" :type="showPasswords ? 'text' : 'password'" />
          </div>

          <p v-if="passwordMessage" class="success">{{ passwordMessage }}</p>
          <p v-if="passwordError" class="error">{{ passwordError }}</p>
        </div>

        <div class="actions actions--split">
          <label class="passwordToggle">
            <input v-model="showPasswords" type="checkbox" />
            <span>Show password</span>
          </label>

          <button class="forgotPasswordLink" type="button" @click="openForgotPasswordModal">
            Forgot password?
          </button>

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

    <div
      v-if="showForgotPasswordModal"
      class="authModalOverlay"
      @click.self="closeForgotPasswordModal"
    >
      <div class="authModal">
        <button
          class="authModal__close"
          type="button"
          aria-label="Close"
          @click="closeForgotPasswordModal"
        >
          <i class="pi pi-times"></i>
        </button>

        <h2 class="authModal__title">Reset password</h2>
        <p class="authModal__text">Enter your email and we’ll send you a reset link.</p>

        <form class="authModal__form" @submit.prevent="submitForgotPasswordRequest">
          <label class="field authModal__field">
            <span>Email</span>
            <input
              v-model="forgotPasswordEmail"
              maxlength="255"
              type="email"
              autocomplete="email"
              placeholder="you@email.com"
              required
            />
          </label>

          <p v-if="forgotPasswordError" class="error authModal__message">
            {{ forgotPasswordError }}
          </p>

          <BaseButton variant="primary" type="submit">
            Send reset link
          </BaseButton>
        </form>
      </div>
    </div>
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

.avatar--large {
  width: 92px;
  height: 92px;
  flex-basis: 92px;
  font-size: 34px;
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

.avatarPanel {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 18px 0 22px;
}

.avatarPanel__content {
  display: grid;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

.avatarPanel__content h3 {
  margin: 0;
  font-size: 1rem;
  color: #1f1a16;
}

.avatarPanel__content p {
  margin: 0;
  color: #7a6d61;
  font-size: 14px;
}

.avatarPanel__actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.avatarHint {
  color: #a89d95;
  font-size: 12px;
  line-height: 1.5;
}

.avatarInput {
  display: none;
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

.fieldHead {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
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

.counter {
  font-size: 12px;
  color: #a89d95;
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

.passwordToggle {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  margin-right: auto;
  color: #7a6d61;
  font-size: 14px;
  font-weight: 500;
  text-transform: none;
  cursor: pointer;
}

.passwordToggle input {
  width: auto;
  margin: 0;
  accent-color: #f08b62;
  box-shadow: none;
}

.forgotPasswordLink {
  border: 0;
  background: transparent;
  color: #ff724c;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 22px;
}

.actions--split {
  align-items: center;
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

.authModalOverlay {
  position: fixed;
  inset: 0;
  z-index: 40;
  display: grid;
  place-items: center;
  padding: 24px;
  background: rgba(0, 0, 0, 0.58);
}

.authModal {
  position: relative;
  width: min(460px, 100%);
  border-radius: 24px;
  padding: 24px;
  background: #1b1512;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.28);
}

.authModal__close {
  position: absolute;
  top: 14px;
  right: 14px;
  width: 38px;
  height: 38px;
  border: 0;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
  cursor: pointer;
}

.authModal__title {
  margin: 0;
  color: #fff;
  font-size: 1.8rem;
}

.authModal__text {
  margin: 10px 0 20px;
  color: rgba(255, 255, 255, 0.72);
  line-height: 1.5;
}

.authModal__form {
  display: grid;
  gap: 16px;
}

.authModal__field span {
  color: #fff;
  font-size: 13px;
}

.authModal__field input {
  background: rgba(255, 255, 255, 0.95);
}

.authModal__message {
  margin: 0;
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

  .actions--split {
    align-items: stretch;
  }

  .passwordToggle {
    margin-right: 0;
  }

  .forgotPasswordLink {
    text-align: left;
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

  .sectionHead {
    margin-bottom: 16px;
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

  .avatarPanel {
    align-items: stretch;
    flex-direction: column;
    gap: 16px;
    padding: 18px;
    border: 1px solid rgba(240, 139, 98, 0.16);
    border-radius: 24px;
    background: linear-gradient(180deg, rgba(255, 248, 244, 0.95) 0%, #ffffff 100%);
  }

  .avatar--large {
    width: 88px;
    height: 88px;
    flex-basis: 88px;
    margin: 0 auto;
  }

  .avatarPanel__content {
    gap: 10px;
    text-align: center;
    justify-items: center;
  }

  .avatarPanel__content p {
    max-width: 22ch;
  }

  .avatarPanel__actions {
    width: 100%;
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }

  .avatarPanel__actions :deep(.baseButton),
  .avatarPanel__actions button {
    width: 100%;
  }

  .avatarHint {
    display: block;
    text-align: center;
  }
}
</style>
