import { useEffect, useRef, useState } from 'react'
import { CROPS, GROWING_METHODS, getGrowthProgress, getListingEligibility } from '../utils/plantings'
import { formatShortDate, toDateStr } from '../utils/dates'
import './MyGarden.css'

function MyGarden({
  plantings,
  listings,
  prefillCropId,
  now,
  onAddPlanting,
  onRemovePlanting,
  onAddNote,
  onListForSale,
  onConsumePrefill,
  onGoToGrow,
}) {
  const todayStr = toDateStr(now)

  const [form, setForm] = useState(() => ({
    cropId: prefillCropId || CROPS[0]?.id || '',
    datePlanted: todayStr,
    method: GROWING_METHODS[0],
  }))
  const [noteDrafts, setNoteDrafts] = useState({})
  const [confirmingRemoveId, setConfirmingRemoveId] = useState(null)
  const noteCounterRef = useRef(0)

  useEffect(() => {
    if (prefillCropId) onConsumePrefill()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    onAddPlanting({
      id: `planting-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      cropId: form.cropId,
      datePlanted: form.datePlanted,
      method: form.method,
      notes: [],
    })
    setForm({ cropId: CROPS[0]?.id || '', datePlanted: todayStr, method: GROWING_METHODS[0] })
  }

  function handleLogNote(plantingId) {
    const text = (noteDrafts[plantingId] || '').trim()
    if (!text) return
    noteCounterRef.current += 1
    onAddNote(plantingId, {
      id: `note-${plantingId}-${noteCounterRef.current}`,
      date: todayStr,
      text,
    })
    setNoteDrafts((prev) => ({ ...prev, [plantingId]: '' }))
  }

  const sorted = [...plantings].sort((a, b) => {
    const progressA = getGrowthProgress(a, now)
    const progressB = getGrowthProgress(b, now)
    const remainingA = progressA ? progressA.daysRemaining : Infinity
    const remainingB = progressB ? progressB.daysRemaining : Infinity
    return remainingA - remainingB
  })

  return (
    <div className="my-garden">
      <form className="garden-form" onSubmit={handleSubmit}>
        <h2>Track a planting</h2>

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
            max={todayStr}
            onChange={(event) => updateField('datePlanted', event.target.value)}
            required
          />
        </label>

        <label className="field">
          <span>Growing method</span>
          <select
            value={form.method}
            onChange={(event) => updateField('method', event.target.value)}
          >
            {GROWING_METHODS.map((method) => (
              <option key={method} value={method}>
                {method}
              </option>
            ))}
          </select>
        </label>

        <button type="submit" className="garden-submit">
          Start tracking
        </button>
      </form>

      {sorted.length === 0 ? (
        <div className="garden-empty">
          <p>You're not tracking anything yet.</p>
          <p>Head to the Grow tab to find a crop and start tracking it.</p>
          <button type="button" className="garden-empty-btn" onClick={onGoToGrow}>
            Browse grow guides
          </button>
        </div>
      ) : (
        <ul className="garden-list">
          {sorted.map((planting) => {
            const progress = getGrowthProgress(planting, now)
            if (!progress) return null
            const isConfirming = confirmingRemoveId === planting.id
            const existingListing = listings.find((listing) => listing.plantingId === planting.id)
            const eligibility = getListingEligibility(planting, now)

            return (
              <li key={planting.id} className="garden-card">
                <div className="garden-card-header">
                  <span className="place-name">{progress.cropName}</span>
                  <span className="garden-method">{planting.method}</span>
                </div>

                <div className="garden-progress-track">
                  <div
                    className="garden-progress-fill"
                    style={{ width: `${progress.fraction * 100}%` }}
                  />
                </div>

                <div className="garden-day-count">
                  Day {progress.dayIndex} of about {progress.totalDays}
                </div>
                <div className={`place-status${progress.isReady ? ' open' : ''}`}>
                  {progress.isReady
                    ? 'Should be ready to harvest now'
                    : `Harvest in about ${progress.daysRemaining} days (around ${formatShortDate(progress.harvestDateStr)})`}
                </div>

                <div className="garden-photo-slot" aria-hidden="true" />

                <div className="garden-notes">
                  <ul className="garden-notes-list">
                    {planting.notes.map((note) => (
                      <li key={note.id}>
                        {formatShortDate(note.date)}: {note.text}
                      </li>
                    ))}
                  </ul>
                  <div className="garden-notes-input">
                    <input
                      type="text"
                      placeholder="Add a note…"
                      value={noteDrafts[planting.id] || ''}
                      onChange={(event) =>
                        setNoteDrafts((prev) => ({ ...prev, [planting.id]: event.target.value }))
                      }
                    />
                    <button type="button" onClick={() => handleLogNote(planting.id)}>
                      Log
                    </button>
                  </div>
                </div>

                <div className="garden-actions">
                  {existingListing ? (
                    <button
                      type="button"
                      className="garden-sell-btn"
                      onClick={() => onListForSale({ mode: 'edit', listing: existingListing })}
                    >
                      Edit listing
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="garden-sell-btn"
                      disabled={!eligibility.canList}
                      onClick={() =>
                        onListForSale({
                          mode: 'create',
                          plantingId: planting.id,
                          cropId: planting.cropId,
                          datePlanted: planting.datePlanted,
                        })
                      }
                    >
                      {eligibility.canList
                        ? 'List for sale'
                        : `You can list this in ${eligibility.daysUntilEligible} day${eligibility.daysUntilEligible === 1 ? '' : 's'}`}
                    </button>
                  )}

                  {isConfirming ? (
                    <div className="garden-confirm-remove">
                      <span>Remove this planting?</span>
                      <button
                        type="button"
                        className="garden-confirm-yes"
                        onClick={() => {
                          onRemovePlanting(planting.id)
                          setConfirmingRemoveId(null)
                        }}
                      >
                        Yes, remove
                      </button>
                      <button
                        type="button"
                        className="garden-confirm-no"
                        onClick={() => setConfirmingRemoveId(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="garden-remove-btn"
                      onClick={() => setConfirmingRemoveId(planting.id)}
                    >
                      Remove
                    </button>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

export default MyGarden
