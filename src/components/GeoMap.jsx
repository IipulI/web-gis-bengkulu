// GeoMap.jsx
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";

const GeoMap = ({
  center = [-3.83, 102.3],
  zoom = 11,
  activeLayerData = [],
}) => {
  return (
    <MapContainer center={center} zoom={zoom} className="w-full min-h-full">
      <TileLayer
        attribution="&copy; OpenStreetMap"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {activeLayerData.map((layer) => (
        <GeoJSON
          key={layer.id}
          data={layer.data}
          style={{
            color: layer.color,
            weight: 2,
            fillOpacity: 0.3,
          }}
        />
      ))}
    </MapContainer>
  );
};

export default GeoMap;
