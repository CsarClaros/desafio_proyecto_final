/** Teoría de errores transversal para todos los módulos. */
export const EPS = 1e-14;
export function norm2(v: number[]): number { return Math.hypot(...v); }
export function normInf(v: number[]): number { return v.reduce((m, x) => Math.max(m, Math.abs(x)), 0); }
export function subtract(a: number[], b: number[]): number[] { return a.map((v, i) => v - b[i]); }
export function absoluteError(x: number, reference: number): number { return Math.abs(x - reference); }
export function relativeError(x: number, reference: number): number | null {
  return Math.abs(reference) < EPS ? null : absoluteError(x, reference) / Math.abs(reference);
}
export function percentageError(x: number, reference: number): number | null {
  const rel = relativeError(x, reference);
  return rel === null ? null : rel * 100;
}
export function vectorError(x: number[], reference: number[]) {
  const abs = norm2(subtract(x, reference));
  const refNorm = norm2(reference);
  const rel = refNorm <= EPS ? null : abs / refNorm;
  return { absolute: abs, relative: rel, percentage: rel === null ? null : rel * 100 };
}
export function residual(a: number[][], x: number[], b: number[]): number[] {
  return b.map((v, i) => v - a[i].reduce((acc, aij, j) => acc + aij * x[j], 0));
}
export function sensitivityFactor(b: number[], bPerturbed: number[], x: number[], xPerturbed: number[]): number | null {
  const db = norm2(subtract(bPerturbed, b));
  const dx = norm2(subtract(xPerturbed, x));
  const inRel = norm2(b) <= EPS ? null : db / norm2(b);
  const outRel = norm2(x) <= EPS ? null : dx / norm2(x);
  return inRel && outRel !== null ? outRel / inRel : null;
}
