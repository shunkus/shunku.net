---
title: "HTMLチートシート: 基本タグとエレメント"
date: "2012-08-15"
excerpt: "HTMLタグとエレメントのライブプレビュー付き包括的リファレンスガイド。Web開発プロジェクトでのクイックルックアップに最適です。"
tags: ["HTML", "Web開発", "チートシート", "フロントエンド"]
author: "串上 俊"
---

# HTMLチートシート: 基本タグとエレメント

HTML（HyperText Markup Language）はWeb開発の基礎です。このチートシートは、最もよく使われるHTMLタグとエレメントのライブプレビュー付きクイックリファレンスを提供します。

## ドキュメント構造

```html
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ページタイトル</title>
</head>
<body>
    <!-- コンテンツはここに -->
</body>
</html>
```

## テキスト要素

### 見出し
```html
<h1>メインタイトル</h1>
<h2>セクション見出し</h2>
<h3>サブセクション見出し</h3>
<h4>小見出し</h4>
<h5>より小さい見出し</h5>
<h6>最小の見出し</h6>
```

**プレビュー:**
<div style="border: 1px solid #ddd; padding: 15px; margin: 10px 0; background: #f9f9f9;">
<h1 style="margin: 5px 0;">メインタイトル</h1>
<h2 style="margin: 5px 0;">セクション見出し</h2>
<h3 style="margin: 5px 0;">サブセクション見出し</h3>
<h4 style="margin: 5px 0;">小見出し</h4>
<h5 style="margin: 5px 0;">より小さい見出し</h5>
<h6 style="margin: 5px 0;">最小の見出し</h6>
</div>

### 段落とテキスト装飾
```html
<p>これは段落です。</p>
<strong>太字テキスト</strong>
<em>強調テキスト</em>
<b>太字テキスト（視覚的のみ）</b>
<i>斜体テキスト（視覚的のみ）</i>
<u>下線テキスト</u>
<mark>ハイライトテキスト</mark>
<small>小さいテキスト</small>
<del>削除されたテキスト</del>
<ins>挿入されたテキスト</ins>
<sub>下付き文字</sub>
<sup>上付き文字</sup>
```

**プレビュー:**
<div style="border: 1px solid #ddd; padding: 15px; margin: 10px 0; background: #f9f9f9;">
<p>これは段落です。</p>
<p><strong>太字テキスト</strong> | <em>強調テキスト</em> | <b>太字テキスト（視覚的のみ）</b> | <i>斜体テキスト（視覚的のみ）</i></p>
<p><u>下線テキスト</u> | <mark>ハイライトテキスト</mark> | <small>小さいテキスト</small></p>
<p><del>削除されたテキスト</del> | <ins>挿入されたテキスト</ins> | H<sub>2</sub>O | E=mc<sup>2</sup></p>
</div>

## リスト

### 番号なしリスト
```html
<ul>
    <li>最初の項目</li>
    <li>2番目の項目</li>
    <li>3番目の項目</li>
</ul>
```

**プレビュー:**
<div style="border: 1px solid #ddd; padding: 15px; margin: 10px 0; background: #f9f9f9;">
<ul>
    <li>最初の項目</li>
    <li>2番目の項目</li>
    <li>3番目の項目</li>
</ul>
</div>

### 番号付きリスト
```html
<ol>
    <li>最初のステップ</li>
    <li>2番目のステップ</li>
    <li>3番目のステップ</li>
</ol>
```

**プレビュー:**
<div style="border: 1px solid #ddd; padding: 15px; margin: 10px 0; background: #f9f9f9;">
<ol>
    <li>最初のステップ</li>
    <li>2番目のステップ</li>
    <li>3番目のステップ</li>
</ol>
</div>

### 定義リスト
```html
<dl>
    <dt>用語</dt>
    <dd>定義</dd>
    <dt>別の用語</dt>
    <dd>別の定義</dd>
</dl>
```

