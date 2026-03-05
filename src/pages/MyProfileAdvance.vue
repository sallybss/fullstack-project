<script setup lang="ts">
import { computed, ref } from "vue";
import { useRouter } from "vue-router";

import HeroSection from "../components/common/HeroSection.vue";
import BaseButton from "../components/common/BaseButton.vue";

const router = useRouter();

function goBack() {
  router.back();
}

// mock "me" (same as MyProfileView)
const me = ref({
  id: "user-1",
  name: "Jane Doe",
  initials: "JD",
  email: "jane.doe@example.com",
  memberSince: "January 2025",
  recipesPosted: 12,
  followers: 5,
  coverUrl: "https://picsum.photos/seed/myprofilehero/1400/700",
});

// ----- Personal info form -----
const fullName = ref(me.value.name);
const description = ref("");
const email = ref(me.value.email);

const fullNameCount = computed(() => fullName.value.length);
const descCount = computed(() => description.value.length);
const emailCount = computed(() => email.value.length);

function savePersonalInfo() {
  // later: call API
  console.log("save personal info", {
    fullName: fullName.value,
    description: description.value,
    email: email.value,
  });
  alert("Saved (mock)");
}

function cancelPersonalInfo() {
  fullName.value = me.value.name;
  description.value = "";
  email.value = me.value.email;
}

// ----- Password form -----
const currentPassword = ref("");
const newPassword = ref("");
const confirmPassword = ref("");

const passwordError = ref("");

function updatePassword() {
  passwordError.value = "";

  if (!currentPassword.value || !newPassword.value || !confirmPassword.value) {
    passwordError.value = "Please fill all password fields.";
    return;
  }
  if (newPassword.value.length < 6) {
    passwordError.value = "New password must be at least 6 characters.";
    return;
  }
  if (newPassword.value !== confirmPassword.value) {
    passwordError.value = "Passwords do not match.";
    return;
  }

  console.log("update password", {
    currentPassword: currentPassword.value,
    newPassword: newPassword.value,
  });

  alert("Password updated (mock)");
  currentPassword.value = "";
  newPassword.value = "";
  confirmPassword.value = "";
}

function cancelPassword() {
  passwordError.value = "";
  currentPassword.value = "";
  newPassword.value = "";
  confirmPassword.value = "";
}

function forgotPassword() {
  alert("Later: Forgot password flow");
}

// ----- Avatar / cover -----
function changeAvatar() {
  alert("Later: Upload avatar");
}

function changeCover() {
  alert("Later: Upload cover");
}

// ----- Delete account -----
function deleteAccount() {
  const ok = confirm("Delete account permanently? This cannot be undone.");
  if (!ok) return;

  console.log("delete account");
  alert("Deleted (mock)");
}

</script>

<template>
  <div class="page">
    <HeroSection :imageUrl="me.coverUrl" />

    <main class="container">
      <!-- TOP CARD -->
      <div class="card">
        <div class="top">
          <div class="topLeft">
            <button class="back" type="button" @click="goBack">
              ← Go back
            </button>

            <div class="tabs">
              <button
                class="tab"
                type="button"
                @click="router.push({ name: 'my-profile' })"
              >
                Profile
              </button>

              <button class="tab is-active" type="button">Advanced</button>
            </div>
          </div>
        </div>

        <div class="header">
          <div class="left">
            <div class="avatar">{{ me.initials }}</div>

            <div class="meta">
              <h1 class="name">{{ me.name }}</h1>
              <p class="sub">
                Member since {{ me.memberSince }} ·
                {{ me.recipesPosted }} recipes posted
              </p>
            </div>
          </div>

          <div class="topRight">
            <BaseButton variant="outline" type="button" @click="changeAvatar">
              Change avatar
            </BaseButton>

            <BaseButton variant="outline" type="button" @click="changeCover">
              Change Cover
            </BaseButton>
          </div>
        </div>

        <!-- PERSONAL INFO -->
        <section class="sectionCard">
          <div class="sectionHead">
            <div>
              <h2 class="sectionTitle">Personal Information</h2>
              <p class="sectionSub">Update your name and email address.</p>
            </div>
          </div>

          <div class="formGrid">
            <div class="field">
              <div class="fieldHead">
                <label>Full name</label>
                <span class="counter">{{ fullNameCount }}/100</span>
              </div>
              <input
                v-model="fullName"
                maxlength="100"
                type="text"
                placeholder="Jane Doe"
              />
            </div>

            <div class="field field--full">
              <div class="fieldHead">
                <label>Description <span class="req">*</span></label>
                <span class="counter">{{ descCount }}/500</span>
              </div>
              <textarea
                v-model="description"
                maxlength="500"
                placeholder="Describe yourself"
              />
            </div>

            <div class="field">
              <div class="fieldHead">
                <label>Email address</label>
                <span class="counter">{{ emailCount }}/100</span>
              </div>
              <input
                v-model="email"
                maxlength="100"
                type="email"
                placeholder="jane.doe@example.com"
              />
            </div>
          </div>

          <div class="actions">
            <BaseButton
              variant="outline"
              type="button"
              @click="cancelPersonalInfo"
            >
              Cancel
            </BaseButton>
            <BaseButton
              variant="primary"
              type="button"
              @click="savePersonalInfo"
            >
              Save
            </BaseButton>
          </div>
        </section>
      </div>

      <!-- CHANGE PASSWORD CARD -->
      <section class="card sectionCardOuter">
        <div class="sectionHead">
          <div>
            <h2 class="sectionTitle">Change password</h2>
            <p class="sectionSub">
              Ensure your account stays secure by updating your password
              regularly.
            </p>
          </div>
        </div>

        <div class="formGrid">
          <div class="field field--full">
            <div class="fieldHeadRow">
              <label>Current password</label>
              <button class="linkBtn" type="button" @click="forgotPassword">
                Forgot?
              </button>
            </div>
            <input
              v-model="currentPassword"
              type="password"
              placeholder="Enter current password"
            />
          </div>

          <div class="field field--full">
            <label>New password</label>
            <input
              v-model="newPassword"
              type="password"
              placeholder="Enter new password"
            />
          </div>

          <div class="field field--full">
            <label>Confirm new password</label>
            <input
              v-model="confirmPassword"
              type="password"
              placeholder="Enter new password"
            />
          </div>

          <p v-if="passwordError" class="error">{{ passwordError }}</p>
        </div>

        <div class="actions">
          <BaseButton variant="outline" type="button" @click="cancelPassword"
            >Cancel</BaseButton
          >
          <BaseButton variant="primary" type="button" @click="updatePassword"
            >Update</BaseButton
          >
        </div>
      </section>

      <!-- DELETE ACCOUNT CARD -->
      <section class="card sectionCardOuter">
        <div class="sectionHead deleteHead">
          <div>
            <h2 class="sectionTitle">Delete account</h2>
            <p class="sectionSub">
              Permanently delete your account. This action cannot be undone.
            </p>
          </div>

          <BaseButton
            variant="primary"
            type="button"
            class="dangerBtn"
            @click="deleteAccount"
          >
            Delete
          </BaseButton>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
