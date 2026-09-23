import { useMemo, useState } from 'react'
import Map from './Map'
import PlaceList from './PlaceList'
import FilterBar from './FilterBar'
import DetailSheet from './DetailSheet'
import LocationControls from './LocationControls'
import { HARTFORD_CENTER } from '../utils/places'
import { isOpenNow } from '../utils/hours'
import { NEIGHBORHOODS } from '../utils/neighborhoods'
import { listingToPlace } from '../utils/listings'

const CATEGORY_GROUPS = {
  markets: ['farmers_market'],
  grocery: ['grocery', 'small_grocery'],
  farms: ['urban_farm', 'community_garden'],
  freeFood: ['food_pantry'],
  neighbors: ['home_grower'],
}

const INITIAL_FILTERS = {
  openNow: false,
  snap: false,
  markets: false,
  grocery: false,
  farms: false,
  freeFood: false,
  neighbors: false,
}

function FindFoodTab({ sources, listings, now }) {
  const [filters, setFilters] = useState(INITIAL_FILTERS)
  const [selectedPlace, setSelectedPlace] = useState(null)
  const [center, setCenter] = useState(HARTFORD_CENTER)
  const [userLocation, setUserLocation] = useState(null)
  const [selectedNeighborhood, setSelectedNeighborhood] = useState('')
  const [locationStatus, setLocationStatus] = useState('idle')

  function toggleFilter(key) {
    setFilters((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  function handleUseMyLocation() {
    if (!navigator.geolocation) {
      setLocationStatus('error')
      return
    }
    setLocationStatus('locating')
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = { lat: position.coords.latitude, lng: position.coords.longitude }
        setUserLocation(coords)
        setCenter(coords)
        setSelectedNeighborhood('')
        setLocationStatus('idle')
      },
      () => {
        setLocationStatus('error')
      },
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }

  function handleSelectNeighborhood(key) {
    setSelectedNeighborhood(key)
    setLocationStatus('idle')
    const neighborhood = NEIGHBORHOODS.find((n) => n.key === key)
    setUserLocation(null)
    setCenter(neighborhood ? { lat: neighborhood.lat, lng: neighborhood.lng } : HARTFORD_CENTER)
  }

  const allPlaces = useMemo(
    () => [...sources, ...listings.map(listingToPlace)],
    [sources, listings],
  )

  const filteredPlaces = useMemo(() => {
    const activeCategoryKeys = Object.keys(CATEGORY_GROUPS).filter((key) => filters[key])
    const allowedCategories = activeCategoryKeys.length
      ? activeCategoryKeys.flatMap((key) => CATEGORY_GROUPS[key])
      : null

    return allPlaces.filter((place) => {
      if (allowedCategories && !allowedCategories.includes(place.category)) return false
      if (filters.snap && place.snap !== true) return false
      if (filters.openNow && place.category !== 'home_grower' && !isOpenNow(place, now)) {
        return false
      }
      return true
    })
  }, [allPlaces, filters, now])

  return (
    <>
      <LocationControls
        selectedNeighborhood={selectedNeighborhood}
        locationStatus={locationStatus}
        onUseMyLocation={handleUseMyLocation}
        onSelectNeighborhood={handleSelectNeighborhood}
      />
      <Map
        places={filteredPlaces}
        onSelectPlace={setSelectedPlace}
        center={center}
        userLocation={userLocation}
      />
      <FilterBar filters={filters} onToggle={toggleFilter} />
      <PlaceList places={filteredPlaces} now={now} onSelectPlace={setSelectedPlace} center={center} />
      <DetailSheet place={selectedPlace} now={now} onClose={() => setSelectedPlace(null)} />
    </>
  )
}

export default FindFoodTab
