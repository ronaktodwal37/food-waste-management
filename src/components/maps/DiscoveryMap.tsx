import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Utensils, Building2, MapPin, Clock } from 'lucide-react';

const donorIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const ngoIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface DiscoveryItem {
  id: string;
  type: 'LISTING' | 'NGO';
  title: string;
  category?: string;
  servings?: number;
  location: { latitude: number; longitude: number };
  address: string;
  pickupDeadline?: string;
  matchScore?: number;
  onSelect?: () => void;
}

interface DiscoveryMapProps {
  center?: [number, number];
  zoom?: number;
  items: DiscoveryItem[];
  height?: string;
}

export const DiscoveryMap: React.FC<DiscoveryMapProps> = ({
  center = [37.7749, -122.4194],
  zoom = 13,
  items,
  height = '420px',
}) => {
  const tileUrl =
    import.meta.env.VITE_OSM_TILE_LAYER_URL || 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  const attribution =
    import.meta.env.VITE_OSM_ATTRIBUTION || '&copy; OpenStreetMap contributors';

  return (
    <div className="relative rounded-2xl overflow-hidden border border-stone-200 shadow-sm" style={{ height }}>
      <MapContainer center={center} zoom={zoom} scrollWheelZoom={false} style={{ width: '100%', height: '100%' }}>
        <TileLayer attribution={attribution} url={tileUrl} />
        {items.map((item) => (
          <Marker
            key={item.id}
            position={[item.location.latitude, item.location.longitude]}
            icon={item.type === 'LISTING' ? donorIcon : ngoIcon}
          >
            <Popup>
              <div className="p-1 space-y-2 min-w-[180px]">
                <div className="flex items-center space-x-1.5">
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      item.type === 'LISTING' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {item.type === 'LISTING' ? 'Food Listing' : 'Verified NGO'}
                  </span>
                  {item.matchScore !== undefined && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 ml-auto">
                      {item.matchScore}% Match
                    </span>
                  )}
                </div>
                <h4 className="font-bold text-xs text-stone-900 leading-snug">{item.title}</h4>
                {item.servings && (
                  <p className="text-[11px] text-stone-600 font-medium">
                    Servings available: <span className="font-bold text-emerald-700">{item.servings}</span>
                  </p>
                )}
                <p className="text-[11px] text-stone-500 leading-tight">{item.address}</p>
                {item.onSelect && (
                  <button
                    onClick={item.onSelect}
                    className="w-full mt-1.5 py-1 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded transition-colors"
                  >
                    View Details
                  </button>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Map Legend */}
      <div className="absolute bottom-3 left-3 z-[400] bg-white/95 backdrop-blur-md p-2 rounded-lg text-xs shadow-md border border-stone-200 flex items-center space-x-3 pointer-events-none">
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          <span className="text-stone-700 font-medium text-[11px]">Food Donation</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
          <span className="text-stone-700 font-medium text-[11px]">NGO / Shelter</span>
        </div>
      </div>
    </div>
  );
};
