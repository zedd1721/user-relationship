import { lazy, Suspense, useMemo, useState } from 'react';
import UserSearch from './UserSearch';
import GraphFilters from './GraphFilters';
import GraphLegend from './GraphLegend';
import { mockUsers } from './mockUsers';
import { FILTERABLE_NODE_TYPES } from './nodeColors';
import type { GraphNode, NodeType, UserGraphData } from './types';

const RelationshipGraph2D = lazy(() => import('./RelationshipGraph2D'));

function GraphLoadingFallback() {
  return (
    <div className="flex h-full w-full items-center justify-center text-sm text-gray-500">
      Loading graph…
    </div>
  );
}

function App() {
  const [selectedUser, setSelectedUser] = useState<UserGraphData | null>(null);
  const [activeTypes, setActiveTypes] = useState<Set<NodeType>>(new Set(FILTERABLE_NODE_TYPES));
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);

  const handleSelectUser = (user: UserGraphData) => {
    setSelectedUser(user);
    setSelectedNode(null);
    setActiveTypes(new Set(FILTERABLE_NODE_TYPES));
  };

  const handleToggleType = (type: NodeType) => {
    setActiveTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  };

  const handleSetAllTypes = (types: NodeType[]) => {
    setActiveTypes(new Set(types));
  };

  const filteredData: UserGraphData | null = useMemo(() => {
    if (!selectedUser) return null;
    const visibleNodeIds = new Set(
      selectedUser.nodes
        .filter((n) => n.type === 'user' || activeTypes.has(n.type))
        .map((n) => n.id),
    );
    return {
      ...selectedUser,
      nodes: selectedUser.nodes.filter((n) => visibleNodeIds.has(n.id)),
      edges: selectedUser.edges.filter(
        (e) => visibleNodeIds.has(e.source) && visibleNodeIds.has(e.target),
      ),
    };
  }, [selectedUser, activeTypes]);

  const hasGraph = !!filteredData && filteredData.nodes.length > 1;

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[#0b0c10] text-gray-100">
      {/* Full-bleed graph layer */}
      <div className="absolute inset-0">
        {hasGraph && filteredData ? (
          <Suspense fallback={<GraphLoadingFallback />}>
            <RelationshipGraph2D data={filteredData} onNodeSelect={setSelectedNode} />
          </Suspense>
        ) : (
          <div className="flex h-full w-full items-center justify-center px-4 text-center text-gray-500">
            {selectedUser
              ? 'No relationship data for this user (or all types filtered out).'
              : 'Search for a user above to view their relationship graph.'}
          </div>
        )}
      </div>

      {/* Top-left: title + search + filters */}
      <div className="pointer-events-none absolute left-4 top-4 z-10 flex w-[calc(100%-2rem)] flex-col gap-3 sm:w-72">
        <div className="pointer-events-auto relative z-20 rounded-lg border border-gray-700 bg-gray-900/80 p-4 backdrop-blur-sm">
          <h1 className="mb-1 text-lg font-semibold text-white">User Relationship Graph</h1>
          <p className="mb-3 text-xs text-gray-400">Search for a user to explore their ego network.</p>
          <UserSearch users={mockUsers} onSelect={handleSelectUser} />
        </div>

        {selectedUser && (
          <div className="pointer-events-auto relative z-10">
            <GraphFilters activeTypes={activeTypes} onToggle={handleToggleType} onSetAll={handleSetAllTypes} />
          </div>
        )}
      </div>

      {/* Top-right: node details */}
      {selectedUser && (
        <div className="pointer-events-none absolute right-4 top-4 z-10 w-64">
          <div
            className="pointer-events-auto rounded-lg border border-gray-700 bg-gray-900/80 p-4 backdrop-blur-sm"
            role="status"
            aria-live="polite"
          >
            <h3 className="mb-2 text-sm font-medium text-gray-400">Details</h3>
            {selectedNode ? (
              <div>
                <p className="text-base font-semibold text-white">{selectedNode.label}</p>
                {selectedNode.subtitle && (
                  <p className="mt-1 text-sm text-gray-400">{selectedNode.subtitle}</p>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Click a node to see its details.</p>
            )}
          </div>
        </div>
      )}

      {/* Bottom-left: legend */}
      {selectedUser && (
        <div className="pointer-events-none absolute bottom-4 left-4 z-10">
          <div className="pointer-events-auto">
            <GraphLegend />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
