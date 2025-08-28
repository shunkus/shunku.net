---
title: "CSS Cheat Sheet"
date: "2013-01-20"
updatedDate: "2025-02-15"
excerpt: "A comprehensive guide to essential CSS properties and techniques for web development."
tags: ["CSS", "Web Development", "Styling", "Frontend", "Cheat Sheet"]
---

# CSS Cheat Sheet

A comprehensive guide to essential CSS properties and techniques for web development.

## Basic Syntax

```css
selector {
    property: value;
    another-property: another-value;
}
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<strong>Preview:</strong> CSS follows the selector-property-value pattern
</div>

## Selectors

```css
/* Element selector */
p {
    color: blue;
}

/* Class selector */
.my-class {
    font-size: 16px;
}

/* ID selector */
#my-id {
    background-color: yellow;
}

/* Attribute selector */
input[type="text"] {
    border: 1px solid gray;
}

/* Pseudo-classes */
a:hover {
    color: red;
}

/* Descendant selector */
div p {
    margin: 10px;
}

/* Child selector */
ul > li {
    list-style: none;
}
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<p style="color: blue;">Element selector example</p>
<p class="my-class" style="font-size: 16px;">Class selector example</p>
<p id="my-id" style="background-color: yellow;">ID selector example</p>
</div>

## Text and Font Properties

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
    Styled Text Example
</div>
</div>

## Box Model

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
    Box Model Example
</div>
</div>

## Colors and Backgrounds

```css
.color-examples {
    /* Color formats */
    color: red;
    color: #ff0000;
    color: rgb(255, 0, 0);
    color: rgba(255, 0, 0, 0.5);
    color: hsl(0, 100%, 50%);
    
    /* Background properties */
    background-color: lightgreen;
    background-image: url('image.jpg');
    background-repeat: no-repeat;
    background-position: center;
    background-size: cover;
}
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<div style="padding: 10px; background-color: lightgreen; color: red; margin: 5px;">Red text on light green background</div>
<div style="padding: 10px; background: linear-gradient(45deg, #ff6b6b, #4ecdc4); color: white; margin: 5px;">Gradient background</div>
</div>

## Layout - Flexbox

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
    <div style="background-color: #ff6b6b; padding: 10px; color: white;">Item 1</div>
    <div style="background-color: #4ecdc4; padding: 10px; color: white;">Item 2</div>
    <div style="background-color: #45b7d1; padding: 10px; color: white;">Item 3</div>
</div>
</div>

## Layout - Grid

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
    <div style="background-color: lightcoral; padding: 10px;">Grid Item 1</div>
    <div style="background-color: lightcoral; padding: 10px;">Grid Item 2</div>
    <div style="background-color: lightcoral; padding: 10px;">Grid Item 3</div>
</div>
</div>

## Positioning

```css
.positioning {
    position: static;    /* Default */
    position: relative;  /* Relative to normal position */
    position: absolute;  /* Relative to positioned parent */
    position: fixed;     /* Relative to viewport */
    position: sticky;    /* Sticky positioning */
    
    top: 10px;
    right: 20px;
    bottom: 30px;
    left: 40px;
    z-index: 100;
}
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9; position: relative; height: 120px;">
<div style="position: absolute; top: 10px; left: 10px; background-color: yellow; padding: 5px;">Absolute positioned</div>
<div style="position: relative; top: 50px; background-color: lightblue; padding: 5px; width: fit-content;">Relative positioned</div>
</div>

## Borders and Shadows

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
    <span style="text-shadow: 2px 2px 4px rgba(0,0,0,0.5);">Box with border, shadow, and text shadow</span>
</div>
</div>

## Transforms and Animations

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
    Hover me for transform effect
</div>
</div>

## Media Queries (Responsive Design)

```css
/* Mobile first approach */
.responsive {
    width: 100%;
    padding: 10px;
}

/* Tablet styles */
@media screen and (min-width: 768px) {
    .responsive {
        width: 50%;
        padding: 20px;
    }
}

/* Desktop styles */
@media screen and (min-width: 1024px) {
    .responsive {
        width: 33.33%;
        padding: 30px;
    }
}
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<div style="background-color: #4ecdc4; padding: 15px; color: white; border-radius: 5px;">
    Responsive element (resize window to see effect in real implementation)
</div>
</div>

## Common CSS Utilities

```css
/* Display utilities */
.show { display: block; }
.hide { display: none; }
.invisible { visibility: hidden; }

/* Text utilities */
.text-center { text-align: center; }
.text-left { text-align: left; }
.text-right { text-align: right; }

/* Margin and padding utilities */
.m-0 { margin: 0; }
.p-2 { padding: 0.5rem; }
.mt-4 { margin-top: 1rem; }

/* Float utilities */
.float-left { float: left; }
.float-right { float: right; }
.clearfix::after {
    content: "";
    display: table;
    clear: both;
}
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<div style="text-align: center; padding: 10px; background-color: #e0e0e0; margin-bottom: 5px;">Centered text</div>
<div style="text-align: left; padding: 10px; background-color: #f0f0f0; margin-bottom: 5px;">Left aligned</div>
<div style="text-align: right; padding: 10px; background-color: #e0e0e0;">Right aligned</div>
</div>

This CSS cheat sheet covers the most essential properties and techniques for web styling. Practice with these properties to master CSS!