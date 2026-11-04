/**
 * POST /api/registro
 * Crea una cuenta nueva. El primer usuario registrado recibe el rol "admin".
 */
import bcrypt from 'bcryptjs';
import { sql, asegurarEsquema } from '../../lib/db.mjs';
import { json, leerJson } from '../../lib/http.mjs';
import { validarRegistro, normalizarEmail } from '../../lib/validacion.mjs';

export default async (req) => {
  if (req.method !== 'POST') return json(405, { error: 'Método no permitido.' });

  try {
    await asegurarEsquema();
    const datos = await leerJson(req);
    const errores = validarRegistro(datos);
    if (errores.length) return json(400, { error: errores[0], errores });

    const email = normalizarEmail(datos.email);
    const existente = await sql`SELECT id FROM usuarios WHERE email = ${email}`;
    if (existente.length) return json(409, { error: 'Ya existe una cuenta con ese correo.' });

    const [{ total }] = await sql`SELECT COUNT(*)::int AS total FROM usuarios`;
    const rol = total === 0 ? 'admin' : 'usuario';
    const hash = await bcrypt.hash(datos.password, 10);

    await sql`
      INSERT INTO usuarios (nombre, email, password_hash, rol)
      VALUES (${datos.nombre.trim()}, ${email}, ${hash}, ${rol})`;

    return json(201, { mensaje: 'Cuenta creada. Ya puedes iniciar sesión.', rol });
  } catch (err) {
    console.error('registro', err);
    return json(500, { error: 'Error interno del servidor.' });
  }
};

export const config = { path: '/api/registro' };
