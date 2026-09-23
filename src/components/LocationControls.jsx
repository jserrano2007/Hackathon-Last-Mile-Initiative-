import { NEIGHBORHOODS } from '../utils/neighborhoods'
import './LocationControls.css'

function LocationControls({
  selectedNeighborhood,
  locationStatus,
  onUseMyLocation,
  onSelectNeighborhood,
}) {
  return (
    <div className="location-controls">
      <div className="location-controls-row">
        <button
          type="button"
          className="location-btn"
          onClick={onUseMyLocation}
          disabled={locationStatus === 'locating'}
        >
          {locationStatus === 'locating' ? 'Finding you…' : 'Use my location'}
        </button>
        <select
          className="neighborhood-select"
          value={selectedNeighborhood}
          onChange={(event) => onSelectNeighborhood(event.target.value)}
          aria-label="Choose a neighborhood"
        >
          <option value="">Choose a neighborhood…</option>
          {NEIGHBORHOODS.map((neighborhood) => (
            <option key={neighborhood.key} value={neighborhood.key}>
              {neighborhood.label}
            </option>
          ))}
        </select>
      </div>
      {locationStatus === 'error' && (
        <p className="location-message">
          Couldn't get your location. Showing the map center instead.
        </p>
      )}
    </div>
  )
}

export default LocationControls
