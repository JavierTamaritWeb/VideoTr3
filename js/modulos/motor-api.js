// modulos/motor-api.js - Motor de transcripción por API (BYOK)
export class MotorAPI {
    constructor() {
        this.endpoints = {
            openai: 'https://api.openai.com/v1/audio/transcriptions',
            deepgram: 'https://api.deepgram.com/v1/listen',
            assemblyai: 'https://api.assemblyai.com/v2'
        };
    }
    
    async transcribirOpenAI(audioBlob, apiKey, idioma, onProgress) {
        try {
            onProgress(20, 'Conectando con OpenAI Whisper API...');
            
            const formData = new FormData();
            formData.append('file', audioBlob, 'audio.wav');
            formData.append('model', 'whisper-1');
            
            if (idioma !== 'auto') {
                formData.append('language', this.mapearIdioma(idioma, 'openai'));
            }
            
            formData.append('response_format', 'verbose_json');
            
            onProgress(40, 'Enviando audio a OpenAI...');
            
            const response = await fetch(this.endpoints.openai, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`
                },
                body: formData
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error?.message || 'Error en API de OpenAI');
            }
            
            onProgress(80, 'Procesando respuesta...');
            
            const resultado = await response.json();
            
            return {
                texto: resultado.results?.channels[0]?.alternatives[0]?.transcript || '',
                idioma: resultado.results?.channels[0]?.detected_language || idioma,
                confianza: resultado.results?.channels[0]?.alternatives[0]?.confidence || 1.0,
                segmentos: this.procesarSegmentosDeepgram(resultado.results?.channels[0]?.alternatives[0]?.words || [])
            };
            
        } catch (error) {
            console.error('Error con Deepgram API:', error);
            throw new Error(`Deepgram API: ${error.message}`);
        }
    }
    
    async transcribirAssemblyAI(audioBlob, apiKey, idioma, onProgress) {
        try {
            onProgress(20, 'Subiendo audio a AssemblyAI...');
            
            // Primero subir el archivo
            const uploadResponse = await fetch('https://api.assemblyai.com/v2/upload', {
                method: 'POST',
                headers: {
                    'authorization': apiKey,
                    'content-type': 'audio/wav'
                },
                body: audioBlob
            });
            
            if (!uploadResponse.ok) {
                throw new Error('Error subiendo audio a AssemblyAI');
            }
            
            const { upload_url } = await uploadResponse.json();
            
            onProgress(40, 'Iniciando transcripción con AssemblyAI...');
            
            // Crear tarea de transcripción
            const transcriptResponse = await fetch(`${this.endpoints.assemblyai}/transcript`, {
                method: 'POST',
                headers: {
                    'authorization': apiKey,
                    'content-type': 'application/json'
                },
                body: JSON.stringify({
                    audio_url: upload_url,
                    language_code: this.mapearIdioma(idioma, 'assemblyai'),
                    punctuate: true,
                    format_text: true,
                    word_boost: [],
                    auto_highlights: true
                })
            });
            
            if (!transcriptResponse.ok) {
                throw new Error('Error iniciando transcripción en AssemblyAI');
            }
            
            const { id } = await transcriptResponse.json();
            
            onProgress(60, 'Esperando resultado de AssemblyAI...');
            
            // Polling para obtener resultado
            const resultado = await this.esperarResultadoAssemblyAI(id, apiKey, onProgress);
            
            return {
                texto: resultado.text || '',
                idioma: resultado.language_code || idioma,
                confianza: resultado.confidence || 1.0,
                segmentos: this.procesarSegmentosAssemblyAI(resultado.words || [])
            };
            
        } catch (error) {
            console.error('Error con AssemblyAI API:', error);
            throw new Error(`AssemblyAI API: ${error.message}`);
        }
    }
    
    async esperarResultadoAssemblyAI(id, apiKey, onProgress) {
        const maxIntentos = 60; // 5 minutos máximo
        let intentos = 0;
        
        while (intentos < maxIntentos) {
            const response = await fetch(`${this.endpoints.assemblyai}/transcript/${id}`, {
                headers: {
                    'authorization': apiKey
                }
            });
            
            if (!response.ok) {
                throw new Error('Error obteniendo resultado de AssemblyAI');
            }
            
            const resultado = await response.json();
            
            if (resultado.status === 'completed') {
                return resultado;
            } else if (resultado.status === 'error') {
                throw new Error(resultado.error || 'Error en transcripción');
            }
            
            // Actualizar progreso
            const progreso = 60 + (intentos / maxIntentos) * 30;
            onProgress(progreso, `Procesando... ${resultado.status}`);
            
            // Esperar 5 segundos antes de siguiente intento
            await new Promise(resolve => setTimeout(resolve, 5000));
            intentos++;
        }
        
        throw new Error('Timeout esperando resultado de AssemblyAI');
    }
    
    procesarSegmentosOpenAI(segments) {
        return segments.map(seg => ({
            texto: seg.text,
            inicio: seg.start,
            fin: seg.end,
            confianza: seg.avg_logprob ? Math.exp(seg.avg_logprob) : 1.0
        }));
    }
    
    procesarSegmentosDeepgram(words) {
        const segmentos = [];
        let segmentoActual = {
            texto: '',
            inicio: 0,
            fin: 0,
            palabras: []
        };
        
        words.forEach((word, index) => {
            segmentoActual.palabras.push(word.word);
            
            if (segmentoActual.inicio === 0) {
                segmentoActual.inicio = word.start;
            }
            segmentoActual.fin = word.end;
            
            // Crear nuevo segmento cada 10 palabras o al final
            if (segmentoActual.palabras.length >= 10 || index === words.length - 1) {
                segmentoActual.texto = segmentoActual.palabras.join(' ');
                segmentos.push({
                    texto: segmentoActual.texto,
                    inicio: segmentoActual.inicio,
                    fin: segmentoActual.fin,
                    confianza: word.confidence || 1.0
                });
                
                segmentoActual = {
                    texto: '',
                    inicio: 0,
                    fin: 0,
                    palabras: []
                };
            }
        });
        
        return segmentos;
    }
    
    procesarSegmentosAssemblyAI(words) {
        return this.procesarSegmentosDeepgram(words.map(w => ({
            word: w.text,
            start: w.start / 1000,
            end: w.end / 1000,
            confidence: w.confidence
        })));
    }
    
    mapearIdioma(idioma, servicio) {
        const mapeos = {
            openai: {
                'es': 'es',
                'en': 'en',
                'fr': 'fr',
                'de': 'de',
                'it': 'it',
                'pt': 'pt',
                'auto': null
            },
            deepgram: {
                'es': 'es',
                'en': 'en-US',
                'fr': 'fr',
                'de': 'de',
                'it': 'it',
                'pt': 'pt',
                'auto': 'es'
            },
            assemblyai: {
                'es': 'es',
                'en': 'en',
                'fr': 'fr',
                'de': 'de',
                'it': 'it',
                'pt': 'pt',
                'auto': 'es'
            }
        };
        
        return mapeos[servicio]?.[idioma] || 'es';
    }
    
    validarApiKey(apiKey, servicio) {
        if (!apiKey || apiKey.trim().length === 0) {
            return false;
        }
        
        // Validaciones básicas por servicio
        switch (servicio) {
            case 'openai':
                return apiKey.startsWith('sk-') && apiKey.length > 20;
            case 'deepgram':
                return apiKey.length > 20;
            case 'assemblyai':
                return apiKey.length > 20;
            default:
                return false;
        }
    }
}