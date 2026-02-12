<template>
  <q-page class="q-pa-md">
    <div class="column q-gutter-md">
      <q-card flat bordered>
        <q-card-section>
          <div class="text-subtitle1 text-weight-medium">Общий прогресс</div>
          <div class="text-caption text-grey-7">
            По всем лекциям: {{ totalSolvedTasks }}/{{ totalTasks }} заданий
          </div>
        </q-card-section>
        <q-separator />
        <q-card-section>
          <div class="text-h4 q-mb-sm">{{ overallPercent }}%</div>
          <q-linear-progress
            :value="overallPercent / 100"
            size="12px"
            rounded
            color="secondary"
            track-color="grey-3"
          />
        </q-card-section>
      </q-card>

      <q-card flat bordered>
        <q-card-section>
          <div class="text-h5">Прогресс по лекциям</div>
          <div class="text-caption text-grey-7">Реальный прогресс по просмотренным и решённым заданиям</div>
        </q-card-section>
        <q-separator />

        <q-list>
          <q-item v-for="lecture in lectureStats" :key="lecture.id" class="q-py-md">
            <q-item-section>
              <q-item-label>{{ lecture.title }}</q-item-label>
              <q-item-label caption>
                {{ lecture.viewed ? 'Просмотрена' : 'Не открыта' }} ·
                Задания: {{ lecture.solvedTasks }}/{{ lecture.totalTasks }}
              </q-item-label>
              <q-linear-progress
                :value="lecture.percent / 100"
                size="10px"
                rounded
                color="accent"
                track-color="grey-3"
                class="q-mt-sm"
              />
            </q-item-section>
            <q-item-section side top>
              <div class="text-subtitle2 text-weight-medium">{{ lecture.percent }}%</div>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import lectures from 'src/data/lectures.json'
import { mergeLectures } from 'src/data/lectureStorage'
import { getLectureProgressStats } from 'src/data/progressStorage'

const lectureStats = ref([])

const refreshLectures = () => {
  lectureStats.value = mergeLectures(lectures).map((lecture) => {
    const stats = getLectureProgressStats(lecture)

    return {
      id: lecture.id,
      title: lecture.title,
      ...stats
    }
  })
}

const totalSolvedTasks = computed(() => {
  return lectureStats.value.reduce((sum, lecture) => sum + lecture.solvedTasks, 0)
})

const totalTasks = computed(() => {
  return lectureStats.value.reduce((sum, lecture) => sum + lecture.totalTasks, 0)
})

const overallPercent = computed(() => {
  if (totalTasks.value === 0) {
    return 0
  }

  return Math.round((totalSolvedTasks.value / totalTasks.value) * 100)
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
</script>
