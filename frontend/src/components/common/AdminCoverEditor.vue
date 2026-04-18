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
      <label class="coverEditor__label" :for="inputId">Cover image URL</label>
      <input
        :id="inputId"
        v-model.trim="draftUrl"
        class="coverEditor__input"
        type="url"
        placeholder="https://..."
      />

      <p v-if="errorMessage" class="coverEditor__error">{{ errorMessage }}</p>

      <div class="coverEditor__actions">
        <button class="coverEditor__secondary" type="button" @click="closePanel">
          Cancel
        </button>
        <button class="coverEditor__primary" type="button" :disabled="isSaving" @click="save">
          {{ isSaving ? "Saving..." : "Save" }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";

const props = defineProps<{
  settingKey: string;
  initialImageUrl: string;
}>();

const emit = defineEmits<{
  (e: "updated", imageUrl: string): void;
}>();

const API_URL = import.meta.env.VITE_API_URL;
const isAdmin = computed(() => localStorage.getItem("userRole") === "admin");
const inputId = `cover-editor-${props.settingKey}`;

const currentUrl = ref(props.initialImageUrl);
const draftUrl = ref(props.initialImageUrl);
const isSaving = ref(false);
const isOpen = ref(false);
const errorMessage = ref("");

watch(
  () => props.initialImageUrl,
  (nextValue) => {
    currentUrl.value = nextValue;
    if (!isOpen.value) {
      draftUrl.value = nextValue;
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
      draftUrl.value = savedUrl;
      emit("updated", savedUrl);
    }
  } catch {
    // Keep fallback image if settings request fails.
  }
}

function closePanel() {
  isOpen.value = false;
  draftUrl.value = currentUrl.value;
  errorMessage.value = "";
}

async function save() {
  if (!draftUrl.value) {
    errorMessage.value = "Please enter an image URL.";
    return;
  }

  try {
    isSaving.value = true;
    errorMessage.value = "";

    const response = await fetch(`${API_URL}/api/settings/hero/${encodeURIComponent(props.settingKey)}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "auth-token": localStorage.getItem("lsToken") || "",
      },
      body: JSON.stringify({ imageUrl: draftUrl.value }),
    });

    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(payload?.error || "Failed to update cover image.");
    }

    currentUrl.value = payload?.data?.imageUrl || draftUrl.value;
    emit("updated", currentUrl.value);
    closePanel();
  } catch (error) {
    errorMessage.value = (error as Error).message || "Failed to update cover image.";
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

.coverEditor__input {
  width: 100%;
  border: 1px solid #e5d8cc;
  border-radius: 12px;
  background: #fff;
  padding: 12px 14px;
  color: #2f2824;
  font: inherit;
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
