---
title: "Aide-mémoire JavaScript"
date: "2013-09-12"
updatedDate: "2025-03-08"
excerpt: "Un guide complet de la syntaxe et des fonctionnalités essentielles de JavaScript pour le développement web moderne."
tags: ["JavaScript", "Programmation", "Développement Web", "Frontend", "Aide-mémoire"]
author: "Shun Kushigami"
---

# Aide-mémoire JavaScript

Un guide complet de la syntaxe et des fonctionnalités essentielles de JavaScript pour le développement web moderne.

## Variables et Types de Données

```javascript
// Déclarations de variables
var oldWay = "portée de fonction";
let blockScoped = "portée de bloc";
const constant = "ne peut pas être réassigné";

// Types de données
let string = "Hello World";
let number = 42;
let boolean = true;
let array = [1, 2, 3, 4];
let object = { name: "Pierre", age: 30 };
let nullValue = null;
let undefinedValue = undefined;
let symbol = Symbol("unique");
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<strong>Aperçu :</strong> 
<p>Variables : chaîne : "Hello World", nombre : 42, booléen : true, tableau : [1,2,3,4]</p>
</div>

## Fonctions

```javascript
// Déclaration de fonction
function greet(name) {
    return `Bonjour, ${name} !`;
}

// Expression de fonction
const greetExpression = function(name) {
    return `Bonjour, ${name} !`;
};

// Fonctions fléchées
const greetArrow = (name) => `Bonjour, ${name} !`;
const add = (a, b) => a + b;
const multiply = (a, b) => {
    return a * b;
};

// Paramètres par défaut
function greetWithDefault(name = "Monde") {
    return `Bonjour, ${name} !`;
}

// Paramètres rest
function sum(...numbers) {
    return numbers.reduce((acc, num) => acc + num, 0);
}
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<p><strong>Exemples de fonctions :</strong></p>
<p>greet("Marie") → "Bonjour, Marie !"</p>
<p>add(5, 3) → 8</p>
<p>greetWithDefault() → "Bonjour, Monde !"</p>
<p>sum(1, 2, 3, 4) → 10</p>
</div>

## Objets et Tableaux

```javascript
// Création et manipulation d'objets
const person = {
    name: "Pierre",
    age: 30,
    city: "Paris"
};

// Accès aux propriétés
console.log(person.name);        // "Pierre"
console.log(person["age"]);      // 30

// Ajout/modification de propriétés
person.email = "pierre@example.com";
person.age = 31;

// Déstructuration d'objets
const { name, age } = person;

// Méthodes de tableaux
const numbers = [1, 2, 3, 4, 5];

// Map, filter, reduce
const doubled = numbers.map(n => n * 2);
const evens = numbers.filter(n => n % 2 === 0);
const sum = numbers.reduce((acc, n) => acc + n, 0);

// Déstructuration de tableaux
const [first, second, ...rest] = numbers;
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<p><strong>Exemples d'objets et tableaux :</strong></p>
<p>person.name → "Pierre"</p>
<p>doubled → [2, 4, 6, 8, 10]</p>
<p>evens → [2, 4]</p>
<p>sum → 15</p>
<p>first → 1, second → 2, rest → [3, 4, 5]</p>
</div>

## Contrôle de Flux

```javascript
// Instructions if
if (condition) {
    // code
} else if (anotherCondition) {
    // code
} else {
    // code
}

// Opérateur ternaire
const result = condition ? "valeur vraie" : "valeur fausse";

// Instruction switch
switch (value) {
    case 1:
        console.log("Un");
        break;
    case 2:
        console.log("Deux");
        break;
    default:
        console.log("Autre");
}

// Boucles
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
    // code
}
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<p><strong>Exemples de contrôle de flux :</strong></p>
<p>Opérateur ternaire : true ? "oui" : "non" → "oui"</p>
<p>Boucle for : 0, 1, 2, 3, 4</p>
<p>For-of : itère sur les valeurs</p>
<p>For-in : itère sur les clés</p>
</div>

## Classes et Objets

```javascript
// Classes ES6
class Person {
    constructor(name, age) {
        this.name = name;
        this.age = age;
    }
    
    greet() {
        return `Bonjour, je suis ${this.name}`;
    }
    
    static species() {
        return "Homo sapiens";
    }
}

// Héritage
class Student extends Person {
    constructor(name, age, grade) {
        super(name, age);
        this.grade = grade;
    }
    
    study() {
        return `${this.name} étudie`;
    }
}

// Création d'objets
const pierre = new Person("Pierre", 30);
const marie = new Student("Marie", 20, "A");
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<p><strong>Exemples de classes :</strong></p>
<p>pierre.greet() → "Bonjour, je suis Pierre"</p>
<p>Person.species() → "Homo sapiens"</p>
<p>marie.study() → "Marie étudie"</p>
</div>

## Promises et Async/Await

```javascript
// Promises
const fetchData = () => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve("Données récupérées avec succès");
        }, 1000);
    });
};

// Chaînage de promises
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

// Opérations asynchrones multiples
async function getMultipleData() {
    const [data1, data2] = await Promise.all([
        fetchData(),
        fetchData()
    ]);
    return { data1, data2 };
}
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<p><strong>Exemples asynchrones :</strong></p>
<p>Promise se résout après 1 seconde</p>
<p>async/await fournit une syntaxe plus propre</p>
<p>Promise.all() exécute les opérations en parallèle</p>
</div>

