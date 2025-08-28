---
title: "Hoja de Referencia HTML"
date: "2012-03-15"
excerpt: "Una guía completa de elementos HTML esenciales para el desarrollo web."
---

# Hoja de Referencia HTML

Una guía completa de elementos HTML esenciales para el desarrollo web.

## Estructura Básica

```html
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Título de la Página</title>
</head>
<body>
    <!-- El contenido va aquí -->
</body>
</html>
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<strong>Vista previa:</strong> Estructura básica del documento HTML
</div>

## Etiquetas de Encabezado

```html
<h1>Encabezado Principal</h1>
<h2>Encabezado de Sección</h2>
<h3>Encabezado de Subsección</h3>
<h4>Encabezado de Nivel 4</h4>
<h5>Encabezado de Nivel 5</h5>
<h6>Encabezado de Nivel 6</h6>
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<h1>Encabezado Principal</h1>
<h2>Encabezado de Sección</h2>
<h3>Encabezado de Subsección</h3>
<h4>Encabezado de Nivel 4</h4>
<h5>Encabezado de Nivel 5</h5>
<h6>Encabezado de Nivel 6</h6>
</div>

## Párrafos y Texto

```html
<p>Este es un párrafo.</p>
<br>
<strong>Texto en negrita</strong>
<em>Texto en cursiva</em>
<u>Texto subrayado</u>
<mark>Texto resaltado</mark>
<small>Texto pequeño</small>
<del>Texto eliminado</del>
<ins>Texto insertado</ins>
<sub>Subíndice</sub>
<sup>Superíndice</sup>
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<p>Este es un párrafo.</p>
<br>
<strong>Texto en negrita</strong><br>
<em>Texto en cursiva</em><br>
<u>Texto subrayado</u><br>
<mark>Texto resaltado</mark><br>
<small>Texto pequeño</small><br>
<del>Texto eliminado</del><br>
<ins>Texto insertado</ins><br>
H<sub>2</sub>O<br>
X<sup>2</sup>
</div>

## Enlaces

```html
<a href="https://example.com">Enlace externo</a>
<a href="mailto:someone@example.com">Enlace de email</a>
<a href="tel:+1234567890">Enlace de teléfono</a>
<a href="#section1">Enlace de anclaje interno</a>
<a href="https://example.com" target="_blank">Abrir en nueva pestaña</a>
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<a href="https://example.com">Enlace externo</a><br>
<a href="mailto:someone@example.com">Enlace de email</a><br>
<a href="tel:+1234567890">Enlace de teléfono</a><br>
<a href="#section1">Enlace de anclaje interno</a><br>
<a href="https://example.com" target="_blank">Abrir en nueva pestaña</a>
</div>

## Listas

```html
<!-- Lista no ordenada -->
<ul>
    <li>Primer elemento</li>
    <li>Segundo elemento</li>
    <li>Tercer elemento</li>
</ul>

<!-- Lista ordenada -->
<ol>
    <li>Primero</li>
    <li>Segundo</li>
    <li>Tercero</li>
</ol>

<!-- Lista de definiciones -->
<dl>
    <dt>HTML</dt>
    <dd>Lenguaje de Marcado de Hipertexto</dd>
    <dt>CSS</dt>
    <dd>Hojas de Estilo en Cascada</dd>
</dl>
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<ul>
    <li>Primer elemento</li>
    <li>Segundo elemento</li>
    <li>Tercer elemento</li>
</ul>

<ol>
    <li>Primero</li>
    <li>Segundo</li>
    <li>Tercero</li>
</ol>

<dl>
    <dt>HTML</dt>
    <dd>Lenguaje de Marcado de Hipertexto</dd>
    <dt>CSS</dt>
    <dd>Hojas de Estilo en Cascada</dd>
</dl>
</div>

## Imágenes

```html
<img src="image.jpg" alt="Descripción de la imagen" width="300" height="200">
<img src="image.jpg" alt="Imagen responsiva" style="max-width: 100%; height: auto;">
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<img src="https://via.placeholder.com/300x200" alt="Imagen de ejemplo" style="max-width: 100%; height: auto;">
</div>

## Tablas

