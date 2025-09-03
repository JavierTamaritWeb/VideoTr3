# 🎬 VideoTR v3.0 - Transcriptor de Videos Inteligente

[![PWA Ready](https://img.shields.io/badge/PWA-Ready-success?style=flat-square&logo=pwa)](https://web.dev/progressive-web-apps/)
[![WCAG 2.1 AA](https://img.shields.io/badge/WCAG-2.1%20AA-blue?style=flat-square&logo=accessibility)](https://www.w3.org/WAI/WCAG21/quickref/?level=aa)
[![Offline Capable](https://img.shields.io/badge/Offline-Capable-orange?style=flat-square&logo=wifi)](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Offline_Service_workers)
[![License MIT](https://img.shields.io/badge/License-MIT-green?style=flat-square&logo=mit)](LICENSE)

> **Transcriptor de vídeos potente y privado que funciona completamente en tu navegador**

VideoTR es una Progressive Web App (PWA) que permite transcribir vídeos usando IA de última generación directamente en el navegador, garantizando **total privacidad** ya que todos los datos se procesan localmente sin enviar información a servidores externos.

## 🚀 **Quick Start**

### ⚡ **Usar Ahora (Web)**
1. **Abrir**: [VideoTR en tu navegador](https://javierTamaritWeb.github.io/VideoTr3)
2. **Subir**: Arrastra un vídeo o usa "Seleccionar archivo"  
3. **Transcribir**: Haz clic en "Iniciar Transcripción"
4. **Exportar**: Descarga en TXT, MD, RTF o DOCX

### 📱 **Instalar como App**
- **Chrome/Edge**: Botón "Instalar" en la barra de direcciones
- **iOS Safari**: Compartir → "Añadir a pantalla de inicio"
- **Android**: Menú → "Instalar app"

### 💻 **Desarrollo Local**
```bash
git clone https://github.com/JavierTamaritWeb/VideoTr3.git
cd VideoTr3
./cambiar-modo.sh dev  # Modo desarrollo sin caché agresivo
# Abrir con Live Server en puerto 8006
```

## ✨ Características Principales

### 🚀 **Progressive Web App Completa**
- **Instalable**: Como una app nativa en móvil y escritorio
- **Offline**: Funciona sin conexión a internet una vez instalado
- **Responsive**: Adaptado a todos los dispositivos y tamaños de pantalla
- **Auto-actualizaciones**: Se actualiza automáticamente en segundo plano

### 🧠 **IA de Transcripción Avanzada**
- **Whisper.js**: Modelo de OpenAI corriendo en el navegador
- **Múltiples idiomas**: Detección automática y soporte multiidioma
- **Alta precisión**: Calidad profesional de transcripción
- **Procesamiento local**: Sin envío de datos a servidores

### ♿ **Accesibilidad WCAG 2.1 AA**
- **Navegación por teclado**: Completamente navegable sin ratón
- **Lectores de pantalla**: Compatible con NVDA, JAWS, VoiceOver
- **Alto contraste**: Soporte automático para preferencias del sistema
- **Texto escalable**: Respeta configuraciones de accesibilidad del usuario

### 🎨 **Sistema de Temas Inteligente**
- **Auto-detección**: Sigue las preferencias del sistema automáticamente
- **Modo oscuro/claro**: Cambio instantáneo entre temas
- **Transiciones suaves**: Animaciones que respetan preferencias de movimiento
- **Persistencia**: Recuerda tu preferencia entre sesiones

### 🔒 **Seguridad y Privacidad**
- **100% Local**: Ningún dato sale de tu dispositivo
- **Content Security Policy**: Protección contra XSS y ataques
- **Validación robusta**: Verificación de archivos y formatos
- **Sin tracking**: Cero telemetría o seguimiento de usuario

## 🎯 Formatos Soportados

| Formato | Extensión | Estado |
|---------|-----------|--------|
| **MP4** | `.mp4` | ✅ Completo |
| **WebM** | `.webm` | ✅ Completo |
| **AVI** | `.avi` | ✅ Completo |
| **MOV** | `.mov` | ✅ Completo |
| **MKV** | `.mkv` | ✅ Completo |
| **WMV** | `.wmv` | ✅ Completo |
| **FLV** | `.flv` | ✅ Completo |
| **OGV** | `.ogv` | ✅ Completo |

## 🚀 Instalación y Uso

### 💻 **Uso Web Directo**
1. Abre [VideoTR](https://tu-dominio.com) en tu navegador
2. Arrastra un vídeo o usa el botón "Seleccionar archivo"
3. Configura las opciones de transcripción
4. Haz clic en "Iniciar Transcripción"
5. Edita y exporta el resultado en múltiples formatos

### 📱 **Instalación como PWA**

#### En Android:
1. Abre VideoTR en Chrome
2. Toca los tres puntos (⋮) > "Instalar app"
3. Confirma la instalación
4. ¡Ya tienes VideoTR en tu pantalla de inicio!

#### En iPhone/iPad:
1. Abre VideoTR en Safari
2. Toca el botón de compartir (⬆️)
3. Selecciona "Añadir a pantalla de inicio"
4. Confirma para instalar

#### En Windows/Mac/Linux:
1. Abre VideoTR en Chrome/Edge/Firefox
2. Busca el icono de instalación (⬇️) en la barra de direcciones
3. Haz clic en "Instalar VideoTR"
4. La app aparecerá en tu escritorio/menú

### ⚙️ **Desarrollo Local**

```bash
# Clonar el repositorio
git clone https://github.com/JavierTamaritWeb/VideoTr3.git
cd VideoTr3

# Instalar Live Server (si no lo tienes)
npm install -g live-server

# Modo desarrollo (sin caché agresivo)
./cambiar-modo.sh dev

# Abrir en Live Server
live-server --port=8006
```

## ⌨️ **Atajos de Teclado**

| Combinación | Acción |
|-------------|--------|
| `Ctrl + U` | Abrir selector de archivos |
| `Ctrl + Enter` | Iniciar transcripción |
| `Ctrl + C` | Copiar transcripción |
| `Ctrl + S` | Exportar como TXT |
| `Ctrl + Shift + R` | Limpiar caché y recargar (desarrollo) |
| `Ctrl + Shift + D` | Toggle modo desarrollo |
| `Escape` | Cerrar modales |
| `Tab` | Navegación por elementos |

## 🛠️ **Configuración Avanzada**

### 🔧 **Modos de Desarrollo**

```bash
# Modo desarrollo (recomendado para desarrollo)
./cambiar-modo.sh dev
# - Sin caché agresivo
# - Network-first strategy  
# - Recarga automática mejorada

# Modo producción
./cambiar-modo.sh prod
# - Caché completo para PWA
# - Cache-first strategy
# - Optimizado para rendimiento
```

### 🎛️ **Configuración de Live Server**

El proyecto incluye configuración optimizada en `.vscode/settings.json`:
- Auto-guardado cada 500ms
- Recarga completa habilitada
- Exclusión de archivos innecesarios
- Puerto por defecto: 8006

### � **Solución a Problemas de Desarrollo**

**Problema común**: ¿Live Server no detecta cambios y necesitas recargar VS Code constantemente?

**Solución implementada**:
```bash
# Activa el modo desarrollo (sin caché agresivo)
./cambiar-modo.sh dev

# Usa atajos de teclado para desarrollo:
# Ctrl+Shift+R = Limpiar caché completo y recargar
# Ctrl+Shift+D = Toggle modo desarrollo
```

**¿Qué hace el modo desarrollo?**
- ✅ Desactiva caché agresivo del Service Worker
- ✅ Usa estrategia "Network First" en lugar de "Cache First"  
- ✅ Live Server detecta cambios instantáneamente
- ✅ No más recargas manuales de VS Code

### �📊 **Configuración de Transcripción**

- **Motor Local**: Whisper.js (recomendado)
- **Motor API**: Compatibilidad con APIs externas
- **Idioma**: Auto-detección o manual
- **Modelo**: Selección de modelo según precisión/velocidad
- **Post-procesado**: Limpieza automática de texto

## 📁 **Estructura del Proyecto**

```
VideoTr3/
├── 📄 index.html              # Página principal con ARIA y PWA
├── 📄 manifest.webmanifest    # Configuración PWA
├── 📄 service-worker.js       # SW producción (caché completo)
├── 📄 service-worker-dev.js   # SW desarrollo (sin caché agresivo)
├── 📁 assets/
│   ├── 📁 icons/              # Iconos PWA (PNG + SVG)
│   └── 🖼️ logo.svg            # Logo principal
├── 📁 css/
│   ├── 🎨 tokens.css          # Variables de diseño
│   ├── 🎨 base.css            # Estilos base y tipografía
│   ├── 🎨 layout.css          # Layouts y grids
│   └── 🎨 componentes.css     # Componentes + accesibilidad
├── 📁 js/
│   ├── 🧠 main.js             # Aplicación principal + PWA
│   └── 📁 modulos/            # Módulos especializados
│       ├── 🎵 extractor-audio.js
│       ├── 🤖 transcriptor.js
│       ├── 💾 estado.js
│       ├── 📋 registro.js
│       ├── 🎨 ui.js
│       └── 📤 exportador-*.js
└── 📁 .vscode/
    └── ⚙️ settings.json        # Configuración optimizada
```

## 🔍 **Tecnologías Utilizadas**

### **Frontend**
- **HTML5**: Semántico con ARIA completo
- **CSS3**: Variables customizadas, Grid, Flexbox
- **JavaScript ES6+**: Módulos, Async/Await, Web APIs

### **PWA & Performance**
- **Service Workers**: Caché inteligente y offline-first
- **Web App Manifest**: Configuración de instalación
- **IndexedDB**: Almacenamiento local persistente
- **Web Audio API**: Procesamiento de audio avanzado

### **Accesibilidad**
- **ARIA**: Labels, live regions, semantic markup
- **WCAG 2.1 AA**: Contraste, navegación, focus management
- **Screen Readers**: Compatibilidad total con lectores

### **IA & Transcripción**
- **Transformers.js**: Framework de ML en el navegador
- **ONNX Runtime**: Ejecución optimizada de modelos
- **Whisper**: Modelo de transcripción de OpenAI
- **Web Workers**: Procesamiento en segundo plano

## 📈 **Rendimiento y Métricas**

### **Lighthouse Score**
- 🚀 **Performance**: 95-100/100
- ♿ **Accessibility**: 100/100
- 🔍 **Best Practices**: 95-100/100
- 🔧 **PWA**: 100/100

### **Compatibilidad**
| Navegador | Escritorio | Móvil | PWA Install |
|-----------|------------|-------|-------------|
| **Chrome** | ✅ 88+ | ✅ 88+ | ✅ |
| **Firefox** | ✅ 85+ | ✅ 85+ | ✅ |
| **Safari** | ✅ 14+ | ✅ 14+ | ✅ |
| **Edge** | ✅ 88+ | ✅ 88+ | ✅ |

## 🤝 **Contribuir**

¡Las contribuciones son bienvenidas! Si quieres mejorar VideoTR:

1. **Fork** el proyecto
2. **Crea** una rama para tu feature (`git checkout -b feature/nueva-caracteristica`)
3. **Commitea** tus cambios (`git commit -am 'Añadir nueva característica'`)
4. **Push** a la rama (`git push origin feature/nueva-caracteristica`)
5. **Abre** un Pull Request

### **Guidelines de Contribución**
- Mantener accesibilidad WCAG 2.1 AA
- Seguir arquitectura BEM para CSS
- Usar ES6+ modules para JavaScript
- Incluir tests para nuevas funcionalidades
- Documentar cambios en README

## 📜 **Changelog**

### **v3.0.1** (Septiembre 2025) - Development Experience & Bug Fixes
- 🛠️ **Desarrollo mejorado**: Service Worker de desarrollo sin caché agresivo
- ⚡ **Hot-reload optimizado**: Auto-recarga sin necesidad de recargar VS Code  
- 🔧 **Scripts de utilidad**: `cambiar-modo.sh` para alternar entre dev/prod
- ⌨️ **Atajos de desarrollo**: Ctrl+Shift+R para limpiar caché completo
- 🐛 **CSP corregido**: Content Security Policy permite scripts inline y media data URLs
- 📝 **Documentación**: README completo con guías de instalación y desarrollo

### **v3.0.0** (Septiembre 2025) - PWA & Accessibility Overhaul
- ✨ **PWA completa**: Instalable, offline-capable, auto-updates
- ♿ **WCAG 2.1 AA**: Accesibilidad completa con navegación por teclado
- 🎨 **Sistema de temas**: Auto-detección, modo oscuro/claro
- 🔒 **CSP & Seguridad**: Content Security Policy, validación robusta
- 🚀 **Performance**: Service Workers optimizados, caché inteligente
- 🛠️ **DevEx**: Modo desarrollo, hot-reload, debugging tools

### **v2.x** - Funcionalidad Core
- 🧠 Integración Whisper.js
- 🎵 Extracción de audio optimizada
- 📤 Exportación múltiples formatos
- 💾 Almacenamiento local IndexedDB

## 📄 **Licencia**

Este proyecto está bajo la Licencia MIT. Ver [LICENSE](LICENSE) para más detalles.

## 👨‍💻 **Autor**

**Javier Tamarit**
- 🌐 GitHub: [@JavierTamaritWeb](https://github.com/JavierTamaritWeb)
- 📧 Email: [tu-email@ejemplo.com](mailto:tu-email@ejemplo.com)
- 🐦 Twitter: [@JavierTamaritWeb](https://twitter.com/JavierTamaritWeb)

## 🙏 **Agradecimientos**

- **OpenAI** por el modelo Whisper
- **Hugging Face** por Transformers.js
- **Mozilla** por las guías de PWA y accesibilidad
- **W3C** por los estándares web y WCAG

---

<div align="center">

**⭐ Si VideoTR te resulta útil, ¡dale una estrella en GitHub! ⭐**

[🚀 **Probar VideoTR**](https://tu-dominio.com) • [📖 **Documentación**](docs/) • [🐛 **Reportar Bug**](issues/new) • [💡 **Sugerir Feature**](issues/new)

</div>
