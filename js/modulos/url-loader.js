// modulos/url-loader.js - Carga de vídeos desde URLs de redes sociales
import { mostrarNotificacion } from './util-archivo.js';

export class URLLoader {
    constructor() {
        this.MAX_DURATION_MIN = 10; // 10 minutos máximo
        this.MAX_SIZE_MB = 100; // 100 MB máximo
        this.intentosPorMinuto = new Map(); // Rate limiting simple
        this.MAX_INTENTOS_POR_MINUTO = 5;
    }

    /**
     * Valida si la URL es de una plataforma soportada
     * @param {string} url - URL a validar
     * @throws {Error} Si la URL no es válida o no está soportada
     */
    validarUrlSoportada(url) {
        const regex = /^https?:\/\/(www\.)?(instagram\.com|tiktok\.com|youtu\.be|youtube\.com)\/.+/i;
        if (!regex.test(url)) {
            throw new Error('URL no válida o plataforma no soportada. Soportamos Instagram, TikTok y YouTube.');
        }
    }

    /**
     * Implementa rate limiting simple
     * @throws {Error} Si se excede el límite de intentos
     */
    verificarRateLimit() {
        const ahora = Date.now();
        const hace1Minuto = ahora - 60000;
        
        // Limpiar intentos antiguos
        for (const [timestamp] of this.intentosPorMinuto) {
            if (timestamp < hace1Minuto) {
                this.intentosPorMinuto.delete(timestamp);
            }
        }
        
        if (this.intentosPorMinuto.size >= this.MAX_INTENTOS_POR_MINUTO) {
            throw new Error('Demasiados intentos. Espera un minuto antes de intentar de nuevo.');
        }
        
        this.intentosPorMinuto.set(ahora, true);
    }

