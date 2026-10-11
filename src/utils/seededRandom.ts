// Mulberry32 seeded PRNG — deterministic so mock data doesn't reshuffle
// on every re-render, making the prototype feel like a real, stable dataset.
export function mulberry32(seed: number) {
  let a = seed;
  return function random() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const rng = mulberry32(42);

export function rngInt(rand: () => number, min: number, max: number): number {
  return Math.floor(rand() * (max - min + 1)) + min;
}

export function rngPick<T>(rand: () => number, arr: T[]): T {
  return arr[Math.floor(rand() * arr.length)];
}

export function rngFloat(rand: () => number, min: number, max: number, decimals = 4): number {
  const v = rand() * (max - min) + min;
  return Number(v.toFixed(decimals));
}
