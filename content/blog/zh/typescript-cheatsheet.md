---
title: "TypeScript 备忘单"
date: "2017-08-15"
updatedDate: "2025-04-12"
excerpt: "用于构建类型安全应用的TypeScript基础、类型、接口、泛型和高级模式的综合指南。"
tags: ["TypeScript", "JavaScript", "类型", "Web开发", "编程", "备忘单"]
author: "串上俊"
---

# TypeScript 备忘单

用于构建类型安全应用的TypeScript基础、类型、接口、泛型和高级模式的综合指南。

## 基本类型

```typescript
// 原始类型
let message: string = "Hello World";
let count: number = 42;
let isActive: boolean = true;
let nothing: null = null;
let notDefined: undefined = undefined;

// 数组
let numbers: number[] = [1, 2, 3];
let strings: Array<string> = ["a", "b", "c"];

// 元组 - 具有特定类型的固定长度数组
let tuple: [string, number] = ["hello", 42];

// 枚举
enum Color {
  Red,
  Green,
  Blue
}
let favoriteColor: Color = Color.Blue;

// Any - 禁用类型检查
let dynamic: any = "可以是任何东西";
dynamic = 42;
dynamic = true;

// Unknown - 比any更安全的替代方案
let userInput: unknown;
userInput = "hello";
userInput = 42;

// 类型断言
let someValue: unknown = "这是一个字符串";
let strLength: number = (someValue as string).length;
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<strong>基本类型示例：</strong>
<p>TypeScript在编译时提供静态类型检查</p>
<p>尽可能使用具体类型而不是`any`</p>
<p>`unknown`比`any`更安全 - 使用前需要类型检查</p>
</div>

## 函数和参数

```typescript
// 函数声明
function add(x: number, y: number): number {
  return x + y;
}

// 函数表达式
const multiply = (x: number, y: number): number => {
  return x * y;
};

// 可选参数
function greet(name: string, title?: string): string {
  return title ? `你好，${title} ${name}` : `你好，${name}`;
}

// 默认参数
function createUser(name: string, role: string = "user"): object {
  return { name, role };
}

// 剩余参数
function sum(...numbers: number[]): number {
  return numbers.reduce((total, num) => total + num, 0);
}

// 函数重载
function format(value: string): string;
function format(value: number): string;
function format(value: string | number): string {
  return value.toString();
}

// 高阶函数
function createAdder(baseValue: number): (value: number) => number {
  return (value: number) => baseValue + value;
}

const addFive = createAdder(5);
console.log(addFive(10)); // 15
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<p><strong>函数示例：</strong></p>
<p>为了更好的文档化，始终指定返回类型</p>
<p>为了灵活性，使用可选参数(?)</p>
<p>函数重载提供多个类型签名</p>
</div>

## 接口和类型别名

```typescript
// 接口定义
interface User {
  readonly id: number;
  name: string;
  email: string;
  age?: number; // 可选属性
}

// 使用接口
const user: User = {
  id: 1,
  name: "张三",
  email: "zhang@example.com"
};

// 接口扩展
interface Admin extends User {
  permissions: string[];
  lastLogin: Date;
}

// 函数接口
interface Calculator {
  (x: number, y: number): number;
}

const calculator: Calculator = (x, y) => x + y;

// 类型别名
type Point = {
  x: number;
  y: number;
};

type StringOrNumber = string | number;
type UserRole = "admin" | "user" | "guest";

// 交叉类型
type Employee = User & {
  department: string;
  salary: number;
};

// 索引签名
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
<p><strong>接口和类型：</strong></p>
<p>接口可扩展，类型别名不可扩展</p>
<p>对于多种可能的类型使用联合类型(|)</p>
<p>交叉类型(&)组合多个类型</p>
<p>readonly属性创建后不能修改</p>
</div>

## 类和访问修饰符

```typescript
// 带构造函数和方法的类
class Animal {
  private name: string;
  protected species: string;
  public age: number;

  constructor(name: string, species: string, age: number) {
    this.name = name;
    this.species = species;
    this.age = age;
  }

  // 获取器
  get getName(): string {
    return this.name;
  }

  // 设置器
  set setName(newName: string) {
    if (newName.length > 0) {
      this.name = newName;
    }
  }

  // 公共方法
  makeSound(): void {
    console.log(`${this.name}发出声音`);
  }

  // 保护方法 - 子类中可访问
  protected move(): void {
    console.log(`${this.name}在移动`);
  }
}

// 继承
class Dog extends Animal {
  private breed: string;

  constructor(name: string, age: number, breed: string) {
    super(name, "犬", age);
    this.breed = breed;
  }

