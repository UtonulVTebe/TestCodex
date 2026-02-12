<template>
  <q-page class="q-pa-md">
    <div class="row q-col-gutter-md">
      <div class="col-12 col-lg-6">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-h6">Черновик JSON-конфига лекции</div>
            <div class="text-caption text-grey-7">Временная страница создания/редактирования лекций</div>
          </q-card-section>

          <q-separator />

          <q-card-section>
            <q-input
              v-model="draftJson"
              type="textarea"
              autogrow
              outlined
              input-style="font-family: monospace; min-height: 320px"
            />
          </q-card-section>

          <q-card-actions align="right">
            <q-btn color="primary" label="Проверить JSON" @click="validateDraft" />
          </q-card-actions>
        </q-card>
      </div>

      <div class="col-12 col-lg-6">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-h6">Предпросмотр</div>
            <div class="text-caption text-grey-7">Рендер из введённого JSON</div>
          </q-card-section>
          <q-separator />
          <q-card-section v-if="parsedLecture">
            <div class="text-subtitle1">{{ parsedLecture.title }}</div>
            <div class="text-caption q-mb-md">{{ parsedLecture.id }}</div>
            <LectureRenderer :blocks="parsedLecture.blocks || []" />
          </q-card-section>
          <q-card-section v-else>
            <q-banner dense rounded class="bg-red-1 text-red-8">
              Невалидный JSON. Исправьте данные и нажмите «Проверить JSON».
            </q-banner>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { Notify } from 'quasar'
import LectureRenderer from 'src/components/LectureRenderer.vue'

const initialDraft = {
  id: 'lecture-001',
  title: 'Новая лекция',
  blocks: [
    {
      type: 'paragraph',
      content: 'Вводный абзац лекции. Здесь можно объяснить тему занятия.'
    }
  ]
}

const draftJson = ref(JSON.stringify(initialDraft, null, 2))
const parsedLecture = ref(initialDraft)

const validateDraft = () => {
  try {
    const parsed = JSON.parse(draftJson.value)
    parsedLecture.value = parsed

    Notify.create({
      type: 'positive',
      message: 'JSON валиден'
    })
  } catch {
    parsedLecture.value = null

    Notify.create({
      type: 'negative',
      message: 'JSON содержит ошибку'
    })
  }
}
</script>
