<template>
  <q-page class="q-pa-md">
    <div class="row q-col-gutter-md">
      <div class="col-12 col-lg-7">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-h6">Конструктор лекции</div>
            <div class="text-caption text-grey-7">
              Создавайте лекцию через форму, без ручного редактирования JSON.
            </div>
          </q-card-section>

          <q-separator />

          <q-card-section class="q-gutter-md">
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-5">
                <q-input v-model="form.id" outlined label="ID лекции" hint="Например: lecture-003" />
              </div>
              <div class="col-12 col-md-7">
                <q-input v-model="form.title" outlined label="Название лекции" />
              </div>
            </div>

            <q-input
              v-model.number="form.progress"
              type="number"
              min="0"
              max="100"
              outlined
              label="Прогресс (%)"
            />

            <div class="row items-center justify-between">
              <div class="text-subtitle2">Блоки контента</div>
              <q-select
                v-model="selectedNewBlockType"
                :options="blockTypeOptions"
                emit-value
                map-options
                dense
                outlined
                label="Тип нового блока"
                class="new-block-type"
              />
            </div>

            <q-card v-for="(block, index) in form.blocks" :key="index" flat bordered class="q-pa-sm">
              <div class="row q-col-gutter-sm items-center q-mb-sm">
                <div class="col">
                  <div class="text-subtitle2">{{ index + 1 }}. {{ getBlockLabel(block.type) }}</div>
                </div>
                <div class="col-auto">
                  <q-btn flat round color="negative" icon="delete" @click="removeBlock(index)" />
                </div>
              </div>

              <q-input v-model="block.title" outlined dense label="Заголовок задания (необязательно)" class="q-mb-sm" />

              <template v-if="block.type === 'paragraph'">
                <q-input v-model="block.content" outlined autogrow type="textarea" label="Текст абзаца" />
              </template>

              <template v-else-if="block.type === 'task-text' || block.type === 'task-algorithm'">
                <q-input v-model="block.question" outlined autogrow type="textarea" label="Формулировка задания" />
              </template>

              <template v-else-if="block.type === 'task-single-choice' || block.type === 'task-multi-choice'">
                <q-input
                  v-model="block.question"
                  outlined
                  autogrow
                  type="textarea"
                  label="Формулировка задания"
                  class="q-mb-sm"
                />
                <div class="text-caption text-grey-7 q-mb-xs">Варианты ответа</div>
                <div v-for="(option, optionIndex) in block.options" :key="`o-${optionIndex}`" class="row q-col-gutter-sm q-mb-xs">
                  <div class="col">
                    <q-input v-model="block.options[optionIndex]" outlined dense :label="`Вариант ${optionIndex + 1}`" />
                  </div>
                  <div class="col-auto">
                    <q-btn
                      flat
                      round
                      color="negative"
                      icon="remove_circle"
                      @click="removeOption(block, optionIndex)"
                    />
                  </div>
                </div>
                <q-btn flat color="primary" icon="add" label="Добавить вариант" @click="addOption(block)" />
              </template>

              <template v-else-if="block.type === 'task-match'">
                <q-input
                  v-model="block.question"
                  outlined
                  autogrow
                  type="textarea"
                  label="Формулировка задания"
                  class="q-mb-sm"
                />
                <div class="text-caption text-grey-7 q-mb-xs">Пары для сопоставления</div>
                <div
                  v-for="(pair, pairIndex) in block.pairs"
                  :key="`p-${pairIndex}`"
                  class="row q-col-gutter-sm q-mb-xs"
                >
                  <div class="col-5">
                    <q-input v-model="pair.left" outlined dense label="Термин" />
                  </div>
                  <div class="col-5">
                    <q-input v-model="pair.right" outlined dense label="Определение" />
                  </div>
                  <div class="col-2 flex flex-center">
                    <q-btn flat round color="negative" icon="remove_circle" @click="removePair(block, pairIndex)" />
                  </div>
                </div>
                <q-btn flat color="primary" icon="add" label="Добавить пару" @click="addPair(block)" />
              </template>

              <template v-else-if="block.type === 'task-drag-drop'">
                <q-input
                  v-model="block.question"
                  outlined
                  autogrow
                  type="textarea"
                  label="Формулировка задания"
                  class="q-mb-sm"
                />

                <div class="text-caption text-grey-7 q-mb-xs">Элементы (что перетаскивать)</div>
                <div v-for="(item, itemIndex) in block.items" :key="`i-${itemIndex}`" class="row q-col-gutter-sm q-mb-xs">
                  <div class="col">
                    <q-input v-model="block.items[itemIndex]" outlined dense :label="`Элемент ${itemIndex + 1}`" />
                  </div>
                  <div class="col-auto">
                    <q-btn flat round color="negative" icon="remove_circle" @click="removeItem(block, itemIndex)" />
                  </div>
                </div>
                <q-btn flat color="primary" icon="add" label="Добавить элемент" @click="addItem(block)" class="q-mb-sm" />

                <div class="text-caption text-grey-7 q-mb-xs">Цели (куда перетаскивать)</div>
                <div
                  v-for="(target, targetIndex) in block.targets"
                  :key="`t-${targetIndex}`"
                  class="row q-col-gutter-sm q-mb-xs"
                >
                  <div class="col">
                    <q-input v-model="block.targets[targetIndex]" outlined dense :label="`Цель ${targetIndex + 1}`" />
                  </div>
                  <div class="col-auto">
                    <q-btn flat round color="negative" icon="remove_circle" @click="removeTarget(block, targetIndex)" />
                  </div>
                </div>
                <q-btn flat color="primary" icon="add" label="Добавить цель" @click="addTarget(block)" />
              </template>
            </q-card>

            <div class="row q-gutter-sm">
              <q-btn color="primary" flat icon="add" label="Добавить блок" @click="addBlock" />
              <q-btn color="positive" icon="save" label="Сохранить лекцию" @click="saveLecture" />
              <q-btn flat color="secondary" icon="refresh" label="Сбросить" @click="resetForm" />
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-lg-5">
        <q-card flat bordered>
          <q-tabs v-model="previewTab" dense align="left" class="text-primary">
            <q-tab name="preview" label="Превью" icon="visibility" />
            <q-tab name="json" label="JSON" icon="data_object" />
          </q-tabs>
          <q-separator />

          <q-tab-panels v-model="previewTab" animated>
            <q-tab-panel name="preview">
              <div class="text-subtitle1">{{ previewLecture.title || 'Без названия' }}</div>
              <div class="text-caption q-mb-md">{{ previewLecture.id || 'no-id' }}</div>
              <LectureRenderer :blocks="previewLecture.blocks" />
            </q-tab-panel>

            <q-tab-panel name="json">
              <q-input
                :model-value="jsonPreview"
                readonly
                type="textarea"
                autogrow
                outlined
                input-style="font-family: monospace; min-height: 340px"
              />
            </q-tab-panel>
          </q-tab-panels>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { Notify } from 'quasar'
