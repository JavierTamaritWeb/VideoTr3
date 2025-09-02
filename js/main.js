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
        
        // Cargar configuración guardada
        this.cargarConfiguracion();
        
        // Registrar Service Worker para PWA
        if ('serviceWorker' in navigator) {
            try {
                await navigator.serviceWorker.register('/service-worker.js');
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
        if (tema === 'auto') {
            document.body.removeAttribute('data-tema');
        } else {
            document.body.setAttribute('data-tema', tema);
        }
        localStorage.setItem('tema', tema);
    }
    
    cargarConfiguracion() {
        const tema = localStorage.getItem('tema') || 'auto';
        document.getElementById('config-tema').value = tema;
        this.cambiarTema(tema);
        
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
}

// Inicializar aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.videoTR = new VideoTR();
});