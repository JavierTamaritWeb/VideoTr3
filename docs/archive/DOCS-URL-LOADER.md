# Funcionalidad de Carga por URL - VideoTR3

## Resumen

Se ha implementado la funcionalidad para cargar vídeos desde URLs de Instagram, TikTok y YouTube, siguiendo un enfoque realista que respeta las limitaciones CORS y términos de servicio de las plataformas.

## Características Implementadas

### 1. Validación de URLs
- **Plataformas soportadas**: Instagram, TikTok, YouTube
- **Validación en tiempo real** del campo URL
- **Rate limiting** simple (5 intentos por minuto)

### 2. Verificación de Duración (YouTube)
- Usa **YouTube IFrame Player API** para obtener duración sin reproducir
- **Límite de duración**: 10 minutos máximo
- Bloquea vídeos largos **antes** de intentar descarga

### 3. Descarga Directa (cuando es posible)
- Intenta descarga directa solo si la URL permite **CORS**
- **Límite de tamaño**: 100 MB máximo
- **Progreso en tiempo real** con AbortController para cancelación
- **Timeout**: 90 segundos

### 4. Fallback Guiado
- Cuando CORS bloquea la descarga, muestra **guías específicas** por plataforma
- Enlaces a **documentación oficial** de cada plataforma
- **File picker** integrado para subir archivo descargado manualmente

### 5. Accesibilidad Completa
- **Región viva** (`aria-live`) para anuncios
- **Navegación por teclado** (Tab, Enter, Espacio)
- **Validación accesible** con `setCustomValidity`
- **Estados claros** de progreso y error

## Archivos Modificados

### Nuevos Archivos
- `js/modulos/url-loader.js` - Módulo principal de carga por URL

### Archivos Modificados
- `index.html` - Nueva sección de entrada por URL
- `js/main.js` - Integración con flujo existente
- `js/modulos/ui.js` - Nuevos métodos para UI de URL
- `css/componentes.css` - Estilos para nueva funcionalidad
- `css/tokens.css` - Variables de color para advertencias

## Flujo de Uso

### Caso A: Descarga Exitosa
1. Usuario pega URL de YouTube/Instagram/TikTok
2. Sistema valida URL y verifica duración (si es YouTube)
3. Intenta descarga directa con CORS
4. Si funciona → archivo disponible para transcripción

### Caso B: Fallback Guiado (más común)
1. Usuario pega URL
2. Sistema valida URL y verifica duración
3. Descarga directa falla por CORS/ToS
4. Se muestra guía específica de la plataforma
5. Usuario descarga manualmente y sube archivo
6. Archivo disponible para transcripción

## Límites y Restricciones

### Técnicos
- **Duración máxima**: 10 minutos
- **Tamaño máximo**: 100 MB
- **Timeout**: 90 segundos
- **Rate limit**: 5 intentos por minuto

### Legales/Éticos
- **No elude** protecciones CORS
- **Respeta** términos de servicio
- **Guía** hacia métodos oficiales
- **Solo** contenido con permisos adecuados

## Ejemplos de URLs Soportadas

```
YouTube:
- https://www.youtube.com/watch?v=dQw4w9WgXcQ
- https://youtu.be/dQw4w9WgXcQ
- https://www.youtube.com/shorts/abc123

Instagram:
- https://www.instagram.com/p/ABC123/
- https://instagram.com/reel/XYZ789/

TikTok:
- https://www.tiktok.com/@user/video/123456789
- https://tiktok.com/t/ABC123/
```

## Configuración CSP

Se actualizó la Content Security Policy para permitir:
- Scripts de YouTube: `https://www.youtube.com`
- Frames de YouTube: `frame-src https://www.youtube.com`

## API de YouTube IFrame

### Carga Dinámica
```javascript
window.onYouTubeIframeAPIReady = () => resolve();
```

### Obtención de Duración
```javascript
const player = new YT.Player(div, {
    videoId: id,
    events: {
        onReady: () => {
            const duration = player.getDuration();
            // Validar duración...
        }
    }
});
```

## Mensajes de Error Comunes

- **"URL no válida o plataforma no soportada"** - URL no coincide con patrón
- **"Vídeo demasiado largo (X min). Límite: 10 min"** - Duración excesiva
- **"Archivo demasiado grande (>100 MB)"** - Tamaño excesivo
- **"Demasiados intentos. Espera un minuto"** - Rate limit alcanzado
- **"ID de vídeo inválido"** - YouTube no puede encontrar el vídeo
- **"Vídeo no permite reproducción embebida"** - Restricciones de YouTube

## Integración con Flujo Existente

Una vez obtenido el archivo (directo o manual), el flujo continúa normalmente:
1. **ExtractorAudio** → convierte vídeo a WAV
2. **Transcriptor** → transcribe audio con IA
3. **Exportadores** → generan archivos TXT/MD/RTF/DOCX
4. **Registro** → guarda en historial

## Pruebas Recomendadas

### URLs de Prueba
1. **YouTube público corto** - debería funcionar o mostrar guía
2. **YouTube largo (>10 min)** - debería bloquearse por duración
3. **Instagram/TikTok** - debería mostrar guía manual
4. **URL inválida** - debería mostrar error de validación
5. **URL directa a MP4** - debería descargar si permite CORS

### Casos Edge
- URLs con parámetros adicionales
- Vídeos privados o restringidos
- Vídeos eliminados o no disponibles
- Conexión lenta o intermitente
- Cancelación durante descarga

## Consideraciones de Seguridad

- **No ejecución** de código remoto
- **Validación** de tipos MIME
- **Límites** de tamaño estrictos
- **Timeout** para evitar cuelgues
- **Rate limiting** para prevenir abuso

## Mantenimiento

### Actualizaciones Futuras
- Revisar **patrones de URL** si las plataformas cambian
- Actualizar **enlaces de ayuda** si cambian las guías oficiales
- Ajustar **límites** según feedback de usuarios
- Añadir **nuevas plataformas** si es necesario

### Monitoreo
- Revisar logs de errores CORS
- Verificar funcionamiento de YouTube API
- Comprobar validez de enlaces de ayuda
- Analizar tiempos de respuesta
