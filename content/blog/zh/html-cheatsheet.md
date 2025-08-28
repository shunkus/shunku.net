---
title: "HTML 备忘单"
date: "2012-03-15"
updatedDate: "2025-01-10"
excerpt: "Web开发必备的HTML元素综合指南。"
tags: ["HTML", "Web开发", "标记", "前端", "备忘单"]
author: "Shun Kushigami"
---

# HTML 备忘单

Web开发必备的HTML元素综合指南。

## 基本结构

```html
<!DOCTYPE html>
<html lang="zh">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>页面标题</title>
</head>
<body>
    <!-- 内容放在这里 -->
</body>
</html>
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<strong>预览:</strong> 基本HTML文档结构
</div>

## 标题标签

```html
<h1>主标题</h1>
<h2>章节标题</h2>
<h3>小节标题</h3>
<h4>四级标题</h4>
<h5>五级标题</h5>
<h6>六级标题</h6>
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<h1>主标题</h1>
<h2>章节标题</h2>
<h3>小节标题</h3>
<h4>四级标题</h4>
<h5>五级标题</h5>
<h6>六级标题</h6>
</div>

## 段落和文本

```html
<p>这是一个段落。</p>
<br>
<strong>粗体文本</strong>
<em>斜体文本</em>
<u>下划线文本</u>
<mark>高亮文本</mark>
<small>小字文本</small>
<del>删除文本</del>
<ins>插入文本</ins>
<sub>下标</sub>
<sup>上标</sup>
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<p>这是一个段落。</p>
<br>
<strong>粗体文本</strong><br>
<em>斜体文本</em><br>
<u>下划线文本</u><br>
<mark>高亮文本</mark><br>
<small>小字文本</small><br>
<del>删除文本</del><br>
<ins>插入文本</ins><br>
H<sub>2</sub>O<br>
X<sup>2</sup>
</div>

## 链接

```html
<a href="https://example.com">外部链接</a>
<a href="mailto:someone@example.com">邮件链接</a>
<a href="tel:+1234567890">电话链接</a>
<a href="#section1">内部锚点链接</a>
<a href="https://example.com" target="_blank">新标签页打开</a>
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<a href="https://example.com">外部链接</a><br>
<a href="mailto:someone@example.com">邮件链接</a><br>
<a href="tel:+1234567890">电话链接</a><br>
<a href="#section1">内部锚点链接</a><br>
<a href="https://example.com" target="_blank">新标签页打开</a>
</div>

## 列表

```html
<!-- 无序列表 -->
<ul>
    <li>第一项</li>
    <li>第二项</li>
    <li>第三项</li>
</ul>

<!-- 有序列表 -->
<ol>
    <li>第一个</li>
    <li>第二个</li>
    <li>第三个</li>
</ol>

<!-- 定义列表 -->
<dl>
    <dt>HTML</dt>
    <dd>超文本标记语言</dd>
    <dt>CSS</dt>
    <dd>层叠样式表</dd>
</dl>
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<ul>
    <li>第一项</li>
    <li>第二项</li>
    <li>第三项</li>
</ul>

<ol>
    <li>第一个</li>
    <li>第二个</li>
    <li>第三个</li>
</ol>

<dl>
    <dt>HTML</dt>
    <dd>超文本标记语言</dd>
    <dt>CSS</dt>
    <dd>层叠样式表</dd>
</dl>
</div>

## 图片

```html
<img src="image.jpg" alt="图片描述" width="300" height="200">
<img src="image.jpg" alt="响应式图片" style="max-width: 100%; height: auto;">
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<img src="https://via.placeholder.com/300x200" alt="示例图片" style="max-width: 100%; height: auto;">
</div>

## 表格

