import { useEffect, useMemo, useState } from 'react'
import TabBar from './components/TabBar'
import FindFoodTab from './components/FindFoodTab'
import SellForm from './components/SellForm'
import GrowGuides from './components/GrowGuides'
import ComingSoon from './components/ComingSoon'
import { fetchPlaces } from './utils/places'
import { getNow } from './utils/hours'
import { loadListings, saveListings } from './utils/listings'
import './App.css'

function App() {
  const [activeTab, setActiveTab] = useState('find')
  const [places, setPlaces] = useState([])
  const [status, setStatus] = useState('loading')
  const [listings, setListings] = useState(() => loadListings())
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
          />
        )}
        {activeTab === 'grow' && <GrowGuides onStartTracking={() => setActiveTab('garden')} />}
        {activeTab === 'garden' && <ComingSoon label="My garden" />}
      </main>

      <TabBar activeTab={activeTab} onSelectTab={setActiveTab} />
    </div>
  )
}

export default App
