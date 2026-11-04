/**
 * Regla de negocio: bloqueo de cuenta por intentos fallidos.
 * Funciones puras para facilitar las pruebas de caja blanca.
 */

export const MAX_INTENTOS = 5;
export const MINUTOS_BLOQUEO = 15;

/** ¿La cuenta está bloqueada en el instante `ahora`? */
export function estaBloqueado(usuario, ahora = new Date()) {
  if (!usuario?.bloqueado_hasta) return false;
  return new Date(usuario.bloqueado_hasta) > ahora;
}

/** Minutos restantes de bloqueo (redondeado hacia arriba). */
export function minutosRestantes(usuario, ahora = new Date()) {
  if (!estaBloqueado(usuario, ahora)) return 0;
  return Math.ceil((new Date(usuario.bloqueado_hasta) - ahora) / 60000);
}

/**
 * Calcula el nuevo estado del usuario después de un intento de login.
 * @returns {{ intentos_fallidos:number, bloqueado_hasta:Date|null, recienBloqueado:boolean }}
 */
export function nuevoEstadoTrasIntento(usuario, passwordCorrecta, ahora = new Date()) {
  if (passwordCorrecta) {
    return { intentos_fallidos: 0, bloqueado_hasta: null, recienBloqueado: false };
  }
  const intentos = (usuario.intentos_fallidos ?? 0) + 1;
  if (intentos >= MAX_INTENTOS) {
    return {
      intentos_fallidos: 0,
      bloqueado_hasta: new Date(ahora.getTime() + MINUTOS_BLOQUEO * 60000),
      recienBloqueado: true,
    };
  }
  return { intentos_fallidos: intentos, bloqueado_hasta: null, recienBloqueado: false };
}
