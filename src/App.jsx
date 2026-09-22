import { useEffect, useMemo, useState } from 'react'
import Map from './components/Map'
import PlaceList from './components/PlaceList'
import FilterBar from './components/FilterBar'
import { fetchPlaces } from './utils/places'
import { getNow, isOpenNow } from './utils/hours'
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
          <Map places={filteredPlaces} />
          <FilterBar filters={filters} onToggle={toggleFilter} />
          <PlaceList places={filteredPlaces} now={now} />
        </>
      )}
    </div>
  )
}

export default App
