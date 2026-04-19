<template>
  <div v-if="visible && file" class="cropperOverlay" @click.self="props.onClose?.()">
    <div class="cropperModal">
      <div class="cropperModal__head">
        <div>
          <h2>{{ title }}</h2>
          <p>Resize and choose which part of the image should stay visible.</p>
        </div>

        <button class="cropperModal__close" type="button" @click="props.onClose?.()">
          <i class="pi pi-times"></i>
        </button>
      </div>

      <div class="cropperStage">
        <div class="cropperPreview" :style="previewStyle"></div>
      </div>

      <div class="cropperControls">
        <label class="cropperControl">
          <span>Zoom</span>
          <input v-model="zoom" type="range" min="1" max="3" step="0.01" />
        </label>

        <label class="cropperControl">
          <span>Horizontal</span>
          <input v-model="focusX" type="range" min="0" max="100" step="1" />
        </label>

        <label class="cropperControl">
          <span>Vertical</span>
          <input v-model="focusY" type="range" min="0" max="100" step="1" />
        </label>
      </div>

      <p v-if="errorMessage" class="cropperError">{{ errorMessage }}</p>

      <div class="cropperActions">
        <button class="cropperBtn cropperBtn--secondary" type="button" @click="props.onClose?.()">
          Cancel
        </button>
        <button class="cropperBtn cropperBtn--primary" type="button" :disabled="isApplying" @click="applyCrop">
          {{ isApplying ? "Applying..." : confirmLabel }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from "vue";

const props = withDefaults(
  defineProps<{
    visible: boolean;
    file: File | null;
    title?: string;
    confirmLabel?: string;
    aspectRatio?: number;
    outputWidth?: number;
    outputHeight?: number;
    quality?: number;
    outputType?: string;
    onClose?: () => void;
    onApply?: (file: File) => void;
  }>(),
  {
    title: "Edit image",
    confirmLabel: "Use image",
    aspectRatio: 1,
    outputWidth: 1200,
    outputHeight: 1200,
    quality: 0.85,
    outputType: "image/jpeg",
  },
);

const sourceUrl = ref("");
const naturalWidth = ref(0);
const naturalHeight = ref(0);
const zoom = ref(1);
const focusX = ref(50);
const focusY = ref(50);
const isApplying = ref(false);
const errorMessage = ref("");

watch(
  () => [props.visible, props.file] as const,
  async ([visible, file]) => {
    if (!visible || !file) return;

    errorMessage.value = "";
    zoom.value = 1;
    focusX.value = 50;
    focusY.value = 50;

    resetSourceUrl();
    sourceUrl.value = URL.createObjectURL(file);

    try {
      const image = await loadImage(sourceUrl.value);
      naturalWidth.value = image.naturalWidth || image.width;
      naturalHeight.value = image.naturalHeight || image.height;
    } catch (error) {
      errorMessage.value = (error as Error).message || "Failed to load image.";
    }
  },
  { immediate: true },
);

watch(
  () => props.visible,
  (visible) => {
    document.documentElement.style.overflow = visible ? "hidden" : "";
    document.body.style.overflow = visible ? "hidden" : "";
  },
  { immediate: true },
);

onBeforeUnmount(() => {
  document.documentElement.style.overflow = "";
  document.body.style.overflow = "";
  resetSourceUrl();
});

const baseCrop = computed(() => {
  if (!naturalWidth.value || !naturalHeight.value) {
    return { width: 1, height: 1 };
  }

  const imageRatio = naturalWidth.value / naturalHeight.value;
  if (imageRatio > props.aspectRatio) {
    return {
      width: naturalHeight.value * props.aspectRatio,
      height: naturalHeight.value,
    };
  }

  return {
    width: naturalWidth.value,
    height: naturalWidth.value / props.aspectRatio,
  };
});

const cropBox = computed(() => {
  const width = baseCrop.value.width / zoom.value;
  const height = baseCrop.value.height / zoom.value;
  const maxX = Math.max(0, naturalWidth.value - width);
  const maxY = Math.max(0, naturalHeight.value - height);

  return {
    width,
    height,
    x: maxX * (focusX.value / 100),
    y: maxY * (focusY.value / 100),
    maxX,
    maxY,
  };
});

const previewStyle = computed(() => {
  if (!sourceUrl.value || !naturalWidth.value || !naturalHeight.value) {
    return { aspectRatio: String(props.aspectRatio) };
  }

  const widthPercent = (naturalWidth.value / cropBox.value.width) * 100;
  const heightPercent = (naturalHeight.value / cropBox.value.height) * 100;
  const positionX = cropBox.value.maxX === 0 ? 50 : (cropBox.value.x / cropBox.value.maxX) * 100;
  const positionY = cropBox.value.maxY === 0 ? 50 : (cropBox.value.y / cropBox.value.maxY) * 100;

  return {
    aspectRatio: String(props.aspectRatio),
    backgroundImage: `url(${sourceUrl.value})`,
    backgroundRepeat: "no-repeat",
    backgroundSize: `${widthPercent}% ${heightPercent}%`,
    backgroundPosition: `${positionX}% ${positionY}%`,
  };
});

async function applyCrop() {
  if (!props.file || !sourceUrl.value) {
    errorMessage.value = "Please choose an image first.";
    return;
  }

  try {
    isApplying.value = true;
    errorMessage.value = "";

    const image = await loadImage(sourceUrl.value);
    const canvas = document.createElement("canvas");
    canvas.width = props.outputWidth;
    canvas.height = props.outputHeight;

    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Image editing is not supported in this browser.");
    }

    context.drawImage(
      image,
      cropBox.value.x,
      cropBox.value.y,
      cropBox.value.width,
      cropBox.value.height,
      0,
      0,
      props.outputWidth,
      props.outputHeight,
    );

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, props.outputType, props.quality);
    });

    if (!blob) {
      throw new Error("Failed to process image.");
    }

    const extension = props.outputType === "image/png" ? "png" : "jpg";
    const fileName = props.file.name.replace(/\.[^.]+$/, "") || "image";

    props.onApply?.(
      new File([blob], `${fileName}.${extension}`, {
        type: props.outputType,
        lastModified: Date.now(),
      }),
    );
  } catch (error) {
    errorMessage.value = (error as Error).message || "Failed to process image.";
  } finally {
    isApplying.value = false;
  }
}

