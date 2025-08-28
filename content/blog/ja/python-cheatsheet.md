---
title: "Python チートシート"
date: "2018-03-22"
updatedDate: "2025-01-15"
excerpt: "堅牢なアプリケーション構築のためのPythonの基礎、データ構造、関数、クラス、モダンパターンの包括的なガイドです。"
tags: ["Python", "プログラミング", "データサイエンス", "Web開発", "スクリプト", "チートシート"]
author: "串上俊"
---

# Python チートシート

堅牢なアプリケーション構築のためのPythonの基礎、データ構造、関数、クラス、モダンパターンの包括的なガイドです。

## 基本構文と変数

```python
# 変数と基本型
name = "Hello World"
age = 25
height = 5.9
is_student = True

# 複数代入
x, y, z = 1, 2, 3
a = b = c = 0

# 文字列フォーマット
greeting = f"こんにちは、{name}さん！あなたは{age}歳です。"
formatted = "名前: {}, 年齢: {}".format(name, age)
old_style = "名前: %s, 年齢: %d" % (name, age)

# 定数（慣例）
PI = 3.14159
MAX_SIZE = 100

# コメント
# 単一行コメント
"""
複数行コメント
またはdocstring
"""

# 基本演算子
addition = 5 + 3        # 8
subtraction = 5 - 3     # 2
multiplication = 5 * 3  # 15
division = 5 / 3        # 1.6666...
floor_division = 5 // 3 # 1
modulus = 5 % 3         # 2
exponent = 5 ** 3       # 125

# 比較演算子
print(5 == 5)   # True
print(5 != 3)   # True
print(5 > 3)    # True
print(5 < 3)    # False
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<strong>基本構文の例:</strong>
<p>Pythonはインデントを使ってコードブロックを定義</p>
<p>変数は型宣言不要</p>
<p>モダンな文字列フォーマットにはf文字列を使用</p>
</div>

## データ構造

```python
# リスト - 順序付き、可変なコレクション
fruits = ["りんご", "バナナ", "チェリー"]
numbers = [1, 2, 3, 4, 5]
mixed = [1, "こんにちは", 3.14, True]

# リスト操作
fruits.append("オレンジ")           # 末尾に追加
fruits.insert(0, "ぶどう")         # インデックス位置に挿入
fruits.remove("バナナ")            # 最初に一致するものを削除
popped = fruits.pop()             # 最後の要素を削除して返す
fruits.sort()                     # その場でソート
length = len(fruits)              # 長さを取得

# リスト内包表記
squares = [x**2 for x in range(10)]
evens = [x for x in range(20) if x % 2 == 0]

# タプル - 順序付き、不変なコレクション
coordinates = (10, 20)
person = ("太郎", 25, "エンジニア")

# タプルアンパック
x, y = coordinates
name, age, job = person

# セット - 重複のない要素の順序なしコレクション
unique_numbers = {1, 2, 3, 4, 5}
fruits_set = {"りんご", "バナナ", "チェリー"}

# セット操作
fruits_set.add("オレンジ")
fruits_set.remove("バナナ")
union_set = {1, 2, 3} | {3, 4, 5}        # {1, 2, 3, 4, 5}
intersection = {1, 2, 3} & {2, 3, 4}     # {2, 3}

# 辞書 - キーと値のペア
person = {
    "name": "太郎",
    "age": 30,
    "city": "東京"
}

# 辞書操作
person["email"] = "taro@example.com"     # 追加/更新
age = person.get("age", 0)               # デフォルト値付きで取得
keys = person.keys()                     # すべてのキーを取得
values = person.values()                 # すべての値を取得
items = person.items()                   # キーと値のペアを取得

# 辞書内包表記
squares_dict = {x: x**2 for x in range(5)}
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<p><strong>データ構造の例:</strong></p>
<p>リスト: 可変、順序付き、重複許可</p>
<p>タプル: 不変、順序付き、重複許可</p>
<p>セット: 可変、順序なし、一意な要素のみ</p>
<p>辞書: 可変、順序付き（Python 3.7+）、キーと値のペア</p>
</div>

