---
title: "TypeScript Cheatsheet"
date: "2017-08-15"
updatedDate: "2025-04-12"
excerpt: "A comprehensive guide to TypeScript fundamentals, types, interfaces, generics and advanced patterns for building type-safe applications."
tags: ["TypeScript", "JavaScript", "Types", "Web Development", "Programming", "Cheatsheet"]
author: "Shun Kushigami"
---

# TypeScript Cheatsheet

A comprehensive guide to TypeScript fundamentals, types, interfaces, generics and advanced patterns for building type-safe applications.

## Basic Types

```typescript
// Primitive types
let message: string = "Hello World";
let count: number = 42;
let isActive: boolean = true;
let nothing: null = null;
let notDefined: undefined = undefined;

// Arrays
let numbers: number[] = [1, 2, 3];
let strings: Array<string> = ["a", "b", "c"];

// Tuple - fixed length array with specific types
let tuple: [string, number] = ["hello", 42];

// Enum
enum Color {
  Red,
  Green,
  Blue
}
let favoriteColor: Color = Color.Blue;

// Any - disables type checking
let dynamic: any = "can be anything";
dynamic = 42;
dynamic = true;

// Unknown - safer alternative to any
let userInput: unknown;
userInput = "hello";
userInput = 42;

// Type assertion
let someValue: unknown = "this is a string";
let strLength: number = (someValue as string).length;
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<strong>Basic Types Example:</strong>
<p>TypeScript provides static type checking at compile time</p>
<p>Use specific types instead of `any` whenever possible</p>
<p>`unknown` is safer than `any` - requires type checking before use</p>
</div>

## Functions and Parameters

```typescript
// Function declaration
function add(x: number, y: number): number {
  return x + y;
}

// Function expression
const multiply = (x: number, y: number): number => {
  return x * y;
};

// Optional parameters
function greet(name: string, title?: string): string {
  return title ? `Hello, ${title} ${name}` : `Hello, ${name}`;
}

// Default parameters
function createUser(name: string, role: string = "user"): object {
  return { name, role };
}

// Rest parameters
function sum(...numbers: number[]): number {
  return numbers.reduce((total, num) => total + num, 0);
}

// Function overloads
function format(value: string): string;
function format(value: number): string;
function format(value: string | number): string {
  return value.toString();
}

// Higher-order functions
function createAdder(baseValue: number): (value: number) => number {
  return (value: number) => baseValue + value;
}

const addFive = createAdder(5);
console.log(addFive(10)); // 15
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<p><strong>Functions Example:</strong></p>
<p>Always specify return types for better documentation</p>
<p>Use optional parameters (?) for flexibility</p>
<p>Function overloads provide multiple type signatures</p>
</div>

## Interfaces and Type Aliases

```typescript
// Interface definition
interface User {
  readonly id: number;
  name: string;
  email: string;
  age?: number; // optional property
}

// Using interface
const user: User = {
  id: 1,
  name: "John Doe",
  email: "john@example.com"
};

// Interface extending
interface Admin extends User {
  permissions: string[];
  lastLogin: Date;
}

// Function interface
interface Calculator {
  (x: number, y: number): number;
}

const calculator: Calculator = (x, y) => x + y;

// Type aliases
type Point = {
  x: number;
  y: number;
};

type StringOrNumber = string | number;
type UserRole = "admin" | "user" | "guest";

// Intersection types
type Employee = User & {
  department: string;
  salary: number;
};

// Index signatures
interface Dictionary {
  [key: string]: any;
}

const config: Dictionary = {
  apiUrl: "https://api.example.com",
  timeout: 5000,
  retries: 3
};
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<p><strong>Interfaces and Types:</strong></p>
<p>Interfaces are extendable, type aliases are not</p>
<p>Use union types (|) for multiple possible types</p>
<p>Intersection types (&) combine multiple types</p>
<p>readonly properties cannot be modified after creation</p>
</div>

## Classes and Access Modifiers

```typescript
// Class with constructor and methods
class Animal {
  private name: string;
  protected species: string;
  public age: number;

  constructor(name: string, species: string, age: number) {
    this.name = name;
    this.species = species;
    this.age = age;
  }

  // Getter
  get getName(): string {
    return this.name;
  }

  // Setter
  set setName(newName: string) {
    if (newName.length > 0) {
      this.name = newName;
    }
  }

  // Public method
  makeSound(): void {
    console.log(`${this.name} makes a sound`);
  }

  // Protected method - accessible in subclasses
  protected move(): void {
    console.log(`${this.name} is moving`);
  }
}

// Inheritance
class Dog extends Animal {
  private breed: string;

  constructor(name: string, age: number, breed: string) {
    super(name, "Canine", age);
    this.breed = breed;
  }

  // Method overriding
  makeSound(): void {
    console.log(`${this.getName()} barks!`);
  }

  // Accessing protected method from parent
  run(): void {
    this.move();
    console.log("Running fast!");
  }
}

// Abstract class
abstract class Shape {
  abstract area(): number;
  
  displayArea(): void {
    console.log(`Area: ${this.area()}`);
  }
}

class Circle extends Shape {
  constructor(private radius: number) {
    super();
  }

  area(): number {
    return Math.PI * this.radius * this.radius;
  }
}

// Implementing interfaces
interface Flyable {
  fly(): void;
}

