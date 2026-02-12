<template>
  <q-page class="q-pa-md">
    <div class="row q-col-gutter-md">
      <div class="col-12 col-lg-7">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-h6">Конструктор лекции</div>
            <div class="text-caption text-grey-7">Настройте контент и правильные ответы заданий.</div>
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

            <q-input v-model.number="form.progress" type="number" min="0" max="100" outlined label="Прогресс (%)" />

            <q-card v-for="(block, index) in form.blocks" :key="index" flat bordered class="q-pa-sm">
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

                <div class="col-12 col-md-8">
                  <q-input v-if="block.type === 'paragraph'" v-model="block.content" outlined autogrow type="textarea" label="Текст абзаца" />

                  <template v-else-if="block.type === 'task_text'">
                    <q-input v-model="block.question" outlined label="Вопрос" />
                    <q-input v-model="block.expectedAnswer" outlined class="q-mt-sm" label="Ожидаемый ответ (для проверки)" />
                  </template>

                  <template v-else-if="block.type === 'task_single_choice'">
                    <q-input v-model="block.question" outlined label="Вопрос" />
                    <q-input v-for="(option, optionIndex) in block.options" :key="optionIndex" v-model="block.options[optionIndex]" outlined class="q-mt-sm" :label="`Вариант ${optionIndex + 1}`" />
                    <div class="row q-gutter-sm q-mt-sm">
                      <q-btn flat icon="add" color="primary" label="Добавить вариант" @click="block.options.push('')" />
                      <q-btn flat icon="remove" color="negative" label="Удалить вариант" @click="removeArrayItem(block.options, block.options.length - 1, 2)" />
                    </div>
                    <q-select v-model="block.correctIndex" class="q-mt-sm" outlined emit-value map-options :options="toIndexedOptions(block.options)" label="Правильный вариант" />
                  </template>

                  <template v-else-if="block.type === 'task_multi_choice'">
                    <q-input v-model="block.question" outlined label="Вопрос" />
                    <q-input v-for="(option, optionIndex) in block.options" :key="optionIndex" v-model="block.options[optionIndex]" outlined class="q-mt-sm" :label="`Вариант ${optionIndex + 1}`" />
                    <div class="row q-gutter-sm q-mt-sm">
                      <q-btn flat icon="add" color="primary" label="Добавить вариант" @click="block.options.push('')" />
                      <q-btn flat icon="remove" color="negative" label="Удалить вариант" @click="removeArrayItem(block.options, block.options.length - 1, 2)" />
                    </div>
                    <q-option-group v-model="block.correctIndices" class="q-mt-sm" :options="toIndexedOptions(block.options)" type="checkbox" />
                  </template>

                  <template v-else-if="block.type === 'task_matching'">
                    <q-input v-model="block.question" outlined label="Вопрос" />
                    <q-card v-for="(pair, pairIndex) in block.pairs" :key="pairIndex" flat bordered class="q-pa-sm q-mt-sm">
                      <q-input v-model="pair.left" outlined :label="`Термин ${pairIndex + 1}`" />
                      <q-input v-model="pair.right" class="q-mt-sm" outlined :label="`Определение ${pairIndex + 1}`" />
                    </q-card>
                    <div class="row q-gutter-sm q-mt-sm">
                      <q-btn flat icon="add" color="primary" label="Добавить пару" @click="block.pairs.push({ left: '', right: '' })" />
                      <q-btn flat icon="remove" color="negative" label="Удалить пару" @click="removeArrayItem(block.pairs, block.pairs.length - 1, 1)" />
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
                      label="Правильные зоны по порядку элементов"
                    />
                  </template>

                  <template v-else-if="block.type === 'task_algorithm'">
                    <q-input v-model="block.question" outlined label="Задание" />
                    <q-input v-for="(step, stepIndex) in block.expectedSteps" :key="stepIndex" v-model="block.expectedSteps[stepIndex]" outlined class="q-mt-sm" :label="`Ключевой шаг ${stepIndex + 1}`" />
                    <div class="row q-gutter-sm q-mt-sm">
                      <q-btn flat icon="add" color="primary" label="Добавить шаг" @click="block.expectedSteps.push('')" />
                      <q-btn flat icon="remove" color="negative" label="Удалить шаг" @click="removeArrayItem(block.expectedSteps, block.expectedSteps.length - 1, 1)" />
                    </div>
                  </template>
                </div>

                <div class="col-12 col-md-1 flex flex-center">
                  <q-btn flat round color="negative" icon="delete" @click="removeBlock(index)" />
                </div>
              </div>
            </q-card>

            <q-btn-dropdown color="primary" icon="add" label="Добавить блок">
              <q-list>
                <q-item v-for="option in blockTypeOptions" :key="option.value" clickable v-close-popup @click="addBlock(option.value)">
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
              <LectureRenderer :blocks="previewLecture.blocks" />
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
  { value: 'paragraph', label: 'Абзац' },
  { value: 'task_text', label: 'Задание: написать ответ' },
  { value: 'task_single_choice', label: 'Задание: выбор одного ответа' },
  { value: 'task_multi_choice', label: 'Задание: выбор нескольких ответов' },
  { value: 'task_matching', label: 'Задание: сопоставление' },
  { value: 'task_drag_drop', label: 'Задание: drag and drop' },
  { value: 'task_algorithm', label: 'Задание: написать алгоритм' }
]

const createBlockByType = (type) => {
  if (type === 'paragraph') return { type, content: 'Новый абзац' }
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
  blocks: [createBlockByType('paragraph'), createBlockByType('task_text')]
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

const toIndexedOptions = (items = []) => {
  return items.map((item, index) => ({
    label: item || `Пункт ${index + 1}`,
    value: index
  }))
}

const addBlock = (type) => form.blocks.push(createBlockByType(type))
const changeBlockType = (index, type) => { form.blocks[index] = createBlockByType(type) }

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
