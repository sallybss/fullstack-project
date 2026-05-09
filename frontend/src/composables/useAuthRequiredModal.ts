import { ref } from "vue";

const isAuthRequiredModalOpen = ref(false);

export function useAuthRequiredModal() {
  function openAuthRequiredModal() {
    isAuthRequiredModalOpen.value = true;
  }

  function closeAuthRequiredModal() {
    isAuthRequiredModalOpen.value = false;
  }

  return {
    isAuthRequiredModalOpen,
    openAuthRequiredModal,
    closeAuthRequiredModal,
  };
}
