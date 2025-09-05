# 📖 Manual de Usuario - VideoTR3

## 🏠 Bienvenido a VideoTR3

VideoTR3 es una **aplicación web progresiva (PWA)** que te permite **transcribir vídeos a texto** usando inteligencia artificial, tanto de forma local como mediante APIs externas.

### ✨ ¿Qué puedes hacer?

- 🎥 **Transcribir vídeos** en múltiples formatos (MP4, WebM, AVI, etc.)
- 🌐 **Cargar desde URLs** de YouTube, Instagram y TikTok
- 🧠 **Usar IA local** (Whisper) o APIs externas (OpenAI, Deepgram)
- 📄 **Exportar** en varios formatos (TXT, MD, RTF, DOCX)
- 📱 **Instalar como app** en tu dispositivo
- 🔒 **Mantener privacidad** con procesamiento local

## 🚀 Primeros Pasos

### 1. 📁 Cargar un Vídeo

Tienes **tres formas** de cargar vídeos:

#### 🖱️ Arrastrar y Soltar
1. Arrastra tu archivo de vídeo a la **zona azul**
2. Suéltalo cuando veas el borde resaltado
3. El vídeo se cargará automáticamente

#### 📂 Seleccionar Archivo
1. Haz clic en **"selecciona un archivo"**
2. Navega y elige tu vídeo
3. Confirma la selección

#### 🌐 Desde URL (YouTube/Instagram/TikTok)
1. Ve a la sección **"Cargar desde URL"**
2. Pega la URL del vídeo
3. Haz clic en **"Cargar desde URL"**
4. Si no es posible descarga directa, sigue las **guías mostradas**

### 2. ⚙️ Configurar Transcripción

Antes de transcribir, configura las opciones:

#### 🧠 Motor de Transcripción
- **Local (Whisper)**: Procesamiento privado en tu dispositivo
- **OpenAI Whisper API**: Requiere clave API, mayor precisión
- **Deepgram API**: Rápido y preciso, requiere clave API  
- **AssemblyAI API**: Excelente para inglés, requiere clave API

#### 🎯 Modelo Local
- **Tiny (39 MB)**: Rápido pero menos preciso
- **Base (74 MB)**: Equilibrio entre velocidad y precisión ⭐
- **Small (244 MB)**: Más preciso pero más lento

#### 🌍 Idioma
- **Detectar automáticamente**: Recomendado ⭐
- **Español, Inglés, Francés**, etc.: Para mejor precisión

### 3. ▶️ Iniciar Transcripción

1. Asegúrate de tener un vídeo cargado
2. Configura las opciones según tus necesidades
3. Haz clic en **"Extraer audio y transcribir"**
4. Espera mientras se procesa (verás el progreso)

### 4. ✏️ Editar Transcripción

Una vez completada:
- **Edita el texto** directamente en el editor
- **Copia** el texto con el botón correspondiente
- **Limpia** el editor si quieres empezar de nuevo
- Ve los **contadores** de caracteres y palabras

### 5. 📤 Exportar Resultado

Elige el formato que necesites:
- **TXT**: Texto plano simple
- **MD**: Markdown con formato
- **RTF**: Texto enriquecido (compatible con Word)
- **DOCX**: Documento de Microsoft Word

## 🌐 Carga desde URLs

### 📋 Plataformas Soportadas

#### 🎬 YouTube
- ✅ Vídeos públicos (máximo 10 minutos)
- ✅ YouTube Shorts
- ✅ Formatos: `youtube.com/watch?v=...`, `youtu.be/...`

#### 📷 Instagram  
- ✅ Posts y Reels públicos
- ⚠️ Requiere descarga manual (restricciones CORS)

#### 🎵 TikTok
- ✅ Vídeos públicos
- ⚠️ Requiere descarga manual (restricciones CORS)

### 🔄 Proceso de Carga

#### Escenario A: Descarga Directa (poco común)
```
URL → Validación → Descarga → ✅ Listo para transcribir
```

#### Escenario B: Descarga Manual (más común)
```
URL → Validación → Guía Manual → Descarga → Subir archivo → ✅ Listo
```

### 📝 Guías de Descarga Manual

Cuando no es posible descarga directa, te mostramos **pasos específicos** para cada plataforma:

#### YouTube
1. Si es tu vídeo: usa **YouTube Studio**
2. Si tiene permisos: busca botón **"Descargar"** 
3. Para contenido público: herramientas oficiales
4. Sube el archivo descargado aquí

#### Instagram
1. Para contenido propio: **Configuración → Descargar datos**
2. Instagram enviará archivo con tus contenidos
3. También desde app móvil: guardar propio contenido

#### TikTok  
1. Si autor permite: botón **"Guardar vídeo"**
2. Para contenido propio: **"Guardar en dispositivo"**
3. Verifica configuración de descargas habilitada

## ⚙️ Configuración Avanzada

### 🎨 Temas y Apariencia

1. Haz clic en el **botón de luna/sol** en la cabecera
2. O usa el atajo: **Ctrl + Shift + T**
3. Opciones: **Automático**, **Claro**, **Oscuro**

### 🔧 Configuración General

Accede al menú de configuración (⚙️):

#### 🌍 Idioma de Interfaz
- **Español** (por defecto)
- **English**

#### 🎨 Tema
- **Automático**: Sigue configuración del sistema
- **Claro**: Tema luminoso
- **Oscuro**: Tema oscuro

