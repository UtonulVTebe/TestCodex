<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="topbar">
      <q-toolbar>
        <q-toolbar-title class="mono-tabs">Lecture Workspace</q-toolbar-title>
        <q-tabs shrink class="mono-tabs tabs-minimal">
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
.topbar {
  background: #ffffff;
  color: #111111;
  border-bottom: 1px solid #111111;
}

.mono-tabs {
  font-family: 'Courier New', Courier, monospace;
  letter-spacing: 0.04em;
}

.tabs-minimal :deep(.q-tab) {
  color: #111111;
}

.tabs-minimal :deep(.q-tab__indicator) {
  background: #111111;
}
</style>
