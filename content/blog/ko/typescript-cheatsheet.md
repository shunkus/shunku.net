---
title: "TypeScript 치트시트"
date: "2017-08-15"
updatedDate: "2025-04-12"
excerpt: "타입 안전한 애플리케이션 구축을 위한 TypeScript의 기본, 타입, 인터페이스, 제네릭, 고급 패턴에 대한 포괄적인 가이드입니다."
tags: ["TypeScript", "JavaScript", "타입", "웹 개발", "프로그래밍", "치트시트"]
author: "구시가미 순"
---

# TypeScript 치트시트

타입 안전한 애플리케이션 구축을 위한 TypeScript의 기본, 타입, 인터페이스, 제네릭, 고급 패턴에 대한 포괄적인 가이드입니다.

## 기본 타입

```typescript
// 원시 타입
let message: string = "Hello World";
let count: number = 42;
let isActive: boolean = true;
let nothing: null = null;
let notDefined: undefined = undefined;

// 배열
let numbers: number[] = [1, 2, 3];
let strings: Array<string> = ["a", "b", "c"];

// 튜플 - 특정 타입의 고정 길이 배열
let tuple: [string, number] = ["hello", 42];

// Enum
enum Color {
  Red,
  Green,
  Blue
}
let favoriteColor: Color = Color.Blue;

// Any - 타입 검사 비활성화
let dynamic: any = "뭐든지 가능";
dynamic = 42;
dynamic = true;

// Unknown - any보다 안전한 대안
let userInput: unknown;
userInput = "hello";
userInput = 42;

// 타입 단언
let someValue: unknown = "이것은 문자열입니다";
let strLength: number = (someValue as string).length;
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<strong>기본 타입 예제:</strong>
<p>TypeScript는 컴파일 타임에 정적 타입 검사를 제공</p>
<p>가능하면 `any` 대신 구체적인 타입을 사용</p>
<p>`unknown`은 `any`보다 안전 - 사용하기 전에 타입 검사 필요</p>
</div>

## 함수와 매개변수

```typescript
// 함수 선언
function add(x: number, y: number): number {
  return x + y;
}

// 함수 표현식
const multiply = (x: number, y: number): number => {
  return x * y;
};

// 선택적 매개변수
function greet(name: string, title?: string): string {
  return title ? `안녕하세요, ${title} ${name}님` : `안녕하세요, ${name}님`;
}

// 기본 매개변수
function createUser(name: string, role: string = "user"): object {
  return { name, role };
}

// 나머지 매개변수
function sum(...numbers: number[]): number {
  return numbers.reduce((total, num) => total + num, 0);
}

// 함수 오버로드
function format(value: string): string;
function format(value: number): string;
function format(value: string | number): string {
  return value.toString();
}

// 고차 함수
function createAdder(baseValue: number): (value: number) => number {
  return (value: number) => baseValue + value;
}

const addFive = createAdder(5);
console.log(addFive(10)); // 15
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<p><strong>함수 예제:</strong></p>
<p>더 나은 문서화를 위해 항상 반환 타입 지정</p>
<p>유연성을 위해 선택적 매개변수(?) 사용</p>
<p>함수 오버로드는 여러 타입 시그니처 제공</p>
</div>

## 인터페이스와 타입 별칭

```typescript
// 인터페이스 정의
interface User {
  readonly id: number;
  name: string;
  email: string;
  age?: number; // 선택적 속성
}

// 인터페이스 사용
const user: User = {
  id: 1,
  name: "홍길동",
  email: "hong@example.com"
};

// 인터페이스 확장
interface Admin extends User {
  permissions: string[];
  lastLogin: Date;
}

// 함수 인터페이스
interface Calculator {
  (x: number, y: number): number;
}

const calculator: Calculator = (x, y) => x + y;

// 타입 별칭
type Point = {
  x: number;
  y: number;
};

type StringOrNumber = string | number;
type UserRole = "admin" | "user" | "guest";

// 교차 타입
type Employee = User & {
  department: string;
  salary: number;
};

// 인덱스 시그니처
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
<p><strong>인터페이스와 타입:</strong></p>
<p>인터페이스는 확장 가능, 타입 별칭은 확장 불가</p>
<p>여러 가능한 타입에 유니온 타입(|) 사용</p>
<p>교차 타입(&)으로 여러 타입 결합</p>
<p>readonly 속성은 생성 후 수정 불가</p>
</div>

## 클래스와 접근 제한자

```typescript
// 생성자와 메서드가 있는 클래스
class Animal {
  private name: string;
  protected species: string;
  public age: number;

  constructor(name: string, species: string, age: number) {
    this.name = name;
    this.species = species;
    this.age = age;
  }

  // 게터
  get getName(): string {
    return this.name;
  }

  // 세터
  set setName(newName: string) {
    if (newName.length > 0) {
      this.name = newName;
    }
  }

  // 퍼블릭 메서드
  makeSound(): void {
    console.log(`${this.name}가 소리를 냅니다`);
  }

  // 보호된 메서드 - 서브클래스에서 접근 가능
  protected move(): void {
    console.log(`${this.name}가 움직입니다`);
  }
}

// 상속
class Dog extends Animal {
  private breed: string;

  constructor(name: string, age: number, breed: string) {
    super(name, "개", age);
    this.breed = breed;
  }

  // 메서드 오버라이드
  makeSound(): void {
    console.log(`${this.getName()}가 짖습니다!`);
  }

