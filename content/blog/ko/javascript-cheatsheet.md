---
title: "JavaScript 치트시트"
date: "2013-09-12"
updatedDate: "2025-03-08"
excerpt: "모던 웹 개발에 필수적인 JavaScript 문법과 기능들의 포괄적인 가이드입니다."
tags: ["JavaScript", "프로그래밍", "웹 개발", "프론트엔드", "치트시트"]
author: "Shun Kushigami"
---

# JavaScript 치트시트

모던 웹 개발에 필수적인 JavaScript 문법과 기능들의 포괄적인 가이드입니다.

## 변수와 데이터 타입

```javascript
// 변수 선언
var oldWay = "함수 스코프";
let blockScoped = "블록 스코프";
const constant = "재할당 불가";

// 데이터 타입
let string = "Hello World";
let number = 42;
let boolean = true;
let array = [1, 2, 3, 4];
let object = { name: "김철수", age: 30 };
let nullValue = null;
let undefinedValue = undefined;
let symbol = Symbol("고유값");
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<strong>미리보기:</strong> 
<p>변수: 문자열: "Hello World", 숫자: 42, 불린: true, 배열: [1,2,3,4]</p>
</div>

## 함수

```javascript
// 함수 선언
function greet(name) {
    return `안녕하세요, ${name}님!`;
}

// 함수 표현식
const greetExpression = function(name) {
    return `안녕하세요, ${name}님!`;
};

// 화살표 함수
const greetArrow = (name) => `안녕하세요, ${name}님!`;
const add = (a, b) => a + b;
const multiply = (a, b) => {
    return a * b;
};

// 기본 매개변수
function greetWithDefault(name = "세상") {
    return `안녕하세요, ${name}님!`;
}

// 나머지 매개변수
function sum(...numbers) {
    return numbers.reduce((acc, num) => acc + num, 0);
}
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<p><strong>함수 예제:</strong></p>
<p>greet("영희") → "안녕하세요, 영희님!"</p>
<p>add(5, 3) → 8</p>
<p>greetWithDefault() → "안녕하세요, 세상님!"</p>
<p>sum(1, 2, 3, 4) → 10</p>
</div>

## 객체와 배열

```javascript
// 객체 생성과 조작
const person = {
    name: "김철수",
    age: 30,
    city: "서울"
};

// 속성 접근
console.log(person.name);        // "김철수"
console.log(person["age"]);      // 30

// 속성 추가/수정
person.email = "chulsu@example.com";
person.age = 31;

// 객체 구조분해할당
const { name, age } = person;

// 배열 메서드
const numbers = [1, 2, 3, 4, 5];

// Map, filter, reduce
const doubled = numbers.map(n => n * 2);
const evens = numbers.filter(n => n % 2 === 0);
const sum = numbers.reduce((acc, n) => acc + n, 0);

// 배열 구조분해할당
const [first, second, ...rest] = numbers;
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<p><strong>객체와 배열 예제:</strong></p>
<p>person.name → "김철수"</p>
<p>doubled → [2, 4, 6, 8, 10]</p>
<p>evens → [2, 4]</p>
<p>sum → 15</p>
<p>first → 1, second → 2, rest → [3, 4, 5]</p>
</div>

## 제어 흐름

```javascript
// if문
if (condition) {
    // 코드
} else if (anotherCondition) {
    // 코드
} else {
    // 코드
}

// 삼항 연산자
const result = condition ? "참 값" : "거짓 값";

// switch문
switch (value) {
    case 1:
        console.log("하나");
        break;
    case 2:
        console.log("둘");
        break;
    default:
        console.log("기타");
}

// 반복문
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
    // 코드
}
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<p><strong>제어 흐름 예제:</strong></p>
<p>삼항 연산자: true ? "예" : "아니오" → "예"</p>
<p>for 반복문: 0, 1, 2, 3, 4</p>
<p>for-of: 값들을 반복</p>
<p>for-in: 키들을 반복</p>
</div>

## 클래스와 객체

```javascript
// ES6 클래스
class Person {
    constructor(name, age) {
        this.name = name;
        this.age = age;
    }
    
    greet() {
        return `안녕하세요, 저는 ${this.name}입니다`;
    }
    
    static species() {
        return "호모 사피엔스";
    }
}

// 상속
class Student extends Person {
    constructor(name, age, grade) {
        super(name, age);
        this.grade = grade;
    }
    
    study() {
        return `${this.name}이(가) 공부 중입니다`;
    }
}

// 객체 생성
const chulsu = new Person("김철수", 30);
const younghee = new Student("이영희", 20, "A");
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<p><strong>클래스 예제:</strong></p>
<p>chulsu.greet() → "안녕하세요, 저는 김철수입니다"</p>
<p>Person.species() → "호모 사피엔스"</p>
<p>younghee.study() → "이영희이(가) 공부 중입니다"</p>
</div>

## Promise와 Async/Await

```javascript
// Promise
const fetchData = () => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve("데이터를 성공적으로 가져왔습니다");
        }, 1000);
    });
};

// Promise 체이닝
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

// 여러 비동기 작업
async function getMultipleData() {
    const [data1, data2] = await Promise.all([
        fetchData(),
        fetchData()
    ]);
    return { data1, data2 };
}
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<p><strong>비동기 예제:</strong></p>
<p>Promise는 1초 후 해결됩니다</p>
<p>async/await는 더 깨끗한 문법을 제공합니다</p>
<p>Promise.all()은 작업을 동시에 실행합니다</p>
</div>

