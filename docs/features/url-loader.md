# 🌐 Carga por URL - VideoTR3

## 📋 Resumen

La funcionalidad de **Carga por URL** permite a los usuarios cargar vídeos desde Instagram, TikTok y YouTube directamente pegando la URL. La implementación sigue un enfoque realista que respeta las limitaciones CORS y términos de servicio de las plataformas.

## ✨ Características Implementadas

### 🔍 1. Validación de URLs

- **Plataformas soportadas**: Instagram, TikTok, YouTube
- **Validación en tiempo real** del campo URL
- **Rate limiting** simple (5 intentos por minuto)
- **Patrones de URL reconocidos**:
  ```
  YouTube: youtube.com/watch?v=*, youtu.be/*, youtube.com/shorts/*
  Instagram: instagram.com/p/*, instagram.com/reel/*
  TikTok: tiktok.com/@*/video/*, tiktok.com/t/*
  ```

### ⏱️ 2. Verificación de Duración (YouTube)

- Usa **YouTube IFrame Player API** para obtener duración sin reproducir
- **Límite de duración**: 10 minutos máximo
- Bloquea vídeos largos **antes** de intentar descarga
- Manejo de errores específicos (vídeo privado, no encontrado, etc.)

### ⬇️ 3. Descarga Directa (cuando es posible)

- Intenta descarga directa solo si la URL permite **CORS**
- **Límite de tamaño**: 100 MB máximo
- **Progreso en tiempo real** con AbortController para cancelación
- **Timeout**: 90 segundos
- Detección automática de tipo MIME

### 📖 4. Fallback Guiado

- Cuando CORS bloquea la descarga, muestra **guías específicas** por plataforma
- Enlaces a **documentación oficial** de cada plataforma
- **File picker** integrado para subir archivo descargado manualmente
- Instrucciones claras paso a paso

### ♿ 5. Accesibilidad Completa

- **Región viva** (`aria-live`) para anuncios
- **Navegación por teclado** (Tab, Enter, Espacio)
- **Validación accesible** con `setCustomValidity`
- **Estados claros** de progreso y error
- Foco manejado correctamente en modales

## 🏗️ Arquitectura Técnica

### 📁 Archivos Implementados

#### Nuevos Módulos
- `js/modulos/url-loader.js` - Módulo principal de carga por URL (425 líneas)

#### Archivos Modificados
- `index.html` - Nueva sección de entrada por URL + CSP actualizada
- `js/main.js` - Integración con flujo existente
- `js/modulos/ui.js` - Nuevos métodos para UI de URL
- `css/componentes.css` - Estilos para nueva funcionalidad
- `css/tokens.css` - Variables de color para advertencias

### 🔧 API Principal

```javascript
// Módulo URLLoader
class URLLoader {
  validarUrlSoportada(url)                    // Valida plataforma
  getYoutubeDuration(url)                     // Obtiene duración YT
  intentarDescargaCORS(url, onProgreso)       // Descarga directa
  guiarDescargaManual(plataforma)             // Fallback guiado
  cargarDesdeURL(url, callbacks)              // Proceso principal
}
```

### 🔄 Flujo de Proceso

#### Caso A: Descarga Exitosa (raro)
```
URL → Validación → Duración (YT) → Descarga CORS → ✅ Transcripción
```

#### Caso B: Fallback Guiado (común)
```
URL → Validación → Duración (YT) → Intento CORS → ❌ → Guía Manual → Upload → ✅ Transcripción
```

## 🛡️ Seguridad y Límites

### 🚨 Validaciones Implementadas

| Límite | Valor | Propósito |
|--------|--------|-----------|
| **Rate limiting** | 5 intentos/minuto | Prevenir abuso |
| **Duración máxima** | 10 minutos | Evitar vídeos largos |
| **Tamaño máximo** | 100 MB | Limitar recursos |
| **Timeout** | 90 segundos | Evitar cuelgues |

### 🔒 Consideraciones de Seguridad

