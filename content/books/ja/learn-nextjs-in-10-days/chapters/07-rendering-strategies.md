---
title: "Day 7: レンダリング戦略"
order: 7
---

# Day 7: レンダリング戦略

## 今日学ぶこと

- 静的レンダリング（SSG）
- 動的レンダリング（SSR）
- ストリーミングとSuspense
- ISR（Incremental Static Regeneration）
- 適切な戦略の選択方法

---

## レンダリング戦略の概要

Next.jsでは、ページやコンポーネントごとに最適なレンダリング戦略を選択できます。

```mermaid
flowchart TB
    subgraph Static["静的レンダリング (SSG)"]
        S1["ビルド時にHTML生成"]
        S2["CDNでキャッシュ"]
        S3["最速のレスポンス"]
    end

    subgraph Dynamic["動的レンダリング (SSR)"]
        D1["リクエスト時にHTML生成"]
        D2["常に最新のデータ"]
        D3["パーソナライズ可能"]
    end

    subgraph Streaming["ストリーミング"]
        ST1["段階的にHTML送信"]
        ST2["部分的に表示開始"]
        ST3["TTFBを改善"]
    end

    style Static fill:#22c55e,color:#fff
    style Dynamic fill:#3b82f6,color:#fff
    style Streaming fill:#8b5cf6,color:#fff
```

---

## 静的レンダリング（SSG）

**静的レンダリング**は、ビルド時にHTMLを生成します。これがNext.jsのデフォルトの動作です。

### いつ静的レンダリングになるか

- `fetch`のキャッシュがデフォルト（`force-cache`）
- 動的な関数（`cookies()`, `headers()`など）を使用していない
- 動的なルートパラメータを使用していない（または`generateStaticParams`で事前生成）

```tsx
// 静的にレンダリングされる
export default async function BlogPage() {
  const posts = await fetch("https://api.example.com/posts", {
    // キャッシュがデフォルト
  });

  return (
    <ul>
      {posts.map((post) => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  );
}
```

### generateStaticParamsで動的ルートを静的生成

```tsx
// src/app/blog/[slug]/page.tsx

// ビルド時に生成するパスを指定
export async function generateStaticParams() {
  const posts = await getAllPosts();

  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function BlogPost({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);

  return <article>{post.content}</article>;
}
```

```mermaid
sequenceDiagram
    participant Build as ビルド時
    participant CDN as CDN
    participant User as ユーザー

    Build->>Build: generateStaticParams()
    Build->>Build: 各slugでページ生成
    Build->>CDN: HTMLをデプロイ

    User->>CDN: /blog/hello-world
    CDN-->>User: 事前生成されたHTML
    Note over User: 超高速レスポンス
```

### 静的レンダリングの利点

| 利点 | 説明 |
|------|------|
| 高速 | CDNから直接配信 |
| 低コスト | サーバー処理が不要 |
| SEO最適 | 完全なHTMLが即座に利用可能 |
| 信頼性 | サーバーダウンの影響を受けない |

---

## 動的レンダリング（SSR）

**動的レンダリング**は、リクエストごとにHTMLを生成します。

### いつ動的レンダリングになるか

- `fetch`で`cache: "no-store"`を使用
- 動的な関数を使用（`cookies()`, `headers()`, `searchParams`）
- `export const dynamic = "force-dynamic"`を設定

```tsx
// 動的にレンダリングされる
import { cookies } from "next/headers";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");

  const user = await fetch("https://api.example.com/user", {
    headers: { Authorization: `Bearer ${token?.value}` },
    cache: "no-store",
  });

  return <div>Welcome, {user.name}</div>;
}
```

### 動的レンダリングを強制する

```tsx
// src/app/dashboard/page.tsx

// このページは常に動的にレンダリングされる
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  // ...
}
```

### 動的関数

以下の関数を使用すると、自動的に動的レンダリングになります：

| 関数 | 用途 |
|------|------|
| `cookies()` | Cookieの読み取り |
| `headers()` | リクエストヘッダーの読み取り |
| `searchParams` | URLクエリパラメータ |
| `useSearchParams()` | クライアント側でクエリパラメータ |