import LectureRenderer from 'src/components/LectureRenderer.vue'
import { upsertCustomLecture } from 'src/data/lectureStorage'

const blockTypeOptions = [
  { label: 'Абзац', value: 'paragraph' },
  { label: 'Задание: написать ответ', value: 'task-text' },
  { label: 'Задание: выбор одного ответа', value: 'task-single-choice' },
  { label: 'Задание: выбор нескольких ответов', value: 'task-multi-choice' },
  { label: 'Задание: сопоставление', value: 'task-match' },
  { label: 'Задание: drag and drop', value: 'task-drag-drop' },
  { label: 'Задание: написать алгоритм', value: 'task-algorithm' }
]

const selectedNewBlockType = ref('paragraph')
const previewTab = ref('preview')

const createBlockByType = (type) => {
  if (type === 'paragraph') {
    return {
      type,
      title: '',
      content: ''
    }
  }

  if (type === 'task-single-choice' || type === 'task-multi-choice') {
    return {
      type,
      title: '',
      question: '',
      options: ['', '']
    }
  }

  if (type === 'task-match') {
    return {
      type,
      title: '',
      question: '',
      pairs: [
        { left: '', right: '' },
        { left: '', right: '' }
      ]
    }
  }

  if (type === 'task-drag-drop') {
    return {
      type,
      title: '',
      question: '',
      items: ['', ''],
      targets: ['', '']
    }
  }

  return {
    type,
    title: '',
    question: ''
  }
}

