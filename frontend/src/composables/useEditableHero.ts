import { computed, ref } from "vue";

export function useEditableHero(initialImageUrl: string, overlay: string) {
  const heroImageUrl = ref(initialImageUrl);

  const heroBackgroundStyle = computed(() => ({
    backgroundImage: `${overlay}, url(${heroImageUrl.value})`,
  }));

  function updateHeroImage(nextImageUrl: string) {
    heroImageUrl.value = nextImageUrl;
  }

  return {
    heroImageUrl,
    heroBackgroundStyle,
    updateHeroImage,
  };
}
