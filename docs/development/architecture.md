# 🏗️ Arquitectura de VideoTR3

## 📋 Visión General

VideoTR3 es una **Progressive Web App (PWA)** construida con **JavaScript vanilla** y **CSS moderno** que permite la transcripción de vídeos usando IA, tanto local como mediante APIs externas.

## 🎯 Principios de Diseño

### ✨ Core Principles

- **🚀 Performance First**: Optimizado para carga rápida y uso eficiente de recursos
- **♿ Accessibility by Design**: WAI-ARIA completo, navegación por teclado
- **📱 Progressive Enhancement**: Funciona sin JavaScript, mejora con él
- **🔒 Privacy Focused**: Procesamiento local cuando es posible
- **🌐 Offline Capable**: Service Worker para funcionalidad offline

### 🧩 Arquitectura Modular

```
VideoTR3/
├── 📄 index.html              # Punto de entrada
├── 📜 manifest.webmanifest    # PWA manifest
├── ⚙️ service-worker.js       # Service Worker
├── 🎨 css/                    # Estilos organizados
├── 🧠 js/                     # Lógica de aplicación
├── 🖼️ assets/                 # Recursos estáticos
└── 📚 docs/                   # Documentación
```

## 🧠 Estructura JavaScript

### 📦 Módulos ES6

La aplicación usa **ES Modules** nativos para una arquitectura limpia y mantenible:

```javascript
// main.js - Orquestador principal
import { UI } from './modulos/ui.js';
import { Estado } from './modulos/estado.js';
import { Transcriptor } from './modulos/transcriptor.js';
// ... otros módulos
```

### 🎭 Patrón de Módulos

```
js/
├── main.js                    # Punto de entrada, orquestador
├── modulos/
│   ├── ui.js                  # Gestión de interfaz
│   ├── estado.js              # Estado global de la app
│   ├── extractor-audio.js     # Extracción de audio de vídeos
│   ├── transcriptor.js        # Orquestador de transcripción
│   ├── motor-local.js         # Whisper WASM/WebGPU
│   ├── motor-api.js           # APIs externas (OpenAI, etc.)
│   ├── url-loader.js          # Carga desde URLs
│   ├── exportador-*.js        # Exportación a diferentes formatos
│   ├── registro.js            # Historial y persistencia
│   └── util-*.js              # Utilidades comunes
└── workers/
    └── worker-transcribe.js   # Web Worker para IA local
```

## 🎨 Arquitectura CSS

### 🏗️ Metodología BEM en Español

```css
/* Bloque */
.panel-entrada { }

/* Elemento */
.panel-entrada__zona-soltar { }

/* Modificador */
.panel-entrada__zona-soltar--arrastrando { }
```

### 📁 Organización CSS

```
css/
├── tokens.css           # Variables CSS (Design System)
├── base.css            # Reset, tipografía base
├── layout.css          # Grid, contenedores principales
└── componentes.css     # Componentes BEM
```

### 🎨 Design System

```css
/* tokens.css - Single Source of Truth */
:root {
  /* Colores */
  --color-primario: #2563eb;
  --color-secundario: #64748b;
  
  /* Espaciado */
  --espacio-s: 0.75rem;
  --espacio-m: 1rem;
  --espacio-l: 1.5rem;
  
  /* Tipografía */
  --fuente-principal: system-ui, sans-serif;
  --tamaño-texto-m: 1rem;
}
```

## 🔄 Flujo de Datos

### 📊 Estado de la Aplicación

```javascript
class Estado {
  constructor() {
    this.datos = new Map(); // Estado reactivo
    this.suscriptores = new Map(); // Observadores
  }
  
  set(clave, valor) {
    this.datos.set(clave, valor);
    this.notificar(clave, valor); // Notifica cambios
  }
}
```

### 🔄 Flujo Principal

```
📁 Entrada de Vídeo
├── 🖱️ Drag & Drop / File Picker
├── 🌐 URL de redes sociales
└── 📋 Metadatos del archivo

↓

🎵 Extracción de Audio
├── 🌐 Web Audio API
├── 📊 Conversión a WAV 16kHz
└── 💾 ArrayBuffer resultante

↓

🧠 Transcripción
├── 🏠 Local (Whisper WASM/WebGPU)
│   ├── 👷 Web Worker
│   ├── 🧠 Modelo de IA cacheado
│   └── 🔄 Progreso en tiempo real
├── 🌐 APIs Externas
│   ├── OpenAI Whisper API
│   ├── Deepgram API
│   └── AssemblyAI API

↓

📝 Editor de Texto
├── ✏️ Edición manual
├── 📊 Contadores (caracteres, palabras)
└── 🔍 Previsualización

↓

📤 Exportación
├── 📄 TXT/MD (texto plano)
├── 🎨 RTF (texto enriquecido)
└── 📊 DOCX (documento Word)

↓

📚 Registro e Historial
├── 💾 IndexedDB local
├── 📊 Metadatos y estadísticas
└── 📤 Exportación CSV/JSON
```

## 🧩 Componentes Principales

### 🎬 VideoTR (Clase Principal)

```javascript
class VideoTR {
  constructor() {
    this.estado = new Estado();
    this.ui = new UI();
    this.transcriptor = new Transcriptor();
    // ... otros módulos
  }
  
  async cargarVideo(archivo) { }
  async iniciarTranscripcion() { }
  async exportar(formato) { }
}
```

### 🎨 UI (Gestión de Interfaz)

```javascript
class UI {
  // Cacheo de elementos DOM
  cachearElementos() { }
  
  // Notificaciones accesibles
  mostrarNotificacion(mensaje, tipo) { }
  anunciar(mensaje) { } // aria-live
  
  // Estados de progreso
  actualizarProgreso(porcentaje, texto) { }
  mostrarBarraProgreso() { }
}
```

