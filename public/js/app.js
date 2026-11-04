// Funciones compartidas del frontend

/** Llama a la API y devuelve { ok, status, datos }. */
async function api(ruta, opciones = {}) {
  const resp = await fetch(ruta, {
    method: opciones.method || 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    body: opciones.body ? JSON.stringify(opciones.body) : undefined,
  });
  let datos = {};
  try { datos = await resp.json(); } catch { /* respuesta sin cuerpo */ }
  return { ok: resp.ok, status: resp.status, datos };
}

/** Muestra un mensaje de error o éxito en el elemento #mensaje. */
function mostrarMensaje(texto, tipo = 'error') {
  const el = document.getElementById('mensaje');
  el.textContent = texto;
  el.className = `mensaje ${tipo}`;
}

function formatearFecha(valor) {
  if (!valor) return '—';
  return new Date(valor).toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' });
}

/** Escapa texto antes de insertarlo como HTML (previene XSS). */
function escapar(texto) {
  const div = document.createElement('div');
  div.textContent = texto ?? '';
  return div.innerHTML;
}
