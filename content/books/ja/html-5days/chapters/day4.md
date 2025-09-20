---
title: "Day 4: テーブルとメディア要素"
order: 4
---

## テーブルの基礎

テーブルは、データを行と列で整理して表示するための要素です。統計データ、スケジュール、価格表など、構造化されたデータの表示に適しています。

## 基本的なテーブル構造

```html
<table>
    <caption>商品価格表</caption>
    <thead>
        <tr>
            <th>商品名</th>
            <th>価格</th>
            <th>在庫</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>ノートパソコン</td>
            <td>¥98,000</td>
            <td>15</td>
        </tr>
        <tr>
            <td>マウス</td>
            <td>¥3,500</td>
            <td>50</td>
        </tr>
        <tr>
            <td>キーボード</td>
            <td>¥8,900</td>
            <td>23</td>
        </tr>
    </tbody>
    <tfoot>
        <tr>
            <th>合計</th>
            <td>¥110,400</td>
            <td>88</td>
        </tr>
    </tfoot>
</table>
```

### テーブル要素の説明

- **table**: テーブル全体を定義
- **caption**: テーブルのタイトル
- **thead**: テーブルヘッダー部分
- **tbody**: テーブルボディ部分
- **tfoot**: テーブルフッター部分
- **tr**: テーブルの行
- **th**: ヘッダーセル
- **td**: データセル

## セルの結合

### 横方向の結合（colspan）

```html
<table>
    <tr>
        <th colspan="3">売上レポート</th>
    </tr>
    <tr>
        <th>月</th>
        <th>売上</th>
        <th>前年比</th>
    </tr>
    <tr>
        <td>1月</td>
        <td>¥1,000,000</td>
        <td>+15%</td>
    </tr>
</table>
```

### 縦方向の結合（rowspan）

```html
<table>
    <tr>
        <th rowspan="2">カテゴリー</th>
        <th colspan="2">2024年</th>
    </tr>
    <tr>
        <th>上半期</th>
        <th>下半期</th>
    </tr>
    <tr>
        <td>家電</td>
        <td>¥5,000,000</td>
        <td>¥6,000,000</td>
    </tr>
</table>
```

## アクセシブルなテーブル

```html
<table>
    <caption>
        <strong>2024年第1四半期 売上データ</strong>
        <details>
            <summary>テーブルの説明</summary>
            <p>このテーブルは各部門の四半期売上を示しています。</p>
        </details>
    </caption>
    <thead>
        <tr>
            <th scope="col">部門</th>
            <th scope="col">1月</th>
            <th scope="col">2月</th>
            <th scope="col">3月</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <th scope="row">営業部</th>
            <td>¥2,000,000</td>
            <td>¥2,500,000</td>
            <td>¥3,000,000</td>
        </tr>
        <tr>
            <th scope="row">開発部</th>
            <td>¥1,500,000</td>
            <td>¥1,800,000</td>
            <td>¥2,000,000</td>
        </tr>
    </tbody>
</table>
```

## 画像要素

### 基本的な画像の埋め込み

```html
<!-- 基本的な画像 -->
<img src="photo.jpg" alt="風景写真">

<!-- サイズ指定 -->
<img src="logo.png" alt="会社ロゴ" width="200" height="100">

<!-- レスポンシブ画像 -->
<img src="image.jpg" alt="説明" style="max-width: 100%; height: auto;">
```

### picture要素によるレスポンシブ画像

```html
<picture>
    <source media="(min-width: 800px)" srcset="large.jpg">
    <source media="(min-width: 400px)" srcset="medium.jpg">
    <img src="small.jpg" alt="レスポンシブ画像">
</picture>
```

### srcset属性による解像度対応

```html
<img src="image.jpg" 
     srcset="image@2x.jpg 2x, image@3x.jpg 3x"
     alt="高解像度対応画像">
```

## 動画要素

```html
<!-- 基本的な動画 -->
<video controls>
    <source src="movie.mp4" type="video/mp4">
    <source src="movie.webm" type="video/webm">
    <p>お使いのブラウザは動画タグをサポートしていません。</p>
</video>

<!-- 属性付き動画 -->
<video controls autoplay muted loop poster="thumbnail.jpg" width="640" height="360">
    <source src="video.mp4" type="video/mp4">
    <track kind="subtitles" src="subtitles_ja.vtt" srclang="ja" label="日本語">
    <track kind="subtitles" src="subtitles_en.vtt" srclang="en" label="English">
</video>
```

### video要素の属性

- **controls**: 再生コントロールを表示
- **autoplay**: 自動再生
- **muted**: ミュート状態で開始
- **loop**: ループ再生
- **poster**: サムネイル画像
- **preload**: 事前読み込み設定

## 音声要素

```html
<!-- 基本的な音声 -->
<audio controls>
    <source src="audio.mp3" type="audio/mpeg">
    <source src="audio.ogg" type="audio/ogg">
    <p>お使いのブラウザは音声タグをサポートしていません。</p>
</audio>

<!-- 属性付き音声 -->
<audio controls autoplay loop muted>
    <source src="bgm.mp3" type="audio/mpeg">
</audio>
```

