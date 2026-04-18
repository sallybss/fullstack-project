<template>
  <div v-if="isAdmin && settingKey" class="coverEditor">
    <button
      class="coverEditor__toggle"
      type="button"
      :disabled="isSaving"
      @click="isOpen = !isOpen"
    >
      <i class="pi pi-pencil"></i>
    </button>

    <div v-if="isOpen" class="coverEditor__panel">
      <label class="coverEditor__label">Cover image</label>

      <div class="coverEditor__dropzone" @click="fileInput?.click()" @dragover.prevent @drop.prevent="onDrop">
        <img v-if="previewUrl" :src="previewUrl" class="coverEditor__preview" alt="Preview" />
        <div v-else class="coverEditor__placeholder">
          <i class="pi pi-image"></i>
          <span>Click or drag an image here</span>
        </div>
      </div>

      <input
        ref="fileInput"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        class="coverEditor__fileInput"
        @change="onFileChange"
      />

      <p v-if="errorMessage" class="coverEditor__error">{{ errorMessage }}</p>

      <div class="coverEditor__actions">
        <button class="coverEditor__secondary" type="button" @click="closePanel">
          Cancel
        </button>
        <button class="coverEditor__primary" type="button" :disabled="isSaving || !selectedFile" @click="save">
          {{ isSaving ? "Uploading..." : "Save" }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { useAuthSession } from "../../composables/useAuthSession";

const props = defineProps<{
  settingKey: string;
  initialImageUrl: string;
}>();

const emit = defineEmits<{
  (e: "updated", imageUrl: string): void;
}>();

const API_URL = import.meta.env.VITE_API_URL;
const { isAdmin, token } = useAuthSession();

const currentUrl = ref(props.initialImageUrl);
const previewUrl = ref<string | null>(null);
const selectedFile = ref<File | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);
const isSaving = ref(false);
const isOpen = ref(false);
const errorMessage = ref("");

watch(
  () => props.initialImageUrl,
  (nextValue) => {
    currentUrl.value = nextValue;
    if (!isOpen.value) {
      previewUrl.value = nextValue || null;
    }
  },
  { immediate: true },
);

watch(
  () => props.settingKey,
  () => {
    void loadSavedCover();
  },
  { immediate: true },
);

async function loadSavedCover() {
  try {
    const response = await fetch(`${API_URL}/api/settings/hero/${encodeURIComponent(props.settingKey)}`);
    if (!response.ok) return;

    const payload = await response.json();
    const savedUrl = payload?.data?.imageUrl;
    if (savedUrl) {
      currentUrl.value = savedUrl;
      previewUrl.value = savedUrl;
      emit("updated", savedUrl);
    }
  } catch {
    // Keep fallback image if settings request fails.
  }
}

function onFileChange(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (file) setFile(file);
}

function onDrop(event: DragEvent) {
  const file = event.dataTransfer?.files?.[0];
  if (file) setFile(file);
}

function setFile(file: File) {
  errorMessage.value = "";
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    errorMessage.value = "Only JPG, PNG, or WebP images are allowed.";
    return;
  }
  if (file.size > 8 * 1024 * 1024) {
    errorMessage.value = "Image must be under 8 MB.";
    return;
  }
  selectedFile.value = file;
  previewUrl.value = URL.createObjectURL(file);
}

function closePanel() {
  isOpen.value = false;
  selectedFile.value = null;
  previewUrl.value = currentUrl.value || null;
  errorMessage.value = "";
  if (fileInput.value) fileInput.value.value = "";
}

async function save() {
  if (!selectedFile.value) {
    errorMessage.value = "Please select an image file.";
    return;
  }

  try {
    isSaving.value = true;
    errorMessage.value = "";

    const formData = new FormData();
    formData.append("cover", selectedFile.value);

    const response = await fetch(
      `${API_URL}/api/settings/hero/${encodeURIComponent(props.settingKey)}/upload`,
      {
        method: "POST",
        headers: { "auth-token": token.value || "" },
        body: formData,
      }
    );

    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(payload?.error || "Failed to upload cover image.");
    }

    const newUrl = payload?.data?.imageUrl;
    currentUrl.value = newUrl;
    emit("updated", `${API_URL}${newUrl}`);
    closePanel();
  } catch (error) {
    errorMessage.value = (error as Error).message || "Failed to upload cover image.";
  } finally {
    isSaving.value = false;
  }
}
</script>

<style scoped>
.coverEditor {
  position: absolute;
  top: 18px;
  right: 18px;
  z-index: 20;
  display: grid;
  justify-items: end;
  gap: 10px;
}

.coverEditor__toggle {
  width: 40px;
  height: 40px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.28);
  background: rgba(17, 17, 17, 0.34);
  color: #fff;
  display: grid;
  place-items: center;
  cursor: pointer;
  backdrop-filter: blur(8px);
}

.coverEditor__toggle:hover {
  background: rgba(17, 17, 17, 0.52);
}

.coverEditor__panel {
  width: min(320px, calc(100vw - 36px));
  border-radius: 18px;
  padding: 14px;
  background: rgba(255, 250, 245, 0.96);
  border: 1px solid rgba(240, 139, 98, 0.2);
  box-shadow: 0 18px 42px rgba(0, 0, 0, 0.22);
  backdrop-filter: blur(14px);
}

.coverEditor__label {
  display: block;
  margin-bottom: 8px;
  color: #4a3a31;
  font-size: 0.84rem;
  font-weight: 700;
  text-align: left;
}

.coverEditor__dropzone {
  width: 100%;
  height: 140px;
  border: 2px dashed #e5d8cc;
  border-radius: 12px;
  background: #fff;
  cursor: pointer;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: border-color 0.2s;
}

.coverEditor__dropzone:hover {
  border-color: #ef8358;
}

.coverEditor__preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.coverEditor__placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: #a89080;
  font-size: 0.84rem;
}

.coverEditor__placeholder .pi {
  font-size: 2rem;
}

.coverEditor__fileInput {
  display: none;
}

.coverEditor__error {
  margin: 8px 0 0;
  color: #bc4d3a;
  font-size: 0.84rem;
  text-align: left;
}

.coverEditor__actions {
  margin-top: 12px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.coverEditor__secondary,
.coverEditor__primary {
  border: 0;
  border-radius: 999px;
  padding: 10px 14px;
  font: inherit;
  font-size: 0.88rem;
  font-weight: 700;
  cursor: pointer;
}

.coverEditor__secondary {
  background: #f0ece8;
  color: #55453a;
}

.coverEditor__primary {
  background: #ef8358;
  color: #fff;
}

.coverEditor__primary:disabled,
.coverEditor__toggle:disabled {
  cursor: wait;
  opacity: 0.78;
}
</style>