## 制御フロー

```python
# 条件文
age = 18

if age >= 18:
    print("大人")
elif age >= 13:
    print("ティーンエイジャー")
else:
    print("子供")

# 三項演算子
status = "大人" if age >= 18 else "未成年"

# forループ
for i in range(5):
    print(f"番号: {i}")

for fruit in ["りんご", "バナナ", "チェリー"]:
    print(f"果物: {fruit}")

for i, fruit in enumerate(["りんご", "バナナ", "チェリー"]):
    print(f"{i}: {fruit}")

# 辞書の反復
person = {"name": "太郎", "age": 30}
for key, value in person.items():
    print(f"{key}: {value}")

# whileループ
count = 0
while count < 5:
    print(f"カウント: {count}")
    count += 1

# ループ制御
for i in range(10):
    if i == 3:
        continue  # この反復をスキップ
    if i == 7:
        break     # ループを終了
    print(i)

# 例外処理
try:
    result = 10 / 0
except ZeroDivisionError:
    print("ゼロで割ることはできません！")
except Exception as e:
    print(f"エラーが発生しました: {e}")
else:
    print("例外は発生しませんでした")
finally:
    print("これは常に実行されます")

# 複数の例外
try:
    value = int(input("数字を入力してください: "))
    result = 10 / value
except (ValueError, ZeroDivisionError) as e:
    print(f"エラー: {e}")
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<p><strong>制御フローの例:</strong></p>
<p>Pythonは中括弧の代わりにインデントを使用</p>
<p>enumerate()はループでインデックスと値を提供</p>
<p>try/except/else/finallyで例外処理</p>
<p>continueでスキップ、breakでループ終了</p>
</div>

## 関数

```python
# 基本関数
def greet(name):
    return f"こんにちは、{name}さん！"

# デフォルトパラメータ付き関数
def greet_with_title(name, title="さん"):
    return f"こんにちは、{title}{name}！"

# 複数パラメータの関数
def calculate_area(length, width):
    return length * width

# *args（可変個数の位置引数）
def sum_all(*numbers):
    return sum(numbers)

# **kwargs（可変個数のキーワード引数）
def print_info(**info):
    for key, value in info.items():
        print(f"{key}: {value}")

# 混在パラメータの関数
def complex_function(required, default="デフォルト", *args, **kwargs):
    print(f"必須: {required}")
    print(f"デフォルト: {default}")
    print(f"Args: {args}")
    print(f"Kwargs: {kwargs}")

# ラムダ関数（無名関数）
square = lambda x: x ** 2
add = lambda x, y: x + y

# 高階関数
numbers = [1, 2, 3, 4, 5]
squared = list(map(lambda x: x**2, numbers))
evens = list(filter(lambda x: x % 2 == 0, numbers))

# デコレータ
def timing_decorator(func):
    def wrapper(*args, **kwargs):
        import time
        start = time.time()
        result = func(*args, **kwargs)
        end = time.time()
        print(f"{func.__name__}の実行時間: {end - start:.4f}秒")
        return result
    return wrapper

@timing_decorator
def slow_function():
    import time
    time.sleep(1)
    return "完了！"

# ジェネレータ関数
def fibonacci(n):
    a, b = 0, 1
    for _ in range(n):
        yield a
        a, b = b, a + b

# 使用法
fib_numbers = list(fibonacci(10))
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<p><strong>関数の例:</strong></p>
<p>*argsは余分な位置引数をタプルに収集</p>
<p>**kwargsは余分なキーワード引数を辞書に収集</p>
<p>デコレータは関数の動作を変更や拡張</p>
<p>ジェネレータはyieldを使って値を遅延生成</p>
</div>

## オブジェクト指向プログラミング

