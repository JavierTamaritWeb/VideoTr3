# 🔧 API Reference - Módulos VideoTR3

## 📋 Visión General

Esta documentación describe la API interna de los módulos de VideoTR3. Útil para desarrolladores que quieran entender, modificar o extender la funcionalidad.

## 🧩 Módulos Principales

### 🎬 VideoTR (main.js)

Clase principal que orquesta toda la aplicación.

```javascript
class VideoTR {
  constructor()
  async inicializar()
  async cargarVideo(archivo: File)
  async cargarDesdeURL(url: string)
  async iniciarTranscripcion()
  async exportar(formato: string)
  limpiarVideo()
}
```

#### Métodos Principales

##### `async cargarVideo(archivo: File)`
Carga un archivo de vídeo y prepara la interfaz.

```javascript
// Ejemplo de uso
const videoTR = new VideoTR();
await videoTR.cargarVideo(archivoFile);
```

**Parámetros:**
- `archivo` (File): Archivo de vídeo seleccionado

**Retorna:** `Promise<void>`

**Eventos disparados:**
- Actualiza tarjeta de vídeo
- Habilita botón de transcripción
- Registra entrada en historial

##### `async cargarDesdeURL(url: string)`
Carga vídeo desde URL de redes sociales.

```javascript
await videoTR.cargarDesdeURL('https://youtube.com/watch?v=...');
```

**Parámetros:**
- `url` (string): URL del vídeo

**Comportamiento:**
- Valida URL soportada
- Verifica duración (YouTube)
- Intenta descarga directa o muestra guía manual

---

### 🎨 UI (ui.js)

Gestiona toda la interfaz de usuario y estados visuales.

```javascript
class UI {
  constructor()
  cachearElementos(): Object
  mostrarNotificacion(mensaje: string, tipo: string, duracion: number): number
  anunciar(mensaje: string): void
  actualizarProgreso(porcentaje: number, texto: string): void
  actualizarProgresoUrl(porcentaje: number, texto: string): void
}
```

#### Métodos de Notificación

##### `mostrarNotificacion(mensaje, tipo, duracion)`
Muestra notificación temporal.

```javascript
ui.mostrarNotificacion('Vídeo cargado correctamente', 'exito', 5000);
```

**Parámetros:**
- `mensaje` (string): Texto de la notificación
- `tipo` (string): `'info' | 'exito' | 'error' | 'advertencia'`
- `duracion` (number): Milisegundos (0 = persistente)

**Retorna:** `number` - ID de la notificación

##### `anunciar(mensaje)`
Anuncia mensaje a lectores de pantalla.

```javascript
ui.anunciar('Iniciando transcripción...');
```

#### Métodos de Progreso

##### `actualizarProgreso(porcentaje, texto)`
Actualiza barra de progreso principal.

```javascript
ui.actualizarProgreso(75, 'Procesando audio...');
```

##### `mostrarBarraProgreso()` / `ocultarBarraProgreso()`
Controla visibilidad de barras de progreso.

---

### 🧠 Transcriptor (transcriptor.js)

Orquesta el proceso de transcripción usando diferentes motores.

```javascript
class Transcriptor {
  constructor()
  async transcribir(audioBuffer: ArrayBuffer, configuracion: Object): Promise<string>
  seleccionarMotor(configuracion: Object): MotorIA
  validarConfiguracion(config: Object): boolean
}
```

#### `async transcribir(audioBuffer, configuracion)`

```javascript
const transcripcion = await transcriptor.transcribir(audioBuffer, {
  motor: 'local',
  modelo: 'base',
  idioma: 'es'
});
```

**Parámetros:**
- `audioBuffer` (ArrayBuffer): Audio procesado en WAV 16kHz
- `configuracion` (Object): Configuración de transcripción

**Configuración disponible:**
```javascript
{
  motor: 'local' | 'openai' | 'deepgram' | 'assemblyai',
  modelo: 'tiny' | 'base' | 'small',  // Solo para motor local
  idioma: 'auto' | 'es' | 'en' | ...,
  apiKey: string  // Para motores API
}
```

---

### 🎵 ExtractorAudio (extractor-audio.js)

Extrae y procesa audio desde archivos de vídeo.

