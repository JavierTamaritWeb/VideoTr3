# 📚 Documentación VideoTR3

## 🏠 Índice General

VideoTR3 es una PWA (Progressive Web App) para transcripción de vídeos usando IA, con soporte para carga local y desde URLs de redes sociales.

### 📖 Guías de Usuario

- [**Manual de Usuario**](user-guide/user-manual.md) - Guía completa para usar la aplicación
- [**Guía de Accesibilidad**](user-guide/accessibility.md) - Características de accesibilidad implementadas
- [**Formatos Soportados**](user-guide/supported-formats.md) - Vídeos y audio compatibles

### ⚙️ Características y Funcionalidades

- [**Carga por URL**](features/url-loader.md) - Instagram, TikTok, YouTube
- [**Transcripción Local**](features/local-transcription.md) - Whisper WASM/WebGPU
- [**APIs de Transcripción**](features/api-transcription.md) - OpenAI, Deepgram, AssemblyAI
- [**Exportación**](features/export-formats.md) - TXT, MD, RTF, DOCX
- [**PWA Features**](features/pwa.md) - Offline, instalación, service worker

### 🛠️ Desarrollo

- [**Arquitectura**](development/architecture.md) - Estructura del código y módulos
- [**Guía BEM**](development/bem-guide.md) - Metodología CSS empleada
- [**API Reference**](api/modules.md) - Documentación de módulos JS
- [**Testing**](development/testing.md) - Pruebas y casos de uso
- [**Contributing**](development/contributing.md) - Guía para contribuir

### 🚀 Deployment

- [**PWA Setup**](development/pwa-setup.md) - Configuración como PWA
- [**Build Process**](development/build.md) - Proceso de construcción
- [**Security**](development/security.md) - Consideraciones de seguridad

---

## 🔗 Enlaces Rápidos

| Sección | Descripción | Archivo Principal |
|---------|-------------|-------------------|
| **Usuario** | Cómo usar la app | [Manual de Usuario](user-guide/user-manual.md) |
| **Desarrollador** | Arquitectura y código | [Arquitectura](development/architecture.md) |
| **API** | Referencia de módulos | [API Modules](api/modules.md) |
| **PWA** | Funcionalidades PWA | [PWA Features](features/pwa.md) |

---

## 📱 VideoTR3 en Resumen

### ✨ Características Principales

- 🎥 **Transcripción de vídeos** con IA (local y APIs)
- 🌐 **Carga desde URLs** (Instagram, TikTok, YouTube)
- ♿ **Totalmente accesible** (WAI-ARIA, teclado)
- 📱 **PWA completa** (offline, instalable)
- 🎨 **Interfaz moderna** con temas claro/oscuro
- 📄 **Múltiples formatos** de exportación
- 🔒 **Privacidad garantizada** (procesamiento local)

### 🏗️ Stack Tecnológico

- **Frontend**: Vanilla JS (ES Modules), CSS Grid/Flexbox
- **IA**: Whisper WASM/WebGPU, APIs externas
- **PWA**: Service Worker, Web App Manifest
- **CSS**: Metodología BEM, CSS Custom Properties
- **Accesibilidad**: WAI-ARIA completo

---

**Última actualización**: Septiembre 2025  
**Versión**: 3.0  
**Autor**: Javier Tamarit
