---
title: "Aide-mémoire CSS"
date: "2013-01-20"
excerpt: "Un guide complet des propriétés et techniques essentielles CSS pour le développement web."
---

# Aide-mémoire CSS

Un guide complet des propriétés et techniques essentielles CSS pour le développement web.

## Syntaxe de Base

```css
sélecteur {
    propriété: valeur;
    autre-propriété: autre-valeur;
}
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<strong>Aperçu :</strong> CSS suit le modèle sélecteur-propriété-valeur
</div>

## Sélecteurs

```css
/* Sélecteur d'élément */
p {
    color: blue;
}

/* Sélecteur de classe */
.my-class {
    font-size: 16px;
}

/* Sélecteur d'ID */
#my-id {
    background-color: yellow;
}

/* Sélecteur d'attribut */
input[type="text"] {
    border: 1px solid gray;
}

/* Pseudo-classes */
a:hover {
    color: red;
}

/* Sélecteur descendant */
div p {
    margin: 10px;
}

/* Sélecteur enfant */
ul > li {
    list-style: none;
}
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<p style="color: blue;">Exemple de sélecteur d'élément</p>
<p class="my-class" style="font-size: 16px;">Exemple de sélecteur de classe</p>
<p id="my-id" style="background-color: yellow;">Exemple de sélecteur d'ID</p>
</div>

## Propriétés de Texte et de Police

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
    Exemple de Texte Stylisé
</div>
</div>

## Modèle de Boîte

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
    Exemple de Modèle de Boîte
</div>
</div>

## Couleurs et Arrière-plans

```css
.color-examples {
    /* Formats de couleur */
    color: red;
    color: #ff0000;
    color: rgb(255, 0, 0);
    color: rgba(255, 0, 0, 0.5);
    color: hsl(0, 100%, 50%);
    
    /* Propriétés d'arrière-plan */
    background-color: lightgreen;
    background-image: url('image.jpg');
    background-repeat: no-repeat;
    background-position: center;
    background-size: cover;
}
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<div style="padding: 10px; background-color: lightgreen; color: red; margin: 5px;">Texte rouge sur fond vert clair</div>
<div style="padding: 10px; background: linear-gradient(45deg, #ff6b6b, #4ecdc4); color: white; margin: 5px;">Arrière-plan dégradé</div>
</div>

## Mise en Page - Flexbox

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
    <div style="background-color: #ff6b6b; padding: 10px; color: white;">Élément 1</div>
    <div style="background-color: #4ecdc4; padding: 10px; color: white;">Élément 2</div>
    <div style="background-color: #45b7d1; padding: 10px; color: white;">Élément 3</div>
</div>
</div>

## Mise en Page - Grid

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
    <div style="background-color: lightcoral; padding: 10px;">Élément Grid 1</div>
    <div style="background-color: lightcoral; padding: 10px;">Élément Grid 2</div>
    <div style="background-color: lightcoral; padding: 10px;">Élément Grid 3</div>
</div>
</div>

## Positionnement

```css
.positioning {
    position: static;    /* Par défaut */
    position: relative;  /* Relatif à la position normale */
    position: absolute;  /* Relatif au parent positionné */
    position: fixed;     /* Relatif au viewport */
    position: sticky;    /* Positionnement collant */
    
    top: 10px;
    right: 20px;
    bottom: 30px;
    left: 40px;
    z-index: 100;
}
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9; position: relative; height: 120px;">
<div style="position: absolute; top: 10px; left: 10px; background-color: yellow; padding: 5px;">Position absolue</div>
<div style="position: relative; top: 50px; background-color: lightblue; padding: 5px; width: fit-content;">Position relative</div>
</div>

## Bordures et Ombres

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
    <span style="text-shadow: 2px 2px 4px rgba(0,0,0,0.5);">Boîte avec bordure, ombre et ombre de texte</span>
</div>
</div>

## Transformations et Animations

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
    Survolez pour l'effet de transformation
</div>
</div>

## Requêtes Media (Design Responsif)

```css
/* Approche mobile d'abord */
.responsive {
    width: 100%;
    padding: 10px;
}

/* Styles pour tablette */
@media screen and (min-width: 768px) {
    .responsive {
        width: 50%;
        padding: 20px;
    }
}

/* Styles pour bureau */
@media screen and (min-width: 1024px) {
    .responsive {
        width: 33.33%;
        padding: 30px;
    }
}
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<div style="background-color: #4ecdc4; padding: 15px; color: white; border-radius: 5px;">
    Élément responsif (redimensionnez la fenêtre pour voir l'effet en implémentation réelle)
</div>
</div>

## Utilitaires CSS Courants

```css
/* Utilitaires d'affichage */
.show { display: block; }
.hide { display: none; }
.invisible { visibility: hidden; }

/* Utilitaires de texte */
.text-center { text-align: center; }
.text-left { text-align: left; }
.text-right { text-align: right; }

/* Utilitaires de marge et padding */
.m-0 { margin: 0; }
.p-2 { padding: 0.5rem; }
.mt-4 { margin-top: 1rem; }

/* Utilitaires de flottement */
.float-left { float: left; }
.float-right { float: right; }
.clearfix::after {
    content: "";
    display: table;
    clear: both;
}
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<div style="text-align: center; padding: 10px; background-color: #e0e0e0; margin-bottom: 5px;">Texte centré</div>
<div style="text-align: left; padding: 10px; background-color: #f0f0f0; margin-bottom: 5px;">Aligné à gauche</div>
<div style="text-align: right; padding: 10px; background-color: #e0e0e0;">Aligné à droite</div>
</div>

Cet aide-mémoire CSS couvre les propriétés et techniques les plus essentielles pour le design web. Pratiquez avec ces propriétés pour maîtriser CSS !