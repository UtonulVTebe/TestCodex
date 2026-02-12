<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-toolbar-title>Lecture Workspace</q-toolbar-title>
        <q-tabs shrink>
          <q-route-tab to="/lectures" label="Лекции" icon="menu_book" />
          <q-route-tab to="/progress" label="Прогресс" icon="insights" />
          <q-route-tab to="/lectures/edit" label="Редактор" icon="edit_note" />
        </q-tabs>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>
