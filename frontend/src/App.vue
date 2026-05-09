<template>
  <AppHeader v-if="!route.meta.hideLayout" />
  <router-view />
  <AuthRequiredModal v-if="isAuthRequiredModalOpen" />
  <AppFooter v-if="!route.meta.hideLayout" />
  <GlobalChatWidget v-if="!route.meta.hideLayout" />
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import AppHeader from './components/common/AppHeader.vue'
import AuthRequiredModal from './components/auth/AuthRequiredModal.vue'
import AppFooter from './components/common/AppFooter.vue'
import GlobalChatWidget from './components/common/GlobalChatWidget.vue'
import { useRoute } from 'vue-router'
import { useUser } from './modules/auth/useUser'
import { useAuthRequiredModal } from './composables/useAuthRequiredModal'

const route = useRoute()
const { fetchCurrentUser, initialized } = useUser()
const { isAuthRequiredModalOpen } = useAuthRequiredModal()

onMounted(() => {
  if (!initialized.value) {
    void fetchCurrentUser()
  }
})
</script>

<style>
</style>
