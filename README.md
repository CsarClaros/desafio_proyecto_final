# SIMTELE-RISK — Semana 1

**Desafío integrador de Métodos Numéricos**. Plataforma académica inspirada en transporte por cable de La Paz. Simulación sintética, sin acceso a equipos reales ni afirmaciones sobre instalaciones existentes.

## Alcance implementado

- [x] Prototipo navegable Angular 21 con cuatro casos: detención, deterioro, oscilaciones y sensores.
- [x] Modelos matemáticos, parámetros, unidades, tres escenarios definidos en cada caso; editor de matriz 4×4 y parámetros de deterioro.
- [x] En **deterioro**, ejecución real de matrices 4×4 SPD para NORMAL, ESTRES y MAL_CONDICIONADO, cada una con solución de referencia x* conocida.
- [x] Jacobi, Gauss-Seidel, LU con pivoteo parcial, gradiente conjugado y solución directa de referencia.
- [x] Cálculo de errores absoluto/relativo/porcentual, residuo y número de condición κ₂ (autovalores de matriz simétrica), perturbación de b y factor de amplificación.
- [x] Tablas y dos gráficos activos (curva D(t), convergencia de Jacobi), interpretación numérica y del problema separadas.
- [x] Historial **provisional localStorage** y prueba de repetición local (solo en el mismo navegador).
- [x] DER PNG/SVG, esquema SQL PostgreSQL, pruebas numéricas, documentación y avance en PDF.

## Pendiente según la consigna

- [ ] **Semana 2**: EDO RK2/RK4, interpolación, raíces, integración y resultados de cuatro casos.
- [ ] **Semana 2**: API Laravel, PostgreSQL y guardado/recuperación persistentes en servidor.
- [ ] **Semana 3**: validaciones finales 3×4, comparación global, conclusiones completas, vídeo y defensa.

## Requisitos

- Node.js 20.19 o compatible; recomendable versión 22 LTS.
- npm actualizado y acceso a Internet **al instalar por primera vez**.
- Angular CLI local instalado por `npm install`.

## Iniciar en desarrollo

```bash
npm install
npm start
```

Abrir http://localhost:4200. Si usa `npm start` con host `0.0.0.0`, otros dispositivos en la **misma red** podrán acceder mediante `http://IP_LOCAL_LAPTOP:4200` siempre que el cortafuegos lo permita. Esto NO implica acceso público por Internet.

## Verificación numérica

```bash
npm run test:numerics
```

Verifica SPD, convergencia, soluciones conocidas, perturbaciones y errores. Guarda el reporte reproducible en `examples/test-results.json`. (Requiere `tsc`; se instala como dependencia de desarrollo.)

