// modulos/transcriptor.js - Orquestador de transcripción
import { MotorLocal } from './motor-local.js';
import { MotorAPI } from './motor-api.js';

export class Transcriptor {
    constructor() {
        this.motorLocal = new MotorLocal();
        this.motorAPI = new MotorAPI();
        this.worker = null;
    }
    
    async transcribir(audioData, opciones = {}) {
        const {
            motor = 'local',
            modelo = 'base',
            idioma = 'auto',
            apiKey = '',
            onProgress = () => {}
        } = opciones;
        
        const tiempoInicio = performance.now();
        
        try {
            let resultado;
            
            if (motor === 'local') {
                // Transcripción local con Whisper
                onProgress(10, 'Cargando modelo Whisper...');
                resultado = await this.transcribirLocal(audioData, modelo, idioma, onProgress);
            } else {
                // Transcripción con API
                if (!apiKey) {
                    throw new Error('Se requiere una clave API para este motor');
                }
                
                onProgress(10, `Preparando solicitud a ${motor}...`);
                resultado = await this.transcribirAPI(audioData, motor, apiKey, idioma, onProgress);
            }
            
            const tiempoProcesamiento = performance.now() - tiempoInicio;
            
            return {
                texto: resultado.texto,
                idioma: resultado.idioma || idioma,
                confianza: resultado.confianza || 1.0,
                segmentos: resultado.segmentos || [],
                tiempoProcesamiento: Math.round(tiempoProcesamiento)
            };
            
        } catch (error) {
            console.error('Error en transcripción:', error);
            throw new Error(`Error transcribiendo: ${error.message}`);
        }
    }
    
    async transcribirLocal(audioData, modelo, idioma, onProgress) {
        // Usar Web Worker para no bloquear UI
        if (!this.worker) {
            this.worker = new Worker('/js/workers/worker-transcribe.js', { type: 'module' });
        }
        
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('Timeout en transcripción local'));
            }, 300000); // 5 minutos timeout
            
            this.worker.onmessage = (event) => {
                const { tipo, datos } = event.data;
                
                switch (tipo) {
                    case 'progreso':
                        onProgress(datos.porcentaje, datos.mensaje);
                        break;
                        
                    case 'resultado':
                        clearTimeout(timeout);
                        resolve(datos);
                        break;
                        
                    case 'error':
                        clearTimeout(timeout);
                        reject(new Error(datos.mensaje));
                        break;
                }
            };
            
            // Enviar datos al worker
            this.worker.postMessage({
                tipo: 'transcribir',
                datos: {
                    audio: audioData.buffer,
                    modelo,
                    idioma,
                    usarWebGPU: localStorage.getItem('webgpu') !== 'false'
                }
            });
        });
    }
    
    async transcribirAPI(audioData, motor, apiKey, idioma, onProgress) {
        // Convertir audio a formato requerido por la API
        const audioBlob = new Blob([audioData.buffer], { type: 'audio/wav' });
        
        switch (motor) {
            case 'openai':
                return await this.motorAPI.transcribirOpenAI(audioBlob, apiKey, idioma, onProgress);
                
            case 'deepgram':
                return await this.motorAPI.transcribirDeepgram(audioBlob, apiKey, idioma, onProgress);
                
            case 'assemblyai':
                return await this.motorAPI.transcribirAssemblyAI(audioBlob, apiKey, idioma, onProgress);
                
            default:
                throw new Error(`Motor de API no soportado: ${motor}`);
        }
    }
    
    async transcribirPorSegmentos(audioData, opciones) {
        // Dividir audio largo en segmentos
        const segmentos = await this.dividirAudio(audioData, 30); // 30 segundos por segmento
        const resultados = [];
        
        for (let i = 0; i < segmentos.length; i++) {
            const porcentaje = (i / segmentos.length) * 100;
            opciones.onProgress(porcentaje, `Procesando segmento ${i + 1} de ${segmentos.length}`);
            
            const resultado = await this.transcribir(segmentos[i], opciones);
            resultados.push(resultado);
        }
        
        // Unir resultados
        return this.unirResultados(resultados);
    }
    
    async dividirAudio(audioData, duracionSegmento = 30) {
        const frecuencia = 16000;
        const muestrasPorSegmento = duracionSegmento * frecuencia;
        const segmentos = [];
        
        const datos = new Float32Array(audioData.buffer);
        
        for (let i = 0; i < datos.length; i += muestrasPorSegmento) {
            const fin = Math.min(i + muestrasPorSegmento, datos.length);
            const segmento = datos.slice(i, fin);
            
            segmentos.push({
                buffer: segmento.buffer,
                duration: segmento.length / frecuencia,
                sampleRate: frecuencia
            });
        }
        
        return segmentos;
    }
    
    unirResultados(resultados) {
        const textoCompleto = resultados.map(r => r.texto).join(' ');
        const segmentosCompletos = [];
        let offsetTiempo = 0;
        
        resultados.forEach(resultado => {
            if (resultado.segmentos) {
                resultado.segmentos.forEach(seg => {
                    segmentosCompletos.push({
                        ...seg,
                        inicio: seg.inicio + offsetTiempo,
                        fin: seg.fin + offsetTiempo
                    });
                });
            }
            offsetTiempo += resultado.duracion || 30;
        });
        
        return {
            texto: textoCompleto,
            segmentos: segmentosCompletos,
            idioma: resultados[0]?.idioma
        };
    }
    
    limpiar() {
        if (this.worker) {
            this.worker.terminate();
            this.worker = null;
        }
        this.motorLocal.limpiar();
    }
}