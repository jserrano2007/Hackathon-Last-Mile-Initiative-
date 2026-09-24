import { NEIGHBORHOODS } from './neighborhoods'
import { CROPS, getCropById } from './crops'
import { addDays, formatShortDate, parseDateStr, toDateStr } from './dates'

export { CROPS, getCropById, formatShortDate }

const STORAGE_KEY = 'freshmile_listings'
const READY_EARLY_DAYS = 7
const READY_LATE_DAYS = 28
const JITTER_DEGREES = 0.004

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

export function jitteredCoords(neighborhood) {
  const angle = Math.random() * Math.PI * 2
  const radius = Math.random() * JITTER_DEGREES
  return {
    lat: neighborhood.lat + radius * Math.cos(angle),
    lng: neighborhood.lng + radius * Math.sin(angle),
  }
}

export function listingToPlace(listing) {
  const neighborhood = NEIGHBORHOODS.find((n) => n.key === listing.neighborhoodKey)
  const crop = getCropById(listing.cropId)
  return {
    id: listing.id,
    name: listing.displayName,
    category: 'home_grower',
    address: null,
    city: 'Hartford',
    zip: null,
    lat: listing.lat,
    lng: listing.lng,
    hours: null,
    season: null,
    snap: listing.snap,
    snapMatch: null,
    wicFmnp: null,
    seniorFmnp: null,
    phone: null,
    website: null,
    status: 'confirmed_2026',
    notes: null,
    sourceUrl: null,
    cropId: listing.cropId,
    cropName: crop ? crop.name : listing.cropId,
    price: listing.price,
    unit: listing.unit,
    datePlanted: listing.datePlanted,
    neighborhoodKey: listing.neighborhoodKey,
    neighborhoodLabel: neighborhood ? neighborhood.label : '',
  }
}

export function loadListings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveListings(listings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(listings))
}
