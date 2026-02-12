<template>
  <div class="lecture-renderer q-gutter-lg">
    <template v-for="(block, index) in blocks" :key="`${block.type}-${index}`">
      <p v-if="block.type === 'paragraph'" class="text-body1">
        {{ block.content }}
      </p>

      <q-card v-else-if="block.type === 'task-text'" flat bordered>
        <q-card-section>
          <div class="text-subtitle1">{{ block.title || 'Задание: написать ответ' }}</div>
          <div class="text-body2 q-mt-sm">{{ block.question }}</div>
          <q-input class="q-mt-md" outlined type="textarea" label="Ваш ответ" readonly />
        </q-card-section>
      </q-card>

      <q-card v-else-if="block.type === 'task-single-choice'" flat bordered>
        <q-card-section>
          <div class="text-subtitle1">{{ block.title || 'Задание: выбор одного ответа' }}</div>
          <div class="text-body2 q-mt-sm">{{ block.question }}</div>
          <q-option-group
            class="q-mt-md"
            type="radio"
            :options="toChoiceOptions(block.options)"
            :model-value="null"
            disable
          />
        </q-card-section>
      </q-card>

      <q-card v-else-if="block.type === 'task-multi-choice'" flat bordered>
        <q-card-section>
          <div class="text-subtitle1">{{ block.title || 'Задание: выбор нескольких ответов' }}</div>
          <div class="text-body2 q-mt-sm">{{ block.question }}</div>
          <q-option-group
            class="q-mt-md"
            type="checkbox"
            :options="toChoiceOptions(block.options)"
            :model-value="[]"
            disable
          />
        </q-card-section>
      </q-card>

      <q-card v-else-if="block.type === 'task-match'" flat bordered>
        <q-card-section>
          <div class="text-subtitle1">{{ block.title || 'Задание: сопоставление' }}</div>
          <div class="text-body2 q-mt-sm">{{ block.question }}</div>

          <div class="q-mt-md q-gutter-sm">
            <q-chip
              v-for="(pair, pairIndex) in block.pairs || []"
              :key="`pair-${pairIndex}`"
              color="blue-1"
              text-color="blue-10"
            >
              {{ pair.left }} → {{ pair.right }}
            </q-chip>
          </div>
        </q-card-section>
      </q-card>

      <q-card v-else-if="block.type === 'task-drag-drop'" flat bordered>
        <q-card-section>
          <div class="text-subtitle1">{{ block.title || 'Задание: drag and drop' }}</div>
          <div class="text-body2 q-mt-sm">{{ block.question }}</div>

          <div class="q-mt-md row q-col-gutter-sm">
            <div class="col-12 col-md-6">
              <div class="text-caption text-grey-7 q-mb-xs">Перетаскиваемые элементы</div>
              <q-chip v-for="(item, itemIndex) in block.items || []" :key="`item-${itemIndex}`" class="q-mr-xs q-mb-xs">
                {{ item }}
              </q-chip>
            </div>
            <div class="col-12 col-md-6">
              <div class="text-caption text-grey-7 q-mb-xs">Цели</div>
              <q-list bordered separator dense>
                <q-item v-for="(target, targetIndex) in block.targets || []" :key="`target-${targetIndex}`">
                  <q-item-section>{{ target }}</q-item-section>
                </q-item>
              </q-list>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <q-card v-else-if="block.type === 'task-algorithm'" flat bordered>
        <q-card-section>
          <div class="text-subtitle1">{{ block.title || 'Задание: написать алгоритм' }}</div>
          <div class="text-body2 q-mt-sm">{{ block.question }}</div>
          <q-input
            class="q-mt-md"
            outlined
            type="textarea"
            label="Опишите алгоритм по шагам"
            readonly
          />
        </q-card-section>
      </q-card>

      <q-banner v-else dense rounded class="bg-orange-1 text-orange-10">
        Неподдерживаемый тип блока: {{ block.type }}
      </q-banner>
    </template>
  </div>
</template>

<script setup>
const toChoiceOptions = (options = []) => {
  return options.map((option, index) => ({
    label: option,
    value: index
  }))
}

defineProps({
  blocks: {
    type: Array,
    required: true
  }
})
</script>
