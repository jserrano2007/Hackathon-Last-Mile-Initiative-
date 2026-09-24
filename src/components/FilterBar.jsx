import { categoryColor } from '../utils/categories'
import './FilterBar.css'

const CHIPS = [
  { key: 'openNow', label: 'Open now' },
  { key: 'snap', label: 'Takes SNAP' },
  { key: 'markets', label: 'Markets', color: categoryColor('farmers_market') },
  { key: 'grocery', label: 'Grocery', color: categoryColor('grocery') },
  { key: 'farms', label: 'Farms', color: categoryColor('urban_farm') },
  { key: 'freeFood', label: 'Free food', color: categoryColor('food_pantry') },
  { key: 'neighbors', label: 'Neighbors', color: categoryColor('home_grower') },
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
          style={
            filters[chip.key] && chip.color
              ? { background: chip.color, borderColor: chip.color }
              : undefined
          }
        >
          {chip.label}
        </button>
      ))}
    </div>
  )
}

export default FilterBar