/* base page (same principle as other pages) */
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

/* card shell */
.card {
  background: #fff;
  border-radius: 28px;
  padding: 22px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
}

/* first big card only */
.sectionCardOuter {
  margin-top: 18px;
}

/* top layout */
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
  white-space: nowrap;
}

/* tabs */
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

/* header */
.header {
  margin-top: 16px;
  display: flex;
  justify-content: space-between;
  gap: 18px;
  align-items: center;
}

.left {
  display: flex;
  gap: 14px;
  align-items: center;
}

.avatar {
  width: 54px;
  height: 54px;
  border-radius: 50%;
  background: #f1f1f6;
  display: grid;
  place-items: center;
  font-weight: 800;
  color: #333;
}

.meta {
  display: grid;
  gap: 4px;
}

.name {
  margin: 0;
  font-size: 24px;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.sub {
  margin: 0;
  color: #888;
  font-size: 13px;
}

/* right header actions (avatar/cover buttons) */
.topRight {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  justify-content: flex-end;
  flex-wrap: wrap;
}

/* section cards inside */
.sectionCard {
  margin-top: 18px;
  border: 1px solid #f0f0f0;
  border-radius: 18px;
  padding: 18px;
}

.sectionHead {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 14px;
  margin-bottom: 14px;
}

.sectionTitle {
  margin: 0;
  font-size: 16px;
  font-weight: 800;
}

.sectionSub {
  margin: 4px 0 0;
  color: #888;
  font-size: 13px;
}

/* form grid */
.formGrid {
  display: grid;
  gap: 16px;
}

.field--full {
  grid-column: 1 / -1;
}

.fieldHead {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}

.fieldHeadRow {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

label {
  display: inline-block;
  font-weight: 700;
  font-size: 13px;
  color: #222;
}

.req {
  color: #ff724c;
}

.counter {
  font-size: 12px;
  color: #a0a0a0;
}

/* inputs */
input,
textarea {
  width: 100%;
  margin-top: 8px;
  padding: 14px 16px;
  border-radius: 12px;
  border: 1px solid #d9d9d9;
  font-size: 14px;
  background: #fff;
}

textarea {
  min-height: 130px;
  resize: vertical;
}

input:focus,
textarea:focus {
  outline: none;
  border-color: #ff724c;
}

/* actions */
.actions {
  display: flex;
  justify-content: flex-end;
  gap: 14px;
  margin-top: 16px;
}

/* link button "Forgot?" */
.linkBtn {
  border: 0;
  background: transparent;
  color: #ff724c;
  cursor: pointer;
  font-weight: 700;
  font-size: 12px;
  padding: 0;
}

/* error */
.error {
  margin: 0;
  color: #d64545;
  font-size: 13px;
}

/* delete area */
.deleteHead {
  align-items: center;
}

/* responsive */
@media (max-width: 900px) {
  .header {
    flex-direction: column;
    align-items: flex-start;
  }

  .topRight {
    justify-content: flex-start;
  }

  .actions {
    justify-content: flex-start;
  }
}
</style>
