const assert = require('node:assert/strict');
const fs = require('node:fs');
const {runExperiment,scenarios}=require('../dist-test/experiments.js');
const {solveLU,conditionSymmetric}=require('../dist-test/linear-algebra.js');
const {norm2,subtract,relativeError,percentageError}=require('../dist-test/errors.js');
assert.equal(relativeError(0,0),null);
assert.equal(percentageError(1,0),null);
let out = {};
for (const type of scenarios) {
 const e=runExperiment(type,1e-10,2000);
 assert.equal(e.spd,true);
 assert.ok(e.results.every(r=>r.converged), `${type}: todos deben converger`);
 assert.ok(e.results.every(r=>r.errorAbs<1e-5), `${type}: soluciones deben aproximar x*`);
 assert.ok(Math.abs(e.kappa2-conditionSymmetric(e.a).kappa2)<1e-6);
 const perturb=solveLU(e.a,e.perturbation.bPerturbed);
 assert.ok(norm2(subtract(perturb,e.knownSolution))>0);
 out[type]={a:e.a,b:e.b,kappa:e.kappa2, day:e.analyticalThresholdDay,
  amplification:e.perturbation.amplification, relInput:e.perturbation.relativeInput,
  relOutput:e.perturbation.relativeOutput,
  results:e.results.map(r=>({method:r.method,k:r.iterations.length-1,converged:r.converged,
    residual:r.residual,error:r.errorAbs,relative:r.errorRel,percentage:r.errorPct, first:r.iterations.slice(0,3)}))};
 console.log(`OK ${type}: κ₂=${e.kappa2.toFixed(1)}; amplificación=${e.perturbation.amplification?.toFixed(1)}`);
}
const custom=runExperiment('NORMAL',1e-10,2000,{physical:{d0:.2,alpha:.006,beta:.0001,threshold:.8}});
assert.ok(custom.analyticalThresholdDay>0 && custom.physical.d0===.2);
assert.throws(()=>runExperiment('NORMAL',1e-9,500,{a:[[0,1,0,0],[1,0,0,0],[0,0,1,0],[0,0,0,1]]}), /SPD/);
fs.writeFileSync('examples/test-results.json' ,JSON.stringify(out,null,2)+'\n');
console.log('Se verificaron matrices SPD, soluciones, residuales, perturbaciones y errores.');
