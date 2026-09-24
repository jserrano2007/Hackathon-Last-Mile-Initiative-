import cropsData from '../data/crops.json'

export const CROPS = cropsData.crops

export function getCropById(cropId) {
  return CROPS.find((crop) => crop.id === cropId)
}
