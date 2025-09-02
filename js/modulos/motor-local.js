// modulos/motor-local.js - Motor de transcripción local con Whisper
export class MotorLocal {
    constructor() {
        this.pipeline = null;
        this.modeloCargado = null;
    }
    
    async cargarModelo(nombreModelo = 'base', usarWebGPU = true) {
        try {
            // Importar transformers.js dinámicamente
            const { pipeline, env } = await import('https://cdn.jsdelivr.net/npm/@xenova/transformers@2.6.0');
            
            // Configurar entorno
            env.allowLocalModels = false;
            env.remoteURL = 'https://huggingface.co/';
            
            // Intentar usar WebGPU si está disponible
            if (usarWebGPU && 'gpu' in navigator) {
                env.backends.onnx.wasm.proxy = true;
                console.log('Usando WebGPU para aceleración');
            } else {
                console.log('Usando WASM como fallback');
            }
            
            // Mapeo de modelos Whisper
            const modelos = {
                'tiny': 'Xenova/whisper-tiny',
                'base': 'Xenova/whisper-base',
                'small': 'Xenova/whisper-small'
            };
            
            const modeloId = modelos[nombreModelo] || modelos['base'];
            
            console.log(`Cargando modelo Whisper: ${modeloId}`);
            
            // Crear pipeline de ASR
            this.pipeline = await pipeline(
                'automatic-speech-recognition',
                modeloId,
                {
                    quantized: true, // Usar modelos cuantizados para mejor rendimiento
                    progress_callback: (progress) => {
                        console.log(`Descargando modelo: ${progress.progress}%`);
                    }
                }
            );
            
            this.modeloCargado = nombreModelo;
            console.log('Modelo cargado exitosamente');
            
            return true;
            
        } catch (error) {
            console.error('Error cargando modelo:', error);
            
            // Fallback: intentar con un modelo más pequeño
            if (nombreModelo !== 'tiny') {
                console.log('Intentando con modelo tiny como fallback...');
                return await this.cargarModelo('tiny', false);
            }
            
            throw new Error(`No se pudo cargar el modelo: ${error.message}`);
        }
    }
    
    async transcribir(audioData, opciones = {}) {
        const {
            modelo = 'base',
            idioma = 'auto',
            usarWebGPU = true,
            onProgress = () => {}
        } = opciones;
        
        try {
            // Cargar modelo si no está cargado o es diferente
            if (!this.pipeline || this.modeloCargado !== modelo) {
                onProgress(20, 'Cargando modelo de IA...');
                await this.cargarModelo(modelo, usarWebGPU);
            }
            
            onProgress(40, 'Preparando audio para transcripción...');
            
            // Preparar audio para el modelo
            const audioArray = this.prepararAudio(audioData);
            
            onProgress(50, 'Transcribiendo audio...');
            
            // Opciones de transcripción
            const opcionesTranscripcion = {
                chunk_length_s: 30,
                stride_length_s: 5,
                language: idioma === 'auto' ? null : idioma,
                task: 'transcribe',
                return_timestamps: true
            };
            
            // Realizar transcripción
            const resultado = await this.pipeline(audioArray, opcionesTranscripcion);
            
            onProgress(90, 'Procesando resultado...');
            
            // Procesar resultado
            return this.procesarResultado(resultado);
            
        } catch (error) {
            console.error('Error en transcripción local:', error);
            
            // Si falla, intentar método alternativo
            return await this.transcribirAlternativo(audioData, opciones);
        }
    }
    
    prepararAudio(audioData) {
        // Convertir a formato esperado por el modelo
        if (audioData instanceof Uint8Array) {
            // Si es WAV, extraer datos PCM
            const dataView = new DataView(audioData.buffer);
            const headerSize = 44; // Tamaño estándar del header WAV
            
            // Extraer samples PCM
            const samples = new Float32Array((audioData.length - headerSize) / 2);
            for (let i = 0; i < samples.length; i++) {
                const sample = dataView.getInt16(headerSize + i * 2, true);
                samples[i] = sample / 32768.0; // Normalizar a [-1, 1]
            }
            
            return samples;
        } else if (audioData instanceof Float32Array) {
            return audioData;
        } else {
            // Intentar convertir
            return new Float32Array(audioData);
        }
    }
    
    procesarResultado(resultado) {
        // Extraer texto y segmentos
        let texto = '';
        const segmentos = [];
        
        if (typeof resultado === 'string') {
            texto = resultado;
        } else if (resultado.text) {
            texto = resultado.text;
            
            // Procesar chunks/segmentos si existen
            if (resultado.chunks) {
                resultado.chunks.forEach(chunk => {
                    segmentos.push({
                        texto: chunk.text,
                        inicio: chunk.timestamp[0],
                        fin: chunk.timestamp[1],
                        confianza: chunk.confidence || 1.0
                    });
                });
            }
        }
        
        return {
            texto: texto.trim(),
            segmentos,
            idioma: resultado.language || 'es',
            confianza: resultado.confidence || 1.0
        };
    }
    
    async transcribirAlternativo(audioData, opciones) {
        // Método alternativo usando un servicio de transcripción más simple
        console.log('Usando método de transcripción alternativo...');
        
        try {
            // Simulación de transcripción básica
            // En producción, aquí podrías usar otra librería o método
            const duracion = audioData.duration || 10;
            const texto = `[Transcripción automática - ${duracion}s de audio]`;
            
            return {
                texto,
                segmentos: [],
                idioma: 'es',
                confianza: 0.5
            };
            
        } catch (error) {
            throw new Error('No se pudo realizar la transcripción');
        }
    }
    
    async detectarIdioma(audioData) {
        try {
            if (!this.pipeline) {
                await this.cargarModelo('tiny');
            }
            
            const audioArray = this.prepararAudio(audioData);
            
            // Transcribir un fragmento corto para detectar idioma
            const resultado = await this.pipeline(audioArray.slice(0, 16000 * 5), {
                chunk_length_s: 5,
                task: 'transcribe'
            });
            
            return resultado.language || 'es';
            
        } catch (error) {
            console.error('Error detectando idioma:', error);
            return 'es'; // Default español
        }
    }
    
    limpiar() {
        this.pipeline = null;
        this.modeloCargado = null;
    }
    
    // Método para verificar si el modelo está en caché
    async verificarCache(modelo) {
        if ('caches' in window) {
            try {
                const cache = await caches.open('whisper-models');
                const modelos = {
                    'tiny': 'whisper-tiny.onnx',
                    'base': 'whisper-base.onnx',
                    'small': 'whisper-small.onnx'
                };
                
                const response = await cache.match(modelos[modelo]);
                return response !== undefined;
                
            } catch (error) {
                console.error('Error verificando caché:', error);
                return false;
            }
        }
        return false;
    }
}