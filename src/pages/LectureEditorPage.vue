<template>
  <q-page class="q-pa-md">
    <div class="row q-col-gutter-md">
      <div class="col-12 col-lg-7">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-h6">Конструктор лекции</div>
            <div class="text-caption text-grey-7">Добавляйте блоки и меняйте порядок стрелками.</div>
          </q-card-section>
          <q-separator />

          <q-card-section class="q-gutter-md">
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-5">
                <q-input v-model="form.id" outlined label="ID лекции" />
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

            <div
              v-for="(block, index) in form.blocks"
              :key="index"
              class="editor-block"
            >
              <div class="row q-col-gutter-sm items-start">
                <div class="col-12 col-md-3">
                  <q-select
                    v-model="block.type"
                    :options="blockTypeOptions"
                    outlined
                    emit-value
                    map-options
                    label="Тип"
                    @update:model-value="changeBlockType(index, $event)"
                  />
                </div>

                <div class="col-12 col-md-7">
                  <q-input
                    v-if="['paragraph', 'heading', 'subheading', 'note', 'quote'].includes(block.type)"
                    v-model="block.content"
                    outlined
                    autogrow
                    type="textarea"
                    label="Содержимое"
                  />

                  <template v-else-if="block.type === 'bullet_list'">
                    <q-input
                      v-for="(item, itemIndex) in block.items"
                      :key="itemIndex"
                      v-model="block.items[itemIndex]"
                      outlined
                      class="q-mt-sm"
                      :label="`Пункт ${itemIndex + 1}`"
                    />
                    <div class="row q-gutter-sm q-mt-sm">
                      <q-btn flat icon="add" color="primary" label="Пункт" @click="block.items.push('')" />
                      <q-btn flat icon="remove" color="negative" label="Удалить" @click="removeArrayItem(block.items, block.items.length - 1, 1)" />
                    </div>
                  </template>

                  <template v-else-if="block.type === 'task_text'">
                    <q-input v-model="block.question" outlined label="Вопрос" />
                    <q-input v-model="block.expectedAnswer" outlined class="q-mt-sm" label="Ожидаемый ответ" />
                  </template>

                  <template v-else-if="block.type === 'task_single_choice'">
                    <q-input v-model="block.question" outlined label="Вопрос" />
                    <q-input
                      v-for="(option, optionIndex) in block.options"
                      :key="optionIndex"
                      v-model="block.options[optionIndex]"
                      outlined
                      class="q-mt-sm"
                      :label="`Вариант ${optionIndex + 1}`"
                    />
                    <div class="row q-gutter-sm q-mt-sm">
                      <q-btn flat icon="add" color="primary" label="Добавить" @click="block.options.push('')" />
                      <q-btn flat icon="remove" color="negative" label="Удалить" @click="removeArrayItem(block.options, block.options.length - 1, 2)" />
                    </div>
                    <q-select
                      v-model="block.correctIndex"
                      outlined
                      class="q-mt-sm"
                      emit-value
                      map-options
                      :options="toIndexedOptions(block.options)"
                      label="Правильный вариант"
                    />
                  </template>

                  <template v-else-if="block.type === 'task_multi_choice'">
                    <q-input v-model="block.question" outlined label="Вопрос" />
                    <q-input
                      v-for="(option, optionIndex) in block.options"
                      :key="optionIndex"
                      v-model="block.options[optionIndex]"
                      outlined
                      class="q-mt-sm"
                      :label="`Вариант ${optionIndex + 1}`"
                    />
                    <div class="row q-gutter-sm q-mt-sm">
                      <q-btn flat icon="add" color="primary" label="Добавить" @click="block.options.push('')" />
                      <q-btn flat icon="remove" color="negative" label="Удалить" @click="removeArrayItem(block.options, block.options.length - 1, 2)" />
                    </div>
                    <q-option-group
                      v-model="block.correctIndices"
                      class="q-mt-sm"
                      :options="toIndexedOptions(block.options)"
                      type="checkbox"
                    />
                  </template>

                  <template v-else-if="block.type === 'task_matching'">
                    <q-input v-model="block.question" outlined label="Вопрос" />
                    <q-card v-for="(pair, pairIndex) in block.pairs" :key="pairIndex" flat bordered class="q-pa-sm q-mt-sm">
                      <q-input v-model="pair.left" outlined :label="`Термин ${pairIndex + 1}`" />
                      <q-input v-model="pair.right" class="q-mt-sm" outlined :label="`Определение ${pairIndex + 1}`" />
                    </q-card>
                    <div class="row q-gutter-sm q-mt-sm">
                      <q-btn flat icon="add" color="primary" label="Пара" @click="block.pairs.push({ left: '', right: '' })" />
                      <q-btn flat icon="remove" color="negative" label="Удалить" @click="removeArrayItem(block.pairs, block.pairs.length - 1, 1)" />
                    </div>
                  </template>

                  <template v-else-if="block.type === 'task_drag_drop'">
                    <q-input v-model="block.question" outlined label="Вопрос" />
                    <div class="text-caption q-mt-sm">Элементы</div>
                    <q-input v-for="(item, itemIndex) in block.items" :key="itemIndex" v-model="block.items[itemIndex]" outlined class="q-mt-sm" :label="`Элемент ${itemIndex + 1}`" />
                    <div class="text-caption q-mt-sm">Зоны</div>
                    <q-input v-for="(target, targetIndex) in block.targets" :key="targetIndex" v-model="block.targets[targetIndex]" outlined class="q-mt-sm" :label="`Зона ${targetIndex + 1}`" />
                    <div class="row q-gutter-sm q-mt-sm">
                      <q-btn flat icon="add" color="primary" label="Элемент" @click="block.items.push('')" />
                      <q-btn flat icon="add" color="secondary" label="Зона" @click="block.targets.push('')" />
                    </div>
                    <q-select
                      v-model="block.correctTargets"
                      class="q-mt-sm"
                      multiple
                      outlined
                      emit-value
                      map-options
                      :options="toIndexedOptions(block.targets)"
                      label="Правильные зоны по порядку"
                    />
                  </template>

                  <template v-else-if="block.type === 'task_algorithm'">
                    <q-input v-model="block.question" outlined label="Задание" />
                    <q-input
                      v-for="(step, stepIndex) in block.expectedSteps"
                      :key="stepIndex"
                      v-model="block.expectedSteps[stepIndex]"
                      outlined
                      class="q-mt-sm"
                      :label="`Ключевой шаг ${stepIndex + 1}`"
                    />
                    <div class="row q-gutter-sm q-mt-sm">
                      <q-btn flat icon="add" color="primary" label="Шаг" @click="block.expectedSteps.push('')" />
                      <q-btn flat icon="remove" color="negative" label="Удалить" @click="removeArrayItem(block.expectedSteps, block.expectedSteps.length - 1, 1)" />
                    </div>
                  </template>
                </div>

                <div class="col-12 col-md-2">
                  <div class="column q-gutter-xs">
                    <q-btn flat round icon="keyboard_arrow_up" @click="moveBlock(index, -1)" />
                    <q-btn flat round icon="keyboard_arrow_down" @click="moveBlock(index, 1)" />
                    <q-btn flat round color="negative" icon="delete" @click="removeBlock(index)" />
                  </div>
                </div>
              </div>
            </div>

            <q-btn-dropdown color="primary" icon="add" label="Добавить блок">
              <q-list>
                <q-item
                  v-for="option in blockTypeOptions"
                  :key="option.value"
                  clickable
                  v-close-popup
                  @click="addBlock(option.value)"
                >
                  <q-item-section>{{ option.label }}</q-item-section>
                </q-item>
              </q-list>
            </q-btn-dropdown>

            <div class="row q-gutter-sm">
              <q-btn color="positive" icon="save" label="Сохранить лекцию" @click="saveLecture" />
              <q-btn flat color="secondary" icon="refresh" label="Сбросить" @click="resetForm" />
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-lg-5">
        <q-card flat bordered>
          <q-tabs v-model="rightTab" dense class="text-primary" align="justify">
            <q-tab name="preview" label="Предпросмотр" />
            <q-tab name="json" label="JSON" />
          </q-tabs>
          <q-separator />
          <q-tab-panels v-model="rightTab" animated>
            <q-tab-panel name="preview">
              <div class="text-subtitle1">{{ previewLecture.title || 'Без названия' }}</div>
              <div class="text-caption q-mb-md">{{ previewLecture.id || 'no-id' }}</div>
              <LectureRenderer :blocks="previewLecture.blocks" :lecture-id="previewLecture.id" />
            </q-tab-panel>
            <q-tab-panel name="json">
              <q-input :model-value="jsonPreview" readonly type="textarea" autogrow outlined input-style="font-family: monospace; min-height: 320px" />
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
  { value: 'heading', label: 'Заголовок' },
  { value: 'subheading', label: 'Подзаголовок' },
  { value: 'paragraph', label: 'Абзац' },
  { value: 'note', label: 'Примечание' },
  { value: 'quote', label: 'Цитата' },
  { value: 'bullet_list', label: 'Список' },
  { value: 'task_text', label: 'Задание: написать ответ' },
  { value: 'task_single_choice', label: 'Задание: выбор одного ответа' },
  { value: 'task_multi_choice', label: 'Задание: выбор нескольких ответов' },
  { value: 'task_matching', label: 'Задание: сопоставление' },
  { value: 'task_drag_drop', label: 'Задание: drag and drop' },
  { value: 'task_algorithm', label: 'Задание: написать алгоритм' }
]

