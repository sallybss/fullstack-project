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

      <div
        ref="dropzoneEl"
        class="coverEditor__dropzone"
        :class="{ 'coverEditor__dropzone--dragging': isDragging }"
        @dragover.prevent
        @drop.prevent="onDrop"
        @click="!selectedFile && fileInput?.click()"
        @pointerdown="onPointerDown"
        @pointermove="onPointerMove"
        @pointerup="onPointerUp"
        @pointercancel="onPointerUp"
      >
        <img
          v-if="selectedFile && sourceObjectUrl"
          :src="sourceObjectUrl"
          class="coverEditor__cropImg"
          :style="{ objectPosition: `${focusX}% ${focusY}%` }"
          draggable="false"
        />
        <img
          v-else-if="previewUrl"
          :src="previewUrl"
          class="coverEditor__cropImg"
          style="cursor: default"
          draggable="false"
        />
        <div v-else class="coverEditor__placeholder">
          <i class="pi pi-image"></i>
          <span>Click or drag an image here</span>
        </div>
      </div>

      <p v-if="selectedFile" class="coverEditor__hint">
        <i class="pi pi-arrows-alt"></i> Drag to reposition
      </p>
      <p v-else class="coverEditor__hint">JPG, PNG, WebP · max 8 MB</p>

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
        <button
          v-if="selectedFile"
          class="coverEditor__secondary"
          type="button"
          @click="fileInput?.click()"
        >
          Change
        </button>
        <button
          class="coverEditor__primary"
          type="button"
          :disabled="isSaving || !selectedFile"
          @click="save"
        >
          {{ isSaving ? "Uploading..." : "Save" }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { useAuthSession } from "../../composables/useAuthSession";
import { getImageDimensions, validateImageDimensions } from "../../composables/useImageValidation";

const props = defineProps<{
  settingKey: string;
  initialImageUrl: string;
}>();

const emit = defineEmits<{
  (e: "updated", imageUrl: string): void;
}>();

const API_URL = import.meta.env.VITE_API_URL;
const { isAdmin, token } = useAuthSession();

function toFullUrl(url: string | null | undefined): string {
  if (!url) return "";
  return url.startsWith("http") ? url : `${API_URL}${url}`;
}

const currentUrl = ref(props.initialImageUrl);
const previewUrl = ref<string | null>(null);
const selectedFile = ref<File | null>(null);
const sourceObjectUrl = ref("");
const naturalWidth = ref(0);
const naturalHeight = ref(0);
const focusX = ref(50);
const focusY = ref(50);
const dropzoneEl = ref<HTMLElement | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);
const isSaving = ref(false);
const isOpen = ref(false);
const isDragging = ref(false);
const errorMessage = ref("");

let lastPointerX = 0;
let lastPointerY = 0;

watch(
  () => props.initialImageUrl,
  (nextValue) => {
    const fullUrl = toFullUrl(nextValue);
    currentUrl.value = fullUrl;
    if (!isOpen.value) previewUrl.value = fullUrl || null;
  },
  { immediate: true },
);

watch(
  () => props.settingKey,
  () => { void loadSavedCover(); },
  { immediate: true },
);

