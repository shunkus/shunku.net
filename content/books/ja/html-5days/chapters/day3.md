---
title: "Day 3: フォームと入力要素"
order: 3
---

## フォームの基礎

フォームは、ユーザーからデータを収集するための重要な要素です。お問い合わせフォーム、ログイン画面、アンケートなど、様々な場面で使用されます。

## 基本的なフォーム構造

```html
<form action="/submit" method="post">
    <label for="name">名前:</label>
    <input type="text" id="name" name="name" required>
    
    <label for="email">メールアドレス:</label>
    <input type="email" id="email" name="email" required>
    
    <button type="submit">送信</button>
</form>
```

### form要素の属性

- **action**: フォームデータの送信先URL
- **method**: HTTPメソッド（GET または POST）
- **enctype**: データのエンコード方式

## 入力要素の種類

### テキスト入力

```html
<!-- 単一行テキスト -->
<input type="text" name="username" placeholder="ユーザー名">

<!-- パスワード -->
<input type="password" name="password" placeholder="パスワード">

<!-- メールアドレス -->
<input type="email" name="email" placeholder="example@example.com">

<!-- URL -->
<input type="url" name="website" placeholder="https://example.com">

<!-- 電話番号 -->
<input type="tel" name="phone" placeholder="090-1234-5678">

<!-- 検索 -->
<input type="search" name="search" placeholder="検索...">
```

### 数値と日付

```html
<!-- 数値 -->
<input type="number" name="age" min="0" max="120" step="1">

<!-- 範囲 -->
<input type="range" name="volume" min="0" max="100" value="50">

<!-- 日付 -->
<input type="date" name="birthday">

<!-- 時刻 -->
<input type="time" name="appointment">

<!-- 日時 -->
<input type="datetime-local" name="meeting">

<!-- 月 -->
<input type="month" name="expiry">

<!-- 週 -->
<input type="week" name="week">
```

### 選択要素

```html
<!-- チェックボックス -->
<label>
    <input type="checkbox" name="agree" value="yes">
    利用規約に同意する
</label>

<!-- ラジオボタン -->
<fieldset>
    <legend>性別</legend>
    <label>
        <input type="radio" name="gender" value="male">
        男性
    </label>
    <label>
        <input type="radio" name="gender" value="female">
        女性
    </label>
    <label>
        <input type="radio" name="gender" value="other">
        その他
    </label>
</fieldset>

<!-- セレクトボックス -->
<select name="country">
    <option value="">選択してください</option>
    <option value="jp">日本</option>
    <option value="us">アメリカ</option>
    <option value="uk">イギリス</option>
</select>

<!-- 複数選択可能なセレクトボックス -->
<select name="languages" multiple size="4">
    <option value="html">HTML</option>
    <option value="css">CSS</option>
    <option value="js">JavaScript</option>
    <option value="php">PHP</option>
</select>
```

### その他の入力要素

```html
<!-- テキストエリア -->
<textarea name="message" rows="5" cols="40" placeholder="メッセージを入力してください"></textarea>

<!-- ファイル選択 -->
<input type="file" name="upload" accept="image/*">

<!-- 複数ファイル選択 -->
<input type="file" name="uploads" multiple>

<!-- カラーピッカー -->
<input type="color" name="color" value="#ff0000">

<!-- 隠しフィールド -->
<input type="hidden" name="token" value="abc123">
```

## フォームの検証属性

```html
<!-- 必須項目 -->
<input type="text" name="name" required>

<!-- 最小・最大長 -->
<input type="text" name="username" minlength="3" maxlength="20">

<!-- パターン（正規表現） -->
<input type="text" name="zipcode" pattern="[0-9]{3}-[0-9]{4}" 
       placeholder="123-4567">

<!-- 最小・最大値 -->
<input type="number" name="age" min="18" max="100">

<!-- ステップ -->
<input type="number" name="price" step="0.01">

<!-- 読み取り専用 -->
<input type="text" name="readonly" value="変更不可" readonly>

<!-- 無効化 -->
<input type="text" name="disabled" value="無効" disabled>
```

## データリスト

入力候補を提供します。

```html
<label for="browser">ブラウザ:</label>
<input list="browsers" id="browser" name="browser">
<datalist id="browsers">
    <option value="Chrome">
    <option value="Firefox">
    <option value="Safari">
    <option value="Edge">
</datalist>
```

## フィールドセットとレジェンド

関連する入力要素をグループ化します。

