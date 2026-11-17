import { conditionSymmetric, linearSuite, solveLU, Solution } from './linear-algebra';
import { norm2, subtract, sensitivityFactor, vectorError } from './errors';

export type Scenario = 'NORMAL' | 'ESTRES' | 'MAL_CONDICIONADO';
export const scenarioNames: Record<Scenario, string> = {
  NORMAL: 'Normal', ESTRES: 'Estrés', MAL_CONDICIONADO: 'Mal condicionado'
};
export const scenarios: Scenario[] = ['NORMAL','ESTRES','MAL_CONDICIONADO'];
export const knownSolution = [1,2,3,4];
export const datasets: Record<Scenario, {a:number[][], deterioration:{ d0:number; alpha:number; beta:number; threshold:number }; note:string}> = {
  NORMAL: {
    a:[[6,-1,0,0],[-1,6,-1,0],[0,-1,6,-1],[0,0,-1,6]],
    deterioration:{d0:0.08,alpha:0.006,beta:0.00012,threshold:0.6},
    note:'Matriz SPD diagonalmente dominante. Tasas sintéticas nominales.'
  },
  ESTRES: {
    a:[[4,-1.9,0,0],[-1.9,4,-1.9,0],[0,-1.9,4,-1.9],[0,0,-1.9,4]],
    deterioration:{d0:0.12,alpha:0.009,beta:0.0003,threshold:0.6},
    note:'Mayor acoplamiento entre ecuaciones y ritmo hipotético de deterioro.'
  },
  MAL_CONDICIONADO: {
    a:[[4,0.2,0,0],[0.2,2,0.1,0],[0,0.1,1,0.00005],[0,0,0.00005,0.0001]],
    deterioration:{d0:0.08,alpha:0.006,beta:0.00012,threshold:0.6},
    note:'Subexperimento algebraico SPD de κ₂ elevado. NO equivale a mayor riesgo físico.'
  }
};
export interface Experiment {
  scenario: Scenario; a:number[][]; b:number[]; knownSolution:number[];
  results: Solution[]; kappa2:number; eigenvalues:number[]; spd:boolean;
  perturbation: { bPerturbed:number[]; deltaBNorm:number; deltaXNorm:number; relativeInput:number; relativeOutput:number; amplification:number|null };
  analyticalThresholdDay: number;
  physical: { d0:number; alpha:number; beta:number; threshold:number };
  modelPoints: { t:number; d:number }[];
  createdAt:string;
}
export function thresholdDay(d0: number, alpha: number, beta: number, threshold: number): number {
  if (beta === 0) return alpha > 0 ? (threshold-d0)/alpha : NaN;
  const discriminant = alpha*alpha+4*beta*(threshold-d0);
  if (discriminant < 0) return NaN;
  const root = (-alpha + Math.sqrt(discriminant)) / (2*beta);
  return root >= 0 ? root : NaN;
}
export interface ExperimentOverrides {a?:number[][];physical?:{d0:number;alpha:number;beta:number;threshold:number}};
export function runExperiment(scenario:Scenario,tol=1e-9,maxIter=500,overrides:ExperimentOverrides={}): Experiment {
  const data = datasets[scenario], a = (overrides.a??data.a).map(r=>[...r]);
  const physical = {...(overrides.physical??data.deterioration)};
  if (a.length !== 4 || a.some(row=>row.length !== 4 || row.some(v=>!Number.isFinite(v)))) throw Error('La matriz A debe ser 4×4 y tener valores finitos.');
  if (![physical.d0,physical.alpha,physical.beta,physical.threshold].every(Number.isFinite) ||
      physical.d0<0 || physical.alpha<0 || physical.beta<0 || physical.threshold<=physical.d0)
      throw Error('D₀ >= 0, α y β no negativas, y umbral mayor a D₀.');
  const b = a.map(row => row.reduce((sum,v,j)=>sum+v*knownSolution[j],0));
  const eigen = conditionSymmetric(a);
  if (!eigen.spd) throw Error('La matriz de ensayo debe ser SPD.');
  const results = linearSuite(a,b,knownSolution,tol,maxIter);
  const bPerturbed=[...b]; bPerturbed[3] += 1e-4;
  const direct = solveLU(a,b), directPerturbed=solveLU(a,bPerturbed);
  const relativeInput = norm2(subtract(bPerturbed,b))/norm2(b);
  const relativeOutput = norm2(subtract(directPerturbed,direct))/norm2(direct);
  const day = thresholdDay(physical.d0, physical.alpha, physical.beta, physical.threshold);
  return {
    scenario,a,b,knownSolution:[...knownSolution],results,kappa2:eigen.kappa2,eigenvalues:eigen.eigenvalues,spd:eigen.spd,
    perturbation:{bPerturbed,deltaBNorm:norm2(subtract(bPerturbed,b)),deltaXNorm:norm2(subtract(directPerturbed,direct)),
      relativeInput,relativeOutput,amplification:sensitivityFactor(b,bPerturbed,direct,directPerturbed)},
    analyticalThresholdDay:day, physical,
    modelPoints:Array.from({length:25},(_,i)=>{const t=i*2;return {t,d:physical.d0+physical.alpha*t+physical.beta*t*t};}),
    createdAt:new Date().toISOString()
  };
}
export const fmt = (v:number|null|undefined,precision=5):string =>
  v===null || v===undefined || !Number.isFinite(v) ? 'No definido' : Math.abs(v)!==0 && (Math.abs(v)<0.0001 || Math.abs(v)>=1e5) ? v.toExponential(3) : v.toFixed(precision);
