---
title: "Next.js App Router: モダンReactのためのファイルベースルーティング"
date: "2025-11-27"
excerpt: "Next.js App Routerの基礎を学びましょう - ファイルベースルーティング、レイアウト、動的ルート、ナビゲーションパターン。"
tags: ["Next.js", "React", "Routing", "JavaScript"]
author: "Shunku"
---

Next.js 13で導入されたApp Routerは、Reactアプリケーションの構築方法における根本的な転換を表しています。React Server Componentsを活用し、直感的なファイルシステムベースのルーティングアプローチを提供します。

## なぜApp Routerか？

```mermaid
flowchart TD
    subgraph Pages["Pages Router（レガシー）"]
        A[pages/index.js] --> B[pages/about.js]
        B --> C[pages/blog/[slug].js]
    end

    subgraph App["App Router（モダン）"]
        D[app/page.tsx] --> E[app/about/page.tsx]
        E --> F[app/blog/[slug]/page.tsx]
        G[app/layout.tsx] --> D
        G --> E
        G --> F
    end

    style Pages fill:#f59e0b,color:#fff
    style App fill:#10b981,color:#fff
```

| 機能 | Pages Router | App Router |
|------|-------------|------------|
| Server Components | なし | はい（デフォルト） |
| ネストレイアウト | 限定的 | 完全サポート |
| ストリーミング | なし | はい |
| データフェッチ | getServerSideProps | 非同期コンポーネント |

## プロジェクト構造

```
app/
├── layout.tsx          # ルートレイアウト（必須）
├── page.tsx            # ホームページ（/）
├── loading.tsx         # ローディングUI
├── error.tsx           # エラーUI
├── not-found.tsx       # 404ページ
├── about/
│   └── page.tsx        # Aboutページ（/about）
├── blog/
│   ├── page.tsx        # ブログ一覧（/blog）
│   └── [slug]/
│       └── page.tsx    # ブログ記事（/blog/my-post）
└── (marketing)/        # ルートグループ
    ├── pricing/
    │   └── page.tsx    # /pricing
    └── features/
        └── page.tsx    # /features
```

## ファイル規約

### page.tsx - ルートUI

すべてのルートには公開アクセス可能にするために`page.tsx`ファイルが必要です：

```tsx
// app/page.tsx - ホームページ
export default function HomePage() {
  return (
    <main>
      <h1>サイトへようこそ</h1>
      <p>これはホームページです。</p>
    </main>
  );
}
```

```tsx
// app/about/page.tsx - Aboutページ
export default function AboutPage() {
  return (
    <main>
      <h1>会社概要</h1>
      <p>私たちの会社についてもっと知る。</p>
    </main>
  );
}
```

### layout.tsx - 共有UI

レイアウトはページをラップし、ナビゲーション間で永続化されます：

```tsx
// app/layout.tsx - ルートレイアウト
import { ReactNode } from 'react';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ja">
      <body>
        <header>
          <nav>サイトナビゲーション</nav>
        </header>
        <main>{children}</main>
        <footer>© 2025 My Site</footer>
      </body>
    </html>
  );
}
```

```tsx
// app/blog/layout.tsx - ブログ専用レイアウト
import { ReactNode } from 'react';

export default function BlogLayout({ children }: { children: ReactNode }) {
  return (
    <div className="blog-container">
      <aside>ブログサイドバー</aside>
      <article>{children}</article>
    </div>
  );
}
```

### loading.tsx - ローディング状態

コンテンツ読み込み中の自動ローディングUI：

```tsx
// app/blog/loading.tsx
export default function Loading() {
  return (
    <div className="loading">
      <div className="spinner" />
      <p>記事を読み込み中...</p>
    </div>
  );
}
```

### error.tsx - エラー境界

エラーを適切に処理：

```tsx
// app/blog/error.tsx
'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="error">
      <h2>問題が発生しました！</h2>
      <button onClick={reset}>もう一度試す</button>
    </div>
  );
}
```

### not-found.tsx - 404ページ

カスタム404ページ：

```tsx
// app/not-found.tsx
import Link from 'next/link';

export default function NotFound() {
  return (
    <div>
      <h2>ページが見つかりません</h2>
      <p>リクエストされたリソースが見つかりませんでした。</p>
      <Link href="/">ホームに戻る</Link>
    </div>
  );
}
```

## 動的ルート

### 基本的な動的ルート

```tsx
// app/blog/[slug]/page.tsx
type Props = {
  params: Promise<{ slug: string }>;
};

export default async function BlogPost({ params }: Props) {
  const { slug } = await params;

  return (
    <article>
      <h1>ブログ記事: {slug}</h1>
    </article>
  );
}
```

### キャッチオールルート

```tsx
// app/docs/[...slug]/page.tsx - /docs/a, /docs/a/b, /docs/a/b/c にマッチ
type Props = {
  params: Promise<{ slug: string[] }>;
};

export default async function DocsPage({ params }: Props) {
  const { slug } = await params;
  // /docs/a/b/c の場合、slugは ['a', 'b', 'c']

  return (
    <div>
      <h1>ドキュメント</h1>
      <p>パス: {slug.join('/')}</p>
    </div>
  );
}
```

### オプショナルキャッチオールルート

