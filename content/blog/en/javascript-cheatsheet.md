---
title: "JavaScript Cheat Sheet"
date: "2013-09-12"
updatedDate: "2025-03-08"
excerpt: "A comprehensive guide to essential JavaScript syntax and features for modern web development."
tags: ["JavaScript", "Programming", "Web Development", "Frontend", "Cheat Sheet"]
author: "Shun Kushigami"
---

# JavaScript Cheat Sheet

A comprehensive guide to essential JavaScript syntax and features for modern web development.

## Variables and Data Types

```javascript
// Variable declarations
var oldWay = "function scoped";
let blockScoped = "block scoped";
const constant = "cannot reassign";

// Data types
let string = "Hello World";
let number = 42;
let boolean = true;
let array = [1, 2, 3, 4];
let object = { name: "John", age: 30 };
let nullValue = null;
let undefinedValue = undefined;
let symbol = Symbol("unique");
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<strong>Preview:</strong> 
<script>
const demo1 = () => {
  let result = "Variables: ";
  result += `string: "${string}", `;
  result += `number: ${42}, `;
  result += `boolean: ${true}, `;
  result += `array: [${[1,2,3,4]}]`;
  return result;
};
</script>
<p>Variables: string: "Hello World", number: 42, boolean: true, array: [1,2,3,4]</p>
</div>

## Functions

```javascript
// Function declaration
function greet(name) {
    return `Hello, ${name}!`;
}

// Function expression
const greetExpression = function(name) {
    return `Hello, ${name}!`;
};

// Arrow functions
const greetArrow = (name) => `Hello, ${name}!`;
const add = (a, b) => a + b;
const multiply = (a, b) => {
    return a * b;
};

// Default parameters
function greetWithDefault(name = "World") {
    return `Hello, ${name}!`;
}

// Rest parameters
function sum(...numbers) {
    return numbers.reduce((acc, num) => acc + num, 0);
}
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<p><strong>Function Examples:</strong></p>
<p>greet("Alice") → "Hello, Alice!"</p>
<p>add(5, 3) → 8</p>
<p>greetWithDefault() → "Hello, World!"</p>
<p>sum(1, 2, 3, 4) → 10</p>
</div>

## Objects and Arrays

```javascript
// Object creation and manipulation
const person = {
    name: "John",
    age: 30,
    city: "New York"
};

// Accessing properties
console.log(person.name);        // "John"
console.log(person["age"]);      // 30

// Adding/modifying properties
person.email = "john@example.com";
person.age = 31;

// Object destructuring
const { name, age } = person;

// Array methods
const numbers = [1, 2, 3, 4, 5];

// Map, filter, reduce
const doubled = numbers.map(n => n * 2);
const evens = numbers.filter(n => n % 2 === 0);
const sum = numbers.reduce((acc, n) => acc + n, 0);

// Array destructuring
const [first, second, ...rest] = numbers;
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<p><strong>Object and Array Examples:</strong></p>
<p>person.name → "John"</p>
<p>doubled → [2, 4, 6, 8, 10]</p>
<p>evens → [2, 4]</p>
<p>sum → 15</p>
<p>first → 1, second → 2, rest → [3, 4, 5]</p>
</div>

## Control Flow

```javascript
// If statements
if (condition) {
    // code
} else if (anotherCondition) {
    // code
} else {
    // code
}

// Ternary operator
const result = condition ? "true value" : "false value";

// Switch statement
switch (value) {
    case 1:
        console.log("One");
        break;
    case 2:
        console.log("Two");
        break;
    default:
        console.log("Other");
}

// Loops
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
<p><strong>Control Flow Examples:</strong></p>
<p>Ternary: true ? "yes" : "no" → "yes"</p>
<p>For loop: 0, 1, 2, 3, 4</p>
<p>For-of: iterates over values</p>
<p>For-in: iterates over keys</p>
</div>

## Classes and Objects

```javascript
// ES6 Classes
class Person {
    constructor(name, age) {
        this.name = name;
        this.age = age;
    }
    
    greet() {
        return `Hello, I'm ${this.name}`;
    }
    
    static species() {
        return "Homo sapiens";
    }
}

// Inheritance
class Student extends Person {
    constructor(name, age, grade) {
        super(name, age);
        this.grade = grade;
    }
    
    study() {
        return `${this.name} is studying`;
    }
}

// Object creation
const john = new Person("John", 30);
const alice = new Student("Alice", 20, "A");
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<p><strong>Class Examples:</strong></p>
<p>john.greet() → "Hello, I'm John"</p>
<p>Person.species() → "Homo sapiens"</p>
<p>alice.study() → "Alice is studying"</p>
</div>

## Promises and Async/Await

