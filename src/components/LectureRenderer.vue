<template>
  <div class="lecture-renderer q-gutter-lg">
    <template v-for="(block, index) in blocks" :key="`${block.type}-${index}`">
      <h2 v-if="block.type === 'heading'" class="text-h5 text-weight-bold q-mb-sm">
        {{ block.content }}
      </h2>

      <h3 v-else-if="block.type === 'subheading'" class="text-h6 text-weight-medium q-mb-xs">
        {{ block.content }}
      </h3>

      <p v-else-if="block.type === 'paragraph'" class="text-body1">
        {{ block.content }}
      </p>

      <q-banner
        v-else-if="block.type === 'note'"
        dense
        rounded
        class="bg-grey-2 text-dark"
      >
        {{ block.content }}
      </q-banner>

      <blockquote v-else-if="block.type === 'quote'" class="lecture-quote">
        “{{ block.content }}”
      </blockquote>

      <ul v-else-if="block.type === 'bullet_list'" class="q-pl-lg q-my-none">
        <li v-for="(item, itemIndex) in block.items || []" :key="itemIndex" class="q-mb-xs">
          {{ item }}
        </li>
      </ul>

      <TaskBlock
        v-else-if="taskTypes.includes(block.type)"
        :block="block"
        :lecture-id="lectureId"
        :block-index="index"
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
  },
  lectureId: {
    type: String,
    default: ''
  }
})
</script>

<style scoped>
.lecture-quote {
  margin: 0;
  padding: 8px 12px;
  border-left: 2px solid #111;
  color: #444;
  font-style: italic;
}
</style>
