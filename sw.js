// ============================================================
//  Shop List — Service Worker
//  Estratégia: Cache-First para assets estáticos,
//              Network-First para navegação (HTML)
// ============================================================

const CACHE_VERSION = 'shoplist-v1';

// Assets que serão cacheados na instalação do SW
const PRECACHE_ASSETS = [
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable.png',
  // Fontes do Google (serão cacheadas na primeira visita via runtime caching)
];

// Domínios externos tratados com runtime caching
const FONT_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com'];

// ── INSTALL ──────────────────────────────────────────────────
// Pré-cacheia os assets locais e ativa imediatamente
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then(cache => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting()) // ativa sem esperar aba fechar
  );
});

// ── ACTIVATE ─────────────────────────────────────────────────
// Remove caches de versões anteriores
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_VERSION)
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim()) // assume controle imediato das abas abertas
  );
});

// ── FETCH ────────────────────────────────────────────────────
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignora requisições não-GET e extensões de browser
  if (request.method !== 'GET') return;
  if (url.protocol === 'chrome-extension:') return;

  // Fontes Google — Cache-First com fallback de rede
  if (FONT_HOSTS.includes(url.hostname)) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // HTML principal — Network-First: tenta buscar versão fresca,
  // cai no cache se offline
  if (request.mode === 'navigate' || url.pathname.endsWith('.html')) {
    event.respondWith(networkFirstWithCache(request));
    return;
  }

  // Demais assets locais — Cache-First
  if (url.origin === self.location.origin) {
    event.respondWith(cacheFirst(request));
    return;
  }
});

// ── ESTRATÉGIAS ──────────────────────────────────────────────

/**
 * Cache-First: retorna do cache se disponível, senão busca na rede
 * e armazena para próximas requisições.
 */
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_VERSION);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    // Sem cache e sem rede — retorna 503 silencioso
    return new Response('Sem conexão e sem cache disponível.', {
      status: 503,
      statusText: 'Service Unavailable',
    });
  }
}

/**
 * Network-First: tenta a rede primeiro; se falhar (offline),
 * usa o cache. Ideal para o HTML principal que pode ser atualizado.
 */
async function networkFirstWithCache(request) {
  const cache = await caches.open(CACHE_VERSION);

  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone()); // atualiza cache em background
    }
    return response;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;

    // Fallback de emergência: retorna o ShopList.html cacheado
    const fallback = await cache.match('./index.html');
    return fallback || new Response('App offline e sem cache.', { status: 503 });
  }
}

// ── MENSAGENS ────────────────────────────────────────────────
// Permite que o app force uma atualização do SW via postMessage
self.addEventListener('message', event => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
