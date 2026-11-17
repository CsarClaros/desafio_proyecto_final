export interface CaseInfo {
  id: string; number: string; title: string; eyebrow:string; question:string; model:string;
  description:string; icon:string; methods:string[]; units:string;
  scenarioParams: {name:string; normal:string; stress:string; ill:string}[];
  note:string;
}
export const CASES: CaseInfo[] = [
  {id:'detencion',number:'01',title:'Detención de emergencia',eyebrow:'Movimiento y frenado',icon:'⏱',
   question:'¿Cómo cambian el tiempo y la distancia de detención cuando varían la velocidad y el frenado?',
   model:'dx/dt = v ; dv/dt = −a(v,t)',
   description:'Modelo dinámico de una cabina ficticia. El caso analítico usa desaceleración constante: v(t)=v₀−at, t*=v₀/a, Δx=v₀²/(2a). El tiempo de reacción se agrega como distancia previa de avance.',
   methods:['RK2','RK4','Trapecio compuesto','Simpson 1/3','Romberg','Bisección','Newton-Raphson','Secante'],units:'v: m/s; a: m/s²; x: m; t: s',
   scenarioParams:[
     {name:'Velocidad inicial v₀ (m/s)',normal:'5',stress:'7',ill:'5'},
     {name:'Desaceleración (m/s²)',normal:'1,5',stress:'1,0',ill:'1,5'},
     {name:'Tiempo de reacción (s)',normal:'0,7',stress:'1,3',ill:'0,7'},
     {name:'Paso temporal h (s)',normal:'0,1',stress:'0,5',ill:'0,1'},
     {name:'Subexperimento mal condicionado',normal:'—',stress:'—',ill:'g(t)=[v₀−at]³+10⁻⁸[v₀−at]'}
   ],note:'Los números son sintéticos; la raíz numéricamente delicada es un experimento matemático, no una falla de frenado.'},
  {id:'deterioro',number:'02',title:'Deterioro mecánico',eyebrow:'Mantenimiento y calibración',icon:'⚙',
   question:'¿Cuándo un indicador ficticio de desgaste alcanza un umbral de inspección?',
   model:'D(t) = D₀ + αt + βt² ; Ax = b (4×4 SPD)',
   description:'Se usa un modelo cuadrático analítico de deterioro y un sistema lineal sintético de calibración. Las soluciones conocidas son x*=(1,2,3,4)ᵀ; se genera b=Ax* para validar los algoritmos.',
   methods:['Jacobi','Gauss-Seidel','LU con pivoteo','Gradiente conjugado','Referencia directa','Raíces (Semana 2)'],units:'D: adimensional; t: días; α: día⁻¹; β: día⁻²',
   scenarioParams:[
     {name:'D₀ inicial',normal:'0,08',stress:'0,12',ill:'0,08'},
     {name:'α (día⁻¹)',normal:'0,006',stress:'0,009',ill:'0,006'},
     {name:'β (día⁻²)',normal:'0,00012',stress:'0,00030',ill:'0,00012'},
     {name:'Umbral de inspección',normal:'0,60',stress:'0,60',ill:'0,60'},
     {name:'Matriz 4×4',normal:'SPD dominante',stress:'SPD más acoplada',ill:'SPD κ₂ elevado'}
   ],note:'El escenario mal condicionado modifica el sistema algebraico de calibración, no las condiciones físicas.'},
  {id:'oscilaciones',number:'03',title:'Oscilaciones por viento',eyebrow:'Vibraciones modeladas',icon:'≈',
   question:'¿Cómo influyen viento, rigidez y amortiguamiento sobre la oscilación?',
   model:'x′=v ; v′=(F(t)−cv−kx)/m',
   description:'Sistema masa-resorte-amortiguador con carga externa hipotética. Para F(t)=0 se dispone de referencia analítica subamortiguada.',
   methods:['RK2','RK4','Trapecio compuesto','Simpson 1/3','Romberg'],units:'x: m; v: m/s; m: kg; c: N·s/m; k: N/m',
   scenarioParams:[
     {name:'Masa m (kg)',normal:'500',stress:'500',ill:'500'},
     {name:'Amortiguamiento c (N·s/m)',normal:'90',stress:'35',ill:'90'},
     {name:'Rigidez k (N/m)',normal:'2500',stress:'2500',ill:'2500'},
     {name:'Fuerza F(t) (N)',normal:'0',stress:'200 sen(2t)',ill:'0'},
     {name:'Paso numérico (s)',normal:'0,05',stress:'0,25',ill:'c = 2236,06795 (casi crítico), h=0,05'}
   ],note:'Una oscilación de mayor amplitud no es automáticamente un cálculo mal condicionado.'},
  {id:'sensores',number:'04',title:'Reconstrucción de sensores',eyebrow:'Interpolación y señales',icon:'⌁',
   question:'¿Cómo reconstruir valores perdidos y cuantificar el efecto del ruido?',
   model:'y(t)=sin(t); puntos ocultados; interpolantes P(t) y S(t)',
   description:'Conjunto sintético de muestras y=sin(t), donde algunos nodos se ocultan para validación con valores verdaderos conocidos.',
   methods:['Lagrange','Newton (diferencias divididas)','Splines cúbicos'],units:'t: s; y: magnitud sintética adimensional',
   scenarioParams:[
     {name:'Función de referencia',normal:'sen(t)',stress:'sen(t)',ill:'sen(t)'},
     {name:'Nodos disponibles',normal:'6 equiespaciados en [0,3]',stress:'12 equiespaciados en [0,3]',ill:'tᵢ=3(i/11)⁴, i=0,…,11'},
     {name:'Ruido sintético',normal:'0',stress:'±0,03',ill:'±0,001'},
     {name:'Validación',normal:'2 valores ocultos',stress:'4 valores ocultos',ill:'4 valores ocultos'},
     {name:'Fuente de sensibilidad',normal:'—',stress:'Ruido',ill:'Nodos agrupados y polinomio de alto grado'}
   ],note:'No usar muestras obtenidas de sensores reales; son datos generados con función conocida.'}
];