**プレビュー:**
<div style="border: 1px solid #ddd; padding: 15px; margin: 10px 0; background: #f9f9f9;">
<dl>
    <dt><strong>HTML</strong></dt>
    <dd>ハイパーテキスト マークアップ言語</dd>
    <dt><strong>CSS</strong></dt>
    <dd>カスケーディング スタイル シート</dd>
</dl>
</div>

## リンクとナビゲーション

```html
<!-- 外部リンク -->
<a href="https://example.com">サンプルサイトへ</a>

<!-- 内部リンク -->
<a href="about.html">概要ページ</a>

<!-- メールリンク -->
<a href="mailto:user@example.com">メールを送る</a>

<!-- 電話リンク -->
<a href="tel:+1234567890">電話をかける</a>
```

**プレビュー:**
<div style="border: 1px solid #ddd; padding: 15px; margin: 10px 0; background: #f9f9f9;">
<a href="#" style="color: #0066cc; text-decoration: underline;">サンプルサイトへ</a> | 
<a href="#" style="color: #0066cc; text-decoration: underline;">概要ページ</a> | 
<a href="#" style="color: #0066cc; text-decoration: underline;">メールを送る</a> | 
<a href="#" style="color: #0066cc; text-decoration: underline;">電話をかける</a>
</div>

## テーブル

```html
<table>
    <thead>
        <tr>
            <th>ヘッダー 1</th>
            <th>ヘッダー 2</th>
            <th>ヘッダー 3</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>セル 1</td>
            <td>セル 2</td>
            <td>セル 3</td>
        </tr>
        <tr>
            <td>セル 4</td>
            <td>セル 5</td>
            <td>セル 6</td>
        </tr>
    </tbody>
</table>
```

**プレビュー:**
<div style="border: 1px solid #ddd; padding: 15px; margin: 10px 0; background: #f9f9f9;">
<table style="border-collapse: collapse; width: 100%;">
    <thead>
        <tr>
            <th style="border: 1px solid #ddd; padding: 8px; background: #f2f2f2;">ヘッダー 1</th>
            <th style="border: 1px solid #ddd; padding: 8px; background: #f2f2f2;">ヘッダー 2</th>
            <th style="border: 1px solid #ddd; padding: 8px; background: #f2f2f2;">ヘッダー 3</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td style="border: 1px solid #ddd; padding: 8px;">セル 1</td>
            <td style="border: 1px solid #ddd; padding: 8px;">セル 2</td>
            <td style="border: 1px solid #ddd; padding: 8px;">セル 3</td>
        </tr>
        <tr>
            <td style="border: 1px solid #ddd; padding: 8px;">セル 4</td>
            <td style="border: 1px solid #ddd; padding: 8px;">セル 5</td>
            <td style="border: 1px solid #ddd; padding: 8px;">セル 6</td>
        </tr>
    </tbody>
</table>
</div>

## フォーム

```html
<form>
    <input type="text" placeholder="ユーザー名">
    <input type="password" placeholder="パスワード">
    <input type="email" placeholder="メールアドレス">
    <textarea placeholder="メッセージ"></textarea>
    <select>
        <option>国を選択</option>
        <option>日本</option>
        <option>アメリカ</option>
    </select>
    <button type="submit">送信</button>
</form>
```

**プレビュー:**
<div style="border: 1px solid #ddd; padding: 15px; margin: 10px 0; background: #f9f9f9;">
<form style="display: flex; flex-direction: column; gap: 10px; max-width: 300px;">
    <input type="text" placeholder="ユーザー名" style="padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
    <input type="password" placeholder="パスワード" style="padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
    <input type="email" placeholder="メールアドレス" style="padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
    <textarea placeholder="メッセージ" rows="3" style="padding: 8px; border: 1px solid #ccc; border-radius: 4px; resize: vertical;"></textarea>
    <select style="padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
        <option>国を選択</option>
        <option>日本</option>
        <option>アメリカ</option>
    </select>
    <button type="button" style="padding: 10px; background: #0066cc; color: white; border: none; border-radius: 4px; cursor: pointer;">送信</button>
