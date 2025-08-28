---
title: "Guide TypeScript"
date: "2017-08-15"
updatedDate: "2025-04-12"
excerpt: "Un guide complet des fondamentaux de TypeScript, types, interfaces, génériques et patterns avancés pour construire des applications type-safe."
tags: ["TypeScript", "JavaScript", "Types", "Développement web", "Programmation", "Guide"]
author: "Shun Kushigami"
---

# Guide TypeScript

Un guide complet des fondamentaux de TypeScript, types, interfaces, génériques et patterns avancés pour construire des applications type-safe.

## Types de Base

```typescript
// Types primitifs
let message: string = "Hello World";
let count: number = 42;
let isActive: boolean = true;
let nothing: null = null;
let notDefined: undefined = undefined;

// Tableaux
let numbers: number[] = [1, 2, 3];
let strings: Array<string> = ["a", "b", "c"];

// Tuple - tableau de longueur fixe avec types spécifiques
let tuple: [string, number] = ["hello", 42];

// Enum
enum Color {
  Red,
  Green,
  Blue
}
let favoriteColor: Color = Color.Blue;

// Any - désactive la vérification de types
let dynamic: any = "peut être n'importe quoi";
dynamic = 42;
dynamic = true;

// Unknown - alternative plus sûre à any
let userInput: unknown;
userInput = "hello";
userInput = 42;

// Assertion de type
let someValue: unknown = "ceci est une chaîne";
let strLength: number = (someValue as string).length;
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<strong>Exemple de types de base :</strong>
<p>TypeScript fournit une vérification de types statique à la compilation</p>
<p>Utilisez des types spécifiques au lieu d'`any` autant que possible</p>
<p>`unknown` est plus sûr qu'`any` - nécessite une vérification de type avant utilisation</p>
</div>

## Fonctions et Paramètres

```typescript
// Déclaration de fonction
function add(x: number, y: number): number {
  return x + y;
}

// Expression de fonction
const multiply = (x: number, y: number): number => {
  return x * y;
};

// Paramètres optionnels
function greet(name: string, title?: string): string {
  return title ? `Bonjour, ${title} ${name}` : `Bonjour, ${name}`;
}

// Paramètres par défaut
function createUser(name: string, role: string = "user"): object {
  return { name, role };
}

// Paramètres rest
function sum(...numbers: number[]): number {
  return numbers.reduce((total, num) => total + num, 0);
}

// Surcharge de fonctions
function format(value: string): string;
function format(value: number): string;
function format(value: string | number): string {
  return value.toString();
}

// Fonctions d'ordre supérieur
function createAdder(baseValue: number): (value: number) => number {
  return (value: number) => baseValue + value;
}

const addFive = createAdder(5);
console.log(addFive(10)); // 15
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<p><strong>Exemple de fonctions :</strong></p>
<p>Spécifiez toujours les types de retour pour une meilleure documentation</p>
<p>Utilisez des paramètres optionnels (?) pour la flexibilité</p>
<p>La surcharge de fonctions fournit plusieurs signatures de type</p>
</div>

## Interfaces et Alias de Types

```typescript
// Définition d'interface
interface User {
  readonly id: number;
  name: string;
  email: string;
  age?: number; // propriété optionnelle
}

// Utilisation de l'interface
const user: User = {
  id: 1,
  name: "Pierre Dupont",
  email: "pierre@example.com"
};

// Extension d'interface
interface Admin extends User {
  permissions: string[];
  lastLogin: Date;
}

// Interface de fonction
interface Calculator {
  (x: number, y: number): number;
}

const calculator: Calculator = (x, y) => x + y;

// Alias de types
type Point = {
  x: number;
  y: number;
};

type StringOrNumber = string | number;
type UserRole = "admin" | "user" | "guest";

// Types d'intersection
type Employee = User & {
  department: string;
  salary: number;
};

// Signatures d'index
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
<p><strong>Interfaces et types :</strong></p>
<p>Les interfaces sont extensibles, les alias de types ne le sont pas</p>
<p>Utilisez les types union (|) pour plusieurs types possibles</p>
<p>Les types d'intersection (&) combinent plusieurs types</p>
<p>Les propriétés readonly ne peuvent pas être modifiées après création</p>
</div>

## Classes et Modificateurs d'Accès

```typescript
// Classe avec constructeur et méthodes
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

  // Méthode publique
  makeSound(): void {
    console.log(`${this.name} fait du bruit`);
  }

  // Méthode protégée - accessible dans les sous-classes
  protected move(): void {
    console.log(`${this.name} bouge`);
  }
}

// Héritage
class Dog extends Animal {
  private breed: string;

  constructor(name: string, age: number, breed: string) {
    super(name, "Canin", age);
    this.breed = breed;
  }

  // Redéfinition de méthode
  makeSound(): void {
    console.log(`${this.getName()} aboie !`);
  }

