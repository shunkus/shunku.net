---
title: "Guía de TypeScript"
date: "2017-08-15"
updatedDate: "2025-04-12"
excerpt: "Una guía completa de los fundamentos de TypeScript, tipos, interfaces, genéricos y patrones avanzados para construir aplicaciones type-safe."
tags: ["TypeScript", "JavaScript", "Tipos", "Desarrollo web", "Programación", "Guía"]
author: "Shun Kushigami"
---

# Guía de TypeScript

Una guía completa de los fundamentos de TypeScript, tipos, interfaces, genéricos y patrones avanzados para construir aplicaciones type-safe.

## Tipos Básicos

```typescript
// Tipos primitivos
let message: string = "Hello World";
let count: number = 42;
let isActive: boolean = true;
let nothing: null = null;
let notDefined: undefined = undefined;

// Arrays
let numbers: number[] = [1, 2, 3];
let strings: Array<string> = ["a", "b", "c"];

// Tuple - array de longitud fija con tipos específicos
let tuple: [string, number] = ["hello", 42];

// Enum
enum Color {
  Red,
  Green,
  Blue
}
let favoriteColor: Color = Color.Blue;

// Any - deshabilita verificación de tipos
let dynamic: any = "puede ser cualquier cosa";
dynamic = 42;
dynamic = true;

// Unknown - alternativa más segura que any
let userInput: unknown;
userInput = "hello";
userInput = 42;

// Aserción de tipos
let someValue: unknown = "esto es una cadena";
let strLength: number = (someValue as string).length;
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<strong>Ejemplo de tipos básicos:</strong>
<p>TypeScript proporciona verificación de tipos estática en tiempo de compilación</p>
<p>Usa tipos específicos en lugar de `any` siempre que sea posible</p>
<p>`unknown` es más seguro que `any` - requiere verificación de tipos antes del uso</p>
</div>

## Funciones y Parámetros

```typescript
// Declaración de función
function add(x: number, y: number): number {
  return x + y;
}

// Expresión de función
const multiply = (x: number, y: number): number => {
  return x * y;
};

// Parámetros opcionales
function greet(name: string, title?: string): string {
  return title ? `Hola, ${title} ${name}` : `Hola, ${name}`;
}

// Parámetros por defecto
function createUser(name: string, role: string = "user"): object {
  return { name, role };
}

// Parámetros rest
function sum(...numbers: number[]): number {
  return numbers.reduce((total, num) => total + num, 0);
}

// Sobrecarga de funciones
function format(value: string): string;
function format(value: number): string;
function format(value: string | number): string {
  return value.toString();
}

// Funciones de orden superior
function createAdder(baseValue: number): (value: number) => number {
  return (value: number) => baseValue + value;
}

const addFive = createAdder(5);
console.log(addFive(10)); // 15
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<p><strong>Ejemplo de funciones:</strong></p>
<p>Siempre especifica tipos de retorno para mejor documentación</p>
<p>Usa parámetros opcionales (?) para flexibilidad</p>
<p>La sobrecarga de funciones proporciona múltiples firmas de tipo</p>
</div>

## Interfaces y Alias de Tipos

```typescript
// Definición de interface
interface User {
  readonly id: number;
  name: string;
  email: string;
  age?: number; // propiedad opcional
}

// Usando interface
const user: User = {
  id: 1,
  name: "Juan Pérez",
  email: "juan@example.com"
};

// Extensión de interface
interface Admin extends User {
  permissions: string[];
  lastLogin: Date;
}

// Interface de función
interface Calculator {
  (x: number, y: number): number;
}

const calculator: Calculator = (x, y) => x + y;

// Alias de tipos
type Point = {
  x: number;
  y: number;
};

type StringOrNumber = string | number;
type UserRole = "admin" | "user" | "guest";

// Tipos de intersección
type Employee = User & {
  department: string;
  salary: number;
};

// Firmas de índice
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
<p><strong>Interfaces y tipos:</strong></p>
<p>Las interfaces son extensibles, los alias de tipos no</p>
<p>Usa tipos unión (|) para múltiples tipos posibles</p>
<p>Los tipos de intersección (&) combinan múltiples tipos</p>
<p>Las propiedades readonly no se pueden modificar después de la creación</p>
</div>

## Clases y Modificadores de Acceso

```typescript
// Clase con constructor y métodos
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

  // Método público
  makeSound(): void {
    console.log(`${this.name} hace un sonido`);
  }

  // Método protegido - accesible en subclases
  protected move(): void {
    console.log(`${this.name} se está moviendo`);
  }
}

// Herencia
class Dog extends Animal {
  private breed: string;

  constructor(name: string, age: number, breed: string) {
    super(name, "Canino", age);
    this.breed = breed;
  }

  // Sobrescritura de método
  makeSound(): void {
    console.log(`${this.getName()} ladra!`);
  }