```tsx
// app/shop/[[...slug]]/page.tsx - /shop にもマッチ
type Props = {
  params: Promise<{ slug?: string[] }>;
};

export default async function ShopPage({ params }: Props) {
  const { slug } = await params;

  if (!slug) {
    return <h1>全商品</h1>;
  }

  return <h1>カテゴリ: {slug.join(' > ')}</h1>;
}
```

## ナビゲーション

### Linkコンポーネント

```tsx
import Link from 'next/link';

export default function Navigation() {
  return (
    <nav>
      {/* 基本的なナビゲーション */}
      <Link href="/">ホーム</Link>
      <Link href="/about">会社概要</Link>

      {/* 動的ルート */}
      <Link href="/blog/my-first-post">最初の投稿</Link>

      {/* クエリパラメータ付き */}
      <Link href="/search?q=react">Reactを検索</Link>

      {/* プッシュの代わりに履歴を置換 */}
      <Link href="/dashboard" replace>
        ダッシュボード
      </Link>

      {/* プリフェッチ無効化 */}
      <Link href="/heavy-page" prefetch={false}>
        重いページ
      </Link>
    </nav>
  );
}
```

### アクティブリンクのスタイリング

```tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={isActive ? 'nav-link active' : 'nav-link'}
    >
      {children}
    </Link>
  );
}
```

### プログラムによるナビゲーション

```tsx
'use client';

import { useRouter } from 'next/navigation';

export default function LoginForm() {
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // ... ログインロジック

    // ログイン後にナビゲート
    router.push('/dashboard');

    // または置換（戻るナビゲーションなし）
    router.replace('/dashboard');

    // 戻る
    router.back();

    // 現在のルートをリフレッシュ
    router.refresh();
  };

  return <form onSubmit={handleSubmit}>{/* フォームフィールド */}</form>;
}
```

## ルートグループ

ルートグループはURLに影響を与えずにルートを整理します：

```
app/
├── (marketing)/
│   ├── layout.tsx       # マーケティングレイアウト
│   ├── about/page.tsx   # /about
│   └── pricing/page.tsx # /pricing
├── (shop)/
│   ├── layout.tsx       # ショップレイアウト
│   ├── products/page.tsx # /products
│   └── cart/page.tsx    # /cart
└── (auth)/
    ├── layout.tsx       # 認証レイアウト
    ├── login/page.tsx   # /login
    └── signup/page.tsx  # /signup
```

```tsx
// app/(marketing)/layout.tsx
export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="marketing-layout">
      <header>マーケティングヘッダー</header>
      {children}
    </div>
  );
}
```

## パラレルルート

同じレイアウトで複数のページを同時にレンダリング：

```
app/
├── layout.tsx
├── page.tsx
├── @team/
│   └── page.tsx
└── @analytics/
    └── page.tsx
```

```tsx
// app/layout.tsx
export default function Layout({
  children,
  team,
  analytics,
}: {
  children: React.ReactNode;
  team: React.ReactNode;
  analytics: React.ReactNode;
}) {
  return (
    <div>
      {children}
      <div className="dashboard-panels">
        {team}
        {analytics}
      </div>
    </div>
  );
}
```

## メタデータ

### 静的メタデータ

```tsx
// app/about/page.tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '会社概要',
  description: '私たちの会社についてもっと知る',
  openGraph: {
    title: '会社概要',
    description: '私たちの会社についてもっと知る',
  },
};

export default function AboutPage() {
  return <h1>会社概要</h1>;
}
```

### 動的メタデータ

```tsx
// app/blog/[slug]/page.tsx
import { Metadata } from 'next';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);

  return {
    title: post.title,
    description: post.excerpt,
  };
}

export default async function BlogPost({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);

  return <article>{post.content}</article>;
}
```

## 静的生成

### generateStaticParams

ビルド時に動的ルートを事前レンダリング：

```tsx
// app/blog/[slug]/page.tsx
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

## まとめ

| ファイル | 用途 |
|----------|------|
| `page.tsx` | ルートUIコンポーネント |
| `layout.tsx` | 共有レイアウトラッパー |
| `loading.tsx` | ローディング状態UI |
| `error.tsx` | エラー境界 |
| `not-found.tsx` | 404ページ |
| `[slug]` | 動的ルートセグメント |
| `[...slug]` | キャッチオールルート |
| `(group)` | ルートグループ（URL影響なし） |
| `@slot` | パラレルルートスロット |

重要なポイント：

- App Routerは特殊なファイル規約を持つファイルシステムベースのルーティングを使用
- レイアウトはナビゲーション間で永続化され、ネストできる
- 動的ルートはブラケット記法を使用：`[slug]`、`[...slug]`、`[[...slug]]`
- ナビゲーションには`Link`を、プログラムによるナビゲーションには`useRouter`を使用
- ルートグループ`(name)`はURLに影響を与えずにコードを整理
- メタデータは静的または動的に生成可能
- `generateStaticParams`は動的ルートの静的生成を有効化

App RouterはReact Server Componentsとシームレスに統合する、より直感的で強力なルーティングシステムを提供します。

## 参考文献

- [Next.js App Router Documentation](https://nextjs.org/docs/app)
- [Next.js Routing Fundamentals](https://nextjs.org/docs/app/building-your-application/routing)
- Schwarzmüller, Maximilian. *React Key Concepts - Second Edition*. Packt, 2025.
