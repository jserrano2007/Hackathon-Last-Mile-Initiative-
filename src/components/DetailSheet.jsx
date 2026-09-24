import { useEffect, useState } from 'react'
import { WEEK_ORDER, formatDayRanges, getStatusLine, getTodayKey } from '../utils/hours'
import { directionsAddress } from '../utils/places'
import { categoryLabel } from '../utils/categories'
import './DetailSheet.css'

function programStatus(value) {
  if (value === true) return 'Yes'
  if (typeof value === 'string') return value
  return 'Not confirmed'
}

function DetailSheet({ place, now, onClose }) {
  const [displayPlace, setDisplayPlace] = useState(place)
  const isOpen = Boolean(place)

  if (place && place !== displayPlace) {
    setDisplayPlace(place)
  }

  useEffect(() => {
    if (!isOpen) return undefined
    function handleKeyDown(event) {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!displayPlace) return null

  const statusLine = getStatusLine(displayPlace, now)
  const todayKey = getTodayKey(now)

  return (
    <div
      className={`detail-backdrop${isOpen ? ' open' : ''}`}
      onClick={onClose}
      aria-hidden={!isOpen}
    >
      <div
        className={`detail-sheet${isOpen ? ' open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={displayPlace.name}
        onClick={(event) => event.stopPropagation()}
      >
        <button type="button" className="detail-close" onClick={onClose} aria-label="Close">
          ×
        </button>

        <h2 className="detail-name">{displayPlace.name}</h2>
        <div className="detail-category">{categoryLabel(displayPlace.category)}</div>
        <div className="detail-address">{displayPlace.address}</div>
        <div className={`detail-status${statusLine.open ? ' open' : ''}`}>{statusLine.text}</div>

        <div className="detail-directions">
          <a
            className="detail-direction-btn"
            href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(directionsAddress(displayPlace))}&travelmode=transit`}
            target="_blank"
            rel="noreferrer"
          >
            Bus directions
          </a>
          <a
            className="detail-direction-btn"
            href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(directionsAddress(displayPlace))}&travelmode=walking`}
            target="_blank"
            rel="noreferrer"
          >
            Walking directions
          </a>
        </div>

        <section className="detail-section">
          <h3>Hours</h3>
          <ul className="detail-hours">
            {WEEK_ORDER.map((day) => (
              <li
                key={day.key}
                className={`detail-hours-row${day.key === todayKey ? ' today' : ''}`}
              >
                <span className="detail-hours-day">{day.label}</span>
                <span className="detail-hours-range">
                  {formatDayRanges(displayPlace.hours?.[day.key])}
                </span>
              </li>
            ))}
          </ul>
          {displayPlace.season && (
            <div className="detail-season">
              Season: {displayPlace.season.start} – {displayPlace.season.end}
            </div>
          )}
        </section>

        <section className="detail-section">
          <h3>Assistance programs</h3>
          <ul className="detail-programs">
            <li>
              <span>SNAP</span>
              <span>{programStatus(displayPlace.snap)}</span>
            </li>
            <li>
              <span>SNAP match</span>
              <span>{programStatus(displayPlace.snapMatch)}</span>
            </li>
            <li>
              <span>WIC FMNP</span>
              <span>{programStatus(displayPlace.wicFmnp)}</span>
            </li>
            <li>
              <span>Senior FMNP</span>
              <span>{programStatus(displayPlace.seniorFmnp)}</span>
            </li>
          </ul>
        </section>

        {(displayPlace.phone || displayPlace.website) && (
          <section className="detail-section detail-links">
            {displayPlace.phone && (
              <a href={`tel:${displayPlace.phone.replace(/[^\d+]/g, '')}`}>
                {displayPlace.phone}
              </a>
            )}
            {displayPlace.website && (
              <a href={displayPlace.website} target="_blank" rel="noreferrer">
                Visit website
              </a>
            )}
          </section>
        )}

        {displayPlace.notes && (
          <section className="detail-section">
            <h3>Notes</h3>
            <p className="detail-notes">{displayPlace.notes}</p>
          </section>
        )}

        {displayPlace.sourceUrl && (
          <a
            className="detail-source-link"
            href={displayPlace.sourceUrl}
            target="_blank"
            rel="noreferrer"
          >
            Info from this source
          </a>
        )}
      </div>
    </div>
  )
}

export default DetailSheet
