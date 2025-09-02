// modulos/exportador-txt-md.js - Exportador a TXT y Markdown
export class ExportadorTxtMd {
    exportarTxt(texto) {
        // Exportar como texto plano UTF-8 con saltos de línea LF
        return this.normalizarSaltosLinea(texto);
    }
    
    exportarMd(texto, metadatos = {}) {
        const fecha = new Date().toLocaleString('es-ES');
        
        let markdown = '# Transcripción de Audio\n\n';
        
        // Agregar metadatos
        markdown += '## Información\n\n';
        markdown += `- **Fecha de transcripción:** ${fecha}\n`;
        
        if (metadatos.archivo) {
            markdown += `- **Archivo original:** ${metadatos.archivo}\n`;
        }
        
        if (metadatos.motor) {
            markdown += `- **Motor de transcripción:** ${this.formatearMotor(metadatos.motor)}\n`;
        }
        
        if (metadatos.modelo) {
            markdown += `- **Modelo:** ${metadatos.modelo}\n`;
        }
        
        if (metadatos.idioma && metadatos.idioma !== 'auto') {
            markdown += `- **Idioma:** ${this.formatearIdioma(metadatos.idioma)}\n`;
        }
        
        if (metadatos.duracion) {
            markdown += `- **Duración:** ${this.formatearDuracion(metadatos.duracion)}\n`;
        }
        
        markdown += '\n---\n\n';
        markdown += '## Transcripción\n\n';
        
        // Formatear texto en párrafos
        const parrafos = this.dividirEnParrafos(texto);
        markdown += parrafos.join('\n\n');
        
        markdown += '\n\n---\n\n';
        markdown += `*Generado con VideoTR - ${fecha}*\n`;
        
        return this.normalizarSaltosLinea(markdown);
    }
    
    dividirEnParrafos(texto, longitudMaxima = 500) {
        // Dividir texto largo en párrafos legibles
        const oraciones = texto.match(/[^.!?]+[.!?]+/g) || [texto];
        const parrafos = [];
        let parrafoActual = '';
        
        oraciones.forEach(oracion => {
            if ((parrafoActual + oracion).length > longitudMaxima && parrafoActual.length > 0) {
                parrafos.push(parrafoActual.trim());
                parrafoActual = oracion;
            } else {
                parrafoActual += oracion;
            }
        });
        
        if (parrafoActual.trim()) {
            parrafos.push(parrafoActual.trim());
        }
        
        return parrafos;
    }
    
    formatearMotor(motor) {
        const motores = {
            'local': 'Whisper (Local)',
            'openai': 'OpenAI Whisper API',
            'deepgram': 'Deepgram',
            'assemblyai': 'AssemblyAI'
        };
        return motores[motor] || motor;
    }
    
    formatearIdioma(codigo) {
        const idiomas = {
            'es': 'Español',
            'en': 'Inglés',
            'fr': 'Francés',
            'de': 'Alemán',
            'it': 'Italiano',
            'pt': 'Portugués'
        };
        return idiomas[codigo] || codigo;
    }
    
    formatearDuracion(segundos) {
        const horas = Math.floor(segundos / 3600);
        const minutos = Math.floor((segundos % 3600) / 60);
        const segs = Math.floor(segundos % 60);
        
        if (horas > 0) {
            return `${horas}h ${minutos}m ${segs}s`;
        } else if (minutos > 0) {
            return `${minutos}m ${segs}s`;
        } else {
            return `${segs}s`;
        }
    }
    
    normalizarSaltosLinea(texto) {
        // Normalizar a LF (\n) únicamente
        return texto.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    }
    
    exportarConTimestamps(texto, segmentos) {
        // Exportar con marcas de tiempo (formato SRT-like)
        let resultado = '';
        
        segmentos.forEach((segmento, index) => {
            const inicio = this.formatearTiempo(segmento.inicio);
            const fin = this.formatearTiempo(segmento.fin);
            
            resultado += `[${inicio} - ${fin}]\n`;
            resultado += `${segmento.texto}\n\n`;
        });
        
        return this.normalizarSaltosLinea(resultado);
    }
    
    formatearTiempo(segundos) {
        const horas = Math.floor(segundos / 3600);
        const minutos = Math.floor((segundos % 3600) / 60);
        const segs = Math.floor(segundos % 60);
        const ms = Math.floor((segundos % 1) * 1000);
        
        return `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}:${String(segs).padStart(2, '0')}.${String(ms).padStart(3, '0')}`;
    }
}