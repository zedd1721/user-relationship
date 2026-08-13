import { useEffect, useMemo, useRef } from 'react';
import ForceGraph3D, { type ForceGraphMethods, type NodeObject, type LinkObject } from 'react-force-graph-3d';
import type { GraphEdge, GraphNode, UserGraphData } from './types';
import { NODE_COLORS } from './nodeColors';
import { linkWidthForStrength, linkOpacityForStrength } from './graphStyle';
import { useContainerSize } from './useContainerSize';

type FGNode = NodeObject<GraphNode>;
type FGLink = LinkObject<GraphNode, GraphEdge>;

interface RelationshipGraph3DProps {
  data: UserGraphData;
  onNodeSelect: (node: GraphNode) => void;
}

export default function RelationshipGraph3D({ data, onNodeSelect }: RelationshipGraph3DProps) {
  const fgRef = useRef<ForceGraphMethods<FGNode, FGLink>>(undefined);
  const { containerRef, dimensions } = useContainerSize<HTMLDivElement>();

  const graphData = useMemo(
    () => ({
      nodes: data.nodes.map((n) => ({ ...n })),
      links: data.edges.map((e) => ({ ...e })),
    }),
    [data],
  );

  useEffect(() => {
    fgRef.current?.cameraPosition({ x: 0, y: 0, z: 260 });
  }, [data]);

  return (
    <div ref={containerRef} className="absolute inset-0 h-full w-full overflow-hidden bg-[#0b0c10]">
      {dimensions.width > 0 && (
        <ForceGraph3D<GraphNode, GraphEdge>
          ref={fgRef}
          width={dimensions.width}
          height={dimensions.height}
          graphData={graphData}
          backgroundColor="#0b0c10"
          nodeLabel={(node) => node.label}
          nodeVal={(node) => node.val ?? 3}
          nodeColor={(node) => NODE_COLORS[node.type]}
          linkWidth={(link) => linkWidthForStrength(link.strength)}
          linkOpacity={0.6}
          linkColor={(link) => `rgba(255,255,255,${linkOpacityForStrength(link.strength)})`}
          onNodeClick={(node) => onNodeSelect(node)}
          enableNodeDrag={true}
          showNavInfo={false}
        />
      )}
    </div>
  );
}
