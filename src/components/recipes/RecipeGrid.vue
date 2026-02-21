<template><div class="grid"><slot /></div></template>

<style scoped>
.grid {
  display: grid;
  gap: 22px;
  grid-template-columns: repeat(4, 1fr);
}
@media (max-width: 1100px) { .grid { grid-template-columns: repeat(3, 1fr); } }
@media (max-width: 820px)  { .grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 520px)  { .grid { grid-template-columns: 1fr; } }
</style>