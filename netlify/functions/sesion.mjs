/**
 * GET /api/sesion
 * Devuelve los datos del usuario autenticado, o 401 si no hay sesión válida.
 */
import { sql, asegurarEsquema } from '../../lib/db.mjs';
import { json, leerSesion } from '../../lib/http.mjs';

export default async (req) => {
  const sesion = leerSesion(req);
  if (!sesion) return json(401, { error: 'No has iniciado sesión.' });

  try {
    await asegurarEsquema();
    const [u] = await sql`
      SELECT id, nombre, email, rol, creado_en, ultimo_acceso
      FROM usuarios WHERE id = ${sesion.sub}`;
    if (!u) return json(401, { error: 'La cuenta ya no existe.' });
    return json(200, { usuario: u });
  } catch (err) {
    console.error('sesion', err);
    return json(500, { error: 'Error interno del servidor.' });
  }
};

export const config = { path: '/api/sesion' };
