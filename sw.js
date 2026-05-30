/* ──────────────────────────────────────────────────────────────────────────
   Shop List — Service Worker
   Estratégia: cache-first para o app shell, com atualização controlada pelo
   usuário (skipWaiting só acontece quando o cliente envia 'SKIP_WAITING').

   IMPORTANTE: incremente CACHE_VERSION a cada deploy para que o navegador
   detecte a mudança e dispare o fluxo de atualização no cliente.
   ────────────────────────────────────────────────────────────────────────── */

const CACHE_VERSION = 'shoplist-v2';   // ← incremente a cada release: v3, v4, ...
const CACHE_NAME     = CACHE_VERSION;

// Recursos do app shell para precache. Ajuste conforme os arquivos do projeto.
const PRECACHE_URLS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable.png',
];

// ── INSTALL ──────────────────────────────────────────────────────────────
// NÃO chamamos skipWaiting() aqui. O novo SW fica em "waiting" até o usuário
// clicar em "Update", momento em que o cliente envia a mensagem SKIP_WAITING.
// Isto é o que evita o loop de reloads automáticos.
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .catch((err) => console.warn('[SW] precache falhou (continua):', err))
  );
});

// ── ACTIVATE ─────────────────────────────────────────────────────────────
// Limpa caches de versões antigas e assume controle das páginas abertas.
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// ── MESSAGE ──────────────────────────────────────────────────────────────
// O cliente envia 'SKIP_WAITING' quando o usuário clica em "Update".
// Só então o SW novo ativa, dispara 'controllerchange' no cliente,
// e o cliente recarrega UMA vez (guarda _swReloading no index.html).
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING' || (event.data && event.data.type === 'SKIP_WAITING')) {
    self.skipWaiting();
  }
});

// ── FETCH ────────────────────────────────────────────────────────────────
// Estratégia:
//  - Navegação (HTML): network-first com fallback para cache (garante que o
//    usuário receba a versão mais nova quando online, mas funcione offline).
//  - Demais GETs same-origin: cache-first com atualização em background.
//  - Requisições para APIs externas (googleapis, etc.): sempre network, sem cache.
self.addEventListener('fetch', (event) => {
  const req = event.request;

  // Só intercepta GET
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // Fontes Google (fonts.googleapis.com / fonts.gstatic.com) → cache-first.
  // São estáticas e versionadas, seguras para cachear entre sessões.
  const FONT_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com'];
  if (FONT_HOSTS.includes(url.hostname)) {
    event.respondWith(
      caches.match(req).then((cached) => cached || fetch(req).then((res) => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(req, copy)).catch(() => {});
        }
        return res;
      }).catch(() => cached))
    );
    return;
  }

  // Não intercepta outras chamadas externas (Google Drive API, GIS, Picker)
  if (url.origin !== self.location.origin) return;

  // Navegação / documentos HTML → network-first
  if (req.mode === 'navigate' || (req.headers.get('accept') || '').includes('text/html')) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(req, copy)).catch(() => {});
          return res;
        })
        .catch(() => caches.match(req).then((cached) => cached || caches.match('./index.html')))
    );
    return;
  }

  // Demais assets same-origin → cache-first
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) {
        // Atualiza em background sem bloquear a resposta
        fetch(req).then((res) => {
          caches.open(CACHE_NAME).then((c) => c.put(req, res)).catch(() => {});
        }).catch(() => {});
        return cached;
      }
      return fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then((c) => c.put(req, copy)).catch(() => {});
        return res;
      });
    })
  );
});
