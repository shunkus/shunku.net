---
title: "JavaScript 备忘单"
date: "2013-09-12"
updatedDate: "2025-03-08"
excerpt: "现代Web开发必备的JavaScript语法和功能的综合指南。"
tags: ["JavaScript", "编程", "Web开发", "前端", "备忘单"]
author: "Shun Kushigami"
---

# JavaScript 备忘单

现代Web开发必备的JavaScript语法和功能的综合指南。

## 变量和数据类型

```javascript
// 变量声明
var oldWay = "函数作用域";
let blockScoped = "块作用域";
const constant = "不可重新分配";

// 数据类型
let string = "Hello World";
let number = 42;
let boolean = true;
let array = [1, 2, 3, 4];
let object = { name: "张三", age: 30 };
let nullValue = null;
let undefinedValue = undefined;
let symbol = Symbol("唯一");
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<strong>预览:</strong> 
<p>变量: 字符串: "Hello World", 数字: 42, 布尔值: true, 数组: [1,2,3,4]</p>
</div>

## 函数

```javascript
// 函数声明
function greet(name) {
    return `你好，${name}！`;
}

// 函数表达式
const greetExpression = function(name) {
    return `你好，${name}！`;
};

// 箭头函数
const greetArrow = (name) => `你好，${name}！`;
const add = (a, b) => a + b;
const multiply = (a, b) => {
    return a * b;
};

// 默认参数
function greetWithDefault(name = "世界") {
    return `你好，${name}！`;
}

// 剩余参数
function sum(...numbers) {
    return numbers.reduce((acc, num) => acc + num, 0);
}
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<p><strong>函数示例:</strong></p>
<p>greet("小明") → "你好，小明！"</p>
<p>add(5, 3) → 8</p>
<p>greetWithDefault() → "你好，世界！"</p>
<p>sum(1, 2, 3, 4) → 10</p>
</div>

## 对象和数组

```javascript
// 对象创建和操作
const person = {
    name: "张三",
    age: 30,
    city: "北京"
};

// 访问属性
console.log(person.name);        // "张三"
console.log(person["age"]);      // 30

// 添加/修改属性
person.email = "zhangsan@example.com";
person.age = 31;

// 对象解构
const { name, age } = person;

// 数组方法
const numbers = [1, 2, 3, 4, 5];

// Map, filter, reduce
const doubled = numbers.map(n => n * 2);
const evens = numbers.filter(n => n % 2 === 0);
const sum = numbers.reduce((acc, n) => acc + n, 0);

// 数组解构
const [first, second, ...rest] = numbers;
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<p><strong>对象和数组示例:</strong></p>
<p>person.name → "张三"</p>
<p>doubled → [2, 4, 6, 8, 10]</p>
<p>evens → [2, 4]</p>
<p>sum → 15</p>
<p>first → 1, second → 2, rest → [3, 4, 5]</p>
</div>

## 控制流程

```javascript
// if语句
if (condition) {
    // 代码
} else if (anotherCondition) {
    // 代码
} else {
    // 代码
}

// 三元操作符
const result = condition ? "真值" : "假值";

// switch语句
switch (value) {
    case 1:
        console.log("一");
        break;
    case 2:
        console.log("二");
        break;
    default:
        console.log("其他");
}

// 循环
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
    // 代码
}
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<p><strong>控制流程示例:</strong></p>
<p>三元操作符: true ? "是" : "否" → "是"</p>
<p>for循环: 0, 1, 2, 3, 4</p>
<p>for-of: 遍历值</p>
<p>for-in: 遍历键</p>
</div>

## 类和对象

```javascript
// ES6类
class Person {
    constructor(name, age) {
        this.name = name;
        this.age = age;
    }
    
    greet() {
        return `你好，我是${this.name}`;
    }
    
    static species() {
        return "智人";
    }
}

// 继承
class Student extends Person {
    constructor(name, age, grade) {
        super(name, age);
        this.grade = grade;
    }
    
    study() {
        return `${this.name}正在学习`;
    }
}

// 对象创建
const zhangsan = new Person("张三", 30);
const xiaoming = new Student("小明", 20, "A");
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<p><strong>类示例:</strong></p>
<p>zhangsan.greet() → "你好，我是张三"</p>
<p>Person.species() → "智人"</p>
<p>xiaoming.study() → "小明正在学习"</p>
</div>

## Promise和Async/Await

```javascript
// Promise
const fetchData = () => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve("成功获取数据");
        }, 1000);
    });
};

// Promise链
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

// 多个异步操作
async function getMultipleData() {
    const [data1, data2] = await Promise.all([
        fetchData(),
        fetchData()
    ]);
    return { data1, data2 };
}
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<p><strong>异步示例:</strong></p>
<p>Promise在1秒后解决</p>
<p>async/await提供更清洁的语法</p>
<p>Promise.all()并发运行操作</p>
</div>

