declare module 'd3-force-3d' {
  export interface ForceCollide<T> {
    (alpha: number): void;
    initialize?(nodes: T[]): void;
    radius(radius: number | ((node: T, i: number, nodes: T[]) => number)): ForceCollide<T>;
    strength(strength: number): ForceCollide<T>;
    iterations(iterations: number): ForceCollide<T>;
  }

  export function forceCollide<T = unknown>(
    radius?: number | ((node: T, i: number, nodes: T[]) => number),
  ): ForceCollide<T>;
}
