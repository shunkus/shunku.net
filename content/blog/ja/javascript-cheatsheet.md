---
title: "JavaScript チートシート"
date: "2013-09-12"
updatedDate: "2025-03-08"
excerpt: "モダンなWeb開発に必須のJavaScript文法と機能の包括的なガイドです。"
tags: ["JavaScript", "プログラミング", "Web開発", "フロントエンド", "チートシート"]
author: "串上 俊"
---

# JavaScript チートシート

モダンなWeb開発に必須のJavaScript文法と機能の包括的なガイドです。

## 変数とデータ型

```javascript
// 変数の宣言
var oldWay = "関数スコープ";
let blockScoped = "ブロックスコープ";
const constant = "再代入不可";

// データ型
let string = "Hello World";
let number = 42;
let boolean = true;
let array = [1, 2, 3, 4];
let object = { name: "太郎", age: 30 };
let nullValue = null;
let undefinedValue = undefined;
let symbol = Symbol("ユニーク");
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<strong>プレビュー:</strong> 
<p>変数: 文字列: "Hello World", 数値: 42, 真偽値: true, 配列: [1,2,3,4]</p>
</div>

## 関数

```javascript
// 関数宣言
function greet(name) {
    return `こんにちは、${name}さん！`;
}

// 関数式
const greetExpression = function(name) {
    return `こんにちは、${name}さん！`;
};

// アロー関数
const greetArrow = (name) => `こんにちは、${name}さん！`;
const add = (a, b) => a + b;
const multiply = (a, b) => {
    return a * b;
};

// デフォルトパラメータ
function greetWithDefault(name = "世界") {
    return `こんにちは、${name}さん！`;
}

// 残余パラメータ
function sum(...numbers) {
    return numbers.reduce((acc, num) => acc + num, 0);
}
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<p><strong>関数の例:</strong></p>
<p>greet("花子") → "こんにちは、花子さん！"</p>
<p>add(5, 3) → 8</p>
<p>greetWithDefault() → "こんにちは、世界さん！"</p>
<p>sum(1, 2, 3, 4) → 10</p>
</div>

## オブジェクトと配列

```javascript
// オブジェクトの作成と操作
const person = {
    name: "太郎",
    age: 30,
    city: "東京"
};

// プロパティへのアクセス
console.log(person.name);        // "太郎"
console.log(person["age"]);      // 30

// プロパティの追加・変更
person.email = "taro@example.com";
person.age = 31;

// オブジェクトの分割代入
const { name, age } = person;

// 配列のメソッド
const numbers = [1, 2, 3, 4, 5];

// Map、filter、reduce
const doubled = numbers.map(n => n * 2);
const evens = numbers.filter(n => n % 2 === 0);
const sum = numbers.reduce((acc, n) => acc + n, 0);

// 配列の分割代入
const [first, second, ...rest] = numbers;
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<p><strong>オブジェクトと配列の例:</strong></p>
<p>person.name → "太郎"</p>
<p>doubled → [2, 4, 6, 8, 10]</p>
<p>evens → [2, 4]</p>
<p>sum → 15</p>
<p>first → 1, second → 2, rest → [3, 4, 5]</p>
</div>

## 制御フロー

```javascript
// if文
if (condition) {
    // コード
} else if (anotherCondition) {
    // コード
} else {
    // コード
}

// 三項演算子
const result = condition ? "true値" : "false値";

// switch文
switch (value) {
    case 1:
        console.log("1");
        break;
    case 2:
        console.log("2");
        break;
    default:
        console.log("その他");
}

// ループ
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
    // コード
}
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<p><strong>制御フローの例:</strong></p>
<p>三項演算子: true ? "はい" : "いいえ" → "はい"</p>
<p>forループ: 0, 1, 2, 3, 4</p>
<p>for-of: 値を反復</p>
<p>for-in: キーを反復</p>
</div>

## クラスとオブジェクト

```javascript
// ES6クラス
class Person {
    constructor(name, age) {
        this.name = name;
        this.age = age;
    }
    
    greet() {
        return `こんにちは、私は${this.name}です`;
    }
    
    static species() {
        return "ホモ・サピエンス";
    }
}

// 継承
class Student extends Person {
    constructor(name, age, grade) {
        super(name, age);
        this.grade = grade;
    }
    
    study() {
        return `${this.name}は勉強中です`;
    }
}

// オブジェクト作成
const taro = new Person("太郎", 30);
const hanako = new Student("花子", 20, "A");
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<p><strong>クラスの例:</strong></p>
<p>taro.greet() → "こんにちは、私は太郎です"</p>
<p>Person.species() → "ホモ・サピエンス"</p>
<p>hanako.study() → "花子は勉強中です"</p>
</div>

## PromiseとAsync/Await

```javascript
// Promise
const fetchData = () => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve("データの取得に成功しました");
        }, 1000);
    });
};

// Promiseチェイン
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

// 複数の非同期処理
async function getMultipleData() {
    const [data1, data2] = await Promise.all([
        fetchData(),
        fetchData()
    ]);
    return { data1, data2 };
}
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<p><strong>非同期処理の例:</strong></p>
<p>Promiseは1秒後に解決されます</p>
<p>async/awaitはよりクリーンな構文を提供します</p>
<p>Promise.all()は処理を並行実行します</p>
</div>