const createInitialForm = () => {
  return {
    id: `lecture-${Date.now()}`,
    title: 'Новая лекция',
    progress: 0,
    blocks: [
      {
        type: 'paragraph',
        title: '',
        content: 'Вводный абзац лекции. Здесь можно объяснить тему занятия.'
      }
    ]
  }
}

const form = reactive(createInitialForm())

const previewLecture = computed(() => {
  return {
    id: form.id.trim(),
    title: form.title.trim(),
    progress: Number(form.progress) || 0,
    blocks: form.blocks.map((block) => ({ ...block }))
  }
})

const jsonPreview = computed(() => JSON.stringify(previewLecture.value, null, 2))

const getBlockLabel = (type) => {
  return blockTypeOptions.find((option) => option.value === type)?.label || type
}

const addBlock = () => {
  form.blocks.push(createBlockByType(selectedNewBlockType.value))
}

const removeBlock = (index) => {
  if (form.blocks.length === 1) {
    Notify.create({
      type: 'warning',
      message: 'В лекции должен остаться хотя бы один блок.'
    })
    return
  }

  form.blocks.splice(index, 1)
}

const addOption = (block) => block.options.push('')
const removeOption = (block, index) => {
  if (block.options.length <= 2) {
    Notify.create({ type: 'warning', message: 'Оставьте минимум 2 варианта.' })
    return
  }
  block.options.splice(index, 1)
}

const addPair = (block) => block.pairs.push({ left: '', right: '' })
const removePair = (block, index) => {
  if (block.pairs.length <= 1) {
    Notify.create({ type: 'warning', message: 'Оставьте минимум 1 пару.' })
    return
  }
  block.pairs.splice(index, 1)
}

const addItem = (block) => block.items.push('')
const removeItem = (block, index) => {
  if (block.items.length <= 1) {
    Notify.create({ type: 'warning', message: 'Оставьте минимум 1 элемент.' })
    return
  }
  block.items.splice(index, 1)
}

const addTarget = (block) => block.targets.push('')
const removeTarget = (block, index) => {
  if (block.targets.length <= 1) {
    Notify.create({ type: 'warning', message: 'Оставьте минимум 1 цель.' })
    return
  }
  block.targets.splice(index, 1)
}

const resetForm = () => {
  const initial = createInitialForm()
  form.id = initial.id
  form.title = initial.title
  form.progress = initial.progress
  form.blocks = initial.blocks
  previewTab.value = 'preview'
}

const blockHasRequiredData = (block) => {
  if (block.type === 'paragraph') {
    return Boolean(block.content?.trim())
  }

  if (block.type === 'task-single-choice' || block.type === 'task-multi-choice') {
    return Boolean(block.question?.trim()) && block.options.every((option) => option.trim())
  }

  if (block.type === 'task-match') {
    return Boolean(block.question?.trim()) && block.pairs.every((pair) => pair.left.trim() && pair.right.trim())
  }

  if (block.type === 'task-drag-drop') {
    return Boolean(block.question?.trim()) && block.items.every((item) => item.trim()) && block.targets.every((target) => target.trim())
  }

  return Boolean(block.question?.trim())
}

const saveLecture = () => {
  if (!previewLecture.value.id || !previewLecture.value.title) {
    Notify.create({
      type: 'negative',
      message: 'Укажите ID и название лекции.'
    })
    return
  }

  const hasInvalidBlock = previewLecture.value.blocks.some((block) => !blockHasRequiredData(block))
  if (hasInvalidBlock) {
    Notify.create({
      type: 'negative',
      message: 'Заполните все обязательные поля в блоках.'
    })
    return
  }

  upsertCustomLecture(previewLecture.value)

  Notify.create({
    type: 'positive',
    message: 'Лекция сохранена. Откройте вкладку «Лекции».'
  })
}
</script>

<style scoped>
.new-block-type {
  width: 290px;
  max-width: 100%;
}
</style>
