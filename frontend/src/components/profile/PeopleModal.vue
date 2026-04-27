<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import type { ProfilePerson } from "../../services/profileService";

const props = defineProps<{
  type: "followers" | "following";
  people: ProfilePerson[];
}>();

const emit = defineEmits<{
  close: [];
}>();

const router = useRouter();

const title = computed(() => (props.type === "followers" ? "Followers" : "Following"));
const emptyMessage = computed(() =>
  props.type === "followers" ? "No followers yet." : "Not following anyone yet.",
);

function close() {
  emit("close");
}

function openProfile(personId: string) {
  router.push({ name: "profile", params: { id: personId } });
  close();
}
</script>

<template>
  <div class="people-modal-overlay" @click.self="close">
    <div class="people-modal">
      <div class="people-modal__head">
        <h2>{{ title }}</h2>
        <button class="people-modal__close" type="button" @click="close">×</button>
      </div>

      <p v-if="people.length === 0" class="list-empty">
        {{ emptyMessage }}
      </p>

      <div v-else class="people-list">
        <button
          v-for="person in people"
          :key="person._id"
          class="people-row"
          type="button"
          @click="openProfile(person._id)"
        >
          {{ person.username }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.people-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: grid;
  place-items: center;
  z-index: 30;
}

.people-modal {
  width: min(460px, 92vw);
  max-height: min(70vh, 640px);
  overflow: auto;
  background: white;
  border-radius: 24px;
  padding: 20px;
}

.people-modal__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.people-modal__head h2 {
  margin: 0;
}

.people-modal__close {
  border: 0;
  background: transparent;
  font-size: 26px;
  cursor: pointer;
}

.people-list {
  margin-top: 16px;
  display: grid;
  gap: 10px;
}

.people-row {
  border: 1px solid #ececec;
  background: #fafafa;
  border-radius: 16px;
  padding: 14px 16px;
  text-align: left;
  cursor: pointer;
}

.list-empty {
  color: #888;
  margin: 12px 0 0;
}
</style>
