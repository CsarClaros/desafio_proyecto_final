import {CommonModule} from '@angular/common';
import {Component,OnDestroy} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {ActivatedRoute,RouterLink} from '@angular/router';
import {Subscription} from 'rxjs';
import {CASES,CaseInfo} from '../../data/cases';
import {PrototypeHistory} from '../../data/history';
import {datasets,Experiment,fmt,runExperiment,Scenario,scenarios,scenarioNames} from '../../numerical/experiments';
import {MiniChartComponent} from '../../components/mini-chart/mini-chart.component';
@Component({selector:'app-case-lab',standalone:true,imports:[CommonModule,FormsModule,RouterLink,MiniChartComponent],template:`
<ng-container *ngIf="c as item">
 <div class="page-heading"><a routerLink="/" class="back-link">← Volver al panel</a>
 <div class="eyebrow">CASO {{item.number}} / {{item.eyebrow | uppercase}}</div><h1>{{item.title}}</h1><p>{{item.question}}</p></div>
 <div class="lab-grid"><section class="panel">
  <div class="panel-heading"><span>Modelo matemático</span><span class="tag">Sintético</span></div>
  <div class="equation">{{item.model}}</div><p>{{item.description}}</p><p class="muted small">Unidades: {{item.units}}</p>
  <h3>Métodos relacionados</h3><div class="method-tags"><span *ngFor="let m of item.methods">{{m}}</span></div>
  <div class="line"></div><h3>Configuración experimental</h3>
  <div class="three-select"><button *ngFor="let s of scenarios" type="button" [class.selected]="selectedScenario===s" (click)="selectScenario(s)">{{scenarioNames[s]}}</button></div>
  <table class="data-table"><thead><tr><th>Parámetro</th><th>Configuración</th></tr></thead><tbody>
   <tr *ngFor="let p of item.scenarioParams"><td>{{p.name}}</td><td>{{selectParam(p)}}</td></tr>
  </tbody></table><p class="small muted">{{item.note}}</p>
  <ng-container *ngIf="item.id==='deterioro'">
   <div class="line"></div><h3>Parámetros editables del deterioro</h3>
   <div class="input-grid"><label>D₀ <input type="number" [(ngModel)]="physical.d0" min="0" step="0.01"></label>
   <label>α (día⁻¹) <input type="number" [(ngModel)]="physical.alpha" min="0" step="0.001"></label>
   <label>β (día⁻²) <input type="number" [(ngModel)]="physical.beta" min="0" step="0.00001"></label>
   <label>Umbral <input type="number" [(ngModel)]="physical.threshold" min="0.01" step="0.01"></label></div>
   <details class="matrix-editor"><summary>Editar matriz A de calibración (4×4, solo SPD)</summary>
   <p class="small muted">b se construye automáticamente como b = A(1,2,3,4)ᵀ. Modifique valores simétricos por pares para conservar A SPD.</p>
   <div class="matrix-edit-grid"><ng-container *ngFor="let row of matrix;index as i">
    <input *ngFor="let val of row;index as j" type="number" step="any" [(ngModel)]="matrix[i][j]" [attr.aria-label]="'Matriz fila '+(i+1)+' columna '+(j+1)">
   </ng-container></div></details>
   <div class="line"></div><h3>Precisión del cálculo</h3>
   <div class="input-grid"><label>Tolerancia <input type="number" [(ngModel)]="tolerance" min="0.000000000001" max="0.01" step="0.000000001"></label>
   <label>Máximo de iteraciones <input type="number" [(ngModel)]="maxIter" min="1" max="5000" step="1"></label></div>
   <div class="run-buttons"><button class="btn primary" (click)="run()">Ejecutar escenario</button><button class="btn ghost" (click)="runAll()">Ejecutar los 3</button></div>
   <div *ngIf="runError" class="error-message">{{runError}}</div>
  </ng-container>
  <div *ngIf="item.id!=='deterioro'" class="phase-note"><strong>Fase de modelado</strong><p>La definición de las tres condiciones está lista. Su motor numérico se implementa durante la Semana 2.</p></div>
 </section>
 <div class="lab-results"><ng-container *ngIf="result as r; else early">
  <div class="panel result-panel"><div class="panel-heading"><span>Resultados / {{scenarioNames[r.scenario]}}</span><span class="tag good">SPD verificada</span></div>
   <div class="metrics"><div><small>Condición κ₂(A)</small><strong>{{fmt(r.kappa2,2)}}</strong></div>
   <div><small>Umbral analítico</small><strong>{{fmt(r.analyticalThresholdDay,2)}} días</strong></div>
   <div><small>Amplificación observada</small><strong>{{fmt(r.perturbation.amplification,2)}}×</strong></div></div>
   <p class="small muted">κ₂: razón de autovalores extremos de la matriz SPD. Amplificación: cambio relativo de solución / cambio relativo de b ante Δb₄=10⁻⁴.</p>
   <h3>Matriz A y vector b</h3><div class="matrix-scroll"><table class="matrix-table"><tbody><tr *ngFor="let row of r.a;index as i">
     <td *ngFor="let val of row">{{fmt(val,5)}}</td><td class="b-col">{{fmt(r.b[i],5)}}</td></tr></tbody></table></div>
   <p class="small muted">Última columna: b. Solución exacta construida x*=(1, 2, 3, 4)ᵀ.</p>
   <h3>Comparación de algoritmos</h3><div class="scroll"><table class="data-table result-table"><thead><tr>
     <th>Método</th><th>Iter.</th><th>||r||₂</th><th>Error abs.</th><th>Error rel.</th><th>Error %</th><th>Estado</th></tr></thead><tbody>
     <tr *ngFor="let method of r.results"><td><strong>{{method.method}}</strong></td><td>{{method.iterations.length-1}}</td>
       <td>{{fmt(method.residual,3)}}</td><td>{{fmt(method.errorAbs,3)}}</td><td>{{fmt(method.errorRel,3)}}</td><td>{{fmt(method.errorPct,4)}}</td>
       <td><span [class.bad]="!method.converged" class="state">{{method.converged?'OK':'No converge'}}</span></td></tr></tbody></table></div>
   <h3>Tablas de iteración y convergencia</h3>
   <details *ngFor="let method of r.results" class="iteration-details"><summary>{{method.method}} · {{method.iterations.length-1}} iteraciones · {{method.stopReason}}</summary>
   <div class="scroll"><table class="data-table result-table"><thead><tr><th>k</th><th>x₁</th><th>x₂</th><th>x₃</th><th>x₄</th><th>||r||₂</th><th>||error||₂</th></tr></thead><tbody>
   <tr *ngFor="let step of method.iterations"><td>{{step.k}}</td><td *ngFor="let x of step.approximation">{{fmt(x,5)}}</td><td>{{fmt(step.residual,4)}}</td><td>{{fmt(step.error,4)}}</td></tr>
   </tbody></table></div></details>
   <div class="chart-grid"><div><h3>Deterioro estimado D(t)</h3>
    <app-mini-chart [values]="deteriorationPoints" title="Curva de deterioro sintético" xLabel="Días" /></div>
    <div><h3>Convergencia: residuo (log₁₀)</h3><app-mini-chart [values]="convergencePoints" [logY]="true" title="Convergencia del método Jacobi" xLabel="Iteración" /></div></div>
   <div class="interpretations"><div><h3>Conclusión numérica preliminar</h3><p>{{mathConclusion}}</p></div>
    <div><h3>Conclusión del problema preliminar</h3><p>{{physicalConclusion}}</p></div></div>
   <p class="small muted">Se validó contra x* conocido. El cálculo de raíces por bisección, Newton y secante se añadirá en la Semana 2.</p>
  </div></ng-container><ng-template #early><div class="empty-state"><div>⌁</div><h2>Laboratorio preparado</h2>
    <p *ngIf="item.id==='deterioro'">Seleccione una condición y ejecute los métodos para obtener matrices, iteraciones, errores y curvas.</p>
    <p *ngIf="item.id!=='deterioro'">Modelo, supuestos, parámetros y escenarios definidos. Los cálculos específicos corresponden a la segunda semana.</p>
  </div></ng-template></div>
 </div>
</ng-container>
`})
export class CaseLabComponent implements OnDestroy {
 private subscription:Subscription;
 c:CaseInfo=CASES[0];scenarios=scenarios;scenarioNames=scenarioNames;selectedScenario:Scenario='NORMAL';
 tolerance=1e-10;maxIter=2000;result:Experiment|null=null;runError='';fmt=fmt;
 physical={...datasets.NORMAL.deterioration};matrix=datasets.NORMAL.a.map(r=>[...r]);
 constructor(private route:ActivatedRoute) {
   this.subscription=route.paramMap.subscribe(params=>{
     this.c=CASES.find(c=>c.id===params.get('id')) || CASES[0];this.result=null;this.selectScenario('NORMAL');
   });
 }
 ngOnDestroy(){this.subscription.unsubscribe();}
 selectScenario(s:Scenario){this.selectedScenario=s;this.result=null;this.runError='';
   this.physical={...datasets[s].deterioration};this.matrix=datasets[s].a.map(r=>[...r]);}
 selectParam(p:{normal:string;stress:string;ill:string}){return this.selectedScenario==='NORMAL'?p.normal:this.selectedScenario==='ESTRES'?p.stress:p.ill;}
 run(){
  try {
   if(!Number.isFinite(this.tolerance) || this.tolerance<=0 || this.tolerance>=1) throw Error('Tolerancia válida: 0 < tol < 1.');
   if(!Number.isInteger(this.maxIter) || this.maxIter<1 || this.maxIter>5000) throw Error('Máximo de iteraciones: 1 a 5000.');
   this.result=runExperiment(this.selectedScenario,this.tolerance,this.maxIter,{physical:this.physical,a:this.matrix});
   const run={id:crypto.randomUUID(),createdAt:this.result.createdAt,title:'Deterioro mecánico',tolerance:this.tolerance,maxIter:this.maxIter,experiment:this.result};
   PrototypeHistory.save(run);this.runError='';
  }catch(err){this.runError=err instanceof Error?err.message:'Error numérico no identificado.';}
 }
 runAll(){for(const s of scenarios){this.selectScenario(s);this.run();}}
 get deteriorationPoints(){return this.result?.modelPoints.map(p=>({x:p.t,y:p.d})) || [];}
 get convergencePoints(){return this.result?.results[0].iterations.map(p=>({x:p.k,y:p.residual})) || [];}
 get mathConclusion(){
  if(!this.result)return '';
  const r=this.result, jac=r.results[0], gs=r.results[1];
  return `Jacobi necesitó ${jac.iterations.length-1} iteraciones; Gauss-Seidel ${gs.iterations.length-1}. `+
    `κ₂(A)=${fmt(r.kappa2,1)}; el factor observado de perturbación de b fue ${fmt(r.perturbation.amplification,1)}. `+
    'Los residuales y los errores deben analizarse por separado; un escenario mal condicionado no implica falta de convergencia.';
 }
 get physicalConclusion(){
  if(!this.result)return '';
  const r=this.result;
  return `Bajo los parámetros sintéticos seleccionados, el umbral D=${fmt(r.physical.threshold,2)} se alcanza a los ${fmt(r.analyticalThresholdDay,2)} días. `+
   'Es una estimación educativa dependiente del modelo y no establece intervalos de mantenimiento reales.';
 }
}
