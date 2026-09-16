export interface Duration {
  seconds: number;
}

export function isNonNegativeDuration(seconds: number): boolean {
  return Number.isFinite(seconds) && seconds >= 0;
}

export function createDuration(seconds: number): Duration {
  if (!isNonNegativeDuration(seconds)) {
    throw new Error(`Invalid duration: ${seconds}`);
  }
  return { seconds };
}
