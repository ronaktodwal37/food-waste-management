import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';

const pickupIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const dropoffIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface RouteMapProps {
  pickupLocation: { latitude: number; longitude: number };
  pickupAddress: string;
  dropoffLocation: { latitude: number; longitude: number };
  dropoffAddress: string;
  distanceKm: number;
  height?: string;
}

export const RouteMap: React.FC<RouteMapProps> = ({
  pickupLocation,
  pickupAddress,
  dropoffLocation,
  dropoffAddress,
  distanceKm,
  height = '320px',
}) => {
  const tileUrl =
    import.meta.env.VITE_OSM_TILE_LAYER_URL || 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  const attribution =
    import.meta.env.VITE_OSM_ATTRIBUTION || '&copy; OpenStreetMap contributors';

  const midpoint: [number, number] = [
    (pickupLocation.latitude + dropoffLocation.latitude) / 2,
    (pickupLocation.longitude + dropoffLocation.longitude) / 2,
  ];

  const routePositions: [number, number][] = [
    [pickupLocation.latitude, pickupLocation.longitude],
    [midpoint[0] + 0.001, midpoint[1] - 0.001], // Slight street navigation curve representation
    [dropoffLocation.latitude, dropoffLocation.longitude],
  ];

  return (
    <div className="relative rounded-2xl overflow-hidden border border-stone-200 shadow-sm" style={{ height }}>
      <MapContainer center={midpoint} zoom={13} scrollWheelZoom={false} style={{ width: '100%', height: '100%' }}>
        <TileLayer attribution={attribution} url={tileUrl} />

        {/* Pickup Marker */}
        <Marker position={[pickupLocation.latitude, pickupLocation.longitude]} icon={pickupIcon}>
          <Popup>
            <div className="p-1 space-y-1">
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                1. Pickup Location
              </span>
              <p className="text-xs text-stone-700 font-medium">{pickupAddress}</p>
            </div>
          </Popup>
        </Marker>

        {/* Dropoff Marker */}
        <Marker position={[dropoffLocation.latitude, dropoffLocation.longitude]} icon={dropoffIcon}>
          <Popup>
            <div className="p-1 space-y-1">
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-100 text-purple-800">
                2. NGO Drop-Off
              </span>
              <p className="text-xs text-stone-700 font-medium">{dropoffAddress}</p>
            </div>
          </Popup>
        </Marker>

        {/* Route Polyline */}
        <Polyline positions={routePositions} color="#059669" weight={4} dashArray="6, 6" />
      </MapContainer>

      {/* Floating Route Info Badge */}
      <div className="absolute top-3 left-3 z-[400] bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-semibold shadow-md border border-stone-200 text-stone-800 flex items-center space-x-2 pointer-events-none">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        <span>Estimated Transit Distance:</span>
        <span className="text-emerald-700 font-bold font-mono">{distanceKm} km</span>
      </div>
    </div>
  );
};