    /**
     * Extrae el ID de un vídeo de YouTube desde la URL
     * @param {string} url - URL de YouTube
     * @returns {string|null} ID del vídeo o null si no se encuentra
     */
    getYoutubeId(url) {
        const patterns = [
            /[?&]v=([^&]+)/,           // youtube.com/watch?v=ID
            /youtu\.be\/([^?]+)/,      // youtu.be/ID
            /\/shorts\/([^?]+)/,       // youtube.com/shorts/ID
            /\/embed\/([^?]+)/         // youtube.com/embed/ID
        ];
        
        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match) return match[1];
        }
        
        return null;
    }

    /**
     * Carga la API de YouTube IFrame de forma asíncrona
     * @returns {Promise<void>}
     */
    cargarYTApi() {
        return new Promise((resolve) => {
            if (window.YT?.Player) {
                return resolve();
            }
            
            if (window.onYouTubeIframeAPIReady) {
                return; // Ya en progreso
            }
            
            window.onYouTubeIframeAPIReady = () => resolve();
            
            if (!document.getElementById('yt-iframe-api')) {
                const script = document.createElement('script');
                script.id = 'yt-iframe-api';
                script.src = 'https://www.youtube.com/iframe_api';
                script.async = true;
                document.body.appendChild(script);
            }
        });
    }

    /**
     * Obtiene la duración de un vídeo de YouTube usando la API IFrame
     * @param {string} url - URL del vídeo de YouTube
     * @returns {Promise<number>} Duración en segundos
     * @throws {Error} Si no se puede obtener la duración
     */
    async getYoutubeDuration(url) {
        const videoId = this.getYoutubeId(url);
        if (!videoId) {
            throw new Error('No se pudo obtener el ID del vídeo de YouTube.');
        }

        await this.cargarYTApi();

        return new Promise((resolve, reject) => {
            let player;
            const timeout = setTimeout(() => {
                if (player) player.destroy();
                reject(new Error('Timeout al obtener información del vídeo.'));
            }, 15000);

            const div = document.getElementById('yt-probe') || this.crearElementoProbe();
            
            player = new YT.Player(div, {
                height: '0',
                width: '0',
                videoId: videoId,
                playerVars: {
                    autoplay: 0,
                    controls: 0,
                    enablejsapi: 1,
                    mute: 1
                },
                events: {
                    onReady: () => {
                        try {
                            const duration = player.getDuration();
                            clearTimeout(timeout);
                            player.destroy();
                            resolve(duration || 0);
                        } catch (e) {
                            clearTimeout(timeout);
                            player.destroy();
                            reject(new Error('No se pudo leer la duración del vídeo.'));
                        }
                    },
                    onError: (event) => {
                        clearTimeout(timeout);
                        player.destroy();
                        const errorMessages = {
                            2: 'ID de vídeo inválido',
                            5: 'Error de reproducción HTML5',
                            100: 'Vídeo no encontrado o privado',
                            101: 'Vídeo no permite reproducción embebida',
                            150: 'Vídeo no permite reproducción embebida'
                        };
                        const message = errorMessages[event.data] || 'Error desconocido al cargar el vídeo';
                        reject(new Error(message));
                    }
                }
            });
        });
    }

    /**
     * Crea el elemento div oculto para probar vídeos de YouTube
     * @returns {HTMLElement}
     */
    crearElementoProbe() {
        const div = document.createElement('div');
        div.id = 'yt-probe';
        div.style.cssText = 'position:absolute;top:-1000px;left:-1000px;width:0;height:0;opacity:0;pointer-events:none;';
        document.body.appendChild(div);
        return div;
    }

    /**
     * Intenta descargar un vídeo directamente si la URL permite CORS
     * @param {string} url - URL del archivo
     * @param {Function} onProgreso - Callback de progreso (porcentaje)
     * @param {AbortController} controller - Controlador para cancelar la descarga
     * @returns {Promise<File>} Archivo descargado
     * @throws {Error} Si no se puede descargar
     */
    async intentarDescargaCORS(url, onProgreso, controller = null) {
        const abortController = controller || new AbortController();
        const timeout = setTimeout(() => abortController.abort(), 90000);

        try {
            const response = await fetch(url, { 
                signal: abortController.signal,
                mode: 'cors'
            });
            
            clearTimeout(timeout);
            
            if (!response.ok) {
                throw new Error(`No se pudo descargar (${response.status}): ${response.statusText}`);
            }

            const contentLength = response.headers.get('Content-Length');
            const total = contentLength ? parseInt(contentLength, 10) : 0;
            const maxSize = this.MAX_SIZE_MB * 1024 * 1024;

            if (total && total > maxSize) {
                throw new Error(`Archivo demasiado grande (${Math.round(total / 1024 / 1024)} MB). Límite: ${this.MAX_SIZE_MB} MB`);
            }

            const reader = response.body?.getReader();
            if (!reader) {
                throw new Error('La respuesta no es un stream legible');
            }

            const chunks = [];
            let received = 0;

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                chunks.push(value);
                received += value.byteLength;

                if (received > maxSize) {
                    throw new Error(`Archivo demasiado grande (>${this.MAX_SIZE_MB} MB)`);
                }

                if (onProgreso && total) {
                    onProgreso(Math.round((received / total) * 100));
                }
            }

            const contentType = response.headers.get('Content-Type') || 'video/mp4';
            const blob = new Blob(chunks, { type: contentType });
            
            // Extraer nombre del archivo de la URL
            const fileName = this.extraerNombreArchivo(url) || 'video_remoto.mp4';
            
            return new File([blob], fileName, { 
                type: contentType, 
                lastModified: Date.now() 
            });

        } catch (error) {
            clearTimeout(timeout);
            
            if (error.name === 'AbortError') {
                throw new Error('Descarga cancelada por timeout (90 segundos)');
            }
            
            throw error;
        }
    }

    /**
     * Extrae el nombre del archivo de una URL
     * @param {string} url - URL
     * @returns {string} Nombre del archivo
     */
    extraerNombreArchivo(url) {
        try {
            const urlObj = new URL(url);
            const pathname = urlObj.pathname;
            const segments = pathname.split('/');
            const lastSegment = segments[segments.length - 1];
            
            if (lastSegment && lastSegment.includes('.')) {
                return lastSegment;
            }
        } catch (e) {
            // Ignorar errores de parsing
        }
        
        return 'video_remoto.mp4';
    }

    /**
     * Detecta la plataforma desde una URL
     * @param {string} url - URL a analizar
     * @returns {string} Nombre de la plataforma
     */
    detectarPlataforma(url) {
        if (/instagram\.com/i.test(url)) return 'instagram';
        if (/tiktok\.com/i.test(url)) return 'tiktok';
        if (/youtu\.?be|youtube\.com/i.test(url)) return 'youtube';
        return 'desconocida';
    }

    /**
     * Muestra guía manual para descargar desde una plataforma específica
     * @param {string} plataforma - Nombre de la plataforma
     * @param {Function} onFileSelect - Callback cuando se selecciona un archivo
     */
    guiarDescargaManual(plataforma, onFileSelect) {
        const guias = {
            youtube: {
                titulo: 'Descargar desde YouTube',
                pasos: [
                    'Si el vídeo es tuyo, usa YouTube Studio para descargarlo',
                    'Si tiene permiso del autor, busca el botón "Descargar" bajo el vídeo',
                    'Para contenido público, usa herramientas oficiales cuando estén disponibles',
                    'Una vez descargado, sube el archivo usando el botón de abajo'
                ],
                enlace: 'https://support.google.com/youtube/answer/56100'
            },
            instagram: {
                titulo: 'Descargar desde Instagram',
                pasos: [
                    'Para contenido propio, solicita tu archivo de datos desde Configuración',
                    'Ve a Configuración → Privacidad → Descargar tus datos',
                    'Instagram enviará un archivo con todos tus contenidos',
                    'También puedes guardar tu propio contenido desde la app móvil'
                ],
                enlace: 'https://help.instagram.com/519522125107875'
            },
            tiktok: {
                titulo: 'Descargar desde TikTok',
                pasos: [
                    'Si el autor permite descargas, usa el botón "Guardar vídeo"',
                    'Para contenido propio, usa "Guardar en dispositivo" desde la app',
                    'Asegúrate de que las descargas estén habilitadas en la configuración',
                    'Una vez guardado, sube el archivo aquí'
                ],
                enlace: 'https://support.tiktok.com/es/using-tiktok/creating-videos/downloading-videos'
            }
        };

        const guia = guias[plataforma] || {
            titulo: 'Descargar vídeo',
            pasos: [
                'Guarda el vídeo usando las herramientas oficiales de la plataforma',
                'Respeta los términos de servicio y derechos de autor',
                'Una vez descargado, sube el archivo usando el botón de abajo'
            ],
            enlace: '#'
        };

        this.mostrarModalGuia(guia, onFileSelect);
    }

    /**
     * Muestra un modal con la guía de descarga manual
     * @param {Object} guia - Objeto con la información de la guía
     * @param {Function} onFileSelect - Callback para selección de archivo
     */
    mostrarModalGuia(guia, onFileSelect) {
        // Crear modal
        const modal = document.createElement('div');
        modal.className = 'modal modal--activo';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-labelledby', 'titulo-guia-descarga');
        modal.setAttribute('aria-modal', 'true');

        modal.innerHTML = `
            <div class="modal__contenido">
                <div class="modal__cabecera">
                    <h2 class="modal__titulo" id="titulo-guia-descarga">${guia.titulo}</h2>
                    <button class="boton boton--icono modal__cerrar" aria-label="Cerrar guía">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                    </button>
                </div>
                <div class="modal__cuerpo">
                    <div class="guia-descarga">
                        <p class="guia-descarga__intro">
                            No es posible descargar directamente este enlace debido a restricciones CORS y términos de servicio.
                        </p>
                        <h3 class="guia-descarga__subtitulo">Pasos para obtener el vídeo:</h3>
                        <ol class="guia-descarga__pasos">
                            ${guia.pasos.map(paso => `<li>${paso}</li>`).join('')}
                        </ol>
                        ${guia.enlace !== '#' ? `
                            <p class="guia-descarga__enlace">
                                <a href="${guia.enlace}" target="_blank" rel="noopener">
                                    Ver guía oficial →
                                </a>
                            </p>
                        ` : ''}
                        <div class="guia-descarga__acciones">
                            <label for="input-archivo-manual" class="boton boton--primario">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                                    <polyline points="17 8 12 3 7 8"/>
                                    <line x1="12" y1="3" x2="12" y2="15"/>
                                </svg>
                                Elegir archivo de mi equipo
                            </label>
                            <input type="file" 
                                   id="input-archivo-manual" 
                                   accept="video/*,.mp4,.webm,.avi,.mov,.mkv,.wmv,.flv,.ogv"
                                   style="display: none;">
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Event listeners
        const cerrarModal = () => {
            modal.remove();
        };

        const btnCerrar = modal.querySelector('.modal__cerrar');
        btnCerrar.addEventListener('click', cerrarModal);

        modal.addEventListener('click', (e) => {
            if (e.target === modal) cerrarModal();
        });

        const inputArchivo = modal.querySelector('#input-archivo-manual');
        inputArchivo.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                cerrarModal();
                onFileSelect(file);
            }
        });

        // Foco inicial
        btnCerrar.focus();
    }

    /**
     * Proceso principal para cargar vídeo desde URL
     * @param {string} url - URL del vídeo
     * @param {Function} onProgreso - Callback de progreso
     * @param {Function} onFileReady - Callback cuando el archivo esté listo
     * @param {Function} onAnunciar - Callback para anuncios accesibles
     * @param {AbortController} controller - Controlador para cancelar la operación
     * @returns {Promise<void>}
     */
    async cargarDesdeURL(url, onProgreso, onFileReady, onAnunciar, controller = null) {
        try {
            // Validaciones iniciales
            this.validarUrlSoportada(url);
            this.verificarRateLimit();

            onAnunciar('Validando URL...');

            // Verificar duración para YouTube
            if (/youtu\.?be|youtube\.com/i.test(url)) {
                onAnunciar('Verificando duración del vídeo de YouTube...');
                const duration = await this.getYoutubeDuration(url);
                const minutos = Math.ceil(duration / 60);
                
                if (minutos > this.MAX_DURATION_MIN) {
                    throw new Error(
                        `Vídeo demasiado largo (${minutos} minutos). Límite: ${this.MAX_DURATION_MIN} minutos.`
                    );
                }
                
                onAnunciar(`Duración verificada: ${minutos} minutos`);
            }

            // Intentar descarga directa con CORS
            onAnunciar('Intentando descarga directa...');
            
            try {
                const file = await this.intentarDescargaCORS(url, onProgreso, controller);
                onAnunciar('Vídeo cargado correctamente desde URL.');
                onFileReady(file);
                return;
            } catch (corsError) {
                // Si falla por CORS, mostrar guía manual
                if (this.esFalloCORS(corsError)) {
                    const plataforma = this.detectarPlataforma(url);
                    onAnunciar('No es posible descargar directamente este enlace. Se mostrará una guía para descarga manual.');
                    
                    // Mostrar guía manual
                    this.guiarDescargaManual(plataforma, (file) => {
                        onAnunciar('Archivo subido correctamente.');
                        onFileReady(file);
                    });
                    return;
                } else {
                    // Otros errores (tamaño, timeout, etc.)
                    throw corsError;
                }
            }

        } catch (error) {
            onAnunciar(`Error: ${error.message}`);
            throw error;
        }
    }

    /**
     * Determina si un error es debido a CORS u otros problemas de descarga
     * @param {Error} error - Error a evaluar
     * @returns {boolean} True si es un error de CORS/descarga
     */
    esFalloCORS(error) {
        const mensajesCORS = [
            'cors',
            'no es un stream legible',
            'no se pudo descargar',
            'network error',
            'failed to fetch'
        ];
        
        return mensajesCORS.some(msg => 
            error.message.toLowerCase().includes(msg)
        );
    }
}
