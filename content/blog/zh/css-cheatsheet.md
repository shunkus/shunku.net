---
title: "CSS 备忘单"
date: "2013-01-20"
excerpt: "Web开发必备的CSS属性和技术的综合指南。"
---

# CSS 备忘单

Web开发必备的CSS属性和技术的综合指南。

## 基本语法

```css
选择器 {
    属性: 值;
    另一个属性: 另一个值;
}
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<strong>预览:</strong> CSS遵循选择器-属性-值的模式
</div>

## 选择器

```css
/* 元素选择器 */
p {
    color: blue;
}

/* 类选择器 */
.my-class {
    font-size: 16px;
}

/* ID选择器 */
#my-id {
    background-color: yellow;
}

/* 属性选择器 */
input[type="text"] {
    border: 1px solid gray;
}

/* 伪类 */
a:hover {
    color: red;
}

/* 后代选择器 */
div p {
    margin: 10px;
}

/* 子选择器 */
ul > li {
    list-style: none;
}
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<p style="color: blue;">元素选择器示例</p>
<p class="my-class" style="font-size: 16px;">类选择器示例</p>
<p id="my-id" style="background-color: yellow;">ID选择器示例</p>
</div>

## 文本和字体属性

```css
.text-styles {
    font-family: "Microsoft YaHei", Arial, sans-serif;
    font-size: 18px;
    font-weight: bold;
    font-style: italic;
    text-align: center;
    text-decoration: underline;
    text-transform: uppercase;
    line-height: 1.5;
    letter-spacing: 2px;
    color: #333;
}
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<div style="font-family: Arial, sans-serif; font-size: 18px; font-weight: bold; font-style: italic; text-align: center; text-decoration: underline; text-transform: uppercase; line-height: 1.5; letter-spacing: 2px; color: #333;">
    样式文本示例
</div>
</div>

## 盒子模型

```css
.box-model {
    width: 200px;
    height: 100px;
    padding: 20px;
    border: 2px solid black;
    margin: 10px;
    background-color: lightblue;
}
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<div style="width: 200px; height: 100px; padding: 20px; border: 2px solid black; margin: 10px; background-color: lightblue;">
    盒子模型示例
</div>
</div>

## 颜色和背景

```css
.color-examples {
    /* 颜色格式 */
    color: red;
    color: #ff0000;
    color: rgb(255, 0, 0);
    color: rgba(255, 0, 0, 0.5);
    color: hsl(0, 100%, 50%);
    
    /* 背景属性 */
    background-color: lightgreen;
    background-image: url('image.jpg');
    background-repeat: no-repeat;
    background-position: center;
    background-size: cover;
}
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<div style="padding: 10px; background-color: lightgreen; color: red; margin: 5px;">浅绿背景上的红色文字</div>
<div style="padding: 10px; background: linear-gradient(45deg, #ff6b6b, #4ecdc4); color: white; margin: 5px;">渐变背景</div>
</div>

## 布局 - Flexbox

```css
.flex-container {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 20px;
}

.flex-item {
    flex: 1;
    flex-grow: 1;
    flex-shrink: 0;
    flex-basis: auto;
}
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<div style="display: flex; justify-content: center; align-items: center; gap: 10px; background-color: #e0e0e0; padding: 10px;">
    <div style="background-color: #ff6b6b; padding: 10px; color: white;">项目1</div>
    <div style="background-color: #4ecdc4; padding: 10px; color: white;">项目2</div>
    <div style="background-color: #45b7d1; padding: 10px; color: white;">项目3</div>
</div>
</div>

## 布局 - Grid

