---
title: "TypeScript チートシート"
date: "2017-08-15"
updatedDate: "2025-04-12"
excerpt: "型安全なアプリケーション構築のためのTypeScriptの基本、型、インターフェース、ジェネリクス、高度なパターンの包括的なガイドです。"
tags: ["TypeScript", "JavaScript", "型", "Web開発", "プログラミング", "チートシート"]
author: "串上俊"
---

# TypeScript チートシート

型安全なアプリケーション構築のためのTypeScriptの基本、型、インターフェース、ジェネリクス、高度なパターンの包括的なガイドです。

## 基本の型

```typescript
// プリミティブ型
let message: string = "Hello World";
let count: number = 42;
let isActive: boolean = true;
let nothing: null = null;
let notDefined: undefined = undefined;

// 配列
let numbers: number[] = [1, 2, 3];
let strings: Array<string> = ["a", "b", "c"];

// タプル - 特定の型を持つ固定長配列
let tuple: [string, number] = ["hello", 42];

// Enum
enum Color {
  Red,
  Green,
  Blue
}
let favoriteColor: Color = Color.Blue;

// Any - 型チェックを無効にする
let dynamic: any = "何でもOK";
dynamic = 42;
dynamic = true;

// Unknown - anyより安全な代替
let userInput: unknown;
userInput = "hello";
userInput = 42;

// 型アサーション
let someValue: unknown = "これは文字列です";
let strLength: number = (someValue as string).length;
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<strong>基本型の例:</strong>
<p>TypeScriptはコンパイル時に静的型チェックを提供</p>
<p>可能な限り`any`ではなく具体的な型を使用</p>
<p>`unknown`は`any`より安全 - 使用前に型チェックが必要</p>
</div>

## 関数とパラメータ

```typescript
// 関数宣言
function add(x: number, y: number): number {
  return x + y;
}

// 関数式
const multiply = (x: number, y: number): number => {
  return x * y;
};

// オプショナルパラメータ
function greet(name: string, title?: string): string {
  return title ? `こんにちは、${title} ${name}さん` : `こんにちは、${name}さん`;
}

// デフォルトパラメータ
function createUser(name: string, role: string = "user"): object {
  return { name, role };
}

// 残余パラメータ
function sum(...numbers: number[]): number {
  return numbers.reduce((total, num) => total + num, 0);
}

// 関数オーバーロード
function format(value: string): string;
function format(value: number): string;
function format(value: string | number): string {
  return value.toString();
}

// 高階関数
function createAdder(baseValue: number): (value: number) => number {
  return (value: number) => baseValue + value;
}

const addFive = createAdder(5);
console.log(addFive(10)); // 15
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<p><strong>関数の例:</strong></p>
<p>より良いドキュメントのため、常に戻り値の型を指定</p>
<p>柔軟性のためオプショナルパラメータ(?)を使用</p>
<p>関数オーバーロードは複数の型シグネチャを提供</p>
</div>

## インターフェースと型エイリアス

```typescript
// インターフェース定義
interface User {
  readonly id: number;
  name: string;
  email: string;
  age?: number; // オプショナルプロパティ
}

// インターフェースの使用
const user: User = {
  id: 1,
  name: "田中太郎",
  email: "tanaka@example.com"
};

// インターフェースの継承
interface Admin extends User {
  permissions: string[];
  lastLogin: Date;
}

// 関数インターフェース
interface Calculator {
  (x: number, y: number): number;
}

const calculator: Calculator = (x, y) => x + y;

// 型エイリアス
type Point = {
  x: number;
  y: number;
};

type StringOrNumber = string | number;
type UserRole = "admin" | "user" | "guest";

// 交差型
type Employee = User & {
  department: string;
  salary: number;
};

// インデックスシグネチャ
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
<p><strong>インターフェースと型:</strong></p>
<p>インターフェースは拡張可能、型エイリアスは拡張不可</p>
<p>複数の可能な型にはユニオン型(|)を使用</p>
<p>交差型(&)で複数の型を結合</p>
<p>readonlyプロパティは作成後に変更不可</p>
</div>

## クラスとアクセス修飾子

```typescript
// コンストラクタとメソッドを持つクラス
class Animal {
  private name: string;
  protected species: string;
  public age: number;

  constructor(name: string, species: string, age: number) {
    this.name = name;
    this.species = species;
    this.age = age;
  }

  // ゲッター
  get getName(): string {
    return this.name;
  }

  // セッター
  set setName(newName: string) {
    if (newName.length > 0) {
      this.name = newName;
    }
  }

  // パブリックメソッド
  makeSound(): void {
    console.log(`${this.name}が音を出します`);
  }

  // プロテクトメソッド - サブクラスでアクセス可能
  protected move(): void {
    console.log(`${this.name}が動いています`);
  }
}

// 継承
class Dog extends Animal {
  private breed: string;

  constructor(name: string, age: number, breed: string) {
    super(name, "犬", age);
    this.breed = breed;
  }

  // メソッドオーバーライド
  makeSound(): void {
    console.log(`${this.getName()}が吠えています！`);
  }

