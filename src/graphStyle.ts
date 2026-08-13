import type { GraphEdge, GraphNode } from './types';

export const NODE_REL_SIZE = 4;

export function nodeRadius(node: Pick<GraphNode, 'val'>): number {
  return Math.sqrt(Math.max(0, node.val ?? 3)) * NODE_REL_SIZE;
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
  d3Force(forceName: 'link' | 'charge'): any;
  d3ReheatSimulation(): unknown;
}

/**
 * Pushes nodes further apart and stretches links so node labels have room
 * to breathe instead of overlapping in a tight cluster.
 */
export function spreadOutForces(fg: ForceConfigurable): void {
  fg.d3Force('charge')?.strength(-220);
  fg.d3Force('link')
    ?.distance((link: { source: Pick<GraphNode, 'val'>; target: Pick<GraphNode, 'val'> }) =>
      nodeRadius(link.source) + nodeRadius(link.target) + 70,
    )
    .strength(0.6);
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
