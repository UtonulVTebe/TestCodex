const STORAGE_KEY = 'lecture-workspace-custom-lectures'

export const loadCustomLectures = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)

    if (!raw) {
      return []
    }

    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export const saveCustomLectures = (lectures) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(lectures))
}

export const upsertCustomLecture = (lecture) => {
  const lectures = loadCustomLectures()
  const index = lectures.findIndex((item) => item.id === lecture.id)

  if (index >= 0) {
    lectures[index] = lecture
  } else {
    lectures.unshift(lecture)
  }

  saveCustomLectures(lectures)
  return lectures
}

export const mergeLectures = (baseLectures) => {
  const customLectures = loadCustomLectures()
  const customById = new Map(customLectures.map((lecture) => [lecture.id, lecture]))

  const mergedBase = baseLectures.map((lecture) => {
    return customById.get(lecture.id) || lecture
  })

  const existingIds = new Set(mergedBase.map((lecture) => lecture.id))
  const onlyCustom = customLectures.filter((lecture) => !existingIds.has(lecture.id))

  return [...onlyCustom, ...mergedBase]
}
