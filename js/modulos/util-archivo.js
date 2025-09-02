
// modulos/util-archivo.js - Utilidades generales para archivos
export function formatearTamaño(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const tamaños = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + tamaños[i];
}

export function obtenerExtension(nombreArchivo) {
    return nombreArchivo.split('.').pop().toLowerCase();
}

export function generarNombreUnico(nombreBase) {
    const timestamp = new Date().getTime();
    const random = Math.random().toString(36).substring(2, 8);
    const extension = obtenerExtension(nombreBase);
    const nombre = nombreBase.replace(`.${extension}`, '');
    
    return `${nombre}_${timestamp}_${random}.${extension}`;
}

export async function calcularHash(arrayBuffer) {
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

export function descargarArchivo(contenido, nombre, tipo) {
    const blob = contenido instanceof Blob ? contenido : new Blob([contenido], { type: tipo });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nombre;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

export function mostrarNotificacion(mensaje, tipo = 'info', duracion = 5000) {
    const contenedor = document.getElementById('contenedor-notificaciones');
    if (!contenedor) return;
    
    const notificacion = document.createElement('div');
    notificacion.className = `notificacion notificacion--${tipo}`;
    
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
    
    const btnCerrar = notificacion.querySelector('.notificacion__cerrar');
    btnCerrar.addEventListener('click', () => {
        notificacion.remove();
    });
    
    contenedor.appendChild(notificacion);
    
    if (duracion > 0) {
        setTimeout(() => {
            if (notificacion.parentNode) {
                notificacion.style.animation = 'slideInUp 0.3s reverse';
                setTimeout(() => notificacion.remove(), 300);
            }
        }, duracion);
    }
}

export function actualizarProgreso(porcentaje, texto = '') {
    const relleno = document.getElementById('progreso-relleno');
    const porcentajeTexto = document.getElementById('progreso-porcentaje');
    const progresoTexto = document.getElementById('progreso-texto');
    
    if (relleno) {
        relleno.style.width = `${porcentaje}%`;
    }
    
    if (porcentajeTexto) {
        porcentajeTexto.textContent = `${Math.round(porcentaje)}%`;
    }
    
    if (progresoTexto && texto) {
        progresoTexto.textContent = texto;
    }
}

export function agregarLog(mensaje, tipo = 'info') {
    const logContenido = document.getElementById('log-contenido');
    if (!logContenido) return;
    
    const linea = document.createElement('div');
    linea.className = `log-proceso__linea log-proceso__linea--${tipo}`;
    
    const timestamp = new Date().toLocaleTimeString('es-ES');
    linea.textContent = `[${timestamp}] ${mensaje}`;
    
    logContenido.appendChild(linea);
    logContenido.scrollTop = logContenido.scrollHeight;
}

export async function leerArchivoComoTexto(archivo) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = e => resolve(e.target.result);
        reader.onerror = reject;
        reader.readAsText(archivo);
    });
}

export async function leerArchivoComoArrayBuffer(archivo) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = e => resolve(e.target.result);
        reader.onerror = reject;
        reader.readAsArrayBuffer(archivo);
    });
}

export async function leerArchivoComoDataURL(archivo) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = e => resolve(e.target.result);
        reader.onerror = reject;
        reader.readAsDataURL(archivo);
    });
}

export function validarTipoArchivo(archivo, tiposPermitidos) {
    const extension = obtenerExtension(archivo.name);
    const tipo = archivo.type;
    
    // Verificar por extensión
    if (tiposPermitidos.extensiones) {
        if (!tiposPermitidos.extensiones.includes(extension)) {
            return false;
        }
    }
    
    // Verificar por MIME type
    if (tiposPermitidos.mimeTypes) {
        const coincide = tiposPermitidos.mimeTypes.some(mime => {
            if (mime.includes('*')) {
                const regex = new RegExp(mime.replace('*', '.*'));
                return regex.test(tipo);
            }
            return tipo === mime;
        });
        
        if (!coincide) {
            return false;
        }
    }
    
    return true;
}

export function debounce(func, wait) {
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

export function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}