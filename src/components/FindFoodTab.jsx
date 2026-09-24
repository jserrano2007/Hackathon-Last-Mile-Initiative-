import { useMemo, useState } from 'react'
import Map from './Map'
import PlaceList from './PlaceList'
import FilterBar from './FilterBar'
import DetailSheet from './DetailSheet'
import NeighborhoodSheet from './NeighborhoodSheet'
import LocationControls from './LocationControls'
import CategoryLegend from './CategoryLegend'
import { HARTFORD_CENTER } from '../utils/places'
import { isOpenNow } from '../utils/hours'
import { NEIGHBORHOODS } from '../utils/neighborhoods'
import { groupListingsByNeighborhood } from '../utils/listings'

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
  const [selectedGroup, setSelectedGroup] = useState(null)
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

  function handleSelectPlace(place) {
    if (place.isNeighborhoodGroup) {
      setSelectedGroup(place)
    } else {
      setSelectedPlace(place)
    }
  }

  const allowedCategories = useMemo(() => {
    const activeCategoryKeys = Object.keys(CATEGORY_GROUPS).filter((key) => filters[key])
    return activeCategoryKeys.length
      ? activeCategoryKeys.flatMap((key) => CATEGORY_GROUPS[key])
      : null
  }, [filters])

  const filteredSources = useMemo(
    () =>
      sources.filter((place) => {
        if (allowedCategories && !allowedCategories.includes(place.category)) return false
        if (filters.snap && place.snap !== true) return false
        if (filters.openNow && !isOpenNow(place, now)) return false
        return true
      }),
    [sources, allowedCategories, filters, now],
  )

  const neighborhoodGroups = useMemo(() => {
    if (allowedCategories && !allowedCategories.includes('home_grower')) return []
    const eligibleListings = filters.snap ? listings.filter((l) => l.snap === true) : listings
    return groupListingsByNeighborhood(eligibleListings)
  }, [listings, allowedCategories, filters.snap])

  const filteredPlaces = useMemo(
    () => [...filteredSources, ...neighborhoodGroups],
    [filteredSources, neighborhoodGroups],
  )

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
        onSelectPlace={handleSelectPlace}
        center={center}
        userLocation={userLocation}
      />
      <CategoryLegend />
      <FilterBar filters={filters} onToggle={toggleFilter} />
      <PlaceList
        places={filteredPlaces}
        now={now}
        onSelectPlace={handleSelectPlace}
        center={center}
      />
      <DetailSheet place={selectedPlace} now={now} onClose={() => setSelectedPlace(null)} />
      <NeighborhoodSheet group={selectedGroup} now={now} onClose={() => setSelectedGroup(null)} />
    </>
  )
}

export default FindFoodTab
