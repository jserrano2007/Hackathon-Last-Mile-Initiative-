import { useCallback, useEffect, useMemo, useState } from 'react'
import TabBar from './components/TabBar'
import FindFoodTab from './components/FindFoodTab'
import SellForm from './components/SellForm'
import GrowGuides from './components/GrowGuides'
import MyGarden from './components/MyGarden'
import { fetchPlaces } from './utils/places'
import { getNow } from './utils/hours'
import {
  getListings,
  saveListing,
  updateListing,
  removeListing,
  getPlantings,
  savePlanting,
  removePlanting,
  addPlantingNote,
} from './data/store'
import './App.css'

function App() {
  const [activeTab, setActiveTab] = useState('find')
  const [places, setPlaces] = useState([])
  const [status, setStatus] = useState('loading')
  const [listings, setListings] = useState(() => getListings())
  const [plantings, setPlantings] = useState(() => getPlantings())
  const [growPrefillCropId, setGrowPrefillCropId] = useState(null)
  const [sellPrefill, setSellPrefill] = useState(null)
  const [sellPrefillToken, setSellPrefillToken] = useState(0)
  const now = useMemo(() => getNow(), [])

  useEffect(() => {
    fetchPlaces()
      .then((data) => {
        setPlaces(data)
        setStatus('ready')
      })
      .catch(() => setStatus('error'))
  }, [])

  function handleSaveListing(listing) {
    saveListing(listing)
    setListings(getListings())
  }

  function handleUpdateListing(id, patch) {
    updateListing(id, patch)
    setListings(getListings())
  }

  function handleRemoveListing(id) {
    removeListing(id)
    setListings(getListings())
  }

  function handleAddPlanting(planting) {
    savePlanting(planting)
    setPlantings(getPlantings())
  }

  function handleRemovePlanting(id) {
    removePlanting(id)
    setPlantings(getPlantings())
  }

  function handleAddPlantingNote(plantingId, note) {
    addPlantingNote(plantingId, note)
    setPlantings(getPlantings())
  }

  const handleConsumeGrowPrefill = useCallback(() => setGrowPrefillCropId(null), [])
  const handleConsumeSellPrefill = useCallback(() => setSellPrefill(null), [])

  function handleStartTracking(cropId) {
    setGrowPrefillCropId(cropId)
    setActiveTab('garden')
  }

  function handleListForSale(prefill) {
    setSellPrefill(prefill)
    setSellPrefillToken((token) => token + 1)
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
            key={sellPrefillToken}
            listings={listings}
            now={now}
            prefill={sellPrefill}
            onSaveListing={handleSaveListing}
            onUpdateListing={handleUpdateListing}
            onRemoveListing={handleRemoveListing}
            onListForSale={handleListForSale}
            onConsumePrefill={handleConsumeSellPrefill}
            onGoToGarden={() => setActiveTab('garden')}
          />
        )}
        {activeTab === 'grow' && <GrowGuides onStartTracking={handleStartTracking} />}
        {activeTab === 'garden' && (
          <MyGarden
            plantings={plantings}
            listings={listings}
            prefillCropId={growPrefillCropId}
            now={now}
            onAddPlanting={handleAddPlanting}
            onRemovePlanting={handleRemovePlanting}
            onAddNote={handleAddPlantingNote}
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