  // 부모의 보호된 메서드 접근
  run(): void {
    this.move();
    console.log("빠르게 달립니다!");
  }
}

// 추상 클래스
abstract class Shape {
  abstract area(): number;
  
  displayArea(): void {
    console.log(`면적: ${this.area()}`);
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

// 인터페이스 구현
interface Flyable {
  fly(): void;
}

class Bird extends Animal implements Flyable {
  fly(): void {
    console.log(`${this.getName()}가 날아갑니다`);
  }
}
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<p><strong>클래스 예제:</strong></p>
<p>private: 클래스 내에서만 접근 가능</p>
<p>protected: 클래스와 서브클래스에서 접근 가능</p>
<p>public: 어디서든 접근 가능 (기본값)</p>
<p>추상 클래스는 직접 인스턴스화 불가</p>
</div>

## 제네릭

```typescript
// 제네릭 함수
function identity<T>(arg: T): T {
  return arg;
}

let output1 = identity<string>("hello");
let output2 = identity<number>(42);

// 제약이 있는 제네릭
interface Lengthwise {
  length: number;
}

function logLength<T extends Lengthwise>(arg: T): T {
  console.log(arg.length);
  return arg;
}

logLength("Hello"); // 문자열은 길이를 가짐
logLength([1, 2, 3]); // 배열은 길이를 가짐

// 제네릭 인터페이스
interface Repository<T> {
  create(item: T): T;
  findById(id: number): T | undefined;
  update(id: number, item: Partial<T>): T;
  delete(id: number): boolean;
}

// 제네릭 클래스
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

// 유틸리티 타입
interface Person {
  name: string;
  age: number;
  email: string;
}

// Partial - 모든 속성을 선택적으로 만듦
type PartialPerson = Partial<Person>;

// Required - 모든 속성을 필수로 만듦
type RequiredPerson = Required<Person>;

// Pick - 특정 속성 선택
type PersonContact = Pick<Person, 'name' | 'email'>;

// Omit - 특정 속성 제외
type PersonWithoutEmail = Omit<Person, 'email'>;

// Record - 특정 키로 객체 타입 생성
type UserRoles = Record<string, boolean>;
const permissions: UserRoles = {
  read: true,
  write: false,
  admin: true
};
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<p><strong>제네릭 예제:</strong></p>
<p>제네릭은 재사용 가능하고 타입 안전한 코드 제공</p>
<p>`extends`로 제약을 사용하여 제네릭 타입 제한</p>
<p>Partial, Required, Pick과 같은 유틸리티 타입이 매우 유용</p>
<p>Record 타입으로 알려진 키를 가진 객체 타입 생성</p>
</div>

## 고급 타입과 패턴

```typescript
// 조건부 타입
type IsArray<T> = T extends any[] ? true : false;
type Test1 = IsArray<string>; // false
type Test2 = IsArray<number[]>; // true

// 매핑된 타입
type Optional<T> = {
  [P in keyof T]?: T[P];
};

type ReadOnly<T> = {
  readonly [P in keyof T]: T[P];
};

// 템플릿 리터럴 타입
type EventName<T extends string> = `on${Capitalize<T>}`;
type ButtonEvents = EventName<"click" | "hover">; // "onClick" | "onHover"

// 판별된 유니온
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
      // TypeScript가 모든 경우를 처리했는지 보장
      const _exhaustive: never = shape;
      return _exhaustive;
  }
}

// 타입 가드
function isString(value: unknown): value is string {
  return typeof value === "string";
}

function processValue(value: unknown) {
  if (isString(value)) {
    // 여기서 TypeScript는 value가 string임을 안다
    console.log(value.toUpperCase());
  }
}

// 네임스페이스
namespace Utils {
  export function formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  export function capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

// 사용법: Utils.formatDate(new Date())
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<p><strong>고급 패턴:</strong></p>
<p>조건부 타입으로 타입 수준 프로그래밍 가능</p>
<p>매핑된 타입으로 기존 타입 변환</p>
<p>판별된 유니온으로 switch문의 타입 안전성 보장</p>
<p>타입 가드로 TypeScript가 런타임 타입을 이해하게 함</p>
</div>

## React에서의 TypeScript

```typescript
import React, { useState, useEffect, ReactNode } from 'react';

// 컴포넌트 props 인터페이스
interface ButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

// TypeScript를 사용한 함수형 컴포넌트
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

// TypeScript를 사용한 훅
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
        setError(err instanceof Error ? err.message : '알 수 없는 오류');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return { users, loading, error };
}

// 제네릭 컴포넌트
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

// 사용 예제
function App() {
  const { users, loading, error } = useUsers();

  if (loading) return <div>로딩 중...</div>;
  if (error) return <div>오류: {error}</div>;

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
<p><strong>React에서의 TypeScript:</strong></p>
<p>함수형 컴포넌트에 React.FC 사용 (최신 버전에서는 선택사항)</p>
<p>props와 state에 적절한 인터페이스 정의</p>
<p>제네릭 컴포넌트로 재사용 가능한 타입 안전 리스트 렌더링</p>
<p>커스텀 훅은 적절히 타입이 지정된 객체를 반환해야 함</p>
</div>

이 TypeScript 치트시트는 모던 TypeScript 개발의 가장 필수적인 개념과 패턴을 다룹니다. 이러한 패턴을 연습하고 결합하여 견고하고 타입 안전한 애플리케이션을 구축하세요!