- **No elude** protecciones CORS
- **Respeta** términos de servicio
- **Validación** de tipos MIME
- **CSP actualizada** para YouTube API
- **AbortController** para prevenir cuelgues

## 🎨 Experiencia de Usuario

### 💬 Mensajes Honestos

- **"Si no es posible descargar directamente por restricciones CORS/ToS, se te guiará para subir el archivo manualmente"**
- Enlaces a **documentación oficial** de cada plataforma
- **Sin promesas falsas** sobre "descargar cualquier vídeo"

### 📱 Guías por Plataforma

#### YouTube
```
1. Si el vídeo es tuyo, usa YouTube Studio para descargarlo
2. Si tiene permiso del autor, busca el botón "Descargar" bajo el vídeo
3. Para contenido público, usa herramientas oficiales cuando estén disponibles
4. Una vez descargado, sube el archivo usando el botón de abajo
```

#### Instagram
```
1. Para contenido propio, solicita tu archivo de datos desde Configuración
2. Ve a Configuración → Privacidad → Descargar tus datos
3. Instagram enviará un archivo con todos tus contenidos
4. También puedes guardar tu propio contenido desde la app móvil
```

#### TikTok
```
1. Si el autor permite descargas, usa el botón "Guardar vídeo"
2. Para contenido propio, usa "Guardar en dispositivo" desde la app
3. Asegúrate de que las descargas estén habilitadas en la configuración
4. Una vez guardado, sube el archivo aquí
```

## 🧪 Testing y Casos de Uso

### 🔗 URLs de Prueba

```bash
# YouTube válidos
https://www.youtube.com/watch?v=dQw4w9WgXcQ
https://youtu.be/dQw4w9WgXcQ
https://www.youtube.com/shorts/abc123

# Instagram (mostrarán guía)
https://www.instagram.com/p/ABC123/
https://instagram.com/reel/XYZ789/

# TikTok (mostrarán guía)
https://www.tiktok.com/@user/video/123456789

# URLs inválidas
https://example.com/video.mp4
https://vimeo.com/123456
```

### ✅ Casos de Prueba

- [ ] Validación en tiempo real del campo URL
- [ ] Rate limiting (>5 intentos/minuto)
- [ ] Duración YouTube (vídeo >10 min)
- [ ] Progreso de descarga (si CORS permite)
- [ ] Cancelación de descarga
- [ ] Modal de guía manual
- [ ] File picker integrado
- [ ] Accesibilidad con teclado
- [ ] Integración con transcripción

## 🚀 Configuración y Deployment

### 📋 Configuración CSP

```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-eval' https://www.youtube.com; 
               frame-src https://www.youtube.com; 
               connect-src 'self' https:;">
```

### 🔌 YouTube IFrame API

```javascript
// Carga dinámica de la API
window.onYouTubeIframeAPIReady = () => resolve();

// Obtención de duración
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

## 🔮 Futuras Mejoras

### 🎯 Extensibilidad

El diseño modular permite:
- ✅ Añadir nuevas plataformas fácilmente
- ✅ Actualizar patrones de URL sin refactoring
- ✅ Modificar límites desde configuración
- ✅ Integrar APIs oficiales si se dispone de claves

### 📈 Posibles Mejoras

- **Más plataformas**: Vimeo, Dailymotion, etc.
- **Cache inteligente** de metadatos de vídeos
- **Progreso mejorado** con estimaciones de tiempo
- **Configuración personalizable** de límites
- **Analytics** de uso y errores

---

## 📞 Soporte

Para problemas relacionados con esta funcionalidad:

1. **Verificar** que la URL sea de una plataforma soportada
2. **Comprobar** límites de duración y tamaño
3. **Revisar** la consola del navegador para errores
4. **Usar** el fallback manual si la descarga directa falla

**Recuerda**: La mayoría de URLs requerirán descarga manual debido a las restricciones CORS y términos de servicio de las plataformas.

---

**Implementado**: Septiembre 2025  
**Autor**: Javier Tamarit  
**Versión**: VideoTR3 v3.0
