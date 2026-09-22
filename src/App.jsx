import { useEffect, useState } from 'react'
import Map from './components/Map'
import PlaceList from './components/PlaceList'
import { fetchPlaces } from './utils/places'
import './App.css'

function App() {
  const [places, setPlaces] = useState([])
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    fetchPlaces()
      .then((data) => {
        setPlaces(data)
        setStatus('ready')
      })
      .catch(() => setStatus('error'))
  }, [])

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
          <Map places={places} />
          <PlaceList places={places} />
        </>
      )}
    </div>
  )
}

export default App
