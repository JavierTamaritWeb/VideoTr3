// modulos/exportador-rtf.js - Exportador a RTF con soporte Unicode
export class ExportadorRtf {
    exportar(texto, metadatos = {}) {
        const fecha = new Date().toLocaleString('es-ES');
        
        // Construir documento RTF
        let rtf = '{\\rtf1\\ansi\\deff0 {\\fonttbl{\\f0 Times New Roman;}}\\f0\\fs24';
        
        // Título
        rtf += '\\par\\b\\fs32 Transcripción de Audio\\b0\\fs24\\par\\par';
        
        // Metadatos
        if (Object.keys(metadatos).length > 0) {
            rtf += '\\b Información:\\b0\\par';
            
            if (metadatos.archivo) {
                rtf += `\\par Archivo original: ${this.escaparRtf(metadatos.archivo)}`;
            }
            
            if (metadatos.motor) {
                rtf += `\\par Motor: ${this.escaparRtf(this.formatearMotor(metadatos.motor))}`;
            }
            
            if (metadatos.modelo) {
                rtf += `\\par Modelo: ${this.escaparRtf(metadatos.modelo)}`;
            }
            
            if (metadatos.idioma && metadatos.idioma !== 'auto') {
                rtf += `\\par Idioma: ${this.escaparRtf(this.formatearIdioma(metadatos.idioma))}`;
            }
            
            rtf += `\\par Fecha: ${this.escaparRtf(fecha)}`;
            rtf += '\\par\\par\\line\\par';
        }
        
        // Contenido principal
        rtf += '\\b Transcripción:\\b0\\par\\par';
        
        // Procesar texto y dividir en párrafos
        const parrafos = this.dividirEnParrafos(texto);
        parrafos.forEach(parrafo => {
            rtf += this.escaparRtf(parrafo) + '\\par\\par';
        });
        
        // Pie de página
        rtf += '\\par\\line\\par';
        rtf += `\\i\\fs20 Generado con VideoTR - ${this.escaparRtf(fecha)}\\i0\\fs24`;
        
        // Cerrar documento RTF
        rtf += '}';
        
        return rtf;
    }
    
    escaparRtf(texto) {
        if (!texto) return '';
        
        // Escapar caracteres especiales RTF
        let escapado = texto
            .replace(/\\/g, '\\\\')
            .replace(/\{/g, '\\{')
            .replace(/\}/g, '\\}')
            .replace(/\n/g, '\\par ')
            .replace(/\t/g, '\\tab ');
        
        // Convertir caracteres Unicode a notación RTF
        escapado = this.convertirUnicode(escapado);
        
        return escapado;
    }
    
    convertirUnicode(texto) {
        let resultado = '';
        
        for (let i = 0; i < texto.length; i++) {
            const char = texto[i];
            const codigo = char.charCodeAt(0);
            
            if (codigo > 127) {
                // Caracteres especiales comunes en español usando notación hexadecimal RTF
                const mapaEspecial = {
                    'á': '\\\'e1',
                    'é': '\\\'e9',
                    'í': '\\\'ed',
                    'ó': '\\\'f3',
                    'ú': '\\\'fa',
                    'Á': '\\\'c1',
                    'É': '\\\'c9',
                    'Í': '\\\'cd',
                    'Ó': '\\\'d3',
                    'Ú': '\\\'da',
                    'ñ': '\\\'f1',
                    'Ñ': '\\\'d1',
                    '¿': '\\\'bf',
                    '¡': '\\\'a1',
                    'ü': '\\\'fc',
                    'Ü': '\\\'dc',
                    '€': '\\u8364?',
                    '—': '\\emdash ',
                    '–': '\\endash ',
                    '"': '\\ldblquote ',
                    '"': '\\rdblquote ',
                    '\u2018': '\\lquote ',  // Comilla izquierda (')
                    '\u2019': '\\rquote ',  // Comilla derecha (')
                    '«': '\\\'ab',
                    '»': '\\\'bb',
                    '°': '\\\'b0',
                    'ª': '\\\'aa',
                    'º': '\\\'ba'
                };
                
                if (mapaEspecial[char]) {
                    resultado += mapaEspecial[char];
                } else {
                    // Usar notación Unicode genérica para otros caracteres
                    resultado += `\\u${codigo}?`;
                }
            } else {
                resultado += char;
            }
        }
        
        return resultado;
    }
    
    dividirEnParrafos(texto, longitudMaxima = 500) {
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
    
    // Crear tabla en RTF
    crearTabla(datos) {
        let rtf = '\\par{\\trowd\\trgaph70\\trleft-70';
        
        const numColumnas = datos[0].length;
        const anchoCelda = Math.floor(9000 / numColumnas); // Ancho total ~9000
        
        // Definir celdas
        for (let i = 1; i <= numColumnas; i++) {
            rtf += `\\cellx${anchoCelda * i}`;
        }
        
        // Agregar filas
        datos.forEach((fila, indexFila) => {
            fila.forEach((celda, indexCelda) => {
                if (indexFila === 0) {
                    // Encabezados en negrita
                    rtf += `\\intbl\\b ${this.escaparRtf(celda)}\\b0\\cell`;
                } else {
                    rtf += `\\intbl ${this.escaparRtf(celda)}\\cell`;
                }
            });
            rtf += '\\row';
        });
        
        rtf += '}\\par';
        return rtf;
    }
}