```html
<fieldset>
    <legend>配送先情報</legend>
    
    <label for="address">住所:</label>
    <input type="text" id="address" name="address">
    
    <label for="city">市区町村:</label>
    <input type="text" id="city" name="city">
    
    <label for="postal">郵便番号:</label>
    <input type="text" id="postal" name="postal">
</fieldset>
```

## 完全なフォーム例

```html
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>会員登録フォーム</title>
</head>
<body>
    <h1>会員登録</h1>
    
    <form action="/register" method="post">
        <fieldset>
            <legend>基本情報</legend>
            
            <div>
                <label for="username">ユーザー名:</label>
                <input type="text" id="username" name="username" 
                       required minlength="3" maxlength="20">
            </div>
            
            <div>
                <label for="email">メールアドレス:</label>
                <input type="email" id="email" name="email" required>
            </div>
            
            <div>
                <label for="password">パスワード:</label>
                <input type="password" id="password" name="password" 
                       required minlength="8">
            </div>
            
            <div>
                <label for="confirm-password">パスワード（確認）:</label>
                <input type="password" id="confirm-password" 
                       name="confirm-password" required>
            </div>
        </fieldset>
        
        <fieldset>
            <legend>プロフィール</legend>
            
            <div>
                <label for="fullname">氏名:</label>
                <input type="text" id="fullname" name="fullname">
            </div>
            
            <div>
                <label for="birthday">生年月日:</label>
                <input type="date" id="birthday" name="birthday">
            </div>
            
            <div>
                <label>性別:</label>
                <label>
                    <input type="radio" name="gender" value="male">
                    男性
                </label>
                <label>
                    <input type="radio" name="gender" value="female">
                    女性
                </label>
                <label>
                    <input type="radio" name="gender" value="other">
                    その他
                </label>
            </div>
            
            <div>
                <label for="country">国:</label>
                <select id="country" name="country">
                    <option value="">選択してください</option>
                    <option value="jp">日本</option>
                    <option value="us">アメリカ</option>
                    <option value="uk">イギリス</option>
                    <option value="cn">中国</option>
                    <option value="kr">韓国</option>
                </select>
            </div>
        </fieldset>
        
        <fieldset>
            <legend>興味のある分野</legend>
            
            <label>
                <input type="checkbox" name="interests" value="web">
                Web開発
            </label>
            <label>
                <input type="checkbox" name="interests" value="mobile">
                モバイルアプリ
            </label>
            <label>
                <input type="checkbox" name="interests" value="ai">
                AI・機械学習
            </label>
            <label>
                <input type="checkbox" name="interests" value="security">
                セキュリティ
            </label>
        </fieldset>
        
        <fieldset>
            <legend>その他</legend>
            
            <div>
                <label for="bio">自己紹介:</label>
                <textarea id="bio" name="bio" rows="5" cols="50"
                          placeholder="自己紹介を入力してください（任意）"></textarea>
            </div>
            
            <div>
                <label for="avatar">プロフィール画像:</label>
                <input type="file" id="avatar" name="avatar" 
                       accept="image/*">
            </div>
        </fieldset>
        
        <div>
            <label>
                <input type="checkbox" name="terms" required>
                <a href="/terms">利用規約</a>に同意する
            </label>
        </div>
        
        <div>
            <label>
                <input type="checkbox" name="newsletter">
                ニュースレターを受け取る
            </label>
        </div>
        
        <div>
            <button type="submit">登録</button>
            <button type="reset">リセット</button>
        </div>
    </form>
</body>
</html>
```

## アクセシビリティの考慮

1. **label要素の使用**: すべての入力要素にラベルを関連付ける
2. **fieldsetとlegend**: 関連する入力をグループ化
3. **required属性**: 必須フィールドを明示
4. **placeholder**: 入力例を提示（ラベルの代替ではない）
5. **適切なtype属性**: 入力の種類を正しく指定

## まとめ

今日は以下の内容を学習しました：

- フォームの基本構造
- 様々な入力要素の種類と使い方
- フォーム検証の属性
- フィールドセットによるグループ化
- アクセシビリティへの配慮

明日は、テーブル、メディア要素、埋め込みコンテンツについて学習します。

## 課題

1. お問い合わせフォームを作成してください（名前、メール、件名、本文、送信ボタン）
2. アンケートフォームを作成してください（選択式の質問を3つ以上含む）
3. 適切な検証属性を使用して、入力値の妥当性をチェックできるようにしてください