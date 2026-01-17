---
title: "Next.js SuspenseとLoading States: ストリーミングUIパターン"
date: "2025-11-19"
excerpt: "Next.jsでReact Suspenseをマスター - ローディング状態、ストリーミングSSR、use()フック、プログレッシブページレンダリング。"
tags: ["Next.js", "React", "Suspense", "Streaming"]
author: "Shunku"
---

React Suspenseを使用すると、非同期操作の完了を待つ間にフォールバックコンテンツを表示できます。Next.jsでは、これがストリーミングSSRときめ細かなローディング状態を支えています。

## Suspenseを理解する

```mermaid
flowchart TD
    subgraph Traditional["従来のローディング"]
        A[リクエスト開始] --> B[すべてのデータを待機]
        B --> C[ページをレンダリング]
    end

    subgraph Streaming["Suspenseストリーミング"]
        D[リクエスト開始] --> E[シェルをレンダリング]
        E --> F[コンテンツ1をストリーム]
        E --> G[コンテンツ2をストリーム]
        E --> H[コンテンツ3をストリーム]
    end

    style Traditional fill:#f59e0b,color:#fff
    style Streaming fill:#10b981,color:#fff
```

## 基本的なSuspenseの使い方

### 非同期コンポーネントのラップ

```tsx
import { Suspense } from 'react';

async function SlowData() {
  // 遅いAPIコールをシミュレート
  await new Promise((resolve) => setTimeout(resolve, 2000));
  const data = await fetch('https://api.example.com/data');
  return <div>{data}</div>;
}

export default function Page() {
  return (
    <div>
      <h1>ダッシュボード</h1>

      <Suspense fallback={<p>データを読み込み中...</p>}>
        <SlowData />
      </Suspense>
    </div>
  );
}
```

### 複数のSuspense境界

```tsx
import { Suspense } from 'react';

async function UserProfile() {
  const user = await getUser();
  return <div>{user.name}</div>;
}

async function RecentPosts() {
  const posts = await getPosts();
  return <ul>{posts.map((p) => <li key={p.id}>{p.title}</li>)}</ul>;
}

async function Notifications() {
  const notifications = await getNotifications();
  return <span>({notifications.length})</span>;
}

export default function DashboardPage() {
  return (
    <div>
      <h1>ダッシュボード</h1>

      {/* 各セクションが独立して読み込まれる */}
      <Suspense fallback={<UserSkeleton />}>
        <UserProfile />
      </Suspense>

      <Suspense fallback={<PostsSkeleton />}>
        <RecentPosts />
      </Suspense>

      <Suspense fallback={<span>(0)</span>}>
        <Notifications />
      </Suspense>
    </div>
  );
}
```

## ファイルベースのローディングUI

### loading.tsx

Next.jsは`loading.tsx`を使用してページコンテンツを自動的にSuspenseでラップします：

```tsx
// app/dashboard/loading.tsx
export default function Loading() {
  return (
    <div className="loading-container">
      <div className="spinner" />
      <p>ダッシュボードを読み込み中...</p>
    </div>
  );
}
```

```tsx
// app/dashboard/page.tsx
export default async function DashboardPage() {
  const data = await getSlowData();

  return (
    <div>
      <h1>ダッシュボード</h1>
      <p>{data.message}</p>
    </div>
  );
}
```

### スケルトンコンポーネント

```tsx
// app/posts/loading.tsx
export default function Loading() {
  return (
    <div className="posts-skeleton">
      {[1, 2, 3].map((i) => (
        <div key={i} className="post-skeleton">
          <div className="skeleton-title" />
          <div className="skeleton-text" />
          <div className="skeleton-text short" />
        </div>
      ))}
    </div>
  );
}
```

```css
/* styles/skeleton.css */
.skeleton-title,
.skeleton-text {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
}

.skeleton-title {
  height: 24px;
  width: 60%;
  margin-bottom: 12px;
}

.skeleton-text {
  height: 16px;
  width: 100%;
  margin-bottom: 8px;
}

.skeleton-text.short {
  width: 40%;
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
```

## ストリーミングパターン

### プログレッシブレンダリング

