import { HARTFORD_CENTER, categoryLabel, distanceMiles, hasCoords } from '../utils/places'
import { getNow, getStatusLine } from '../utils/hours'
import { formatListingPrice, getReadyStatus } from '../utils/listings'
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
        const isGrower = place.category === 'home_grower'
        const statusLine = isGrower ? getReadyStatus(place, now) : getStatusLine(place, now)
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
            <div className="place-category">{categoryLabel(place.category)}</div>
            {isGrower ? (
              <div className="place-address">
                {place.cropName} · {formatListingPrice(place)}
              </div>
            ) : (
              <div className="place-address">{place.address}</div>
            )}
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
