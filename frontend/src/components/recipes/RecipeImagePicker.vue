<script setup lang="ts">
import { ref } from "vue";
import BaseButton from "../common/BaseButton.vue";
import ImageCropperModal from "../common/ImageCropperModal.vue";
import { validateImageDimensions } from "../../composables/useImageValidation";

defineProps<{
  imagePreview: string;
  imageUrl: string;
  imageFile: File | null;
}>();

const emit = defineEmits<{
  "update:imageUrl": [value: string];
  "update:imageFile": [value: File | null];
  "update:imagePreview": [value: string];
  error: [message: string];
}>();

const fileInput = ref<HTMLInputElement | null>(null);
const pendingCropFile = ref<File | null>(null);
const showCropper = ref(false);

function openFilePicker() {
  fileInput.value?.click();
}

async function handleImageChange(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  const allowedTypes = ["image/png", "image/jpeg"];
  const maxSize = 8 * 1024 * 1024;

  if (!allowedTypes.includes(file.type)) {
    emit("error", "Only JPG and PNG images are allowed.");
    target.value = "";
    return;
  }

  if (file.size > maxSize) {
    emit("error", "Image must be smaller than 8MB before upload.");
    target.value = "";
    return;
  }

  try {
    await validateImageDimensions(
      file,
      {
        minWidth: 600,
        minHeight: 600,
        maxWidth: 8000,
        maxHeight: 8000,
      },
      "Recipe image",
    );

    emit("error", "");
    pendingCropFile.value = file;
    showCropper.value = true;
  } catch (error) {
    emit("error", (error as Error).message || "Invalid image size.");
  } finally {
    target.value = "";
  }
}

function removeImage() {
  emit("update:imagePreview", "");
  emit("update:imageFile", null);
  emit("update:imageUrl", "");

  if (fileInput.value) {
    fileInput.value.value = "";
  }
}

function closeCropper() {
  showCropper.value = false;
  pendingCropFile.value = null;
}

function applyCroppedImage(file: File) {
  emit("update:imageFile", file);
  emit("update:imageUrl", "");
  emit("update:imagePreview", URL.createObjectURL(file));
  closeCropper();
}
</script>

<template>
  <div>
    <div class="upload-head">
      <span class="section-title">Upload image</span>
      <span class="hint">JPG, PNG (8MB, cropped and resized)</span>
    </div>

    <div class="upload-box">
      <input
        ref="fileInput"
        type="file"
        accept=".jpg,.jpeg,.png"
        hidden
        @change="handleImageChange"
      />

      <template v-if="imagePreview">
        <img :src="imagePreview" alt="Recipe preview" class="preview-image" />

        <div class="image-overlay">
          <BaseButton variant="outline" type="button" @click="openFilePicker">
            Change photo
          </BaseButton>

          <button class="remove-image-btn" type="button" @click="removeImage">
            Remove photo
          </button>
        </div>
      </template>

      <template v-else>
        <BaseButton variant="outline" type="button" @click="openFilePicker">
          + Add a photo
        </BaseButton>
      </template>
    </div>

    <div v-if="!imagePreview" class="field">
      <label>Image URL</label>
      <input
        :value="imageUrl"
        type="text"
        maxlength="500"
        placeholder="Paste an image URL (optional)"
        @input="emit('update:imageUrl', ($event.target as HTMLInputElement).value)"
      />
    </div>

    <ImageCropperModal
      :visible="showCropper"
      :file="pendingCropFile"
      title="Edit recipe image"
      confirm-label="Use photo"
      :aspect-ratio="1"
      :output-width="1200"
      :output-height="1200"
      :onClose="closeCropper"
      :onApply="applyCroppedImage"
    />
  </div>
</template>

<style scoped>
.upload-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 6px;
  margin-bottom: 12px;
}

.section-title {
  font-weight: 600;
  font-size: 14px;
  color: #222;
}

.hint {
  font-size: 12px;
  color: #9a9a9a;
}

.upload-box {
  height: 100px;
  border-radius: 16px;
  border: 2px dashed #ff724c;
  background: rgba(255, 114, 76, 0.08);
  display: grid;
  place-items: center;
  margin-bottom: 22px;
  overflow: hidden;
  position: relative;
}

.field {
  margin-top: 16px;
}

label {
  display: inline-block;
  font-weight: 600;
  font-size: 14px;
  color: #222;
}

input {
  width: 100%;
  margin-top: 8px;
  padding: 14px 16px;
  border-radius: 12px;
  border: 1px solid #d9d9d9;
  font-size: 14px;
  background: #fff;
}

input:focus {
  outline: none;
  border-color: #ff724c;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 16px;
  background: #fff;
}

.image-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.upload-box:hover .image-overlay {
  opacity: 1;
}

.remove-image-btn {
  border: 1px solid rgba(255, 255, 255, 0.9);
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
  border-radius: 999px;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  backdrop-filter: blur(3px);
}

.remove-image-btn:hover {
  background: rgba(255, 255, 255, 0.25);
}
</style>