```javascript
class ExtractorAudio {
  constructor()
  async extraer(archivo: File): Promise<ArrayBuffer>
  async extraerConWebAudio(archivo: File): Promise<ArrayBuffer>
}
```

#### `async extraer(archivo)`
Extrae audio optimizado para transcripción.

```javascript
const audioBuffer = await extractor.extraer(archivoVideo);
```

**Proceso:**
1. Lee archivo como ArrayBuffer
2. Decodifica con Web Audio API
3. Convierte a mono 16kHz
4. Genera WAV compatible con Whisper

**Retorna:** `ArrayBuffer` - Audio WAV 16-bit mono 16kHz

---

### 🌐 URLLoader (url-loader.js)

Maneja la carga de vídeos desde URLs de redes sociales.

```javascript
class URLLoader {
  validarUrlSoportada(url: string): void
  async getYoutubeDuration(url: string): Promise<number>
  async cargarDesdeURL(url: string, callbacks: Object): Promise<void>
  guiarDescargaManual(plataforma: string, onFileSelect: Function): void
}
```

#### `validarUrlSoportada(url)`
Valida si la URL es de una plataforma soportada.

```javascript
try {
  urlLoader.validarUrlSoportada('https://youtube.com/watch?v=abc');
  // URL válida
} catch (error) {
  // URL no soportada
}
```

**Plataformas soportadas:**
- `instagram.com`
- `tiktok.com` 
- `youtube.com` / `youtu.be`

#### `async getYoutubeDuration(url)`
Obtiene duración de vídeo de YouTube sin descargarlo.

```javascript
const duracionSegundos = await urlLoader.getYoutubeDuration(url);
if (duracionSegundos > 600) { // 10 minutos
  throw new Error('Vídeo demasiado largo');
}
```

#### `async cargarDesdeURL(url, callbacks)`
Proceso principal de carga desde URL.

```javascript
await urlLoader.cargarDesdeURL(url, {
  onProgreso: (porcentaje) => console.log(`${porcentaje}%`),
  onFileReady: (file) => procesarArchivo(file),
  onAnunciar: (mensaje) => ui.anunciar(mensaje)
});
```

---

### 📊 Estado (estado.js)

Gestiona el estado global de la aplicación de forma reactiva.

```javascript
class Estado {
  constructor()
  set(clave: string, valor: any): void
  get(clave: string): any
  suscribir(clave: string, callback: Function): void
  notificar(clave: string, valor: any): void
}
```

#### Uso del Estado

```javascript
// Establecer valor
estado.set('motorIA', 'local');

// Suscribirse a cambios  
estado.suscribir('motorIA', (nuevoMotor) => {
  console.log('Motor cambió a:', nuevoMotor);
});

// Obtener valor
const motor = estado.get('motorIA');
```

---

### 📤 Exportadores

Sistema modular de exportación a diferentes formatos.

#### ExportadorTxtMd (exportador-txt-md.js)

```javascript
class ExportadorTxtMd {
  async exportarTXT(contenido: string, nombreArchivo: string): Promise<void>
  async exportarMD(contenido: string, nombreArchivo: string): Promise<void>
}
```

#### ExportadorRtf (exportador-rtf.js)

```javascript
class ExportadorRtf {
  async exportar(contenido: string, nombreArchivo: string): Promise<void>
  formatearRTF(texto: string): string
}
```

#### ExportadorDocx (exportador-docx.js)

```javascript
class ExportadorDocx {
  async exportar(contenido: string, nombreArchivo: string): Promise<void>
  crearDocumento(texto: string): Blob
}
```

---

### 📚 Registro (registro.js)

Maneja persistencia local e historial de transcripciones.

```javascript
class Registro {
  async inicializar(): Promise<void>
  async registrarEntrada(entrada: Object): Promise<void>
  async obtenerRegistros(): Promise<Array>
  async limpiarRegistro(): Promise<void>
  async exportarCSV(): Promise<void>
}
```

#### `async registrarEntrada(entrada)`

```javascript
await registro.registrarEntrada({
  nombre: 'video.mp4',
  tamaño: 15728640,
  tipo: 'video/mp4',
  motor: 'local',
  modelo: 'base',
  idioma: 'es',
  duracion: 120,
  fechaInicio: new Date(),
  fechaFin: new Date(),
  origenUrl: 'https://youtube.com/...' // opcional
});
```

---

## 🏭 Motores de IA

