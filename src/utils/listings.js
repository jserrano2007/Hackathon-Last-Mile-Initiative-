import { NEIGHBORHOODS } from './neighborhoods'
import { CROPS, getCropById } from './crops'
import { addDays, formatShortDate, parseDateStr, toDateStr } from './dates'

export { CROPS, getCropById, formatShortDate }

const READY_EARLY_DAYS = 7
const READY_LATE_DAYS = 28

const UNIT_LABELS = {
  pint: 'pint',
  lb: 'lb',
  bunch: 'bunch',
  head: 'head',
  each: 'each',
  free: 'free',
}

export function getReadyWindow(datePlanted, cropId) {
  const crop = getCropById(cropId)
  if (!crop || !datePlanted) return null
  const planted = parseDateStr(datePlanted)
  return {
    start: toDateStr(addDays(planted, crop.days - READY_EARLY_DAYS)),
    end: toDateStr(addDays(planted, crop.days + READY_LATE_DAYS)),
  }
}

export function getReadyStatus(listing, now) {
  const window = getReadyWindow(listing.datePlanted, listing.cropId)
  if (!window) return { text: 'Ready date unknown', open: false }
  const today = toDateStr(now)
  if (today >= window.start && today <= window.end) {
    return { text: 'Ready now', open: true }
  }
  return { text: `Ready around ${formatShortDate(window.start)}`, open: false }
}

export function formatListingPrice(listing) {
  if (listing.unit === 'free') return 'Free'
  return `$${listing.price}/${UNIT_LABELS[listing.unit] ?? listing.unit}`
}

export function groupListingsByNeighborhood(listings) {
  const groups = new Map()

  listings.forEach((listing) => {
    const neighborhood = NEIGHBORHOODS.find((n) => n.key === listing.neighborhoodKey)
    if (!neighborhood) return
    if (!groups.has(neighborhood.key)) {
      groups.set(neighborhood.key, { neighborhood, listings: [] })
    }
    groups.get(neighborhood.key).listings.push(listing)
  })

  return [...groups.values()].map(({ neighborhood, listings: groupListings }) => ({
    id: `neighborhood-${neighborhood.key}`,
    isNeighborhoodGroup: true,
    category: 'home_grower',
    name: `${neighborhood.label} - ${groupListings.length} neighbor listing${groupListings.length === 1 ? '' : 's'}`,
    neighborhoodKey: neighborhood.key,
    neighborhoodLabel: neighborhood.label,
    lat: neighborhood.lat,
    lng: neighborhood.lng,
    count: groupListings.length,
    listings: groupListings,
  }))
}
