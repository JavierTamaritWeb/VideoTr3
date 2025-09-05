# 🎨 Guía de Metodología BEM - VideoTR3

## 📋 ¿Qué es BEM?

**BEM** (Block Element Modifier) es una metodología de nomenclatura CSS que hace el código más mantenible, escalable y comprensible. En VideoTR3 seguimos BEM estrictamente **en español**.

## 🏗️ Estructura BEM

### 📦 Bloque (Block)
El componente de nivel superior. Representa una entidad independiente.

```css
.boton { }
.modal { }
.panel-entrada { }
.barra-progreso { }
```

### 🔧 Elemento (Element)
Parte del bloque que no tiene significado por sí sola.
**Sintaxis**: `bloque__elemento`

```css
.modal__contenido { }
.modal__cabecera { }
.modal__titulo { }
.panel-entrada__zona-soltar { }
.barra-progreso__relleno { }
```

### 🎛️ Modificador (Modifier)
Variación del bloque o elemento que cambia su apariencia o comportamiento.
**Sintaxis**: `bloque--modificador` o `bloque__elemento--modificador`

```css
.boton--primario { }
.boton--secundario { }
.modal--abierta { }
.barra-progreso--oculta { }
.panel-entrada__zona-soltar--arrastrando { }
```

## 🔤 Convenciones de Nomenclatura

### ✅ Nombres en Español
```css
/* ✅ Correcto */
.boton { }
.cabecera { }
.navegacion { }
.contenido { }

/* ❌ Incorrecto */
.button { }
.header { }
.navigation { }
.content { }
```

### 📝 Reglas de Escritura

1. **Todo en minúsculas**
2. **Palabras separadas por guiones** (`-`)
3. **Elementos separados por doble guión bajo** (`__`)
4. **Modificadores separados por doble guión** (`--`)

```css
/* ✅ Estructura correcta */
.tarjeta-video { }                          /* Bloque */
.tarjeta-video__miniatura { }              /* Elemento */
.tarjeta-video__miniatura-contenedor { }   /* Elemento compuesto */
.tarjeta-video--oculta { }                 /* Modificador */
.tarjeta-video__eliminar--activo { }       /* Elemento con modificador */
```

## 🏛️ Ejemplos Prácticos de VideoTR3

### 🎬 Componente Tarjeta de Vídeo

```css
/* Bloque principal */
.tarjeta-video {
    display: flex;
    padding: var(--espacio-l);
    background: var(--color-fondo-secundario);
    border-radius: var(--radio-l);
}

/* Elementos */
.tarjeta-video__miniatura-contenedor {
    position: relative;
    flex-shrink: 0;
}

.tarjeta-video__miniatura {
    width: 120px;
    height: 68px;
    object-fit: cover;
    border-radius: var(--radio-s);
}

.tarjeta-video__info {
    flex: 1;
    margin-left: var(--espacio-m);
}

.tarjeta-video__nombre {
    font-weight: var(--peso-medio);
    margin-bottom: var(--espacio-xs);
}

.tarjeta-video__meta {
    display: flex;
    gap: var(--espacio-s);
    font-size: var(--tamaño-texto-s);
    color: var(--color-texto-secundario);
}

.tarjeta-video__eliminar {
    margin-left: auto;
}

/* Modificadores */
.tarjeta-video--oculta {
    display: none;
}
```

### 🔘 Sistema de Botones

```css
/* Bloque base */
.boton {
    display: inline-flex;
    align-items: center;
    padding: var(--espacio-s) var(--espacio-m);
    border: none;
    border-radius: var(--radio-m);
    cursor: pointer;
}

/* Modificadores de tipo */
.boton--primario {
    background-color: var(--color-primario);
    color: white;
}

.boton--secundario {
    background-color: var(--color-fondo-terciario);
    color: var(--color-texto);
}

.boton--peligro {
    background-color: var(--color-error);
    color: white;
}

/* Modificadores de tamaño */
.boton--grande {
    padding: var(--espacio-m) var(--espacio-l);
    font-size: var(--tamaño-texto-l);
}

.boton--pequeño {
    padding: var(--espacio-xs) var(--espacio-s);
    font-size: var(--tamaño-texto-s);
}

/* Modificadores de estado */
.boton--cargando {
    opacity: 0.7;
    pointer-events: none;
}

/* Elementos */
.boton__icono {
    margin-right: var(--espacio-xs);
}

.boton__texto {
    flex: 1;
}
```

### 📊 Barra de Progreso