## 埋め込みコンテンツ

### iframe要素

```html
<!-- 外部ページの埋め込み -->
<iframe src="https://example.com" 
        width="600" 
        height="400"
        title="外部サイト">
</iframe>

<!-- YouTube動画の埋め込み -->
<iframe width="560" 
        height="315" 
        src="https://www.youtube.com/embed/VIDEO_ID"
        title="YouTube video player"
        frameborder="0"
        allowfullscreen>
</iframe>

<!-- Googleマップの埋め込み -->
<iframe src="https://maps.google.com/maps?..." 
        width="600" 
        height="450" 
        style="border:0;" 
        allowfullscreen="" 
        loading="lazy">
</iframe>
```

### embed要素

```html
<!-- PDFの埋め込み -->
<embed src="document.pdf" type="application/pdf" width="500" height="700">
```

### object要素

```html
<!-- フォールバック付き埋め込み -->
<object data="document.pdf" type="application/pdf" width="500" height="700">
    <p>PDFを表示できません。<a href="document.pdf">ダウンロード</a></p>
</object>
```

## SVG画像

```html
<!-- インラインSVG -->
<svg width="100" height="100">
    <circle cx="50" cy="50" r="40" stroke="green" stroke-width="4" fill="yellow" />
</svg>

<!-- 外部SVGファイル -->
<img src="icon.svg" alt="アイコン">

<!-- object要素でSVG -->
<object data="diagram.svg" type="image/svg+xml">
    <img src="fallback.png" alt="代替画像">
</object>
```

## Canvas要素

```html
<canvas id="myCanvas" width="300" height="200">
    お使いのブラウザはCanvasをサポートしていません。
</canvas>

<script>
    const canvas = document.getElementById('myCanvas');
    const ctx = canvas.getContext('2d');
    
    // 四角形を描画
    ctx.fillStyle = 'red';
    ctx.fillRect(10, 10, 100, 50);
    
    // 円を描画
    ctx.beginPath();
    ctx.arc(150, 50, 30, 0, 2 * Math.PI);
    ctx.fillStyle = 'blue';
    ctx.fill();
</script>
```

## 完全な例：メディアギャラリーページ

```html
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>メディアギャラリー</title>
</head>
<body>
    <header>
        <h1>メディアギャラリー</h1>
    </header>
    
    <main>
        <section>
            <h2>写真ギャラリー</h2>
            <figure>
                <picture>
                    <source media="(min-width: 800px)" srcset="large-photo.jpg">
                    <source media="(min-width: 400px)" srcset="medium-photo.jpg">
                    <img src="small-photo.jpg" alt="美しい風景">
                </picture>
                <figcaption>日本の美しい風景</figcaption>
            </figure>
        </section>
        
        <section>
            <h2>動画コンテンツ</h2>
            <video controls poster="video-thumb.jpg" width="640" height="360">
                <source src="sample.mp4" type="video/mp4">
                <source src="sample.webm" type="video/webm">
                <track kind="captions" src="captions.vtt" srclang="ja" label="日本語字幕">
                動画を再生するにはHTML5対応ブラウザが必要です。
            </video>
        </section>
        
        <section>
            <h2>音声コンテンツ</h2>
            <audio controls>
                <source src="podcast.mp3" type="audio/mpeg">
                <source src="podcast.ogg" type="audio/ogg">
                音声を再生するにはHTML5対応ブラウザが必要です。
            </audio>
        </section>
        
        <section>
            <h2>データテーブル</h2>
            <table>
                <caption>メディアファイル一覧</caption>
                <thead>
                    <tr>
                        <th scope="col">ファイル名</th>
                        <th scope="col">種類</th>
                        <th scope="col">サイズ</th>
                        <th scope="col">更新日</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>sunset.jpg</td>
                        <td>画像</td>
                        <td>2.5 MB</td>
                        <td>2024-03-15</td>
                    </tr>
                    <tr>
                        <td>intro.mp4</td>
                        <td>動画</td>
                        <td>15.3 MB</td>
                        <td>2024-03-14</td>
                    </tr>
                    <tr>
                        <td>bgm.mp3</td>
                        <td>音声</td>
                        <td>3.2 MB</td>
                        <td>2024-03-13</td>
                    </tr>
                </tbody>
            </table>
        </section>
    </main>
    
    <footer>
        <p>&copy; 2024 メディアギャラリー</p>
    </footer>
</body>
</html>
```

## まとめ

今日は以下の内容を学習しました：

- テーブルの構造と作成方法
- セルの結合とアクセシビリティ
- 画像、動画、音声要素の使い方
- 埋め込みコンテンツの実装
- Canvas要素とSVGの基礎

明日は、メタ情報、リンク、最適化技術について学習します。

## 課題

1. 時間割表をテーブルで作成してください（曜日と時間帯を使用）
2. 画像ギャラリーページを作成してください（figure要素とfigcaption使用）
3. 動画プレーヤーを含むページを作成してください（コントロール付き）