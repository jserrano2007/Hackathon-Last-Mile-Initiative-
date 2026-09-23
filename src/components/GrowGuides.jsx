import { useState } from 'react'
import guides from '../data/guides.json'
import './GrowGuides.css'

function GrowGuides({ onStartTracking }) {
  const [expandedId, setExpandedId] = useState(null)

  function toggleCrop(id) {
    setExpandedId((prev) => (prev === id ? null : id))
  }

  return (
    <div className="grow-guides">
      <p className="grow-intro">{guides.intro}</p>

      <ul className="grow-crop-list">
        {guides.crops.map((crop) => {
          const expanded = expandedId === crop.id
          return (
            <li key={crop.id} className="grow-crop-card">
              <button
                type="button"
                className="grow-crop-summary"
                aria-expanded={expanded}
                onClick={() => toggleCrop(crop.id)}
              >
                <span className="grow-crop-summary-text">
                  <span className="grow-crop-name">{crop.name}</span>
                  <span className="grow-crop-meta">
                    {crop.difficulty} · ~{crop.daysToHarvest} days to harvest
                  </span>
                </span>
                <span className="grow-crop-chevron" aria-hidden="true">
                  {expanded ? '−' : '+'}
                </span>
              </button>

              {expanded && (
                <div className="grow-crop-details">
                  <div className="grow-detail-row">
                    <span className="grow-detail-label">Starting cost</span>
                    <span>{crop.startingCost}</span>
                  </div>
                  <div className="grow-detail-row">
                    <span className="grow-detail-label">Space needed</span>
                    <span>{crop.space}</span>
                  </div>
                  <div className="grow-detail-row">
                    <span className="grow-detail-label">When to plant</span>
                    <span>{crop.whenToPlant}</span>
                  </div>
                  <div className="grow-detail-row">
                    <span className="grow-detail-label">Watering</span>
                    <span>{crop.watering}</span>
                  </div>
                  <div className="grow-detail-row">
                    <span className="grow-detail-label">Signs of trouble</span>
                    <span>{crop.troubleSigns}</span>
                  </div>
                  <button
                    type="button"
                    className="grow-track-btn"
                    onClick={() => onStartTracking(crop.id)}
                  >
                    Start tracking this crop
                  </button>
                </div>
              )}
            </li>
          )
        })}
      </ul>

      <div className="grow-hydro-card">
        <h3>{guides.hydroponics.title}</h3>
        <p>{guides.hydroponics.description}</p>
        <p className="grow-hydro-example">{guides.hydroponics.localExample}</p>
      </div>
    </div>
  )
}

export default GrowGuides
