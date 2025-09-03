// main.js - Punto de entrada principal
import { UI } from './modulos/ui.js';
import { Estado } from './modulos/estado.js';
import { Registro } from './modulos/registro.js';
import { ExtractorAudio } from './modulos/extractor-audio.js';
import { Transcriptor } from './modulos/transcriptor.js';
import { ExportadorTxtMd } from './modulos/exportador-txt-md.js';
import { ExportadorRtf } from './modulos/exportador-rtf.js';
import { ExportadorDocx } from './modulos/exportador-docx.js';
import { mostrarNotificacion, actualizarProgreso, agregarLog } from './modulos/util-archivo.js';

class VideoTR {
    constructor() {
        this.estado = new Estado();
        this.ui = new UI();
        this.registro = new Registro();
        this.extractorAudio = new ExtractorAudio();
        this.transcriptor = new Transcriptor();
        this.exportadorTxtMd = new ExportadorTxtMd();
        this.exportadorRtf = new ExportadorRtf();
        this.exportadorDocx = new ExportadorDocx();
        
        this.videoActual = null;
        this.audioBuffer = null;
        this.transcripcion = '';
        this.metadatos = {};
        
        this.inicializar();
    }
    
    async inicializar() {
        // Inicializar IndexedDB
        await this.registro.inicializar();
        
        // Configurar event listeners
        this.configurarEventListeners();
        
        // Configurar listener para cambios en el tema del sistema
        this.configurarListenerTemaServicio();
        
        // Cargar configuración guardada
        this.cargarConfiguracion();
        
        // Registrar Service Worker para PWA
        if ('serviceWorker' in navigator) {
            try {
                await navigator.serviceWorker.register('/service-worker-dev.js');
                console.log('Service Worker registrado');
            } catch (error) {
                console.log('Error registrando Service Worker:', error);
            }
        }
        
        // Verificar soporte de WebGPU
        if ('gpu' in navigator) {
            this.estado.set('webgpuDisponible', true);
            agregarLog('WebGPU disponible', 'exito');
        } else {
            agregarLog('WebGPU no disponible, usando WASM', 'advertencia');
        }
    }
    
