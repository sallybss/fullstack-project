import { computed, ref, unref, watch, type Ref } from "vue";

export function usePagination<T>(
  items: Ref<T[]> | Readonly<Ref<T[]>>,
  pageSize: number | Ref<number> | Readonly<Ref<number>>,
) {
  const page = ref(1);

  const totalItems = computed(() => unref(items).length);
  const resolvedPageSize = computed(() => Math.max(1, unref(pageSize)));
  const totalPages = computed(() => Math.max(1, Math.ceil(totalItems.value / resolvedPageSize.value)));

  const pagedItems = computed(() => {
    const start = (page.value - 1) * resolvedPageSize.value;
    return unref(items).slice(start, start + resolvedPageSize.value);
  });

  function syncPageWithinBounds() {
    if (page.value > totalPages.value) {
      page.value = totalPages.value;
    }
  }

  function resetPage() {
    page.value = 1;
  }

  watch(totalPages, syncPageWithinBounds, { immediate: true });

  return {
    page,
    pageSize: resolvedPageSize,
    totalItems,
    totalPages,
    pagedItems,
    syncPageWithinBounds,
    resetPage,
  };
}
