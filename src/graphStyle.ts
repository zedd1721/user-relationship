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