## Manipulation du DOM

```javascript
// Sélection d'éléments
const element = document.getElementById('myId');
const elements = document.querySelectorAll('.myClass');
const firstElement = document.querySelector('.myClass');

// Création d'éléments
const newDiv = document.createElement('div');
newDiv.textContent = 'Hello World';
newDiv.className = 'my-class';

// Modification d'éléments
element.textContent = 'Nouveau texte';
element.innerHTML = '<strong>Texte en gras</strong>';
element.style.color = 'red';
element.setAttribute('data-value', '123');

// Écouteurs d'événements
element.addEventListener('click', function(event) {
    console.log('Élément cliqué !');
});

// Écouteur d'événement avec fonction fléchée
element.addEventListener('click', (event) => {
    event.preventDefault();
    console.log('Cliqué avec fonction fléchée');
});
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<p><strong>Exemples de DOM :</strong></p>
<button onclick="alert('Bouton cliqué !')">Cliquez-moi !</button>
<p id="demo-text-fr" style="color: blue;">Ce texte peut être modifié</p>
<script>
setTimeout(() => {
    const demoText = document.getElementById('demo-text-fr');
    if (demoText) {
        demoText.textContent = 'Texte modifié par JavaScript !';
        demoText.style.color = 'green';
    }
}, 2000);
</script>
</div>

## Gestion des Erreurs

```javascript
// Blocs try-catch
try {
    const result = riskyOperation();
    console.log(result);
} catch (error) {
    console.error('Une erreur s\'est produite :', error.message);
} finally {
    console.log('Ceci s\'exécute toujours');
}

// Erreurs personnalisées
class CustomError extends Error {
    constructor(message) {
        super(message);
        this.name = 'CustomError';
    }
}

function validateAge(age) {
    if (age < 0) {
        throw new CustomError('L\'âge ne peut pas être négatif');
    }
    return true;
}

// Gestion des erreurs avec async/await
async function handleAsyncError() {
    try {
        const data = await fetchData();
        return data;
    } catch (error) {
        console.error('Erreur asynchrone :', error);
        throw error;
    }
}
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<p><strong>Gestion des erreurs :</strong></p>
<p>Les blocs try-catch gèrent les erreurs synchrones</p>
<p>Les erreurs personnalisées fournissent des types d'erreur spécifiques</p>
<p>Gestion des erreurs asynchrones avec try-catch dans les fonctions async</p>
</div>

## Fonctionnalités ES6+

```javascript
// Littéraux de gabarit
const name = "Monde";
const greeting = `Bonjour, ${name} !`;
const multiline = `
    Ceci est une
    chaîne multi-lignes
`;

// Déstructuration
const [a, b, ...rest] = [1, 2, 3, 4, 5];
const {x, y, z = 'par défaut'} = {x: 1, y: 2};

// Opérateur de propagation
const arr1 = [1, 2, 3];
const arr2 = [4, 5, 6];
const combined = [...arr1, ...arr2];

const obj1 = {a: 1, b: 2};
const obj2 = {c: 3, d: 4};
const combinedObj = {...obj1, ...obj2};

// Chaînage optionnel
const user = {
    profile: {
        name: 'Pierre'
    }
};
const userName = user?.profile?.name; // "Pierre"
const userAge = user?.profile?.age; // undefined

// Coalescence nulle
const value = null ?? 'par défaut'; // "par défaut"
const value2 = '' ?? 'par défaut'; // "" (chaîne vide n'est pas null/undefined)
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<p><strong>Exemples ES6+ :</strong></p>
<p>Littéral de gabarit : `Bonjour, ${name} !` → "Bonjour, Monde !"</p>
<p>Propagation : [...[1,2], ...[3,4]] → [1, 2, 3, 4]</p>
<p>Le chaînage optionnel prévient les erreurs sur les propriétés undefined</p>
<p>Coalescence nulle : null ?? 'par défaut' → 'par défaut'</p>
</div>

## Utilitaires Courants

```javascript
// Vérification de types
typeof "hello"; // "string"
typeof 42; // "number"
typeof true; // "boolean"
typeof undefined; // "undefined"
typeof null; // "object" (bug !)
Array.isArray([1, 2, 3]); // true

// Méthodes de chaîne
"hello world".toUpperCase(); // "HELLO WORLD"
"  hello  ".trim(); // "hello"
"hello,world".split(","); // ["hello", "world"]
"hello".includes("ell"); // true

// Méthodes de nombres
parseInt("123"); // 123
parseFloat("123.45"); // 123.45
Math.round(123.456); // 123
Math.max(1, 2, 3); // 3
Math.random(); // 0 à 1

// Gestion des dates
const now = new Date();
const timestamp = Date.now();
const dateString = now.toISOString();
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<p><strong>Exemples d'utilitaires :</strong></p>
<p>typeof "hello" → "string"</p>
<p>"HELLO".toLowerCase() → "hello"</p>
<p>Math.round(4.7) → 5</p>
<p>Timestamp actuel : <span id="timestamp-fr"></span></p>
<script>
document.getElementById('timestamp-fr').textContent = Date.now();
</script>
</div>

Cet aide-mémoire JavaScript couvre les fonctionnalités et syntaxes les plus essentielles pour le développement web moderne. Pratiquez avec ces concepts pour maîtriser JavaScript !