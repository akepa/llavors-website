import { test } from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readDist, readPage, listRoutes } from './helpers.mjs';

const BASE = 'https://www.llavorslogopedia.com/es/';

/** Bloque <script> inline de /es/ que hace el seguimiento delegado de clics. */
function trackingScript() {
  const blocks = [...readPage('/es/').matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)].map((m) => m[1]);
  const script = blocks.find((s) => s.includes('click_whatsapp') && s.includes('addEventListener'));
  assert.ok(script, 'falta el script delegado de seguimiento en /es/');
  return script;
}

/** Ejecuta el script con un document falso y devuelve los gtag() que provoca un clic en `href`. */
function eventsForClick(href) {
  const calls = [];
  let onClick;
  const context = {
    URL,
    gtag: (...args) => calls.push(args),
    document: { addEventListener: (type, fn) => { if (type === 'click') onClick = fn; } },
  };
  vm.runInNewContext(trackingScript(), context);
  assert.ok(onClick, 'el script no escucha clics en document');

  const link = href === null ? null : (() => {
    const u = new URL(href, BASE);
    return { hash: u.hash, hostname: u.hostname, pathname: u.pathname, href: u.href };
  })();
  onClick({ target: { closest: () => link } });
  return calls;
}

test('clic en un enlace a #reserva → click_reservar_cita', () => {
  assert.deepEqual(eventsForClick('#reserva'), [['event', 'click_reservar_cita']]);
  assert.deepEqual(eventsForClick('/es/#reserva'), [['event', 'click_reservar_cita']]);
});

test('clic en WhatsApp con el número del negocio → click_whatsapp', () => {
  assert.deepEqual(eventsForClick('https://wa.me/34600000000?text=Hola'), [['event', 'click_whatsapp']]);
});

test('compartir un artículo por WhatsApp no cuenta como contacto', () => {
  assert.deepEqual(eventsForClick('https://wa.me/?text=Art%C3%ADculo'), []);
});

test('otros clics no envían eventos', () => {
  assert.deepEqual(eventsForClick('/es/blog/'), []);
  assert.deepEqual(eventsForClick(null), []);
});

test('ninguna página manda eventos desde onclick en línea (evita contarlos dos veces)', () => {
  const offenders = listRoutes().filter((r) => /onclick="[^"]*gtag/.test(readPage(r)));
  assert.deepEqual(offenders, []);
});

test('el calendario de /es/ envía reserva_confirmada al confirmar la cita', () => {
  const html = readPage('/es/');
  const srcs = [...html.matchAll(/<script[^>]*\bsrc="(\/_astro\/[^"]+\.js)"/g)].map((m) => m[1]);
  const code = [html, ...srcs.map((s) => readDist(s))].join('\n');
  // El bundler puede reescribir las comillas como `…`.
  assert.match(code, /['"`]reserva_confirmada['"`]/);
});
