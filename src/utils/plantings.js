import { CROPS, getCropById } from './crops'
import { addDays, daysBetween, parseDateStr, toDateStr } from './dates'

export { CROPS, getCropById }

const STORAGE_KEY = 'freshmile_plantings'

export const GROWING_METHODS = ['Garden bed', 'Container', 'Hydroponic']

export function loadPlantings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function savePlantings(plantings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(plantings))
}

export function getHarvestDateStr(planting) {
  const crop = getCropById(planting.cropId)
  if (!crop) return null
  return toDateStr(addDays(parseDateStr(planting.datePlanted), crop.days))
}

export function getGrowthProgress(planting, now) {
  const crop = getCropById(planting.cropId)
  const harvestDateStr = getHarvestDateStr(planting)
  if (!crop || !harvestDateStr) return null

  const today = toDateStr(now)
  const dayIndex = Math.max(1, daysBetween(planting.datePlanted, today) + 1)
  const daysRemaining = daysBetween(today, harvestDateStr)
  const fraction = Math.min(1, Math.max(0, dayIndex / crop.days))

  return {
    cropName: crop.name,
    totalDays: crop.days,
    dayIndex,
    daysRemaining,
    harvestDateStr,
    fraction,
    isReady: daysRemaining <= 0,
  }
}
