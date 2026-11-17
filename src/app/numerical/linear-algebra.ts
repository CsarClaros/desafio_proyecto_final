import { norm2, normInf, residual, subtract, vectorError } from './errors';

export type Method = 'Jacobi' | 'Gauss-Seidel' | 'LU con pivoteo' | 'Gradiente conjugado' | 'Referencia exacta';
export interface Iteration { k: number; residual: number; error: number; approximation: number[]; }
export interface Solution {
  method: Method; x: number[]; converged: boolean; iterations: Iteration[];
  residual: number; errorAbs: number; errorRel: number | null; errorPct: number | null;
  stopReason: string;
}
const matrixVector = (a: number[][], x: number[]) => a.map(row => row.reduce((s, v, j) => s + v * x[j], 0));
const dot = (a: number[], b: number[]) => a.reduce((s, v, j) => s + v * b[j], 0);
const finalize = (method: Method, a: number[][], b: number[], x: number[], reference: number[],
  iterations: Iteration[], converged: boolean, stopReason: string): Solution => {
  const error = vectorError(x, reference);
  return { method, x, converged, iterations, residual: norm2(residual(a, x, b)),
    errorAbs: error.absolute, errorRel: error.relative, errorPct: error.percentage, stopReason };
};
const snapshot = (k: number, a: number[][], x: number[], b: number[], reference: number[]): Iteration =>
  ({ k, residual: norm2(residual(a, x, b)), error: norm2(subtract(x, reference)), approximation: [...x] });
