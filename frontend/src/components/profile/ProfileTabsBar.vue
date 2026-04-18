<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";

const props = withDefaults(defineProps<{
  activeTab: "profile" | "advanced" | "admin";
  showAdmin?: boolean;
  backFallbackName?: string;
}>(), {
  showAdmin: false,
  backFallbackName: "home",
});

const router = useRouter();

const tabs = computed(() => {
  const baseTabs = [
    { key: "profile", label: "Profile", routeName: "my-profile" },
    { key: "advanced", label: "Advanced", routeName: "my-profile-advanced" },
  ];

  if (props.showAdmin) {
    baseTabs.push({ key: "admin", label: "Admin Panel", routeName: "admin-panel" });
  }

  return baseTabs;
});

function goBack(): void {
  if (window.history.length > 1) {
    router.back();
    return;
  }

  router.push({ name: props.backFallbackName });
}

function goTo(routeName: string): void {
  router.push({ name: routeName });
}
</script>

<template>
  <div class="tabs-bar">
    <button class="back" type="button" @click="goBack">
      <i class="pi pi-arrow-left"></i>
      <span>Go back</span>
    </button>

    <div class="tabs">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        class="tab"
        :class="{ 'is-active': activeTab === tab.key }"
        type="button"
        @click="goTo(tab.routeName)"
      >
        {{ tab.label }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.tabs-bar {
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-width: 240px;
}

.back {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  align-self: flex-start;
  border: 0;
  background: transparent;
  color: #666;
  padding: 0;
  margin: 0;
  cursor: pointer;
  font-size: 16px;
}

.back i {
  font-size: 20px;
}

.tabs {
  display: inline-flex;
  gap: 10px;
  flex-wrap: wrap;
}

.tab {
  border: 1px solid rgba(255, 114, 76, 0.35);
  background: #fff;
  color: #555;
  border-radius: 999px;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.tab.is-active {
  background: #ff724c;
  color: #fff;
  border-color: #ff724c;
}
</style>
