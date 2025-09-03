#!/usr/bin/env node

// Script para generar iconos PNG para PWA
// Este script crea iconos SVG que pueden ser convertidos a PNG

const fs = require('fs');
const path = require('path');

// Crear directorio de iconos si no existe
const iconosDir = path.join(__dirname, 'assets', 'icons');
if (!fs.existsSync(iconosDir)) {
    fs.mkdirSync(iconosDir, { recursive: true });
    console.log('✅ Directorio de iconos creado');
}

// Template SVG para los iconos
const crearSVG = (size) => {
    return `<svg width="${size}" height="${size}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <!-- Fondo del icono -->
  <defs>
    <linearGradient id="gradiente" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#2563eb;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1d4ed8;stop-opacity:1" />
    </linearGradient>
    <filter id="sombra">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.3"/>
    </filter>
  </defs>
  
  <!-- Fondo redondeado -->
  <rect width="100" height="100" fill="url(#gradiente)" rx="20" filter="url(#sombra)"/>
  
  <!-- Contenedor del vídeo -->
  <rect x="15" y="20" width="70" height="50" fill="#ffffff" rx="8" stroke="#e5e7eb" stroke-width="1"/>
  
  <!-- Botón de play -->
  <polygon points="40,35 40,55 65,45" fill="#2563eb"/>
  
  <!-- Ondas de sonido (representando transcripción) -->
  <g fill="#2563eb" opacity="0.8">
    <rect x="25" y="75" width="8" height="4" rx="2"/>
    <rect x="35" y="73" width="8" height="8" rx="2"/>
    <rect x="45" y="71" width="8" height="12" rx="2"/>
    <rect x="55" y="74" width="8" height="6" rx="2"/>
    <rect x="65" y="72" width="8" height="10" rx="2"/>
  </g>
  
  <!-- Texto "TR" pequeño -->
  <text x="50" y="95" text-anchor="middle" fill="#ffffff" font-family="Arial, sans-serif" font-size="8" font-weight="bold">TR</text>
</svg>`;
};

// Crear iconos de diferentes tamaños
const tamaños = [
    { size: 192, nombre: 'icon-192.svg' },
    { size: 512, nombre: 'icon-512.svg' },
    { size: 180, nombre: 'apple-touch-icon.svg' }, // Para iOS
    { size: 32, nombre: 'favicon-32.svg' },
    { size: 16, nombre: 'favicon-16.svg' }
];

// Generar archivos SVG
tamaños.forEach(({ size, nombre }) => {
    const svg = crearSVG(size);
    const rutaArchivo = path.join(iconosDir, nombre);
    
    fs.writeFileSync(rutaArchivo, svg);
    console.log(`✅ Icono creado: ${nombre} (${size}x${size})`);
});

// Crear manifesto de iconos para referencia
const manifestoIconos = {
    iconos: tamaños.map(({ size, nombre }) => ({
        src: `assets/icons/${nombre}`,
        sizes: `${size}x${size}`,
        type: 'image/svg+xml',
        purpose: size >= 192 ? 'maskable any' : 'any'
    })),
    generado: new Date().toISOString(),
    nota: 'Para producción, convertir SVG a PNG usando herramientas como ImageMagick o similares'
};

fs.writeFileSync(
    path.join(iconosDir, 'manifest-iconos.json'),
    JSON.stringify(manifestoIconos, null, 2)
);

console.log('✅ Manifest de iconos creado');

// Crear archivo placeholder para iconos PNG (para desarrollo)
const crearPlaceholderPNG = (size, nombre) => {
    // Crear un archivo de texto que indique que es un placeholder
    const placeholder = `# Placeholder PNG Icon - ${size}x${size}
    
Este archivo representa un icono PNG de ${size}x${size} píxeles.
En producción, este archivo debería ser reemplazado por un PNG real.

Para generar el PNG real desde el SVG:
1. Usar ImageMagick: convert icon-${size}.svg -resize ${size}x${size} ${nombre}
2. Usar herramientas online como https://convertio.co/svg-png/
3. Usar Node.js con sharp: sharp('icon.svg').png().resize(${size}).toFile('${nombre}')

Características del icono:
- Tamaño: ${size}x${size} píxeles
- Formato: PNG
- Propósito: ${size >= 192 ? 'Icono de aplicación (maskable)' : 'Favicon'}
- Fondo: Sólido para compatibilidad con todos los dispositivos
`;
    
    fs.writeFileSync(path.join(iconosDir, nombre + '.txt'), placeholder);
};

// Crear placeholders para iconos PNG necesarios
crearPlaceholderPNG(192, 'icon-192.png');
crearPlaceholderPNG(512, 'icon-512.png');

console.log('📝 Placeholders PNG creados');
console.log(`
🎉 Generación de iconos completada!

📁 Ubicación: ${iconosDir}

📋 Próximos pasos:
1. Convertir los archivos SVG a PNG usando ImageMagick, Sharp, o herramientas online
2. Reemplazar los placeholders .txt por archivos PNG reales
3. Verificar que los iconos se muestren correctamente en el manifest

💡 Comando sugerido para conversión masiva (requiere ImageMagick):
   cd assets/icons
   for file in *.svg; do convert "$file" -resize \${file%.*}.png; done
`);
