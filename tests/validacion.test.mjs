// Pruebas unitarias (caja blanca) de las reglas de validación.
// Ejecutar con: npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validarEmail, validarPassword, validarNombre, validarRegistro, normalizarEmail } from '../lib/validacion.mjs';

test('normalizarEmail quita espacios y pasa a minúsculas', () => {
  assert.equal(normalizarEmail('  Ana@Correo.COM '), 'ana@correo.com');
});

test('validarEmail: casos positivos y negativos', () => {
  assert.equal(validarEmail('ana@correo.com'), null);
  assert.match(validarEmail(''), /obligatorio/);
  assert.match(validarEmail('ana@correo'), /formato/);
  assert.match(validarEmail('anacorreo.com'), /formato/);
  assert.match(validarEmail('a'.repeat(115) + '@x.com'), /120/);
});

test('validarPassword: recorre cada rama de la política', () => {
  assert.match(validarPassword('Ab1'), /8 caracteres/);
  assert.match(validarPassword('A'.repeat(73) + 'a1'), /72/);
  assert.match(validarPassword('abcdefg1'), /mayúscula/);
  assert.match(validarPassword('ABCDEFG1'), /minúscula/);
  assert.match(validarPassword('Abcdefgh'), /número/);
  assert.equal(validarPassword('Segura123'), null);
});

test('validarNombre: límites', () => {
  assert.match(validarNombre('A'), /al menos 2/);
  assert.match(validarNombre('A'.repeat(81)), /80/);
  assert.equal(validarNombre('Ana López'), null);
});

test('validarRegistro detecta contraseñas que no coinciden', () => {
  const errores = validarRegistro({ nombre: 'Ana', email: 'ana@correo.com', password: 'Segura123', confirmar: 'Otra1234' });
  assert.deepEqual(errores, ['Las contraseñas no coinciden.']);
});

test('validarRegistro acepta datos correctos', () => {
  const errores = validarRegistro({ nombre: 'Ana', email: 'ana@correo.com', password: 'Segura123', confirmar: 'Segura123' });
  assert.deepEqual(errores, []);
});
