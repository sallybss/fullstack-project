import { computed, onBeforeUnmount, onMounted, ref } from "vue";

type PageSizeBreakpoint = {
  maxWidth: number;
  pageSize: number;
};

export function useResponsivePageSize(
  breakpoints: PageSizeBreakpoint[],
  defaultPageSize: number,
) {
  const viewportWidth = ref(typeof window === "undefined" ? 1200 : window.innerWidth);
  const sortedBreakpoints = [...breakpoints].sort((a, b) => a.maxWidth - b.maxWidth);

  const pageSize = computed(() => {
    const match = sortedBreakpoints.find((breakpoint) => viewportWidth.value <= breakpoint.maxWidth);
    return match?.pageSize ?? defaultPageSize;
  });

  function handleResize() {
    viewportWidth.value = window.innerWidth;
  }

  onMounted(() => {
    window.addEventListener("resize", handleResize);
  });

  onBeforeUnmount(() => {
    window.removeEventListener("resize", handleResize);
  });

  return {
    pageSize,
    viewportWidth,
  };
}
