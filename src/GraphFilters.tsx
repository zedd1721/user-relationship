import type { NodeType } from './types';
import { FILTERABLE_NODE_TYPES, NODE_COLORS, NODE_TYPE_LABELS } from './nodeColors';

interface GraphFiltersProps {
  activeTypes: Set<NodeType>;
  onToggle: (type: NodeType) => void;
}

export default function GraphFilters({ activeTypes, onToggle }: GraphFiltersProps) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-gray-700 bg-gray-900/80 p-4 backdrop-blur-sm">
      <h3 className="mb-1 text-sm font-medium text-gray-400">Filter by type</h3>
      {FILTERABLE_NODE_TYPES.map((type) => (
        <label key={type} className="flex cursor-pointer items-center gap-2 text-sm text-gray-200">
          <input
            type="checkbox"
            checked={activeTypes.has(type)}
            onChange={() => onToggle(type)}
            className="h-4 w-4 accent-purple-500"
          />
          <span
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: NODE_COLORS[type] }}
          />
          {NODE_TYPE_LABELS[type]}
        </label>
      ))}
    </div>
  );
}