```tsx
// searchParamsを使用（動的）
type Props = {
  searchParams: Promise<{ q?: string }>;
};

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const results = await search(q);

  return <SearchResults results={results} />;
}
```

---

## ストリーミングとSuspense

**ストリーミング**は、HTMLを段階的に送信し、部分的にページを表示できます。

```mermaid
flowchart LR
    subgraph Traditional["従来のSSR"]
        T1["データ取得完了を待つ"]
        T2["全体をレンダリング"]
        T3["HTMLを送信"]
    end

    subgraph Streaming["ストリーミング"]
        S1["シェルを即座に送信"]
        S2["データ取得完了した部分から送信"]
        S3["段階的に表示"]
    end

    style Traditional fill:#ef4444,color:#fff
    style Streaming fill:#22c55e,color:#fff
```

### loading.tsxでルートレベルのストリーミング

```tsx
// src/app/dashboard/loading.tsx
export default function DashboardLoading() {
  return (
    <div className="animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-1/4 mb-4" />
      <div className="grid grid-cols-3 gap-4">
        <div className="h-32 bg-gray-200 rounded" />
        <div className="h-32 bg-gray-200 rounded" />
        <div className="h-32 bg-gray-200 rounded" />
      </div>
    </div>
  );
}
```

### Suspenseでコンポーネントレベルのストリーミング

```tsx
import { Suspense } from "react";

export default function DashboardPage() {
  return (
    <div>
      <h1>ダッシュボード</h1>

      {/* 高速なデータ */}
      <Suspense fallback={<UserSkeleton />}>
        <UserInfo />
      </Suspense>

      {/* 遅いデータ */}
      <Suspense fallback={<AnalyticsSkeleton />}>
        <Analytics />
      </Suspense>

      {/* 別の遅いデータ */}
      <Suspense fallback={<RecommendationsSkeleton />}>
        <Recommendations />
      </Suspense>
    </div>
  );
}
```

```mermaid
sequenceDiagram
    participant Server as サーバー
    participant Browser as ブラウザ

    Server->>Browser: シェル + スケルトン
    Note over Browser: 即座に表示開始

    Server->>Browser: UserInfo (200ms後)
    Note over Browser: UserInfoが表示される

    Server->>Browser: Analytics (500ms後)
    Note over Browser: Analyticsが表示される

    Server->>Browser: Recommendations (1000ms後)
    Note over Browser: 全て表示完了
```

---

## ISR（Incremental Static Regeneration）

**ISR**は、静的ページを指定した間隔で再生成します。静的の高速さと動的の新鮮さを両立できます。

### 時間ベースのISR

```tsx
// 60秒ごとに再生成
export const revalidate = 60;

export default async function NewsPage() {
  const news = await fetch("https://api.example.com/news");
  return <NewsList news={news} />;
}
```

または、`fetch`ごとに設定：

```tsx
const news = await fetch("https://api.example.com/news", {
  next: { revalidate: 60 },
});
```

### ISRの動作

```mermaid
flowchart TB
    subgraph Request1["リクエスト1（0秒）"]
        R1A["キャッシュにヒット"]
        R1B["古いHTMLを返す"]
    end

    subgraph Background["バックグラウンド"]
        BG["再生成をトリガー"]
        BG2["新しいHTMLを生成"]
    end

    subgraph Request2["リクエスト2（61秒後）"]
        R2A["新しいキャッシュにヒット"]
        R2B["新しいHTMLを返す"]
    end

    Request1 --> Background
    Background --> Request2

    style Request1 fill:#f59e0b,color:#fff
    style Background fill:#8b5cf6,color:#fff
    style Request2 fill:#22c55e,color:#fff
```

### オンデマンドISR

Server Actionやルートハンドラから手動で再検証できます。

```tsx
// src/app/actions.ts
"use server";

import { revalidatePath, revalidateTag } from "next/cache";

export async function publishPost(formData: FormData) {
  // 投稿を公開
  await db.post.create({ ... });

  // パスを再検証
  revalidatePath("/blog");

  // または、タグを再検証
  revalidateTag("posts");
}
```

---

## レンダリング戦略の選択

### 判断フローチャート

