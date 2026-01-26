import { useEffect } from 'react';
import { useMap, Marker, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import type { Supplier } from '../../types';
import { formatRevenue, getCountryFlag } from '../../types';

interface SupplierPinsProps {
  suppliers: Supplier[];
  onPinClick: (supplier: Supplier) => void;
}

function createCustomIcon(score: number, revenue: number): L.DivIcon {
  // Size based on revenue (larger revenue = larger marker)
  const baseSize = 32;
  const sizeMultiplier = Math.min(1 + revenue * 0.3, 1.8);
  const size = Math.round(baseSize * sizeMultiplier);

  // Color based on score
  let colorClass = 'risk-marker-low';
  if (score >= 80) {
    colorClass = 'risk-marker-critical';
  } else if (score >= 60) {
    colorClass = 'risk-marker-medium';
  }

  return L.divIcon({
    className: '',
    html: `<div class="risk-marker ${colorClass}" style="width: ${size}px; height: ${size}px; font-size: ${size * 0.35}px;">${score}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

export default function SupplierPins({ suppliers, onPinClick }: SupplierPinsProps) {
  const map = useMap();

  // Fit bounds to show all suppliers
  useEffect(() => {
    if (suppliers.length > 0) {
      const bounds = L.latLngBounds(
        suppliers.map((s) => [s.location.coordinates.lat, s.location.coordinates.lng])
      );
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 5 });
    }
  }, [suppliers, map]);

  return (
    <>
      {suppliers.map((supplier) => (
        <Marker
          key={supplier.id}
          position={[supplier.location.coordinates.lat, supplier.location.coordinates.lng]}
          icon={createCustomIcon(supplier.overallRiskScore, supplier.revenueAtRisk)}
          eventHandlers={{
            click: () => onPinClick(supplier),
          }}
        >
          <Tooltip direction="top" offset={[0, -20]} opacity={1}>
            <div className="min-w-[200px]">
              <div className="font-semibold text-gray-900 mb-1">{supplier.name}</div>
              <div className="text-sm text-gray-500 mb-2">
                {getCountryFlag(supplier.location.countryCode)} {supplier.location.city}, {supplier.location.country}
              </div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-600">Overall Risk Score</span>
                <span className={`font-bold tabular-nums ${
                  supplier.overallRiskScore >= 70 ? 'text-red-600' :
                  supplier.overallRiskScore >= 40 ? 'text-yellow-600' : 'text-green-600'
                }`}>
                  {supplier.overallRiskScore}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-600">Top Risk</span>
                <span className="font-medium text-gray-900">{supplier.topRiskCategory}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Revenue at Risk</span>
                <span className="font-semibold text-gray-900 tabular-nums">
                  {formatRevenue(supplier.revenueAtRisk)}
                </span>
              </div>
            </div>
          </Tooltip>
        </Marker>
      ))}
    </>
  );
}
