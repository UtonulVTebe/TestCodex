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
                <q-input
                  v-model="form.id"
                  outlined
                  label="ID лекции"
                  hint="Например: lecture-003"
                />
              </div>
              <div class="col-12 col-md-7">
                <q-input
                  v-model="form.title"
                  outlined
                  label="Название лекции"
                />
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

            <div class="text-subtitle2">Блоки контента</div>

            <q-card
              v-for="(block, index) in form.blocks"
              :key="index"
              flat
              bordered
              class="q-pa-sm"
            >
              <div class="row q-col-gutter-sm items-start">
                <div class="col-12 col-md-3">
                  <q-select
                    v-model="block.type"
                    :options="blockTypes"
                    outlined
                    label="Тип"
                  />
                </div>
                <div class="col-12 col-md-8">
                  <q-input
                    v-model="block.content"
                    outlined
                    autogrow
                    type="textarea"
                    label="Содержимое"
                  />
                </div>
                <div class="col-12 col-md-1 flex flex-center">
                  <q-btn
                    flat
                    round
                    color="negative"
                    icon="delete"
                    @click="removeBlock(index)"
                  />
                </div>
              </div>
            </q-card>

            <div class="row q-gutter-sm">
              <q-btn
                color="primary"
                flat
                icon="add"
                label="Добавить абзац"
                @click="addParagraph"
              />
              <q-btn
                color="positive"
                icon="save"
                label="Сохранить лекцию"
                @click="saveLecture"
              />
              <q-btn
                flat
                color="secondary"
                icon="refresh"
                label="Сбросить"
                @click="resetForm"
              />
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-lg-5">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-h6">Предпросмотр</div>
            <div class="text-caption text-grey-7">Так лекция будет выглядеть в приложении</div>
          </q-card-section>
          <q-separator />
          <q-card-section>
            <div class="text-subtitle1">{{ previewLecture.title || 'Без названия' }}</div>
            <div class="text-caption q-mb-md">{{ previewLecture.id || 'no-id' }}</div>
            <LectureRenderer :blocks="previewLecture.blocks" />
          </q-card-section>
        </q-card>

        <q-card flat bordered class="q-mt-md">
          <q-card-section>
            <div class="text-subtitle2">JSON (автоматически)</div>
          </q-card-section>
          <q-separator />
          <q-card-section>
            <q-input
              :model-value="jsonPreview"
              readonly
              type="textarea"
              autogrow
              outlined
              input-style="font-family: monospace; min-height: 220px"
            />
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { computed, reactive } from 'vue'
import { Notify } from 'quasar'
import LectureRenderer from 'src/components/LectureRenderer.vue'
import { upsertCustomLecture } from 'src/data/lectureStorage'

const blockTypes = ['paragraph']

const createInitialForm = () => {
  return {
    id: `lecture-${Date.now()}`,
    title: 'Новая лекция',
    progress: 0,
    blocks: [
      {
        type: 'paragraph',
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
    blocks: form.blocks.map((block) => ({
      type: block.type,
      content: block.content
    }))
  }
})

const jsonPreview = computed(() => JSON.stringify(previewLecture.value, null, 2))

const addParagraph = () => {
  form.blocks.push({
    type: 'paragraph',
    content: ''
  })
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

const resetForm = () => {
  const initial = createInitialForm()
  form.id = initial.id
  form.title = initial.title
  form.progress = initial.progress
  form.blocks = initial.blocks
}

const saveLecture = () => {
  if (!previewLecture.value.id || !previewLecture.value.title) {
    Notify.create({
      type: 'negative',
      message: 'Укажите ID и название лекции.'
    })
    return
  }

  const hasEmptyContent = previewLecture.value.blocks.some((block) => {
    return block.type === 'paragraph' && !block.content.trim()
  })

  if (hasEmptyContent) {
    Notify.create({
      type: 'negative',
      message: 'Заполните содержимое всех блоков.'
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
