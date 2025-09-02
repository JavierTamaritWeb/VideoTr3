// service-worker.js - Service Worker para PWA y caché
const CACHE_NAME = 'videotr-v1.0.0';
const MODEL_CACHE_NAME = 'videotr-models-v1';

// Archivos esenciales para funcionamiento offline
const ARCHIVOS_ESENCIALES = [
    '/',
    '/index.html',
    '/css/tokens.css',
    '/css/base.css',
    '/css/layout.css',
    '/css/componentes.css',
    '/js/main.js',
    '/js/modulos/ui.js',
    '/js/modulos/estado.js',
    '/js/modulos/registro.js',
    '/js/modulos/extractor-audio.js',
    '/js/modulos/transcriptor.js',
    '/js/modulos/motor-local.js',
    '/js/modulos/motor-api.js',
    '/js/modulos/exportador-txt-md.js',
    '/js/modulos/exportador-rtf.js',
    '/js/modulos/exportador-docx.js',
    '/js/modulos/util-wav.js',
    '/js/modulos/util-archivo.js',
    '/js/workers/worker-transcribe.js',
    '/manifest.webmanifest',
    '/assets/logo.svg'
];

// Instalación del Service Worker
self.addEventListener('install', (event) => {
    console.log('Service Worker: Instalando...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Service Worker: Cacheando archivos esenciales');
                return cache.addAll(ARCHIVOS_ESENCIALES);
            })
            .then(() => self.skipWaiting())
    );
});

// Activación del Service Worker
self.addEventListener('activate', (event) => {
    console.log('Service Worker: Activando...');
    
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME && cacheName !== MODEL_CACHE_NAME) {
                        console.log('Service Worker: Eliminando caché antigua:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Interceptar peticiones
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Estrategia para modelos de IA (cache first, network fallback)
    if (url.hostname === 'huggingface.co' || url.pathname.includes('onnx')) {
        event.respondWith(
            caches.open(MODEL_CACHE_NAME).then(cache => {
                return cache.match(request).then(response => {
                    if (response) {
                        console.log('Service Worker: Modelo desde caché:', url.pathname);
                        return response;
                    }
                    
                    return fetch(request).then(networkResponse => {
                        // Cachear solo respuestas exitosas
                        if (networkResponse && networkResponse.status === 200) {
                            cache.put(request, networkResponse.clone());
                            console.log('Service Worker: Modelo cacheado:', url.pathname);
                        }
                        return networkResponse;
                    });
                });
            })
        );
        return;
    }
    
    // Estrategia para archivos locales (cache first)
    if (url.origin === location.origin) {
        event.respondWith(
            caches.match(request).then(response => {
                if (response) {
                    return response;
                }
                
                return fetch(request).then(networkResponse => {
                    // No cachear respuestas no exitosas
                    if (!networkResponse || networkResponse.status !== 200) {
                        return networkResponse;
                    }
                    
                    // Clonar la respuesta
                    const responseToCache = networkResponse.clone();
                    
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(request, responseToCache);
                    });
                    
                    return networkResponse;
                }).catch(() => {
                    // Si falla la red y no hay caché, mostrar página offline
                    if (request.destination === 'document') {
                        return caches.match('/index.html');
                    }
                });
            })
        );
        return;
    }
    
    // Para recursos externos (CDN), network first
    event.respondWith(
        fetch(request).catch(() => {
            return caches.match(request);
        })
    );
});

// Mensaje para limpiar caché de modelos
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'LIMPIAR_CACHE_MODELOS') {
        console.log('Service Worker: Limpiando caché de modelos...');
        
        caches.delete(MODEL_CACHE_NAME).then(() => {
            event.ports[0].postMessage({ success: true });
        }).catch(error => {
            event.ports[0].postMessage({ success: false, error: error.message });
        });
    }
    
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});