```html
<table border="1">
    <thead>
        <tr>
            <th>姓名</th>
            <th>年龄</th>
            <th>城市</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>张三</td>
            <td>25</td>
            <td>北京</td>
        </tr>
        <tr>
            <td>李四</td>
            <td>30</td>
            <td>上海</td>
        </tr>
    </tbody>
</table>
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<table border="1" style="border-collapse: collapse; width: 100%;">
    <thead>
        <tr>
            <th style="padding: 8px; background-color: #f0f0f0;">姓名</th>
            <th style="padding: 8px; background-color: #f0f0f0;">年龄</th>
            <th style="padding: 8px; background-color: #f0f0f0;">城市</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td style="padding: 8px;">张三</td>
            <td style="padding: 8px;">25</td>
            <td style="padding: 8px;">北京</td>
        </tr>
        <tr>
            <td style="padding: 8px;">李四</td>
            <td style="padding: 8px;">30</td>
            <td style="padding: 8px;">上海</td>
        </tr>
    </tbody>
</table>
</div>

## 表单元素

```html
<form>
    <label for="name">姓名:</label>
    <input type="text" id="name" name="name" placeholder="请输入姓名">
    
    <label for="email">邮箱:</label>
    <input type="email" id="email" name="email">
    
    <label for="password">密码:</label>
    <input type="password" id="password" name="password">
    
    <label for="age">年龄:</label>
    <input type="number" id="age" name="age" min="1" max="120">
    
    <label for="message">留言:</label>
    <textarea id="message" name="message" rows="4" cols="50"></textarea>
    
    <label for="country">国家:</label>
    <select id="country" name="country">
        <option value="cn">中国</option>
        <option value="us">美国</option>
        <option value="jp">日本</option>
    </select>
    
    <input type="checkbox" id="subscribe" name="subscribe">
    <label for="subscribe">订阅新闻</label>
    
    <input type="radio" id="male" name="gender" value="male">
    <label for="male">男性</label>
    <input type="radio" id="female" name="gender" value="female">
    <label for="female">女性</label>
    
    <button type="submit">提交</button>
    <button type="reset">重置</button>
</form>
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<form>
    <div style="margin: 5px 0;">
        <label for="name">姓名:</label><br>
        <input type="text" id="name" name="name" placeholder="请输入姓名" style="margin-top: 2px;">
    </div>
    
    <div style="margin: 5px 0;">
        <label for="email">邮箱:</label><br>
        <input type="email" id="email" name="email" style="margin-top: 2px;">
    </div>
    
    <div style="margin: 5px 0;">
        <label for="message">留言:</label><br>
        <textarea id="message" name="message" rows="3" cols="30" style="margin-top: 2px;"></textarea>
    </div>
    
    <div style="margin: 5px 0;">
        <label for="country">国家:</label><br>
        <select id="country" name="country" style="margin-top: 2px;">
            <option value="cn">中国</option>
            <option value="us">美国</option>
            <option value="jp">日本</option>
        </select>
    </div>
    
    <div style="margin: 5px 0;">
        <input type="checkbox" id="subscribe" name="subscribe">
        <label for="subscribe">订阅新闻</label>
    </div>
    
    <div style="margin: 5px 0;">
        <input type="radio" id="male" name="gender" value="male">
        <label for="male">男性</label>
        <input type="radio" id="female" name="gender" value="female">
        <label for="female">女性</label>
    </div>
    
    <div style="margin: 10px 0;">
        <button type="button">提交</button>
        <button type="button">重置</button>
    </div>
</form>
</div>

## 语义化元素

```html
<header>网站头部</header>
<nav>导航栏</nav>
<main>主要内容</main>
<section>章节</section>
<article>文章或独立内容</article>
<aside>侧边栏或附加信息</aside>
<footer>网站底部</footer>
<figure>
    <img src="image.jpg" alt="描述">
    <figcaption>图片标题</figcaption>
</figure>
<details>
    <summary>点击展开</summary>
    <p>隐藏的内容将在这里显示。</p>
</details>
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<header style="background-color: #e0e0e0; padding: 10px;">网站头部</header>
<nav style="background-color: #d0d0d0; padding: 10px;">导航栏</nav>
<main style="background-color: #f0f0f0; padding: 10px;">主要内容</main>
<section style="background-color: #e5e5e5; padding: 10px;">章节</section>
<article style="background-color: #f5f5f5; padding: 10px;">文章或独立内容</article>
<aside style="background-color: #e8e8e8; padding: 10px;">侧边栏或附加信息</aside>
<footer style="background-color: #e0e0e0; padding: 10px;">网站底部</footer>
<details style="margin: 10px 0;">
    <summary>点击展开</summary>
    <p>隐藏的内容将在这里显示。</p>
</details>
</div>

## 多媒体

```html
<!-- 视频 -->
<video controls width="300">
    <source src="video.mp4" type="video/mp4">
    <source src="video.webm" type="video/webm">
    您的浏览器不支持视频标签。
</video>

<!-- 音频 -->
<audio controls>
    <source src="audio.mp3" type="audio/mpeg">
    <source src="audio.ogg" type="audio/ogg">
    您的浏览器不支持音频标签。
</audio>

<!-- 嵌入 -->
<iframe src="https://www.example.com" width="300" height="200"></iframe>
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<video controls width="300" style="background-color: #000;">
    <source src="https://www.w3schools.com/html/mov_bbb.mp4" type="video/mp4">
    您的浏览器不支持视频标签。
</video>
<br><br>
<audio controls>
    <source src="https://www.w3schools.com/html/horse.mp3" type="audio/mpeg">
    您的浏览器不支持音频标签。
</audio>
</div>

这个备忘单涵盖了Web开发中最常用的HTML元素。通过实际使用这些元素来提高您的Web开发技能！