class Bird extends Animal implements Flyable {
  fly(): void {
    console.log(`${this.getName()} is flying`);
  }
}
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<p><strong>Classes Example:</strong></p>
<p>private: accessible only within the class</p>
<p>protected: accessible within class and subclasses</p>
<p>public: accessible everywhere (default)</p>
<p>Abstract classes cannot be instantiated directly</p>
</div>

## Generics

```typescript
// Generic function
function identity<T>(arg: T): T {
  return arg;
}

let output1 = identity<string>("hello");
let output2 = identity<number>(42);

// Generic with constraints
interface Lengthwise {
  length: number;
}

function logLength<T extends Lengthwise>(arg: T): T {
  console.log(arg.length);
  return arg;
}

logLength("Hello"); // strings have length
logLength([1, 2, 3]); // arrays have length

// Generic interfaces
interface Repository<T> {
  create(item: T): T;
  findById(id: number): T | undefined;
  update(id: number, item: Partial<T>): T;
  delete(id: number): boolean;
}

// Generic classes
class DataStore<T> {
  private data: T[] = [];

  add(item: T): void {
    this.data.push(item);
  }

  get(index: number): T | undefined {
    return this.data[index];
  }

  getAll(): T[] {
    return [...this.data];
  }
}

const userStore = new DataStore<User>();
const numberStore = new DataStore<number>();

// Utility types
interface Person {
  name: string;
  age: number;
  email: string;
}

// Partial - makes all properties optional
type PartialPerson = Partial<Person>;

// Required - makes all properties required
type RequiredPerson = Required<Person>;

// Pick - select specific properties
type PersonContact = Pick<Person, 'name' | 'email'>;

// Omit - exclude specific properties
type PersonWithoutEmail = Omit<Person, 'email'>;

// Record - create object type with specific keys
type UserRoles = Record<string, boolean>;
const permissions: UserRoles = {
  read: true,
  write: false,
  admin: true
};
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<p><strong>Generics Example:</strong></p>
<p>Generics provide reusable, type-safe code</p>
<p>Use constraints with `extends` to limit generic types</p>
<p>Utility types like Partial, Required, Pick are very useful</p>
<p>Record type creates object types with known keys</p>
</div>

## Advanced Types and Patterns

```typescript
// Conditional types
type IsArray<T> = T extends any[] ? true : false;
type Test1 = IsArray<string>; // false
type Test2 = IsArray<number[]>; // true

// Mapped types
type Optional<T> = {
  [P in keyof T]?: T[P];
};

type ReadOnly<T> = {
  readonly [P in keyof T]: T[P];
};

// Template literal types
type EventName<T extends string> = `on${Capitalize<T>}`;
type ButtonEvents = EventName<"click" | "hover">; // "onClick" | "onHover"

// Discriminated unions
interface Square {
  kind: "square";
  size: number;
}

interface Rectangle {
  kind: "rectangle";
  width: number;
  height: number;
}

interface Circle {
  kind: "circle";
  radius: number;
}

type Shape = Square | Rectangle | Circle;

function getArea(shape: Shape): number {
  switch (shape.kind) {
    case "square":
      return shape.size * shape.size;
    case "rectangle":
      return shape.width * shape.height;
    case "circle":
      return Math.PI * shape.radius ** 2;
    default:
      // TypeScript ensures all cases are handled
      const _exhaustive: never = shape;
      return _exhaustive;
  }
}

// Type guards
function isString(value: unknown): value is string {
  return typeof value === "string";
}

function processValue(value: unknown) {
  if (isString(value)) {
    // TypeScript knows value is string here
    console.log(value.toUpperCase());
  }
}

// Namespace
namespace Utils {
  export function formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  export function capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

// Usage: Utils.formatDate(new Date())
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<p><strong>Advanced Patterns:</strong></p>
<p>Conditional types enable type-level programming</p>
<p>Mapped types transform existing types</p>
<p>Discriminated unions ensure type safety with switch statements</p>
<p>Type guards help TypeScript understand runtime types</p>
</div>

## TypeScript with React

```typescript
import React, { useState, useEffect, ReactNode } from 'react';

// Component props interface
interface ButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

// Functional component with TypeScript
const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  disabled = false, 
  onClick 
}) => {
  return (
    <button 
      className={`btn btn-${variant}`}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

// Hook with TypeScript
interface User {
  id: number;
  name: string;
  email: string;
}

function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/users');
        const data: User[] = await response.json();
        setUsers(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return { users, loading, error };
}

// Generic component
interface ListProps<T> {
  items: T[];
  renderItem: (item: T) => ReactNode;
  keyExtractor: (item: T) => string | number;
}

function List<T>({ items, renderItem, keyExtractor }: ListProps<T>) {
  return (
    <ul>
      {items.map(item => (
        <li key={keyExtractor(item)}>
          {renderItem(item)}
        </li>
      ))}
    </ul>
  );
}

// Usage
function App() {
  const { users, loading, error } = useUsers();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <List
        items={users}
        keyExtractor={user => user.id}
        renderItem={user => <span>{user.name}</span>}
      />
    </div>
  );
}
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<p><strong>TypeScript with React:</strong></p>
<p>Use React.FC for functional components (optional in newer versions)</p>
<p>Define proper interfaces for props and state</p>
<p>Generic components provide reusable, type-safe list rendering</p>
<p>Custom hooks should return properly typed objects</p>
</div>

This TypeScript cheatsheet covers the most essential concepts and patterns for modern TypeScript development. Practice these patterns and combine them to build robust, type-safe applications!