function resetSourceUrl() {
  if (sourceUrl.value) {
    URL.revokeObjectURL(sourceUrl.value);
    sourceUrl.value = "";
  }
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Failed to load image."));
    image.src = url;
  });
}
</script>

<style scoped>
.cropperOverlay {
  position: fixed;
  inset: 0;
  z-index: 1200;
  display: grid;
  place-items: center;
  background: rgba(0, 0, 0, 0.52);
  padding: 16px;
}

.cropperModal {
  width: min(640px, 100%);
  max-height: calc(100vh - 32px);
  border-radius: 28px;
  background: #fffaf5;
  padding: 20px;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.24);
  overflow: auto;
}

.cropperModal__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.cropperModal__head h2 {
  margin: 0;
  color: #31261f;
  font-size: 1.8rem;
}

.cropperModal__head p {
  margin: 8px 0 0;
  color: #826e61;
  line-height: 1.45;
}

.cropperModal__close {
  width: 40px;
  height: 40px;
  border: 0;
  border-radius: 999px;
  background: #f1e8df;
  color: #5a4a3f;
  cursor: pointer;
}

.cropperStage {
  margin-top: 16px;
}

.cropperPreview {
  width: 100%;
  max-height: min(46vh, 420px);
  border-radius: 22px;
  border: 2px dashed #ef8358;
  background-color: #f2ede7;
  overflow: hidden;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.45);
}

.cropperControls {
  margin-top: 14px;
  display: grid;
  gap: 12px;
}

.cropperControl {
  display: grid;
  gap: 8px;
  padding: 12px 14px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.7);
  color: #6c5c50;
  font-size: 0.95rem;
  font-weight: 600;
}

.cropperControl input {
  width: 100%;
  accent-color: #f08b62;
}

.cropperError {
  margin: 14px 0 0;
  color: #bc4d3a;
}

.cropperActions {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.cropperBtn {
  border: 0;
  border-radius: 999px;
  padding: 12px 18px;
  min-height: 48px;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}

.cropperBtn--secondary {
  background: #efe5db;
  color: #5a493d;
}

.cropperBtn--primary {
  background: #ef8358;
  color: #fff;
}

.cropperBtn:disabled {
  cursor: wait;
  opacity: 0.8;
}

@media (max-width: 640px) {
  .cropperOverlay {
    align-items: end;
    padding: 0;
    background: rgba(0, 0, 0, 0.58);
  }

  .cropperModal {
    width: 100%;
    max-height: min(92vh, 100dvh);
    padding: 18px 16px calc(16px + env(safe-area-inset-bottom));
    border-radius: 28px 28px 0 0;
    box-shadow: 0 -18px 48px rgba(0, 0, 0, 0.24);
  }

  .cropperModal__head {
    align-items: flex-start;
    padding-bottom: 12px;
    margin-bottom: 6px;
  }

  .cropperModal__head h2 {
    font-size: 1.45rem;
    line-height: 1.1;
  }

  .cropperModal__head p {
    margin-top: 10px;
    max-width: 20ch;
    font-size: 0.98rem;
  }

  .cropperPreview {
    max-height: min(34vh, 300px);
    border-radius: 20px;
  }

  .cropperControls {
    gap: 10px;
  }

  .cropperControl {
    gap: 10px;
    padding: 12px;
    font-size: 1rem;
  }

  .cropperControl span {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .cropperControl input {
    min-height: 32px;
  }

  .cropperError {
    margin-top: 12px;
    padding: 12px 14px;
    border-radius: 16px;
    background: rgba(188, 77, 58, 0.08);
  }

  .cropperActions {
    margin: 18px 0 0;
    padding: 0 0 calc(env(safe-area-inset-bottom) + 4px);
    flex-direction: column;
    gap: 10px;
  }

  .cropperBtn {
    width: 100%;
  }
}
</style>
