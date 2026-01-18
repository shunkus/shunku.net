---
title: "スレッド vs プロセス vs asyncio: Pythonの並行処理を使い分ける"
date: "2025-12-01"
excerpt: "Pythonの3つの並行処理モデルを徹底比較 - GILの影響、I/Oバウンド vs CPUバウンド、ThreadPoolExecutor、ProcessPoolExecutorの使い分けを解説します。"
tags: ["Python", "並行処理", "スレッド", "マルチプロセス", "asyncio"]
author: "Shunku"
---

Pythonには3つの主要な並行処理モデルがあります：スレッド、プロセス、asyncio。それぞれに適したユースケースがあり、正しく選択することでパフォーマンスを最大化できます。

## 3つのモデルの概要

```mermaid
flowchart TB
    subgraph Threading["スレッド"]
        T1["1つのプロセス内"]
        T2["メモリ共有"]
        T3["GILの制約あり"]
    end

    subgraph Multiprocessing["マルチプロセス"]
        P1["複数のプロセス"]
        P2["メモリ分離"]
        P3["GILの制約なし"]
    end

    subgraph Asyncio["asyncio"]
        A1["1つのスレッド"]
        A2["協調的マルチタスク"]
        A3["イベントループ"]
    end

    style Threading fill:#3b82f6,color:#fff
    style Multiprocessing fill:#22c55e,color:#fff
    style Asyncio fill:#8b5cf6,color:#fff
```

| 特徴 | スレッド | プロセス | asyncio |
|------|---------|---------|---------|
| メモリ空間 | 共有 | 分離 | 共有 |
| GIL | 影響あり | 影響なし | 影響あり |
| 切り替えコスト | 中 | 高 | 低 |
| 適したタスク | I/Oバウンド | CPUバウンド | I/Oバウンド |

## GIL（Global Interpreter Lock）

PythonのGILは、同時に1つのスレッドしかPythonバイトコードを実行できないよう制限します：

```python
import threading
import time

counter = 0

def increment():
    global counter
    for _ in range(1000000):
        counter += 1

# 2つのスレッドで実行
threads = [
    threading.Thread(target=increment),
    threading.Thread(target=increment)
]

start = time.time()
for t in threads:
    t.start()
for t in threads:
    t.join()

print(f"Counter: {counter}")  # 期待: 2000000, 実際: 不定
print(f"Time: {time.time() - start:.2f}s")
```

### GILが解放されるケース

- I/O操作（ファイル、ネットワーク）
- `time.sleep()`
- NumPy等のC拡張ライブラリ

## スレッド（threading）

### 基本的な使用法

```python
import threading
import time

def worker(name: str, duration: float):
    print(f"{name} starting")
    time.sleep(duration)
    print(f"{name} finished")

# スレッドを作成・開始
threads = []
for i in range(3):
    t = threading.Thread(target=worker, args=(f"Thread-{i}", 1))
    threads.append(t)
    t.start()

# すべてのスレッドの完了を待機
for t in threads:
    t.join()

print("All threads completed")
```

### ThreadPoolExecutor

```python
from concurrent.futures import ThreadPoolExecutor, as_completed
import requests

def fetch_url(url: str) -> dict:
    response = requests.get(url, timeout=10)
    return {"url": url, "status": response.status_code}

urls = [
    "https://api.github.com",
    "https://api.twitter.com",
    "https://httpbin.org/get",
]

# スレッドプールで並行実行
with ThreadPoolExecutor(max_workers=3) as executor:
    futures = {executor.submit(fetch_url, url): url for url in urls}

    for future in as_completed(futures):
        url = futures[future]
        try:
            result = future.result()
            print(f"{url}: {result['status']}")
        except Exception as e:
            print(f"{url}: Error - {e}")
```

### スレッドが適したケース

- ブロッキングI/O操作（requests、データベース接続）
- レガシーライブラリとの統合
- 既存の同期コードを並行化

## マルチプロセス（multiprocessing）

### 基本的な使用法

```python
import multiprocessing as mp
import time

def cpu_intensive(n: int) -> int:
    """CPU負荷の高い計算"""
    total = 0
    for i in range(n):
        total += i * i
    return total

if __name__ == "__main__":
    # プロセスを作成
    processes = []
    for i in range(4):
        p = mp.Process(target=cpu_intensive, args=(10_000_000,))
        processes.append(p)
        p.start()

    for p in processes:
        p.join()

    print("All processes completed")
```

### ProcessPoolExecutor

```python
from concurrent.futures import ProcessPoolExecutor
import math

def is_prime(n: int) -> bool:
    if n < 2:
        return False
    for i in range(2, int(math.sqrt(n)) + 1):
        if n % i == 0:
            return False
    return True

def count_primes(start: int, end: int) -> int:
    return sum(1 for n in range(start, end) if is_prime(n))

if __name__ == "__main__":
    ranges = [(1, 250000), (250000, 500000), (500000, 750000), (750000, 1000000)]

    with ProcessPoolExecutor(max_workers=4) as executor:
        results = executor.map(lambda r: count_primes(*r), ranges)
        total = sum(results)

    print(f"Total primes: {total}")
```

### プロセスが適したケース

- CPU負荷の高い計算
- 画像/動画処理
- 数値計算、機械学習
- 真の並列処理が必要な場合

## asyncio

### 基本的な使用法

```python
import asyncio
import aiohttp

async def fetch_url(session: aiohttp.ClientSession, url: str) -> dict:
    async with session.get(url) as response:
        return {"url": url, "status": response.status}

async def main():
    urls = [
        "https://api.github.com",
        "https://httpbin.org/get",
        "https://jsonplaceholder.typicode.com/posts/1",
    ]

    async with aiohttp.ClientSession() as session:
        tasks = [fetch_url(session, url) for url in urls]
        results = await asyncio.gather(*tasks)

        for result in results:
            print(f"{result['url']}: {result['status']}")

asyncio.run(main())
```

