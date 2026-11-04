/**
 * POST /api/logout
 * Cierra la sesión eliminando la cookie.
 */
import { json, cookieCerrarSesion } from '../../lib/http.mjs';

export default async (req) => {
  if (req.method !== 'POST') return json(405, { error: 'Método no permitido.' });
  return json(200, { mensaje: 'Sesión cerrada.' }, { 'Set-Cookie': cookieCerrarSesion() });
};

export const config = { path: '/api/logout' };
