import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { MapPin } from 'lucide-react';

// Fix default Leaflet icon paths in bundlers
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface LocationPickerProps {
  initialLocation?: { latitude: number; longitude: number };
  onLocationChange: (loc: { latitude: number; longitude: number }) => void;
  height?: string;
}

function MapClickHandler({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export const LocationPickerMap: React.FC<LocationPickerProps> = ({
  initialLocation = { latitude: 37.7749, longitude: -122.4194 }, // SF downtown default
  onLocationChange,
  height = '280px',
}) => {
  const [position, setPosition] = useState<[number, number]>([
    initialLocation.latitude,
    initialLocation.longitude,
  ]);

  const tileUrl =
    import.meta.env.VITE_OSM_TILE_LAYER_URL || 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  const attribution =
    import.meta.env.VITE_OSM_ATTRIBUTION || '&copy; OpenStreetMap contributors';

  const handlePick = (lat: number, lng: number) => {
    const roundedLat = Math.round(lat * 100000) / 100000;
    const roundedLng = Math.round(lng * 100000) / 100000;
    setPosition([roundedLat, roundedLng]);
    onLocationChange({ latitude: roundedLat, longitude: roundedLng });
  };

  return (
    <div className="space-y-2">
      <div className="relative rounded-xl overflow-hidden border border-stone-300 shadow-xs" style={{ height }}>
        <MapContainer
          center={position}
          zoom={13}
          scrollWheelZoom={false}
          style={{ width: '100%', height: '100%' }}
        >
          <TileLayer attribution={attribution} url={tileUrl} />
          <Marker position={position} icon={defaultIcon} />
          <MapClickHandler onPick={handlePick} />
        </MapContainer>
        <div className="absolute top-2 right-2 z-[400] bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-md text-[11px] font-mono text-stone-700 shadow-sm border border-stone-200 pointer-events-none">
          Click map to pin location
        </div>
      </div>
      <div className="flex items-center space-x-2 text-xs text-stone-600">
        <MapPin className="w-3.5 h-3.5 text-emerald-600" />
        <span>Selected Coordinates:</span>
        <code className="font-mono bg-stone-100 px-1.5 py-0.5 rounded text-stone-800">
          {position[0].toFixed(5)}, {position[1].toFixed(5)}
        </code>
      </div>
    </div>
  );
};
