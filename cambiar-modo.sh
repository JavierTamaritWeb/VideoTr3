#!/bin/bash

# Script para cambiar entre modo desarrollo y producción

if [ "$1" == "dev" ]; then
    echo "🔧 Cambiando a modo DESARROLLO..."
    
    # Reemplazar service worker en main.js
    sed -i '' 's/service-worker\.js/service-worker-dev.js/g' js/main.js
    
    # Mensaje de confirmación
    echo "✅ Modo desarrollo activado"
    echo "   - Service Worker sin caché agresivo"
    echo "   - Network-first strategy"
    echo "   - Auto-reload mejorado"
    echo ""
    echo "📝 Para volver a producción, ejecuta: ./cambiar-modo.sh prod"
    
elif [ "$1" == "prod" ]; then
    echo "🚀 Cambiando a modo PRODUCCIÓN..."
    
    # Reemplazar service worker en main.js
    sed -i '' 's/service-worker-dev\.js/service-worker.js/g' js/main.js
    
    echo "✅ Modo producción activado"
    echo "   - Service Worker con caché completo"
    echo "   - Cache-first strategy"
    echo "   - PWA optimizado"
    
else
    echo "❌ Uso: ./cambiar-modo.sh [dev|prod]"
    echo ""
    echo "Opciones:"
    echo "  dev  - Modo desarrollo (sin caché agresivo)"
    echo "  prod - Modo producción (caché completo)"
fi