### 🧠 Transcriptor (Orquestador IA)

```javascript
class Transcriptor {
  async transcribir(audioBuffer, configuracion) {
    const motor = this.seleccionarMotor(configuracion);
    return await motor.procesar(audioBuffer);
  }
  
  seleccionarMotor(config) {
    switch(config.tipo) {
      case 'local': return new MotorLocal();
      case 'openai': return new MotorAPI('openai');
      // ...
    }
  }
}
```

## 🛡️ Seguridad y Privacidad

### 🔒 Principios de Seguridad

- **🏠 Local First**: Procesamiento local cuando es posible
- **🔐 No almacenamiento de claves**: APIs keys solo en memoria
- **🛡️ CSP estricta**: Content Security Policy configurada
- **🚫 No telemetría**: Sin tracking ni analytics externos

### 🔐 Content Security Policy

```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-eval' https://www.youtube.com; 
               worker-src 'self' blob:; 
               style-src 'self' 'unsafe-inline';">
```

### 💾 Gestión de Datos

```javascript
// Solo datos locales - IndexedDB
class Registro {
  async guardar(entrada) {
    // Solo metadatos, NO contenido sensible
    await this.db.add('registros', {
      fecha: entrada.fecha,
      nombre: entrada.nombre,
      tamaño: entrada.tamaño,
      motor: entrada.motor
      // NO se guarda la transcripción
    });
  }
}
```

## 📱 Progressive Web App

### ⚙️ Service Worker

```javascript
// service-worker.js
const CACHE_NAME = 'videotr3-v3.0';
const urlsToCache = [
  '/',
  '/css/base.css',
  '/js/main.js',
  '/assets/logo.svg'
];

// Estrategia Cache First para recursos estáticos
// Network First para datos dinámicos
```

### 📋 Web App Manifest

```json
{
  "name": "VideoTR3 - Transcriptor de Vídeos",
  "short_name": "VideoTR3",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#2563eb",
  "icons": [
    {
      "src": "assets/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    }
  ]
}
```

## 🎯 Patrones de Diseño Utilizados

### 🏭 Factory Pattern

```javascript
// Creación de motores de transcripción
class MotorFactory {
  static crear(tipo, configuracion) {
    switch(tipo) {
      case 'local': return new MotorLocal(configuracion);
      case 'openai': return new MotorOpenAI(configuracion);
      default: throw new Error(`Motor ${tipo} no soportado`);
    }
  }
}
```

### 👁️ Observer Pattern

```javascript
// Estado reactivo
class Estado {
  suscribir(clave, callback) {
    if (!this.suscriptores.has(clave)) {
      this.suscriptores.set(clave, new Set());
    }
    this.suscriptores.get(clave).add(callback);
  }
  
  notificar(clave, valor) {
    this.suscriptores.get(clave)?.forEach(callback => callback(valor));
  }
}
```

### 🔧 Strategy Pattern

```javascript
// Diferentes estrategias de exportación
class Exportador {
  constructor(estrategia) {
    this.estrategia = estrategia;
  }
  
  exportar(contenido) {
    return this.estrategia.procesar(contenido);
  }
}
```

## 🚀 Performance

### ⚡ Optimizaciones Implementadas

1. **📦 ES Modules**: Carga bajo demanda
2. **🎯 Tree Shaking**: Solo código usado
3. **💾 Lazy Loading**: Componentes diferidos
4. **🗜️ Compression**: Gzip/Brotli en servidor
5. **🖼️ Optimized Assets**: Imágenes WebP/AVIF cuando sea posible

### 📊 Web Vitals Targets

```
✅ FCP (First Contentful Paint): < 1.8s
✅ LCP (Largest Contentful Paint): < 2.5s
✅ FID (First Input Delay): < 100ms
✅ CLS (Cumulative Layout Shift): < 0.1
```

## 🧪 Testing Strategy

### 🔍 Tipos de Pruebas

1. **🧪 Unit Tests**: Funciones puras y módulos
2. **🔗 Integration Tests**: Flujo completo
3. **👤 User Tests**: Casos de uso reales
4. **♿ A11y Tests**: Accesibilidad completa

### 🛠️ Herramientas

- **Jest**: Testing framework
- **Puppeteer**: E2E testing
- **axe-core**: Accessibility testing
- **Lighthouse**: Performance audits

## 🔮 Extensibilidad

### 🎯 Puntos de Extensión

1. **🔌 Nuevos Motores IA**: Implementar interfaz `MotorIA`
2. **📤 Formatos Exportación**: Extender `ExportadorBase`
3. **🌐 Nuevas Plataformas URL**: Añadir a `URLLoader`
4. **🎨 Temas**: Nuevos tokens CSS

### 📚 APIs Internas

```javascript
// Plugin system para futuras extensiones
window.VideoTR3 = {
  registrarMotor(nombre, clase) { },
  registrarExportador(formato, clase) { },
  registrarProcesador(tipo, clase) { }
};
```

---

## 📞 Mantenimiento

### 🔄 Ciclo de Updates

1. **🐛 Bugfixes**: Patches menores
2. **✨ Features**: Minor versions
3. **🔄 Breaking Changes**: Major versions

### 📊 Monitoreo

- **🚨 Error Logging**: Console + Local Storage
- **📈 Performance Metrics**: Web Vitals
- **♿ A11y Audits**: Regulares con axe-core

---

**VideoTR3 Architecture** v3.0  
**Autor**: Javier Tamarit  
**Última actualización**: Septiembre 2025
