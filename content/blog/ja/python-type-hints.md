---
title: "Python型ヒント完全ガイド: 基礎から実践まで"
date: "2025-11-25"
excerpt: "Pythonの型ヒントをマスター - 基本的な型アノテーションからジェネリクス、Protocol、mypyとの連携まで、静的型付けのメリットを最大限に活用する方法を解説します。"
tags: ["Python", "型ヒント", "mypy", "静的解析"]
author: "Shunku"
---

Pythonは動的型付け言語ですが、Python 3.5以降で導入された型ヒントにより、静的型付けの恩恵を受けられるようになりました。型ヒントはコードの可読性を高め、IDEの補完を強化し、バグを早期に発見できます。

## なぜ型ヒントを使うのか

動的型付けは柔軟ですが、大規模なコードベースでは問題になることがあります：

```python
# 型ヒントなし - 何を渡せばいいかわからない
def process_data(data, options):
    # dataは何型？optionsはdict？何のキーがある？
    pass

# 型ヒントあり - 意図が明確
def process_data(data: list[dict], options: ProcessOptions) -> Result:
    pass
```

型ヒントのメリット：

| メリット | 説明 |
|---------|------|
| **ドキュメント** | 関数のシグネチャが仕様書になる |
| **IDE補完** | 正確な補完候補とエラー検出 |
| **バグ検出** | mypyで実行前にエラーを発見 |
| **リファクタリング** | 型の不整合を即座に検出 |

## 基本的な型アノテーション

### 変数と関数

```python
# 変数アノテーション
name: str = "Python"
count: int = 42
ratio: float = 3.14
is_valid: bool = True

# 関数アノテーション
def greet(name: str) -> str:
    return f"Hello, {name}!"

# 引数のデフォルト値
def connect(host: str, port: int = 8080) -> None:
    pass
```

### コレクション型

Python 3.9以降は組み込み型を直接使用できます：

```python
# リスト
numbers: list[int] = [1, 2, 3]

# 辞書
scores: dict[str, int] = {"alice": 100, "bob": 85}

# セット
unique_ids: set[str] = {"id1", "id2"}

# タプル（固定長）
point: tuple[int, int] = (10, 20)

# タプル（可変長）
values: tuple[int, ...] = (1, 2, 3, 4, 5)
```

Python 3.8以前では`typing`モジュールを使用：

```python
from typing import List, Dict, Set, Tuple

numbers: List[int] = [1, 2, 3]
scores: Dict[str, int] = {"alice": 100}
```

## OptionalとUnion

### None許容型

値が`None`になりうる場合は`Optional`を使用：

```python
from typing import Optional

def find_user(user_id: int) -> Optional[User]:
    """ユーザーが見つからない場合はNoneを返す"""
    user = db.get(user_id)
    return user  # User or None

# Python 3.10以降は | 構文も使用可能
def find_user(user_id: int) -> User | None:
    pass
```

### 複数の型を許容

```python
from typing import Union

# Python 3.9以前
def process(value: Union[int, str]) -> str:
    return str(value)

# Python 3.10以降
def process(value: int | str) -> str:
    return str(value)
```

## ジェネリクス

### TypeVar

型パラメータを定義して、関数やクラスを汎用的にします：

```python
from typing import TypeVar

T = TypeVar('T')

def first(items: list[T]) -> T:
    """リストの最初の要素を返す"""
    return items[0]

# 使用時に型が推論される
num = first([1, 2, 3])      # int
name = first(["a", "b"])    # str
```

### 型の制約

```python
from typing import TypeVar

# 特定の型に制限
Number = TypeVar('Number', int, float)

def add(a: Number, b: Number) -> Number:
    return a + b

# 上限を指定
from typing import TypeVar

Comparable = TypeVar('Comparable', bound='SupportsLessThan')
```

### ジェネリッククラス

```python
from typing import Generic, TypeVar

T = TypeVar('T')

class Stack(Generic[T]):
    def __init__(self) -> None:
        self._items: list[T] = []

    def push(self, item: T) -> None:
        self._items.append(item)

    def pop(self) -> T:
        return self._items.pop()

# 使用
int_stack: Stack[int] = Stack()
int_stack.push(1)
int_stack.push(2)
value: int = int_stack.pop()
```

## Callable

関数を引数として受け取る場合：

```python
from typing import Callable

# 引数なし、戻り値なし
def run_task(task: Callable[[], None]) -> None:
    task()

# 引数あり
def apply(func: Callable[[int, int], int], a: int, b: int) -> int:
    return func(a, b)

# 可変長引数
def decorator(func: Callable[..., T]) -> Callable[..., T]:
    def wrapper(*args, **kwargs) -> T:
        return func(*args, **kwargs)
    return wrapper
```

## TypedDict

辞書のキーと値の型を厳密に定義：

```python
from typing import TypedDict

class UserDict(TypedDict):
    name: str
    age: int
    email: str

def create_user(data: UserDict) -> None:
    print(data["name"])  # strとして認識

# 正しい使用
user: UserDict = {"name": "Alice", "age": 30, "email": "alice@example.com"}

# オプショナルなキー
class ConfigDict(TypedDict, total=False):
    debug: bool
    timeout: int
```

## Protocol（構造的部分型）

ダックタイピングを型安全に：

```python
from typing import Protocol

class Drawable(Protocol):
    def draw(self) -> None: ...

class Circle:
    def draw(self) -> None:
        print("Drawing circle")

class Square:
    def draw(self) -> None:
        print("Drawing square")

def render(shape: Drawable) -> None:
    shape.draw()

# CircleとSquareはDrawableを明示的に継承していないが、
# draw()メソッドを持つため、Drawableとして扱える
render(Circle())  # OK
render(Square())  # OK
```