```mermaid
flowchart TB
    START["ページを作成"]
    Q1{"データは<br/>ユーザー固有？"}
    Q2{"データは<br/>頻繁に更新？"}
    Q3{"リアルタイム性<br/>が必要？"}

    SSG["静的レンダリング<br/>(SSG)"]
    ISR["ISR<br/>(定期的に再生成)"]
    SSR["動的レンダリング<br/>(SSR)"]

    START --> Q1
    Q1 -->|Yes| SSR
    Q1 -->|No| Q2
    Q2 -->|No| SSG
    Q2 -->|Yes| Q3
    Q3 -->|Yes| SSR
    Q3 -->|No| ISR

    style SSG fill:#22c55e,color:#fff
    style ISR fill:#f59e0b,color:#fff
    style SSR fill:#3b82f6,color:#fff
```

### ユースケース別の推奨

| ページタイプ | 推奨戦略 | 理由 |
|-------------|----------|------|
| ランディングページ | SSG | 変更頻度が低い |
| ブログ記事 | SSG + ISR | 公開後は変更少ない |
| 商品一覧 | ISR | 在庫・価格が変わる |
| 商品詳細 | ISR | 在庫が変わる |
| ダッシュボード | SSR | ユーザー固有 |
| 検索結果 | SSR | クエリごとに異なる |
| SNSフィード | SSR + Streaming | リアルタイム + 高速 |

---

## 実践: ECサイトのレンダリング戦略

```tsx
// src/app/products/page.tsx
// 商品一覧: ISR（5分ごとに再生成）
export const revalidate = 300;

export default async function ProductsPage() {
  const products = await getProducts();
  return <ProductGrid products={products} />;
}
```

```tsx
// src/app/products/[id]/page.tsx
// 商品詳細: 静的生成 + ISR

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((p) => ({ id: p.id }));
}

export const revalidate = 60;

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProduct(id);
  return <ProductDetail product={product} />;
}
```

```tsx
// src/app/cart/page.tsx
// カート: 完全に動的
export const dynamic = "force-dynamic";

import { cookies } from "next/headers";

export default async function CartPage() {
  const cookieStore = await cookies();
  const cartId = cookieStore.get("cartId");
  const cart = await getCart(cartId?.value);

  return <Cart items={cart.items} />;
}
```

---

## まとめ

| 戦略 | タイミング | ユースケース |
|------|------------|--------------|
| SSG | ビルド時 | 静的コンテンツ |
| ISR | 定期的/オンデマンド | 半静的コンテンツ |
| SSR | リクエスト時 | 動的コンテンツ |
| Streaming | 段階的 | 重いページの体感速度改善 |

### 重要ポイント

1. **デフォルトは静的**: 明示的に動的にしない限りSSG
2. **ISRで両立**: 静的の速さと動的の新鮮さ
3. **Suspenseで体感速度向上**: 部分的に表示を開始
4. **適材適所**: ページごとに最適な戦略を選択

---

## 練習問題

### 問題1: 基本
ブログ一覧ページを静的に生成し、新しい記事が投稿されたら再検証するように設定してください。

### 問題2: 応用
ダッシュボードページを作成し、ユーザー情報（高速）、統計データ（中速）、レコメンド（低速）を別々のSuspenseで囲んでストリーミングしてください。

### チャレンジ問題
ECサイトを想定し、以下のページに最適なレンダリング戦略を実装してください：
- トップページ（静的）
- カテゴリページ（ISR）
- 商品詳細ページ（ISR + 在庫はストリーミング）
- カートページ（動的）

---

## 参考リンク

- [Static and Dynamic Rendering](https://nextjs.org/docs/app/building-your-application/rendering/server-components#static-rendering-default)
- [Streaming](https://nextjs.org/docs/app/building-your-application/routing/loading-ui-and-streaming)
- [generateStaticParams](https://nextjs.org/docs/app/api-reference/functions/generate-static-params)
- [Revalidating](https://nextjs.org/docs/app/building-your-application/data-fetching/revalidating)

---

**次回予告**: Day 8では「スタイリングとUI」について学びます。CSS Modules、Tailwind CSS、ダークモード対応について探求します。
