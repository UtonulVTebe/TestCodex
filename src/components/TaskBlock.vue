<template>
  <q-card flat bordered>
    <q-card-section>
      <div class="text-subtitle1 text-weight-medium q-mb-sm">{{ block.question }}</div>

      <template v-if="block.type === 'task_text'">
        <q-input v-model="textAnswer" type="textarea" outlined autogrow label="Ваш ответ" />
        <q-btn class="q-mt-sm" color="primary" label="Проверить" @click="checkTextTask" />
      </template>

      <template v-else-if="block.type === 'task_single_choice'">
        <q-option-group v-model="singleAnswer" :options="optionItems" type="radio" />
        <q-btn class="q-mt-sm" color="primary" label="Проверить" @click="checkSingleTask" />
      </template>

      <template v-else-if="block.type === 'task_multi_choice'">
        <q-option-group v-model="multiAnswer" :options="optionItems" type="checkbox" />
        <q-btn class="q-mt-sm" color="primary" label="Проверить" @click="checkMultiTask" />
      </template>

      <template v-else-if="block.type === 'task_matching'">
        <div v-for="(pair, index) in block.pairs || []" :key="`${pair.left}-${index}`" class="row q-col-gutter-sm q-mb-sm">
          <div class="col-12 col-md-5">
            <q-input :model-value="pair.left" outlined readonly />
          </div>
          <div class="col-12 col-md-7">
            <q-select
              v-model="matchingAnswers[index]"
              :options="matchingRightOptions"
              outlined
              emit-value
              map-options
              label="Выберите определение"
            />
          </div>
        </div>
        <q-btn class="q-mt-sm" color="primary" label="Проверить" @click="checkMatchingTask" />
      </template>

      <template v-else-if="block.type === 'task_drag_drop'">
        <div v-for="(item, index) in block.items || []" :key="`${item}-${index}`" class="row q-col-gutter-sm q-mb-sm">
          <div class="col-12 col-md-5">
            <q-input :model-value="item" outlined readonly />
          </div>
          <div class="col-12 col-md-7">
            <q-select
              v-model="dragDropAnswers[index]"
              :options="targetOptions"
              outlined
              emit-value
              map-options
              label="Куда поместить"
            />
          </div>
        </div>
        <q-btn class="q-mt-sm" color="primary" label="Проверить" @click="checkDragDropTask" />
      </template>

      <template v-else-if="block.type === 'task_algorithm'">
        <q-input
          v-model="algorithmAnswer"
          type="textarea"
          outlined
          autogrow
          label="Опишите алгоритм (каждый шаг с новой строки)"
        />
        <q-btn class="q-mt-sm" color="primary" label="Проверить" @click="checkAlgorithmTask" />
      </template>

      <q-banner v-if="resultMessage" :class="resultBannerClass" class="q-mt-md" rounded>
        {{ resultMessage }}
      </q-banner>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  block: {
    type: Object,
    required: true
  }
})

const resultMessage = ref('')
const isCorrect = ref(false)

const textAnswer = ref('')
const singleAnswer = ref(null)
const multiAnswer = ref([])
const matchingAnswers = ref([])
const dragDropAnswers = ref([])
const algorithmAnswer = ref('')

const optionItems = computed(() => {
  return (props.block.options || []).map((option, index) => ({
    label: option,
    value: index
  }))
})

const matchingRightOptions = computed(() => {
  return (props.block.pairs || []).map((pair, index) => ({
    label: pair.right,
    value: index
  }))
})

const targetOptions = computed(() => {
  return (props.block.targets || []).map((target, index) => ({
    label: target,
    value: index
  }))
})

const setResult = (correct, successText = 'Верно!', failText = 'Есть ошибки, попробуйте ещё раз.') => {
  isCorrect.value = correct
  resultMessage.value = correct ? successText : failText
}

const checkTextTask = () => {
  const expected = (props.block.expectedAnswer || '').trim().toLowerCase()
  const answer = textAnswer.value.trim().toLowerCase()

  if (!expected) {
    setResult(answer.length > 0, 'Ответ принят.', 'Введите ответ.')
    return
  }

  setResult(answer.includes(expected), 'Верно, ключевая мысль найдена.', 'Ответ не совпадает с ожидаемым.')
}

const checkSingleTask = () => {
  setResult(singleAnswer.value === props.block.correctIndex)
}

const checkMultiTask = () => {
  const selected = [...multiAnswer.value].sort((a, b) => a - b)
  const expected = [...(props.block.correctIndices || [])].sort((a, b) => a - b)
  const ok = selected.length === expected.length && selected.every((v, i) => v === expected[i])
  setResult(ok)
}

const checkMatchingTask = () => {
  const pairs = props.block.pairs || []
  const ok = pairs.every((pair, leftIndex) => matchingAnswers.value[leftIndex] === leftIndex)
  setResult(ok)
}

const checkDragDropTask = () => {
  const expected = props.block.correctTargets || []
  const ok = expected.length > 0 && expected.every((targetIndex, itemIndex) => dragDropAnswers.value[itemIndex] === targetIndex)
  setResult(ok)
}

const checkAlgorithmTask = () => {
  const entered = algorithmAnswer.value
    .split('\n')
    .map((line) => line.trim().toLowerCase())
    .filter(Boolean)

  const expected = (props.block.expectedSteps || [])
    .map((step) => String(step).trim().toLowerCase())
    .filter(Boolean)

  if (expected.length === 0) {
    setResult(entered.length > 0, 'Ответ принят.', 'Добавьте хотя бы один шаг.')
    return
  }

  const ok = expected.every((step) => entered.some((line) => line.includes(step)))
  setResult(ok)
}

const resultBannerClass = computed(() => {
  return isCorrect.value ? 'bg-green-1 text-green-9' : 'bg-red-1 text-red-9'
})
</script>