  // 親のプロテクトメソッドにアクセス
  run(): void {
    this.move();
    console.log("速く走っています！");
  }
}

// 抽象クラス
abstract class Shape {
  abstract area(): number;
  
  displayArea(): void {
    console.log(`面積: ${this.area()}`);
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

// インターフェースの実装
interface Flyable {
  fly(): void;
}

class Bird extends Animal implements Flyable {
  fly(): void {
    console.log(`${this.getName()}が飛んでいます`);
  }
}
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<p><strong>クラスの例:</strong></p>
<p>private: クラス内でのみアクセス可能</p>
<p>protected: クラスとサブクラス内でアクセス可能</p>
<p>public: どこからでもアクセス可能（デフォルト）</p>
<p>抽象クラスは直接インスタンス化できない</p>
</div>

## ジェネリクス

```typescript
// ジェネリック関数
function identity<T>(arg: T): T {
  return arg;
}

let output1 = identity<string>("hello");
let output2 = identity<number>(42);

// 制約付きジェネリック
interface Lengthwise {
  length: number;
}

function logLength<T extends Lengthwise>(arg: T): T {
  console.log(arg.length);
  return arg;
}

logLength("Hello"); // 文字列は長さを持つ
logLength([1, 2, 3]); // 配列は長さを持つ

// ジェネリックインターフェース
interface Repository<T> {
  create(item: T): T;
  findById(id: number): T | undefined;
  update(id: number, item: Partial<T>): T;
  delete(id: number): boolean;
}

// ジェネリッククラス
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

// ユーティリティ型
interface Person {
  name: string;
  age: number;
  email: string;
}

// Partial - すべてのプロパティをオプショナルにする
type PartialPerson = Partial<Person>;

// Required - すべてのプロパティを必須にする
type RequiredPerson = Required<Person>;

// Pick - 特定のプロパティを選択
type PersonContact = Pick<Person, 'name' | 'email'>;

// Omit - 特定のプロパティを除外
type PersonWithoutEmail = Omit<Person, 'email'>;

// Record - 特定のキーでオブジェクト型を作成
type UserRoles = Record<string, boolean>;
const permissions: UserRoles = {
  read: true,
  write: false,
  admin: true
};
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<p><strong>ジェネリクスの例:</strong></p>
<p>ジェネリクスは再利用可能で型安全なコードを提供</p>
<p>`extends`で制約を使ってジェネリック型を制限</p>
<p>Partial、Required、Pickなどのユーティリティ型が便利</p>
<p>Record型で既知のキーを持つオブジェクト型を作成</p>
</div>

## 高度な型とパターン

```typescript
// 条件型
type IsArray<T> = T extends any[] ? true : false;
type Test1 = IsArray<string>; // false
type Test2 = IsArray<number[]>; // true

// マップ型
type Optional<T> = {
  [P in keyof T]?: T[P];
};

type ReadOnly<T> = {
  readonly [P in keyof T]: T[P];
};

// テンプレートリテラル型
type EventName<T extends string> = `on${Capitalize<T>}`;
type ButtonEvents = EventName<"click" | "hover">; // "onClick" | "onHover"

// 判別可能なユニオン
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
      // TypeScriptがすべてのケースを処理することを保証
      const _exhaustive: never = shape;
      return _exhaustive;
  }
}

// 型ガード
function isString(value: unknown): value is string {
  return typeof value === "string";
}

function processValue(value: unknown) {
  if (isString(value)) {
    // ここでTypeScriptはvalueがstringであることを知っている
    console.log(value.toUpperCase());
  }
}

// 名前空間
namespace Utils {
  export function formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  export function capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

// 使用法: Utils.formatDate(new Date())
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<p><strong>高度なパターン:</strong></p>
<p>条件型で型レベルプログラミングが可能</p>
<p>マップ型で既存の型を変換</p>
<p>判別可能なユニオンでswitch文の型安全性を保証</p>
<p>型ガードでTypeScriptにランタイム型を理解させる</p>
</div>

## ReactでのTypeScript

```typescript
import React, { useState, useEffect, ReactNode } from 'react';

// コンポーネントpropsのインターフェース
interface ButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

// TypeScript付き関数コンポーネント
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

// TypeScript付きフック
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
        setError(err instanceof Error ? err.message : '不明なエラー');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return { users, loading, error };
}

// ジェネリックコンポーネント
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

// 使用例
function App() {
  const { users, loading, error } = useUsers();

  if (loading) return <div>読み込み中...</div>;
  if (error) return <div>エラー: {error}</div>;

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
<p><strong>ReactでのTypeScript:</strong></p>
<p>関数コンポーネントにReact.FCを使用（新しいバージョンではオプション）</p>
<p>propsとstateに適切なインターフェースを定義</p>
<p>ジェネリックコンポーネントで再利用可能な型安全リストレンダリング</p>
<p>カスタムフックは適切に型付けされたオブジェクトを返すべき</p>
</div>

このTypeScriptチートシートは、モダンなTypeScript開発における最も重要な概念とパターンをカバーしています。これらのパターンを練習し、組み合わせて堅牢で型安全なアプリケーションを構築しましょう！