  // 方法重写
  makeSound(): void {
    console.log(`${this.getName()}在吠叫！`);
  }

  // 访问父类的保护方法
  run(): void {
    this.move();
    console.log("快速奔跑！");
  }
}

// 抽象类
abstract class Shape {
  abstract area(): number;
  
  displayArea(): void {
    console.log(`面积: ${this.area()}`);
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

// 实现接口
interface Flyable {
  fly(): void;
}

class Bird extends Animal implements Flyable {
  fly(): void {
    console.log(`${this.getName()}在飞翔`);
  }
}
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<p><strong>类示例：</strong></p>
<p>private: 只在类内部可访问</p>
<p>protected: 在类和子类中可访问</p>
<p>public: 任何地方都可访问（默认）</p>
<p>抽象类不能直接实例化</p>
</div>

## 泛型

```typescript
// 泛型函数
function identity<T>(arg: T): T {
  return arg;
}

let output1 = identity<string>("hello");
let output2 = identity<number>(42);

// 带约束的泛型
interface Lengthwise {
  length: number;
}

function logLength<T extends Lengthwise>(arg: T): T {
  console.log(arg.length);
  return arg;
}

logLength("Hello"); // 字符串有长度
logLength([1, 2, 3]); // 数组有长度

// 泛型接口
interface Repository<T> {
  create(item: T): T;
  findById(id: number): T | undefined;
  update(id: number, item: Partial<T>): T;
  delete(id: number): boolean;
}

// 泛型类
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

// 实用类型
interface Person {
  name: string;
  age: number;
  email: string;
}

// Partial - 使所有属性可选
type PartialPerson = Partial<Person>;

// Required - 使所有属性必需
type RequiredPerson = Required<Person>;

// Pick - 选择特定属性
type PersonContact = Pick<Person, 'name' | 'email'>;

// Omit - 排除特定属性
type PersonWithoutEmail = Omit<Person, 'email'>;

// Record - 用特定键创建对象类型
type UserRoles = Record<string, boolean>;
const permissions: UserRoles = {
  read: true,
  write: false,
  admin: true
};
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<p><strong>泛型示例：</strong></p>
<p>泛型提供可重用、类型安全的代码</p>
<p>使用`extends`约束来限制泛型类型</p>
<p>像Partial、Required、Pick这样的实用类型非常有用</p>
<p>Record类型创建具有已知键的对象类型</p>
</div>

## 高级类型和模式

```typescript
// 条件类型
type IsArray<T> = T extends any[] ? true : false;
type Test1 = IsArray<string>; // false
type Test2 = IsArray<number[]>; // true

// 映射类型
type Optional<T> = {
  [P in keyof T]?: T[P];
};

type ReadOnly<T> = {
  readonly [P in keyof T]: T[P];
};

// 模板字面量类型
type EventName<T extends string> = `on${Capitalize<T>}`;
type ButtonEvents = EventName<"click" | "hover">; // "onClick" | "onHover"

// 可辨识联合
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
      // TypeScript确保处理所有情况
      const _exhaustive: never = shape;
      return _exhaustive;
  }
}

// 类型保护
function isString(value: unknown): value is string {
  return typeof value === "string";
}

function processValue(value: unknown) {
  if (isString(value)) {
    // 这里TypeScript知道value是string
    console.log(value.toUpperCase());
  }
}

// 命名空间
namespace Utils {
  export function formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  export function capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

// 使用方法: Utils.formatDate(new Date())
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<p><strong>高级模式：</strong></p>
<p>条件类型启用类型级编程</p>
<p>映射类型转换现有类型</p>
<p>可辨识联合确保switch语句的类型安全</p>
<p>类型保护帮助TypeScript理解运行时类型</p>
</div>

## 在React中使用TypeScript

```typescript
import React, { useState, useEffect, ReactNode } from 'react';

// 组件props接口
interface ButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

// 使用TypeScript的函数组件
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

// 使用TypeScript的Hook
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
        setError(err instanceof Error ? err.message : '未知错误');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return { users, loading, error };
}

// 泛型组件
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

// 使用示例
function App() {
  const { users, loading, error } = useUsers();

  if (loading) return <div>加载中...</div>;
  if (error) return <div>错误: {error}</div>;

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
<p><strong>在React中使用TypeScript：</strong></p>
<p>对函数组件使用React.FC（在新版本中是可选的）</p>
<p>为props和state定义适当的接口</p>
<p>泛型组件提供可重用的类型安全列表渲染</p>
<p>自定义Hook应该返回适当类型的对象</p>
</div>

这个TypeScript备忘单涵盖了现代TypeScript开发中最重要的概念和模式。练习这些模式并结合使用它们来构建强大的类型安全应用程序！