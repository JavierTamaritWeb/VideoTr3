// modulos/util-wav.js - Utilidades para trabajar con archivos WAV
export function crearWAV(audioData, sampleRate = 16000) {
    const length = audioData.length;
    const arrayBuffer = new ArrayBuffer(44 + length * 2);
    const view = new DataView(arrayBuffer);
    
    // Escribir cabecera RIFF
    const writeString = (offset, string) => {
        for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
        }
    };
    
    // RIFF chunk descriptor
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + length * 2, true); // Tamaño del archivo - 8
    writeString(8, 'WAVE');
    
    // fmt sub-chunk
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true); // Tamaño del sub-chunk
    view.setUint16(20, 1, true); // Formato de audio (PCM = 1)
    view.setUint16(22, 1, true); // Número de canales (Mono = 1)
    view.setUint32(24, sampleRate, true); // Frecuencia de muestreo
    view.setUint32(28, sampleRate * 2, true); // Byte rate
    view.setUint16(32, 2, true); // Block align
    view.setUint16(34, 16, true); // Bits por muestra
    
    // data sub-chunk
    writeString(36, 'data');
    view.setUint32(40, length * 2, true); // Tamaño de los datos
    
    // Escribir datos de audio (convertir Float32 a Int16)
    let offset = 44;
    for (let i = 0; i < length; i++) {
        const sample = Math.max(-1, Math.min(1, audioData[i]));
        view.setInt16(offset, sample * 0x7FFF, true);
        offset += 2;
    }
    
    return new Blob([arrayBuffer], { type: 'audio/wav' });
}

export function leerWAV(arrayBuffer) {
    const view = new DataView(arrayBuffer);
    
    // Verificar cabecera RIFF
    const riff = String.fromCharCode(
        view.getUint8(0),
        view.getUint8(1),
        view.getUint8(2),
        view.getUint8(3)
    );
    
    if (riff !== 'RIFF') {
        throw new Error('No es un archivo WAV válido');
    }
    
    // Verificar formato WAVE
    const wave = String.fromCharCode(
        view.getUint8(8),
        view.getUint8(9),
        view.getUint8(10),
        view.getUint8(11)
    );
    
    if (wave !== 'WAVE') {
        throw new Error('Formato WAV no válido');
    }
    
    // Leer formato
    const format = view.getUint16(20, true);
    const channels = view.getUint16(22, true);
    const sampleRate = view.getUint32(24, true);
    const bitsPerSample = view.getUint16(34, true);
    
    // Buscar chunk de datos
    let dataOffset = 12;
    let dataSize = 0;
    
    while (dataOffset < view.byteLength) {
        const chunkId = String.fromCharCode(
            view.getUint8(dataOffset),
            view.getUint8(dataOffset + 1),
            view.getUint8(dataOffset + 2),
            view.getUint8(dataOffset + 3)
        );
        
        const chunkSize = view.getUint32(dataOffset + 4, true);
        
        if (chunkId === 'data') {
            dataOffset += 8;
            dataSize = chunkSize;
            break;
        }
        
        dataOffset += 8 + chunkSize;
    }
    
    // Leer datos de audio
    const numSamples = dataSize / (bitsPerSample / 8);
    const audioData = new Float32Array(numSamples);
    
    for (let i = 0; i < numSamples; i++) {
        if (bitsPerSample === 16) {
            const sample = view.getInt16(dataOffset + i * 2, true);
            audioData[i] = sample / 0x7FFF;
        } else if (bitsPerSample === 8) {
            const sample = view.getUint8(dataOffset + i);
            audioData[i] = (sample - 128) / 128;
        }
    }
    
    return {
        format,
        channels,
        sampleRate,
        bitsPerSample,
        audioData,
        duration: numSamples / sampleRate
    };
}

export function validarWAV(arrayBuffer) {
    try {
        const view = new DataView(arrayBuffer);
        
        // Verificar tamaño mínimo
        if (arrayBuffer.byteLength < 44) {
            return {
                valido: false,
                error: 'Archivo demasiado pequeño para ser WAV'
            };
        }
        
        // Verificar cabecera RIFF
        const riff = String.fromCharCode(
            view.getUint8(0),
            view.getUint8(1),
            view.getUint8(2),
            view.getUint8(3)
        );
        
        if (riff !== 'RIFF') {
            return {
                valido: false,
                error: 'Cabecera RIFF no encontrada'
            };
        }
        
        // Verificar formato WAVE
        const wave = String.fromCharCode(
            view.getUint8(8),
            view.getUint8(9),
            view.getUint8(10),
            view.getUint8(11)
        );
        
        if (wave !== 'WAVE') {
            return {
                valido: false,
                error: 'Formato WAVE no encontrado'
            };
        }
        
        // Leer información del formato
        const format = view.getUint16(20, true);
        const channels = view.getUint16(22, true);
        const sampleRate = view.getUint32(24, true);
        const bitsPerSample = view.getUint16(34, true);
        
        return {
            valido: true,
            info: {
                formato: format === 1 ? 'PCM' : `Formato ${format}`,
                canales: channels,
                frecuencia: sampleRate,
                bits: bitsPerSample,
                tamaño: arrayBuffer.byteLength
            }
        };
        
    } catch (error) {
        return {
            valido: false,
            error: error.message
        };
    }
}

export function concatenarWAV(wavBuffers) {
    // Concatenar múltiples archivos WAV
    if (wavBuffers.length === 0) return null;
    if (wavBuffers.length === 1) return wavBuffers[0];
    
    // Leer todos los WAV
    const wavDatas = wavBuffers.map(buffer => leerWAV(buffer));
    
    // Verificar que todos tengan la misma frecuencia
    const sampleRate = wavDatas[0].sampleRate;
    const allSameSampleRate = wavDatas.every(wav => wav.sampleRate === sampleRate);
    
    if (!allSameSampleRate) {
        throw new Error('Todos los archivos WAV deben tener la misma frecuencia de muestreo');
    }
    
    // Calcular longitud total
    const totalLength = wavDatas.reduce((sum, wav) => sum + wav.audioData.length, 0);
    const concatenated = new Float32Array(totalLength);
    
    // Concatenar datos
    let offset = 0;
    wavDatas.forEach(wav => {
        concatenated.set(wav.audioData, offset);
        offset += wav.audioData.length;
    });
    
    // Crear nuevo WAV
    return crearWAV(concatenated, sampleRate);
}

export function recortarSilencio(audioData, umbral = 0.01) {
    // Encontrar primer sample no silencioso
    let inicio = 0;
    for (let i = 0; i < audioData.length; i++) {
        if (Math.abs(audioData[i]) > umbral) {
            inicio = i;
            break;
        }
    }
    
    // Encontrar último sample no silencioso
    let fin = audioData.length - 1;
    for (let i = audioData.length - 1; i >= 0; i--) {
        if (Math.abs(audioData[i]) > umbral) {
            fin = i;
            break;
        }
    }
    
    // Recortar
    return audioData.slice(inicio, fin + 1);
}