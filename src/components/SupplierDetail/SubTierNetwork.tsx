import { Lightbulb } from 'lucide-react';
import { getSubTierNetwork } from '../../data/mockData';
import type { SubTierNode } from '../../types';

interface SubTierNetworkProps {
  supplierId: string;
}

function NetworkNode({
  node,
  level,
}: {
  node: SubTierNode;
  level: number;
}) {
  const getNodeColor = (score: number) => {
    if (score === 0) return 'bg-blue-600 border-blue-700'; // QSC (root)
    if (score >= 80) return 'bg-red-500 border-red-600';
    if (score >= 60) return 'bg-yellow-500 border-yellow-600';
    return 'bg-green-500 border-green-600';
  };

  const levelLabels = ['Your Company', 'Tier 1', 'Tier 2', 'Tier 3'];

  return (
    <div className="relative">
      {/* Node */}
      <div className="flex items-center gap-3 mb-2">
        {/* Indentation based on level */}
        <div style={{ width: `${level * 24}px` }} />

        {/* Connection line */}
        {level > 0 && (
          <div className="relative">
            <div className="absolute -left-3 top-1/2 w-3 h-px bg-gray-300" />
            {level > 1 && (
              <div className="absolute -left-3 -top-4 w-px h-8 bg-gray-300" />
            )}
          </div>
        )}

        {/* Node circle */}
        <div
          className={`w-10 h-10 rounded-full ${getNodeColor(node.riskScore)} border-2 flex items-center justify-center text-white text-xs font-bold shadow-sm`}
        >
          {node.riskScore === 0 ? '★' : node.riskScore}
        </div>

        {/* Node info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{node.name}</p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">{levelLabels[level] || `Tier ${level}`}</span>
            {node.label && (
              <>
                <span className="text-gray-300">•</span>
                <span className="text-xs text-gray-500">{node.label}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Children */}
      {node.children && node.children.length > 0 && (
        <div className="ml-4 border-l border-gray-200 pl-2">
          {node.children.map((child) => (
            <NetworkNode key={child.id} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function SubTierNetwork({ supplierId }: SubTierNetworkProps) {
  const network = getSubTierNetwork(supplierId);

  if (!network) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Supply Chain Visibility</h2>
        <p className="text-sm text-gray-500">No sub-tier data available for this supplier.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 h-full">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Supply Chain Visibility</h2>
        <p className="text-sm text-gray-500">Tier 1 → Tier 2 → Tier 3 Mapping</p>
      </div>

      {/* Network Diagram */}
      <div className="mb-4 overflow-x-auto">
        <NetworkNode node={network} level={0} />
      </div>

      {/* Legend */}
      <div className="border-t border-gray-200 pt-4 mb-4">
        <p className="text-xs font-medium text-gray-600 mb-2">Legend</p>
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-xs text-gray-500">Critical (80-100)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <span className="text-xs text-gray-500">Medium (60-79)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-xs text-gray-500">Low (0-59)</span>
          </div>
        </div>
      </div>

      {/* Insight Callout */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <Lightbulb size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs font-semibold text-blue-800 mb-1">Deep Visibility Insight</p>
            <p className="text-xs text-blue-700 leading-relaxed">
              ABJ Substrate (Tier 2) sources argon from UK, where production is down 30% due to energy crisis.
              Monitor for secondary impact on PCB substrate availability.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
