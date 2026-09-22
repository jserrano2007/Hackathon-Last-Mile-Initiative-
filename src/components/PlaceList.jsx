import { HARTFORD_CENTER, categoryLabel, distanceMiles, hasCoords } from '../utils/places'
import { getNow, getStatusLine } from '../utils/hours'
import './PlaceList.css'

function PlaceList({ places, now = getNow() }) {
  const sorted = [...places].sort((a, b) => {
    const aHas = hasCoords(a)
    const bHas = hasCoords(b)
    if (aHas && !bHas) return -1
    if (!aHas && bHas) return 1
    if (!aHas && !bHas) return 0
    return (
      distanceMiles(HARTFORD_CENTER.lat, HARTFORD_CENTER.lng, a.lat, a.lng) -
      distanceMiles(HARTFORD_CENTER.lat, HARTFORD_CENTER.lng, b.lat, b.lng)
    )
  })

  return (
    <ul className="place-list">
      {sorted.map((place) => {
        const statusLine = getStatusLine(place, now)
        return (
          <li key={place.id} className="place-card">
            <div className="place-card-header">
              <span className="place-name">{place.name}</span>
              {hasCoords(place) && (
                <span className="place-distance">
                  {distanceMiles(
                    HARTFORD_CENTER.lat,
                    HARTFORD_CENTER.lng,
                    place.lat,
                    place.lng,
                  ).toFixed(1)}{' '}
                  mi
                </span>
              )}
            </div>
            <div className="place-category">{categoryLabel(place.category)}</div>
            <div className="place-address">{place.address}</div>
            <div className={`place-status${statusLine.open ? ' open' : ''}`}>
              {statusLine.text}
            </div>
          </li>
        )
      })}
    </ul>
  )
}

export default PlaceList
