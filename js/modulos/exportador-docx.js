// modulos/exportador-docx.js - Exportador a DOCX usando docx library
export class ExportadorDocx {
    async exportar(texto, metadatos = {}) {
        try {
            // Importar docx dinámicamente
            const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle } = await import('https://cdn.jsdelivr.net/npm/docx@8.5.0/+esm');
            
            // Limpiar texto de caracteres problemáticos
            texto = this.limpiarTexto(texto);
            
            const fecha = new Date().toLocaleString('es-ES');
            
            // Crear secciones del documento
            const children = [];
            
            // Título principal
            children.push(
                new Paragraph({
                    text: 'Transcripción de Audio',
                    heading: HeadingLevel.HEADING_1,
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 400 }
                })
            );
            
            // Sección de metadatos
            if (Object.keys(metadatos).length > 0) {
                children.push(
                    new Paragraph({
                        text: 'Información',
                        heading: HeadingLevel.HEADING_2,
                        spacing: { before: 200, after: 200 }
                    })
                );
                
                // Tabla de metadatos
                const filas = [];
                
                if (metadatos.archivo) {
                    filas.push(['Archivo original', metadatos.archivo]);
                }
                
                if (metadatos.motor) {
                    filas.push(['Motor de transcripción', this.formatearMotor(metadatos.motor)]);
                }
                
                if (metadatos.modelo) {
                    filas.push(['Modelo', metadatos.modelo]);
                }
                
                if (metadatos.idioma && metadatos.idioma !== 'auto') {
                    filas.push(['Idioma', this.formatearIdioma(metadatos.idioma)]);
                }
                
                filas.push(['Fecha de transcripción', fecha]);
                
                // Agregar párrafos con información
                filas.forEach(([clave, valor]) => {
                    children.push(
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: `${clave}: `,
                                    bold: true,
                                    size: 24
                                }),
                                new TextRun({
                                    text: valor,
                                    size: 24
                                })
                            ],
                            spacing: { after: 100 }
                        })
                    );
                });
                
                // Línea separadora
                children.push(
                    new Paragraph({
                        border: {
                            bottom: {
                                color: 'auto',
                                space: 1,
                                style: BorderStyle.SINGLE,
                                size: 6
                            }
                        },
                        spacing: { after: 400 }
                    })
                );
            }
            
            // Sección de transcripción
            children.push(
                new Paragraph({
                    text: 'Transcripción',
                    heading: HeadingLevel.HEADING_2,
                    spacing: { before: 200, after: 200 }
                })
            );
            
            // Dividir texto en párrafos
            const parrafos = this.dividirEnParrafos(texto);
            
            parrafos.forEach(parrafo => {
                children.push(
                    new Paragraph({
                        text: parrafo,
                        size: 24,
                        spacing: { after: 200, line: 360 },
                        alignment: AlignmentType.JUSTIFIED
                    })
                );
            });
            
            // Pie de página
            children.push(
                new Paragraph({
                    border: {
                        top: {
                            color: 'auto',
                            space: 1,
                            style: BorderStyle.SINGLE,
                            size: 6
                        }
                    },
                    spacing: { before: 400 }
                })
            );
            
            children.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: `Generado con VideoTR - ${fecha}`,
                            italics: true,
                            size: 20,
                            color: '666666'
                        })
                    ],
                    alignment: AlignmentType.CENTER,
                    spacing: { before: 200 }
                })
            );
            
            // Crear documento
            const doc = new Document({
                creator: 'VideoTR',
                title: 'Transcripción de Audio',
                description: 'Transcripción automática generada por VideoTR',
                sections: [{
                    properties: {
                        page: {
                            margin: {
                                top: 1440,
                                right: 1440,
                                bottom: 1440,
                                left: 1440
                            }
                        }
                    },
                    children: children
                }]
            });
            
            // Generar blob del documento
            const blob = await Packer.toBlob(doc);
            return blob;
            
        } catch (error) {
            console.error('Error generando DOCX:', error);
            
            // Fallback: generar DOCX simple sin librería
            return this.generarDocxSimple(texto, metadatos);
        }
    }
    
    generarDocxSimple(texto, metadatos) {
        // Método alternativo simple para generar DOCX básico
        // Este es un fallback muy básico que genera un archivo de texto
        // con extensión .docx (no es un DOCX real pero algunos programas lo pueden abrir)
        
        // Limpiar texto de caracteres problemáticos
        texto = this.limpiarTexto(texto);
        
        const fecha = new Date().toLocaleString('es-ES');
        let contenido = 'TRANSCRIPCIÓN DE AUDIO\n\n';
        
        if (Object.keys(metadatos).length > 0) {
            contenido += 'INFORMACIÓN\n';
            contenido += '═══════════\n\n';
            
            if (metadatos.archivo) {
                contenido += `Archivo original: ${metadatos.archivo}\n`;
            }
            
            if (metadatos.motor) {
                contenido += `Motor: ${this.formatearMotor(metadatos.motor)}\n`;
            }
            
            if (metadatos.modelo) {
                contenido += `Modelo: ${metadatos.modelo}\n`;
            }
            
            if (metadatos.idioma && metadatos.idioma !== 'auto') {
                contenido += `Idioma: ${this.formatearIdioma(metadatos.idioma)}\n`;
            }
            
            contenido += `Fecha: ${fecha}\n\n`;
            contenido += '─────────────────────────────────────\n\n';
        }
        
        contenido += 'TRANSCRIPCIÓN\n';
        contenido += '═════════════\n\n';
        
        const parrafos = this.dividirEnParrafos(texto);
        contenido += parrafos.join('\n\n');
        
        contenido += '\n\n─────────────────────────────────────\n';
        contenido += `Generado con VideoTR - ${fecha}\n`;
        
        return new Blob([contenido], { 
            type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
        });
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
    
    limpiarTexto(texto) {
        // Normalizar comillas tipográficas y otros caracteres problemáticos
        const reemplazos = {
            // Comillas tipográficas a comillas normales (usando códigos Unicode)
            '\u2018': "'",  // Comilla izquierda (')
            '\u2019': "'",  // Comilla derecha (')
            '\u201C': '"',  // Comilla doble izquierda (")
            '\u201D': '"',  // Comilla doble derecha (")
            // Guiones largos
            '\u2014': '-',  // Em dash (—)
            '\u2013': '-',  // En dash (–)
            // Espacios especiales
            '\u00A0': ' ',  // Non-breaking space
            '\u2009': ' ',  // Thin space
            '\u202F': ' ',  // Narrow no-break space
            // Puntos suspensivos
            '\u2026': '...'  // Horizontal ellipsis (…)
        };
        
        let textoLimpio = texto;
        
        // Aplicar reemplazos
        for (const [original, reemplazo] of Object.entries(reemplazos)) {
            textoLimpio = textoLimpio.replace(new RegExp(original, 'g'), reemplazo);
        }
        
        // Normalizar espacios múltiples
        textoLimpio = textoLimpio.replace(/\s+/g, ' ');
        
        return textoLimpio.trim();
    }
}