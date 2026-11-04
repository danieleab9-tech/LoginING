/**
 * GET /api/usuarios
 * Solo administradores: lista de usuarios y últimos accesos registrados.
 */
import { sql, asegurarEsquema } from '../../lib/db.mjs';
import { json, leerSesion } from '../../lib/http.mjs';

export default async (req) => {
  const sesion = leerSesion(req);
  if (!sesion) return json(401, { error: 'No has iniciado sesión.' });
  if (sesion.rol !== 'admin') return json(403, { error: 'Acceso solo para administradores.' });

  try {
    await asegurarEsquema();
    const usuarios = await sql`
      SELECT id, nombre, email, rol, ultimo_acceso,
             (bloqueado_hasta IS NOT NULL AND bloqueado_hasta > NOW()) AS bloqueado
      FROM usuarios ORDER BY id`;
    const accesos = await sql`
      SELECT email, exito, motivo, fecha
      FROM bitacora_accesos ORDER BY fecha DESC LIMIT 20`;
    return json(200, { usuarios, accesos });
  } catch (err) {
    console.error('usuarios', err);
    return json(500, { error: 'Error interno del servidor.' });
  }
};

export const config = { path: '/api/usuarios' };