## DOM操作

```javascript
// 选择元素
const element = document.getElementById('myId');
const elements = document.querySelectorAll('.myClass');
const firstElement = document.querySelector('.myClass');

// 创建元素
const newDiv = document.createElement('div');
newDiv.textContent = 'Hello World';
newDiv.className = 'my-class';

// 修改元素
element.textContent = '新文本';
element.innerHTML = '<strong>粗体文本</strong>';
element.style.color = 'red';
element.setAttribute('data-value', '123');

// 事件监听器
element.addEventListener('click', function(event) {
    console.log('元素被点击了！');
});

// 箭头函数事件监听器
element.addEventListener('click', (event) => {
    event.preventDefault();
    console.log('用箭头函数点击');
});
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<p><strong>DOM示例:</strong></p>
<button onclick="alert('按钮被点击了！')">点击我！</button>
<p id="demo-text-zh" style="color: blue;">这个文本可以被修改</p>
<script>
setTimeout(() => {
    const demoText = document.getElementById('demo-text-zh');
    if (demoText) {
        demoText.textContent = '文本被JavaScript修改了！';
        demoText.style.color = 'green';
    }
}, 2000);
</script>
</div>

## 错误处理

```javascript
// try-catch块
try {
    const result = riskyOperation();
    console.log(result);
} catch (error) {
    console.error('发生错误:', error.message);
} finally {
    console.log('这里总是运行');
}

// 自定义错误
class CustomError extends Error {
    constructor(message) {
        super(message);
        this.name = 'CustomError';
    }
}

function validateAge(age) {
    if (age < 0) {
        throw new CustomError('年龄不能为负数');
    }
    return true;
}

// async/await中的错误处理
async function handleAsyncError() {
    try {
        const data = await fetchData();
        return data;
    } catch (error) {
        console.error('异步错误:', error);
        throw error;
    }
}
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<p><strong>错误处理:</strong></p>
<p>try-catch块处理同步错误</p>
<p>自定义错误提供特定错误类型</p>
<p>async函数中使用try-catch处理异步错误</p>
</div>

## ES6+特性

```javascript
// 模板字符串
const name = "世界";
const greeting = `你好，${name}！`;
const multiline = `
    这是一个
    多行字符串
`;

// 解构赋值
const [a, b, ...rest] = [1, 2, 3, 4, 5];
const {x, y, z = '默认值'} = {x: 1, y: 2};

// 扩展操作符
const arr1 = [1, 2, 3];
const arr2 = [4, 5, 6];
const combined = [...arr1, ...arr2];

const obj1 = {a: 1, b: 2};
const obj2 = {c: 3, d: 4};
const combinedObj = {...obj1, ...obj2};

// 可选链
const user = {
    profile: {
        name: '张三'
    }
};
const userName = user?.profile?.name; // "张三"
const userAge = user?.profile?.age; // undefined

// 空值合并
const value = null ?? '默认值'; // "默认值"
const value2 = '' ?? '默认值'; // "" (空字符串不是null/undefined)
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<p><strong>ES6+示例:</strong></p>
<p>模板字符串: `你好，${name}！` → "你好，世界！"</p>
<p>扩展: [...[1,2], ...[3,4]] → [1, 2, 3, 4]</p>
<p>可选链防止undefined属性的错误</p>
<p>空值合并: null ?? '默认值' → '默认值'</p>
</div>

## 常用工具

```javascript
// 类型检查
typeof "hello"; // "string"
typeof 42; // "number"
typeof true; // "boolean"
typeof undefined; // "undefined"
typeof null; // "object" (bug!)
Array.isArray([1, 2, 3]); // true

// 字符串方法
"hello world".toUpperCase(); // "HELLO WORLD"
"  hello  ".trim(); // "hello"
"hello,world".split(","); // ["hello", "world"]
"hello".includes("ell"); // true

// 数字方法
parseInt("123"); // 123
parseFloat("123.45"); // 123.45
Math.round(123.456); // 123
Math.max(1, 2, 3); // 3
Math.random(); // 0到1

// 日期处理
const now = new Date();
const timestamp = Date.now();
const dateString = now.toISOString();
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<p><strong>工具示例:</strong></p>
<p>typeof "hello" → "string"</p>
<p>"HELLO".toLowerCase() → "hello"</p>
<p>Math.round(4.7) → 5</p>
<p>当前时间戳: <span id="timestamp-zh"></span></p>
<script>
document.getElementById('timestamp-zh').textContent = Date.now();
</script>
</div>

这个JavaScript备忘单涵盖了现代Web开发中最重要的功能和语法。通过练习这些概念来掌握JavaScript！