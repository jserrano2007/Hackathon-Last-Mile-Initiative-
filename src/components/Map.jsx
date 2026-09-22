import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { HARTFORD_CENTER, categoryColor, hasCoords } from '../utils/places'
import './Map.css'

function Map({ places }) {
  const pinnedPlaces = places.filter(hasCoords)

  return (
    <div className="place-map">
      <MapContainer
        center={[HARTFORD_CENTER.lat, HARTFORD_CENTER.lng]}
        zoom={13}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {pinnedPlaces.map((place) => (
          <CircleMarker
            key={place.id}
            center={[place.lat, place.lng]}
            radius={9}
            pathOptions={{
              color: '#ffffff',
              weight: 2,
              fillColor: categoryColor(place.category),
              fillOpacity: 0.9,
            }}
          >
            <Popup>
              <strong>{place.name}</strong>
              <br />
              {place.address}
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  )
}

export default Map
