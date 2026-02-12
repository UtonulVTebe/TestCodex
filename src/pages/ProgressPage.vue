<template>
  <q-page class="q-pa-md">
    <q-card flat bordered>
      <q-card-section>
        <div class="text-h5">Прогресс по лекциям</div>
        <div class="text-caption text-grey-7">Временная страница мониторинга обучения</div>
      </q-card-section>
      <q-separator />
      <q-list>
        <q-item v-for="lecture in lectures" :key="lecture.id">
          <q-item-section>
            <q-item-label>{{ lecture.title }}</q-item-label>
            <q-item-label caption>{{ lecture.id }}</q-item-label>
          </q-item-section>
          <q-item-section side class="progress-side">
            <q-circular-progress
              :value="lecture.progress"
              size="48px"
              color="primary"
              track-color="grey-3"
              show-value
              font-size="11px"
            />
          </q-item-section>
        </q-item>
      </q-list>
    </q-card>
  </q-page>
</template>

<script setup>
import lectures from 'src/data/lectures.json'
</script>

<style scoped>
.progress-side {
  min-width: 64px;
}
</style>