## DOM操作

```javascript
// 要素の選択
const element = document.getElementById('myId');
const elements = document.querySelectorAll('.myClass');
const firstElement = document.querySelector('.myClass');

// 要素の作成
const newDiv = document.createElement('div');
newDiv.textContent = 'Hello World';
newDiv.className = 'my-class';

// 要素の変更
element.textContent = '新しいテキスト';
element.innerHTML = '<strong>太字のテキスト</strong>';
element.style.color = 'red';
element.setAttribute('data-value', '123');

// イベントリスナー
element.addEventListener('click', function(event) {
    console.log('要素がクリックされました！');
});

// アロー関数のイベントリスナー
element.addEventListener('click', (event) => {
    event.preventDefault();
    console.log('アロー関数でクリックされました');
});
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<p><strong>DOMの例:</strong></p>
<button onclick="alert('ボタンがクリックされました！')">クリックしてください</button>
<p id="demo-text-ja" style="color: blue;">このテキストは変更可能です</p>
<script>
setTimeout(() => {
    const demoText = document.getElementById('demo-text-ja');
    if (demoText) {
        demoText.textContent = 'JavaScriptによってテキストが変更されました！';
        demoText.style.color = 'green';
    }
}, 2000);
</script>
</div>

## エラーハンドリング

```javascript
// try-catchブロック
try {
    const result = riskyOperation();
    console.log(result);
} catch (error) {
    console.error('エラーが発生しました:', error.message);
} finally {
    console.log('ここは常に実行されます');
}

// カスタムエラー
class CustomError extends Error {
    constructor(message) {
        super(message);
        this.name = 'CustomError';
    }
}

function validateAge(age) {
    if (age < 0) {
        throw new CustomError('年齢は負の値にできません');
    }
    return true;
}

// async/awaitでのエラーハンドリング
async function handleAsyncError() {
    try {
        const data = await fetchData();
        return data;
    } catch (error) {
        console.error('非同期エラー:', error);
        throw error;
    }
}
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<p><strong>エラーハンドリング:</strong></p>
<p>try-catchブロックは同期エラーを処理します</p>
<p>カスタムエラーは特定のエラータイプを提供します</p>
<p>async関数でのtry-catchによる非同期エラーハンドリング</p>
</div>

## ES6+機能

```javascript
// テンプレートリテラル
const name = "世界";
const greeting = `こんにちは、${name}！`;
const multiline = `
    これは
    複数行の文字列です
`;

// 分割代入
const [a, b, ...rest] = [1, 2, 3, 4, 5];
const {x, y, z = 'デフォルト'} = {x: 1, y: 2};

// スプレッド演算子
const arr1 = [1, 2, 3];
const arr2 = [4, 5, 6];
const combined = [...arr1, ...arr2];

const obj1 = {a: 1, b: 2};
const obj2 = {c: 3, d: 4};
const combinedObj = {...obj1, ...obj2};

// オプショナルチェイニング
const user = {
    profile: {
        name: '太郎'
    }
};
const userName = user?.profile?.name; // "太郎"
const userAge = user?.profile?.age; // undefined

// nullish合体演算子
const value = null ?? 'デフォルト'; // "デフォルト"
const value2 = '' ?? 'デフォルト'; // "" (空文字はnull/undefinedではない)
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<p><strong>ES6+の例:</strong></p>
<p>テンプレートリテラル: `こんにちは、${name}！` → "こんにちは、世界！"</p>
<p>スプレッド: [...[1,2], ...[3,4]] → [1, 2, 3, 4]</p>
<p>オプショナルチェイニングはundefinedプロパティでのエラーを防ぎます</p>
<p>nullish合体: null ?? 'デフォルト' → 'デフォルト'</p>
</div>

## よく使用されるユーティリティ

```javascript
// 型チェック
typeof "hello"; // "string"
typeof 42; // "number"
typeof true; // "boolean"
typeof undefined; // "undefined"
typeof null; // "object" (バグ！)
Array.isArray([1, 2, 3]); // true

// 文字列メソッド
"hello world".toUpperCase(); // "HELLO WORLD"
"  hello  ".trim(); // "hello"
"hello,world".split(","); // ["hello", "world"]
"hello".includes("ell"); // true

// 数値メソッド
parseInt("123"); // 123
parseFloat("123.45"); // 123.45
Math.round(123.456); // 123
Math.max(1, 2, 3); // 3
Math.random(); // 0から1

// 日付の処理
const now = new Date();
const timestamp = Date.now();
const dateString = now.toISOString();
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<p><strong>ユーティリティの例:</strong></p>
<p>typeof "hello" → "string"</p>
<p>"HELLO".toLowerCase() → "hello"</p>
<p>Math.round(4.7) → 5</p>
<p>現在のタイムスタンプ: <span id="timestamp-ja"></span></p>
<script>
document.getElementById('timestamp-ja').textContent = Date.now();
</script>
</div>

このJavaScriptチートシートは、モダンなWeb開発で最も重要な機能と構文を網羅しています。これらの概念を練習してJavaScriptをマスターしましょう！