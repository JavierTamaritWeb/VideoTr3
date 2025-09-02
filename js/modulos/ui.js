// modulos/ui.js - Gestión de interfaz de usuario
export class UI {
    constructor() {
        this.elementos = this.cachearElementos();
        this.notificacionesActivas = new Set();
    }
    
    cachearElementos() {
        return {
            // Entrada
            zonaSoltar: document.getElementById('zona-soltar'),
            selectorArchivo: document.getElementById('selector-archivo'),
            tarjetaVideo: document.getElementById('tarjeta-video'),
            videoMiniatura: document.getElementById('video-miniatura'),
            
            // Progreso
            barraProgreso: document.getElementById('barra-progreso'),
            progresoRelleno: document.getElementById('progreso-relleno'),
            progresoTexto: document.getElementById('progreso-texto'),
            progresoPorcentaje: document.getElementById('progreso-porcentaje'),
            
            // Log
            logProceso: document.getElementById('log-proceso'),
            logContenido: document.getElementById('log-contenido'),
            
            // Editor
            editorTranscripcion: document.getElementById('editor-transcripcion'),
            contadorCaracteres: document.getElementById('contador-caracteres'),
            contadorPalabras: document.getElementById('contador-palabras'),
            
            // Modales
            modalRegistro: document.getElementById('modal-registro'),
            modalConfiguracion: document.getElementById('modal-configuracion'),
            
            // Panel de pruebas
            panelPruebas: document.getElementById('panel-pruebas'),
            
            // Notificaciones
            contenedorNotificaciones: document.getElementById('contenedor-notificaciones')
        };
    }
    
    mostrarNotificacion(mensaje, tipo = 'info', duracion = 5000) {
        const id = Date.now();
        const notificacion = document.createElement('div');
        notificacion.className = `notificacion notificacion--${tipo}`;
        notificacion.setAttribute('data-id', id);
        
        const iconos = {
            exito: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
            error: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
            advertencia: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
            info: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>'
        };
        
        notificacion.innerHTML = `
            <div class="notificacion__icono">${iconos[tipo]}</div>
            <div class="notificacion__contenido">
                <div class="notificacion__mensaje">${mensaje}</div>
            </div>
            <button class="notificacion__cerrar" aria-label="Cerrar">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
            </button>
        `;
        
        // Agregar event listener para cerrar
        notificacion.querySelector('.notificacion__cerrar').addEventListener('click', () => {
            this.cerrarNotificacion(id);
        });
        
        this.elementos.contenedorNotificaciones.appendChild(notificacion);
        this.notificacionesActivas.add(id);
        
        // Auto-cerrar después de la duración especificada
        if (duracion > 0) {
            setTimeout(() => {
                this.cerrarNotificacion(id);
            }, duracion);
        }
        
        return id;
    }
    
    cerrarNotificacion(id) {
        const notificacion = document.querySelector(`[data-id="${id}"]`);
        if (notificacion) {
            notificacion.style.animation = 'slideInUp 0.3s reverse';
            setTimeout(() => {
                notificacion.remove();
                this.notificacionesActivas.delete(id);
            }, 300);
        }
    }
    
    actualizarProgreso(porcentaje, texto = '') {
        this.elementos.progresoRelleno.style.width = `${porcentaje}%`;
        this.elementos.progresoPorcentaje.textContent = `${Math.round(porcentaje)}%`;
        
        if (texto) {
            this.elementos.progresoTexto.textContent = texto;
        }
    }
    
    agregarLog(mensaje, tipo = 'info') {
        const linea = document.createElement('div');
        linea.className = `log-proceso__linea log-proceso__linea--${tipo}`;
        
        const timestamp = new Date().toLocaleTimeString('es-ES');
        linea.textContent = `[${timestamp}] ${mensaje}`;
        
        this.elementos.logContenido.appendChild(linea);
        this.elementos.logContenido.scrollTop = this.elementos.logContenido.scrollHeight;
    }
    
    limpiarLog() {
        this.elementos.logContenido.innerHTML = '';
    }
    
    mostrarBarraProgreso() {
        this.elementos.barraProgreso.classList.remove('barra-progreso--oculta');
        this.elementos.logProceso.classList.remove('log-proceso--oculto');
    }
    
    ocultarBarraProgreso() {
        setTimeout(() => {
            this.elementos.barraProgreso.classList.add('barra-progreso--oculta');
        }, 3000);
    }
    
    actualizarContadores(caracteres, palabras) {
        this.elementos.contadorCaracteres.textContent = `${caracteres} caracteres`;
        this.elementos.contadorPalabras.textContent = `${palabras} palabras`;
    }
    
    habilitarEditor() {
        this.elementos.editorTranscripcion.disabled = false;
        document.getElementById('btn-copiar').disabled = false;
        document.getElementById('btn-limpiar').disabled = false;
        
        // Habilitar botones de exportación
        document.querySelectorAll('.boton--exportar').forEach(btn => {
            btn.disabled = false;
        });
    }
    
    deshabilitarEditor() {
        this.elementos.editorTranscripcion.disabled = true;
        document.getElementById('btn-copiar').disabled = true;
        document.getElementById('btn-limpiar').disabled = true;
        
        // Deshabilitar botones de exportación
        document.querySelectorAll('.boton--exportar').forEach(btn => {
            btn.disabled = true;
        });
    }
    
    mostrarModal(nombreModal) {
        const modal = document.getElementById(`modal-${nombreModal}`);
        if (modal) {
            modal.classList.add('modal--abierta');
        }
    }
    
    cerrarModal(nombreModal) {
        const modal = document.getElementById(`modal-${nombreModal}`);
        if (modal) {
            modal.classList.remove('modal--abierta');
        }
    }
    
    togglePanelPruebas() {
        this.elementos.panelPruebas.classList.toggle('panel-pruebas--oculto');
    }
}