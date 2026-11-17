import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
@Component({selector:'app-mini-chart',standalone:true,imports:[CommonModule],template:`
<div class="chart"><svg viewBox="0 0 650 220" role="img" [attr.aria-label]="title" preserveAspectRatio="none">
  <line *ngFor="let yy of grid" x1="48" [attr.y1]="yy" x2="631" [attr.y2]="yy" class="gridline"/>
  <line x1="48" y1="12" x2="48" y2="192" class="axis"/><line x1="48" y1="192" x2="631" y2="192" class="axis"/>
  <path [attr.d]="path" class="data-line"/><circle *ngFor="let c of circles" [attr.cx]="c.x" [attr.cy]="c.y" r="2.6" class="point"/>
  <text x="48" y="208" class="chart-label">{{xMinLabel}}</text><text x="631" y="208" text-anchor="end" class="chart-label">{{xMaxLabel}}</text>
  <text x="39" y="19" text-anchor="end" class="chart-label">{{yMaxLabel}}</text><text x="39" y="194" text-anchor="end" class="chart-label">{{yMinLabel}}</text>
  <text x="342" y="217" text-anchor="middle" class="chart-label">{{xLabel}}</text>
</svg></div>`})
export class MiniChartComponent implements OnChanges {
 @Input() values:{x:number;y:number}[]=[];@Input() title='Gráfico'; @Input() xLabel='Tiempo'; @Input() logY=false;
 path='';circles:{x:number;y:number}[]=[];grid=[12,57,102,147,192];
 xMinLabel='0';xMaxLabel='';yMaxLabel='';yMinLabel='';
 ngOnChanges():void {
  const data=this.values.filter(p=>Number.isFinite(p.x)&&Number.isFinite(p.y));
  if(!data.length){this.path='';this.circles=[];return;}
  const minX=Math.min(...data.map(p=>p.x)),maxX=Math.max(...data.map(p=>p.x));
  const vals=data.map(p=>this.logY?Math.log10(Math.max(Math.abs(p.y),1e-17)):p.y);
  let minY=Math.min(...vals),maxY=Math.max(...vals);
  if(maxY===minY){minY-=1;maxY+=1;}
  const coords=data.map((p,i)=>({x:48+(p.x-minX)/Math.max(1e-12,maxX-minX)*583,
   y:192-(vals[i]-minY)/(maxY-minY)*175}));
  this.path=coords.map((p,i)=>`${i?'L':'M'}${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ');
  this.circles=coords.length>35?[coords[0],coords[Math.floor(coords.length/2)],coords[coords.length-1]]:coords;
  this.xMinLabel=minX.toFixed(0);this.xMaxLabel=maxX.toFixed(0);
  this.yMaxLabel=this.logY?'10^'+maxY.toFixed(1):maxY.toFixed(2);
  this.yMinLabel=this.logY?'10^'+minY.toFixed(1):minY.toFixed(2);
 }
}
