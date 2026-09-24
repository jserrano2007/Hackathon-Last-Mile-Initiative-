export const CATEGORIES = {
  farmers_market: { label: 'Farmers market', color: '#F0B429' },
  grocery: { label: 'Grocery store', color: '#2E7D32' },
  small_grocery: { label: 'Small grocery', color: '#7CB342' },
  urban_farm: { label: 'Urban farm', color: '#00796B' },
  community_garden: { label: 'Community garden', color: '#00796B' },
  food_pantry: { label: 'Food pantry', color: '#7B1FA2' },
  home_grower: { label: 'Home grower', color: '#D84315' },
}

export const LEGEND_ITEMS = [
  { label: 'Farmers market', color: CATEGORIES.farmers_market.color },
  { label: 'Grocery', color: CATEGORIES.grocery.color },
  { label: 'Small grocery', color: CATEGORIES.small_grocery.color },
  { label: 'Urban farm & community garden', color: CATEGORIES.urban_farm.color },
  { label: 'Food pantry', color: CATEGORIES.food_pantry.color },
  { label: 'Home grower', color: CATEGORIES.home_grower.color },
]

export function categoryLabel(category) {
  return CATEGORIES[category]?.label ?? category
}

export function categoryColor(category) {
  return CATEGORIES[category]?.color ?? '#3b82f6'
}
