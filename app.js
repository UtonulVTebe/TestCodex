const { createApp, ref, computed } = Vue;
const { useQuasar } = Quasar;

/**
 * Здесь хранится исходная структура лекции.
 * Любые изменения через форму сразу попадают в этот объект.
 */
const initialLecture = {
  id: 'lecture-001',
  title: 'Новая лекция',
  blocks: [
    {
      type: 'paragraph',
      content: 'Здесь будет вводный текст лекции.'
    },
    {
      type: 'task-1',
      title: 'Задание 1',
      description: 'Опишите решение задачи своими словами.',
      difficulty: 'easy',
      points: 5
    }
  ]
};

createApp({
  setup() {
    const $q = useQuasar();
    const lecture = ref(structuredClone(initialLecture));
    const previewMode = ref('render');

    const blockTypeOptions = [
      { label: 'Paragraph', value: 'paragraph' },
      { label: 'Task-1', value: 'task-1' }
    ];

    /** Добавление простого текстового блока */
    function addParagraph() {
      lecture.value.blocks.push({
        type: 'paragraph',
        content: ''
      });
    }

    /** Добавление блока задания */
    function addTask() {
      lecture.value.blocks.push({
        type: 'task-1',
        title: '',
        description: '',
        difficulty: 'easy',
        points: 1
      });
    }

    function removeBlock(index) {
      lecture.value.blocks.splice(index, 1);
    }

    function duplicateBlock(index) {
      const source = lecture.value.blocks[index];
      lecture.value.blocks.splice(index + 1, 0, structuredClone(source));
    }

    function moveBlock(index, direction) {
      const target = index + direction;
      if (target < 0 || target >= lecture.value.blocks.length) return;

      const [item] = lecture.value.blocks.splice(index, 1);
      lecture.value.blocks.splice(target, 0, item);
    }

    /**
     * Нормализация нужна, чтобы в JSON оставались только поля,
     * соответствующие выбранному типу блока.
     */
    function normalizeBlocks() {
      lecture.value.blocks = lecture.value.blocks.map((block) => {
        if (block.type === 'paragraph') {
          return {
            type: 'paragraph',
            content: block.content || ''
          };
        }

        return {
          type: 'task-1',
          title: block.title || '',
          description: block.description || '',
          difficulty: block.difficulty || 'easy',
          points: Number(block.points) || 0
        };
      });
    }

    /**
     * Это и есть предпросмотр: вычисляемая строка JSON.
     * Любое изменение lecture автоматически пересчитывает preview.
     */
    const lectureJson = computed(() => JSON.stringify(lecture.value, null, 2));

    async function copyJson() {
      try {
        await navigator.clipboard.writeText(lectureJson.value);
        $q.notify({
          type: 'positive',
          message: 'JSON скопирован в буфер обмена'
        });
      } catch {
        $q.notify({
          type: 'negative',
          message: 'Не удалось скопировать JSON'
        });
      }
    }

    function resetLecture() {
      lecture.value = structuredClone(initialLecture);
      $q.notify({
        type: 'info',
        message: 'Лекция сброшена к начальному шаблону'
      });
    }

    return {
      lecture,
      previewMode,
      blockTypeOptions,
      lectureJson,
      addParagraph,
      addTask,
      removeBlock,
      duplicateBlock,
      moveBlock,
      normalizeBlocks,
      copyJson,
      resetLecture
    };
  },
  template: `
    <q-layout view="lHh Lpr lFf" class="editor-shell">
      <q-header elevated class="bg-primary text-white">
        <q-toolbar>
          <q-toolbar-title>Vue + Quasar Lecture Editor</q-toolbar-title>
          <q-btn
            color="white"
            text-color="primary"
            icon="content_copy"
            label="Скопировать JSON"
            class="q-mr-sm"
            @click="copyJson"
          />
          <q-btn
            color="white"
            text-color="primary"
            icon="restart_alt"
            label="Сбросить"
            @click="resetLecture"
          />
        </q-toolbar>
      </q-header>

      <q-page-container>
        <q-page class="q-pa-md">
          <div class="row q-col-gutter-md">
            <div class="col-12 col-lg-7">
              <q-card flat bordered class="q-pa-md q-mb-md">
                <div class="text-h6 q-mb-xs">Лекция</div>
                <div class="text-caption text-grey-7 q-mb-md">
                  Слева редактируете структуру, справа сразу видите итоговый JSON.
                </div>

                <div class="row q-col-gutter-md">
                  <div class="col-12 col-md-4">
                    <q-input v-model="lecture.id" label="Lecture ID" outlined dense />
                  </div>
                  <div class="col-12 col-md-8">
                    <q-input v-model="lecture.title" label="Заголовок" outlined dense />
                  </div>
                </div>
              </q-card>

              <div class="row q-col-gutter-sm q-mb-md">
                <div class="col-auto">
                  <q-btn color="primary" icon="article" label="Добавить paragraph" @click="addParagraph" />
                </div>
                <div class="col-auto">
                  <q-btn color="secondary" icon="task" label="Добавить task-1" @click="addTask" />
                </div>
                <div class="col-auto">
                  <q-btn outline color="primary" icon="rule" label="Нормализовать" @click="normalizeBlocks" />
                </div>
              </div>

              <q-card
                v-for="(block, index) in lecture.blocks"
                :key="index"
                flat
                bordered
                class="q-pa-md q-mb-sm block-card"
                :class="{ 'task-card': block.type === 'task-1' }"
              >
                <div class="row items-center q-col-gutter-md q-mb-sm">
                  <div class="col-12 col-md-4">
                    <q-select
                      v-model="block.type"
                      :options="blockTypeOptions"
                      option-label="label"
                      option-value="value"
                      emit-value
                      map-options
                      label="Тип блока"
                      outlined
                      dense
                    />
                  </div>
                  <div class="col-grow text-subtitle2">Блок #{{ index + 1 }}</div>
                  <div class="col-auto">
                    <q-btn dense flat round icon="arrow_upward" @click="moveBlock(index, -1)" />
                    <q-btn dense flat round icon="arrow_downward" @click="moveBlock(index, 1)" />
                    <q-btn dense flat round icon="content_copy" @click="duplicateBlock(index)" />
                    <q-btn dense flat round color="negative" icon="delete" @click="removeBlock(index)" />
                  </div>
                </div>

                <template v-if="block.type === 'paragraph'">
                  <q-input
                    v-model="block.content"
                    type="textarea"
                    autogrow
                    outlined
                    label="Текст paragraph"
                  />
                </template>

                <template v-else>
                  <div class="row q-col-gutter-md">
                    <div class="col-12 col-md-6">
                      <q-input v-model="block.title" outlined dense label="Task title" />
                    </div>
                    <div class="col-12 col-md-3">
                      <q-select
                        v-model="block.difficulty"
                        :options="['easy', 'medium', 'hard']"
                        outlined
                        dense
                        label="Difficulty"
                      />
                    </div>
                    <div class="col-12 col-md-3">
                      <q-input v-model.number="block.points" type="number" min="0" outlined dense label="Points" />
                    </div>
                    <div class="col-12">
                      <q-input
                        v-model="block.description"
                        type="textarea"
                        autogrow
                        outlined
                        label="Task description"
                      />
                    </div>
                  </div>
                </template>
              </q-card>
            </div>

            <div class="col-12 col-lg-5">
              <q-card flat bordered class="q-pa-md sticky" style="position: sticky; top: 16px">
                <q-tabs
                  v-model="previewMode"
                  dense
                  class="text-primary"
                  active-color="primary"
                  indicator-color="primary"
                  align="left"
                >
                  <q-tab name="render" icon="visibility" label="Как увидит студент" />
                  <q-tab name="json" icon="data_object" label="JSON" />
                </q-tabs>

                <q-separator class="q-my-md" />

                <template v-if="previewMode === 'render'">
                  <div class="text-h6 q-mb-sm">{{ lecture.title || 'Без названия' }}</div>
                  <div class="text-caption text-grey-7 q-mb-md">ID: {{ lecture.id || '—' }}</div>

                  <div class="lecture-render">
                    <template v-for="(block, index) in lecture.blocks" :key="index">
                      <p v-if="block.type === 'paragraph'" class="lecture-paragraph">
                        {{ block.content || 'Пустой paragraph' }}
                      </p>

                      <section v-else class="lecture-task q-mb-md">
                        <div class="lecture-task-title">{{ block.title || 'Задание без названия' }}</div>
                        <div class="lecture-task-description q-mt-xs">
                          {{ block.description || 'Описание не заполнено' }}
                        </div>
                        <div class="text-caption text-grey-8 q-mt-sm">
                          Сложность: {{ block.difficulty || 'easy' }} · Баллы: {{ Number(block.points) || 0 }}
                        </div>
                      </section>
                    </template>
                  </div>
                </template>

                <template v-else>
                  <div class="text-h6 q-mb-xs">JSON Preview</div>
                  <div class="text-caption text-grey-7 q-mb-md">
                    Это готовый конфиг для рендера лекции. Можно копировать как есть.
                  </div>
                  <div class="json-preview">{{ lectureJson }}</div>
                </template>
              </q-card>
            </div>
          </div>
        </q-page>
      </q-page-container>
    </q-layout>
  `
}).use(Quasar).mount('#q-app');
