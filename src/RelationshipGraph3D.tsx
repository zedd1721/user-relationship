import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import ForceGraph3D, { type ForceGraphMethods, type NodeObject, type LinkObject } from 'react-force-graph-3d';
import type { GraphEdge, GraphNode, UserGraphData } from './types';
import { NODE_COLORS } from './nodeColors';
import {
  computeNodeGlowIntensity,
  linkOpacityForStrength,
  linkWidthForStrength,
  nodeRadius,
  spreadOutForces,
} from './graphStyle';
import { useContainerSize } from './useContainerSize';

type FGNode = NodeObject<GraphNode>;
type FGLink = LinkObject<GraphNode, GraphEdge>;

interface RelationshipGraph3DProps {
  data: UserGraphData;
  onNodeSelect: (node: GraphNode) => void;
}

function makeLabelSprite(text: string): THREE.Sprite {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  const fontSize = 28;
  ctx.font = `${fontSize}px system-ui, sans-serif`;
  const textWidth = ctx.measureText(text).width;
  canvas.width = textWidth + 12;
  canvas.height = fontSize + 12;
  ctx.font = `${fontSize}px system-ui, sans-serif`;
  ctx.fillStyle = 'rgba(229, 231, 235, 0.95)';
  ctx.textBaseline = 'top';
  ctx.fillText(text, 6, 6);

  const texture = new THREE.CanvasTexture(canvas);
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false });
  const sprite = new THREE.Sprite(material);
  const scale = 0.14;
  sprite.scale.set(canvas.width * scale, canvas.height * scale, 1);
  return sprite;
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

  const nodeGlow = useMemo(() => computeNodeGlowIntensity(data.nodes, data.edges), [data]);
  const hasAutoFitRef = useRef(false);

  useEffect(() => {
    hasAutoFitRef.current = false;
  }, [data]);

  useEffect(() => {
    if (!fgRef.current) return;
    spreadOutForces(fgRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, dimensions.width > 0]);

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
          nodeThreeObject={(node) => {
            const r = nodeRadius(node);
            const color = NODE_COLORS[node.type];
            const glow = nodeGlow.get(node.id) ?? 0;

            const group = new THREE.Group();

            const core = new THREE.Mesh(
              new THREE.SphereGeometry(r, 16, 16),
              new THREE.MeshLambertMaterial({ color }),
            );
            group.add(core);

            if (glow > 0) {
              const halo = new THREE.Mesh(
                new THREE.SphereGeometry(r * (1.5 + glow * 0.9), 16, 16),
                new THREE.MeshBasicMaterial({
                  color,
                  transparent: true,
                  opacity: 0.12 + glow * 0.33,
                  blending: THREE.AdditiveBlending,
                  depthWrite: false,
                }),
              );
              group.add(halo);
            }

            const label = makeLabelSprite(node.label);
            label.position.set(0, -(r + 6), 0);
            group.add(label);

            return group;
          }}
          nodeThreeObjectExtend={false}
          linkWidth={(link) => linkWidthForStrength(link.strength)}
          linkOpacity={0.6}
          linkColor={(link) => `rgba(255,255,255,${linkOpacityForStrength(link.strength)})`}
          onNodeClick={(node) => onNodeSelect(node)}
          onEngineStop={() => {
            if (hasAutoFitRef.current) return;
            hasAutoFitRef.current = true;
            fgRef.current?.zoomToFit(400, 80);
          }}
          enableNodeDrag={true}
          showNavInfo={false}
        />
      )}
    </div>
  );
}
