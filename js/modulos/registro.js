// modulos/registro.js - Gestión del registro con IndexedDB
export class Registro {
    constructor() {
        this.db = null;
        this.dbNombre = 'VideoTR_DB';
        this.dbVersion = 1;
    }
    
    async inicializar() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbNombre, this.dbVersion);
            
            request.onerror = () => {
                reject(new Error('Error abriendo IndexedDB'));
            };
            
            request.onsuccess = () => {
                this.db = request.result;
                console.log('IndexedDB inicializada correctamente');
                resolve();
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Crear tabla de entradas
                if (!db.objectStoreNames.contains('entradas')) {
                    const entradasStore = db.createObjectStore('entradas', { 
                        keyPath: 'id', 
                        autoIncrement: true 
                    });
                    entradasStore.createIndex('fecha', 'fecha', { unique: false });
                    entradasStore.createIndex('nombre', 'nombre', { unique: false });
                }
                
                // Crear tabla de salidas
                if (!db.objectStoreNames.contains('salidas')) {
                    const salidasStore = db.createObjectStore('salidas', { 
                        keyPath: 'id', 
                        autoIncrement: true 
                    });
                    salidasStore.createIndex('fecha', 'fecha', { unique: false });
                    salidasStore.createIndex('tipo', 'tipo', { unique: false });
                    salidasStore.createIndex('idEntrada', 'idEntrada', { unique: false });
                }
            };
        });
    }
    
    async registrarEntrada(datos) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['entradas'], 'readwrite');
            const store = transaction.objectStore('entradas');
            
            const entrada = {
                ...datos,
                fecha: new Date().toISOString(),
                tipo: 'entrada'
            };
            
            const request = store.add(entrada);
            
            request.onsuccess = () => {
                console.log('Entrada registrada:', entrada);
                resolve(request.result);
            };
            
            request.onerror = () => {
                reject(new Error('Error registrando entrada'));
            };
        });
    }
    
    async registrarSalida(datos) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['salidas'], 'readwrite');
            const store = transaction.objectStore('salidas');
            
            const salida = {
                ...datos,
                fecha: new Date().toISOString()
            };
            
            const request = store.add(salida);
            
            request.onsuccess = () => {
                console.log('Salida registrada:', salida);
                resolve(request.result);
            };
            
            request.onerror = () => {
                reject(new Error('Error registrando salida'));
            };
        });
    }
    
    async listar(limite = 100) {
        const registros = [];
        
        // Obtener entradas
        const entradas = await this.obtenerRegistros('entradas', limite);
        registros.push(...entradas);
        
        // Obtener salidas
        const salidas = await this.obtenerRegistros('salidas', limite);
        registros.push(...salidas);
        
        // Ordenar por fecha descendente
        registros.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
        
        return registros.slice(0, limite);
    }
    
    async obtenerRegistros(tabla, limite) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([tabla], 'readonly');
            const store = transaction.objectStore(tabla);
            const index = store.index('fecha');
            
            const registros = [];
            let contador = 0;
            
            const request = index.openCursor(null, 'prev');
            
            request.onsuccess = (event) => {
                const cursor = event.target.result;
                
                if (cursor && contador < limite) {
                    registros.push(cursor.value);
                    contador++;
                    cursor.continue();
                } else {
                    resolve(registros);
                }
            };
            
            request.onerror = () => {
                reject(new Error(`Error obteniendo registros de ${tabla}`));
            };
        });
    }
    
    async buscar(termino) {
        const todosRegistros = await this.listar(1000);
        
        return todosRegistros.filter(registro => {
            const campos = [
                registro.nombre,
                registro.tipo,
                registro.motor,
                registro.modelo,
                registro.idioma
            ].filter(Boolean).join(' ').toLowerCase();
            
            return campos.includes(termino.toLowerCase());
        });
    }
    
    async obtenerEstadisticas() {
        const registros = await this.listar(1000);
        
        const estadisticas = {
            totalEntradas: 0,
            totalSalidas: 0,
            tamañoTotal: 0,
            motoresUsados: new Set(),
            formatosExportados: {},
            archivosProTipo: {}
        };
        
        registros.forEach(registro => {
            if (registro.tipo === 'entrada') {
                estadisticas.totalEntradas++;
            } else {
                estadisticas.totalSalidas++;
                
                if (registro.tipo) {
                    estadisticas.formatosExportados[registro.tipo] = 
                        (estadisticas.formatosExportados[registro.tipo] || 0) + 1;
                }
            }
            
            if (registro.tamaño) {
                estadisticas.tamañoTotal += registro.tamaño;
            }
            
            if (registro.motor) {
                estadisticas.motoresUsados.add(registro.motor);
            }
            
            const extension = registro.nombre?.split('.').pop();
            if (extension) {
                estadisticas.archivosProTipo[extension] = 
                    (estadisticas.archivosProTipo[extension] || 0) + 1;
            }
        });
        
        estadisticas.motoresUsados = Array.from(estadisticas.motoresUsados);
        
        return estadisticas;
    }
    
    async exportarCSV() {
        const registros = await this.listar(10000);
        
        const headers = ['Fecha', 'Tipo', 'Nombre', 'Tamaño (KB)', 'Motor', 'Modelo', 'Idioma'];
        const rows = registros.map(r => [
            new Date(r.fecha).toLocaleString('es-ES'),
            r.tipo || '',
            r.nombre || '',
            r.tamaño ? (r.tamaño / 1024).toFixed(2) : '',
            r.motor || '',
            r.modelo || '',
            r.idioma || ''
        ]);
        
        // Construir CSV
        const csv = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');
        
        return csv;
    }
    
    async exportarJSON() {
        const registros = await this.listar(10000);
        const estadisticas = await this.obtenerEstadisticas();
        
        return JSON.stringify({
            exportadoEn: new Date().toISOString(),
            version: '1.0.0',
            estadisticas,
            registros
        }, null, 2);
    }
    
    async limpiar() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['entradas', 'salidas'], 'readwrite');
            
            const entradasStore = transaction.objectStore('entradas');
            const salidasStore = transaction.objectStore('salidas');
            
            const clearEntradas = entradasStore.clear();
            const clearSalidas = salidasStore.clear();
            
            transaction.oncomplete = () => {
                console.log('Registro limpiado completamente');
                resolve();
            };
            
            transaction.onerror = () => {
                reject(new Error('Error limpiando registro'));
            };
        });
    }
    
    async eliminarRegistro(id, tabla) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([tabla], 'readwrite');
            const store = transaction.objectStore(tabla);
            
            const request = store.delete(id);
            
            request.onsuccess = () => {
                console.log(`Registro ${id} eliminado de ${tabla}`);
                resolve();
            };
            
            request.onerror = () => {
                reject(new Error(`Error eliminando registro ${id}`));
            };
        });
    }
}