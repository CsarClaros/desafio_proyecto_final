import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { CaseLabComponent } from './pages/case-lab/case-lab.component';
import { HistoryComponent } from './pages/history/history.component';
export const routes:Routes = [
  {path:'',component:HomeComponent,title:'SIMTELE-RISK | Inicio'},
  {path:'caso/:id',component:CaseLabComponent,title:'SIMTELE-RISK | Laboratorio'},
  {path:'historial',component:HistoryComponent,title:'SIMTELE-RISK | Historial'},
  {path:'**',redirectTo:''}
];