```tsx
import { Suspense } from 'react';

// 高速データ - 即座にレンダリング
async function Header() {
  const user = await getUser(); // 高速クエリ
  return <header>ようこそ、{user.name}さん</header>;
}

// 遅いデータ - 後でストリーム
async function Analytics() {
  const data = await getAnalytics(); // 遅いクエリ
  return <div>今日の訪問者: {data.visitors}人</div>;
}

// 非常に遅いデータ - 最後にストリーム
async function Recommendations() {
  const recs = await getRecommendations(); // MLモデル、非常に遅い
  return <ul>{recs.map((r) => <li key={r.id}>{r.title}</li>)}</ul>;
}

export default function Page() {
  return (
    <div>
      {/* 最初にレンダリング */}
      <Suspense fallback={<HeaderSkeleton />}>
        <Header />
      </Suspense>

      {/* 2番目にレンダリング */}
      <Suspense fallback={<AnalyticsSkeleton />}>
        <Analytics />
      </Suspense>

      {/* 最後にレンダリング */}
      <Suspense fallback={<RecommendationsSkeleton />}>
        <Recommendations />
      </Suspense>
    </div>
  );
}
```

### ネストされたSuspense

```tsx
import { Suspense } from 'react';

async function PostList() {
  const posts = await getPosts();

  return (
    <div>
      {posts.map((post) => (
        <article key={post.id}>
          <h2>{post.title}</h2>
          {/* コメント用のネストされたSuspense */}
          <Suspense fallback={<CommentsSkeleton />}>
            <Comments postId={post.id} />
          </Suspense>
        </article>
      ))}
    </div>
  );
}

async function Comments({ postId }: { postId: string }) {
  const comments = await getComments(postId);
  return (
    <ul>
      {comments.map((c) => (
        <li key={c.id}>{c.text}</li>
      ))}
    </ul>
  );
}

export default function BlogPage() {
  return (
    <Suspense fallback={<PostListSkeleton />}>
      <PostList />
    </Suspense>
  );
}
```

## use()フック

React 19の`use()`フックはレンダリング中にリソースを読み取れます：

```tsx
'use client';

import { use } from 'react';

async function fetchUser(id: string) {
  const res = await fetch(`/api/users/${id}`);
  return res.json();
}

function UserProfile({ userPromise }: { userPromise: Promise<User> }) {
  // use()はpromiseが解決されるまでサスペンド
  const user = use(userPromise);

  return (
    <div>
      <h2>{user.name}</h2>
      <p>{user.email}</p>
    </div>
  );
}

export default function Page({ params }: { params: { id: string } }) {
  // コンポーネントの外でpromiseを作成
  const userPromise = fetchUser(params.id);

  return (
    <Suspense fallback={<UserSkeleton />}>
      <UserProfile userPromise={userPromise} />
    </Suspense>
  );
}
```

### use()とContext

```tsx
'use client';

import { use, createContext } from 'react';

const ThemeContext = createContext<string>('light');

function ThemedButton() {
  // use()はcontextも読み取れる
  const theme = use(ThemeContext);

  return (
    <button className={`btn-${theme}`}>
      クリック
    </button>
  );
}
```

## Suspenseでのエラーハンドリング

### エラー境界

```tsx
// app/dashboard/error.tsx
'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="error-container">
      <h2>問題が発生しました！</h2>
      <p>{error.message}</p>
      <button onClick={reset}>もう一度試す</button>
    </div>
  );
}
```

### エラーとローディングの組み合わせ

```
app/
├── dashboard/
│   ├── page.tsx      # メインコンテンツ
│   ├── loading.tsx   # ローディングUI
│   ├── error.tsx     # エラーUI
│   └── not-found.tsx # 404 UI
```

```tsx
// Next.jsがページをラップする方法
<ErrorBoundary fallback={<Error />}>
  <Suspense fallback={<Loading />}>
    <Page />
  </Suspense>
</ErrorBoundary>
```

## ルートグループでのストリーミング

