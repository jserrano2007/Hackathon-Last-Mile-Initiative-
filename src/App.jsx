import { useEffect, useMemo, useState } from 'react'
import Map from './components/Map'
import PlaceList from './components/PlaceList'
import FilterBar from './components/FilterBar'
import DetailSheet from './components/DetailSheet'
import LocationControls from './components/LocationControls'
import { HARTFORD_CENTER, fetchPlaces } from './utils/places'
import { getNow, isOpenNow } from './utils/hours'
import { NEIGHBORHOODS } from './utils/neighborhoods'
import './App.css'

const CATEGORY_GROUPS = {
  markets: ['farmers_market'],
  grocery: ['grocery', 'small_grocery'],
  farms: ['urban_farm', 'community_garden'],
  freeFood: ['food_pantry'],
}

const INITIAL_FILTERS = {
  openNow: false,
  snap: false,
  markets: false,
  grocery: false,
  farms: false,
  freeFood: false,
}

function App() {
  const [places, setPlaces] = useState([])
  const [status, setStatus] = useState('loading')
  const [filters, setFilters] = useState(INITIAL_FILTERS)
  const [selectedPlace, setSelectedPlace] = useState(null)
  const [center, setCenter] = useState(HARTFORD_CENTER)
  const [userLocation, setUserLocation] = useState(null)
  const [selectedNeighborhood, setSelectedNeighborhood] = useState('')
  const [locationStatus, setLocationStatus] = useState('idle')
  const now = useMemo(() => getNow(), [])

  useEffect(() => {
    fetchPlaces()
      .then((data) => {
        setPlaces(data)
        setStatus('ready')
      })
      .catch(() => setStatus('error'))
  }, [])

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

  const filteredPlaces = useMemo(() => {
    const activeCategoryKeys = Object.keys(CATEGORY_GROUPS).filter((key) => filters[key])
    const allowedCategories = activeCategoryKeys.length
      ? activeCategoryKeys.flatMap((key) => CATEGORY_GROUPS[key])
      : null

    return places.filter((place) => {
      if (allowedCategories && !allowedCategories.includes(place.category)) return false
      if (filters.snap && place.snap !== true) return false
      if (filters.openNow && !isOpenNow(place, now)) return false
      return true
    })
  }, [places, filters, now])

  return (
    <div className="app">
      <header className="app-header">
        <h1>FreshMile</h1>
        <p>Fresh food near you in Hartford, CT</p>
      </header>

      {status === 'loading' && <p className="app-message">Loading places…</p>}
      {status === 'error' && (
        <p className="app-message">Couldn't load places. Please try again later.</p>
      )}
      {status === 'ready' && (
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
          <PlaceList
            places={filteredPlaces}
            now={now}
            onSelectPlace={setSelectedPlace}
            center={center}
          />
          <DetailSheet place={selectedPlace} now={now} onClose={() => setSelectedPlace(null)} />
        </>
      )}
    </div>
  )
}

export default App
