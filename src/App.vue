<template>
  <AppHeader />
  <RouterView />
  <AppFooter />
</template>

<script setup lang="ts">
import Button from 'primevue/button'
import Rating from 'primevue/rating'
import { ref } from 'vue'

import AppHeader from './components/common/AppHeader.vue'
import AppFooter from './components/common/AppFooter.vue'

const value = ref(3)
</script>


<style>

</style>