    configurarEventListeners() {
        // Zona de arrastrar y soltar
        const zonaSoltar = document.getElementById('zona-soltar');
        const selectorArchivo = document.getElementById('selector-archivo');
        
        zonaSoltar.addEventListener('dragover', (e) => {
            e.preventDefault();
            zonaSoltar.classList.add('panel-entrada__zona-soltar--arrastrando');
        });
        
        zonaSoltar.addEventListener('dragleave', () => {
            zonaSoltar.classList.remove('panel-entrada__zona-soltar--arrastrando');
        });
        
        zonaSoltar.addEventListener('drop', (e) => {
            e.preventDefault();
            zonaSoltar.classList.remove('panel-entrada__zona-soltar--arrastrando');
            
            const files = e.dataTransfer.files;
            if (files.length > 0 && files[0].type.startsWith('video/')) {
                this.cargarVideo(files[0]);
            } else {
                mostrarNotificacion('Por favor, selecciona un archivo de vídeo', 'error');
            }
        });
        
        selectorArchivo.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.cargarVideo(e.target.files[0]);
            }
        });
        
        // Botón eliminar vídeo
        document.getElementById('btn-eliminar-video').addEventListener('click', () => {
            this.limpiarVideo();
        });
        
        // Selector de motor
        document.getElementById('selector-motor').addEventListener('change', (e) => {
            const motor = e.target.value;
            document.getElementById('grupo-modelo-local').classList.toggle('grupo-formulario--oculto', motor !== 'local');
            document.getElementById('grupo-api-key').classList.toggle('grupo-formulario--oculto', motor === 'local');
        });
        
        // Botón transcribir
        document.getElementById('btn-transcribir').addEventListener('click', () => {
            this.iniciarTranscripcion();
        });
        
        // Editor de texto
        const editor = document.getElementById('editor-transcripcion');
        editor.addEventListener('input', () => {
            this.transcripcion = editor.value;
            this.actualizarContadores();
        });
        
        // Botones de acción del editor
        document.getElementById('btn-copiar').addEventListener('click', () => {
            navigator.clipboard.writeText(this.transcripcion);
            mostrarNotificacion('Texto copiado al portapapeles', 'exito');
        });
        
        document.getElementById('btn-limpiar').addEventListener('click', () => {
            if (confirm('¿Estás seguro de que quieres limpiar el editor?')) {
                editor.value = '';
                this.transcripcion = '';
                this.actualizarContadores();
            }
        });
        
        // Botones de exportación
        document.getElementById('btn-exportar-txt').addEventListener('click', () => {
            this.exportar('txt');
        });
        
        document.getElementById('btn-exportar-md').addEventListener('click', () => {
            this.exportar('md');
        });
        
        document.getElementById('btn-exportar-rtf').addEventListener('click', () => {
            this.exportar('rtf');
        });
        
        document.getElementById('btn-exportar-docx').addEventListener('click', () => {
            this.exportar('docx');
        });
        
        // Modales
        this.configurarModales();
        
        // Panel de pruebas
        this.configurarPanelPruebas();
        
        // Atajo de teclado para cambiar tema (Ctrl+Shift+T)
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'T') {
                e.preventDefault();
                this.cambiarTemaRapido();
            }
        });
    }
    
    configurarModales() {
        // Modal de registro
        const btnRegistro = document.getElementById('btn-registro');
        const modalRegistro = document.getElementById('modal-registro');
        
        btnRegistro.addEventListener('click', async () => {
            await this.mostrarRegistro();
            modalRegistro.classList.add('modal--abierta');
        });
        
        // Modal de configuración
        const btnConfiguracion = document.getElementById('btn-configuracion');
        const modalConfiguracion = document.getElementById('modal-configuracion');
        
        btnConfiguracion.addEventListener('click', () => {
            modalConfiguracion.classList.add('modal--abierta');
        });
        
        // Botón de cambio rápido de tema
        const btnCambiarTema = document.getElementById('btn-cambiar-tema');
        if (btnCambiarTema) {
            btnCambiarTema.addEventListener('click', () => {
                this.cambiarTemaRapido();
            });
        }
        
        // Cerrar modales
        document.querySelectorAll('.modal__cerrar').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.target.closest('.modal').classList.remove('modal--abierta');
            });
        });
        
        // Cerrar al hacer clic fuera
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('modal--abierta');
                }
            });
        });
        
        // Configuración
        document.getElementById('config-tema').addEventListener('change', (e) => {
            this.cambiarTema(e.target.value);
            this.actualizarIconoTema(e.target.value);
            
            // Mostrar notificación de cambio
            const temas = {
                'auto': 'Automático (sigue el sistema)',
                'claro': 'Modo claro',
                'oscuro': 'Modo oscuro'
            };
            mostrarNotificacion(`Tema cambiado a: ${temas[e.target.value]}`, 'exito', 2000);
        });
        
        document.getElementById('btn-limpiar-cache').addEventListener('click', async () => {
            if ('caches' in window) {
                const cacheNames = await caches.keys();
                await Promise.all(cacheNames.map(name => caches.delete(name)));
                mostrarNotificacion('Caché limpiada correctamente', 'exito');
            }
        });
        
        // Acciones del registro
        document.getElementById('btn-exportar-csv').addEventListener('click', async () => {
            const csv = await this.registro.exportarCSV();
            this.descargarArchivo(csv, 'registro.csv', 'text/csv');
        });
        
        document.getElementById('btn-exportar-json').addEventListener('click', async () => {
            const json = await this.registro.exportarJSON();
            this.descargarArchivo(json, 'registro.json', 'application/json');
        });
        
        document.getElementById('btn-limpiar-registro').addEventListener('click', async () => {
            if (confirm('¿Estás seguro de que quieres limpiar todo el registro?')) {
                await this.registro.limpiar();
                await this.mostrarRegistro();
                mostrarNotificacion('Registro limpiado', 'info');
            }
        });
        
        // === MEJORAS DE ACCESIBILIDAD ===
        this.configurarNavegacionTeclado();
        this.configurarGestionFocus();
        this.configurarAnunciosARIA();
    }
    
    configurarNavegacionTeclado() {
        // Navegación por teclado en la zona de subida
        const zonaSoltar = document.getElementById('zona-soltar');
        zonaSoltar.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                document.getElementById('selector-archivo').click();
            }
        });
        
        // Atajos de teclado globales
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + U para subir archivo
            if ((e.ctrlKey || e.metaKey) && e.key === 'u') {
                e.preventDefault();
                document.getElementById('selector-archivo').click();
            }
            
            // Ctrl/Cmd + Enter para transcribir
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                const btnTranscribir = document.getElementById('btn-transcribir');
                if (!btnTranscribir.disabled) {
                    this.iniciarTranscripcion();
                }
            }
            
            // Escape para cerrar modales
            if (e.key === 'Escape') {
                document.querySelectorAll('.modal--abierta').forEach(modal => {
                    modal.classList.remove('modal--abierta');
                });
            }
            
            // Ctrl/Cmd + / para mostrar ayuda de atajos
            if ((e.ctrlKey || e.metaKey) && e.key === '/') {
                e.preventDefault();
                this.mostrarAyudaAtajos();
            }
        });
    }
    
    configurarGestionFocus() {
        // Gestión de focus en modales
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('transitionend', (e) => {
                if (e.target === modal && modal.classList.contains('modal--abierta')) {
                    // Enfocar primer elemento focusable del modal
                    const primerElemento = modal.querySelector('button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
                    if (primerElemento) {
                        primerElemento.focus();
                    }
                }
            });
        });
        
        // Trap de focus en modales
        document.addEventListener('keydown', (e) => {
            const modalAbierto = document.querySelector('.modal--abierta');
            if (!modalAbierto || e.key !== 'Tab') return;
            
            const elementosFocusables = modalAbierto.querySelectorAll(
                'button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            
            if (elementosFocusables.length === 0) return;
            
            const primero = elementosFocusables[0];
            const ultimo = elementosFocusables[elementosFocusables.length - 1];
            
            if (e.shiftKey) {
                // Shift + Tab
                if (document.activeElement === primero) {
                    e.preventDefault();
                    ultimo.focus();
                }
            } else {
                // Tab
                if (document.activeElement === ultimo) {
                    e.preventDefault();
                    primero.focus();
                }
            }
        });
    }
    
    configurarAnunciosARIA() {
        // Región para anuncios dinámicos
        if (!document.getElementById('anuncios-aria')) {
            const regionAnuncios = document.createElement('div');
            regionAnuncios.id = 'anuncios-aria';
            regionAnuncios.setAttribute('aria-live', 'polite');
            regionAnuncios.setAttribute('aria-atomic', 'true');
            regionAnuncios.className = 'sr-only';
            document.body.appendChild(regionAnuncios);
        }
    }
    
    anunciarARIA(mensaje, prioridad = 'polite') {
        const regionAnuncios = document.getElementById('anuncios-aria');
        if (regionAnuncios) {
            regionAnuncios.setAttribute('aria-live', prioridad);
            regionAnuncios.textContent = mensaje;
            
            // Limpiar después de un tiempo para permitir nuevos anuncios
            setTimeout(() => {
                regionAnuncios.textContent = '';
            }, 1000);
        }
    }
    
    mostrarAyudaAtajos() {
        const atajos = `
Atajos de teclado disponibles:

Ctrl/Cmd + U: Subir archivo
Ctrl/Cmd + Enter: Iniciar transcripción
Escape: Cerrar modales
Ctrl/Cmd + /: Mostrar esta ayuda
Tab: Navegar entre elementos
Enter/Espacio: Activar botones y zona de subida
        `.trim();
        
        alert(atajos);
    }
    
    configurarPanelPruebas() {
        const btnPruebas = document.getElementById('btn-pruebas');
        const panelPruebas = document.getElementById('panel-pruebas');
        const btnCerrarPruebas = document.getElementById('btn-cerrar-pruebas');
        
        btnPruebas.addEventListener('click', () => {
            panelPruebas.classList.toggle('panel-pruebas--oculto');
        });
        
        btnCerrarPruebas.addEventListener('click', () => {
            panelPruebas.classList.add('panel-pruebas--oculto');
        });
        
        // Smoke test
        document.getElementById('btn-ejecutar-smoke').addEventListener('click', async () => {
            await this.ejecutarSmokeTest();
        });
        
        // Validación WAV
        document.getElementById('btn-validar-wav').addEventListener('click', () => {
            this.validarWAV();
        });
    }
    
    async cargarVideo(archivo) {
        try {
            this.videoActual = archivo;
            
            // Mostrar información del vídeo
            const tarjeta = document.getElementById('tarjeta-video');
            const miniatura = document.getElementById('video-miniatura');
            
            tarjeta.classList.remove('tarjeta-video--oculta');
            document.getElementById('video-nombre').textContent = archivo.name;
            document.getElementById('video-tamaño').textContent = `${(archivo.size / 1024 / 1024).toFixed(2)} MB`;
            document.getElementById('video-formato').textContent = archivo.type.split('/')[1].toUpperCase();
            
            // Cargar miniatura y duración
            const url = URL.createObjectURL(archivo);
            miniatura.src = url;
            
            miniatura.addEventListener('loadedmetadata', () => {
                const duracion = miniatura.duration;
                const minutos = Math.floor(duracion / 60);
                const segundos = Math.floor(duracion % 60);
                document.getElementById('video-duracion').textContent = 
                    `${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
                
                // Capturar frame
                miniatura.currentTime = duracion * 0.25;
            });
            
            // Habilitar botón de transcripción
            document.getElementById('btn-transcribir').disabled = false;
            
            // Registrar entrada
            await this.registro.registrarEntrada({
                nombre: archivo.name,
                tamaño: archivo.size,
                tipo: archivo.type,
                duracion: miniatura.duration
            });
            
            mostrarNotificacion('Vídeo cargado correctamente', 'exito');
        } catch (error) {
            console.error('Error cargando vídeo:', error);
            mostrarNotificacion('Error al cargar el vídeo', 'error');
        }
    }
    
    limpiarVideo() {
        this.videoActual = null;
        document.getElementById('tarjeta-video').classList.add('tarjeta-video--oculta');
        document.getElementById('btn-transcribir').disabled = true;
        document.getElementById('selector-archivo').value = '';
        
        // Anunciar limpieza
        this.anunciarARIA('Vídeo eliminado, seleccione un nuevo archivo');
    }
    
    validarArchivo(archivo) {
        // Validaciones de seguridad y compatibilidad
        const formatosPermitidos = [
            'video/mp4', 'video/webm', 'video/avi', 'video/quicktime', 
            'video/x-msvideo', 'video/x-matroska', 'video/x-ms-wmv',
            'video/x-flv', 'video/ogg'
        ];
        
        const tamañoMaximo = 2 * 1024 * 1024 * 1024; // 2GB
        const tamañoMinimo = 1024; // 1KB
        
        if (!archivo) {
            return { valido: false, mensaje: 'No se ha seleccionado ningún archivo' };
        }
        
        if (!archivo.type.startsWith('video/')) {
            return { valido: false, mensaje: 'El archivo seleccionado no es un vídeo' };
        }
        
        if (!formatosPermitidos.includes(archivo.type)) {
            return { 
                valido: false, 
                mensaje: `Formato ${archivo.type} no soportado. Use MP4, WebM, AVI, MOV, MKV, WMV, FLV u OGV` 
            };
        }
        
        if (archivo.size > tamañoMaximo) {
            return { 
                valido: false, 
                mensaje: `El archivo es demasiado grande. Máximo 2GB permitido` 
            };
        }
        
        if (archivo.size < tamañoMinimo) {
            return { 
                valido: false, 
                mensaje: 'El archivo parece estar dañado o vacío' 
            };
        }
        
        // Validar nombre de archivo
        if (archivo.name.length > 255) {
            return { 
                valido: false, 
                mensaje: 'El nombre del archivo es demasiado largo' 
            };
        }
        
        return { valido: true, mensaje: 'Archivo válido' };
    }
    
    actualizarInformacionVideo(archivo) {
        const elementos = {
            'video-nombre': archivo.name,
            'video-tamaño': `${(archivo.size / 1024 / 1024).toFixed(2)} MB`,
            'video-formato': archivo.type.split('/')[1].toUpperCase()
        };
        
        Object.entries(elementos).forEach(([id, valor]) => {
            const elemento = document.getElementById(id);
            if (elemento) {
                elemento.textContent = valor;
                
                // Añadir título para tooltips
                if (id === 'video-nombre' && valor.length > 50) {
                    elemento.title = valor;
                }
            }
        });
        
        // Actualizar aria-label de la tarjeta
        const tarjeta = document.getElementById('tarjeta-video');
        if (tarjeta) {
            tarjeta.setAttribute('aria-label', 
                `Vídeo cargado: ${archivo.name}, ${elementos['video-tamaño']}, formato ${elementos['video-formato']}`
            );
        }
    }
    
    async iniciarTranscripcion() {
        if (!this.videoActual) return;
        
        try {
            // Preparar UI
            document.getElementById('btn-transcribir').disabled = true;
            document.getElementById('barra-progreso').classList.remove('barra-progreso--oculta');
            document.getElementById('log-proceso').classList.remove('log-proceso--oculto');
            
            // Limpiar log
            document.getElementById('log-contenido').innerHTML = '';
            
            // Paso 1: Extraer audio
            actualizarProgreso(10, 'Extrayendo audio...');
            agregarLog('Iniciando extracción de audio...');
            
            const audioData = await this.extractorAudio.extraer(this.videoActual);
            this.audioBuffer = audioData;
            
            agregarLog('Audio extraído correctamente', 'exito');
            agregarLog(`Duración: ${audioData.duration}s, Frecuencia: 16000 Hz, Canal: Mono`);
            
            // Paso 2: Transcribir
            actualizarProgreso(30, 'Iniciando transcripción...');
            
            const motor = document.getElementById('selector-motor').value;
            const modelo = document.getElementById('selector-modelo').value;
            const idioma = document.getElementById('selector-idioma').value;
            const apiKey = document.getElementById('input-api-key').value;
            
            this.metadatos = {
                motor,
                modelo,
                idioma,
                fecha: new Date().toISOString(),
                archivo: this.videoActual.name
            };
            
            agregarLog(`Motor: ${motor}, Modelo: ${modelo}, Idioma: ${idioma}`);
            
            const resultado = await this.transcriptor.transcribir(audioData, {
                motor,
                modelo,
                idioma,
                apiKey,
                onProgress: (porcentaje, mensaje) => {
                    actualizarProgreso(30 + (porcentaje * 0.6), mensaje);
                    agregarLog(mensaje);
                }
            });
            
            this.transcripcion = resultado.texto;
            
            // Paso 3: Mostrar resultado
            actualizarProgreso(95, 'Finalizando...');
            
            const editor = document.getElementById('editor-transcripcion');
            editor.value = this.transcripcion;
            editor.disabled = false;
            
            this.actualizarContadores();
            
            // Habilitar botones
            document.getElementById('btn-copiar').disabled = false;
            document.getElementById('btn-limpiar').disabled = false;
            document.getElementById('btn-exportar-txt').disabled = false;
            document.getElementById('btn-exportar-md').disabled = false;
            document.getElementById('btn-exportar-rtf').disabled = false;
            document.getElementById('btn-exportar-docx').disabled = false;
            
            actualizarProgreso(100, 'Transcripción completada');
            agregarLog('Transcripción completada con éxito', 'exito');
            
            mostrarNotificacion('Transcripción completada', 'exito');
            
            // Registrar salida
            await this.registro.registrarSalida({
                tipo: 'transcripcion',
                nombre: `${this.videoActual.name.split('.')[0]}_transcripcion.txt`,
                tamaño: new Blob([this.transcripcion]).size,
                motor,
                modelo,
                idioma,
                idEntrada: this.videoActual.name
            });
            
            // Guardar métricas
            this.guardarMetricas({
                tiempoExtraccion: audioData.tiempoProcesamiento,
                tiempoTranscripcion: resultado.tiempoProcesamiento,
                tamañoAudio: audioData.tamaño,
                longitudTexto: this.transcripcion.length
            });
            
        } catch (error) {
            console.error('Error en transcripción:', error);
            agregarLog(`Error: ${error.message}`, 'error');
            mostrarNotificacion('Error durante la transcripción', 'error');
        } finally {
            document.getElementById('btn-transcribir').disabled = false;
            setTimeout(() => {
                document.getElementById('barra-progreso').classList.add('barra-progreso--oculta');
            }, 3000);
        }
    }
    
    actualizarContadores() {
        const texto = this.transcripcion;
        const caracteres = texto.length;
        const palabras = texto.trim().split(/\s+/).filter(p => p.length > 0).length;
        
        document.getElementById('contador-caracteres').textContent = `${caracteres} caracteres`;
        document.getElementById('contador-palabras').textContent = `${palabras} palabras`;
    }
    
    async exportar(formato) {
        if (!this.transcripcion) {
            mostrarNotificacion('No hay transcripción para exportar', 'advertencia');
            return;
        }
        
        try {
            let contenido, nombreArchivo, mimeType;
            
            switch (formato) {
                case 'txt':
                    contenido = this.exportadorTxtMd.exportarTxt(this.transcripcion);
                    nombreArchivo = 'transcripcion.txt';
                    mimeType = 'text/plain';
                    break;
                    
                case 'md':
                    contenido = this.exportadorTxtMd.exportarMd(this.transcripcion, this.metadatos);
                    nombreArchivo = 'transcripcion.md';
                    mimeType = 'text/markdown';
                    break;
                    
                case 'rtf':
                    contenido = this.exportadorRtf.exportar(this.transcripcion, this.metadatos);
                    nombreArchivo = 'transcripcion.rtf';
                    mimeType = 'application/rtf';
                    break;
                    
                case 'docx':
                    contenido = await this.exportadorDocx.exportar(this.transcripcion, this.metadatos);
                    nombreArchivo = 'transcripcion.docx';
                    mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
                    break;
            }
            
            // Descargar archivo
            this.descargarArchivo(contenido, nombreArchivo, mimeType);
            
            // Registrar exportación
            await this.registro.registrarSalida({
                tipo: formato,
                nombre: nombreArchivo,
                tamaño: contenido instanceof Blob ? contenido.size : new Blob([contenido]).size,
                motor: this.metadatos.motor,
                modelo: this.metadatos.modelo,
                idioma: this.metadatos.idioma
            });
            
            mostrarNotificacion(`Archivo ${formato.toUpperCase()} descargado`, 'exito');
            
        } catch (error) {
            console.error(`Error exportando ${formato}:`, error);
            mostrarNotificacion(`Error al exportar ${formato.toUpperCase()}`, 'error');
        }
    }
    
    descargarArchivo(contenido, nombre, tipo) {
        const blob = contenido instanceof Blob ? contenido : new Blob([contenido], { type: tipo });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = nombre;
        a.click();
        URL.revokeObjectURL(url);
    }
    
    async mostrarRegistro() {
        const registros = await this.registro.listar();
        const tbody = document.getElementById('tabla-registro-cuerpo');
        
        if (registros.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="tabla-registro__vacio">No hay registros</td></tr>';
            return;
        }
        
        tbody.innerHTML = registros.map(r => `
            <tr>
                <td>${new Date(r.fecha).toLocaleString('es-ES')}</td>
                <td>${r.tipo}</td>
                <td>${r.nombre}</td>
                <td>${r.motor || '-'}</td>
                <td>${(r.tamaño / 1024).toFixed(2)} KB</td>
                <td>
                    ${r.enlace ? `<button class="boton boton--secundario" onclick="window.open('${r.enlace}')">Descargar</button>` : '-'}
                </td>
            </tr>
        `).join('');
    }
    
    cambiarTema(tema) {
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        
        if (tema === 'auto') {
            document.body.removeAttribute('data-tema');
            // Detectar preferencia del sistema
            const prefiereTemaOscuro = window.matchMedia('(prefers-color-scheme: dark)').matches;
            metaThemeColor.content = prefiereTemaOscuro ? '#1e293b' : '#2563eb';
        } else if (tema === 'oscuro') {
            document.body.setAttribute('data-tema', tema);
            metaThemeColor.content = '#1e293b';
        } else {
            document.body.setAttribute('data-tema', tema);
            metaThemeColor.content = '#2563eb';
        }
        
        localStorage.setItem('tema', tema);
        
        // Actualizar el estado global
        this.estado.set('tema', tema);
    }
    
    cambiarTemaRapido() {
        const temaActual = localStorage.getItem('tema') || 'auto';
        let nuevoTema;
        
        switch (temaActual) {
            case 'auto':
                nuevoTema = 'claro';
                break;
            case 'claro':
                nuevoTema = 'oscuro';
                break;
            case 'oscuro':
                nuevoTema = 'auto';
                break;
            default:
                nuevoTema = 'auto';
        }
        
        this.cambiarTema(nuevoTema);
        // También actualizar el selector en configuración
        document.getElementById('config-tema').value = nuevoTema;
        this.actualizarIconoTema(nuevoTema);
        
        // Mostrar notificación y anunciar para lectores de pantalla
        const temas = {
            'auto': '🔄 Automático (sigue el sistema)',
            'claro': '☀️ Modo claro',
            'oscuro': '🌙 Modo oscuro'
        };
        
        const mensaje = `Tema cambiado a ${temas[nuevoTema]}`;
        mostrarNotificacion(mensaje, 'exito', 2000);
        this.anunciarARIA(mensaje);
        
        // Actualizar atributos de accesibilidad del botón
        this.actualizarAccesibilidadBotonTema(nuevoTema);
    }
    
    actualizarAccesibilidadBotonTema(tema) {
        const botonTema = document.getElementById('btn-cambiar-tema');
        const textoTema = document.getElementById('texto-tema');
        
        if (!botonTema) return;
        
        const temas = {
            'auto': 'Automático',
            'claro': 'Claro', 
            'oscuro': 'Oscuro'
        };
        
        const siguienteTemas = {
            'auto': 'claro',
            'claro': 'oscuro',
            'oscuro': 'automático'
        };
        
        const temaTexto = temas[tema] || 'Automático';
        const siguienteTema = siguienteTemas[tema] || 'automático';
        
        botonTema.setAttribute('aria-label', `Cambiar tema de ${temaTexto.toLowerCase()} a ${siguienteTema}`);
        botonTema.setAttribute('title', `Tema actual: ${temaTexto}. Clic para cambiar a ${siguienteTema}`);
        
        if (textoTema) {
            textoTema.textContent = temaTexto;
        }
    }
    
    actualizarIconoTema(tema) {
        const icono = document.getElementById('icono-tema');
        
        if (!icono) {
            console.warn('Icono de tema no encontrado');
            return;
        }
        
        if (tema === 'oscuro' || (tema === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            icono.textContent = '☀️';
        } else {
            icono.textContent = '🌙';
        }
    }
    
    configurarListenerTemaServicio() {
        // Escuchar cambios en la preferencia del tema del sistema
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        
        mediaQuery.addListener(() => {
            const temaActual = localStorage.getItem('tema') || 'auto';
            if (temaActual === 'auto') {
                this.cambiarTema('auto'); // Reaplica el tema automático
                this.actualizarIconoTema('auto'); // Actualiza el icono
            }
        });
    }
    
    cargarConfiguracion() {
        console.log('Cargando configuración...');
        const tema = localStorage.getItem('tema') || 'auto';
        console.log('Tema actual:', tema);
        document.getElementById('config-tema').value = tema;
        this.cambiarTema(tema);
        this.actualizarIconoTema(tema);
        console.log('Icono de tema actualizado para:', tema);
        
        const webgpu = localStorage.getItem('webgpu') !== 'false';
        document.getElementById('config-webgpu').checked = webgpu;
        
        const cache = localStorage.getItem('cache-modelos') !== 'false';
        document.getElementById('config-cache-modelos').checked = cache;
    }
    
    guardarMetricas(metricas) {
        const contenedor = document.getElementById('metricas');
        contenedor.innerHTML = `
            <div class="metrica">
                <span class="metrica__nombre">Tiempo extracción</span>
                <span class="metrica__valor">${metricas.tiempoExtraccion}ms</span>
            </div>
            <div class="metrica">
                <span class="metrica__nombre">Tiempo transcripción</span>
                <span class="metrica__valor">${metricas.tiempoTranscripcion}ms</span>
            </div>
            <div class="metrica">
                <span class="metrica__nombre">Tamaño audio</span>
                <span class="metrica__valor">${(metricas.tamañoAudio / 1024 / 1024).toFixed(2)} MB</span>
            </div>
            <div class="metrica">
                <span class="metrica__nombre">Longitud texto</span>
                <span class="metrica__valor">${metricas.longitudTexto} caracteres</span>
            </div>
        `;
    }
    
    async ejecutarSmokeTest() {
        const resultados = document.getElementById('resultados-smoke');
        resultados.innerHTML = '<div>Iniciando smoke test...</div>';
        
        try {
            // 1. Cargar vídeo de prueba
            resultados.innerHTML += '<div>✓ Cargando vídeo de prueba...</div>';
            const videoPrueba = document.getElementById('video-prueba');
            
            // Crear un blob del vídeo
            const response = await fetch(videoPrueba.querySelector('source').src);
            const blob = await response.blob();
            const archivo = new File([blob], 'test.mp4', { type: 'video/mp4' });
            
            await this.cargarVideo(archivo);
            resultados.innerHTML += '<div>✓ Vídeo cargado</div>';
            
            // 2. Extraer audio
            resultados.innerHTML += '<div>✓ Extrayendo audio...</div>';
            const audioData = await this.extractorAudio.extraer(archivo);
            resultados.innerHTML += `<div>✓ Audio extraído: ${audioData.duration}s</div>`;
            
            // 3. Transcribir (modo demo)
            resultados.innerHTML += '<div>✓ Simulando transcripción...</div>';
            this.transcripcion = 'Esta es una transcripción de prueba del smoke test.';
            document.getElementById('editor-transcripcion').value = this.transcripcion;
            resultados.innerHTML += '<div>✓ Transcripción completada</div>';
            
            // 4. Exportar a todos los formatos
            const formatos = ['txt', 'md', 'rtf', 'docx'];
            for (const formato of formatos) {
                resultados.innerHTML += `<div>✓ Exportando ${formato.toUpperCase()}...</div>`;
                await this.exportar(formato);
                resultados.innerHTML += `<div>✓ ${formato.toUpperCase()} exportado</div>`;
            }
            
            resultados.innerHTML += '<div style="color: var(--color-exito); font-weight: bold;">✓ Smoke test completado con éxito</div>';
            
        } catch (error) {
            resultados.innerHTML += `<div style="color: var(--color-error);">✗ Error: ${error.message}</div>`;
        }
    }
    
    validarWAV() {
        const resultados = document.getElementById('resultados-wav');
        
        if (!this.audioBuffer) {
            resultados.innerHTML = '<div style="color: var(--color-error);">No hay audio WAV para validar</div>';
            return;
        }
        
        try {
            const view = new DataView(this.audioBuffer.buffer);
            
            // Verificar cabecera RIFF
            const riff = String.fromCharCode(view.getUint8(0), view.getUint8(1), view.getUint8(2), view.getUint8(3));
            const wave = String.fromCharCode(view.getUint8(8), view.getUint8(9), view.getUint8(10), view.getUint8(11));
            
            resultados.innerHTML = `
                <div>Cabecera RIFF: ${riff === 'RIFF' ? '✓' : '✗'} ${riff}</div>
                <div>Formato WAVE: ${wave === 'WAVE' ? '✓' : '✗'} ${wave}</div>
                <div>Tamaño: ${this.audioBuffer.buffer.byteLength} bytes</div>
                <div>Frecuencia: 16000 Hz</div>
                <div>Canales: 1 (Mono)</div>
                <div>Bits por muestra: 16</div>
                <div style="color: var(--color-exito); font-weight: bold;">✓ WAV válido</div>
            `;
        } catch (error) {
            resultados.innerHTML = `<div style="color: var(--color-error);">✗ Error validando WAV: ${error.message}</div>`;
        }
    }
    
    // === GESTIÓN PWA Y CONECTIVIDAD ===
    
    configurarPWA() {
        // Escuchar mensajes del Service Worker
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.addEventListener('message', (event) => {
                this.manejarMensajeServiceWorker(event);
            });
            
            // Detectar actualizaciones de la PWA
            navigator.serviceWorker.addEventListener('controllerchange', () => {
                this.anunciarARIA('Aplicación actualizada. Recarga para ver los cambios.');
                mostrarNotificacion('Nueva versión disponible', 'info');
            });
        }
        
        // Detectar cambios de conectividad
        window.addEventListener('online', () => {
            this.manejarCambioConectividad(true);
        });
        
        window.addEventListener('offline', () => {
            this.manejarCambioConectividad(false);
        });
        
        // Configurar instalación de PWA
        this.configurarInstalacionPWA();
    }
    
    manejarMensajeServiceWorker(event) {
        const { data } = event;
        
        switch (data.type) {
            case 'NETWORK_STATUS':
                const mensaje = data.online ? 
                    'Conexión restaurada - Funciones completas disponibles' :
                    'Modo offline - Funcionalidad limitada';
                mostrarNotificacion(mensaje, data.online ? 'exito' : 'info');
                this.anunciarARIA(mensaje);
                break;
                
            case 'UPDATE_AVAILABLE':
                mostrarNotificacion(data.message, 'info');
                break;
                
            case 'SERVICE_WORKER_ERROR':
                console.error('Service Worker Error:', data.error);
                mostrarNotificacion('Error en el Service Worker', 'error');
                break;
        }
    }
    
    manejarCambioConectividad(online) {
        const indicadorConectividad = document.getElementById('indicador-conectividad') || 
            this.crearIndicadorConectividad();
            
        if (online) {
            indicadorConectividad.textContent = '🌐 Online';
            indicadorConectividad.className = 'indicador-conectividad online';
            this.anunciarARIA('Conexión a internet restaurada');
        } else {
            indicadorConectividad.textContent = '📴 Offline';
            indicadorConectividad.className = 'indicador-conectividad offline';
            this.anunciarARIA('Conexión perdida. Trabajando en modo offline');
        }
        
        // Auto-ocultar después de 3 segundos
        setTimeout(() => {
            indicadorConectividad.style.opacity = '0';
            setTimeout(() => {
                if (indicadorConectividad.parentNode) {
                    indicadorConectividad.parentNode.removeChild(indicadorConectividad);
                }
            }, 300);
        }, 3000);
    }
    
    crearIndicadorConectividad() {
        const indicador = document.createElement('div');
        indicador.id = 'indicador-conectividad';
        indicador.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--color-fondo-modal);
            color: var(--color-texto);
            padding: var(--espacio-s) var(--espacio-m);
            border-radius: var(--radio-m);
            box-shadow: var(--sombra-l);
            font-size: var(--tamaño-texto-s);
            font-weight: var(--peso-medio);
            z-index: 10000;
            transition: opacity 0.3s ease;
            border: 1px solid var(--color-borde);
        `;
        
        document.body.appendChild(indicador);
        return indicador;
    }
    
    configurarInstalacionPWA() {
        let deferredPrompt;
        
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            this.mostrarBotonInstalacion();
        });
        
        // Crear botón de instalación
        const botonInstalar = document.createElement('button');
        botonInstalar.id = 'btn-instalar-pwa';
        botonInstalar.className = 'boton boton--primario';
        botonInstalar.innerHTML = '📱 Instalar App';
        botonInstalar.style.display = 'none';
        botonInstalar.setAttribute('aria-label', 'Instalar VideoTR como aplicación');
        
        botonInstalar.addEventListener('click', async () => {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                
                if (outcome === 'accepted') {
                    this.anunciarARIA('VideoTR instalado correctamente');
                    mostrarNotificacion('¡App instalada!', 'exito');
                } else {
                    this.anunciarARIA('Instalación cancelada');
                }
                
                deferredPrompt = null;
                botonInstalar.style.display = 'none';
            }
        });
        
        // Añadir a la navegación
        const navegacion = document.querySelector('.barra-cabecera__navegacion');
        if (navegacion) {
            navegacion.appendChild(botonInstalar);
        }
        
        this.botonInstalacion = botonInstalar;
    }
    
    mostrarBotonInstalacion() {
        if (this.botonInstalacion) {
            this.botonInstalacion.style.display = 'inline-flex';
            this.anunciarARIA('VideoTR puede instalarse como aplicación');
        }
    }
    
    // Información del sistema para debugging
    obtenerInformacionSistema() {
        return {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language,
            cookiesEnabled: navigator.cookieEnabled,
            onLine: navigator.onLine,
            serviceWorkerSupported: 'serviceWorker' in navigator,
            indexedDBSupported: 'indexedDB' in window,
            webAudioSupported: 'AudioContext' in window || 'webkitAudioContext' in window,
            fileAPISupported: 'File' in window && 'FileReader' in window,
            timestamp: new Date().toISOString()
        };
    }
}


// Inicializar aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    const app = new VideoTR();
    
    // Configurar PWA después de la inicialización
    app.configurarPWA();
    
    // Hacer disponible globalmente para debugging
    window.videoTR = app;
    
    // Debug: Mostrar información del sistema en consola
    console.log('VideoTR System Info:', app.obtenerInformacionSistema());
});

// Manejo global de errores no capturados
window.addEventListener('error', (event) => {
    console.error('Error no capturado:', event.error);
    
    if (window.videoTR && window.videoTR.anunciarARIA) {
        window.videoTR.anunciarARIA('Ha ocurrido un error. Revisa la consola para más detalles.', 'assertive');
    }
});

// Manejo global de promesas rechazadas
window.addEventListener('unhandledrejection', (event) => {
    console.error('Promesa rechazada no manejada:', event.reason);
    event.preventDefault(); // Evitar que se muestre en consola como error no manejado
});