### asyncioが適したケース

- 多数のI/O操作を並行実行
- Webスクレイピング
- APIサーバー
- WebSocket通信

## パフォーマンス比較

### I/Oバウンドタスク

```python
import asyncio
import threading
import time
from concurrent.futures import ThreadPoolExecutor

def io_task_sync():
    time.sleep(0.1)
    return "done"

async def io_task_async():
    await asyncio.sleep(0.1)
    return "done"

# 同期（シーケンシャル）
start = time.time()
for _ in range(100):
    io_task_sync()
print(f"Sequential: {time.time() - start:.2f}s")  # ~10秒

# スレッド
start = time.time()
with ThreadPoolExecutor(max_workers=100) as executor:
    list(executor.map(lambda _: io_task_sync(), range(100)))
print(f"Threads: {time.time() - start:.2f}s")  # ~0.1秒

# asyncio
async def run_async():
    tasks = [io_task_async() for _ in range(100)]
    await asyncio.gather(*tasks)

start = time.time()
asyncio.run(run_async())
print(f"asyncio: {time.time() - start:.2f}s")  # ~0.1秒
```

### CPUバウンドタスク

```python
import time
from concurrent.futures import ThreadPoolExecutor, ProcessPoolExecutor

def cpu_task(n: int) -> int:
    return sum(i * i for i in range(n))

N = 10_000_000
WORKERS = 4

# シーケンシャル
start = time.time()
for _ in range(WORKERS):
    cpu_task(N)
print(f"Sequential: {time.time() - start:.2f}s")

# スレッド（GILにより効果なし）
start = time.time()
with ThreadPoolExecutor(max_workers=WORKERS) as executor:
    list(executor.map(lambda _: cpu_task(N), range(WORKERS)))
print(f"Threads: {time.time() - start:.2f}s")  # シーケンシャルとほぼ同じ

# プロセス（真の並列処理）
start = time.time()
with ProcessPoolExecutor(max_workers=WORKERS) as executor:
    list(executor.map(lambda _: cpu_task(N), range(WORKERS)))
print(f"Processes: {time.time() - start:.2f}s")  # 約1/4の時間
```

## 選択フローチャート

```mermaid
flowchart TD
    Start["タスクの種類は？"]
    IO["I/Oバウンド<br/>(ネットワーク、ファイル)"]
    CPU["CPUバウンド<br/>(計算、処理)"]

    IO --> Q1{"asyncio対応の<br/>ライブラリを使える？"}
    Q1 -->|Yes| Asyncio["asyncio"]
    Q1 -->|No| Q2{"多数の同時接続？"}
    Q2 -->|Yes| Thread["ThreadPoolExecutor"]
    Q2 -->|No| Thread

    CPU --> Q3{"並列処理が<br/>必要？"}
    Q3 -->|Yes| Process["ProcessPoolExecutor"]
    Q3 -->|No| Sequential["シーケンシャル"]

    Start --> IO
    Start --> CPU

    style Asyncio fill:#8b5cf6,color:#fff
    style Thread fill:#3b82f6,color:#fff
    style Process fill:#22c55e,color:#fff
    style Sequential fill:#6b7280,color:#fff
```

## ハイブリッドアプローチ

### asyncio + ThreadPoolExecutor

ブロッキング操作をasyncioから呼び出す：

```python
import asyncio
from concurrent.futures import ThreadPoolExecutor
import requests

def blocking_request(url: str) -> str:
    response = requests.get(url)
    return response.text

async def main():
    loop = asyncio.get_event_loop()

    with ThreadPoolExecutor() as executor:
        # ブロッキング操作をスレッドプールで実行
        result = await loop.run_in_executor(
            executor,
            blocking_request,
            "https://api.github.com"
        )
        print(result[:100])

asyncio.run(main())
```

### asyncio + ProcessPoolExecutor

CPU負荷の高い処理をasyncioから呼び出す：

```python
import asyncio
from concurrent.futures import ProcessPoolExecutor

def cpu_intensive(n: int) -> int:
    return sum(i * i for i in range(n))

async def main():
    loop = asyncio.get_event_loop()

    with ProcessPoolExecutor() as executor:
        # CPU処理をプロセスプールで実行
        results = await asyncio.gather(
            loop.run_in_executor(executor, cpu_intensive, 10_000_000),
            loop.run_in_executor(executor, cpu_intensive, 10_000_000),
        )
        print(f"Results: {results}")

asyncio.run(main())
```

## まとめ

| モデル | 最適なユースケース | GIL | オーバーヘッド |
|--------|------------------|-----|--------------|
| スレッド | ブロッキングI/O | 影響あり | 中 |
| プロセス | CPU計算 | 影響なし | 高 |
| asyncio | 多数のI/O | 影響あり | 低 |

主要な原則：

- **I/Oバウンド → asyncioまたはスレッド**
- **CPUバウンド → マルチプロセス**
- **asyncio対応ライブラリがあれば → asyncio**
- **レガシーコード → スレッド**
- **ハイブリッド → run_in_executorで組み合わせ**

適切なモデルを選択することで、Pythonアプリケーションのパフォーマンスを最大化できます。

## 参考資料

- [Fluent Python, 2nd Edition - Chapter 19, 20](https://www.oreilly.com/library/view/fluent-python-2nd/9781492056348/)
- [Python Concurrency with asyncio](https://www.manning.com/books/python-concurrency-with-asyncio)
- [concurrent.futures — Launching parallel tasks](https://docs.python.org/3/library/concurrent.futures.html)