```html
<table border="1">
    <thead>
        <tr>
            <th>Nombre</th>
            <th>Edad</th>
            <th>Ciudad</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>Juan</td>
            <td>25</td>
            <td>Madrid</td>
        </tr>
        <tr>
            <td>María</td>
            <td>30</td>
            <td>Barcelona</td>
        </tr>
    </tbody>
</table>
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<table border="1" style="border-collapse: collapse; width: 100%;">
    <thead>
        <tr>
            <th style="padding: 8px; background-color: #f0f0f0;">Nombre</th>
            <th style="padding: 8px; background-color: #f0f0f0;">Edad</th>
            <th style="padding: 8px; background-color: #f0f0f0;">Ciudad</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td style="padding: 8px;">Juan</td>
            <td style="padding: 8px;">25</td>
            <td style="padding: 8px;">Madrid</td>
        </tr>
        <tr>
            <td style="padding: 8px;">María</td>
            <td style="padding: 8px;">30</td>
            <td style="padding: 8px;">Barcelona</td>
        </tr>
    </tbody>
</table>
</div>

## Elementos de Formulario

```html
<form>
    <label for="name">Nombre:</label>
    <input type="text" id="name" name="name" placeholder="Ingrese su nombre">
    
    <label for="email">Email:</label>
    <input type="email" id="email" name="email">
    
    <label for="password">Contraseña:</label>
    <input type="password" id="password" name="password">
    
    <label for="age">Edad:</label>
    <input type="number" id="age" name="age" min="1" max="120">
    
    <label for="message">Mensaje:</label>
    <textarea id="message" name="message" rows="4" cols="50"></textarea>
    
    <label for="country">País:</label>
    <select id="country" name="country">
        <option value="es">España</option>
        <option value="mx">México</option>
        <option value="ar">Argentina</option>
    </select>
    
    <input type="checkbox" id="subscribe" name="subscribe">
    <label for="subscribe">Suscribirse al boletín</label>
    
    <input type="radio" id="male" name="gender" value="male">
    <label for="male">Masculino</label>
    <input type="radio" id="female" name="gender" value="female">
    <label for="female">Femenino</label>
    
    <button type="submit">Enviar</button>
    <button type="reset">Restablecer</button>
</form>
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<form>
    <div style="margin: 5px 0;">
        <label for="name">Nombre:</label><br>
        <input type="text" id="name" name="name" placeholder="Ingrese su nombre" style="margin-top: 2px;">
    </div>
    
    <div style="margin: 5px 0;">
        <label for="email">Email:</label><br>
        <input type="email" id="email" name="email" style="margin-top: 2px;">
    </div>
    
    <div style="margin: 5px 0;">
        <label for="message">Mensaje:</label><br>
        <textarea id="message" name="message" rows="3" cols="30" style="margin-top: 2px;"></textarea>
    </div>
    
    <div style="margin: 5px 0;">
        <label for="country">País:</label><br>
        <select id="country" name="country" style="margin-top: 2px;">
            <option value="es">España</option>
            <option value="mx">México</option>
            <option value="ar">Argentina</option>
        </select>
    </div>
    
    <div style="margin: 5px 0;">
        <input type="checkbox" id="subscribe" name="subscribe">
        <label for="subscribe">Suscribirse al boletín</label>
    </div>
    
    <div style="margin: 5px 0;">
        <input type="radio" id="male" name="gender" value="male">
        <label for="male">Masculino</label>
        <input type="radio" id="female" name="gender" value="female">
        <label for="female">Femenino</label>
    </div>
    
    <div style="margin: 10px 0;">
        <button type="button">Enviar</button>
        <button type="button">Restablecer</button>
    </div>
</form>
</div>

## Elementos Semánticos

```html
<header>Encabezado del sitio web</header>
<nav>Navegación</nav>
<main>Contenido principal</main>
<section>Sección</section>
<article>Artículo o contenido independiente</article>
<aside>Barra lateral o información adicional</aside>
<footer>Pie del sitio web</footer>
<figure>
    <img src="image.jpg" alt="descripción">
    <figcaption>Título de la imagen</figcaption>
</figure>
<details>
    <summary>Hacer clic para expandir</summary>
    <p>El contenido oculto se mostrará aquí.</p>
</details>
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<header style="background-color: #e0e0e0; padding: 10px;">Encabezado del sitio web</header>
<nav style="background-color: #d0d0d0; padding: 10px;">Navegación</nav>
<main style="background-color: #f0f0f0; padding: 10px;">Contenido principal</main>
<section style="background-color: #e5e5e5; padding: 10px;">Sección</section>
<article style="background-color: #f5f5f5; padding: 10px;">Artículo o contenido independiente</article>
<aside style="background-color: #e8e8e8; padding: 10px;">Barra lateral o información adicional</aside>
<footer style="background-color: #e0e0e0; padding: 10px;">Pie del sitio web</footer>
<details style="margin: 10px 0;">
    <summary>Hacer clic para expandir</summary>
    <p>El contenido oculto se mostrará aquí.</p>
</details>
</div>

## Multimedia

```html
<!-- Video -->
<video controls width="300">
    <source src="video.mp4" type="video/mp4">
    <source src="video.webm" type="video/webm">
    Tu navegador no soporta el elemento de video.
</video>

<!-- Audio -->
<audio controls>
    <source src="audio.mp3" type="audio/mpeg">
    <source src="audio.ogg" type="audio/ogg">
    Tu navegador no soporta el elemento de audio.
</audio>

<!-- Embed -->
<iframe src="https://www.example.com" width="300" height="200"></iframe>
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<video controls width="300" style="background-color: #000;">
    <source src="https://www.w3schools.com/html/mov_bbb.mp4" type="video/mp4">
    Tu navegador no soporta el elemento de video.
</video>
<br><br>
<audio controls>
    <source src="https://www.w3schools.com/html/horse.mp3" type="audio/mpeg">
    Tu navegador no soporta el elemento de audio.
</audio>
</div>

Esta hoja de referencia cubre los elementos HTML más utilizados en el desarrollo web. ¡Practica usando estos elementos para mejorar tus habilidades de desarrollo web!