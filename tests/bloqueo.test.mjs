// Pruebas unitarias (caja blanca) de la regla de bloqueo por intentos fallidos.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { estaBloqueado, minutosRestantes, nuevoEstadoTrasIntento, MAX_INTENTOS, MINUTOS_BLOQUEO } from '../lib/bloqueo.mjs';

const AHORA = new Date('2026-11-04T12:00:00Z');

test('un usuario sin fecha de bloqueo no está bloqueado', () => {
  assert.equal(estaBloqueado({ bloqueado_hasta: null }, AHORA), false);
});

test('bloqueo vigente y bloqueo vencido', () => {
  assert.equal(estaBloqueado({ bloqueado_hasta: '2026-11-04T12:10:00Z' }, AHORA), true);
  assert.equal(estaBloqueado({ bloqueado_hasta: '2026-11-04T11:50:00Z' }, AHORA), false);
});

test('minutosRestantes redondea hacia arriba', () => {
  assert.equal(minutosRestantes({ bloqueado_hasta: '2026-11-04T12:09:30Z' }, AHORA), 10);
  assert.equal(minutosRestantes({ bloqueado_hasta: null }, AHORA), 0);
});

test('login correcto reinicia contadores', () => {
  const e = nuevoEstadoTrasIntento({ intentos_fallidos: 3 }, true, AHORA);
  assert.deepEqual(e, { intentos_fallidos: 0, bloqueado_hasta: null, recienBloqueado: false });
});

test('login incorrecto suma un intento', () => {
  const e = nuevoEstadoTrasIntento({ intentos_fallidos: 1 }, false, AHORA);
  assert.equal(e.intentos_fallidos, 2);
  assert.equal(e.recienBloqueado, false);
});

test(`al llegar a ${MAX_INTENTOS} intentos se bloquea ${MINUTOS_BLOQUEO} minutos`, () => {
  const e = nuevoEstadoTrasIntento({ intentos_fallidos: MAX_INTENTOS - 1 }, false, AHORA);
  assert.equal(e.recienBloqueado, true);
  assert.equal(e.intentos_fallidos, 0);
  assert.equal(e.bloqueado_hasta.getTime() - AHORA.getTime(), MINUTOS_BLOQUEO * 60000);
});
