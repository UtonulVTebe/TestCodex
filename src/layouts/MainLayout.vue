<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-toolbar-title>Lecture Workspace</q-toolbar-title>
        <q-tabs shrink class="mono-tabs">
          <q-route-tab to="/lectures" label="ЛЕКЦИИ" />
          <q-route-tab to="/progress" label="ПРОГРЕСС" />
          <q-route-tab to="/lectures/edit" label="РЕДАКТОР" />
        </q-tabs>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<style scoped>
.mono-tabs {
  font-family: 'Courier New', Courier, monospace;
  letter-spacing: 0.06em;
}
</style>