```javascript
// Promises
const fetchData = () => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve("Data fetched successfully");
        }, 1000);
    });
};

// Promise chaining
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

// Multiple async operations
async function getMultipleData() {
    const [data1, data2] = await Promise.all([
        fetchData(),
        fetchData()
    ]);
    return { data1, data2 };
}
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<p><strong>Async Examples:</strong></p>
<p>Promise resolves after 1 second</p>
<p>async/await provides cleaner syntax</p>
<p>Promise.all() runs operations concurrently</p>
</div>

## DOM Manipulation

```javascript
// Selecting elements
const element = document.getElementById('myId');
const elements = document.querySelectorAll('.myClass');
const firstElement = document.querySelector('.myClass');

// Creating elements
const newDiv = document.createElement('div');
newDiv.textContent = 'Hello World';
newDiv.className = 'my-class';

// Modifying elements
element.textContent = 'New text';
element.innerHTML = '<strong>Bold text</strong>';
element.style.color = 'red';
element.setAttribute('data-value', '123');

// Event listeners
element.addEventListener('click', function(event) {
    console.log('Element clicked!');
});

// Arrow function event listener
element.addEventListener('click', (event) => {
    event.preventDefault();
    console.log('Clicked with arrow function');
});
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<p><strong>DOM Examples:</strong></p>
<button onclick="alert('Button clicked!')">Click me!</button>
<p id="demo-text" style="color: blue;">This text can be modified</p>
<script>
setTimeout(() => {
    const demoText = document.getElementById('demo-text');
    if (demoText) {
        demoText.textContent = 'Text modified by JavaScript!';
        demoText.style.color = 'green';
    }
}, 2000);
</script>
</div>

## Error Handling

```javascript
// Try-catch blocks
try {
    const result = riskyOperation();
    console.log(result);
} catch (error) {
    console.error('An error occurred:', error.message);
} finally {
    console.log('This always runs');
}

// Custom errors
class CustomError extends Error {
    constructor(message) {
        super(message);
        this.name = 'CustomError';
    }
}

function validateAge(age) {
    if (age < 0) {
        throw new CustomError('Age cannot be negative');
    }
    return true;
}

// Error handling with async/await
async function handleAsyncError() {
    try {
        const data = await fetchData();
        return data;
    } catch (error) {
        console.error('Async error:', error);
        throw error;
    }
}
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<p><strong>Error Handling:</strong></p>
<p>Try-catch blocks handle synchronous errors</p>
<p>Custom errors provide specific error types</p>
<p>Async error handling with try-catch in async functions</p>
</div>

## ES6+ Features

```javascript
// Template literals
const name = "World";
const greeting = `Hello, ${name}!`;
const multiline = `
    This is a
    multiline string
`;

// Destructuring
const [a, b, ...rest] = [1, 2, 3, 4, 5];
const {x, y, z = 'default'} = {x: 1, y: 2};

// Spread operator
const arr1 = [1, 2, 3];
const arr2 = [4, 5, 6];
const combined = [...arr1, ...arr2];

const obj1 = {a: 1, b: 2};
const obj2 = {c: 3, d: 4};
const combinedObj = {...obj1, ...obj2};

// Optional chaining
const user = {
    profile: {
        name: 'John'
    }
};
const userName = user?.profile?.name; // "John"
const userAge = user?.profile?.age; // undefined

// Nullish coalescing
const value = null ?? 'default'; // "default"
const value2 = '' ?? 'default'; // "" (empty string is not null/undefined)
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<p><strong>ES6+ Examples:</strong></p>
<p>Template literal: `Hello, ${name}!` → "Hello, World!"</p>
<p>Spread: [...[1,2], ...[3,4]] → [1, 2, 3, 4]</p>
<p>Optional chaining prevents errors on undefined properties</p>
<p>Nullish coalescing: null ?? 'default' → 'default'</p>
</div>

## Common Utilities

```javascript
// Type checking
typeof "hello"; // "string"
typeof 42; // "number"
typeof true; // "boolean"
typeof undefined; // "undefined"
typeof null; // "object" (quirk!)
Array.isArray([1, 2, 3]); // true

// String methods
"hello world".toUpperCase(); // "HELLO WORLD"
"  hello  ".trim(); // "hello"
"hello,world".split(","); // ["hello", "world"]
"hello".includes("ell"); // true

// Number methods
parseInt("123"); // 123
parseFloat("123.45"); // 123.45
Math.round(123.456); // 123
Math.max(1, 2, 3); // 3
Math.random(); // 0 to 1

// Date handling
const now = new Date();
const timestamp = Date.now();
const dateString = now.toISOString();
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<p><strong>Utility Examples:</strong></p>
<p>typeof "hello" → "string"</p>
<p>"HELLO".toLowerCase() → "hello"</p>
<p>Math.round(4.7) → 5</p>
<p>Current timestamp: <span id="timestamp"></span></p>
<script>
document.getElementById('timestamp').textContent = Date.now();
</script>
</div>

This JavaScript cheat sheet covers the most essential features and syntax for modern web development. Practice with these concepts to master JavaScript!