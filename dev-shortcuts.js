// Agregar al final de main.js para desarrollo
// Atajo Ctrl+Shift+R para limpiar caché y recargar

document.addEventListener('keydown', (e) => {
    // Ctrl+Shift+R - Limpiar caché y recargar
    if (e.ctrlKey && e.shiftKey && e.key === 'R') {
        e.preventDefault();
        
        if ('serviceWorker' in navigator) {
            // Limpiar todos los cachés
            caches.keys().then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => caches.delete(cacheName))
                );
            }).then(() => {
                console.log('🧹 Caché limpiado');
                // Desregistrar service worker
                navigator.serviceWorker.getRegistrations().then(registrations => {
                    registrations.forEach(registration => {
                        registration.unregister();
                    });
                    // Recargar después de limpiar
                    setTimeout(() => {
                        window.location.reload(true);
                    }, 100);
                });
            });
        } else {
            // Si no hay service worker, solo recargar forzado
            window.location.reload(true);
        }
        
        return false;
    }
    
    // Ctrl+Shift+D - Toggle modo desarrollo
    if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        
        const isDev = localStorage.getItem('dev-mode') === 'true';
        localStorage.setItem('dev-mode', (!isDev).toString());
        
        console.log(`🔧 Modo desarrollo: ${!isDev ? 'ACTIVADO' : 'DESACTIVADO'}`);
        
        if (window.videoTR && window.videoTR.anunciarARIA) {
            window.videoTR.anunciarARIA(`Modo desarrollo ${!isDev ? 'activado' : 'desactivado'}`);
        }
        
        // Mostrar notificación
        if (typeof mostrarNotificacion === 'function') {
            mostrarNotificacion(
                `Modo desarrollo ${!isDev ? 'activado' : 'desactivado'}`, 
                'info'
            );
        }
    }
});

// Mostrar indicador de modo desarrollo
if (localStorage.getItem('dev-mode') === 'true') {
    const devIndicator = document.createElement('div');
    devIndicator.textContent = '🔧 DEV';
    devIndicator.style.cssText = `
        position: fixed;
        bottom: 10px;
        right: 10px;
        background: #ff6b35;
        color: white;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: bold;
        z-index: 10001;
        pointer-events: none;
        font-family: monospace;
    `;
    document.body.appendChild(devIndicator);
}
