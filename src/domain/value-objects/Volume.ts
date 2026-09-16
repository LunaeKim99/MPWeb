export interface Volume {
  value: number;
}

export function isVolume(value: number): boolean {
  return Number.isFinite(value) && value >= 0 && value <= 1;
}

export function clampVolume(value: number): number {
  if (!Number.isFinite(value)) return 0.8;
  return Math.min(1, Math.max(0, value));
}

export function createVolume(value: number): Volume {
  return { value: clampVolume(value) };
}
