<template>
  <div class="lecture-renderer q-gutter-lg">
    <template v-for="(block, index) in blocks" :key="`${block.type}-${index}`">
      <p v-if="block.type === 'paragraph'" class="text-body1">
        {{ block.content }}
      </p>

      <TaskBlock
        v-else-if="taskTypes.includes(block.type)"
        :block="block"
      />

      <q-banner v-else dense rounded class="bg-orange-1 text-orange-10">
        Неподдерживаемый тип блока: {{ block.type }}
      </q-banner>
    </template>
  </div>
</template>

<script setup>
import TaskBlock from 'src/components/TaskBlock.vue'

const taskTypes = [
  'task_text',
  'task_single_choice',
  'task_multi_choice',
  'task_matching',
  'task_drag_drop',
  'task_algorithm'
]

defineProps({
  blocks: {
    type: Array,
    required: true
  }
})
</script>
