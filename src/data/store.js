import { getNow } from '../utils/hours'
import { addDays, toDateStr } from '../utils/dates'
import { CROPS } from '../utils/crops'

const LISTINGS_KEY = 'freshmile_listings'
const PLANTINGS_KEY = 'freshmile_plantings'
const SEEDED_KEY = 'freshmile_seeded'

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function writeJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

// ---- Demo seed data ----

const DEMO_SELLER_NAMES = [
  "Maria's porch garden",
  "Tyrell's backyard beds",
  'Nguyen family plot',
  "Grandma Rosa's tomatoes",
]

const DEMO_NEIGHBORHOODS = ['north-end', 'frog-hollow', 'asylum-hill', 'south-end']
const DEMO_UNITS = ['lb', 'pint', 'bunch', 'head', 'each', 'free', 'lb', 'pint']
const DEMO_HARVEST_OFFSETS = [-10, -3, 0, 5, 10, 15, 20, 25]

function randomBetween(min, max) {
  return min + Math.random() * (max - min)
}

function randomInt(min, max) {
  return Math.floor(randomBetween(min, max + 1))
}

function buildDemoListings() {
  const sellers = DEMO_SELLER_NAMES.map((name) => ({
    name,
    rating: Number(randomBetween(4.2, 4.9).toFixed(1)),
    reviewCount: randomInt(3, 8),
  }))

  const now = getNow()

  return DEMO_HARVEST_OFFSETS.map((offset, index) => {
    const crop = CROPS[index % CROPS.length]
    const neighborhoodKey = DEMO_NEIGHBORHOODS[index % DEMO_NEIGHBORHOODS.length]
    const seller = sellers[index % sellers.length]
    const unit = DEMO_UNITS[index % DEMO_UNITS.length]
    const datePlanted = toDateStr(addDays(now, offset - crop.days))

    return {
      id: `demo-listing-${index}`,
      plantingId: null,
      cropId: crop.id,
      datePlanted,
      price: unit === 'free' ? 0 : Number(randomBetween(1, 6).toFixed(2)),
      unit,
      neighborhoodKey,
      photo: null,
      displayName: seller.name,
      snap: index % 3 !== 0,
      demo: true,
      sellerRating: seller.rating,
      sellerReviewCount: seller.reviewCount,
    }
  })
}

function ensureSeeded() {
  if (localStorage.getItem(SEEDED_KEY)) return
  writeJSON(LISTINGS_KEY, buildDemoListings())
  writeJSON(PLANTINGS_KEY, [])
  localStorage.setItem(SEEDED_KEY, '1')
}

ensureSeeded()

// ---- Listings ----

export function getListings() {
  return readJSON(LISTINGS_KEY, [])
}

export function saveListing(listing) {
  const listings = readJSON(LISTINGS_KEY, [])
  writeJSON(LISTINGS_KEY, [...listings, listing])
}

export function updateListing(id, patch) {
  const listings = readJSON(LISTINGS_KEY, [])
  writeJSON(
    LISTINGS_KEY,
    listings.map((listing) => (listing.id === id ? { ...listing, ...patch } : listing)),
  )
}

export function removeListing(id) {
  const listings = readJSON(LISTINGS_KEY, [])
  writeJSON(
    LISTINGS_KEY,
    listings.filter((listing) => listing.id !== id),
  )
}

// ---- Plantings ----

export function getPlantings() {
  return readJSON(PLANTINGS_KEY, [])
}

export function savePlanting(planting) {
  const plantings = readJSON(PLANTINGS_KEY, [])
  writeJSON(PLANTINGS_KEY, [...plantings, planting])
}

export function removePlanting(id) {
  const plantings = readJSON(PLANTINGS_KEY, [])
  writeJSON(
    PLANTINGS_KEY,
    plantings.filter((planting) => planting.id !== id),
  )
}

export function addPlantingNote(plantingId, note) {
  const plantings = readJSON(PLANTINGS_KEY, [])
  writeJSON(
    PLANTINGS_KEY,
    plantings.map((planting) =>
      planting.id === plantingId ? { ...planting, notes: [note, ...planting.notes] } : planting,
    ),
  )
}
