import { Experiment } from '../numerical/experiments';
const KEY='simtele_week1_history_v1';
export interface SavedRun { id:string; createdAt:string; title:string; tolerance:number; maxIter:number; experiment:Experiment; }
export class PrototypeHistory {
 static list(): SavedRun[] {
   try { const data=JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(data) ? data : []; }
   catch {return [];}
 }
 static save(run:SavedRun): void {localStorage.setItem(KEY, JSON.stringify([run,...PrototypeHistory.list()].slice(0,30)));}
 static remove(id:string):void {localStorage.setItem(KEY,JSON.stringify(PrototypeHistory.list().filter(r=>r.id!==id)));}
 }
