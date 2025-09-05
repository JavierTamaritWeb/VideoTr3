# Pruebas de Funcionalidad URL Loader

## URLs de Prueba

### YouTube (deberían funcionar)
- Vídeo corto público: https://www.youtube.com/watch?v=dQw4w9WgXcQ
- YouTube Shorts: https://www.youtube.com/shorts/abc123
- Formato youtu.be: https://youtu.be/dQw4w9WgXcQ

### Instagram (mostrarán guía)
- Post de Instagram: https://www.instagram.com/p/ABC123/
- Reel de Instagram: https://instagram.com/reel/XYZ789/

### TikTok (mostrarán guía)
- Vídeo de TikTok: https://www.tiktok.com/@user/video/123456789

### URLs Inválidas (deberían fallar)
- URL no soportada: https://example.com/video.mp4
- URL malformada: not-a-url
- Plataforma no soportada: https://vimeo.com/123456

## Pasos de Prueba

1. **Abrir la aplicación** en http://localhost:8000
2. **Encontrar la sección** "Cargar desde URL"
3. **Probar cada tipo** de URL y verificar comportamiento
4. **Comprobar accesibilidad** usando Tab y Enter
5. **Verificar anuncios** con lector de pantalla (opcional)

## Comportamientos Esperados

### ✅ YouTube Válido
- Validación pasa
- Verifica duración
- Si es corto: intenta descarga o muestra guía
- Si es largo (>10 min): error de duración

### ✅ Instagram/TikTok
- Validación pasa
- Muestra modal de guía manual
- Permite subir archivo

### ❌ URL Inválida
- Error de validación inmediato
- Botón de carga deshabilitado
- Mensaje de error claro

## Funcionalidades a Verificar

- [ ] Validación en tiempo real del campo URL
- [ ] Habilitación/deshabilitación del botón según validez
- [ ] Rate limiting (probar >5 veces en 1 minuto)
- [ ] Progreso de descarga (si CORS permite)
- [ ] Cancelación de descarga
- [ ] Modal de guía manual
- [ ] Integración con file picker
- [ ] Continuidad con flujo de transcripción
- [ ] Accesibilidad con teclado
- [ ] Anuncios para lectores de pantalla

## Notas Técnicas

- La descarga directa **raramente funcionará** debido a CORS
- El flujo normal será: URL → Validación → Guía → Upload manual
- YouTube IFrame API puede tardar en cargar
- Algunos vídeos de YouTube pueden estar restringidos
