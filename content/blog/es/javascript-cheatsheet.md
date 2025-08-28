---
title: "Hoja de Referencia JavaScript"
date: "2013-09-12"
updatedDate: "2025-03-08"
excerpt: "Una guía completa de sintaxis y características esenciales de JavaScript para el desarrollo web moderno."
tags: ["JavaScript", "Programación", "Desarrollo Web", "Frontend", "Hoja de Referencia"]
author: "Shun Kushigami"
---

# Hoja de Referencia JavaScript

Una guía completa de sintaxis y características esenciales de JavaScript para el desarrollo web moderno.

## Variables y Tipos de Datos

```javascript
// Declaraciones de variables
var oldWay = "ámbito de función";
let blockScoped = "ámbito de bloque";
const constant = "no se puede reasignar";

// Tipos de datos
let string = "Hello World";
let number = 42;
let boolean = true;
let array = [1, 2, 3, 4];
let object = { name: "Juan", age: 30 };
let nullValue = null;
let undefinedValue = undefined;
let symbol = Symbol("único");
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<strong>Vista previa:</strong> 
<p>Variables: cadena: "Hello World", número: 42, booleano: true, array: [1,2,3,4]</p>
</div>

## Funciones

```javascript
// Declaración de función
function greet(name) {
    return `¡Hola, ${name}!`;
}

// Expresión de función
const greetExpression = function(name) {
    return `¡Hola, ${name}!`;
};

// Funciones flecha
const greetArrow = (name) => `¡Hola, ${name}!`;
const add = (a, b) => a + b;
const multiply = (a, b) => {
    return a * b;
};

// Parámetros por defecto
function greetWithDefault(name = "Mundo") {
    return `¡Hola, ${name}!`;
}

// Parámetros rest
function sum(...numbers) {
    return numbers.reduce((acc, num) => acc + num, 0);
}
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<p><strong>Ejemplos de funciones:</strong></p>
<p>greet("María") → "¡Hola, María!"</p>
<p>add(5, 3) → 8</p>
<p>greetWithDefault() → "¡Hola, Mundo!"</p>
<p>sum(1, 2, 3, 4) → 10</p>
</div>

## Objetos y Arrays

```javascript
// Creación y manipulación de objetos
const person = {
    name: "Juan",
    age: 30,
    city: "Madrid"
};

// Acceso a propiedades
console.log(person.name);        // "Juan"
console.log(person["age"]);      // 30

// Agregar/modificar propiedades
person.email = "juan@example.com";
person.age = 31;

// Desestructuración de objetos
const { name, age } = person;

// Métodos de arrays
const numbers = [1, 2, 3, 4, 5];

// Map, filter, reduce
const doubled = numbers.map(n => n * 2);
const evens = numbers.filter(n => n % 2 === 0);
const sum = numbers.reduce((acc, n) => acc + n, 0);

// Desestructuración de arrays
const [first, second, ...rest] = numbers;
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<p><strong>Ejemplos de objetos y arrays:</strong></p>
<p>person.name → "Juan"</p>
<p>doubled → [2, 4, 6, 8, 10]</p>
<p>evens → [2, 4]</p>
<p>sum → 15</p>
<p>first → 1, second → 2, rest → [3, 4, 5]</p>
</div>

## Control de Flujo

```javascript
// Declaraciones if
if (condition) {
    // código
} else if (anotherCondition) {
    // código
} else {
    // código
}

// Operador ternario
const result = condition ? "valor verdadero" : "valor falso";

// Declaración switch
switch (value) {
    case 1:
        console.log("Uno");
        break;
    case 2:
        console.log("Dos");
        break;
    default:
        console.log("Otro");
}

// Bucles
for (let i = 0; i < 5; i++) {
    console.log(i);
}

for (const item of array) {
    console.log(item);
}

for (const key in object) {
    console.log(key, object[key]);
}

while (condition) {
    // código
}
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<p><strong>Ejemplos de control de flujo:</strong></p>
<p>Operador ternario: true ? "sí" : "no" → "sí"</p>
<p>Bucle for: 0, 1, 2, 3, 4</p>
<p>For-of: itera sobre valores</p>
<p>For-in: itera sobre claves</p>
</div>

## Clases y Objetos

```javascript
// Clases ES6
class Person {
    constructor(name, age) {
        this.name = name;
        this.age = age;
    }
    
    greet() {
        return `Hola, soy ${this.name}`;
    }
    
    static species() {
        return "Homo sapiens";
    }
}

// Herencia
class Student extends Person {
    constructor(name, age, grade) {
        super(name, age);
        this.grade = grade;
    }
    
    study() {
        return `${this.name} está estudiando`;
    }
}

// Creación de objetos
const juan = new Person("Juan", 30);
const maria = new Student("María", 20, "A");
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<p><strong>Ejemplos de clases:</strong></p>
<p>juan.greet() → "Hola, soy Juan"</p>
<p>Person.species() → "Homo sapiens"</p>
<p>maria.study() → "María está estudiando"</p>
</div>

## Promises y Async/Await

```javascript
// Promises
const fetchData = () => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve("Datos obtenidos exitosamente");
        }, 1000);
    });
};

// Encadenamiento de promises
fetchData()
    .then(data => console.log(data))
    .catch(error => console.error(error));

// Async/Await
async function getData() {
    try {
        const data = await fetchData();
        console.log(data);
        return data;
    } catch (error) {
        console.error(error);
    }
}

