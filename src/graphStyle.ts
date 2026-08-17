import { forceCollide, type SimulationNodeDatum } from 'd3-force';
import { FILTERABLE_NODE_TYPES } from './nodeColors';
import type { GraphEdge, GraphNode, NodeType } from './types';

export const NODE_REL_SIZE = 4;

/** Fixed world-space label font size (not rescaled by zoom), so collision
 * sizing below matches exactly what gets drawn on canvas. */
export const LABEL_FONT_SIZE = 12;
export const LABEL_FONT = `${LABEL_FONT_SIZE}px system-ui, sans-serif`;

export function nodeRadius(node: Pick<GraphNode, 'val'>): number {
  return Math.sqrt(Math.max(0, node.val ?? 3)) * NODE_REL_SIZE;
}

let measureCtx: CanvasRenderingContext2D | null = null;
const labelWidthCache = new Map<string, number>();

function measureLabelWidth(label: string): number {
  const cached = labelWidthCache.get(label);
  if (cached !== undefined) return cached;

  if (!measureCtx) {
    measureCtx = document.createElement('canvas').getContext('2d');
  }

  let width: number;
  if (measureCtx) {
    measureCtx.font = LABEL_FONT;
    width = measureCtx.measureText(label).width;
  } else {
    // Fallback for environments without canvas (e.g. SSR): rough estimate.
    width = label.length * LABEL_FONT_SIZE * 0.55;
  }

  labelWidthCache.set(label, width);
  return width;
}

/** Radius (in graph units) a node needs so its label doesn't collide with neighbors. */
export function nodeCollisionRadius(node: Pick<GraphNode, 'val' | 'label'>): number {
  const r = nodeRadius(node);
  const labelHalfWidth = measureLabelWidth(node.label) / 2;
  return Math.max(r, labelHalfWidth) + r + 12;
}

export function linkWidthForStrength(strength: number): number {
  if (strength > 0.7) return 4.5;
  if (strength >= 0.4) return 2.5;
  return 1;
}

export function linkOpacityForStrength(strength: number): number {
  if (strength > 0.7) return 0.9;
  if (strength >= 0.4) return 0.6;
  return 0.3;
}

interface ForceConfigurable {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  d3Force(forceName: string, forceFn?: any): any;
  d3ReheatSimulation(): unknown;
}

/** Target angle (radians) each node type is pulled toward, evenly spaced in a circle. */
export function angleForType(type: NodeType): number {
  const index = FILTERABLE_NODE_TYPES.indexOf(type);
  if (index === -1) return 0;
  return (index / FILTERABLE_NODE_TYPES.length) * Math.PI * 2;
}

interface SimNode {
  type: NodeType;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
}

/**
 * Custom d3-force that nudges each non-user node's angle (around the origin)
 * toward its type's assigned sector, so groups/posts/followers/etc. cluster
 * into distinct wedges instead of scattering randomly around the hub.
 */
function forceTypeSector(strength: number) {
  let nodes: SimNode[] = [];

  function force(alpha: number) {
    for (const node of nodes) {
      if (node.type === 'user') continue;
      const x = node.x ?? 0;
      const y = node.y ?? 0;
      const r = Math.hypot(x, y) || 1;
      const targetAngle = angleForType(node.type);
      const currentAngle = Math.atan2(y, x);
      const diff = Math.atan2(Math.sin(targetAngle - currentAngle), Math.cos(targetAngle - currentAngle));
      const newAngle = currentAngle + diff * strength * alpha;
      const targetX = r * Math.cos(newAngle);
      const targetY = r * Math.sin(newAngle);
      node.vx = (node.vx ?? 0) + (targetX - x) * strength * alpha;
      node.vy = (node.vy ?? 0) + (targetY - y) * strength * alpha;
    }
  }

  force.initialize = (initializedNodes: SimNode[]) => {
    nodes = initializedNodes;
  };

  return force;
}

/**
 * Pushes nodes apart based on their actual label width (via a collision
 * force), stretches links, and groups nodes into per-type angular sectors
 * so labels have room to breathe and same-type nodes cluster together
 * instead of overlapping in a mixed-up tight cluster.
 */
export function spreadOutForces(fg: ForceConfigurable): void {
  fg.d3Force('charge')?.strength(-160);
  fg.d3Force('link')
    ?.distance((link: { source: Pick<GraphNode, 'val'>; target: Pick<GraphNode, 'val'> }) =>
      nodeRadius(link.source) + nodeRadius(link.target) + 50,
    )
    .strength(0.5);
  fg.d3Force(
    'collide',
    forceCollide<Pick<GraphNode, 'val' | 'label'> & SimulationNodeDatum>((node) =>
      nodeCollisionRadius(node),
    ).strength(1),
  );
  fg.d3Force('sector', forceTypeSector(0.6));
  fg.d3ReheatSimulation();
}

/** Strongest edge touching each node, used to drive a glow effect (0-1). */
export function computeNodeGlowIntensity(
  nodes: Pick<GraphNode, 'id' | 'type'>[],
  edges: Pick<GraphEdge, 'source' | 'target' | 'strength'>[],
): Map<string, number> {
  const glow = new Map<string, number>();
  for (const node of nodes) {
    glow.set(node.id, node.type === 'user' ? 1 : 0);
  }
  for (const edge of edges) {
    const strength = Math.max(0, Math.min(1, edge.strength));
    if (strength > (glow.get(edge.source) ?? 0)) glow.set(edge.source, strength);
    if (strength > (glow.get(edge.target) ?? 0)) glow.set(edge.target, strength);
  }
  return glow;
}
