import { useNavigate } from 'react-router-dom';
import { X, MapPin, TrendingUp, Clock, ArrowRight } from 'lucide-react';
import type { Supplier } from '../../types';
import { formatRevenue, getCountryFlag } from '../../types';

interface MapSidebarProps {
  supplier: Supplier;
  onClose: () => void;
}

export default function MapSidebar({ supplier, onClose }: MapSidebarProps) {
  const navigate = useNavigate();

  const tierLabels = {
    1: 'Tier 1 (Direct)',
    2: 'Tier 2 (Sub-tier)',
    3: 'Tier 3 (Deep-tier)',
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-red-600 bg-red-50 border-red-200';
    if (score >= 40) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-green-600 bg-green-50 border-green-200';
  };

  const handleViewDetails = () => {
    navigate(`/supplier/${supplier.id}`);
  };

  return (
    <div className="absolute top-0 right-0 w-[400px] h-full bg-white shadow-xl z-[1001] overflow-y-auto animate-slide-in">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Supplier Details</h2>
        <button
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Close sidebar"
        >
          <X size={20} className="text-gray-500" />
        </button>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Supplier Name and Location */}
        <div className="mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-1">{supplier.name}</h3>
          <div className="flex items-center gap-2 text-gray-600">
            <MapPin size={16} />
            <span>
              {getCountryFlag(supplier.location.countryCode)} {supplier.location.city}, {supplier.location.country}
            </span>
          </div>
        </div>

        {/* Overall Risk Score */}
        <div className={`p-4 rounded-xl border ${getScoreColor(supplier.overallRiskScore)} mb-6`}>
          <div className="text-sm font-medium text-gray-600 mb-1">Overall Risk Score</div>
          <div className="flex items-center justify-between">
            <span className={`text-4xl font-bold tabular-nums ${
              supplier.overallRiskScore >= 70 ? 'text-red-600' :
              supplier.overallRiskScore >= 40 ? 'text-yellow-600' : 'text-green-600'
            }`}>
              {supplier.overallRiskScore}
            </span>
            <span className={`text-sm font-semibold px-3 py-1 rounded-full ${
              supplier.overallRiskScore >= 70 ? 'bg-red-100 text-red-700' :
              supplier.overallRiskScore >= 40 ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
            }`}>
              {supplier.overallRiskScore >= 80 ? 'Critical Risk' :
               supplier.overallRiskScore >= 60 ? 'Medium Risk' : 'Low Risk'}
            </span>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <span className="text-sm text-gray-600">Tier Level</span>
            <span className="text-sm font-semibold text-gray-900">{tierLabels[supplier.tier]}</span>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <span className="text-sm text-gray-600">Primary Impact</span>
            <span className={`text-sm font-semibold px-2 py-0.5 rounded ${
              supplier.primaryImpact === 'Delivery' ? 'bg-red-100 text-red-700' :
              supplier.primaryImpact === 'Compliance' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
            }`}>
              {supplier.primaryImpact}
            </span>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <span className="text-sm text-gray-600">Revenue at Risk</span>
            <span className="text-sm font-semibold text-gray-900 tabular-nums">
              {formatRevenue(supplier.revenueAtRisk)}
            </span>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <span className="text-sm text-gray-600">Top Risk Category</span>
            <span className="text-sm font-semibold text-gray-900">{supplier.topRiskCategory}</span>
          </div>

          <div className="flex items-center justify-between py-3">
            <span className="text-sm text-gray-600 flex items-center gap-1">
              <Clock size={14} />
              Monitoring Since
            </span>
            <span className="text-sm font-semibold text-gray-900">Jan 2023</span>
          </div>
        </div>

        {/* Risk Description */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <TrendingUp size={16} />
            Current Risk Summary
          </h4>
          <p className="text-sm text-gray-600 leading-relaxed">
            {supplier.topRiskDescription}
          </p>
        </div>

        {/* View Full Details Button */}
        <button
          onClick={handleViewDetails}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-800 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          View Full Details
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