```python
# 基本クラス
class Person:
    # クラス変数（全インスタンスで共有）
    species = "ホモサピエンス"
    
    # コンストラクタ
    def __init__(self, name, age):
        # インスタンス変数
        self.name = name
        self.age = age
    
    # インスタンスメソッド
    def introduce(self):
        return f"こんにちは、私は{self.name}で、{self.age}歳です。"
    
    # 文字列表現
    def __str__(self):
        return f"Person(name='{self.name}', age={self.age})"
    
    def __repr__(self):
        return f"Person('{self.name}', {self.age})"

# 継承
class Student(Person):
    def __init__(self, name, age, student_id):
        super().__init__(name, age)  # 親のコンストラクタを呼び出し
        self.student_id = student_id
    
    def study(self, subject):
        return f"{self.name}さんは{subject}を勉強しています"
    
    # メソッドオーバーライド
    def introduce(self):
        return f"こんにちは、私は{self.name}で、{self.age}歳、学生番号は{self.student_id}です。"

# プロパティデコレータ
class Circle:
    def __init__(self, radius):
        self._radius = radius
    
    @property
    def radius(self):
        return self._radius
    
    @radius.setter
    def radius(self, value):
        if value < 0:
            raise ValueError("半径は負にできません")
        self._radius = value
    
    @property
    def area(self):
        return 3.14159 * self._radius ** 2

# クラスメソッドと静的メソッド
class MathUtils:
    @classmethod
    def create_from_string(cls, data_string):
        # 代替コンストラクタ
        return cls(*data_string.split(","))
    
    @staticmethod
    def add_numbers(a, b):
        # クラスに関連するユーティリティ関数
        return a + b

# 抽象基底クラス
from abc import ABC, abstractmethod

class Animal(ABC):
    @abstractmethod
    def make_sound(self):
        pass
    
    def sleep(self):
        return "寝ています..."

class Dog(Animal):
    def make_sound(self):
        return "ワン！"

# 使用例
person = Person("アリス", 25)
student = Student("ボブ", 20, "S12345")
circle = Circle(5)

print(person.introduce())
print(student.study("Python"))
print(f"円の面積: {circle.area}")
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<p><strong>OOPの例:</strong></p>
<p>__init__はコンストラクタメソッド</p>
<p>super()は親クラスのメソッドを呼び出し</p>
<p>@propertyはゲッター/セッターメソッドを作成</p>
<p>@classmethodと@staticmethodは異なるメソッド型を提供</p>
</div>

## ファイル I/O とエラーハンドリング

```python
# ファイル読み込み
# 方法1: 基本的なファイル読み込み
file = open("example.txt", "r", encoding="utf-8")
content = file.read()
file.close()

# 方法2: with文を使用（推奨）
with open("example.txt", "r", encoding="utf-8") as file:
    content = file.read()
    # withブロックの後、ファイルは自動的に閉じられる

# 行ごとに読み込み
with open("example.txt", "r", encoding="utf-8") as file:
    for line in file:
        print(line.strip())  # strip()で改行文字を削除

# ファイル書き込み
with open("output.txt", "w", encoding="utf-8") as file:
    file.write("こんにちは、世界！")
    file.write("\n2行目")

# ファイル追記
with open("output.txt", "a", encoding="utf-8") as file:
    file.write("\n追加された行")

# CSVファイルの操作
import csv

# CSV書き込み
data = [
    ["名前", "年齢", "都市"],
    ["太郎", 25, "東京"],
    ["花子", 30, "大阪"]
]

with open("people.csv", "w", newline="", encoding="utf-8") as file:
    writer = csv.writer(file)
    writer.writerows(data)

# CSV読み込み
with open("people.csv", "r", encoding="utf-8") as file:
    reader = csv.reader(file)
    for row in reader:
        print(row)

# JSONの操作
import json

# JSON書き込み
data = {
    "name": "太郎",
    "age": 25,
    "hobbies": ["読書", "プログラミング", "ハイキング"]
}

