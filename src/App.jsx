import { useCallback, useEffect, useMemo, useState } from 'react'
import TabBar from './components/TabBar'
import FindFoodTab from './components/FindFoodTab'
import SellForm from './components/SellForm'
import GrowGuides from './components/GrowGuides'
import MyGarden from './components/MyGarden'
import { fetchPlaces } from './utils/places'
import { getNow } from './utils/hours'
import { loadListings, saveListings } from './utils/listings'
import { loadPlantings, savePlantings } from './utils/plantings'
import './App.css'

function App() {
  const [activeTab, setActiveTab] = useState('find')
  const [places, setPlaces] = useState([])
  const [status, setStatus] = useState('loading')
  const [listings, setListings] = useState(() => loadListings())
  const [plantings, setPlantings] = useState(() => loadPlantings())
  const [growPrefillCropId, setGrowPrefillCropId] = useState(null)
  const [sellPrefill, setSellPrefill] = useState(null)
  const now = useMemo(() => getNow(), [])

  useEffect(() => {
    fetchPlaces()
      .then((data) => {
        setPlaces(data)
        setStatus('ready')
      })
      .catch(() => setStatus('error'))
  }, [])

  function addListing(listing) {
    setListings((prev) => {
      const next = [...prev, listing]
      saveListings(next)
      return next
    })
  }

  function removeListing(id) {
    setListings((prev) => {
      const next = prev.filter((listing) => listing.id !== id)
      saveListings(next)
      return next
    })
  }

  function addPlanting(planting) {
    setPlantings((prev) => {
      const next = [...prev, planting]
      savePlantings(next)
      return next
    })
  }

  function removePlanting(id) {
    setPlantings((prev) => {
      const next = prev.filter((planting) => planting.id !== id)
      savePlantings(next)
      return next
    })
  }

  function addPlantingNote(plantingId, note) {
    setPlantings((prev) => {
      const next = prev.map((planting) =>
        planting.id === plantingId
          ? { ...planting, notes: [note, ...planting.notes] }
          : planting,
      )
      savePlantings(next)
      return next
    })
  }

  const handleConsumeGrowPrefill = useCallback(() => setGrowPrefillCropId(null), [])
  const handleConsumeSellPrefill = useCallback(() => setSellPrefill(null), [])

  function handleStartTracking(cropId) {
    setGrowPrefillCropId(cropId)
    setActiveTab('garden')
  }

  function handleListForSale(prefill) {
    setSellPrefill(prefill)
    setActiveTab('sell')
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>FreshMile</h1>
        <p>Fresh food near you in Hartford, CT</p>
      </header>

      <main className="app-content">
        {activeTab === 'find' && (
          <>
            {status === 'loading' && <p className="app-message">Loading places…</p>}
            {status === 'error' && (
              <p className="app-message">Couldn't load places. Please try again later.</p>
            )}
            {status === 'ready' && <FindFoodTab sources={places} listings={listings} now={now} />}
          </>
        )}
        {activeTab === 'sell' && (
          <SellForm
            listings={listings}
            now={now}
            onAddListing={addListing}
            onRemoveListing={removeListing}
            prefill={sellPrefill}
            onConsumePrefill={handleConsumeSellPrefill}
          />
        )}
        {activeTab === 'grow' && <GrowGuides onStartTracking={handleStartTracking} />}
        {activeTab === 'garden' && (
          <MyGarden
            plantings={plantings}
            prefillCropId={growPrefillCropId}
            now={now}
            onAddPlanting={addPlanting}
            onRemovePlanting={removePlanting}
            onAddNote={addPlantingNote}
            onListForSale={handleListForSale}
            onConsumePrefill={handleConsumeGrowPrefill}
            onGoToGrow={() => setActiveTab('grow')}
          />
        )}
      </main>

      <TabBar activeTab={activeTab} onSelectTab={setActiveTab} />
    </div>
  )
}

export default App
