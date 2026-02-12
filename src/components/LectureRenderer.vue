<template>
  <div class="lecture-renderer q-gutter-md">
    <template v-for="(block, index) in blocks" :key="`${block.type}-${index}`">
      <p v-if="block.type === 'paragraph'" class="text-body1">
        {{ block.content }}
      </p>

      <q-banner
        v-else
        dense
        rounded
        class="bg-orange-1 text-orange-10"
      >
        Неподдерживаемый тип блока: {{ block.type }}
      </q-banner>
    </template>
  </div>
</template>

<script setup>
defineProps({
  blocks: {
    type: Array,
    required: true
  }
})
</script>