const createBlockByType = (type) => {
  if (type === 'heading') return { type, content: 'Новый заголовок' }
  if (type === 'subheading') return { type, content: 'Новый подзаголовок' }
  if (type === 'paragraph') return { type, content: 'Новый абзац' }
  if (type === 'note') return { type, content: 'Текст примечания' }
  if (type === 'quote') return { type, content: 'Текст цитаты' }
  if (type === 'bullet_list') return { type, items: ['Пункт 1'] }
  if (type === 'task_text') return { type, question: 'Введите ответ', expectedAnswer: '' }
  if (type === 'task_single_choice') return { type, question: 'Выберите один ответ', options: ['Вариант 1', 'Вариант 2'], correctIndex: 0 }
  if (type === 'task_multi_choice') return { type, question: 'Выберите несколько ответов', options: ['Вариант 1', 'Вариант 2'], correctIndices: [0] }
  if (type === 'task_matching') return { type, question: 'Сопоставьте термин и определение', pairs: [{ left: 'Термин', right: 'Определение' }] }
  if (type === 'task_drag_drop') return { type, question: 'Распределите элементы', items: ['Элемент 1'], targets: ['Зона 1'], correctTargets: [0] }
  if (type === 'task_algorithm') return { type, question: 'Опишите алгоритм', expectedSteps: ['Шаг 1'] }
  return { type }
}

