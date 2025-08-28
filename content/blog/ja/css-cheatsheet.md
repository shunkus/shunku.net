---
title: "CSS チートシート"
date: "2013-01-20"
excerpt: "Web開発に必須のCSSプロパティとテクニックの包括的なガイドです。"
---

# CSS チートシート

Web開発に必須のCSSプロパティとテクニックの包括的なガイドです。

## 基本構文

```css
セレクタ {
    プロパティ: 値;
    別のプロパティ: 別の値;
}
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<strong>プレビュー:</strong> CSSはセレクタ-プロパティ-値のパターンに従います
</div>

## セレクタ

```css
/* 要素セレクタ */
p {
    color: blue;
}

/* クラスセレクタ */
.my-class {
    font-size: 16px;
}

/* IDセレクタ */
#my-id {
    background-color: yellow;
}

/* 属性セレクタ */
input[type="text"] {
    border: 1px solid gray;
}

/* 疑似クラス */
a:hover {
    color: red;
}

/* 子孫セレクタ */
div p {
    margin: 10px;
}

/* 子セレクタ */
ul > li {
    list-style: none;
}
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<p style="color: blue;">要素セレクタの例</p>
<p class="my-class" style="font-size: 16px;">クラスセレクタの例</p>
<p id="my-id" style="background-color: yellow;">IDセレクタの例</p>
</div>

## テキストとフォントのプロパティ

```css
.text-styles {
    font-family: "Noto Sans JP", Arial, sans-serif;
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
    スタイル適用テキストの例
</div>
</div>

## ボックスモデル

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
    ボックスモデルの例
</div>
</div>

## 色と背景

```css
.color-examples {
    /* 色の形式 */
    color: red;
    color: #ff0000;
    color: rgb(255, 0, 0);
    color: rgba(255, 0, 0, 0.5);
    color: hsl(0, 100%, 50%);
    
    /* 背景プロパティ */
    background-color: lightgreen;
    background-image: url('image.jpg');
    background-repeat: no-repeat;
    background-position: center;
    background-size: cover;
}
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<div style="padding: 10px; background-color: lightgreen; color: red; margin: 5px;">薄緑背景に赤文字</div>
<div style="padding: 10px; background: linear-gradient(45deg, #ff6b6b, #4ecdc4); color: white; margin: 5px;">グラデーション背景</div>
</div>

## レイアウト - Flexbox

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
    <div style="background-color: #ff6b6b; padding: 10px; color: white;">アイテム1</div>
    <div style="background-color: #4ecdc4; padding: 10px; color: white;">アイテム2</div>
    <div style="background-color: #45b7d1; padding: 10px; color: white;">アイテム3</div>
</div>
</div>

## レイアウト - Grid

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
    <div style="background-color: lightcoral; padding: 10px;">グリッドアイテム1</div>
    <div style="background-color: lightcoral; padding: 10px;">グリッドアイテム2</div>
    <div style="background-color: lightcoral; padding: 10px;">グリッドアイテム3</div>
</div>
</div>

## ポジショニング

```css
.positioning {
    position: static;    /* デフォルト */
    position: relative;  /* 通常位置からの相対 */
    position: absolute;  /* 配置された親からの絶対 */
    position: fixed;     /* ビューポートからの固定 */
    position: sticky;    /* スティッキー配置 */
    
    top: 10px;
    right: 20px;
    bottom: 30px;
    left: 40px;
    z-index: 100;
}
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9; position: relative; height: 120px;">
<div style="position: absolute; top: 10px; left: 10px; background-color: yellow; padding: 5px;">絶対位置</div>
<div style="position: relative; top: 50px; background-color: lightblue; padding: 5px; width: fit-content;">相対位置</div>
</div>

## 枠線と影

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
    <span style="text-shadow: 2px 2px 4px rgba(0,0,0,0.5);">枠線、影、テキスト影付きボックス</span>
</div>
</div>

## 変形とアニメーション

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
    マウスホバーで変形効果
</div>
</div>

## メディアクエリ（レスポンシブデザイン）

```css
/* モバイルファースト */
.responsive {
    width: 100%;
    padding: 10px;
}

/* タブレット用スタイル */
@media screen and (min-width: 768px) {
    .responsive {
        width: 50%;
        padding: 20px;
    }
}

/* デスクトップ用スタイル */
@media screen and (min-width: 1024px) {
    .responsive {
        width: 33.33%;
        padding: 30px;
    }
}
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<div style="background-color: #4ecdc4; padding: 15px; color: white; border-radius: 5px;">
    レスポンシブ要素（実装時はウィンドウサイズ変更で効果を確認）
</div>
</div>

## よく使用されるCSSユーティリティ

```css
/* 表示ユーティリティ */
.show { display: block; }
.hide { display: none; }
.invisible { visibility: hidden; }

/* テキストユーティリティ */
.text-center { text-align: center; }
.text-left { text-align: left; }
.text-right { text-align: right; }

/* マージンとパディングユーティリティ */
.m-0 { margin: 0; }
.p-2 { padding: 0.5rem; }
.mt-4 { margin-top: 1rem; }

/* フロートユーティリティ */
.float-left { float: left; }
.float-right { float: right; }
.clearfix::after {
    content: "";
    display: table;
    clear: both;
}
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<div style="text-align: center; padding: 10px; background-color: #e0e0e0; margin-bottom: 5px;">中央揃えテキスト</div>
<div style="text-align: left; padding: 10px; background-color: #f0f0f0; margin-bottom: 5px;">左揃え</div>
<div style="text-align: right; padding: 10px; background-color: #e0e0e0;">右揃え</div>
</div>

このCSSチートシートでは、Webスタイリングに最も重要なプロパティとテクニックを網羅しています。これらのプロパティを使って練習し、CSSをマスターしましょう！