// Múltiples operaciones asíncronas
async function getMultipleData() {
    const [data1, data2] = await Promise.all([
        fetchData(),
        fetchData()
    ]);
    return { data1, data2 };
}
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<p><strong>Ejemplos asíncronos:</strong></p>
<p>Promise se resuelve después de 1 segundo</p>
<p>async/await proporciona sintaxis más limpia</p>
<p>Promise.all() ejecuta operaciones concurrentemente</p>
</div>

## Manipulación del DOM

```javascript
// Selección de elementos
const element = document.getElementById('myId');
const elements = document.querySelectorAll('.myClass');
const firstElement = document.querySelector('.myClass');

// Creación de elementos
const newDiv = document.createElement('div');
newDiv.textContent = 'Hello World';
newDiv.className = 'my-class';

// Modificación de elementos
element.textContent = 'Nuevo texto';
element.innerHTML = '<strong>Texto en negrita</strong>';
element.style.color = 'red';
element.setAttribute('data-value', '123');

// Event listeners
element.addEventListener('click', function(event) {
    console.log('¡Elemento clickeado!');
});

// Event listener con función flecha
element.addEventListener('click', (event) => {
    event.preventDefault();
    console.log('Clickeado con función flecha');
});
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<p><strong>Ejemplos de DOM:</strong></p>
<button onclick="alert('¡Botón clickeado!')">¡Haz clic!</button>
<p id="demo-text-es" style="color: blue;">Este texto puede ser modificado</p>
<script>
setTimeout(() => {
    const demoText = document.getElementById('demo-text-es');
    if (demoText) {
        demoText.textContent = '¡Texto modificado por JavaScript!';
        demoText.style.color = 'green';
    }
}, 2000);
</script>
</div>

## Manejo de Errores

```javascript
// Bloques try-catch
try {
    const result = riskyOperation();
    console.log(result);
} catch (error) {
    console.error('Ocurrió un error:', error.message);
} finally {
    console.log('Esto siempre se ejecuta');
}

// Errores personalizados
class CustomError extends Error {
    constructor(message) {
        super(message);
        this.name = 'CustomError';
    }
}

function validateAge(age) {
    if (age < 0) {
        throw new CustomError('La edad no puede ser negativa');
    }
    return true;
}

// Manejo de errores con async/await
async function handleAsyncError() {
    try {
        const data = await fetchData();
        return data;
    } catch (error) {
        console.error('Error asíncrono:', error);
        throw error;
    }
}
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<p><strong>Manejo de errores:</strong></p>
<p>Los bloques try-catch manejan errores síncronos</p>
<p>Los errores personalizados proporcionan tipos específicos de error</p>
<p>Manejo de errores asíncronos con try-catch en funciones async</p>
</div>

## Características ES6+

```javascript
// Literales de plantilla
const name = "Mundo";
const greeting = `¡Hola, ${name}!`;
const multiline = `
    Esta es una
    cadena multilínea
`;

// Desestructuración
const [a, b, ...rest] = [1, 2, 3, 4, 5];
const {x, y, z = 'predeterminado'} = {x: 1, y: 2};

// Operador spread
const arr1 = [1, 2, 3];
const arr2 = [4, 5, 6];
const combined = [...arr1, ...arr2];

const obj1 = {a: 1, b: 2};
const obj2 = {c: 3, d: 4};
const combinedObj = {...obj1, ...obj2};

// Encadenamiento opcional
const user = {
    profile: {
        name: 'Juan'
    }
};
const userName = user?.profile?.name; // "Juan"
const userAge = user?.profile?.age; // undefined

// Coalescencia nula
const value = null ?? 'predeterminado'; // "predeterminado"
const value2 = '' ?? 'predeterminado'; // "" (cadena vacía no es null/undefined)
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<p><strong>Ejemplos ES6+:</strong></p>
<p>Literal de plantilla: `¡Hola, ${name}!` → "¡Hola, Mundo!"</p>
<p>Spread: [...[1,2], ...[3,4]] → [1, 2, 3, 4]</p>
<p>El encadenamiento opcional previene errores en propiedades undefined</p>
<p>Coalescencia nula: null ?? 'predeterminado' → 'predeterminado'</p>
</div>

## Utilidades Comunes

```javascript
// Verificación de tipos
typeof "hello"; // "string"
typeof 42; // "number"
typeof true; // "boolean"
typeof undefined; // "undefined"
typeof null; // "object" (¡bug!)
Array.isArray([1, 2, 3]); // true

// Métodos de cadena
"hello world".toUpperCase(); // "HELLO WORLD"
"  hello  ".trim(); // "hello"
"hello,world".split(","); // ["hello", "world"]
"hello".includes("ell"); // true

// Métodos de números
parseInt("123"); // 123
parseFloat("123.45"); // 123.45
Math.round(123.456); // 123
Math.max(1, 2, 3); // 3
Math.random(); // 0 a 1

// Manejo de fechas
const now = new Date();
const timestamp = Date.now();
const dateString = now.toISOString();
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<p><strong>Ejemplos de utilidades:</strong></p>
<p>typeof "hello" → "string"</p>
<p>"HELLO".toLowerCase() → "hello"</p>
<p>Math.round(4.7) → 5</p>
<p>Timestamp actual: <span id="timestamp-es"></span></p>
<script>
document.getElementById('timestamp-es').textContent = Date.now();
</script>
</div>

Esta hoja de referencia de JavaScript cubre las características y sintaxis más esenciales para el desarrollo web moderno. ¡Practica con estos conceptos para dominar JavaScript!