</form>
</div>

## フォーム要素

### ラジオボタンとチェックボックス
```html
<!-- ラジオボタン -->
<input type="radio" id="male" name="gender" value="male">
<label for="male">男性</label>
<input type="radio" id="female" name="gender" value="female">
<label for="female">女性</label>

<!-- チェックボックス -->
<input type="checkbox" id="newsletter" name="newsletter">
<label for="newsletter">ニュースレターを購読する</label>
```

**プレビュー:**
<div style="border: 1px solid #ddd; padding: 15px; margin: 10px 0; background: #f9f9f9;">
<div style="margin-bottom: 10px;">
    <input type="radio" id="preview-male-ja" name="preview-gender-ja" value="male">
    <label for="preview-male-ja">男性</label>
    <input type="radio" id="preview-female-ja" name="preview-gender-ja" value="female" style="margin-left: 15px;">
    <label for="preview-female-ja">女性</label>
</div>
<div>
    <input type="checkbox" id="preview-newsletter-ja" name="preview-newsletter-ja">
    <label for="preview-newsletter-ja">ニュースレターを購読する</label>
</div>
</div>

## セマンティックHTML5要素

```html
<header>ヘッダーコンテンツ</header>
<nav>ナビゲーションメニュー</nav>
<main>メインコンテンツエリア</main>
<article>記事コンテンツ</article>
<section>セクションコンテンツ</section>
<aside>サイドバーコンテンツ</aside>
<footer>フッターコンテンツ</footer>
```

**プレビュー:**
<div style="border: 1px solid #ddd; padding: 15px; margin: 10px 0; background: #f9f9f9;">
<div style="border: 1px solid #ccc; margin: 5px 0; padding: 10px; background: #e8f4f8;"><strong>Header:</strong> ヘッダーコンテンツ</div>
<div style="border: 1px solid #ccc; margin: 5px 0; padding: 10px; background: #f0e8f8;"><strong>Nav:</strong> ナビゲーションメニュー</div>
<div style="border: 1px solid #ccc; margin: 5px 0; padding: 10px; background: #e8f8e8;"><strong>Main:</strong> メインコンテンツエリア</div>
<div style="border: 1px solid #ccc; margin: 5px 0; padding: 10px; background: #f8f0e8;"><strong>Article:</strong> 記事コンテンツ</div>
<div style="border: 1px solid #ccc; margin: 5px 0; padding: 10px; background: #f8e8e8;"><strong>Section:</strong> セクションコンテンツ</div>
<div style="border: 1px solid #ccc; margin: 5px 0; padding: 10px; background: #e8e8f8;"><strong>Aside:</strong> サイドバーコンテンツ</div>
<div style="border: 1px solid #ccc; margin: 5px 0; padding: 10px; background: #f8f8e8;"><strong>Footer:</strong> フッターコンテンツ</div>
</div>

## よく使用される属性

- `id="一意の識別子"` - 要素の一意の識別子
- `class="クラス名"` - スタイリング用のCSSクラス
- `style="css-プロパティ"` - インラインCSSスタイリング
- `title="ツールチップテキスト"` - ホバー時のツールチップテキスト
- `data-*="値"` - カスタムデータ属性

## より良いHTMLのためのヒント

1. **セマンティック要素を使用する** - 見た目ではなく意味に基づいてタグを選ぶ
2. **画像には常にalt属性を含める** - アクセシビリティのため
3. **HTMLを検証する** - オンラインバリデーターを使用
4. **適切な入れ子構造** - タグが適切に閉じられていることを確認
5. **シンプルに保つ** - マークアップを複雑にしすぎない

このチートシートは、ライブプレビュー付きで最も重要なHTML要素をカバーしています。視覚的な例により、各要素がブラウザでどのようにレンダリングされるかを理解できます。コーディング中のクイックリファレンスとしてお使いください！