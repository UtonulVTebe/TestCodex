import {
  BLOCK_TYPES,
  createBlock,
  createInitialLecture,
  normalizeLecture,
  parseLines,
  parseMatchPairs
} from './lectureSchema.js';

const { createApp, computed, ref } = Vue;
const { useQuasar } = Quasar;

const blockTypeOptions = [
  { label: 'Параграф', value: BLOCK_TYPES.PARAGRAPH },
  { label: 'Написание ответа', value: BLOCK_TYPES.TEXT },
  { label: 'Выбор одного ответа', value: BLOCK_TYPES.SINGLE },
  { label: 'Выбор нескольких ответов', value: BLOCK_TYPES.MULTI },
  { label: 'Сопоставление терминов', value: BLOCK_TYPES.MATCH },
  { label: 'Drag and drop', value: BLOCK_TYPES.DND },
  { label: 'Написание алгоритма', value: BLOCK_TYPES.ALGORITHM }
];

createApp({
  setup() {
    const $q = useQuasar();
    const initialLecture = createInitialLecture();
    const lecture = ref(structuredClone(initialLecture));
    const previewMode = ref('render');
    const dragBlockUid = ref(null);

    const studentAnswers = ref({});
    const dndAssignments = ref({});
    const draggedDnd = ref(null);

    const normalizedLecture = computed(() => normalizeLecture(lecture.value));
    const lectureJson = computed(() => JSON.stringify(normalizedLecture.value, null, 2));

    const addBlock = (type) => lecture.value.blocks.push(createBlock(type));

    function duplicateBlock(index) {
      const cloned = structuredClone(lecture.value.blocks[index]);
      cloned.uid = createBlock(cloned.type).uid;
      lecture.value.blocks.splice(index + 1, 0, cloned);
    }

    function removeBlock(index) {
      lecture.value.blocks.splice(index, 1);
      resetStudentState();
    }

    function moveBlock(index, direction) {
      const target = index + direction;
      if (target < 0 || target >= lecture.value.blocks.length) return;
      const [item] = lecture.value.blocks.splice(index, 1);
      lecture.value.blocks.splice(target, 0, item);
      resetStudentState();
    }

    function onTypeChanged(block, newType) {
      if (block.type === newType) return;
      const replacement = createBlock(newType);
      replacement.uid = block.uid;
      const index = lecture.value.blocks.findIndex((candidate) => candidate.uid === block.uid);
      lecture.value.blocks.splice(index, 1, replacement);
      resetStudentState();
    }

    function onDragStart(blockUid) {
      dragBlockUid.value = blockUid;
    }

    function onDrop(targetUid) {
      if (!dragBlockUid.value || dragBlockUid.value === targetUid) return;
      const from = lecture.value.blocks.findIndex((block) => block.uid === dragBlockUid.value);
      const to = lecture.value.blocks.findIndex((block) => block.uid === targetUid);
      if (from === -1 || to === -1) return;
      const [item] = lecture.value.blocks.splice(from, 1);
      lecture.value.blocks.splice(to, 0, item);
      dragBlockUid.value = null;
      resetStudentState();
    }

    function onDragEnd() {
      dragBlockUid.value = null;
    }

    function resetStudentState() {
      studentAnswers.value = {};
      dndAssignments.value = {};
      draggedDnd.value = null;
    }

    function ensureDndBlock(blockUid) {
      if (!dndAssignments.value[blockUid]) {
        dndAssignments.value[blockUid] = {};
      }
    }

    function onDndDragStart(blockUid, item) {
      draggedDnd.value = { blockUid, item };
    }

    function onDndDrop(blockUid, zone) {
      if (!draggedDnd.value || draggedDnd.value.blockUid !== blockUid) return;
      ensureDndBlock(blockUid);
      const map = dndAssignments.value[blockUid];

      Object.keys(map).forEach((zoneName) => {
        if (map[zoneName] === draggedDnd.value.item) {
          delete map[zoneName];
        }
      });

      map[zone] = draggedDnd.value.item;
      draggedDnd.value = null;
    }

    function clearDndZone(blockUid, zone) {
      if (!dndAssignments.value[blockUid]) return;
      delete dndAssignments.value[blockUid][zone];
    }

    function getAvailableDndItems(block) {
      const items = parseLines(block.itemsText);
      const used = Object.values(dndAssignments.value[block.uid] || {});
      return items.filter((item) => !used.includes(item));
    }

    function resetLecture() {
      lecture.value = structuredClone(initialLecture);
      previewMode.value = 'render';
      resetStudentState();
      $q.notify({ type: 'info', message: 'Лекция сброшена к стартовому шаблону' });
    }

    function normalizeNow() {
      lecture.value = {
        ...lecture.value,
        blocks: normalizeLecture(lecture.value).blocks.map((block) => ({
          ...createBlock(block.type),
          ...block,
          uid: createBlock(block.type).uid,
          optionsText: block.options ? block.options.join('\n') : undefined,
          correctOptionsText: block.correctOptions ? block.correctOptions.join('\n') : undefined,
          pairsText: block.pairs
            ? block.pairs.map((pair) => `${pair.left} :: ${pair.right}`).join('\n')
            : undefined,
          itemsText: block.dndItems ? block.dndItems.join('\n') : undefined,
          zonesText: block.dndZones ? block.dndZones.join('\n') : undefined
        }))
      };
      resetStudentState();
      $q.notify({ type: 'positive', message: 'Структура нормализована' });
    }

    async function copyJson() {
      try {
        await navigator.clipboard.writeText(lectureJson.value);
        $q.notify({ type: 'positive', message: 'JSON скопирован в буфер обмена' });
      } catch {
        $q.notify({ type: 'negative', message: 'Не удалось скопировать JSON' });
      }
    }

    return {
      BLOCK_TYPES,
      blockTypeOptions,
      lecture,
      previewMode,
      dragBlockUid,
      studentAnswers,
      dndAssignments,
      lectureJson,
      parseLines,
      parseMatchPairs,
      addBlock,
      duplicateBlock,
      removeBlock,
      moveBlock,
      onTypeChanged,
      onDragStart,
      onDrop,
      onDragEnd,
      onDndDragStart,
      onDndDrop,
      clearDndZone,
      getAvailableDndItems,
      normalizeNow,
      copyJson,
      resetLecture
    };
  },
  template: `
    <q-layout view="lHh Lpr lFf" class="editor-shell">
      <q-header elevated class="bg-primary text-white">
        <q-toolbar>
          <q-toolbar-title>Lecture Editor · Vue + Quasar</q-toolbar-title>
          <q-btn flat color="white" icon="rule" label="Нормализовать" class="q-mr-sm" @click="normalizeNow" />
          <q-btn flat color="white" icon="content_copy" label="Скопировать JSON" class="q-mr-sm" @click="copyJson" />
          <q-btn flat color="white" icon="restart_alt" label="Сбросить" @click="resetLecture" />
        </q-toolbar>
      </q-header>

      <q-page-container>
        <q-page class="q-pa-md">
          <div class="row q-col-gutter-md">
            <div class="col-12 col-lg-7">
              <q-card flat bordered class="q-pa-md q-mb-md">
                <div class="text-h6 q-mb-sm">Метаданные лекции</div>
                <div class="row q-col-gutter-md">
                  <div class="col-12 col-md-4"><q-input v-model="lecture.id" dense outlined label="Lecture ID" /></div>
                  <div class="col-12 col-md-8"><q-input v-model="lecture.title" dense outlined label="Название лекции" /></div>
                </div>
              </q-card>

              <q-card flat bordered class="q-pa-sm q-mb-md">
                <div class="row q-col-gutter-sm">
                  <div class="col-auto" v-for="option in blockTypeOptions" :key="option.value">
                    <q-btn size="sm" color="primary" outline @click="addBlock(option.value)">+ {{ option.label }}</q-btn>
                  </div>
                </div>
              </q-card>

              <q-card
                v-for="(block, index) in lecture.blocks"
                :key="block.uid"
                flat
                bordered
                class="q-pa-md q-mb-sm block-card"
                :class="{ dragging: dragBlockUid === block.uid }"
                draggable="true"
                @dragstart="onDragStart(block.uid)"
                @dragover.prevent
                @drop="onDrop(block.uid)"
                @dragend="onDragEnd"
              >
                <div class="row items-center q-col-gutter-sm q-mb-sm">
                  <div class="col-12 col-md-4">
                    <q-select
                      :model-value="block.type"
                      @update:model-value="(newType) => onTypeChanged(block, newType)"
                      :options="blockTypeOptions"
                      option-label="label"
                      option-value="value"
                      emit-value
                      map-options
                      dense
                      outlined
                      label="Тип блока"
                    />
                  </div>
                  <div class="col-grow text-caption text-grey-7">Блок #{{ index + 1 }} · Перетаскивайте для изменения порядка</div>
                  <div class="col-auto">
                    <q-btn dense flat round icon="arrow_upward" @click="moveBlock(index, -1)" />
                    <q-btn dense flat round icon="arrow_downward" @click="moveBlock(index, 1)" />
                    <q-btn dense flat round icon="content_copy" @click="duplicateBlock(index)" />
                    <q-btn dense flat round color="negative" icon="delete" @click="removeBlock(index)" />
                  </div>
                </div>

                <template v-if="block.type === BLOCK_TYPES.PARAGRAPH">
                  <q-input v-model="block.content" type="textarea" autogrow outlined label="Текст параграфа" />
                </template>

                <template v-else>
                  <div class="row q-col-gutter-md">
                    <div class="col-12 col-md-6"><q-input v-model="block.title" dense outlined label="Заголовок задания" /></div>
                    <div class="col-12 col-md-3"><q-select v-model="block.difficulty" dense outlined :options="['easy','medium','hard']" label="Сложность" /></div>
                    <div class="col-12 col-md-3"><q-input v-model.number="block.points" dense outlined type="number" min="0" label="Баллы" /></div>
                    <div class="col-12"><q-input v-model="block.description" type="textarea" autogrow outlined label="Описание" /></div>
                    <div class="col-12"><q-input v-model="block.prompt" type="textarea" autogrow outlined label="Инструкция" /></div>

                    <template v-if="block.type === BLOCK_TYPES.TEXT">
                      <div class="col-12"><q-input v-model="block.expectedAnswer" type="textarea" autogrow outlined label="Ожидаемый ответ" /></div>
                    </template>

                    <template v-if="block.type === BLOCK_TYPES.SINGLE">
                      <div class="col-12 col-md-6"><q-input v-model="block.optionsText" type="textarea" autogrow outlined label="Варианты (по строкам)" /></div>
                      <div class="col-12 col-md-6"><q-input v-model="block.correctOption" outlined dense label="Правильный вариант" /></div>
                    </template>

                    <template v-if="block.type === BLOCK_TYPES.MULTI">
                      <div class="col-12 col-md-6"><q-input v-model="block.optionsText" type="textarea" autogrow outlined label="Варианты (по строкам)" /></div>
                      <div class="col-12 col-md-6"><q-input v-model="block.correctOptionsText" type="textarea" autogrow outlined label="Правильные варианты (по строкам)" /></div>
                    </template>

                    <template v-if="block.type === BLOCK_TYPES.MATCH">
                      <div class="col-12">
                        <q-input
                          v-model="block.pairsText"
                          type="textarea"
                          autogrow
                          outlined
                          label="Пары в формате: термин :: определение"
                        />
                      </div>
                    </template>

                    <template v-if="block.type === BLOCK_TYPES.DND">
                      <div class="col-12 col-md-6"><q-input v-model="block.itemsText" type="textarea" autogrow outlined label="Элементы (по строкам)" /></div>
                      <div class="col-12 col-md-6"><q-input v-model="block.zonesText" type="textarea" autogrow outlined label="Зоны (по строкам)" /></div>
                      <div class="col-12"><q-input v-model="block.expectedAnswer" type="textarea" autogrow outlined label="Ключ проверки" /></div>
                    </template>

                    <template v-if="block.type === BLOCK_TYPES.ALGORITHM">
                      <div class="col-12"><q-input v-model="block.starterCode" type="textarea" autogrow outlined label="Стартовый код / контекст" /></div>
                      <div class="col-12"><q-input v-model="block.expectedSteps" type="textarea" autogrow outlined label="Ожидаемые шаги алгоритма" /></div>
                    </template>
                  </div>
                </template>
              </q-card>
            </div>

            <div class="col-12 col-lg-5">
              <q-card flat bordered class="q-pa-md sticky-preview">
                <q-tabs v-model="previewMode" dense align="left" active-color="primary" indicator-color="primary">
                  <q-tab name="render" label="Как увидит студент" icon="visibility" />
                  <q-tab name="json" label="JSON" icon="data_object" />
                </q-tabs>
                <q-separator class="q-my-md" />

                <template v-if="previewMode === 'render'">
                  <div class="text-h6">{{ lecture.title || 'Без названия' }}</div>
                  <div class="text-caption text-grey-7 q-mb-md">ID: {{ lecture.id || '—' }}</div>

                  <div v-for="block in lecture.blocks" :key="block.uid" class="preview-block q-mb-md">
                    <p v-if="block.type === BLOCK_TYPES.PARAGRAPH" class="lecture-paragraph">{{ block.content || 'Пустой параграф' }}</p>

                    <template v-else>
                      <div class="lecture-task-title">{{ block.title || 'Задание' }}</div>
                      <div class="text-body2 q-mb-sm">{{ block.description || block.prompt }}</div>

                      <q-input
                        v-if="block.type === BLOCK_TYPES.TEXT"
                        v-model="studentAnswers[block.uid]"
                        type="textarea"
                        autogrow
                        outlined
                        dense
                        label="Ваш ответ"
                      />

                      <q-option-group
                        v-else-if="block.type === BLOCK_TYPES.SINGLE"
                        v-model="studentAnswers[block.uid]"
                        :options="parseLines(block.optionsText).map((item) => ({ label: item, value: item }))"
                        type="radio"
                      />

                      <q-option-group
                        v-else-if="block.type === BLOCK_TYPES.MULTI"
                        v-model="studentAnswers[block.uid]"
                        :options="parseLines(block.optionsText).map((item) => ({ label: item, value: item }))"
                        type="checkbox"
                      />

                      <div v-else-if="block.type === BLOCK_TYPES.MATCH" class="row q-col-gutter-sm">
                        <div
                          class="col-12"
                          v-for="pair in parseMatchPairs(block.pairsText)"
                          :key="pair.left"
                        >
                          <q-select
                            dense
                            outlined
                            :label="pair.left"
                            v-model="studentAnswers[block.uid + '-' + pair.left]"
                            :options="parseMatchPairs(block.pairsText).map((entry) => entry.right)"
                          />
                        </div>
                      </div>

                      <div v-else-if="block.type === BLOCK_TYPES.DND">
                        <div class="dnd-items q-mb-sm">
                          <div
                            v-for="item in getAvailableDndItems(block)"
                            :key="item"
                            class="dnd-item"
                            draggable="true"
                            @dragstart="onDndDragStart(block.uid, item)"
                          >
                            {{ item }}
                          </div>
                        </div>
                        <div class="dnd-zones">
                          <div
                            v-for="zone in parseLines(block.zonesText)"
                            :key="zone"
                            class="dnd-zone"
                            @dragover.prevent
                            @drop.prevent="onDndDrop(block.uid, zone)"
                          >
                            <div class="dnd-zone-title">{{ zone }}</div>
                            <div v-if="dndAssignments[block.uid] && dndAssignments[block.uid][zone]" class="dnd-zone-answer">
                              {{ dndAssignments[block.uid][zone] }}
                              <q-btn dense flat icon="close" color="negative" @click="clearDndZone(block.uid, zone)" />
                            </div>
                            <div v-else class="text-caption text-grey-7">Перетащите сюда</div>
                          </div>
                        </div>
                      </div>

                      <q-input
                        v-else-if="block.type === BLOCK_TYPES.ALGORITHM"
                        v-model="studentAnswers[block.uid]"
                        type="textarea"
                        autogrow
                        outlined
                        dense
                        label="Опишите алгоритм"
                      />
                    </template>
                  </div>
                </template>

                <template v-else>
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
