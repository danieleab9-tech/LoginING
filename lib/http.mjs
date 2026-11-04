/**
 * Utilidades HTTP y de sesión (JWT en cookie HttpOnly).
 */
import jwt from 'jsonwebtoken';

export const COOKIE = 'sesion';
const DURACION_HORAS = 2;

/** Respuesta JSON estándar. */
export function json(status, datos, headers = {}) {
  return new Response(JSON.stringify(datos), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...headers },
  });
}

function secreto() {
  const s = process.env.JWT_SECRET;
  if (!s || s.length < 32) throw new Error('JWT_SECRET falta o es muy corto (mínimo 32 caracteres).');
  return s;
}

/** Genera la cookie de sesión para un usuario. */
export function cookieDeSesion(usuario) {
  const token = jwt.sign({ sub: usuario.id, rol: usuario.rol, nombre: usuario.nombre }, secreto(), {
    expiresIn: `${DURACION_HORAS}h`,
  });
  return `${COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${DURACION_HORAS * 3600}`;
}

/** Cookie vacía que elimina la sesión. */
export function cookieCerrarSesion() {
  return `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`;
}

/** Lee y verifica la sesión de la petición. Devuelve el payload o null. */
export function leerSesion(req) {
  const cookies = req.headers.get('cookie') || '';
  const par = cookies.split(';').map((c) => c.trim()).find((c) => c.startsWith(`${COOKIE}=`));
  if (!par) return null;
  try {
    return jwt.verify(par.slice(COOKIE.length + 1), secreto());
  } catch {
    return null;
  }
}

/** Lee el cuerpo JSON sin lanzar error si viene vacío o mal formado. */
export async function leerJson(req) {
  try {
    return await req.json();
  } catch {
    return {};
  }
}

export function ipDe(req, context) {
  return context?.ip || req.headers.get('x-nf-client-connection-ip') || null;
}
