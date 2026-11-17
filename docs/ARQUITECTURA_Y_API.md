# SIMTELE-RISK — Diseño de arquitectura y API (propuesta Semana 1)

## Decisión de responsabilidad
- **Angular 21 / TypeScript**: interfaz, validación de formularios, comparaciones gráficas y, durante Semana 1, prototipo funcional de sistemas lineales en el navegador.
- **Laravel (Semana 2)**: API de ejecución/consulta, auditoría del guardado de simulaciones, validación de datos de entrada y persistencia transaccional. El motor numérico compartido puede mantenerse en TypeScript mientras se hacen las ejecuciones en cliente; el servidor recibe y valida todos los resultados, sin considerarlos confiables automáticamente.
- **PostgreSQL**: seis tablas con relaciones para casos, escenarios, simulaciones, métodos, iteraciones y resúmenes. Archiva entradas, parámetros, salidas y series, incluso al cerrar el navegador.

> La app Angular incluida NO tiene backend Laravel, endpoints reales ni persistencia de base de datos en Semana 1. El historial de demostración usa localStorage. Esto **no** satisface la prueba final de persistencia; debe sustituirse en Semana 2.

## API propuesta
- `GET /api/casos`: casos y escenarios.
- `POST /api/simulaciones`: guarda simulación completa (entrada, escenarios, ejecuciones y filas de iteración) con una transacción.
- `GET /api/simulaciones?caso_id=&escenario=&buscar=`: listado filtrado.
- `GET /api/simulaciones/{id}`: devuelve ejecución completa para reproducir tablas y series de gráficos.
- `POST /api/simulaciones/{id}/repetir`: recalcula/valida con datos persistidos; compara dentro de tolerancia.

### Ejemplo de contenido del POST
```json
{
  "caso_codigo":"deterioro",
  "escenario":"NORMAL",
  "modelo_version":"v1",
  "parametros_entrada":{"A":[[6,-1,0,0],[-1,6,-1,0],[0,-1,6,-1],[0,0,-1,6]],"b":[4,8,12,21],"x_referencia":[1,2,3,4],"tolerancia":1e-9},
  "ejecuciones":[{"metodo":"Jacobi","convergio":true,"iteraciones":[{"numero":0,"aproximacion":[0,0,0,0],"residual":25.23886}],"resumen":{"valor":[1,2,3,4],"error_absoluto":0.0,"series":[]}}]
}
```
Los valores del ejemplo ilustran la forma del JSON y no constituyen una ejecución íntegra; las iteraciones reales deben transmitirse completas.

## Persistencia / reproducción
1. Abrir caso, ajustar escenario y valores.
2. Ejecutar algoritmos y registrar matrices, método y criterio de parada.
3. Guardar una simulación y todas sus `ejecucion_metodo`/`iteracion_resultado`/`resultado_resumen` en una transacción.
4. Refrescar navegador, recuperar desde API y graficar las series.
5. Repetir con la misma versión de algoritmo y comparar cada métrica con tolerancia explícita.

## Seguridad mínima
Validación del JSON, límites de tamaño (n, max_iter), rate limiting del API, parametrización de consultas, credenciales del servidor solo en `.env`, CORS restringido al dominio del frontend, HTTPS. Nunca exponer PostgreSQL ni su contraseña directamente al cliente.
