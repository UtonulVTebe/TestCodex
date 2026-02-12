<template>
  <q-page class="q-pa-md">
    <div class="row q-col-gutter-md lectures-page">
      <div class="col-12 col-md-8">
        <q-card flat bordered class="full-height">
          <q-card-section>
            <div class="text-h5">{{ selectedLecture?.title }}</div>
            <div class="text-caption text-grey-7">ID: {{ selectedLecture?.id }}</div>
          </q-card-section>

          <q-separator />

          <q-card-section>
            <LectureRenderer :blocks="selectedLecture?.blocks || []" :lecture-id="selectedLecture?.id || ''" />
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-4">
        <q-card flat bordered>
          <q-card-section class="row items-center justify-between">
            <div class="text-subtitle1 text-weight-medium">Список лекций</div>
            <q-btn dense flat icon="add" label="Создать" to="/lectures/edit" />
          </q-card-section>
          <q-separator />

          <q-list bordered separator>
            <q-item
              v-for="lecture in lectureList"
              :key="lecture.id"
              clickable
              :active="lecture.id === selectedLectureId"
              active-class="bg-primary text-white"
              @click="selectedLectureId = lecture.id"
            >
              <q-item-section>
                <q-item-label>{{ lecture.title }}</q-item-label>
                <q-item-label caption>{{ lecture.id }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { computed, onMounted, onBeforeUnmount, ref, watch } from 'vue'
import LectureRenderer from 'src/components/LectureRenderer.vue'
import lectures from 'src/data/lectures.json'
import { mergeLectures } from 'src/data/lectureStorage'
import { markLectureViewed } from 'src/data/progressStorage'

const lectureList = ref([])
const selectedLectureId = ref('')

const refreshLectures = () => {
  lectureList.value = mergeLectures(lectures)

  const hasSelected = lectureList.value.some((lecture) => lecture.id === selectedLectureId.value)

  if (!hasSelected) {
    selectedLectureId.value = lectureList.value[0]?.id || ''
  }
}

const selectedLecture = computed(() => {
  return lectureList.value.find((lecture) => lecture.id === selectedLectureId.value)
})

onMounted(() => {
  refreshLectures()
  window.addEventListener('focus', refreshLectures)
  window.addEventListener('lecture-progress-updated', refreshLectures)
})

onBeforeUnmount(() => {
  window.removeEventListener('focus', refreshLectures)
  window.removeEventListener('lecture-progress-updated', refreshLectures)
})

watch(selectedLectureId, (lectureId) => {
  markLectureViewed(lectureId)
})
</script>

<style scoped>
.lectures-page {
  min-height: calc(100vh - 110px);
}
</style>
