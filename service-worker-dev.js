// service-worker-dev.js - Service Worker para desarrollo (sin caché agresivo)
const CACHE_NAME = 'videotr-dev-v1.0.0';
const MODEL_CACHE_NAME = 'videotr-models-dev-v1';

// Helper para rutas relativas al scope
const R = (p) => new URL(p, self.registration.scope).toString();

// Solo archivos críticos para desarrollo
const ARCHIVOS_CRITICOS = [
    R('manifest.webmanifest'),
    R('assets/logo.svg')
];

console.log('Service Worker DEV iniciado');

// Instalación - solo caché mínimo
self.addEventListener('install', (event) => {
    console.log('Service Worker DEV: Instalando...');
    
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('Service Worker DEV: Cacheando archivos críticos');
            return cache.addAll(ARCHIVOS_CRITICOS);
        }).then(() => {
            console.log('Service Worker DEV: Instalación completa');
            return self.skipWaiting();
        })
    );
});

// Activación - limpiar caché antiguo
self.addEventListener('activate', (event) => {
    console.log('Service Worker DEV: Activando...');
    
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME && cacheName !== MODEL_CACHE_NAME) {
                        console.log('Service Worker DEV: Eliminando caché antigua:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Interceptar peticiones - Network first para desarrollo
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Para modelos de IA - mantener caché
    if (url.hostname === 'huggingface.co' || url.pathname.includes('onnx')) {
        event.respondWith(
            caches.open(MODEL_CACHE_NAME).then(cache => {
                return cache.match(request).then(response => {
                    if (response) {
                        console.log('Service Worker DEV: Modelo desde caché:', url.pathname);
                        return response;
                    }
                    
                    return fetch(request).then(networkResponse => {
                        if (networkResponse && networkResponse.status === 200) {
                            cache.put(request, networkResponse.clone());
                        }
                        return networkResponse;
                    });
                });
            })
        );
        return;
    }
    
    // Para archivos locales - Network first (desarrollo)
    if (url.origin === location.origin) {
        event.respondWith(
            fetch(request)
                .then(response => {
                    // Solo cachear si es exitoso y es un archivo crítico
                    if (response && response.status === 200 && ARCHIVOS_CRITICOS.includes(request.url)) {
                        const responseClone = response.clone();
                        caches.open(CACHE_NAME).then(cache => {
                            cache.put(request, responseClone);
                        });
                    }
                    return response;
                })
                .catch(() => {
                    // Fallback a caché solo si la red falla
                    return caches.match(request).then(response => {
                        if (response) {
                            console.log('Service Worker DEV: Usando caché como fallback:', request.url);
                        }
                        return response;
                    });
                })
        );
        return;
    }
    
    // Para recursos externos - pasar directo
    event.respondWith(fetch(request));
});

// Manejo de mensajes
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'CLEAR_CACHE') {
        caches.delete(CACHE_NAME).then(success => {
            event.ports[0].postMessage({ success });
        }).catch(error => {
            event.ports[0].postMessage({ success: false, error: error.message });
        });
    }
    
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

// Notificar cambios de conectividad
self.addEventListener('online', () => {
    console.log('Service Worker DEV: Online');
    self.clients.matchAll().then(clients => {
        clients.forEach(client => {
            client.postMessage({ 
                type: 'NETWORK_STATUS', 
                online: true,
                message: 'Modo desarrollo - Red disponible'
            });
        });
    });
});

self.addEventListener('offline', () => {
    console.log('Service Worker DEV: Offline');
    self.clients.matchAll().then(clients => {
        clients.forEach(client => {
            client.postMessage({ 
                type: 'NETWORK_STATUS', 
                online: false,
                message: 'Modo desarrollo - Sin conexión'
            });
        });
    });
});
