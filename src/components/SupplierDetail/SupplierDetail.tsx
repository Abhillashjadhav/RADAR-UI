import { useParams, Link } from 'react-router-dom';
import { ChevronRight, Download, Bell, Star, MapPin } from 'lucide-react';
import { getSupplierById } from '../../data/mockData';
import { getCountryFlag } from '../../types';
import RiskLensChart from './RiskLensChart';
import ImpactAnalysis from './ImpactAnalysis';
import SubTierNetwork from './SubTierNetwork';

export default function SupplierDetail() {
  const { id } = useParams<{ id: string }>();
  const supplier = id ? getSupplierById(id) : undefined;

  if (!supplier) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Supplier Not Found</h2>
          <p className="text-gray-500 mb-4">The supplier you're looking for doesn't exist.</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-800 text-white rounded-lg font-medium hover:bg-blue-700"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-red-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Critical Risk';
    if (score >= 60) return 'Medium Risk';
    return 'Low Risk';
  };

  return (
    <div className="p-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm mb-4">
        <Link to="/" className="text-gray-500 hover:text-blue-800">
          Home
        </Link>
        <ChevronRight size={14} className="text-gray-400" />
        <span className="text-gray-500">Suppliers</span>
        <ChevronRight size={14} className="text-gray-400" />
        <span className="font-medium text-gray-900">{supplier.name}</span>
      </nav>

      {/* Header Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-start justify-between">
          {/* Left: Name and Location */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{supplier.name}</h1>
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin size={16} />
              <span>
                {getCountryFlag(supplier.location.countryCode)} {supplier.location.city}, {supplier.location.country}
              </span>
            </div>
          </div>

          {/* Center: Risk Score Gauge */}
          <div className="flex flex-col items-center">
            <div className="relative w-32 h-32">
              {/* Background circle */}
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="#e2e8f0"
                  strokeWidth="10"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke={supplier.overallRiskScore >= 70 ? '#DC2626' : supplier.overallRiskScore >= 40 ? '#F59E0B' : '#10B981'}
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={`${supplier.overallRiskScore * 2.83} 283`}
                />
              </svg>
              {/* Score text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-3xl font-bold tabular-nums ${getScoreColor(supplier.overallRiskScore)}`}>
                  {supplier.overallRiskScore}
                </span>
                <span className="text-xs text-gray-500">/ 100</span>
              </div>
            </div>
            <span className={`mt-2 px-3 py-1 rounded-full text-sm font-semibold ${
              supplier.overallRiskScore >= 70 ? 'bg-red-100 text-red-700' :
              supplier.overallRiskScore >= 40 ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
            }`}>
              {getScoreLabel(supplier.overallRiskScore)}
            </span>
          </div>

          {/* Right: Quick Actions */}
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              <Download size={16} />
              Export Report
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              <Star size={16} />
              Add to Watchlist
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              <Bell size={16} />
              Configure Alerts
            </button>
          </div>
        </div>
      </div>

      {/* 3-Column Layout */}
      <div className="grid grid-cols-4 gap-6">
        {/* Left Column (25% = 1/4) */}
        <div className="col-span-1">
          <RiskLensChart riskLenses={supplier.riskLenses} />
        </div>

        {/* Center Column (50% = 2/4) */}
        <div className="col-span-2">
          <ImpactAnalysis supplier={supplier} />
        </div>

        {/* Right Column (25% = 1/4) */}
        <div className="col-span-1">
          <SubTierNetwork supplierId={supplier.id} />
        </div>
      </div>
    </div>
  );
}
