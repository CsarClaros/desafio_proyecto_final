-- SIMTELE-RISK / modelo relacional inicial / PostgreSQL 15+
-- Semana 1: diseño documentado. Implementación de persistencia real: Semana 2.
BEGIN;
CREATE TABLE IF NOT EXISTS caso_estudio (
 id BIGSERIAL PRIMARY KEY, codigo VARCHAR(40) NOT NULL UNIQUE,
 nombre VARCHAR(120) NOT NULL, descripcion TEXT,
 modelo_version VARCHAR(20) NOT NULL DEFAULT 'v1'
);
CREATE TABLE IF NOT EXISTS escenario (
 id BIGSERIAL PRIMARY KEY,
 caso_id BIGINT NOT NULL REFERENCES caso_estudio(id) ON DELETE CASCADE,
 tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('NORMAL','ESTRES','MAL_CONDICIONADO')),
 parametros_json JSONB NOT NULL DEFAULT '{}'::jsonb,
 fuente_datos VARCHAR(255) NOT NULL DEFAULT 'Datos sintéticos hipotéticos',
 UNIQUE(caso_id,tipo)
);
CREATE TABLE IF NOT EXISTS simulacion (
 id BIGSERIAL PRIMARY KEY,
 escenario_id BIGINT NOT NULL REFERENCES escenario(id),
 fecha TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 parametros_entrada_json JSONB NOT NULL,
 modelo_version VARCHAR(20) NOT NULL DEFAULT 'v1',
 usuario_equipo VARCHAR(120),
 estado VARCHAR(20) NOT NULL DEFAULT 'COMPLETADA' CHECK (estado IN ('PENDIENTE','COMPLETADA','ERROR'))
);
CREATE TABLE IF NOT EXISTS ejecucion_metodo (
 id BIGSERIAL PRIMARY KEY,
 simulacion_id BIGINT NOT NULL REFERENCES simulacion(id) ON DELETE CASCADE,
 metodo VARCHAR(70) NOT NULL,
 tolerancia DOUBLE PRECISION CHECK (tolerancia IS NULL OR tolerancia > 0),
 paso DOUBLE PRECISION CHECK (paso IS NULL OR paso > 0),
 max_iter INTEGER CHECK (max_iter IS NULL OR max_iter > 0),
 convergio BOOLEAN NOT NULL DEFAULT FALSE,
 tiempo_ms DOUBLE PRECISION CHECK (tiempo_ms IS NULL OR tiempo_ms >= 0),
 criterio_parada VARCHAR(255)
);
CREATE TABLE IF NOT EXISTS iteracion_resultado (
 id BIGSERIAL PRIMARY KEY,
 ejecucion_id BIGINT NOT NULL REFERENCES ejecucion_metodo(id) ON DELETE CASCADE,
 numero INTEGER NOT NULL CHECK (numero >= 0),
 aproximacion_json JSONB NOT NULL,
 residual DOUBLE PRECISION,
 error_abs DOUBLE PRECISION,
 error_rel DOUBLE PRECISION,
 UNIQUE (ejecucion_id,numero)
);
CREATE TABLE IF NOT EXISTS resultado_resumen (
 id BIGSERIAL PRIMARY KEY,
 ejecucion_id BIGINT NOT NULL UNIQUE REFERENCES ejecucion_metodo(id) ON DELETE CASCADE,
 referencia TEXT,
 valor_json JSONB NOT NULL,
 metrica_error_json JSONB NOT NULL,
 series_json JSONB NOT NULL DEFAULT '[]'::jsonb,
 interpretacion TEXT
);
CREATE INDEX IF NOT EXISTS idx_simulacion_escenario_fecha ON simulacion(escenario_id,fecha DESC);
CREATE INDEX IF NOT EXISTS idx_ejecucion_simulacion ON ejecucion_metodo(simulacion_id);
INSERT INTO caso_estudio(codigo,nombre,descripcion,modelo_version) VALUES
 ('detencion','Detención de emergencia','dx/dt=v; dv/dt=-a(v,t)','v1'),
 ('deterioro','Deterioro mecánico y mantenimiento','D(t)=D0+αt+βt²; Ax=b','v1'),
 ('oscilaciones','Oscilaciones por viento','x''=v; v''=(F-cv-kx)/m','v1'),
 ('sensores','Reconstrucción de sensores','y(t)=sin(t); interpolación','v1')
ON CONFLICT (codigo) DO NOTHING;
INSERT INTO escenario(caso_id,tipo,parametros_json,fuente_datos)
SELECT c.id, t.tipo, '{}'::jsonb, 'Parámetros sintéticos, definidos en el documento de Semana 1'
FROM caso_estudio c
CROSS JOIN (VALUES ('NORMAL'),('ESTRES'),('MAL_CONDICIONADO')) AS t(tipo)
ON CONFLICT (caso_id,tipo) DO NOTHING;
COMMIT;
