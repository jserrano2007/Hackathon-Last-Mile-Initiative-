import './FilterBar.css'

const CHIPS = [
  { key: 'openNow', label: 'Open now' },
  { key: 'snap', label: 'Takes SNAP' },
  { key: 'markets', label: 'Markets' },
  { key: 'grocery', label: 'Grocery' },
  { key: 'farms', label: 'Farms' },
  { key: 'freeFood', label: 'Free food' },
]

function FilterBar({ filters, onToggle }) {
  return (
    <div className="filter-bar">
      {CHIPS.map((chip) => (
        <button
          key={chip.key}
          type="button"
          className={`filter-chip${filters[chip.key] ? ' active' : ''}`}
          aria-pressed={filters[chip.key]}
          onClick={() => onToggle(chip.key)}
        >
          {chip.label}
        </button>
      ))}
    </div>
  )
}

export default FilterBar