### ランタイムチェック可能なProtocol

```python
from typing import Protocol, runtime_checkable

@runtime_checkable
class Sized(Protocol):
    def __len__(self) -> int: ...

# isinstance()でチェック可能
def process(obj: object) -> None:
    if isinstance(obj, Sized):
        print(f"Length: {len(obj)}")
```

## 型エイリアス

複雑な型を簡潔に：

```python
from typing import TypeAlias

# シンプルなエイリアス
UserId: TypeAlias = int
Coordinates: TypeAlias = tuple[float, float]

# 複雑な型をシンプルに
JsonValue: TypeAlias = str | int | float | bool | None | list["JsonValue"] | dict[str, "JsonValue"]

def parse_json(text: str) -> JsonValue:
    import json
    return json.loads(text)
```

## Literal

特定の値のみを許容：

```python
from typing import Literal

def set_mode(mode: Literal["read", "write", "append"]) -> None:
    pass

set_mode("read")   # OK
set_mode("delete") # エラー

# 複数の値
Status = Literal["pending", "active", "completed"]
```

## mypyとの連携

### mypyのインストールと実行

```bash
# インストール
pip install mypy

# 単一ファイルをチェック
mypy script.py

# ディレクトリ全体をチェック
mypy src/

# 厳格モード
mypy --strict src/
```

### 設定ファイル（pyproject.toml）

```toml
[tool.mypy]
python_version = "3.12"
strict = true
warn_return_any = true
warn_unused_ignores = true
disallow_untyped_defs = true

# 特定のモジュールを除外
[[tool.mypy.overrides]]
module = "tests.*"
disallow_untyped_defs = false
```

### よくあるmypyエラーと対処法

```python
# エラー: 型が不明
result = []  # error: Need type annotation for 'result'
result: list[int] = []  # OK

# エラー: Noneの可能性
def get_name() -> str | None:
    return None

name = get_name()
print(name.upper())  # error: Item "None" has no attribute "upper"

# 対処: Noneチェック
if name is not None:
    print(name.upper())  # OK

# または assert
assert name is not None
print(name.upper())  # OK
```

### 型を無視する

```python
# 特定の行を無視
result = some_untyped_function()  # type: ignore

# 特定のエラーコードのみ無視
result = func()  # type: ignore[no-untyped-call]

# 理由を記載（推奨）
result = legacy_func()  # type: ignore[no-untyped-call] # TODO: Add types to legacy_func
```

## 実践的なパターン

### ファクトリ関数

```python
from typing import Type, TypeVar

T = TypeVar('T', bound='BaseModel')

def create_model(model_class: Type[T], data: dict) -> T:
    return model_class(**data)

class User:
    def __init__(self, name: str, age: int) -> None:
        self.name = name
        self.age = age

user = create_model(User, {"name": "Alice", "age": 30})
# userはUser型として推論される
```

### デコレータ

```python
from typing import Callable, ParamSpec, TypeVar
from functools import wraps

P = ParamSpec('P')
R = TypeVar('R')

def log_calls(func: Callable[P, R]) -> Callable[P, R]:
    @wraps(func)
    def wrapper(*args: P.args, **kwargs: P.kwargs) -> R:
        print(f"Calling {func.__name__}")
        return func(*args, **kwargs)
    return wrapper

@log_calls
def add(a: int, b: int) -> int:
    return a + b

result = add(1, 2)  # 型情報が保持される
```

### オーバーロード

```python
from typing import overload

@overload
def process(value: int) -> str: ...
@overload
def process(value: str) -> int: ...

def process(value: int | str) -> str | int:
    if isinstance(value, int):
        return str(value)
    return int(value)

# 呼び出し側で正確な型が推論される
x = process(42)    # str
y = process("42")  # int
```

## まとめ

Pythonの型ヒントは、コードの品質と保守性を大幅に向上させます：

```mermaid
flowchart LR
    subgraph Basic["基本"]
        B1["変数・関数アノテーション"]
        B2["Optional/Union"]
        B3["コレクション型"]
    end

    subgraph Advanced["応用"]
        A1["ジェネリクス"]
        A2["Protocol"]
        A3["TypedDict"]
    end

    subgraph Tools["ツール"]
        T1["mypy"]
        T2["IDE補完"]
        T3["リファクタリング"]
    end

    Basic --> Advanced --> Tools

    style Basic fill:#3b82f6,color:#fff
    style Advanced fill:#8b5cf6,color:#fff
    style Tools fill:#22c55e,color:#fff
```

| 機能 | ユースケース |
|------|-------------|
| `Optional[T]` | Noneを返す可能性がある |
| `Union[A, B]` | 複数の型を許容 |
| `TypeVar` | ジェネリックな関数・クラス |
| `Protocol` | ダックタイピングの型安全化 |
| `TypedDict` | 辞書のスキーマ定義 |
| `Literal` | 特定の値のみ許容 |

主要な原則：

- **段階的に導入**: 新しいコードから型ヒントを追加
- **mypyを活用**: CI/CDに組み込んで自動チェック
- **Protocolを活用**: 継承よりも構造的部分型を優先
- **過度に複雑にしない**: 読みやすさとのバランスを取る

型ヒントは「ドキュメント」「検証」「補完」の3つの価値を同時に提供します。最初は基本的なアノテーションから始め、徐々に高度な機能を取り入れていきましょう。

## 参考資料

- [PEP 484 – Type Hints](https://peps.python.org/pep-0484/)
- [mypy documentation](https://mypy.readthedocs.io/)
- [Fluent Python, 2nd Edition - Chapter 8](https://www.oreilly.com/library/view/fluent-python-2nd/9781492056348/)
