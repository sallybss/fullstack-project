import { computed, ref, unref, type Ref } from "vue";

export function usePagination<T>(items: Ref<T[]> | Readonly<Ref<T[]>>, pageSize: number) {
  const page = ref(1);

  const totalItems = computed(() => unref(items).length);
  const totalPages = computed(() => Math.max(1, Math.ceil(totalItems.value / pageSize)));

  const pagedItems = computed(() => {
    const start = (page.value - 1) * pageSize;
    return unref(items).slice(start, start + pageSize);
  });

  function syncPageWithinBounds() {
    if (page.value > totalPages.value) {
      page.value = totalPages.value;
    }
  }

  function resetPage() {
    page.value = 1;
  }

  return {
    page,
    totalItems,
    totalPages,
    pagedItems,
    syncPageWithinBounds,
    resetPage,
  };
}
