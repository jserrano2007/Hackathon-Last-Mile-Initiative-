import { LEGEND_ITEMS } from '../utils/categories'
import './CategoryLegend.css'

function CategoryLegend() {
  return (
    <div className="category-legend">
      {LEGEND_ITEMS.map((item) => (
        <span key={item.label} className="legend-item">
          <span className="legend-dot" style={{ background: item.color }} />
          {item.label}
        </span>
      ))}
    </div>
  )
}

export default CategoryLegend
