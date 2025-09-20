---
title: "Day 2: セマンティックHTMLとページ構造"
order: 2
---

## セマンティックHTMLとは

セマンティックHTML（意味論的HTML）は、要素に意味を持たせることで、文書の構造をより明確に表現する手法です。これにより、検索エンジンやスクリーンリーダーが内容をより正確に理解できるようになります。

## HTML5のセマンティック要素

### ページ構造を表す要素

```html
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <title>セマンティックHTMLの例</title>
</head>
<body>
    <header>
        <nav>
            <ul>
                <li><a href="#home">ホーム</a></li>
                <li><a href="#about">概要</a></li>
                <li><a href="#contact">お問い合わせ</a></li>
            </ul>
        </nav>
    </header>
    
    <main>
        <article>
            <h1>記事のタイトル</h1>
            <p>記事の内容...</p>
        </article>
        
        <aside>
            <h2>関連情報</h2>
            <p>サイドバーの内容...</p>
        </aside>
    </main>
    
    <footer>
        <p>&copy; 2024 サイト名</p>
    </footer>
</body>
</html>
```

### 主要なセマンティック要素

#### header要素
ページやセクションのヘッダー部分を表します。

```html
<header>
    <h1>サイトタイトル</h1>
    <p>サイトの説明</p>
</header>
```

#### nav要素
ナビゲーションリンクのセクションを表します。

```html
<nav>
    <ul>
        <li><a href="/home">ホーム</a></li>
        <li><a href="/products">製品</a></li>
        <li><a href="/about">会社情報</a></li>
    </ul>
</nav>
```

#### main要素
文書の主要なコンテンツを表します。ページに1つだけ配置します。

```html
<main>
    <h1>メインコンテンツ</h1>
    <p>ページの主要な内容がここに入ります。</p>
</main>
```

#### article要素
独立した完結型のコンテンツを表します。

```html
<article>
    <h2>ブログ記事のタイトル</h2>
    <time datetime="2024-03-15">2024年3月15日</time>
    <p>記事の本文...</p>
</article>
```

#### section要素
文書の一般的なセクションを表します。

```html
<section>
    <h2>セクションの見出し</h2>
    <p>セクションの内容...</p>
</section>
```

#### aside要素
メインコンテンツと関連はあるが、独立した補足的な内容を表します。

```html
<aside>
    <h3>関連記事</h3>
    <ul>
        <li><a href="#">関連記事1</a></li>
        <li><a href="#">関連記事2</a></li>
    </ul>
</aside>
```

#### footer要素
ページやセクションのフッター部分を表します。

```html
<footer>
    <p>著作権情報</p>
    <address>
        連絡先: example@example.com
    </address>
</footer>
```

## その他の重要なセマンティック要素

### figure と figcaption

画像や図表とその説明をグループ化します。

```html
<figure>
    <img src="chart.png" alt="売上グラフ">
    <figcaption>2024年第1四半期の売上推移</figcaption>
</figure>
```

### time要素

日付や時刻を表します。

```html
<time datetime="2024-03-15T09:00">2024年3月15日 9:00</time>
```

### mark要素

ハイライトされたテキストを表します。

```html
<p>検索結果: <mark>HTML</mark>は構造を定義する言語です。</p>
```

### details と summary

展開可能な詳細情報を表します。

```html
<details>
    <summary>詳細を見る</summary>
    <p>ここに詳細な説明が表示されます。</p>
</details>
```

## セマンティックHTMLの利点

1. **アクセシビリティの向上**: スクリーンリーダーが構造を正確に理解
2. **SEOの改善**: 検索エンジンがコンテンツを正確に解釈
3. **保守性の向上**: コードの意図が明確になる
4. **将来性**: Web標準に準拠した構造

## 実践例：ブログページの構造

```html
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>私のブログ</title>
</head>
<body>
    <header>
        <h1>テックブログ</h1>
        <nav>
            <ul>
                <li><a href="#latest">最新記事</a></li>
                <li><a href="#archive">アーカイブ</a></li>
                <li><a href="#about">このブログについて</a></li>
            </ul>
        </nav>
    </header>
    
    <main>
        <section id="latest">
            <h2>最新記事</h2>
            
            <article>
                <header>
                    <h3>HTMLセマンティクスの重要性</h3>
                    <time datetime="2024-03-15">2024年3月15日</time>
                </header>
                <p>
                    セマンティックHTMLを使用することで、
                    Webページの構造がより明確になります...
                </p>
                <footer>
                    <p>カテゴリー: Web開発</p>
                </footer>
            </article>
            
            <article>
                <header>
                    <h3>CSSグリッドレイアウト入門</h3>
                    <time datetime="2024-03-14">2024年3月14日</time>
                </header>
                <p>
                    CSSグリッドを使うと、複雑なレイアウトも
                    簡単に実現できます...
                </p>
                <footer>
                    <p>カテゴリー: CSS</p>
                </footer>
            </article>
        </section>
        
        <aside>
            <section>
                <h3>人気記事</h3>
                <ol>
                    <li><a href="#">JavaScriptの基礎</a></li>
                    <li><a href="#">レスポンシブデザイン</a></li>
                    <li><a href="#">フレームワーク比較</a></li>
                </ol>
            </section>
            
            <section>
                <h3>タグクラウド</h3>
                <nav>
                    <a href="#">HTML</a>
                    <a href="#">CSS</a>
                    <a href="#">JavaScript</a>
                    <a href="#">React</a>
                </nav>
            </section>
        </aside>
    </main>
    
    <footer>
        <p>&copy; 2024 テックブログ</p>
        <address>
            お問い合わせ: <a href="mailto:blog@example.com">blog@example.com</a>
        </address>
    </footer>
</body>
</html>
```

## まとめ

今日は以下の内容を学習しました：

- セマンティックHTMLの概念と重要性
- HTML5の主要なセマンティック要素
- 適切なページ構造の作り方
- アクセシビリティとSEOへの配慮

明日は、フォーム要素と入力コントロールについて詳しく学習します。

## 課題

1. セマンティック要素を使って、ニュースサイトのトップページの構造を作成してください
2. header、nav、main、article、aside、footerをすべて使用してください
3. 適切な見出しレベルとtime要素を活用してください