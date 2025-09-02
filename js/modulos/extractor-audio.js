// modulos/extractor-audio.js - Extracción de audio de vídeos
import { crearWAV } from './util-wav.js';

export class ExtractorAudio {
    constructor() {
        this.audioContext = null;
        this.frecuenciaObjetivo = 16000; // 16 kHz para Whisper
    }
    
    async extraer(archivo) {
        // El método extraerConWebAudio ya funciona correctamente
        console.log('Extrayendo audio con Web Audio API...');
        return await this.extraerConWebAudio(archivo);
    }
    
    async extraerConWebAudio(archivo) {
        // Método alternativo usando Web Audio API
        const tiempoInicio = performance.now();
        
        try {
            // Leer archivo como ArrayBuffer
            const arrayBuffer = await archivo.arrayBuffer();
            
            // Crear AudioContext
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }
            
            // Decodificar audio
            const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
            
            // Crear OfflineAudioContext para resamplear
            const offlineContext = new OfflineAudioContext(
                1, // Mono
                Math.ceil(audioBuffer.duration * this.frecuenciaObjetivo),
                this.frecuenciaObjetivo
            );
            
            // Crear buffer source
            const source = offlineContext.createBufferSource();
            source.buffer = audioBuffer;
            
            // Si es estéreo, convertir a mono
            if (audioBuffer.numberOfChannels > 1) {
                const merger = offlineContext.createChannelMerger(1);
                source.connect(merger);
                merger.connect(offlineContext.destination);
            } else {
                source.connect(offlineContext.destination);
            }
            
            // Iniciar renderizado
            source.start();
            const audioResampleado = await offlineContext.startRendering();
            
            // Obtener datos de audio
            const audioData = audioResampleado.getChannelData(0);
            
            // Normalizar
            const audioNormalizado = this.normalizarAudio(audioData);
            
            // Crear WAV
            const wavBlob = crearWAV(audioNormalizado, this.frecuenciaObjetivo);
            const wavArrayBuffer = await wavBlob.arrayBuffer();
            
            const tiempoProcesamiento = performance.now() - tiempoInicio;
            
            return {
                buffer: new Uint8Array(wavArrayBuffer),
                duration: audioBuffer.duration,
                sampleRate: this.frecuenciaObjetivo,
                channels: 1,
                samples: audioNormalizado.length,
                tamaño: wavArrayBuffer.byteLength,
                tiempoProcesamiento: Math.round(tiempoProcesamiento)
            };
            
        } catch (error) {
            console.error('Error con Web Audio API:', error);
            throw new Error(`Error procesando audio: ${error.message}`);
        }
    }
    
    normalizarAudio(audioData) {
        // Encontrar el valor máximo absoluto
        let max = 0;
        for (let i = 0; i < audioData.length; i++) {
            const abs = Math.abs(audioData[i]);
            if (abs > max) max = abs;
        }
        
        // Si el audio está muy bajo, normalizar
        if (max < 0.1) {
            const factor = 0.95 / max;
            const normalizado = new Float32Array(audioData.length);
            for (let i = 0; i < audioData.length; i++) {
                normalizado[i] = audioData[i] * factor;
            }
            return normalizado;
        }
        
        return audioData;
    }
    
    async extraerSegmentos(audioBuffer, tamañoSegmento = 30) {
        // Dividir audio en segmentos para procesamiento
        const frecuencia = this.frecuenciaObjetivo;
        const muestrasPortSegmento = tamañoSegmento * frecuencia;
        const segmentos = [];
        
        for (let i = 0; i < audioBuffer.length; i += muestrasPortSegmento) {
            const fin = Math.min(i + muestrasPortSegmento, audioBuffer.length);
            const segmento = audioBuffer.slice(i, fin);
            
            segmentos.push({
                datos: segmento,
                inicio: i / frecuencia,
                duracion: segmento.length / frecuencia
            });
        }
        
        return segmentos;
    }
    
    aplicarFiltro(audioData, tipo = 'pasabajos') {
        // Aplicar filtro simple para reducir ruido
        const filtrado = new Float32Array(audioData.length);
        
        if (tipo === 'pasabajos') {
            // Filtro paso bajo simple
            filtrado[0] = audioData[0];
            for (let i = 1; i < audioData.length; i++) {
                filtrado[i] = 0.9 * filtrado[i - 1] + 0.1 * audioData[i];
            }
        } else if (tipo === 'reduccionRuido') {
            // Reducción de ruido básica
            const umbral = 0.01;
            for (let i = 0; i < audioData.length; i++) {
                filtrado[i] = Math.abs(audioData[i]) < umbral ? 0 : audioData[i];
            }
        }
        
        return filtrado;
    }
    
    detectarSilencio(audioData, umbral = 0.01, duracionMinima = 0.3) {
        // Detectar segmentos de silencio
        const frecuencia = this.frecuenciaObjetivo;
        const muestrasMinimas = duracionMinima * frecuencia;
        const silencios = [];
        
        let inicioSilencio = -1;
        let contadorSilencio = 0;
        
        for (let i = 0; i < audioData.length; i++) {
            if (Math.abs(audioData[i]) < umbral) {
                if (inicioSilencio === -1) {
                    inicioSilencio = i;
                }
                contadorSilencio++;
            } else {
                if (contadorSilencio >= muestrasMinimas) {
                    silencios.push({
                        inicio: inicioSilencio / frecuencia,
                        fin: i / frecuencia,
                        duracion: contadorSilencio / frecuencia
                    });
                }
                inicioSilencio = -1;
                contadorSilencio = 0;
            }
        }
        
        // Verificar último segmento
        if (contadorSilencio >= muestrasMinimas) {
            silencios.push({
                inicio: inicioSilencio / frecuencia,
                fin: audioData.length / frecuencia,
                duracion: contadorSilencio / frecuencia
            });
        }
        
        return silencios;
    }
    
    calcularRMS(audioData) {
        // Calcular Root Mean Square (volumen promedio)
        let suma = 0;
        for (let i = 0; i < audioData.length; i++) {
            suma += audioData[i] * audioData[i];
        }
        return Math.sqrt(suma / audioData.length);
    }
    
    ajustarVolumen(audioData, factorGanancia = 1.0) {
        const ajustado = new Float32Array(audioData.length);
        for (let i = 0; i < audioData.length; i++) {
            ajustado[i] = Math.max(-1, Math.min(1, audioData[i] * factorGanancia));
        }
        return ajustado;
    }
}