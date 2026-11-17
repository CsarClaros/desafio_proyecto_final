import {Component} from '@angular/core';
import {RouterLink} from '@angular/router';
import {CommonModule} from '@angular/common';
import {CASES} from '../../data/cases';
@Component({selector:'app-home',standalone:true,imports:[RouterLink,CommonModule],template:`
<div class="hero"><div><div class="eyebrow">LABORATORIO DE SIMULACIÓN · SEMANA 1</div>
<h1>Métodos numéricos para<br><span>comprender escenarios complejos.</span></h1>
<p>Cuatro casos educativos sobre transporte por cable. Modelamos, calculamos, verificamos errores y comparamos procedimientos.</p>
<div class="hero-actions"><a class="btn primary" routerLink="/caso/deterioro">Ejecutar algoritmos →</a><a class="btn ghost" routerLink="/historial">Ver historial</a></div></div>
<div class="hero-orb"><span>4</span><small>MÓDULOS</small><div class="orbit one"></div><div class="orbit two"></div></div></div>
<div class="section-head"><div><div class="eyebrow">CASOS DE ESTUDIO</div><h2>Explorar módulos</h2></div><span class="muted">4 casos · 3 escenarios por caso</span></div>
<div class="cases-grid"><a *ngFor="let c of cases" class="case-card" [routerLink]="['/caso',c.id]">
<div class="case-top"><span class="case-icon">{{c.icon}}</span><span class="count">CASO {{c.number}}</span></div>
<div class="case-eyebrow">{{c.eyebrow}}</div><h3>{{c.title}}</h3><p>{{c.question}}</p>
<div class="case-bottom"><span [class.ready]="c.id==='deterioro'" class="status-pill">{{c.id==='deterioro'?'Algoritmos activos':'Modelo definido'}}</span><strong>↗</strong></div>
</a></div>
<div class="info-strip"><strong>Alcance Semana 1</strong><span>Jacobi · Gauss-Seidel · LU · Gradiente conjugado · Referencia directa · Errores y sensibilidad</span></div>
<div class="notice">Este sistema utiliza datos hipotéticos; no representa mediciones reales ni diagnostica la seguridad de Mi Teleférico.</div>
`})
export class HomeComponent {cases=CASES;}
