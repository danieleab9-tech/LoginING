/**
 * Reglas de validación de datos de entrada.
 * Funciones puras (sin base de datos) para poder probarlas con pruebas unitarias.
 */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Normaliza un correo: sin espacios y en minúsculas. */
export function normalizarEmail(email) {
  return String(email ?? '').trim().toLowerCase();
}

/** RF: el correo debe tener formato válido y máximo 120 caracteres. */
export function validarEmail(email) {
  const e = normalizarEmail(email);
  if (!e) return 'El correo es obligatorio.';
  if (e.length > 120) return 'El correo no puede exceder 120 caracteres.';
  if (!EMAIL_REGEX.test(e)) return 'El formato del correo no es válido.';
  return null;
}

/** RF: el nombre debe tener entre 2 y 80 caracteres. */
export function validarNombre(nombre) {
  const n = String(nombre ?? '').trim();
  if (n.length < 2) return 'El nombre debe tener al menos 2 caracteres.';
  if (n.length > 80) return 'El nombre no puede exceder 80 caracteres.';
  return null;
}

/**
 * RNF (seguridad): política de contraseñas.
 * Mínimo 8 caracteres, al menos una mayúscula, una minúscula y un número.
 */
export function validarPassword(password) {
  const p = String(password ?? '');
  if (p.length < 8) return 'La contraseña debe tener al menos 8 caracteres.';
  if (p.length > 72) return 'La contraseña no puede exceder 72 caracteres.';
  if (!/[A-Z]/.test(p)) return 'La contraseña debe incluir al menos una mayúscula.';
  if (!/[a-z]/.test(p)) return 'La contraseña debe incluir al menos una minúscula.';
  if (!/[0-9]/.test(p)) return 'La contraseña debe incluir al menos un número.';
  return null;
}

/** Valida todos los campos del registro. Devuelve un arreglo de errores (vacío = válido). */
export function validarRegistro({ nombre, email, password, confirmar }) {
  const errores = [validarNombre(nombre), validarEmail(email), validarPassword(password)].filter(Boolean);
  if (password !== confirmar) errores.push('Las contraseñas no coinciden.');
  return errores;
}