### MotorLocal (motor-local.js)

Whisper ejecutándose localmente via WASM/WebGPU.

```javascript
class MotorLocal {
  async cargarModelo(nombre: string): Promise<void>
  async transcribir(audioBuffer: ArrayBuffer, opciones: Object): Promise<string>
  estaDisponible(): boolean
}
```

### MotorAPI (motor-api.js)

Wrapper para APIs externas de transcripción.

```javascript
class MotorAPI {
  constructor(proveedor: string, apiKey: string)
  async transcribir(audioBuffer: ArrayBuffer, opciones: Object): Promise<string>
  validarCredenciales(): boolean
}
```

**Proveedores soportados:**
- `'openai'` - OpenAI Whisper API
- `'deepgram'` - Deepgram API
- `'assemblyai'` - AssemblyAI API

---

## 🔧 Utilidades

### util-archivo.js

```javascript
function mostrarNotificacion(mensaje: string, tipo: string): void
function actualizarProgreso(porcentaje: number, texto: string): void
function agregarLog(mensaje: string, tipo: string): void
function formatearTamaño(bytes: number): string
function validarTipoArchivo(archivo: File): boolean
```

### util-wav.js

```javascript
function crearWAV(audioBuffer: AudioBuffer): ArrayBuffer
function escribirString(view: DataView, offset: number, string: string): void
function escribirUint32(view: DataView, offset: number, value: number): void
```

---

## 🎯 Patrones de Uso

### Extending URLLoader para Nueva Plataforma

```javascript
// Extender URLLoader para Vimeo
class URLLoaderExtended extends URLLoader {
  validarUrlSoportada(url) {
    const vimeoPattern = /vimeo\.com\/\d+/i;
    if (vimeoPattern.test(url)) return true;
    return super.validarUrlSoportada(url);
  }
  
  detectarPlataforma(url) {
    if (/vimeo\.com/i.test(url)) return 'vimeo';
    return super.detectarPlataforma(url);
  }
}
```

### Crear Nuevo Motor de IA

```javascript
class MiMotorIA {
  constructor(configuracion) {
    this.config = configuracion;
  }
  
  async transcribir(audioBuffer, opciones) {
    // Implementar lógica de transcripción
    const resultado = await this.llamarAPI(audioBuffer);
    return resultado.texto;
  }
  
  estaDisponible() {
    return !!this.config.apiKey;
  }
}

// Registrar el motor
transcriptor.registrarMotor('mi-motor', MiMotorIA);
```

### Hook into Estado para Persistencia

```javascript
// Guardar configuración automáticamente
estado.suscribir('configuracion', (config) => {
  localStorage.setItem('videotr3-config', JSON.stringify(config));
});

// Cargar al inicializar
const configGuardada = localStorage.getItem('videotr3-config');
if (configGuardada) {
  estado.set('configuracion', JSON.parse(configGuardada));
}
```

---

## 🚨 Manejo de Errores

### Tipos de Error Comunes

```javascript
// Error de validación
class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
  }
}

// Error de API
class APIError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'APIError';
    this.status = status;
  }
}
```

### Try-Catch Patterns

```javascript
try {
  await transcriptor.transcribir(audioBuffer, config);
} catch (error) {
  if (error instanceof ValidationError) {
    ui.mostrarNotificacion(error.message, 'error');
  } else if (error instanceof APIError) {
    ui.mostrarNotificacion(`Error API ${error.status}: ${error.message}`, 'error');
  } else {
    ui.mostrarNotificacion('Error inesperado', 'error');
    console.error(error);
  }
}
```

---

## 📊 Performance Tips

### Lazy Loading de Módulos

```javascript
// Cargar módulos bajo demanda
async function cargarMotorLocal() {
  const { MotorLocal } = await import('./modulos/motor-local.js');
  return new MotorLocal();
}
```

### Debouncing para UI

```javascript
// En util-archivo.js
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
```

### Memory Management

```javascript
// Limpiar recursos grandes
class ExtractorAudio {
  async extraer(archivo) {
    const audioBuffer = await this.procesar(archivo);
    
    // Limpiar referencias
    archivo = null;
    
    return audioBuffer;
  }
}
```

---

**API Reference VideoTR3** v3.0  
**Autor**: Javier Tamarit  
**Última actualización**: Septiembre 2025
