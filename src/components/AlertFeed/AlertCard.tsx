import { ArrowRight } from 'lucide-react';
import type { Alert } from '../../types';

interface AlertCardProps {
  alert: Alert;
  onClick: () => void;
}

export default function AlertCard({ alert, onClick }: AlertCardProps) {
  const severityConfig = {
    critical: {
      badge: 'CRITICAL',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      badgeBg: 'bg-red-600',
      icon: '🔴',
    },
    medium: {
      badge: 'MEDIUM',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      badgeBg: 'bg-yellow-500',
      icon: '🟡',
    },
    low: {
      badge: 'LOW',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      badgeBg: 'bg-green-500',
      icon: '🟢',
    },
  };

  const config = severityConfig[alert.severity];

  const formatTimeAgo = (hours: number): string => {
    if (hours < 1) return 'Just now';
    if (hours === 1) return '1 hour ago';
    if (hours < 24) return `${hours} hours ago`;
    if (hours < 48) return '1 day ago';
    return `${Math.floor(hours / 24)} days ago`;
  };

  return (
    <button
      onClick={onClick}
      className={`w-full p-3 rounded-lg border ${config.bgColor} ${config.borderColor} text-left transition-all hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
      aria-label={`View details for ${alert.supplierName}`}
    >
      {/* Severity Badge */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm">{config.icon}</span>
        <span className={`text-xs font-semibold text-white px-2 py-0.5 rounded ${config.badgeBg}`}>
          {config.badge}
        </span>
      </div>

      {/* Supplier Name */}
      <h3 className="font-semibold text-gray-900 text-sm mb-1">
        {alert.supplierName}
      </h3>

      {/* Risk Type and Score */}
      <p className="text-sm text-gray-600 mb-1">
        {alert.riskType} Risk Score: <span className="font-semibold tabular-nums">{alert.riskScore}</span>
      </p>

      {/* Description */}
      <p className="text-sm text-gray-500 mb-2">
        {alert.description}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400">
          {formatTimeAgo(alert.hoursAgo)}
        </span>
        <span className="text-xs text-blue-600 font-medium flex items-center gap-1">
          View Details
          <ArrowRight size={12} />
        </span>
      </div>
    </button>
  );
}