```
app/
├── (with-sidebar)/
│   ├── layout.tsx
│   ├── loading.tsx    # グループの共有ローディング
│   ├── dashboard/
│   │   └── page.tsx
│   └── settings/
│       └── page.tsx
└── (no-sidebar)/
    ├── layout.tsx
    ├── loading.tsx    # このグループの別のローディング
    └── login/
        └── page.tsx
```

## 即時ローディング状態

### 共有レイアウトは再レンダリングしない

```tsx
// app/dashboard/layout.tsx
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      {/* ナビゲーション中も表示されたまま */}
      <nav>ダッシュボードナビゲーション</nav>

      {/* この部分だけがローディング状態を表示 */}
      {children}
    </div>
  );
}
```

### モーダル用のパラレルルート

```tsx
// app/layout.tsx
export default function Layout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <div>
      {children}
      {modal}
    </div>
  );
}

// app/@modal/photo/[id]/page.tsx
export default function PhotoModal({ params }: { params: { id: string } }) {
  return (
    <div className="modal">
      <Suspense fallback={<PhotoSkeleton />}>
        <Photo id={params.id} />
      </Suspense>
    </div>
  );
}
```

## ベストプラクティス

### 1. 戦略的なSuspense配置

```tsx
// ❌ 悪い例: すべてに単一の境界
<Suspense fallback={<Loading />}>
  <Header />
  <Sidebar />
  <Content />
  <Footer />
</Suspense>

// ✅ 良い例: きめ細かな境界
<Header />
<Sidebar />
<Suspense fallback={<ContentSkeleton />}>
  <Content />
</Suspense>
<Footer />
```

### 2. 意味のあるスケルトン

```tsx
// ❌ 悪い例: 汎用スピナー
<Suspense fallback={<Spinner />}>
  <ProductList />
</Suspense>

// ✅ 良い例: レイアウトに一致するスケルトン
<Suspense fallback={<ProductListSkeleton />}>
  <ProductList />
</Suspense>
```

### 3. Suspenseウォーターフォールを避ける

```tsx
// ❌ 悪い例: 順次ローディング
<Suspense fallback={<Loading />}>
  <UserData>
    <Suspense fallback={<Loading />}>
      <Posts>
        <Suspense fallback={<Loading />}>
          <Comments />
        </Suspense>
      </Posts>
    </Suspense>
  </UserData>
</Suspense>

// ✅ 良い例: 並列ローディング
<Suspense fallback={<UserSkeleton />}>
  <UserData />
</Suspense>
<Suspense fallback={<PostsSkeleton />}>
  <Posts />
</Suspense>
<Suspense fallback={<CommentsSkeleton />}>
  <Comments />
</Suspense>
```

## まとめ

| 機能 | 用途 |
|------|------|
| `<Suspense>` | 非同期コンポーネントをフォールバックでラップ |
| `loading.tsx` | ルートレベルのローディングUI |
| `error.tsx` | ルートレベルのエラーハンドリング |
| `use()` | レンダリング中にpromise/contextを読み取る |
| ストリーミング | プログレッシブページレンダリング |
| ネストされたSuspense | きめ細かなローディング状態 |

重要なポイント：

- Suspenseは非同期コンテンツの読み込み中にフォールバックUIを表示
- `loading.tsx`はページコンテンツを自動的にSuspenseでラップ
- 独立したローディングには複数のSuspense境界を使用
- ストリーミングによりページの一部が徐々にレンダリング
- `use()`フックはClient Componentsでpromiseを読み取れる
- 完全なUXのために`error.tsx`と`loading.tsx`を組み合わせる
- 最高のUXのためにレイアウトに一致するスケルトンコンポーネントを作成
- データを並列で読み込むことでSuspenseウォーターフォールを避ける

SuspenseとストリーミングはNext.jsアプリケーションでのローディング体験を変革します。

## 参考文献

- [Next.js Loading UI and Streaming](https://nextjs.org/docs/app/building-your-application/routing/loading-ui-and-streaming)
- [React Suspense](https://react.dev/reference/react/Suspense)
- [React use() Hook](https://react.dev/reference/react/use)
- Schwarzmüller, Maximilian. *React Key Concepts - Second Edition*. Packt, 2025.
