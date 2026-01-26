import { useState } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import { Filter, Layers } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import { suppliers } from '../../data/mockData';
import type { Supplier } from '../../types';
import SupplierPins from './SupplierPins';
import MapSidebar from './MapSidebar';

function MapControls({
  showTier1Only,
  onToggleTier1,
  showCriticalOnly,
  onToggleCritical,
}: {
  showTier1Only: boolean;
  onToggleTier1: () => void;
  showCriticalOnly: boolean;
  onToggleCritical: () => void;
}) {
  return (
    <div className="absolute top-4 right-4 z-[1000] bg-white rounded-lg shadow-lg p-3 space-y-2">
      <div className="flex items-center gap-2">
        <Filter size={16} className="text-gray-500" />
        <span className="text-sm font-medium text-gray-700">Filters</span>
      </div>

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={showTier1Only}
          onChange={onToggleTier1}
          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <span className="text-sm text-gray-600">Show Tier 1 Only</span>
      </label>

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={showCriticalOnly}
          onChange={onToggleCritical}
          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <span className="text-sm text-gray-600">Critical Risks Only</span>
      </label>
    </div>
  );
}

function MapLegend() {
  return (
    <div className="absolute bottom-8 right-4 z-[1000] bg-white rounded-lg shadow-lg p-3">
      <div className="flex items-center gap-2 mb-2">
        <Layers size={16} className="text-gray-500" />
        <span className="text-sm font-medium text-gray-700">Legend</span>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-red-600" />
          <span className="text-xs text-gray-600">Critical (80-100)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-yellow-500" />
          <span className="text-xs text-gray-600">Medium (60-79)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-green-500" />
          <span className="text-xs text-gray-600">Low (0-59)</span>
        </div>
      </div>
    </div>
  );
}

export default function MapView() {
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [showTier1Only, setShowTier1Only] = useState(false);
  const [showCriticalOnly, setShowCriticalOnly] = useState(false);

  const filteredSuppliers = suppliers.filter((supplier) => {
    if (showTier1Only && supplier.tier !== 1) return false;
    if (showCriticalOnly && supplier.overallRiskScore < 80) return false;
    return true;
  });

  const handlePinClick = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
  };

  const handleCloseSidebar = () => {
    setSelectedSupplier(null);
  };

  return (
    <div className="h-[calc(100vh-64px)] relative">
      <MapContainer
        center={[20, 100]}
        zoom={3}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <SupplierPins suppliers={filteredSuppliers} onPinClick={handlePinClick} />
      </MapContainer>

      {/* Controls */}
      <MapControls
        showTier1Only={showTier1Only}
        onToggleTier1={() => setShowTier1Only(!showTier1Only)}
        showCriticalOnly={showCriticalOnly}
        onToggleCritical={() => setShowCriticalOnly(!showCriticalOnly)}
      />

      {/* Legend */}
      <MapLegend />

      {/* Sidebar */}
      {selectedSupplier && (
        <MapSidebar supplier={selectedSupplier} onClose={handleCloseSidebar} />
      )}
    </div>
  );
}
