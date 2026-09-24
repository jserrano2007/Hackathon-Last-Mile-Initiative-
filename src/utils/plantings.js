import { CROPS, getCropById } from './crops'
import { addDays, daysBetween, parseDateStr, toDateStr } from './dates'

export { CROPS, getCropById }

export const GROWING_METHODS = ['Garden bed', 'Container', 'Hydroponic']

const LISTING_WINDOW_DAYS = 7

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

export function getListingEligibility(planting, now) {
  const harvestDateStr = getHarvestDateStr(planting)
  if (!harvestDateStr) return { canList: false, daysUntilEligible: null }

  const today = toDateStr(now)
  const daysUntilHarvest = daysBetween(today, harvestDateStr)
  if (daysUntilHarvest <= LISTING_WINDOW_DAYS) {
    return { canList: true, daysUntilEligible: 0 }
  }
  return { canList: false, daysUntilEligible: daysUntilHarvest - LISTING_WINDOW_DAYS }
}
