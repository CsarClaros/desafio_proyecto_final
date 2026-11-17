import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
@Component({selector:'app-root',standalone:true,imports:[RouterLink,RouterLinkActive,RouterOutlet],template:`
<div class="layout">
  <aside class="sidebar">
    <a class="brand" routerLink="/"><span class="brand-mark">S</span><span><strong>SIMTELE</strong><small>RISK LAB / v0.1</small></span></a>
    <div class="nav-label">EXPLORAR</div>
    <nav>
      <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}"><span>▦</span>Panel general</a>
      <a routerLink="/caso/detencion" routerLinkActive="active"><span>①</span>Detención</a>
      <a routerLink="/caso/deterioro" routerLinkActive="active"><span>②</span>Deterioro</a>
      <a routerLink="/caso/oscilaciones" routerLinkActive="active"><span>③</span>Oscilaciones</a>
      <a routerLink="/caso/sensores" routerLinkActive="active"><span>④</span>Sensores</a>
      <a routerLink="/historial" routerLinkActive="active"><span>◷</span>Historial local</a>
    </nav>
    <div class="sidebar-footer"><span class="dot"></span> Métodos Numéricos · Semana 1<br><small>Datos sintéticos · Uso educativo</small></div>
  </aside>
  <main class="main"><header class="topbar"><span>Proyecto integrador / Laboratorio numérico</span><span class="top-chip">PROTOTIPO ACADÉMICO</span></header>
    <div class="content"><router-outlet /></div>
  </main>
</div>
`})
export class AppComponent {}
