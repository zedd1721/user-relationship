import { useEffect, useMemo, useRef } from 'react';
import ForceGraph2D, { type ForceGraphMethods, type NodeObject, type LinkObject } from 'react-force-graph-2d';
import type { GraphEdge, GraphNode, UserGraphData } from './types';
import { NODE_COLORS } from './nodeColors';
import { linkWidthForStrength, linkOpacityForStrength } from './graphStyle';
import { useContainerSize } from './useContainerSize';

type FGNode = NodeObject<GraphNode>;
type FGLink = LinkObject<GraphNode, GraphEdge>;

interface RelationshipGraph2DProps {
  data: UserGraphData;
  onNodeSelect: (node: GraphNode) => void;
}

export default function RelationshipGraph2D({ data, onNodeSelect }: RelationshipGraph2DProps) {
  const fgRef = useRef<ForceGraphMethods<FGNode, FGLink>>(undefined);
  const { containerRef, dimensions } = useContainerSize<HTMLDivElement>();
  const hasAutoFitRef = useRef(false);
  const pointerDownInGraphRef = useRef(false);

  const graphData = useMemo(() => {
    hasAutoFitRef.current = false;
    return {
      nodes: data.nodes.map((n) => ({ ...n })),
      links: data.edges.map((e) => ({ ...e })),
    };
  }, [data]);

  useEffect(() => {
    const releaseStuckPointer = (event: PointerEvent) => {
      const container = containerRef.current;
      if (!container || !pointerDownInGraphRef.current) return;

      pointerDownInGraphRef.current = false;

      // If the pointer was released over an overlay outside the canvas,
      // notify the graph so its internal drag state is cleared as well.
      if (!container.contains(event.target as Node)) {
        const canvas = container.querySelector('canvas');
        canvas?.dispatchEvent(
          new PointerEvent('pointerup', {
            bubbles: true,
            button: event.button,
            clientX: event.clientX,
            clientY: event.clientY,
            pointerId: event.pointerId,
            pointerType: event.pointerType,
          }),
        );
      }
    };

    const trackPointerDown = (event: PointerEvent) => {
      pointerDownInGraphRef.current = Boolean(
        containerRef.current?.contains(event.target as Node),
      );
    };

    window.addEventListener('pointerdown', trackPointerDown, true);
    window.addEventListener('pointerup', releaseStuckPointer, true);
    window.addEventListener('pointercancel', releaseStuckPointer, true);
    return () => {
      window.removeEventListener('pointerdown', trackPointerDown, true);
      window.removeEventListener('pointerup', releaseStuckPointer, true);
      window.removeEventListener('pointercancel', releaseStuckPointer, true);
    };
  }, [containerRef]);

  return (
    <div ref={containerRef} className="absolute inset-0 h-full w-full overflow-hidden bg-[#0b0c10]">
      {dimensions.width > 0 && (
        <ForceGraph2D<GraphNode, GraphEdge>
          ref={fgRef}
          width={dimensions.width}
          height={dimensions.height}
          graphData={graphData}
          backgroundColor="#0b0c10"
          nodeLabel={(node) => node.label}
          nodeVal={(node) => node.val ?? 3}
          nodeColor={(node) => NODE_COLORS[node.type]}
          linkWidth={(link) => linkWidthForStrength(link.strength)}
          linkColor={(link) => `rgba(255,255,255,${linkOpacityForStrength(link.strength)})`}
          onNodeClick={(node) => onNodeSelect(node)}
          onEngineStop={() => {
            if (hasAutoFitRef.current) return;
            hasAutoFitRef.current = true;
            fgRef.current?.zoomToFit(400, 60);
          }}
          enableNodeDrag={true}
          // Prevent background panning from leaving the canvas in a stuck
          // pointer-drag state when the pointer is released outside it.
          enablePanInteraction={false}
        />
      )}
    </div>
  );
}