  // Accediendo al método protegido del padre
  run(): void {
    this.move();
    console.log("¡Corriendo rápido!");
  }
}

// Clase abstracta
abstract class Shape {
  abstract area(): number;
  
  displayArea(): void {
    console.log(`Área: ${this.area()}`);
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

// Implementando interfaces
interface Flyable {
  fly(): void;
}

class Bird extends Animal implements Flyable {
  fly(): void {
    console.log(`${this.getName()} está volando`);
  }
}
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<p><strong>Ejemplo de clases:</strong></p>
<p>private: accesible solo dentro de la clase</p>
<p>protected: accesible dentro de la clase y subclases</p>
<p>public: accesible en todas partes (por defecto)</p>
<p>Las clases abstractas no se pueden instanciar directamente</p>
</div>

## Genéricos

```typescript
// Función genérica
function identity<T>(arg: T): T {
  return arg;
}

let output1 = identity<string>("hello");
let output2 = identity<number>(42);

// Genéricos con restricciones
interface Lengthwise {
  length: number;
}

function logLength<T extends Lengthwise>(arg: T): T {
  console.log(arg.length);
  return arg;
}

logLength("Hello"); // strings tienen longitud
logLength([1, 2, 3]); // arrays tienen longitud

// Interfaces genéricas
interface Repository<T> {
  create(item: T): T;
  findById(id: number): T | undefined;
  update(id: number, item: Partial<T>): T;
  delete(id: number): boolean;
}

// Clases genéricas
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

// Tipos de utilidad
interface Person {
  name: string;
  age: number;
  email: string;
}

// Partial - hace todas las propiedades opcionales
type PartialPerson = Partial<Person>;

// Required - hace todas las propiedades requeridas
type RequiredPerson = Required<Person>;

// Pick - selecciona propiedades específicas
type PersonContact = Pick<Person, 'name' | 'email'>;

// Omit - excluye propiedades específicas
type PersonWithoutEmail = Omit<Person, 'email'>;

// Record - crea tipo de objeto con claves específicas
type UserRoles = Record<string, boolean>;
const permissions: UserRoles = {
  read: true,
  write: false,
  admin: true
};
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<p><strong>Ejemplo de genéricos:</strong></p>
<p>Los genéricos proporcionan código reutilizable y type-safe</p>
<p>Usa restricciones con `extends` para limitar tipos genéricos</p>
<p>Los tipos de utilidad como Partial, Required, Pick son muy útiles</p>
<p>El tipo Record crea tipos de objeto con claves conocidas</p>
</div>

## Tipos Avanzados y Patrones

```typescript
// Tipos condicionales
type IsArray<T> = T extends any[] ? true : false;
type Test1 = IsArray<string>; // false
type Test2 = IsArray<number[]>; // true

// Tipos mapeados
type Optional<T> = {
  [P in keyof T]?: T[P];
};

type ReadOnly<T> = {
  readonly [P in keyof T]: T[P];
};

// Tipos de template literal
type EventName<T extends string> = `on${Capitalize<T>}`;
type ButtonEvents = EventName<"click" | "hover">; // "onClick" | "onHover"

// Uniones discriminadas
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
      // TypeScript asegura que todos los casos están manejados
      const _exhaustive: never = shape;
      return _exhaustive;
  }
}

// Guardias de tipo
function isString(value: unknown): value is string {
  return typeof value === "string";
}

function processValue(value: unknown) {
  if (isString(value)) {
    // Aquí TypeScript sabe que value es string
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

// Uso: Utils.formatDate(new Date())
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<p><strong>Patrones avanzados:</strong></p>
<p>Los tipos condicionales habilitan programación a nivel de tipos</p>
<p>Los tipos mapeados transforman tipos existentes</p>
<p>Las uniones discriminadas aseguran type safety con declaraciones switch</p>
<p>Las guardias de tipo ayudan a TypeScript a entender tipos en tiempo de ejecución</p>
</div>

## TypeScript con React

```typescript
import React, { useState, useEffect, ReactNode } from 'react';

// Interface de props de componente
interface ButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

// Componente funcional con TypeScript
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

// Hook con TypeScript
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
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return { users, loading, error };
}

// Componente genérico
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

// Uso
function App() {
  const { users, loading, error } = useUsers();

  if (loading) return <div>Cargando...</div>;
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
<p><strong>TypeScript con React:</strong></p>
<p>Usa React.FC para componentes funcionales (opcional en versiones nuevas)</p>
<p>Define interfaces apropiadas para props y state</p>
<p>Los componentes genéricos proporcionan renderizado de listas reutilizable y type-safe</p>
<p>Los hooks personalizados deben retornar objetos apropiadamente tipados</p>
</div>

Esta guía de TypeScript cubre los conceptos y patrones más esenciales del desarrollo moderno con TypeScript. ¡Practica estos patrones y combínalos para construir aplicaciones robustas y type-safe!