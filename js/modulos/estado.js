// modulos/estado.js - Gestión del estado global de la aplicación
export class Estado {
    constructor() {
        this.estado = {
            videoActual: null,
            audioBuffer: null,
            transcripcion: '',
            metadatos: {},
            procesando: false,
            motor: 'local',
            modelo: 'base',
            idioma: 'auto',
            webgpuDisponible: false,
            modeloCargado: null,
            configuracion: {
                tema: 'auto',
                idiomaUI: 'es',
                usarWebGPU: true,
                cachearModelos: true
            }
        };
        
        this.observadores = new Map();
        this.cargarConfiguracionLocal();
    }
    
    get(clave) {
        return this.obtenerValorAnidado(this.estado, clave);
    }
    
    set(clave, valor) {
        const claveAnterior = this.get(clave);
        this.establecerValorAnidado(this.estado, clave, valor);
        
        // Notificar a los observadores
        if (this.observadores.has(clave)) {
            this.observadores.get(clave).forEach(callback => {
                callback(valor, claveAnterior);
            });
        }
        
        // Guardar configuración si cambió
        if (clave.startsWith('configuracion.')) {
            this.guardarConfiguracionLocal();
        }
    }
    
    observar(clave, callback) {
        if (!this.observadores.has(clave)) {
            this.observadores.set(clave, new Set());
        }
        this.observadores.get(clave).add(callback);
        
        // Retornar función para desobservar
        return () => {
            const callbacks = this.observadores.get(clave);
            if (callbacks) {
                callbacks.delete(callback);
                if (callbacks.size === 0) {
                    this.observadores.delete(clave);
                }
            }
        };
    }
    
    obtenerValorAnidado(objeto, clave) {
        const partes = clave.split('.');
        let valor = objeto;
        
        for (const parte of partes) {
            if (valor && typeof valor === 'object' && parte in valor) {
                valor = valor[parte];
            } else {
                return undefined;
            }
        }
        
        return valor;
    }
    
    establecerValorAnidado(objeto, clave, valor) {
        const partes = clave.split('.');
        const ultimaParte = partes.pop();
        
        let objetivo = objeto;
        for (const parte of partes) {
            if (!objetivo[parte] || typeof objetivo[parte] !== 'object') {
                objetivo[parte] = {};
            }
            objetivo = objetivo[parte];
        }
        
        objetivo[ultimaParte] = valor;
    }
    
    cargarConfiguracionLocal() {
        const configuracionGuardada = localStorage.getItem('videotr-configuracion');
        if (configuracionGuardada) {
            try {
                const config = JSON.parse(configuracionGuardada);
                Object.assign(this.estado.configuracion, config);
            } catch (error) {
                console.error('Error cargando configuración:', error);
            }
        }
    }
    
    guardarConfiguracionLocal() {
        try {
            localStorage.setItem('videotr-configuracion', JSON.stringify(this.estado.configuracion));
        } catch (error) {
            console.error('Error guardando configuración:', error);
        }
    }
    
    reset() {
        this.estado.videoActual = null;
        this.estado.audioBuffer = null;
        this.estado.transcripcion = '';
        this.estado.metadatos = {};
        this.estado.procesando = false;
    }
    
    exportar() {
        return JSON.parse(JSON.stringify(this.estado));
    }
    
    importar(estadoExterno) {
        Object.assign(this.estado, estadoExterno);
        
        // Notificar a todos los observadores
        this.observadores.forEach((callbacks, clave) => {
            const valor = this.get(clave);
            callbacks.forEach(callback => callback(valor, undefined));
        });
    }
}