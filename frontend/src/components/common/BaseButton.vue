<template>
  <button
    :type="type"
    :class="['btn', `btn--${variant}`]"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
defineProps({
  variant: {
    type: String,
    default: 'primary',
  },
  type: {
    type: String,
    default: 'button',
  }
})
</script>

<style scoped>
.btn {
  height: 48px;
  padding: 0 24px;
  border-radius: 999px;
  font-size: 16px;
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