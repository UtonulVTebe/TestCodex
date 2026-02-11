const { createApp, ref, computed } = Vue;
const { useQuasar } = Quasar;

function createTask1() {
  return {
    type: 'task-1',
    title: '',
    description: '',
    difficulty: 'easy',
    points: 1,
    expectedAnswer: ''
  };
}

function createTaskDnd() {
  return {
    type: 'task-dnd',
    title: 'Drag and Drop задание',
    description: 'Распределите элементы по категориям.',
    difficulty: 'medium',
    points: 3,
    prompt: 'Перетащите каждый элемент в правильную зону',
    dndItemsText: 'Vue\nReact\nSvelte',
    dndZonesText: 'Frameworks\nLibraries',
    expectedAnswer: 'Frameworks: Vue, Svelte; Libraries: React'
  };
}

const initialLecture = {
  id: 'lecture-001',
  title: 'Новая лекция',
  blocks: [
    {
      type: 'paragraph',
      content: 'Здесь будет вводный текст лекции.'
    },
    {
      ...createTask1(),
      title: 'Задание 1',
      description: 'Опишите решение задачи своими словами.',
      points: 5
    }
  ]
};

createApp({
  setup() {
    const $q = useQuasar();
    const lecture = ref(structuredClone(initialLecture));
    const previewMode = ref('render');
    const dragIndex = ref(null);

    const dndAnswers = ref({});
    const draggedDndItem = ref(null);

    const blockTypeOptions = [
      { label: 'Paragraph', value: 'paragraph' },
      { label: 'Task-1', value: 'task-1' },
      { label: 'Task DnD', value: 'task-dnd' }
    ];

    function parseLines(text) {
      return (text || '')
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean);
    }

    function addParagraph() {
      lecture.value.blocks.push({
        type: 'paragraph',
        content: ''
      });
    }

    function addTask() {
      lecture.value.blocks.push(createTask1());
    }

    function addTaskDnd() {
      lecture.value.blocks.push(createTaskDnd());
    }

    function removeBlock(index) {
      lecture.value.blocks.splice(index, 1);
      delete dndAnswers.value[index];
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

    function onDragStart(index) {
      dragIndex.value = index;
    }

    function onDrop(targetIndex) {
      if (dragIndex.value === null || dragIndex.value === targetIndex) {
        dragIndex.value = null;
        return;
      }

      const [item] = lecture.value.blocks.splice(dragIndex.value, 1);
      lecture.value.blocks.splice(targetIndex, 0, item);
      dragIndex.value = null;
    }

    function onDragEnd() {
      dragIndex.value = null;
    }

    function ensureDndAnswerBlock(blockIndex) {
      if (!dndAnswers.value[blockIndex]) {
        dndAnswers.value[blockIndex] = {};
      }
    }

    function onDndAnswerDragStart(blockIndex, item) {
      draggedDndItem.value = { blockIndex, item };
    }

    function onDndAnswerDrop(blockIndex, zone) {
      if (!draggedDndItem.value || draggedDndItem.value.blockIndex !== blockIndex) return;

      ensureDndAnswerBlock(blockIndex);
      const current = dndAnswers.value[blockIndex];

      Object.keys(current).forEach((zoneName) => {
        if (current[zoneName] === draggedDndItem.value.item) {
          delete current[zoneName];
        }
      });

      current[zone] = draggedDndItem.value.item;
      draggedDndItem.value = null;
    }

    function clearDndZone(blockIndex, zone) {
      if (!dndAnswers.value[blockIndex]) return;
      delete dndAnswers.value[blockIndex][zone];
    }

    function getDndAvailableItems(blockIndex, block) {
      const allItems = parseLines(block.dndItemsText);
      const usedItems = Object.values(dndAnswers.value[blockIndex] || {});
      return allItems.filter((item) => !usedItems.includes(item));
    }

    function normalizeBlocks() {
      lecture.value.blocks = lecture.value.blocks.map((block) => {
        if (block.type === 'paragraph') {
          return {
            type: 'paragraph',
            content: block.content || ''
          };
        }

        if (block.type === 'task-dnd') {
          return {
            type: 'task-dnd',
            title: block.title || '',
            description: block.description || '',
            difficulty: block.difficulty || 'medium',
            points: Number(block.points) || 0,
            prompt: block.prompt || '',
            dndItems: parseLines(block.dndItemsText),
            dndZones: parseLines(block.dndZonesText),
            expectedAnswer: block.expectedAnswer || ''
          };
        }

        return {
          type: 'task-1',
          title: block.title || '',
          description: block.description || '',
          difficulty: block.difficulty || 'easy',
          points: Number(block.points) || 0,
          expectedAnswer: block.expectedAnswer || ''
        };
      });

      $q.notify({
        type: 'positive',
        message: 'Блоки нормализованы'
      });
    }

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
      dndAnswers.value = {};
      draggedDndItem.value = null;
      $q.notify({
        type: 'info',
        message: 'Лекция сброшена к начальному шаблону'
      });
    }

    return {
      lecture,
      previewMode,
      dragIndex,
      blockTypeOptions,
      lectureJson,
      addParagraph,
      addTask,
      addTaskDnd,
      removeBlock,
      duplicateBlock,
      moveBlock,
      onDragStart,
      onDrop,
      onDragEnd,
      onDndAnswerDragStart,
      onDndAnswerDrop,
      clearDndZone,
      getDndAvailableItems,
      normalizeBlocks,
      copyJson,
      resetLecture,
      parseLines,
      dndAnswers
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
                  Слева редактируете структуру, справа сразу видите итоговый рендер и JSON.
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
                  <q-btn color="deep-purple" icon="swipe" label="Добавить task-dnd" @click="addTaskDnd" />
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
                draggable="true"
                @dragstart="onDragStart(index)"
                @dragover.prevent
                @drop="onDrop(index)"
                @dragend="onDragEnd"
                class="q-pa-md q-mb-sm block-card"
                :class="{ 'task-card': block.type !== 'paragraph', 'dragging': dragIndex === index }"
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
                  <div class="col-grow text-subtitle2">
                    Блок #{{ index + 1 }}
                    <span class="text-caption text-grey-7"> · перетащите блок мышкой для изменения порядка</span>
                  </div>
                  <div class="col-auto">
                    <q-btn dense flat round icon="drag_indicator" />
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

                <template v-else-if="block.type === 'task-dnd'">
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
                    <div class="col-12">
                      <q-input
                        v-model="block.prompt"
                        type="textarea"
                        autogrow
                        outlined
                        label="Инструкция для drag and drop"
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-input
                        v-model="block.dndItemsText"
                        type="textarea"
                        autogrow
                        outlined
                        label="Перетаскиваемые элементы (по одному на строку)"
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-input
                        v-model="block.dndZonesText"
                        type="textarea"
                        autogrow
                        outlined
                        label="Зоны (по одной на строку)"
                      />
                    </div>
                    <div class="col-12">
                      <q-input
                        v-model="block.expectedAnswer"
                        type="textarea"
                        autogrow
                        outlined
                        label="Ожидаемый ответ / ключ проверки"
                      />
                    </div>
                  </div>
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
                    <div class="col-12">
                      <q-input
                        v-model="block.expectedAnswer"
                        type="textarea"
                        autogrow
                        outlined
                        label="Ожидаемый ответ / ключ проверки"
                        hint="Сюда можно записать эталон или критерии оценки"
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

                      <section v-else-if="block.type === 'task-dnd'" class="lecture-task dnd-task q-mb-md">
                        <div class="lecture-task-title">{{ block.title || 'Drag and Drop задание' }}</div>
                        <div class="lecture-task-description q-mt-xs">
                          {{ block.description || 'Описание не заполнено' }}
                        </div>
                        <div class="text-caption text-grey-8 q-mt-sm q-mb-sm">
                          {{ block.prompt || 'Перетащите элементы в нужные зоны' }}
                        </div>

                        <div class="dnd-items q-mb-md">
                          <div
                            v-for="item in getDndAvailableItems(index, block)"
                            :key="item"
                            class="dnd-item"
                            draggable="true"
                            @dragstart.stop="onDndAnswerDragStart(index, item)"
                          >
                            {{ item }}
                          </div>
                        </div>

                        <div class="dnd-zones">
                          <div
                            v-for="zone in parseLines(block.dndZonesText)"
                            :key="zone"
                            class="dnd-zone"
                            @dragover.prevent
                            @drop.prevent="onDndAnswerDrop(index, zone)"
                          >
                            <div class="dnd-zone-title">{{ zone }}</div>
                            <div v-if="dndAnswers[index] && dndAnswers[index][zone]" class="dnd-zone-answer">
                              {{ dndAnswers[index][zone] }}
                              <q-btn
                                dense
                                flat
                                size="sm"
                                icon="close"
                                color="negative"
                                @click="clearDndZone(index, zone)"
                              />
                            </div>
                            <div v-else class="text-caption text-grey-7">Перетащите элемент сюда</div>
                          </div>
                        </div>
                      </section>

                      <section v-else class="lecture-task q-mb-md">
                        <div class="lecture-task-title">{{ block.title || 'Задание без названия' }}</div>
                        <div class="lecture-task-description q-mt-xs">
                          {{ block.description || 'Описание не заполнено' }}
                        </div>
                        <div class="text-caption text-grey-8 q-mt-sm q-mb-sm">
                          Сложность: {{ block.difficulty || 'easy' }} · Баллы: {{ Number(block.points) || 0 }}
                        </div>
                        <q-input
                          type="textarea"
                          autogrow
                          outlined
                          dense
                          label="Ваш ответ"
                          placeholder="Напишите ответ здесь..."
                        />
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
