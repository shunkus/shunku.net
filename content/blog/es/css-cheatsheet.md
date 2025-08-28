---
title: "Hoja de Referencia CSS"
date: "2013-01-20"
excerpt: "Una guía completa de propiedades y técnicas esenciales de CSS para el desarrollo web."
---

# Hoja de Referencia CSS

Una guía completa de propiedades y técnicas esenciales de CSS para el desarrollo web.

## Sintaxis Básica

```css
selector {
    propiedad: valor;
    otra-propiedad: otro-valor;
}
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<strong>Vista previa:</strong> CSS sigue el patrón selector-propiedad-valor
</div>

## Selectores

```css
/* Selector de elemento */
p {
    color: blue;
}

/* Selector de clase */
.my-class {
    font-size: 16px;
}

/* Selector de ID */
#my-id {
    background-color: yellow;
}

/* Selector de atributo */
input[type="text"] {
    border: 1px solid gray;
}

/* Pseudo-clases */
a:hover {
    color: red;
}

/* Selector descendente */
div p {
    margin: 10px;
}

/* Selector de hijo */
ul > li {
    list-style: none;
}
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<p style="color: blue;">Ejemplo de selector de elemento</p>
<p class="my-class" style="font-size: 16px;">Ejemplo de selector de clase</p>
<p id="my-id" style="background-color: yellow;">Ejemplo de selector de ID</p>
</div>

## Propiedades de Texto y Fuente

```css
.text-styles {
    font-family: Arial, sans-serif;
    font-size: 18px;
    font-weight: bold;
    font-style: italic;
    text-align: center;
    text-decoration: underline;
    text-transform: uppercase;
    line-height: 1.5;
    letter-spacing: 2px;
    color: #333;
}
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<div style="font-family: Arial, sans-serif; font-size: 18px; font-weight: bold; font-style: italic; text-align: center; text-decoration: underline; text-transform: uppercase; line-height: 1.5; letter-spacing: 2px; color: #333;">
    Ejemplo de Texto Estilizado
</div>
</div>

## Modelo de Caja

```css
.box-model {
    width: 200px;
    height: 100px;
    padding: 20px;
    border: 2px solid black;
    margin: 10px;
    background-color: lightblue;
}
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<div style="width: 200px; height: 100px; padding: 20px; border: 2px solid black; margin: 10px; background-color: lightblue;">
    Ejemplo de Modelo de Caja
</div>
</div>

## Colores y Fondos

```css
.color-examples {
    /* Formatos de color */
    color: red;
    color: #ff0000;
    color: rgb(255, 0, 0);
    color: rgba(255, 0, 0, 0.5);
    color: hsl(0, 100%, 50%);
    
    /* Propiedades de fondo */
    background-color: lightgreen;
    background-image: url('image.jpg');
    background-repeat: no-repeat;
    background-position: center;
    background-size: cover;
}
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<div style="padding: 10px; background-color: lightgreen; color: red; margin: 5px;">Texto rojo sobre fondo verde claro</div>
<div style="padding: 10px; background: linear-gradient(45deg, #ff6b6b, #4ecdc4); color: white; margin: 5px;">Fondo degradado</div>
</div>

## Diseño - Flexbox

```css
.flex-container {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 20px;
}

.flex-item {
    flex: 1;
    flex-grow: 1;
    flex-shrink: 0;
    flex-basis: auto;
}
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<div style="display: flex; justify-content: center; align-items: center; gap: 10px; background-color: #e0e0e0; padding: 10px;">
    <div style="background-color: #ff6b6b; padding: 10px; color: white;">Elemento 1</div>
    <div style="background-color: #4ecdc4; padding: 10px; color: white;">Elemento 2</div>
    <div style="background-color: #45b7d1; padding: 10px; color: white;">Elemento 3</div>
</div>
</div>

## Diseño - Grid