## DOM 조작

```javascript
// 요소 선택
const element = document.getElementById('myId');
const elements = document.querySelectorAll('.myClass');
const firstElement = document.querySelector('.myClass');

// 요소 생성
const newDiv = document.createElement('div');
newDiv.textContent = 'Hello World';
newDiv.className = 'my-class';

// 요소 수정
element.textContent = '새 텍스트';
element.innerHTML = '<strong>굵은 텍스트</strong>';
element.style.color = 'red';
element.setAttribute('data-value', '123');

// 이벤트 리스너
element.addEventListener('click', function(event) {
    console.log('요소가 클릭되었습니다!');
});

// 화살표 함수 이벤트 리스너
element.addEventListener('click', (event) => {
    event.preventDefault();
    console.log('화살표 함수로 클릭되었습니다');
});
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<p><strong>DOM 예제:</strong></p>
<button onclick="alert('버튼이 클릭되었습니다!')">클릭하세요!</button>
<p id="demo-text-ko" style="color: blue;">이 텍스트는 수정될 수 있습니다</p>
<script>
setTimeout(() => {
    const demoText = document.getElementById('demo-text-ko');
    if (demoText) {
        demoText.textContent = 'JavaScript로 텍스트가 수정되었습니다!';
        demoText.style.color = 'green';
    }
}, 2000);
</script>
</div>

## 에러 핸들링

```javascript
// try-catch 블록
try {
    const result = riskyOperation();
    console.log(result);
} catch (error) {
    console.error('에러가 발생했습니다:', error.message);
} finally {
    console.log('여기는 항상 실행됩니다');
}

// 커스텀 에러
class CustomError extends Error {
    constructor(message) {
        super(message);
        this.name = 'CustomError';
    }
}

function validateAge(age) {
    if (age < 0) {
        throw new CustomError('나이는 음수가 될 수 없습니다');
    }
    return true;
}

// async/await에서의 에러 핸들링
async function handleAsyncError() {
    try {
        const data = await fetchData();
        return data;
    } catch (error) {
        console.error('비동기 에러:', error);
        throw error;
    }
}
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<p><strong>에러 핸들링:</strong></p>
<p>try-catch 블록은 동기 에러를 처리합니다</p>
<p>커스텀 에러는 특정 에러 타입을 제공합니다</p>
<p>async 함수에서 try-catch로 비동기 에러 핸들링</p>
</div>

## ES6+ 기능

```javascript
// 템플릿 리터럴
const name = "세상";
const greeting = `안녕하세요, ${name}!`;
const multiline = `
    이것은
    여러 줄 문자열입니다
`;

// 구조분해할당
const [a, b, ...rest] = [1, 2, 3, 4, 5];
const {x, y, z = '기본값'} = {x: 1, y: 2};

// 스프레드 연산자
const arr1 = [1, 2, 3];
const arr2 = [4, 5, 6];
const combined = [...arr1, ...arr2];

const obj1 = {a: 1, b: 2};
const obj2 = {c: 3, d: 4};
const combinedObj = {...obj1, ...obj2};

// 옵셔널 체이닝
const user = {
    profile: {
        name: '김철수'
    }
};
const userName = user?.profile?.name; // "김철수"
const userAge = user?.profile?.age; // undefined

// 널 병합 연산자
const value = null ?? '기본값'; // "기본값"
const value2 = '' ?? '기본값'; // "" (빈 문자열은 null/undefined가 아님)
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<p><strong>ES6+ 예제:</strong></p>
<p>템플릿 리터럴: `안녕하세요, ${name}!` → "안녕하세요, 세상!"</p>
<p>스프레드: [...[1,2], ...[3,4]] → [1, 2, 3, 4]</p>
<p>옵셔널 체이닝은 undefined 속성에서 에러를 방지합니다</p>
<p>널 병합: null ?? '기본값' → '기본값'</p>
</div>

## 자주 사용하는 유틸리티

```javascript
// 타입 체크
typeof "hello"; // "string"
typeof 42; // "number"
typeof true; // "boolean"
typeof undefined; // "undefined"
typeof null; // "object" (버그!)
Array.isArray([1, 2, 3]); // true

// 문자열 메서드
"hello world".toUpperCase(); // "HELLO WORLD"
"  hello  ".trim(); // "hello"
"hello,world".split(","); // ["hello", "world"]
"hello".includes("ell"); // true

// 숫자 메서드
parseInt("123"); // 123
parseFloat("123.45"); // 123.45
Math.round(123.456); // 123
Math.max(1, 2, 3); // 3
Math.random(); // 0에서 1 사이

// 날짜 처리
const now = new Date();
const timestamp = Date.now();
const dateString = now.toISOString();
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<p><strong>유틸리티 예제:</strong></p>
<p>typeof "hello" → "string"</p>
<p>"HELLO".toLowerCase() → "hello"</p>
<p>Math.round(4.7) → 5</p>
<p>현재 타임스탬프: <span id="timestamp-ko"></span></p>
<script>
document.getElementById('timestamp-ko').textContent = Date.now();
</script>
</div>

이 JavaScript 치트시트는 모던 웹 개발에서 가장 중요한 기능과 문법을 다룹니다. 이러한 개념들을 연습해서 JavaScript를 마스터하세요!