<template>
  <button
    :type="type"
    :class="['btn', `btn--${variant}`]"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: "primary" | "outline" | "ghost";
    type?: "button" | "submit" | "reset";
  }>(),
  {
    variant: "primary",
    type: "button",
  }
);
</script>

<style scoped>
.btn {
  height: 40px;
  padding: 0 24px;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.2s ease;
}

/* PRIMARY */
.btn--primary {
  background: var(--accent);
  color: white;
  border: none;
}

.btn--primary:hover {
  background: #e96542;
}

/* OUTLINE */
.btn--outline {
  background: transparent;
  color: var(--accent);
  border: 1px solid var(--accent);
}

.btn--outline:hover {
  background: var(--accent);
  color: white;
}

/* GHOST */
.btn--ghost {
  background: transparent;
  border: none;
  color: var(--accent);
}
</style>