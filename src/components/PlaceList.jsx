import { HARTFORD_CENTER, distanceMiles, hasCoords } from '../utils/places'
import { categoryColor, categoryLabel } from '../utils/categories'
import { getNow, getStatusLine } from '../utils/hours'
import './PlaceList.css'

function PlaceList({ places, now = getNow(), onSelectPlace, center = HARTFORD_CENTER }) {
  const sorted = [...places].sort((a, b) => {
    const aHas = hasCoords(a)
    const bHas = hasCoords(b)
    if (aHas && !bHas) return -1
    if (!aHas && bHas) return 1
    if (!aHas && !bHas) return 0
    return (
      distanceMiles(center.lat, center.lng, a.lat, a.lng) -
      distanceMiles(center.lat, center.lng, b.lat, b.lng)
    )
  })

  return (
    <ul className="place-list">
      {sorted.map((place) => {
        const isGroup = place.isNeighborhoodGroup
        const statusLine = isGroup ? null : getStatusLine(place, now)
        return (
          <li
            key={place.id}
            className="place-card"
            role="button"
            tabIndex={0}
            onClick={() => onSelectPlace(place)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                onSelectPlace(place)
              }
            }}
          >
            <div className="place-card-header">
              <span className="place-name">{place.name}</span>
              {hasCoords(place) && (
                <span className="place-distance">
                  {distanceMiles(center.lat, center.lng, place.lat, place.lng).toFixed(1)}{' '}
                  mi
                </span>
              )}
            </div>
            <div className="place-category" style={{ color: categoryColor(place.category) }}>
              {isGroup ? 'Neighbors' : categoryLabel(place.category)}
            </div>
            {isGroup ? (
              <div className="place-status">Tap to see listings</div>
            ) : (
              <>
                <div className="place-address">{place.address}</div>
                <div className={`place-status${statusLine.open ? ' open' : ''}`}>
                  {statusLine.text}
                </div>
              </>
            )}
          </li>
        )
      })}
    </ul>
  )
}

export default PlaceList
