/**
 * POST /api/login
 * Valida credenciales, aplica la regla de bloqueo y crea la sesión.
 */
import bcrypt from 'bcryptjs';
import { sql, asegurarEsquema } from '../../lib/db.mjs';
import { json, leerJson, cookieDeSesion, ipDe } from '../../lib/http.mjs';
import { normalizarEmail, validarEmail } from '../../lib/validacion.mjs';
import { estaBloqueado, minutosRestantes, nuevoEstadoTrasIntento, MAX_INTENTOS, MINUTOS_BLOQUEO } from '../../lib/bloqueo.mjs';

// Mensaje genérico: no revela si el correo existe (evita enumeración de usuarios)
const ERROR_CREDENCIALES = 'Correo o contraseña incorrectos.';

async function registrarBitacora(usuarioId, email, exito, motivo, ip) {
  await sql`
    INSERT INTO bitacora_accesos (usuario_id, email, exito, motivo, ip)
    VALUES (${usuarioId}, ${email}, ${exito}, ${motivo}, ${ip})`;
}

export default async (req, context) => {
  if (req.method !== 'POST') return json(405, { error: 'Método no permitido.' });

  try {
    await asegurarEsquema();
    const { email: emailCrudo, password } = await leerJson(req);
    const email = normalizarEmail(emailCrudo);
    const ip = ipDe(req, context);

    if (validarEmail(email) || !password) {
      return json(400, { error: 'Ingresa tu correo y contraseña.' });
    }

    const [usuario] = await sql`SELECT * FROM usuarios WHERE email = ${email}`;

    if (!usuario) {
      await registrarBitacora(null, email, false, 'usuario_no_existe', ip);
      return json(401, { error: ERROR_CREDENCIALES });
    }

    const ahora = new Date();
    if (estaBloqueado(usuario, ahora)) {
      await registrarBitacora(usuario.id, email, false, 'cuenta_bloqueada', ip);
      return json(423, {
        error: `Cuenta bloqueada por demasiados intentos. Intenta de nuevo en ${minutosRestantes(usuario, ahora)} min.`,
      });
    }

    const correcta = await bcrypt.compare(password, usuario.password_hash);
    const estado = nuevoEstadoTrasIntento(usuario, correcta, ahora);

    await sql`
      UPDATE usuarios
      SET intentos_fallidos = ${estado.intentos_fallidos},
          bloqueado_hasta   = ${estado.bloqueado_hasta},
          ultimo_acceso     = CASE WHEN ${correcta} THEN NOW() ELSE ultimo_acceso END
      WHERE id = ${usuario.id}`;

    if (!correcta) {
      await registrarBitacora(usuario.id, email, false, 'password_incorrecto', ip);
      if (estado.recienBloqueado) {
        return json(423, {
          error: `Superaste ${MAX_INTENTOS} intentos. Tu cuenta quedó bloqueada ${MINUTOS_BLOQUEO} minutos.`,
        });
      }
      const restantes = MAX_INTENTOS - estado.intentos_fallidos;
      return json(401, { error: `${ERROR_CREDENCIALES} Te quedan ${restantes} intento(s).` });
    }

    await registrarBitacora(usuario.id, email, true, 'ok', ip);
    return json(
      200,
      { mensaje: 'Bienvenido.', usuario: { nombre: usuario.nombre, rol: usuario.rol } },
      { 'Set-Cookie': cookieDeSesion(usuario) }
    );
  } catch (err) {
    console.error('login', err);
    return json(500, { error: 'Error interno del servidor.' });
  }
};

export const config = { path: '/api/login' };
