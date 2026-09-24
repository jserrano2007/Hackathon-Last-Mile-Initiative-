import { useEffect, useState } from 'react'
import { NEIGHBORHOODS } from '../utils/neighborhoods'
import { getCropById } from '../utils/crops'
import { formatListingPrice, getReadyStatus } from '../utils/listings'
import { formatShortDate } from '../utils/dates'
import { resizeImageToDataUrl } from '../utils/image'
import './SellForm.css'

const UNITS = [
  { value: 'pint', label: 'Pint' },
  { value: 'lb', label: 'Pound' },
  { value: 'bunch', label: 'Bunch' },
  { value: 'head', label: 'Head' },
  { value: 'each', label: 'Each' },
  { value: 'free', label: 'Free' },
]

const EMPTY_FORM = {
  mode: 'none',
  listingId: null,
  plantingId: null,
  cropId: null,
  datePlanted: null,
  neighborhoodKey: NEIGHBORHOODS[0]?.key ?? '',
  displayName: '',
  price: '',
  unit: 'lb',
  snap: false,
  photo: null,
}

function buildInitialForm(prefill) {
  if (prefill?.mode === 'edit') {
    const { listing } = prefill
    return {
      mode: 'edit',
      listingId: listing.id,
      plantingId: listing.plantingId,
      cropId: listing.cropId,
      datePlanted: listing.datePlanted,
      neighborhoodKey: listing.neighborhoodKey,
      displayName: listing.displayName,
      price: listing.unit === 'free' ? '' : String(listing.price),
      unit: listing.unit,
      snap: listing.snap,
      photo: listing.photo,
    }
  }

  if (prefill?.mode === 'create') {
    return {
      ...EMPTY_FORM,
      mode: 'create',
      plantingId: prefill.plantingId,
      cropId: prefill.cropId,
      datePlanted: prefill.datePlanted,
    }
  }

  return EMPTY_FORM
}

function SellForm({
  listings,
  now,
  prefill,
  onSaveListing,
  onUpdateListing,
  onRemoveListing,
  onListForSale,
  onConsumePrefill,
  onGoToGarden,
}) {
  const [form, setForm] = useState(() => buildInitialForm(prefill))
  const [submitted, setSubmitted] = useState(false)
  const [photoError, setPhotoError] = useState(null)

  useEffect(() => {
    if (prefill) onConsumePrefill()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handlePhotoChange(event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    setPhotoError(null)
    try {
      const dataUrl = await resizeImageToDataUrl(file)
      updateField('photo', dataUrl)
    } catch {
      setPhotoError("Couldn't process that photo. Try a different image.")
    }
  }

  function handleSubmit(event) {
    event.preventDefault()
    const payload = {
      neighborhoodKey: form.neighborhoodKey,
      displayName: form.displayName.trim(),
      price: form.unit === 'free' ? 0 : Number(form.price),
      unit: form.unit,
      snap: form.snap,
      photo: form.photo,
    }

    if (form.mode === 'edit') {
      onUpdateListing(form.listingId, payload)
    } else {
      onSaveListing({
        id: `listing-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        plantingId: form.plantingId,
        cropId: form.cropId,
        datePlanted: form.datePlanted,
        demo: false,
        sellerRating: null,
        sellerReviewCount: null,
        ...payload,
      })
    }

    setSubmitted(true)
  }

  const crop = form.cropId ? getCropById(form.cropId) : null
  const myListings = listings.filter((listing) => !listing.demo)

  function handleEditListing(listing) {
    onListForSale({ mode: 'edit', listing })
  }

  return (
    <div className="sell-tab">
      {form.mode !== 'none' && !submitted && (
        <form className="sell-form" onSubmit={handleSubmit}>
          <h2>{form.mode === 'edit' ? 'Edit your listing' : 'List this harvest'}</h2>

          <div className="field">
            <span>Crop</span>
            <div className="field-readonly">{crop ? crop.name : form.cropId}</div>
          </div>

          <div className="field">
            <span>Planted</span>
            <div className="field-readonly">
              {form.datePlanted ? formatShortDate(form.datePlanted) : 'Unknown'}
            </div>
          </div>

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
            <span>Photo (optional)</span>
            <input type="file" accept="image/*" onChange={handlePhotoChange} />
          </label>
          {photoError && <p className="sell-photo-error">{photoError}</p>}
          {form.photo && (
            <div className="sell-photo-preview">
              <img src={form.photo} alt="Listing preview" />
              <button type="button" onClick={() => updateField('photo', null)}>
                Remove photo
              </button>
            </div>
          )}

          <label className="field field-checkbox">
            <input
              type="checkbox"
              checked={form.snap}
              onChange={(event) => updateField('snap', event.target.checked)}
            />
            <span>Can accept SNAP</span>
          </label>

          <button type="submit" className="sell-submit">
            {form.mode === 'edit' ? 'Save changes' : 'Publish listing'}
          </button>
        </form>
      )}

      {form.mode !== 'none' && submitted && (
        <div className="sell-success">
          <p>{form.mode === 'edit' ? 'Listing updated.' : 'Listing published.'}</p>
          <button type="button" className="sell-success-btn" onClick={onGoToGarden}>
            Back to My garden
          </button>
        </div>
      )}

      {form.mode === 'none' && (
        <div className="sell-empty">
          <p>Ready to sell something?</p>
          <p>
            Head to My garden and tap “List for sale” on a planting that's within a week of
            harvest.
          </p>
          <button type="button" className="sell-empty-btn" onClick={onGoToGarden}>
            Go to My garden
          </button>
        </div>
      )}

      <p className="sell-rule-note">
        You can list a crop starting 7 days before its estimated harvest date, so neighbors always
        see a realistic ready date.
      </p>

      <div className="sell-listings">
        <h2>My listings</h2>
        {myListings.length === 0 ? (
          <p className="sell-listings-empty">You haven't listed anything yet.</p>
        ) : (
          <ul className="sell-listings-list">
            {myListings.map((listing) => {
              const status = getReadyStatus(listing, now)
              const neighborhood = NEIGHBORHOODS.find((n) => n.key === listing.neighborhoodKey)
              const listingCrop = getCropById(listing.cropId)
              return (
                <li key={listing.id} className="sell-listing-card">
                  <div className="sell-listing-header">
                    <span className="place-name">{listing.displayName}</span>
                    <div className="sell-listing-buttons">
                      <button
                        type="button"
                        className="sell-edit-btn"
                        onClick={() => handleEditListing(listing)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="sell-remove-btn"
                        onClick={() => onRemoveListing(listing.id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <div className="place-address">
                    {listingCrop ? listingCrop.name : listing.cropId} ·{' '}
                    {formatListingPrice(listing)} · {neighborhood ? neighborhood.label : ''}
                  </div>
                  <div className={`place-status${status.open ? ' open' : ''}`}>{status.text}</div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}

export default SellForm
