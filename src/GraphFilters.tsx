import type { NodeType } from './types';
import { FILTERABLE_NODE_TYPES, NODE_COLORS, NODE_TYPE_LABELS } from './nodeColors';

interface GraphFiltersProps {
  activeTypes: Set<NodeType>;
  onToggle: (type: NodeType) => void;
  onSetAll: (types: NodeType[]) => void;
}

export default function GraphFilters({ activeTypes, onToggle, onSetAll }: GraphFiltersProps) {
  const allSelected = activeTypes.size === FILTERABLE_NODE_TYPES.length;

  return (
    <fieldset className="flex flex-col gap-2 rounded-lg border border-gray-700 bg-gray-900/80 p-4 backdrop-blur-sm">
      <div className="mb-1 flex items-center justify-between">
        <legend className="text-sm font-medium text-gray-400">Filter by type</legend>
        <button
          type="button"
          onClick={() => onSetAll(allSelected ? [] : FILTERABLE_NODE_TYPES)}
          className="text-xs text-purple-400 hover:text-purple-300 hover:underline"
        >
          {allSelected ? 'Clear all' : 'Select all'}
        </button>
      </div>
      {FILTERABLE_NODE_TYPES.map((type) => (
        <label key={type} className="flex cursor-pointer items-center gap-2 text-sm text-gray-200">
          <input
            type="checkbox"
            checked={activeTypes.has(type)}
            onChange={() => onToggle(type)}
            aria-label={`Show ${NODE_TYPE_LABELS[type]} nodes`}
            className="h-4 w-4 accent-purple-500"
          />
          <span
            aria-hidden="true"
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: NODE_COLORS[type] }}
          />
          {NODE_TYPE_LABELS[type]}
        </label>
      ))}
    </fieldset>
  );
}
