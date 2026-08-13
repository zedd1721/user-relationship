import { NODE_COLORS, NODE_TYPE_LABELS } from './nodeColors';
import type { NodeType } from './types';

const ALL_TYPES = Object.keys(NODE_COLORS) as NodeType[];

export default function GraphLegend() {
  return (
    <div className="flex max-w-[calc(100vw-2rem)] flex-wrap gap-3 rounded-lg border border-gray-700 bg-gray-900/80 p-3 text-xs text-gray-300 backdrop-blur-sm">
      {ALL_TYPES.map((type) => (
        <span key={type} className="flex items-center gap-1.5">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: NODE_COLORS[type] }}
          />
          {NODE_TYPE_LABELS[type]}
        </span>
      ))}
    </div>
  );
}