const check = (a: number[][], b: number[]) => {
  if (a.length < 1 || b.length !== a.length || a.some(row => row.length !== a.length)) throw Error('A debe ser cuadrada y compatible con b.');
  if (a.flat().concat(b).some(x => !Number.isFinite(x))) throw Error('A y b deben contener valores finitos.');
};
/** LU: eliminación gaussiana con pivoteo parcial y sustituciones; no crea una segunda implementación ficticia. */
export function solveLU(a: number[][], b: number[]): number[] {
  check(a, b);
  const n = a.length, lu = a.map(r => [...r]), y = [...b];
  for (let k = 0; k < n; k++) {
    let pivot = k;
    for (let i = k + 1; i < n; i++) if (Math.abs(lu[i][k]) > Math.abs(lu[pivot][k])) pivot = i;
    if (Math.abs(lu[pivot][k]) < 1e-15) throw Error('Matriz singular o numéricamente singular.');
    [lu[k], lu[pivot]] = [lu[pivot], lu[k]];
    [y[k], y[pivot]] = [y[pivot], y[k]];
    for (let i = k + 1; i < n; i++) {
      const factor = lu[i][k] / lu[k][k];
      lu[i][k] = factor;
      for (let j = k + 1; j < n; j++) lu[i][j] -= factor * lu[k][j];
    }
  }
  // Resuelve Lz=Pb almacenado en y, luego Ux=z.
  const z = Array(n).fill(0), x = Array(n).fill(0);
  for (let i = 0; i < n; i++) { z[i] = y[i]; for (let j = 0; j < i; j++) z[i] -= lu[i][j] * z[j]; }
  for (let i = n - 1; i >= 0; i--) {
    let sum = z[i]; for (let j = i + 1; j < n; j++) sum -= lu[i][j] * x[j];
    x[i] = sum / lu[i][i];
  }
  return x;
}
/** Autovalores por rotaciones de Jacobi para matriz real simétrica pequeña. */
export function conditionSymmetric(a: number[][]): { kappa2: number; eigenvalues: number[]; spd: boolean } {
  const n = a.length, m = a.map(r => [...r]);
  if (a.some((r, i) => r.length !== n || r.some((v, j) => Math.abs(v - a[j][i]) > 1e-9)))
    return { kappa2: Infinity, eigenvalues: [], spd: false };
  for (let k = 0; k < 200 * n * n; k++) {
    let p = 0, q = 1, maximum = 0;
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
      if (Math.abs(m[i][j]) > maximum) { maximum = Math.abs(m[i][j]); p = i; q = j; }
    }
    if (maximum < 1e-15) break;
    const theta = 0.5 * Math.atan2(2 * m[p][q], m[q][q] - m[p][p]);
    const c = Math.cos(theta), s = Math.sin(theta);
    // Rotación que diagonaliza el bloque 2x2: R = [[c,s],[-s,c]]
    const pp = m[p][p], qq = m[q][q], pq = m[p][q];
    m[p][p] = c*c*pp - 2*c*s*pq + s*s*qq;
    m[q][q] = s*s*pp + 2*c*s*pq + c*c*qq;
    m[p][q] = m[q][p] = 0;
    for (let i = 0; i < n; i++) if (i !== p && i !== q) {
      const ip = m[i][p], iq = m[i][q];
      m[i][p] = m[p][i] = c*ip - s*iq;
      m[i][q] = m[q][i] = s*ip + c*iq;
    }
  }
  const vals = Array.from({length: n}, (_, i) => m[i][i]).sort((x, y) => x - y);
  const min = vals[0], max = vals[n - 1];
  return { kappa2: min > 0 ? max / min : Infinity, eigenvalues: vals, spd: min > 0 };
}
export function jacobi(a: number[][], b: number[], ref: number[], tol: number, maxIter: number): Solution {
  check(a, b); const n = b.length, threshold = tol * Math.max(1, norm2(b));
  let x = Array(n).fill(0), logs = [snapshot(0, a, x, b, ref)], reason = 'Máximo de iteraciones';
  for (let k = 1; k <= maxIter; k++) {
    const next = Array(n).fill(0);
    for (let i = 0; i < n; i++) {
      if (Math.abs(a[i][i]) < 1e-15) throw Error('Jacobi requiere diagonal sin ceros.');
      next[i] = (b[i] - a[i].reduce((v, aij, j) => j === i ? v : v + aij * x[j], 0)) / a[i][i];
    }
    x = next; logs.push(snapshot(k, a, x, b, ref));
    if (logs[k].residual <= threshold) { reason = 'Residuo bajo tolerancia'; break; }
    if (normInf(x) > 1e12 || !Number.isFinite(normInf(x))) { reason = 'Divergencia detectada'; break; }
  }
  return finalize('Jacobi', a, b, x, ref, logs, logs[logs.length - 1].residual <= threshold, reason);
}
export function gaussSeidel(a: number[][], b: number[], ref: number[], tol: number, maxIter: number): Solution {
  check(a, b); const n = b.length, threshold = tol * Math.max(1, norm2(b));
  let x = Array(n).fill(0), logs = [snapshot(0, a, x, b, ref)], reason = 'Máximo de iteraciones';
  for (let k = 1; k <= maxIter; k++) {
    for (let i = 0; i < n; i++) {
      if (Math.abs(a[i][i]) < 1e-15) throw Error('Gauss-Seidel requiere diagonal sin ceros.');
      x[i] = (b[i] - a[i].reduce((v, aij, j) => j === i ? v : v + aij * x[j], 0)) / a[i][i];
    }
    logs.push(snapshot(k, a, x, b, ref));
    if (logs[k].residual <= threshold) { reason = 'Residuo bajo tolerancia'; break; }
    if (normInf(x) > 1e12 || !Number.isFinite(normInf(x))) { reason = 'Divergencia detectada'; break; }
  }
  return finalize('Gauss-Seidel', a, b, x, ref, logs, logs[logs.length - 1].residual <= threshold, reason);
}
export function conjugateGradient(a: number[][], b: number[], ref: number[], tol: number, maxIter: number): Solution {
  check(a, b); if (!conditionSymmetric(a).spd) throw Error('Gradiente conjugado estándar requiere matriz SPD.');
  const n = b.length, threshold = tol * Math.max(1, norm2(b));
  let x = Array(n).fill(0), r = [...b], p = [...r], rr = dot(r, r);
  const logs = [snapshot(0, a, x, b, ref)]; let reason = 'Máximo de iteraciones';
  if (Math.sqrt(rr) <= threshold) return finalize('Gradiente conjugado',a,b,x,ref,logs,true,'Residuo inicial bajo tolerancia');
  for (let k = 1; k <= maxIter; k++) {
    const ap = matrixVector(a, p), pap = dot(p, ap);
    if (pap <= 0 || !Number.isFinite(pap)) { reason = 'Ruptura de definitud positiva'; break; }
    const alpha = rr / pap;
    x = x.map((v, j) => v + alpha * p[j]);
    // Recalcular residuo real para el criterio; recurrencia para CG.
    r = r.map((v, j) => v - alpha * ap[j]);
    logs.push(snapshot(k, a, x, b, ref));
    if (logs[k].residual <= threshold) { reason = 'Residuo bajo tolerancia'; break; }
    const rrNext = dot(r, r);
    if (rr < 1e-300 || !Number.isFinite(rrNext)) { reason = 'Ruptura numérica'; break; }
    const beta = rrNext / rr;
    p = r.map((v, j) => v + beta * p[j]); rr = rrNext;
  }
  return finalize('Gradiente conjugado',a,b,x,ref,logs,logs[logs.length-1].residual <= threshold,reason);
}
export function linearSuite(a: number[][], b: number[], knownReference: number[], tol = 1e-9, maxIter = 500): Solution[] {
  if (!(tol > 0 && Number.isFinite(tol)) || !(maxIter > 0 && Number.isInteger(maxIter)))
    throw Error('Tolerancia positiva y máximo de iteraciones entero.');
  const direct = solveLU(a, b), initial = snapshot(0, a, direct, b, knownReference);
  const exact = [...knownReference];
  const reference: Solution = finalize('Referencia exacta', a, b, exact, knownReference,
    [snapshot(0,a,exact,b,knownReference)], true, 'Referencia x* construida analíticamente');
  const lu: Solution = finalize('LU con pivoteo', a, b, direct, knownReference, [initial], true, 'Factorización y sustitución');
  return [jacobi(a,b,knownReference,tol,maxIter),gaussSeidel(a,b,knownReference,tol,maxIter),lu,
    conjugateGradient(a,b,knownReference,tol,maxIter),reference];
}