#### ⚡ Rendimiento
- **Usar WebGPU**: Acelera IA local si está disponible
- **Cachear modelos**: Guarda modelos IA para uso offline

### 🗂️ Gestión de Datos

#### 📊 Ver Registro
- Accede al **historial** de transcripciones
- **Exporta** datos como CSV o JSON
- **Limpia** el registro si es necesario

#### 💾 Limpieza de Cache
- **Limpia modelos** IA descargados para liberar espacio
- Útil si cambias de dispositivo o quieres empezar limpio

## ♿ Accesibilidad

VideoTR3 está **completamente optimizada** para accesibilidad:

### ⌨️ Navegación por Teclado

- **Tab**: Navegar entre elementos
- **Enter/Espacio**: Activar botones y enlaces
- **Escape**: Cerrar modales
- **Ctrl + Shift + T**: Cambiar tema rápidamente

### 🔊 Lectores de Pantalla

- **Textos descriptivos** en todos los elementos
- **Anuncios automáticos** de cambios de estado
- **Estructura semántica** correcta
- **Regiones vivas** para actualizaciones dinámicas

### 👁️ Soporte Visual

- **Alto contraste** disponible
- **Textos escalables** respetan configuración del navegador
- **Iconos con texto** alternativo
- **Estados claros** para todos los elementos

## 📱 Instalación como PWA

### 💻 En Escritorio (Chrome/Edge)

1. Visita VideoTR3 en tu navegador
2. Busca el icono **"Instalar"** en la barra de direcciones
3. Haz clic y confirma la instalación
4. La app aparecerá como programa independiente

### 📱 En Móvil (iOS/Android)

#### iOS (Safari)
1. Abre VideoTR3 en Safari
2. Toca el botón **"Compartir"** (⬆️)
3. Selecciona **"Añadir a pantalla de inicio"**
4. Confirma el nombre y añade

#### Android (Chrome)
1. Abre VideoTR3 en Chrome
2. Toca el menú **"⋮"** (tres puntos)
3. Selecciona **"Añadir a pantalla de inicio"**
4. Confirma la instalación

## 🔒 Privacidad y Seguridad

### 🏠 Procesamiento Local

- **Whisper local**: Todo se procesa en tu dispositivo
- **No envío de datos**: Tu contenido NO sale de tu ordenador
- **Sin telemetría**: No rastreamos tu uso

### 🔑 APIs Externas

Cuando uses APIs externas:
- **Claves temporales**: Solo se guardan en memoria durante la sesión
- **Transmisión segura**: HTTPS obligatorio
- **Sin logs**: No guardamos historial de solicitudes

### 💾 Almacenamiento Local

- **Solo metadatos**: Nombres, fechas, tamaños
- **NO contenido**: No guardamos vídeos ni transcripciones
- **Borrado fácil**: Limpia datos cuando quieras

## 🐛 Solución de Problemas

### ⚠️ Errores Comunes

#### "Error al cargar el vídeo"
- **Causa**: Formato no soportado o archivo corrupto
- **Solución**: Verifica que sea un formato de vídeo válido (MP4, WebM, etc.)

#### "Modelo no encontrado"
- **Causa**: Primera vez usando IA local
- **Solución**: Espera mientras se descarga automáticamente

#### "Clave API inválida"
- **Causa**: Clave incorrecta o sin permisos
- **Solución**: Verifica la clave en tu proveedor de API

#### "Vídeo demasiado largo"
- **Causa**: URL de YouTube >10 minutos
- **Solución**: Usa vídeos más cortos o descarga y corta manualmente

### 🚨 Problemas de Rendimiento

#### Transcripción muy lenta
- **Causa**: Modelo grande o dispositivo limitado
- **Solución**: Usa modelo "Tiny" o APIs externas

#### App no responde
- **Causa**: Procesamiento intensivo
- **Solución**: Espera o recarga la página (se mantiene el progreso)

### 🔧 Reinicios y Limpieza

#### Reiniciar completamente
1. **Recarga** la página (F5 o Ctrl+R)
2. **Limpia caché** del navegador si persisten problemas
3. **Reinstala** la PWA si es necesario

## 📞 Soporte y Recursos

### 🆘 ¿Necesitas Ayuda?

1. **Revisa** este manual primero
2. **Verifica** la consola del navegador (F12) para errores técnicos
3. **Prueba** con diferentes archivos/configuraciones
4. **Reporta** problemas específicos con detalles

### 📚 Recursos Adicionales

- **[Guía de Accesibilidad](accessibility.md)**: Detalles sobre características de accesibilidad
- **[Formatos Soportados](supported-formats.md)**: Lista completa de archivos compatibles
- **Documentación técnica**: Para desarrolladores en `/docs/development/`

### 💡 Consejos y Trucos

1. **🎯 Usa IA local** para contenido sensible o privado
2. **⚡ APIs externas** para mayor velocidad y precisión
3. **📝 Edita después** para corregir errores de transcripción
4. **💾 Exporta múltiples formatos** para diferentes usos
5. **⌨️ Aprende atajos** de teclado para mayor eficiencia

---

## 🎉 ¡Disfruta Transcribiendo!

VideoTR3 está diseñado para ser **fácil, accesible y potente**. Ya sea para subtítulos, documentación, análisis de contenido o cualquier otro uso, esperamos que encuentres la herramienta útil y eficiente.

**¡Feliz transcripción!** 🚀

---

**Manual de Usuario VideoTR3** v3.0  
**Última actualización**: Septiembre 2025  
**Autor**: Javier Tamarit