```css
/* Bloque */
.barra-progreso {
    margin: var(--espacio-l) 0;
}

/* Elementos */
.barra-progreso__pista {
    height: 8px;
    background: var(--color-fondo-terciario);
    border-radius: 4px;
    overflow: hidden;
}

.barra-progreso__relleno {
    height: 100%;
    background: var(--color-primario);
    transition: width 0.3s ease;
    width: 0%;
}

.barra-progreso__info {
    display: flex;
    justify-content: space-between;
    margin-top: var(--espacio-xs);
}

.barra-progreso__texto {
    font-size: var(--tamaño-texto-s);
    color: var(--color-texto-secundario);
}

.barra-progreso__porcentaje {
    font-weight: var(--peso-medio);
    font-size: var(--tamaño-texto-s);
}

/* Modificadores */
.barra-progreso--oculta {
    display: none;
}

.barra-progreso--completa .barra-progreso__relleno {
    background: var(--color-exito);
}
```

## 🏷️ Estructura de Archivos CSS

```
css/
├── tokens.css           # Variables CSS (colores, espaciado, tipografía)
├── base.css            # Reset y estilos base del HTML
├── layout.css          # Grid, contenedores principales
└── componentes.css     # Todos los componentes BEM
```

### 📐 Organización en componentes.css

```css
/* === BOTONES === */
.boton { }
.boton--primario { }
.boton__icono { }

/* === MODALES === */
.modal { }
.modal__contenido { }
.modal--abierta { }

/* === FORMULARIOS === */
.grupo-formulario { }
.grupo-formulario__etiqueta { }
.grupo-formulario--oculto { }

/* === TARJETAS === */
.tarjeta-video { }
.tarjeta-video__miniatura { }
.tarjeta-video--oculta { }
```

## 🎯 Beneficios de BEM en VideoTR3

### ✅ Ventajas

1. **🔍 Legibilidad**: Los nombres describen exactamente qué hace cada clase
2. **🔧 Mantenibilidad**: Fácil localizar y modificar estilos específicos
3. **🚀 Escalabilidad**: Agregar nuevos componentes sin conflictos
4. **👥 Trabajo en equipo**: Nomenclatura consistente y predecible
5. **🌍 Internacionalización**: Nombres en español más comprensibles

### 📈 Comparación

```css
/* ❌ Sin BEM - Confuso */
.video-card .info .title { }
.video-card.hidden { }
.btn.primary.large { }

/* ✅ Con BEM - Claro */
.tarjeta-video__info { }
.tarjeta-video__titulo { }
.tarjeta-video--oculta { }
.boton--primario { }
.boton--grande { }
```

## 📏 Reglas Específicas de VideoTR3

### 🎨 Modificadores de Estado

```css
/* Estados comunes */
.componente--activo { }      /* Elemento activo/seleccionado */
.componente--deshabilitado { } /* Elemento deshabilitado */
.componente--cargando { }    /* En proceso de carga */
.componente--error { }       /* Estado de error */
.componente--exito { }       /* Estado exitoso */
.componente--oculto { }      /* Oculto visualmente */
```

### 🎭 Modificadores de Tema

```css
/* Variaciones visuales */
.boton--primario { }         /* Acción principal */
.boton--secundario { }       /* Acción secundaria */
.boton--peligro { }          /* Acción destructiva */
.boton--icono { }            /* Solo con icono */
```

### 📱 Modificadores Responsivos

```css
/* Tamaños */
.componente--pequeño { }
.componente--mediano { }
.componente--grande { }

/* Orientación */
.panel--horizontal { }
.panel--vertical { }
```

## 🛠️ Herramientas y Validación

### 🔍 Verificación de Nomenclatura

Para mantener consistencia, verificar:

1. ✅ **Nombres en español**
2. ✅ **Estructura BEM correcta**
3. ✅ **No más de 2 niveles de anidación**
4. ✅ **Modificadores descriptivos**

### 🧹 Linting CSS

```json
// .stylelintrc.json
{
  "rules": {
    "selector-class-pattern": "^[a-z]([a-z0-9-]+)?(__([a-z0-9]+-?)+)?(--([a-z0-9]+-?)+){0,2}$"
  }
}
```

## 📚 Recursos Adicionales

### 🔗 Enlaces Útiles

- [BEM Methodology](https://bem.info/) - Documentación oficial
- [CSS Guidelines](https://cssguidelin.es/) - Mejores prácticas CSS
- [SMACSS](http://smacss.com/) - Arquitectura CSS escalable

### 💡 Consejos Finales

1. **Ser consistente** en toda la aplicación
2. **Documentar** componentes complejos
3. **Revisar** nomenclatura en code reviews
4. **Actualizar** esta guía cuando sea necesario

---

**VideoTR3 BEM Guide** v1.0  
**Autor**: Javier Tamarit  
**Última actualización**: Septiembre 2025
