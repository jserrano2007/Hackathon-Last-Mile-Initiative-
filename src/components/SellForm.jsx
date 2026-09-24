import { useEffect, useState } from 'react'
import { NEIGHBORHOODS } from '../utils/neighborhoods'
import {
  CROPS,
  formatListingPrice,
  formatShortDate,
  getReadyStatus,
  getReadyWindow,
  jitteredCoords,
} from '../utils/listings'
import './SellForm.css'

const UNITS = [
  { value: 'pint', label: 'Pint' },
  { value: 'lb', label: 'Pound' },
  { value: 'bunch', label: 'Bunch' },
  { value: 'head', label: 'Head' },
  { value: 'each', label: 'Each' },
  { value: 'free', label: 'Free' },
]

const INITIAL_FORM = {
  cropId: CROPS[0]?.id ?? '',
  datePlanted: '',
  price: '',
  unit: 'lb',
  neighborhoodKey: NEIGHBORHOODS[0]?.key ?? '',
  displayName: '',
  snap: false,
}

function SellForm({ listings, now, onAddListing, onRemoveListing, prefill, onConsumePrefill }) {
  const [form, setForm] = useState(() => ({
    ...INITIAL_FORM,
    ...(prefill ? { cropId: prefill.cropId, datePlanted: prefill.datePlanted } : {}),
  }))

  useEffect(() => {
    if (prefill) onConsumePrefill()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const readyWindow =
    form.cropId && form.datePlanted ? getReadyWindow(form.datePlanted, form.cropId) : null

  function handleSubmit(event) {
    event.preventDefault()
    const neighborhood = NEIGHBORHOODS.find((n) => n.key === form.neighborhoodKey)
    if (!neighborhood) return
    const offset = jitteredCoords(neighborhood)

    onAddListing({
      id: `listing-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      cropId: form.cropId,
      datePlanted: form.datePlanted,
      price: form.unit === 'free' ? 0 : Number(form.price),
      unit: form.unit,
      neighborhoodKey: form.neighborhoodKey,
      displayName: form.displayName.trim(),
      snap: form.snap,
      lat: offset.lat,
      lng: offset.lng,
    })

    setForm(INITIAL_FORM)
  }

  return (
    <div className="sell-tab">
      <form className="sell-form" onSubmit={handleSubmit}>
        <h2>List what you're growing</h2>

        <label className="field">
          <span>Crop</span>
          <select
            value={form.cropId}
            onChange={(event) => updateField('cropId', event.target.value)}
            required
          >
            {CROPS.map((crop) => (
              <option key={crop.id} value={crop.id}>
                {crop.name}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Date planted</span>
          <input
            type="date"
            value={form.datePlanted}
            onChange={(event) => updateField('datePlanted', event.target.value)}
            required
          />
        </label>

        <label className="field">
          <span>Unit</span>
          <select value={form.unit} onChange={(event) => updateField('unit', event.target.value)}>
            {UNITS.map((unit) => (
              <option key={unit.value} value={unit.value}>
                {unit.label}
              </option>
            ))}
          </select>
        </label>

        {form.unit !== 'free' && (
          <label className="field">
            <span>Price ($)</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={(event) => updateField('price', event.target.value)}
              required
            />
          </label>
        )}

        <label className="field">
          <span>Neighborhood</span>
          <select
            value={form.neighborhoodKey}
            onChange={(event) => updateField('neighborhoodKey', event.target.value)}
            required
          >
            {NEIGHBORHOODS.map((neighborhood) => (
              <option key={neighborhood.key} value={neighborhood.key}>
                {neighborhood.label}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Display name</span>
          <input
            type="text"
            placeholder="e.g. Jamie's Backyard"
            value={form.displayName}
            onChange={(event) => updateField('displayName', event.target.value)}
            required
          />
        </label>

        <label className="field field-checkbox">
          <input
            type="checkbox"
            checked={form.snap}
            onChange={(event) => updateField('snap', event.target.checked)}
          />
          <span>Can accept SNAP</span>
        </label>

        {readyWindow && (
          <p className="sell-preview">
            Neighbors will see it as ready around {formatShortDate(readyWindow.start)} –{' '}
            {formatShortDate(readyWindow.end)}
          </p>
        )}

        <button type="submit" className="sell-submit">
          Add listing
        </button>
      </form>

      {listings.length > 0 && (
        <div className="sell-listings">
          <h2>Your listings</h2>
          <ul className="sell-listings-list">
            {listings.map((listing) => {
              const status = getReadyStatus(listing, now)
              const neighborhood = NEIGHBORHOODS.find((n) => n.key === listing.neighborhoodKey)
              const crop = CROPS.find((c) => c.id === listing.cropId)
              return (
                <li key={listing.id} className="sell-listing-card">
                  <div className="sell-listing-header">
                    <span className="place-name">{listing.displayName}</span>
                    <button
                      type="button"
                      className="sell-remove-btn"
                      onClick={() => onRemoveListing(listing.id)}
                    >
                      Remove
                    </button>
                  </div>
                  <div className="place-address">
                    {crop ? crop.name : listing.cropId} · {formatListingPrice(listing)} ·{' '}
                    {neighborhood ? neighborhood.label : ''}
                  </div>
                  <div className={`place-status${status.open ? ' open' : ''}`}>{status.text}</div>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}

export default SellForm