with open("data.json", "w", encoding="utf-8") as file:
    json.dump(data, file, indent=2, ensure_ascii=False)

# JSON読み込み
with open("data.json", "r", encoding="utf-8") as file:
    loaded_data = json.load(file)
    print(loaded_data["name"])

# カスタム例外
class CustomError(Exception):
    def __init__(self, message, error_code):
        super().__init__(message)
        self.error_code = error_code

# カスタム例外の発生
def validate_age(age):
    if age < 0:
        raise CustomError("年齢は負にできません", "INVALID_AGE")
    if age > 150:
        raise CustomError("年齢が非現実的です", "UNREALISTIC_AGE")
    return True

try:
    validate_age(-5)
except CustomError as e:
    print(f"カスタムエラー: {e} (コード: {e.error_code})")
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<p><strong>ファイル I/Oの例:</strong></p>
<p>ファイル操作には常にwith文を使用</p>
<p>CSVとJSONモジュールで構造化データを処理</p>
<p>特定のエラーハンドリングにはカスタム例外を作成</p>
<p>ファイルモード: 'r'（読み込み）、'w'（書き込み）、'a'（追記）</p>
</div>

## よく使うライブラリとモジュール

```python
# 日時操作
from datetime import datetime, timedelta, date

now = datetime.now()
today = date.today()
tomorrow = today + timedelta(days=1)

formatted_date = now.strftime("%Y-%m-%d %H:%M:%S")
parsed_date = datetime.strptime("2023-12-25", "%Y-%m-%d")

# 正規表現
import re

text = "連絡先: john@example.com または 03-1234-5678 まで"

# メールアドレスを検索
email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
emails = re.findall(email_pattern, text)

# 電話番号を置換
phone_pattern = r'\d{2,4}-\d{2,4}-\d{4}'
censored = re.sub(phone_pattern, "XXX-XXXX-XXXX", text)

# 数学演算
import math

print(math.sqrt(16))      # 4.0
print(math.ceil(4.3))     # 5
print(math.floor(4.7))    # 4
print(math.pi)            # 3.141592653589793

# ランダム数
import random

print(random.random())              # 0から1の間のランダムfloat
print(random.randint(1, 10))        # 1から10の間のランダム整数
print(random.choice(['a', 'b', 'c']))  # リストからランダム選択

# リストをシャッフル
items = [1, 2, 3, 4, 5]
random.shuffle(items)

# OS操作
import os

# 現在のディレクトリを取得
current_dir = os.getcwd()

# ディレクトリ内のファイル一覧
files = os.listdir(".")

# ディレクトリ作成
os.makedirs("new_folder", exist_ok=True)

# 環境変数
home_dir = os.environ.get("HOME", "/default/path")

# パス操作
from pathlib import Path

path = Path("folder/subfolder/file.txt")
print(path.parent)      # folder/subfolder
print(path.name)        # file.txt
print(path.suffix)      # .txt
print(path.exists())    # True/False

# collectionsモジュール
from collections import Counter, defaultdict, namedtuple

# Counter - 出現回数をカウント
text = "hello world"
letter_count = Counter(text)
print(letter_count.most_common(3))  # [('l', 3), ('o', 2), ('h', 1)]

# defaultdict - デフォルト値付き辞書
dd = defaultdict(list)
dd["key1"].append("value1")  # キーが存在しなくてもKeyErrorなし

# namedtuple - 軽量オブジェクト型
Point = namedtuple("Point", ["x", "y"])
p = Point(1, 2)
print(f"x: {p.x}, y: {p.y}")
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<p><strong>ライブラリの例:</strong></p>
<p>datetimeで日時操作</p>
<p>reで正規表現</p>
<p>osとpathlibでファイルシステム操作</p>
<p>collectionsで特殊なデータ構造を提供</p>
</div>

このPythonチートシートは、モダンなPython開発における最も重要な概念とパターンをカバーしています。これらのパターンを練習し、組み合わせて強力で保守性の高いアプリケーションを構築しましょう！