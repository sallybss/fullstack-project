<template>
  <AppHeader v-if="!route.meta.hideLayout" />
  <router-view />
  <AppFooter v-if="!route.meta.hideLayout" />
</template>

<script setup lang="ts">
import AppHeader from './components/common/AppHeader.vue'
import AppFooter from './components/common/AppFooter.vue'
import { useRoute } from 'vue-router'

const route = useRoute()
</script>

<style>
</style>