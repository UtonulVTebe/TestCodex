const PROGRESS_KEY = 'lecture-workspace-progress'

const emitProgressUpdated = () => {
  window.dispatchEvent(new CustomEvent('lecture-progress-updated'))
}

const readProgressMap = () => {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY)
    if (!raw) {
      return {}
    }

    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

const writeProgressMap = (progressMap) => {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(progressMap))
  emitProgressUpdated()
}

export const markLectureViewed = (lectureId) => {
  if (!lectureId) return

  const progressMap = readProgressMap()
  const current = progressMap[lectureId] || { viewed: false, tasks: {} }

  progressMap[lectureId] = {
    ...current,
    viewed: true,
    tasks: current.tasks || {}
  }

  writeProgressMap(progressMap)
}

export const setTaskResult = (lectureId, blockIndex, isCorrect) => {
  if (!lectureId || Number.isNaN(Number(blockIndex))) return

  const progressMap = readProgressMap()
  const current = progressMap[lectureId] || { viewed: false, tasks: {} }

  progressMap[lectureId] = {
    ...current,
    tasks: {
      ...(current.tasks || {}),
      [blockIndex]: Boolean(isCorrect)
    }
  }

  writeProgressMap(progressMap)
}

export const getLectureProgressStats = (lecture) => {
  const taskTypes = new Set([
    'task_text',
    'task_single_choice',
    'task_multi_choice',
    'task_matching',
    'task_drag_drop',
    'task_algorithm'
  ])

  const tasks = (lecture.blocks || []).reduce((acc, block, index) => {
    if (taskTypes.has(block.type)) {
      acc.push(index)
    }
    return acc
  }, [])

  const progressMap = readProgressMap()
  const lectureProgress = progressMap[lecture.id] || { viewed: false, tasks: {} }
  const taskResults = lectureProgress.tasks || {}

  const solvedTasks = tasks.filter((blockIndex) => taskResults[blockIndex] === true).length
  const totalTasks = tasks.length

  let percent = 0

  if (lectureProgress.viewed) {
    if (totalTasks === 0) {
      percent = 100
    } else {
      percent = Math.round((solvedTasks / totalTasks) * 100)
    }
  }

  return {
    viewed: Boolean(lectureProgress.viewed),
    solvedTasks,
    totalTasks,
    percent
  }
}