```css
.grid-container {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: 100px 200px;
    grid-gap: 10px;
    grid-template-areas: 
        "header header header"
        "sidebar main main";
}

.grid-item {
    background-color: lightcoral;
    padding: 20px;
}
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<div style="display: grid; grid-template-columns: repeat(3, 1fr); grid-gap: 10px; background-color: #e0e0e0; padding: 10px;">
    <div style="background-color: lightcoral; padding: 10px;">网格项目1</div>
    <div style="background-color: lightcoral; padding: 10px;">网格项目2</div>
    <div style="background-color: lightcoral; padding: 10px;">网格项目3</div>
</div>
</div>

## 定位

```css
.positioning {
    position: static;    /* 默认 */
    position: relative;  /* 相对于正常位置 */
    position: absolute;  /* 相对于已定位的父元素 */
    position: fixed;     /* 相对于视口 */
    position: sticky;    /* 粘性定位 */
    
    top: 10px;
    right: 20px;
    bottom: 30px;
    left: 40px;
    z-index: 100;
}
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9; position: relative; height: 120px;">
<div style="position: absolute; top: 10px; left: 10px; background-color: yellow; padding: 5px;">绝对定位</div>
<div style="position: relative; top: 50px; background-color: lightblue; padding: 5px; width: fit-content;">相对定位</div>
</div>

## 边框和阴影

```css
.borders-shadows {
    border: 2px solid black;
    border-radius: 10px;
    border-top: 3px dashed red;
    border-right: 3px dotted blue;
    
    box-shadow: 5px 5px 10px rgba(0,0,0,0.3);
    text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
}
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<div style="border: 2px solid black; border-radius: 10px; box-shadow: 5px 5px 10px rgba(0,0,0,0.3); padding: 15px; background-color: white; margin: 10px;">
    <span style="text-shadow: 2px 2px 4px rgba(0,0,0,0.5);">带边框、阴影和文字阴影的框</span>
</div>
</div>

## 变换和动画

```css
.transform {
    transform: rotate(45deg);
    transform: scale(1.2);
    transform: translate(50px, 100px);
    transform: skew(20deg, 10deg);
}

.animation {
    animation: slideIn 2s ease-in-out;
    transition: all 0.3s ease;
}

@keyframes slideIn {
    from { opacity: 0; transform: translateX(-100px); }
    to { opacity: 1; transform: translateX(0); }
}
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<div style="background-color: #ff6b6b; padding: 10px; color: white; margin: 5px; transform: rotate(5deg); transition: transform 0.3s ease;" onmouseover="this.style.transform='rotate(0deg) scale(1.1)'" onmouseout="this.style.transform='rotate(5deg) scale(1)'">
    鼠标悬停变换效果
</div>
</div>

## 媒体查询（响应式设计）

```css
/* 移动优先方法 */
.responsive {
    width: 100%;
    padding: 10px;
}

/* 平板样式 */
@media screen and (min-width: 768px) {
    .responsive {
        width: 50%;
        padding: 20px;
    }
}

/* 桌面样式 */
@media screen and (min-width: 1024px) {
    .responsive {
        width: 33.33%;
        padding: 30px;
    }
}
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<div style="background-color: #4ecdc4; padding: 15px; color: white; border-radius: 5px;">
    响应式元素（在实际实现中调整窗口大小查看效果）
</div>
</div>

## 常用CSS工具类

```css
/* 显示工具类 */
.show { display: block; }
.hide { display: none; }
.invisible { visibility: hidden; }

/* 文本工具类 */
.text-center { text-align: center; }
.text-left { text-align: left; }
.text-right { text-align: right; }

/* 边距和内边距工具类 */
.m-0 { margin: 0; }
.p-2 { padding: 0.5rem; }
.mt-4 { margin-top: 1rem; }

/* 浮动工具类 */
.float-left { float: left; }
.float-right { float: right; }
.clearfix::after {
    content: "";
    display: table;
    clear: both;
}
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<div style="text-align: center; padding: 10px; background-color: #e0e0e0; margin-bottom: 5px;">居中文本</div>
<div style="text-align: left; padding: 10px; background-color: #f0f0f0; margin-bottom: 5px;">左对齐</div>
<div style="text-align: right; padding: 10px; background-color: #e0e0e0;">右对齐</div>
</div>

这份CSS备忘单涵盖了Web样式设计中最重要的属性和技术。通过练习这些属性来掌握CSS！