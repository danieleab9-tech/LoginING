-- =============================================================
-- Esquema de base de datos del módulo de autenticación
-- Motor: PostgreSQL (Neon / Netlify DB)
-- Nota: las funciones crean estas tablas automáticamente la
-- primera vez (ver lib/db.mjs). Este archivo sirve para la
-- documentación y el diagrama entidad-relación.
-- =============================================================

CREATE TABLE IF NOT EXISTS usuarios (
  id                 SERIAL PRIMARY KEY,
  nombre             VARCHAR(80)  NOT NULL,
  email              VARCHAR(120) NOT NULL UNIQUE,
  password_hash      VARCHAR(100) NOT NULL,          -- bcrypt, nunca la contraseña en texto plano
  rol                VARCHAR(20)  NOT NULL DEFAULT 'usuario'
                     CHECK (rol IN ('admin', 'usuario')),
  intentos_fallidos  INTEGER      NOT NULL DEFAULT 0,
  bloqueado_hasta    TIMESTAMPTZ  NULL,               -- NULL = no bloqueado
  creado_en          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  ultimo_acceso      TIMESTAMPTZ  NULL
);

-- Bitácora de cada intento de inicio de sesión (auditoría)
CREATE TABLE IF NOT EXISTS bitacora_accesos (
  id          SERIAL PRIMARY KEY,
  usuario_id  INTEGER NULL REFERENCES usuarios(id) ON DELETE SET NULL,
  email       VARCHAR(120) NOT NULL,
  exito       BOOLEAN      NOT NULL,
  motivo      VARCHAR(40)  NOT NULL,   -- ok | password_incorrecto | usuario_no_existe | cuenta_bloqueada
  ip          VARCHAR(60)  NULL,
  fecha       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bitacora_usuario ON bitacora_accesos(usuario_id);
