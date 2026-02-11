export const BLOCK_TYPES = {
  PARAGRAPH: 'paragraph',
  TEXT: 'task-text',
  SINGLE: 'task-single',
  MULTI: 'task-multi',
  MATCH: 'task-match',
  DND: 'task-dnd',
  ALGORITHM: 'task-algorithm'
};

let nextUid = 1;

function uid() {
  const value = `block-${nextUid}`;
  nextUid += 1;
  return value;
}

export function parseLines(text) {
  return String(text || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

export function parseMatchPairs(text) {
  return parseLines(text)
    .map((line) => {
      const [left, ...rightParts] = line.split('::');
      return {
        left: (left || '').trim(),
        right: rightParts.join('::').trim()
      };
    })
    .filter((pair) => pair.left && pair.right);
}

export function createBlock(type) {
  const common = {
    uid: uid(),
    type,
    title: '',
    description: '',
    difficulty: 'medium',
    points: 1
  };

  switch (type) {
    case BLOCK_TYPES.PARAGRAPH:
      return {
        uid: uid(),
        type,
        content: ''
      };

    case BLOCK_TYPES.TEXT:
      return {
        ...common,
        title: 'Задание с написанием ответа',
        prompt: 'Напишите короткий ответ.',
        expectedAnswer: ''
      };

    case BLOCK_TYPES.SINGLE:
      return {
        ...common,
        title: 'Задание с выбором ответа',
        prompt: 'Выберите один правильный вариант.',
        optionsText: 'Вариант 1\nВариант 2\nВариант 3',
        correctOption: ''
      };

    case BLOCK_TYPES.MULTI:
      return {
        ...common,
        title: 'Задание с выбором нескольких ответов',
        prompt: 'Выберите все подходящие варианты.',
        optionsText: 'Вариант 1\nВариант 2\nВариант 3',
        correctOptionsText: ''
      };

    case BLOCK_TYPES.MATCH:
      return {
        ...common,
        title: 'Задание на сопоставление',
        prompt: 'Соотнесите термин и определение.',
        pairsText: 'Термин 1 :: Определение 1\nТермин 2 :: Определение 2'
      };

    case BLOCK_TYPES.DND:
      return {
        ...common,
        title: 'Задание drag and drop',
        prompt: 'Перетащите элементы в нужные зоны.',
        itemsText: 'Элемент 1\nЭлемент 2\nЭлемент 3',
        zonesText: 'Зона A\nЗона B',
        expectedAnswer: ''
      };

    case BLOCK_TYPES.ALGORITHM:
      return {
        ...common,
        title: 'Задание с написанием алгоритма',
        prompt: 'Опишите алгоритм пошагово.',
        starterCode: '',
        expectedSteps: ''
      };

    default:
      return createBlock(BLOCK_TYPES.PARAGRAPH);
  }
}

export function createInitialLecture() {
  return {
    id: 'lecture-001',
    title: 'Новая лекция',
    blocks: [
      {
        uid: uid(),
        type: BLOCK_TYPES.PARAGRAPH,
        content: 'Вводный абзац лекции. Здесь можно объяснить тему занятия.'
      },
      {
        ...createBlock(BLOCK_TYPES.TEXT),
        title: 'Короткий ответ: что такое JSON?'
      },
      {
        ...createBlock(BLOCK_TYPES.SINGLE),
        title: 'Выберите формат данных',
        optionsText: 'JSON\nPDF\nPNG',
        correctOption: 'JSON'
      }
    ]
  };
}

export function normalizeLecture(lecture) {
  return {
    id: String(lecture.id || '').trim(),
    title: String(lecture.title || '').trim(),
    blocks: lecture.blocks.map((block) => {
      if (block.type === BLOCK_TYPES.PARAGRAPH) {
        return {
          type: BLOCK_TYPES.PARAGRAPH,
          content: String(block.content || '')
        };
      }

      const base = {
        type: block.type,
        title: String(block.title || ''),
        description: String(block.description || ''),
        difficulty: String(block.difficulty || 'medium'),
        points: Number(block.points) || 0,
        prompt: String(block.prompt || '')
      };

      if (block.type === BLOCK_TYPES.TEXT) {
        return {
          ...base,
          expectedAnswer: String(block.expectedAnswer || '')
        };
      }

      if (block.type === BLOCK_TYPES.SINGLE) {
        return {
          ...base,
          options: parseLines(block.optionsText),
          correctOption: String(block.correctOption || '')
        };
      }

      if (block.type === BLOCK_TYPES.MULTI) {
        return {
          ...base,
          options: parseLines(block.optionsText),
          correctOptions: parseLines(block.correctOptionsText)
        };
      }

      if (block.type === BLOCK_TYPES.MATCH) {
        return {
          ...base,
          pairs: parseMatchPairs(block.pairsText)
        };
      }

      if (block.type === BLOCK_TYPES.DND) {
        return {
          ...base,
          dndItems: parseLines(block.itemsText),
          dndZones: parseLines(block.zonesText),
          expectedAnswer: String(block.expectedAnswer || '')
        };
      }

      if (block.type === BLOCK_TYPES.ALGORITHM) {
        return {
          ...base,
          starterCode: String(block.starterCode || ''),
          expectedSteps: String(block.expectedSteps || '')
        };
      }

      return base;
    })
  };
}