const createInitialForm = () => ({
  id: `lecture-${Date.now()}`,
  title: 'Новая лекция',
  progress: 0,
  blocks: [createBlockByType('heading'), createBlockByType('paragraph')]
})

const form = reactive(createInitialForm())
const rightTab = ref('preview')

const previewLecture = computed(() => ({
  id: form.id.trim(),
  title: form.title.trim(),
  progress: Number(form.progress) || 0,
  blocks: form.blocks
}))

const jsonPreview = computed(() => JSON.stringify(previewLecture.value, null, 2))

const toIndexedOptions = (items = []) => items.map((item, index) => ({ label: item || `Пункт ${index + 1}`, value: index }))

const addBlock = (type) => form.blocks.push(createBlockByType(type))
const changeBlockType = (index, type) => { form.blocks[index] = createBlockByType(type) }

const moveBlock = (index, delta) => {
  const target = index + delta
  if (target < 0 || target >= form.blocks.length) return

  const [block] = form.blocks.splice(index, 1)
  form.blocks.splice(target, 0, block)
}

const removeArrayItem = (arr, index, minLength) => {
  if (arr.length <= minLength) {
    Notify.create({ type: 'warning', message: 'Нельзя удалить последний обязательный элемент.' })
    return
  }
  arr.splice(index, 1)
}

const removeBlock = (index) => {
  if (form.blocks.length <= 1) {
    Notify.create({ type: 'warning', message: 'В лекции должен остаться хотя бы один блок.' })
    return
  }
  form.blocks.splice(index, 1)
}

const resetForm = () => {
  const initial = createInitialForm()
  form.id = initial.id
  form.title = initial.title
  form.progress = initial.progress
  form.blocks = initial.blocks
}

const saveLecture = () => {
  if (!previewLecture.value.id || !previewLecture.value.title) {
    Notify.create({ type: 'negative', message: 'Укажите ID и название лекции.' })
    return
  }

  upsertCustomLecture(previewLecture.value)
  Notify.create({ type: 'positive', message: 'Лекция сохранена.' })
}
</script>

<style scoped>
.editor-block {
  border: 1px solid #111;
  border-radius: 8px;
  padding: 12px;
}
</style>
