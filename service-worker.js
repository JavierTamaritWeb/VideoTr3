// service-worker.js - Service Worker para PWA y caché
const CACHE_NAME = 'videotr-v1.1.0';
const MODEL_CACHE_NAME = 'videotr-models-v1';

// Helper para rutas relativas al scope
const R = (p) => new URL(p, self.registration.scope).toString();

// Archivos esenciales para funcionamiento offline
const ARCHIVOS_ESENCIALES = [
    R('index.html'),
    R('css/tokens.css'),
    R('css/base.css'),
    R('css/layout.css'),
    R('css/componentes.css'),
    R('js/main.js'),
    R('js/modulos/ui.js'),
    R('js/modulos/estado.js'),
    R('js/modulos/registro.js'),
    R('js/modulos/extractor-audio.js'),
    R('js/modulos/transcriptor.js'),
    R('js/modulos/motor-local.js'),
    R('js/modulos/motor-api.js'),
    R('js/modulos/exportador-txt-md.js'),
    R('js/modulos/exportador-rtf.js'),
    R('js/modulos/exportador-docx.js'),
    R('js/modulos/util-wav.js'),
    R('js/modulos/util-archivo.js'),
    R('js/workers/worker-transcribe.js'),
    R('manifest.webmanifest'),
    R('assets/logo.svg')
];

// Instalación del Service Worker
self.addEventListener('install', (event) => {
    console.log('Service Worker: Instalando...');
    
    event.waitUntil(
        caches.open(CACHE_NAME).then(async cache => {
            console.log('Service Worker: Precacheando archivos esenciales...');
            try { 
                await cache.addAll(ARCHIVOS_ESENCIALES);
                console.log('Service Worker: Precache completado');
            }
            catch (e) { 
                console.warn('Service Worker: Precache parcial:', e.message); 
            }
        }).then(() => self.skipWaiting())
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
    
    // Gestión de caché avanzada
    if (event.data && event.data.type === 'GET_CACHE_INFO') {
        getCacheInfo().then(info => {
            event.ports[0].postMessage({ success: true, cacheInfo: info });
        }).catch(error => {
            event.ports[0].postMessage({ success: false, error: error.message });
        });
    }
    
    if (event.data && event.data.type === 'CLEAR_SPECIFIC_CACHE') {
        const { cacheName } = event.data;
        caches.delete(cacheName).then(success => {
            event.ports[0].postMessage({ 
                success, 
                message: success ? `Caché ${cacheName} eliminada` : `Error eliminando caché ${cacheName}` 
            });
        });
    }
});

// === FUNCIONES AUXILIARES ===

// Obtener información detallada de caché
async function getCacheInfo() {
    const cacheNames = await caches.keys();
    const cacheInfo = [];
    
    for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        const keys = await cache.keys();
        const size = keys.length;
        
        // Calcular tamaño aproximado
        let estimatedSize = 0;
        for (const request of keys) {
            const response = await cache.match(request);
            if (response && response.headers.get('content-length')) {
                estimatedSize += parseInt(response.headers.get('content-length'));
            }
        }
        
        cacheInfo.push({
            name: cacheName,
            entries: size,
            estimatedSize: estimatedSize,
            lastModified: new Date().toISOString()
        });
    }
    
    return cacheInfo;
}

// Función para limpiar cachés obsoletas
async function cleanupOldCaches() {
    const cacheNames = await caches.keys();
    const currentCaches = [CACHE_NAME, MODEL_CACHE_NAME];
    
    return Promise.all(
        cacheNames.map(cacheName => {
            if (!currentCaches.includes(cacheName)) {
                console.log('Service Worker: Limpiando caché obsoleta:', cacheName);
                return caches.delete(cacheName);
            }
        })
    );
}

// Función para verificar disponibilidad offline
self.addEventListener('online', () => {
    console.log('Service Worker: Conectividad restaurada');
    self.clients.matchAll().then(clients => {
        clients.forEach(client => {
            client.postMessage({ 
                type: 'NETWORK_STATUS', 
                online: true,
                message: 'Conexión a internet restaurada'
            });
        });
    });
});

self.addEventListener('offline', () => {
    console.log('Service Worker: Modo offline activado');
    self.clients.matchAll().then(clients => {
        clients.forEach(client => {
            client.postMessage({ 
                type: 'NETWORK_STATUS', 
                online: false,
                message: 'Trabajando en modo offline'
            });
        });
    });
});

// Error handling mejorado
self.addEventListener('error', (event) => {
    console.error('Service Worker error:', event.error);
    
    // Reportar errores críticos al cliente
    self.clients.matchAll().then(clients => {
        clients.forEach(client => {
            client.postMessage({
                type: 'SERVICE_WORKER_ERROR',
                error: event.error.message,
                stack: event.error.stack
            });
        });
    });
});

// Manejo de actualizaciones automáticas
self.addEventListener('updatefound', () => {
    console.log('Service Worker: Nueva versión encontrada');
    
    self.clients.matchAll().then(clients => {
        clients.forEach(client => {
            client.postMessage({
                type: 'UPDATE_AVAILABLE',
                message: 'Nueva versión disponible. Recarga la página para actualizar.'
            });
        });
    });
});