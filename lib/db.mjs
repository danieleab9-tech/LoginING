/**
 * Conexión a PostgreSQL (Neon) y creación automática de tablas.
 */
import { neon } from '@neondatabase/serverless';

const url = process.env.DATABASE_URL || process.env.NETLIFY_DATABASE_URL;

export const sql = url ? neon(url) : null;

let esquemaListo = false;

/** Crea las tablas si todavía no existen (solo se ejecuta una vez por instancia). */
export async function asegurarEsquema() {
  if (!sql) throw new Error('Falta la variable de entorno DATABASE_URL.');
  if (esquemaListo) return;
  await sql`
    CREATE TABLE IF NOT EXISTS usuarios (
      id SERIAL PRIMARY KEY,
      nombre VARCHAR(80) NOT NULL,
      email VARCHAR(120) NOT NULL UNIQUE,
      password_hash VARCHAR(100) NOT NULL,
      rol VARCHAR(20) NOT NULL DEFAULT 'usuario' CHECK (rol IN ('admin','usuario')),
      intentos_fallidos INTEGER NOT NULL DEFAULT 0,
      bloqueado_hasta TIMESTAMPTZ NULL,
      creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      ultimo_acceso TIMESTAMPTZ NULL
    )`;
  await sql`
    CREATE TABLE IF NOT EXISTS bitacora_accesos (
      id SERIAL PRIMARY KEY,
      usuario_id INTEGER NULL REFERENCES usuarios(id) ON DELETE SET NULL,
      email VARCHAR(120) NOT NULL,
      exito BOOLEAN NOT NULL,
      motivo VARCHAR(40) NOT NULL,
      ip VARCHAR(60) NULL,
      fecha TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`;
  await sql`CREATE INDEX IF NOT EXISTS idx_bitacora_usuario ON bitacora_accesos(usuario_id)`;
  esquemaListo = true;
}
