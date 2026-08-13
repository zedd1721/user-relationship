import { useEffect, useMemo, useRef } from 'react';
import ForceGraph2D, { type ForceGraphMethods, type NodeObject, type LinkObject } from 'react-force-graph-2d';
import type { GraphEdge, GraphNode, UserGraphData } from './types';
import { NODE_COLORS } from './nodeColors';
import {
  computeNodeGlowIntensity,
  LABEL_FONT,
  LABEL_FONT_SIZE,
  linkOpacityForStrength,
  linkWidthForStrength,
  nodeRadius,
  spreadOutForces,
} from './graphStyle';
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

  const nodeGlow = useMemo(
    () => computeNodeGlowIntensity(data.nodes, data.edges),
    [data],
  );

  useEffect(() => {
    if (!fgRef.current) return;
    spreadOutForces(fgRef.current);
    // graphData changes reset the underlying d3 forces to their defaults,
    // so these custom forces need reapplying whenever a new user (or the
    // canvas size) becomes available.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, dimensions.width > 0]);

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
          nodeCanvasObject={(node, ctx) => {
            const x = node.x ?? 0;
            const y = node.y ?? 0;
            const r = nodeRadius(node);
            const glow = nodeGlow.get(node.id) ?? 0;
            const color = NODE_COLORS[node.type];

            // Glow halo: brighter/wider for stronger relationships.
            if (glow > 0) {
              ctx.save();
              ctx.shadowColor = color;
              ctx.shadowBlur = 6 + glow * 22;
              ctx.beginPath();
              ctx.arc(x, y, r, 0, 2 * Math.PI);
              ctx.fillStyle = color;
              ctx.fill();
              ctx.restore();
            } else {
              ctx.beginPath();
              ctx.arc(x, y, r, 0, 2 * Math.PI);
              ctx.fillStyle = color;
              ctx.fill();
            }

            // Always-visible label under the node, with a backing pill for
            // legibility over edges and neighboring nodes.
            ctx.font = LABEL_FONT;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            const textY = y + r + 4;
            const textWidth = ctx.measureText(node.label).width;
            const padX = 4;
            const padY = 2;
            ctx.fillStyle = 'rgba(11, 12, 16, 0.72)';
            ctx.fillRect(
              x - textWidth / 2 - padX,
              textY - padY,
              textWidth + padX * 2,
              LABEL_FONT_SIZE + padY * 2,
            );
            ctx.fillStyle = 'rgba(229, 231, 235, 0.95)';
            ctx.fillText(node.label, x, textY);
          }}
          nodePointerAreaPaint={(node, color, ctx) => {
            const x = node.x ?? 0;
            const y = node.y ?? 0;
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(x, y, nodeRadius(node), 0, 2 * Math.PI);
            ctx.fill();
          }}
          linkWidth={(link) => linkWidthForStrength(link.strength)}
          linkColor={(link) => `rgba(255,255,255,${linkOpacityForStrength(link.strength)})`}
          onNodeClick={(node) => onNodeSelect(node)}
          onEngineStop={() => {
            if (hasAutoFitRef.current) return;
            hasAutoFitRef.current = true;
            fgRef.current?.zoomToFit(400, 60);
          }}
          enableNodeDrag={true}
          // Allow dragging the canvas background to pan the graph. The global
          // pointer-release recovery above prevents this from getting stuck
          // when the pointer is released over an overlay.
          enablePanInteraction={true}
        />
      )}
    </div>
  );
}
