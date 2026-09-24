import { useEffect, useState } from 'react'
import { getCropById } from '../utils/crops'
import { formatListingPrice, getReadyWindow } from '../utils/listings'
import { formatShortDate, toDateStr } from '../utils/dates'
import { categoryColor } from '../utils/categories'
import './NeighborhoodSheet.css'

function StarRating({ rating, reviewCount }) {
  if (rating == null) return <span className="seller-rating new">New seller</span>
  const rounded = Math.round(rating)
  const stars = '★★★★★'.slice(0, rounded) + '☆☆☆☆☆'.slice(rounded)
  return (
    <span className="seller-rating">
      <span className="seller-stars" aria-hidden="true">
        {stars}
      </span>
      {rating.toFixed(1)} ({reviewCount} review{reviewCount === 1 ? '' : 's'})
    </span>
  )
}

function ListingCard({ listing, now }) {
  const [showComingSoon, setShowComingSoon] = useState(false)
  const crop = getCropById(listing.cropId)
  const cropName = crop ? crop.name : listing.cropId

  const readyWindow = getReadyWindow(listing.datePlanted, listing.cropId)
  const today = toDateStr(now)
  const isReadyNow = Boolean(readyWindow) && today >= readyWindow.start && today <= readyWindow.end
  const readyText = isReadyNow
    ? 'Ready now'
    : readyWindow
      ? `Ready ${formatShortDate(readyWindow.start)}`
      : 'Ready date unknown'

  return (
    <li className="feed-card">
      {listing.demo && <span className="demo-tag">Demo</span>}
      <div className="feed-card-photo">
        {listing.photo ? (
          <img src={listing.photo} alt={cropName} />
        ) : (
          <div
            className="feed-card-placeholder"
            style={{ background: categoryColor('home_grower') }}
          >
            {cropName}
          </div>
        )}
      </div>
      <div className="feed-card-body">
        <div className="feed-card-header">
          <span className="feed-card-crop">{cropName}</span>
          <span className="feed-card-price">{formatListingPrice(listing)}</span>
        </div>
        <div className={`place-status${isReadyNow ? ' open' : ''}`}>{readyText}</div>
        <div className="feed-card-seller">{listing.displayName}</div>
        <StarRating rating={listing.sellerRating} reviewCount={listing.sellerReviewCount} />
        {listing.snap && <span className="snap-badge">SNAP</span>}
        <div className="feed-card-actions">
          {showComingSoon ? (
            <span className="message-coming-soon">Coming soon</span>
          ) : (
            <button
              type="button"
              className="message-seller-btn"
              onClick={() => setShowComingSoon(true)}
            >
              Message seller
            </button>
          )}
        </div>
      </div>
    </li>
  )
}

function NeighborhoodSheet({ group, now, onClose }) {
  const [displayGroup, setDisplayGroup] = useState(group)
  const isOpen = Boolean(group)

  if (group && group !== displayGroup) {
    setDisplayGroup(group)
  }

  useEffect(() => {
    if (!isOpen) return undefined
    function handleKeyDown(event) {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!displayGroup) return null

  return (
    <div
      className={`detail-backdrop${isOpen ? ' open' : ''}`}
      onClick={onClose}
      aria-hidden={!isOpen}
    >
      <div
        className={`detail-sheet neighborhood-sheet${isOpen ? ' open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={displayGroup.neighborhoodLabel}
        onClick={(event) => event.stopPropagation()}
      >
        <button type="button" className="detail-close" onClick={onClose} aria-label="Close">
          ×
        </button>

        <h2 className="detail-name">
          {displayGroup.neighborhoodLabel} - {displayGroup.count} listing
          {displayGroup.count === 1 ? '' : 's'}
        </h2>

        <ul className="feed-list">
          {displayGroup.listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} now={now} />
          ))}
        </ul>
      </div>
    </div>
  )
}

export default NeighborhoodSheet
