
# Iconos para VideoTR PWA

## Estado actual:
- ✅ Iconos SVG generados (icon-192.svg, icon-512.svg)
- ✅ Iconos PNG básicos creados (para desarrollo)
- 📝 Listos para conversión a PNG de alta calidad

## Para mejorar la calidad de los iconos PNG:

### Opción 1: Usar herramientas online
1. Subir icon-192.svg a https://convertio.co/svg-png/
2. Subir icon-512.svg a https://convertio.co/svg-png/
3. Descargar los PNG y reemplazar los archivos actuales

### Opción 2: Usar ImageMagick (requiere instalación)
```bash
cd assets/icons
magick icon-192.svg icon-192.png
magick icon-512.svg icon-512.png
```

### Opción 3: Usar Inkscape (requiere instalación)
```bash
inkscape icon-192.svg --export-png=icon-192.png --export-width=192 --export-height=192
inkscape icon-512.svg --export-png=icon-512.png --export-width=512 --export-height=512
```

## Iconos incluidos:
- icon-192.svg/png (192x192) - Icono principal PWA
- icon-512.svg/png (512x512) - Icono de alta resolución PWA
- Ambos incluyen el diseño de VideoTR con botón de play y ondas de sonido

## Verificación:
Los iconos están referenciados correctamente en manifest.webmanifest
