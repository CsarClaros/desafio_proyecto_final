import {CommonModule} from '@angular/common';
import {Component} from '@angular/core';
import {RouterLink} from '@angular/router';
import {PrototypeHistory,SavedRun} from '../../data/history';
import {fmt,scenarioNames} from '../../numerical/experiments';
import {runExperiment} from '../../numerical/experiments';
import {MiniChartComponent} from '../../components/mini-chart/mini-chart.component';
@Component({selector:'app-history',standalone:true,imports:[CommonModule,RouterLink,MiniChartComponent],template:`
<div class="page-heading"><a routerLink="/" class="back-link">← Panel general</a><div class="eyebrow">EXPERIMENTOS LOCALES</div>
<h1>Historial de ejecuciones</h1><p>Persistencia temporal en el navegador para demostración de la Semana 1.</p></div>
<div class="notice">En este prototipo los experimentos se guardan en localStorage <strong>del navegador actual</strong>. No equivale al guardado relacional exigido para la Semana 2.</div>
<div class="panel"><div class="panel-heading">Ejecuciones registradas <span class="tag">{{runs.length}} entradas</span></div>
<div *ngIf="!runs.length" class="empty-state"><h3>Sin ejecuciones todavía</h3><a class="btn primary" routerLink="/caso/deterioro">Ir a deterioro</a></div>
<div class="history-list" *ngFor="let r of runs"><div><strong>{{r.title}} — {{names[r.experiment.scenario]}}</strong>
<small>{{r.createdAt | date:'dd/MM/yyyy HH:mm'}} · tol: {{r.tolerance}}</small></div>
<div class="history-actions"><button class="btn ghost small-btn" (click)="open(r)">Ver / repetir</button>
<button class="btn text-danger small-btn" (click)="remove(r.id)">Eliminar</button></div></div>
</div>
<div class="panel" *ngIf="selected as run"><div class="panel-heading">Ejecución recuperada <span class="tag">{{names[run.experiment.scenario]}}</span></div>
<p>Parámetros, matriz A, vector b, iteraciones y resultados recuperados desde almacenamiento local.</p>
<div class="metrics"><div><small>Condición original</small><strong>{{fmt(run.experiment.kappa2,2)}}</strong></div>
<div><small>Iteraciones Jacobi</small><strong>{{run.experiment.results[0].iterations.length-1}}</strong></div>
<div><small>Coincidencia al repetir</small><strong>{{match===null?'—':match?'SÍ':'NO'}}</strong></div></div>
<div class="scroll"><table class="data-table"><thead><tr><th>Método</th><th>Iteraciones</th><th>Residuo</th><th>Error absoluto</th></tr></thead>
<tbody><tr *ngFor="let x of run.experiment.results"><td>{{x.method}}</td><td>{{x.iterations.length-1}}</td><td>{{fmt(x.residual,4)}}</td><td>{{fmt(x.errorAbs,4)}}</td></tr></tbody></table></div>
<h3>Parámetros recuperados</h3><p>D₀: {{run.experiment.physical.d0}} · α: {{run.experiment.physical.alpha}} · β: {{run.experiment.physical.beta}} · Umbral: {{run.experiment.physical.threshold}}</p>
<p>Vector b: [{{run.experiment.b.join(', ')}}] · Matriz A y aproximaciones conservadas en el registro.</p>
<div class="chart-grid"><div><h3>Señal guardada D(t)</h3><app-mini-chart [values]="savedPhysicalPoints" title="Deterioro recuperado" xLabel="Días" /></div>
<div><h3>Convergencia Jacobi recuperada</h3><app-mini-chart [values]="savedConvergencePoints" [logY]="true" title="Residuo recuperado" xLabel="Iteración" /></div></div>
<details class="iteration-details"><summary>Ver iteraciones almacenadas (Jacobi)</summary><div class="scroll"><table class="data-table"><thead><tr><th>k</th><th>Vector x</th><th>||r||₂</th></tr></thead>
<tbody><tr *ngFor="let i of run.experiment.results[0].iterations"><td>{{i.k}}</td><td>{{i.approximation.join(', ')}}</td><td>{{fmt(i.residual,4)}}</td></tr></tbody></table></div></details>
<div *ngIf="match!==null" class="phase-note">{{match?'Coincidencia dentro de tolerancia comprobada.':'Se detectó una diferencia superior a tolerancia.'}}</div>
</div>`})
export class HistoryComponent {
 runs:SavedRun[]=PrototypeHistory.list();selected:SavedRun|null=null;match:boolean|null=null;
 fmt=fmt;names=scenarioNames;
 get savedPhysicalPoints(){return this.selected?.experiment.modelPoints.map(p=>({x:p.t,y:p.d})) || [];}
 get savedConvergencePoints(){return this.selected?.experiment.results[0].iterations.map(i=>({x:i.k,y:i.residual})) || [];}
 open(r:SavedRun){
  this.selected=r;
  const repeated=runExperiment(r.experiment.scenario,r.tolerance,r.maxIter,{a:r.experiment.a,physical:r.experiment.physical});
  const stored=r.experiment.results;
  this.match=stored.every((m,i)=>m.x.every((v,j)=>Math.abs(v-repeated.results[i].x[j])<=r.tolerance*10)
    && m.iterations.length===repeated.results[i].iterations.length)
    && r.experiment.modelPoints.every((p,i)=>Math.abs(p.d-repeated.modelPoints[i].d)<1e-12);
 }
 remove(id:string){PrototypeHistory.remove(id);this.runs=PrototypeHistory.list();if(this.selected?.id===id){this.selected=null;this.match=null;}}
}
