<script setup lang="ts">
import { ref } from "vue";
import BaseButton from "../common/BaseButton.vue";
import { validateImageDimensions } from "../../composables/useImageValidation";

defineProps<{
  avatarSrc: string;
  initials: string;
  isUploading: boolean;
  message: string;
}>();

const emit = defineEmits<{
  fileReady: [file: File];
  clearMessage: [];
}>();

const avatarInput = ref<HTMLInputElement | null>(null);
const error = ref("");

function openAvatarPicker() {
  avatarInput.value?.click();
}

async function onAvatarSelected(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;

  error.value = "";
  emit("clearMessage");

  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    error.value = "Only JPG, PNG, or WebP images are allowed.";
    return;
  }

  if (file.size > 8 * 1024 * 1024) {
    error.value = "Image must be under 8 MB.";
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

    emit("fileReady", file);
  } catch (err) {
    error.value = (err as Error).message || "Invalid image.";
  } finally {
    if (avatarInput.value) avatarInput.value.value = "";
  }
}
</script>

<template>
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
          :disabled="isUploading"
          @click="openAvatarPicker"
        >
          {{ isUploading ? "Uploading..." : "Change photo" }}
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

      <p v-if="message" class="success">{{ message }}</p>
      <p v-if="error" class="error">{{ error }}</p>
    </div>
  </div>
</template>

<style scoped>
.avatarPanel {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 18px 0 22px;
}

.avatar {
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: #f1f1f6;
  color: #333;
  font-weight: 800;
  overflow: hidden;
}

.avatar--large {
  width: 92px;
  height: 92px;
  flex: 0 0 92px;
  font-size: 34px;
}

.avatarImage {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  display: block;
}

.avatarPanel__content {
  display: grid;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

.avatarPanel__content h3,
.avatarPanel__content p {
  margin: 0;
}

.avatarPanel__content h3 {
  font-size: 1rem;
  color: #1f1a16;
}

.avatarPanel__content p {
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

.success,
.error {
  margin: 10px 0 0;
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

@media (max-width: 640px) {
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

  .avatarHint {
    display: block;
    text-align: center;
  }
}
</style>