  // Accès à la méthode protégée du parent
  run(): void {
    this.move();
    console.log("Court rapidement !");
  }
}

// Classe abstraite
abstract class Shape {
  abstract area(): number;
  
  displayArea(): void {
    console.log(`Aire : ${this.area()}`);
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

// Implémentation d'interfaces
interface Flyable {
  fly(): void;
}

class Bird extends Animal implements Flyable {
  fly(): void {
    console.log(`${this.getName()} vole`);
  }
}
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<p><strong>Exemple de classes :</strong></p>
<p>private : accessible uniquement dans la classe</p>
<p>protected : accessible dans la classe et les sous-classes</p>
<p>public : accessible partout (par défaut)</p>
<p>Les classes abstraites ne peuvent pas être instanciées directement</p>
</div>

## Génériques

```typescript
// Fonction générique
function identity<T>(arg: T): T {
  return arg;
}

let output1 = identity<string>("hello");
let output2 = identity<number>(42);

// Génériques avec contraintes
interface Lengthwise {
  length: number;
}

function logLength<T extends Lengthwise>(arg: T): T {
  console.log(arg.length);
  return arg;
}

logLength("Hello"); // les chaînes ont une longueur
logLength([1, 2, 3]); // les tableaux ont une longueur

// Interfaces génériques
interface Repository<T> {
  create(item: T): T;
  findById(id: number): T | undefined;
  update(id: number, item: Partial<T>): T;
  delete(id: number): boolean;
}

// Classes génériques
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

// Types utilitaires
interface Person {
  name: string;
  age: number;
  email: string;
}

// Partial - rend toutes les propriétés optionnelles
type PartialPerson = Partial<Person>;

// Required - rend toutes les propriétés requises
type RequiredPerson = Required<Person>;

// Pick - sélectionne des propriétés spécifiques
type PersonContact = Pick<Person, 'name' | 'email'>;

// Omit - exclut des propriétés spécifiques
type PersonWithoutEmail = Omit<Person, 'email'>;

// Record - crée un type d'objet avec des clés spécifiques
type UserRoles = Record<string, boolean>;
const permissions: UserRoles = {
  read: true,
  write: false,
  admin: true
};
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<p><strong>Exemple de génériques :</strong></p>
<p>Les génériques fournissent du code réutilisable et type-safe</p>
<p>Utilisez des contraintes avec `extends` pour limiter les types génériques</p>
<p>Les types utilitaires comme Partial, Required, Pick sont très utiles</p>
<p>Le type Record crée des types d'objet avec des clés connues</p>
</div>

## Types Avancés et Patterns

```typescript
// Types conditionnels
type IsArray<T> = T extends any[] ? true : false;
type Test1 = IsArray<string>; // false
type Test2 = IsArray<number[]>; // true

// Types mappés
type Optional<T> = {
  [P in keyof T]?: T[P];
};

type ReadOnly<T> = {
  readonly [P in keyof T]: T[P];
};

// Types de template literal
type EventName<T extends string> = `on${Capitalize<T>}`;
type ButtonEvents = EventName<"click" | "hover">; // "onClick" | "onHover"

// Unions discriminées
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
      // TypeScript assure que tous les cas sont gérés
      const _exhaustive: never = shape;
      return _exhaustive;
  }
}

// Gardes de type
function isString(value: unknown): value is string {
  return typeof value === "string";
}

function processValue(value: unknown) {
  if (isString(value)) {
    // Ici TypeScript sait que value est string
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

// Utilisation : Utils.formatDate(new Date())
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<p><strong>Patterns avancés :</strong></p>
<p>Les types conditionnels permettent la programmation au niveau des types</p>
<p>Les types mappés transforment les types existants</p>
<p>Les unions discriminées assurent la sécurité des types avec les déclarations switch</p>
<p>Les gardes de type aident TypeScript à comprendre les types à l'exécution</p>
</div>

## TypeScript avec React

```typescript
import React, { useState, useEffect, ReactNode } from 'react';

// Interface des props du composant
interface ButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

// Composant fonctionnel avec TypeScript
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

// Hook avec TypeScript
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
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return { users, loading, error };
}

// Composant générique
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

// Utilisation
function App() {
  const { users, loading, error } = useUsers();

  if (loading) return <div>Chargement...</div>;
  if (error) return <div>Erreur : {error}</div>;

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
<p><strong>TypeScript avec React :</strong></p>
<p>Utilisez React.FC pour les composants fonctionnels (optionnel dans les nouvelles versions)</p>
<p>Définissez des interfaces appropriées pour les props et l'état</p>
<p>Les composants génériques fournissent un rendu de liste réutilisable et type-safe</p>
<p>Les hooks personnalisés doivent retourner des objets correctement typés</p>
</div>

Ce guide TypeScript couvre les concepts et patterns les plus essentiels du développement TypeScript moderne. Pratiquez ces patterns et combinez-les pour construire des applications robustes et type-safe !