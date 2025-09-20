---
title: "Day 1: HTMLの基礎とWebの仕組み"
order: 1
---

## はじめに

HTMLは「HyperText Markup Language」の略で、Webページを作成するための基本的なマークアップ言語です。今日は、HTMLの基礎概念とWebの仕組みについて学習します。

## HTMLとは

HTMLは、Webページの構造と内容を定義する言語です。ブラウザはHTMLコードを解釈して、人間が読みやすい形式でWebページを表示します。

### HTMLの特徴

- **マークアップ言語**: プログラミング言語ではなく、文書の構造を記述する言語
- **タグベース**: 要素をタグで囲んで意味を持たせる
- **階層構造**: 要素の入れ子構造で文書を組み立てる

## 基本的なHTML文書の構造

```html
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ページタイトル</title>
</head>
<body>
    <h1>見出し</h1>
    <p>段落のテキスト</p>
</body>
</html>
```

### 構造の説明

1. **DOCTYPE宣言**: HTML5文書であることを宣言
2. **html要素**: ルート要素、lang属性で言語を指定
3. **head要素**: メタ情報を含む
4. **body要素**: 実際に表示される内容

## 基本的なHTMLタグ

### 見出しタグ

```html
<h1>大見出し</h1>
<h2>中見出し</h2>
<h3>小見出し</h3>
<h4>より小さい見出し</h4>
<h5>さらに小さい見出し</h5>
<h6>最小の見出し</h6>
```

### 段落と改行

```html
<p>これは段落です。</p>
<p>別の段落です。<br>改行を含みます。</p>
```

### リスト

```html
<!-- 順序なしリスト -->
<ul>
    <li>項目1</li>
    <li>項目2</li>
    <li>項目3</li>
</ul>

<!-- 順序付きリスト -->
<ol>
    <li>ステップ1</li>
    <li>ステップ2</li>
    <li>ステップ3</li>
</ol>
```

## 属性の使い方

HTMLタグには属性を追加して、追加情報や動作を指定できます。

```html
<a href="https://example.com" target="_blank">リンクテキスト</a>
<img src="image.jpg" alt="画像の説明" width="300" height="200">
<div id="main" class="container">コンテンツ</div>
```

### 主要な属性

- **id**: 要素の一意な識別子
- **class**: スタイリングやグループ化のための分類
- **href**: リンク先のURL
- **src**: リソースのパス
- **alt**: 代替テキスト

## コメントの書き方

```html
<!-- これはコメントです -->
<!-- 
  複数行の
  コメントも
  書けます
-->
```

## 実践演習

今日学んだ内容を使って、簡単な自己紹介ページを作成してみましょう。

```html
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>自己紹介</title>
</head>
<body>
    <h1>私の自己紹介</h1>
    
    <h2>基本情報</h2>
    <p>名前：山田太郎</p>
    <p>職業：Web開発者</p>
    
    <h2>趣味</h2>
    <ul>
        <li>プログラミング</li>
        <li>読書</li>
        <li>映画鑑賞</li>
    </ul>
    
    <h2>好きな技術</h2>
    <ol>
        <li>HTML</li>
        <li>CSS</li>
        <li>JavaScript</li>
    </ol>
    
    <p>詳しくは<a href="https://example.com">こちら</a>をご覧ください。</p>
</body>
</html>
```

## まとめ

今日は以下の内容を学習しました：

- HTMLの基本概念と役割
- HTML文書の基本構造
- 主要なHTMLタグの使い方
- 属性の指定方法
- コメントの書き方

明日は、より多くのHTML要素と、セマンティックHTMLについて学習します。

## 課題

1. 今日学んだタグを使って、自分の好きなものについての紹介ページを作成してください
2. 少なくとも5種類以上の異なるタグを使用してください
3. 適切な見出し構造を意識してページを組み立ててください