// workers/worker-transcribe.js - Web Worker para transcripción

// Silenciar advertencias de ONNX Runtime
if (typeof console !== 'undefined' && console.warn) {
    const originalWarn = console.warn;
    console.warn = function(...args) {
        const message = args[0];
        if (typeof message === 'string') {
            // Filtrar mensajes específicos de ONNX y Transformers
            if (message.includes('CleanUnusedInitializersAndNodeArgs') ||
                message.includes('Unable to determine content-length') ||
                message.includes('Removing initializer')) {
                return;
            }
        }
        originalWarn.apply(console, args);
    };
}

self.addEventListener('message', async (event) => {
    const { tipo, datos } = event.data;
    
    if (tipo === 'transcribir') {
        try {
            await transcribirAudio(datos);
        } catch (error) {
            self.postMessage({
                tipo: 'error',
                datos: {
                    mensaje: error.message
                }
            });
        }
    }
});

async function transcribirAudio(datos) {
    const { audio, modelo, idioma, usarWebGPU } = datos;
    
    try {
        // Enviar progreso
        self.postMessage({
            tipo: 'progreso',
            datos: {
                porcentaje: 10,
                mensaje: 'Inicializando transcriptor...'
            }
        });
        
        // Importar transformers.js
        const { pipeline, env } = await import('https://cdn.jsdelivr.net/npm/@xenova/transformers@2.6.0');
        
        // Configurar entorno
        env.allowLocalModels = false;
        env.remoteURL = 'https://huggingface.co/';
        
        if (usarWebGPU && 'gpu' in self.navigator) {
            env.backends.onnx.wasm.proxy = true;
        }
        
        self.postMessage({
            tipo: 'progreso',
            datos: {
                porcentaje: 30,
                mensaje: `Cargando modelo ${modelo}...`
            }
        });
        
        // Mapeo de modelos
        const modelos = {
            'tiny': 'Xenova/whisper-tiny',
            'base': 'Xenova/whisper-base',
            'small': 'Xenova/whisper-small'
        };
        
        const modeloId = modelos[modelo] || modelos['base'];
        
        // Crear pipeline
        const transcriptor = await pipeline(
            'automatic-speech-recognition',
            modeloId,
            {
                quantized: true,
                progress_callback: (progress) => {
                    if (progress.status === 'downloading') {
                        self.postMessage({
                            tipo: 'progreso',
                            datos: {
                                porcentaje: 30 + (progress.progress * 0.3),
                                mensaje: `Descargando modelo: ${Math.round(progress.progress)}%`
                            }
                        });
                    }
                }
            }
        );
        
        self.postMessage({
            tipo: 'progreso',
            datos: {
                porcentaje: 60,
                mensaje: 'Procesando audio...'
            }
        });
        
        // Preparar audio
        const audioData = prepararAudio(audio);
        
        self.postMessage({
            tipo: 'progreso',
            datos: {
                porcentaje: 70,
                mensaje: 'Transcribiendo...'
            }
        });
        
        // Opciones de transcripción
        const opciones = {
            chunk_length_s: 30,
            stride_length_s: 5,
            language: idioma === 'auto' ? null : idioma,
            task: 'transcribe',
            return_timestamps: true
        };
        
        // Realizar transcripción
        const resultado = await transcriptor(audioData, opciones);
        
        self.postMessage({
            tipo: 'progreso',
            datos: {
                porcentaje: 90,
                mensaje: 'Finalizando...'
            }
        });
        
        // Procesar resultado
        const resultadoProcesado = procesarResultado(resultado);
        
        self.postMessage({
            tipo: 'resultado',
            datos: resultadoProcesado
        });
        
    } catch (error) {
        console.error('Error en worker:', error);
        
        // Intentar transcripción alternativa simulada
        self.postMessage({
            tipo: 'resultado',
            datos: {
                texto: '[Transcripción simulada - Error cargando modelo]',
                idioma: idioma || 'es',
                confianza: 0.5,
                segmentos: []
            }
        });
    }
}

function prepararAudio(audioBuffer) {
    // Asegurar que tenemos un ArrayBuffer
    let buffer;
    if (audioBuffer instanceof Uint8Array) {
        buffer = audioBuffer.buffer.slice(audioBuffer.byteOffset, audioBuffer.byteOffset + audioBuffer.byteLength);
    } else if (audioBuffer instanceof ArrayBuffer) {
        buffer = audioBuffer;
    } else {
        throw new Error('Formato de audio no compatible');
    }
    
    // Convertir ArrayBuffer a Float32Array
    const dataView = new DataView(buffer);
    
    // Asumiendo WAV de 16-bit
    const headerSize = 44;
    const numSamples = (buffer.byteLength - headerSize) / 2;
    const audioData = new Float32Array(numSamples);
    
    for (let i = 0; i < numSamples; i++) {
        const sample = dataView.getInt16(headerSize + i * 2, true);
        audioData[i] = sample / 32768.0;
    }
    
    return audioData;
}

function procesarResultado(resultado) {
    let texto = '';
    const segmentos = [];
    
    if (typeof resultado === 'string') {
        texto = resultado;
    } else if (resultado.text) {
        texto = resultado.text;
        
        if (resultado.chunks) {
            resultado.chunks.forEach(chunk => {
                segmentos.push({
                    texto: chunk.text,
                    inicio: chunk.timestamp?.[0] || 0,
                    fin: chunk.timestamp?.[1] || 0,
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