```css
.grid-container {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: 100px 200px;
    grid-gap: 10px;
    grid-template-areas: 
        "header header header"
        "sidebar main main";
}

.grid-item {
    background-color: lightcoral;
    padding: 20px;
}
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<div style="display: grid; grid-template-columns: repeat(3, 1fr); grid-gap: 10px; background-color: #e0e0e0; padding: 10px;">
    <div style="background-color: lightcoral; padding: 10px;">Elemento Grid 1</div>
    <div style="background-color: lightcoral; padding: 10px;">Elemento Grid 2</div>
    <div style="background-color: lightcoral; padding: 10px;">Elemento Grid 3</div>
</div>
</div>

## Posicionamiento

```css
.positioning {
    position: static;    /* Por defecto */
    position: relative;  /* Relativo a la posición normal */
    position: absolute;  /* Relativo al padre posicionado */
    position: fixed;     /* Relativo al viewport */
    position: sticky;    /* Posicionamiento pegajoso */
    
    top: 10px;
    right: 20px;
    bottom: 30px;
    left: 40px;
    z-index: 100;
}
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9; position: relative; height: 120px;">
<div style="position: absolute; top: 10px; left: 10px; background-color: yellow; padding: 5px;">Posición absoluta</div>
<div style="position: relative; top: 50px; background-color: lightblue; padding: 5px; width: fit-content;">Posición relativa</div>
</div>

## Bordes y Sombras

```css
.borders-shadows {
    border: 2px solid black;
    border-radius: 10px;
    border-top: 3px dashed red;
    border-right: 3px dotted blue;
    
    box-shadow: 5px 5px 10px rgba(0,0,0,0.3);
    text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
}
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<div style="border: 2px solid black; border-radius: 10px; box-shadow: 5px 5px 10px rgba(0,0,0,0.3); padding: 15px; background-color: white; margin: 10px;">
    <span style="text-shadow: 2px 2px 4px rgba(0,0,0,0.5);">Caja con borde, sombra y sombra de texto</span>
</div>
</div>

## Transformaciones y Animaciones

```css
.transform {
    transform: rotate(45deg);
    transform: scale(1.2);
    transform: translate(50px, 100px);
    transform: skew(20deg, 10deg);
}

.animation {
    animation: slideIn 2s ease-in-out;
    transition: all 0.3s ease;
}

@keyframes slideIn {
    from { opacity: 0; transform: translateX(-100px); }
    to { opacity: 1; transform: translateX(0); }
}
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<div style="background-color: #ff6b6b; padding: 10px; color: white; margin: 5px; transform: rotate(5deg); transition: transform 0.3s ease;" onmouseover="this.style.transform='rotate(0deg) scale(1.1)'" onmouseout="this.style.transform='rotate(5deg) scale(1)'">
    Pasa el ratón para efecto de transformación
</div>
</div>

## Consultas de Medios (Diseño Responsivo)

```css
/* Enfoque móvil primero */
.responsive {
    width: 100%;
    padding: 10px;
}

/* Estilos para tablet */
@media screen and (min-width: 768px) {
    .responsive {
        width: 50%;
        padding: 20px;
    }
}

/* Estilos para escritorio */
@media screen and (min-width: 1024px) {
    .responsive {
        width: 33.33%;
        padding: 30px;
    }
}
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<div style="background-color: #4ecdc4; padding: 15px; color: white; border-radius: 5px;">
    Elemento responsivo (redimensiona la ventana para ver el efecto en la implementación real)
</div>
</div>

## Utilidades CSS Comunes

```css
/* Utilidades de visualización */
.show { display: block; }
.hide { display: none; }
.invisible { visibility: hidden; }

/* Utilidades de texto */
.text-center { text-align: center; }
.text-left { text-align: left; }
.text-right { text-align: right; }

/* Utilidades de margen y relleno */
.m-0 { margin: 0; }
.p-2 { padding: 0.5rem; }
.mt-4 { margin-top: 1rem; }

/* Utilidades de flotación */
.float-left { float: left; }
.float-right { float: right; }
.clearfix::after {
    content: "";
    display: table;
    clear: both;
}
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<div style="text-align: center; padding: 10px; background-color: #e0e0e0; margin-bottom: 5px;">Texto centrado</div>
<div style="text-align: left; padding: 10px; background-color: #f0f0f0; margin-bottom: 5px;">Alineado a la izquierda</div>
<div style="text-align: right; padding: 10px; background-color: #e0e0e0;">Alineado a la derecha</div>
</div>

Esta hoja de referencia de CSS cubre las propiedades y técnicas más esenciales para el diseño web. ¡Practica con estas propiedades para dominar CSS!