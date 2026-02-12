<template>
  <div class="lecture-renderer q-gutter-lg">
    <template v-for="(block, index) in blocks" :key="`${block.type}-${index}`">
      <p v-if="block.type === 'paragraph'" class="text-body1">
        {{ block.content }}
      </p>

      <q-card v-else-if="block.type === 'task_text'" flat bordered>
        <q-card-section>
          <div class="text-subtitle1 text-weight-medium">{{ block.question }}</div>
          <q-input
            model-value=""
            type="textarea"
            outlined
            autogrow
            readonly
            label="Ваш ответ"
          />
        </q-card-section>
      </q-card>

      <q-card v-else-if="block.type === 'task_single_choice'" flat bordered>
        <q-card-section>
          <div class="text-subtitle1 text-weight-medium q-mb-sm">{{ block.question }}</div>
          <q-option-group
            :model-value="null"
            :options="toOptionGroup(block.options)"
            type="radio"
            disable
          />
        </q-card-section>
      </q-card>

      <q-card v-else-if="block.type === 'task_multi_choice'" flat bordered>
        <q-card-section>
          <div class="text-subtitle1 text-weight-medium q-mb-sm">{{ block.question }}</div>
          <q-option-group
            :model-value="[]"
            :options="toOptionGroup(block.options)"
            type="checkbox"
            disable
          />
        </q-card-section>
      </q-card>

      <q-card v-else-if="block.type === 'task_matching'" flat bordered>
        <q-card-section>
          <div class="text-subtitle1 text-weight-medium q-mb-sm">{{ block.question }}</div>
          <q-list bordered separator>
            <q-item v-for="(pair, pairIndex) in block.pairs || []" :key="pairIndex">
              <q-item-section>{{ pair.left }}</q-item-section>
              <q-item-section side class="text-grey-7">→</q-item-section>
              <q-item-section>{{ pair.right }}</q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>

      <q-card v-else-if="block.type === 'task_drag_drop'" flat bordered>
        <q-card-section>
          <div class="text-subtitle1 text-weight-medium q-mb-sm">{{ block.question }}</div>
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <div class="text-caption text-grey-7 q-mb-xs">Элементы</div>
              <q-list bordered separator>
                <q-item v-for="(item, itemIndex) in block.items || []" :key="itemIndex">
                  <q-item-section>{{ item }}</q-item-section>
                </q-item>
              </q-list>
            </div>
            <div class="col-12 col-md-6">
              <div class="text-caption text-grey-7 q-mb-xs">Зоны</div>
              <q-list bordered separator>
                <q-item v-for="(target, targetIndex) in block.targets || []" :key="targetIndex">
                  <q-item-section>{{ target }}</q-item-section>
                </q-item>
              </q-list>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <q-card v-else-if="block.type === 'task_algorithm'" flat bordered>
        <q-card-section>
          <div class="text-subtitle1 text-weight-medium q-mb-sm">{{ block.question }}</div>
          <q-list bordered separator>
            <q-item v-for="(step, stepIndex) in block.steps || []" :key="stepIndex">
              <q-item-section avatar>
                <q-badge color="primary" rounded>{{ stepIndex + 1 }}</q-badge>
              </q-item-section>
              <q-item-section>{{ step }}</q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>

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
const toOptionGroup = (options = []) => {
  return options.map((option) => ({
    label: option,
    value: option
  }))
}

defineProps({
  blocks: {
    type: Array,
    required: true
  }
})
</script>