async function loadSavedCover() {
  try {
    const response = await fetch(`${API_URL}/api/settings/hero/${encodeURIComponent(props.settingKey)}`);
    if (!response.ok) return;
    const payload = await response.json();
    const savedUrl = payload?.data?.imageUrl;
    if (savedUrl) {
      const fullUrl = toFullUrl(savedUrl);
      currentUrl.value = fullUrl;
      previewUrl.value = fullUrl;
      emit("updated", fullUrl);
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

async function setFile(file: File) {
  errorMessage.value = "";
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    errorMessage.value = "Only JPG, PNG, or WebP images are allowed.";
    return;
  }
  if (file.size > 8 * 1024 * 1024) {
    errorMessage.value = "Image must be under 8 MB.";
    return;
  }

  try {
    await validateImageDimensions(
      file,
      {
        minWidth: 1400,
        minHeight: 500,
        maxWidth: 8000,
        maxHeight: 8000,
      },
      "Cover image",
    );

    clearSourceUrl();
    selectedFile.value = file;
    focusX.value = 50;
    focusY.value = 50;

    sourceObjectUrl.value = URL.createObjectURL(file);
    const { width, height } = await getImageDimensions(file);
    naturalWidth.value = width;
    naturalHeight.value = height;
  } catch (error) {
    errorMessage.value = (error as Error).message || "Failed to read image.";
  }
}

function onPointerDown(e: PointerEvent) {
  if (!selectedFile.value) return;
  isDragging.value = true;
  lastPointerX = e.clientX;
  lastPointerY = e.clientY;
  (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
}

function onPointerMove(e: PointerEvent) {
  if (!isDragging.value || !dropzoneEl.value || !naturalWidth.value) return;

  const dx = e.clientX - lastPointerX;
  const dy = e.clientY - lastPointerY;
  lastPointerX = e.clientX;
  lastPointerY = e.clientY;

  const containerW = dropzoneEl.value.clientWidth;
  const containerH = dropzoneEl.value.clientHeight;
  const containerRatio = containerW / containerH;
  const imageRatio = naturalWidth.value / naturalHeight.value;

  let displayW: number, displayH: number;
  if (imageRatio > containerRatio) {
    displayH = containerH;
    displayW = displayH * imageRatio;
  } else {
    displayW = containerW;
    displayH = displayW / imageRatio;
  }

  const overflowX = displayW - containerW;
  const overflowY = displayH - containerH;

  if (overflowX > 0) focusX.value = Math.max(0, Math.min(100, focusX.value - (dx / overflowX) * 100));
  if (overflowY > 0) focusY.value = Math.max(0, Math.min(100, focusY.value - (dy / overflowY) * 100));
}

function onPointerUp() {
  isDragging.value = false;
}

function closePanel() {
  isOpen.value = false;
  selectedFile.value = null;
  clearSourceUrl();
  previewUrl.value = currentUrl.value || null;
  errorMessage.value = "";
  if (fileInput.value) fileInput.value.value = "";
}

function clearSourceUrl() {
  if (sourceObjectUrl.value) {
    URL.revokeObjectURL(sourceObjectUrl.value);
    sourceObjectUrl.value = "";
  }
}

async function save() {
  if (!selectedFile.value) {
    errorMessage.value = "Please select an image file.";
    return;
  }

  try {
    isSaving.value = true;
    errorMessage.value = "";

    const blob = await renderCroppedBlob(selectedFile.value);
    const ext = selectedFile.value.name.replace(/^.*\./, "") || "jpg";
    const croppedFile = new File([blob], `cover.${ext === "jpg" || ext === "jpeg" ? "jpg" : ext}`, { type: blob.type });

    const formData = new FormData();
    formData.append("cover", croppedFile);

    const response = await fetch(
      `${API_URL}/api/settings/hero/${encodeURIComponent(props.settingKey)}/upload`,
      { method: "POST", headers: { "auth-token": token.value || "" }, body: formData }
    );

    const payload = await response.json().catch(() => null);
    if (!response.ok) throw new Error(payload?.error || "Failed to upload cover image.");

    const fullUrl = toFullUrl(payload?.data?.imageUrl);
    currentUrl.value = fullUrl;
    emit("updated", fullUrl);
    clearSourceUrl();
    closePanel();
  } catch (error) {
    errorMessage.value = (error as Error).message || "Failed to upload cover image.";
  } finally {
    isSaving.value = false;
  }
}

async function renderCroppedBlob(file: File): Promise<Blob> {
  const url = URL.createObjectURL(file);
  const image = await loadImage(url);
  URL.revokeObjectURL(url);

  const outW = 1800;
  const outH = 640;
  const targetRatio = outW / outH;
  const iw = image.naturalWidth;
  const ih = image.naturalHeight;

  let cropW: number, cropH: number;
  if (iw / ih > targetRatio) {
    cropH = ih;
    cropW = ih * targetRatio;
  } else {
    cropW = iw;
    cropH = iw / targetRatio;
  }

  const cropX = (iw - cropW) * (focusX.value / 100);
  const cropY = (ih - cropH) * (focusY.value / 100);

  const canvas = document.createElement("canvas");
  canvas.width = outW;
  canvas.height = outH;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported.");
  ctx.drawImage(image, cropX, cropY, cropW, cropH, 0, 0, outW, outH);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Failed to process image."))),
      "image/jpeg",
      0.88,
    );
  });
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image."));
    img.src = url;
  });
}
</script>

<style scoped>
.coverEditor {
  position: absolute;
  top: 24px;
  right: 18px;
  z-index: 20;
  display: grid;
  justify-items: end;
  gap: 10px;
}

@media (max-width: 1350px) {
  .coverEditor {
    top: 160px;
    right: 18px;
  }
}

@media (max-width: 640px) {
  .coverEditor {
    top: 192px;
    right: 16px;
  }

  .coverEditor__toggle {
    width: 38px;
    height: 38px;
  }
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
  aspect-ratio: 2.8;
  border: 2px dashed #e5d8cc;
  border-radius: 12px;
  background: #fff;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: border-color 0.2s;
  cursor: pointer;
  user-select: none;
}

.coverEditor__dropzone:hover {
  border-color: #ef8358;
}

.coverEditor__dropzone--dragging {
  cursor: grabbing;
  border-color: #ef8358;
}

.coverEditor__cropImg {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: 50% 50%;
  display: block;
  cursor: grab;
  user-select: none;
  pointer-events: none;
}

.coverEditor__dropzone--dragging .coverEditor__cropImg {
  cursor: grabbing;
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

.coverEditor__hint {
  margin: 8px 0 0;
  color: #8e796b;
  font-size: 0.78rem;
  text-align: left;
  display: flex;
  align-items: center;
  gap: 4px;
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
