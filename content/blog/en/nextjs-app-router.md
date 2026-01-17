---
title: "Next.js App Router: File-Based Routing for Modern React"
date: "2025-11-27"
excerpt: "Learn the fundamentals of Next.js App Router including file-based routing, layouts, dynamic routes, and navigation patterns."
tags: ["Next.js", "React", "Routing", "JavaScript"]
author: "Shunku"
---

Next.js App Router, introduced in Next.js 13, represents a fundamental shift in how we build React applications. It leverages React Server Components and provides an intuitive file-system based routing approach.

## Why App Router?

```mermaid
flowchart TD
    subgraph Pages["Pages Router (Legacy)"]
        A[pages/index.js] --> B[pages/about.js]
        B --> C[pages/blog/[slug].js]
    end

    subgraph App["App Router (Modern)"]
        D[app/page.tsx] --> E[app/about/page.tsx]
        E --> F[app/blog/[slug]/page.tsx]
        G[app/layout.tsx] --> D
        G --> E
        G --> F
    end

    style Pages fill:#f59e0b,color:#fff
    style App fill:#10b981,color:#fff
```

| Feature | Pages Router | App Router |
|---------|-------------|------------|
| Server Components | No | Yes (default) |
| Nested Layouts | Limited | Full support |
| Streaming | No | Yes |
| Data Fetching | getServerSideProps | async components |

## Project Structure

```
app/
├── layout.tsx          # Root layout (required)
├── page.tsx            # Home page (/)
├── loading.tsx         # Loading UI
├── error.tsx           # Error UI
├── not-found.tsx       # 404 page
├── about/
│   └── page.tsx        # About page (/about)
├── blog/
│   ├── page.tsx        # Blog index (/blog)
│   └── [slug]/
│       └── page.tsx    # Blog post (/blog/my-post)
└── (marketing)/        # Route group
    ├── pricing/
    │   └── page.tsx    # /pricing
    └── features/
        └── page.tsx    # /features
```

## File Conventions

### page.tsx - Route UI

Every route needs a `page.tsx` file to be publicly accessible:

```tsx
// app/page.tsx - Home page
export default function HomePage() {
  return (
    <main>
      <h1>Welcome to My Site</h1>
      <p>This is the home page.</p>
    </main>
  );
}
```

```tsx
// app/about/page.tsx - About page
export default function AboutPage() {
  return (
    <main>
      <h1>About Us</h1>
      <p>Learn more about our company.</p>
    </main>
  );
}
```

### layout.tsx - Shared UI

Layouts wrap pages and persist across navigations:

```tsx
// app/layout.tsx - Root layout
import { ReactNode } from 'react';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header>
          <nav>Site Navigation</nav>
        </header>
        <main>{children}</main>
        <footer>© 2025 My Site</footer>
      </body>
    </html>
  );
}
```

```tsx
// app/blog/layout.tsx - Blog-specific layout
import { ReactNode } from 'react';

export default function BlogLayout({ children }: { children: ReactNode }) {
  return (
    <div className="blog-container">
      <aside>Blog Sidebar</aside>
      <article>{children}</article>
    </div>
  );
}
```

### loading.tsx - Loading State

Automatic loading UI while content loads:

```tsx
// app/blog/loading.tsx
export default function Loading() {
  return (
    <div className="loading">
      <div className="spinner" />
      <p>Loading posts...</p>
    </div>
  );
}
```

### error.tsx - Error Boundary

Handle errors gracefully:

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
      <h2>Something went wrong!</h2>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

### not-found.tsx - 404 Page

Custom 404 pages:

```tsx
// app/not-found.tsx
import Link from 'next/link';

export default function NotFound() {
  return (
    <div>
      <h2>Page Not Found</h2>
      <p>Could not find the requested resource.</p>
      <Link href="/">Return Home</Link>
    </div>
  );
}
```

## Dynamic Routes

### Basic Dynamic Routes

```tsx
// app/blog/[slug]/page.tsx
type Props = {
  params: Promise<{ slug: string }>;
};

export default async function BlogPost({ params }: Props) {
  const { slug } = await params;

  return (
    <article>
      <h1>Blog Post: {slug}</h1>
    </article>
  );
}
```

### Catch-All Routes

```tsx
// app/docs/[...slug]/page.tsx - Matches /docs/a, /docs/a/b, /docs/a/b/c
type Props = {
  params: Promise<{ slug: string[] }>;
};

export default async function DocsPage({ params }: Props) {
  const { slug } = await params;
  // slug is ['a', 'b', 'c'] for /docs/a/b/c

  return (
    <div>
      <h1>Documentation</h1>
      <p>Path: {slug.join('/')}</p>
    </div>
  );
}
```

### Optional Catch-All Routes

```tsx
// app/shop/[[...slug]]/page.tsx - Also matches /shop
type Props = {
  params: Promise<{ slug?: string[] }>;
};

export default async function ShopPage({ params }: Props) {
  const { slug } = await params;

  if (!slug) {
    return <h1>All Products</h1>;
  }

  return <h1>Category: {slug.join(' > ')}</h1>;
}
```

## Navigation

### Link Component

```tsx
import Link from 'next/link';

export default function Navigation() {
  return (
    <nav>
      {/* Basic navigation */}
      <Link href="/">Home</Link>
      <Link href="/about">About</Link>

      {/* Dynamic routes */}
      <Link href="/blog/my-first-post">First Post</Link>

      {/* With query params */}
      <Link href="/search?q=react">Search React</Link>

      {/* Replace history instead of push */}
      <Link href="/dashboard" replace>
        Dashboard
      </Link>

      {/* Prefetch disabled */}
      <Link href="/heavy-page" prefetch={false}>
        Heavy Page
      </Link>
    </nav>
  );
}
```

### Active Link Styling

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

### Programmatic Navigation

```tsx
'use client';

import { useRouter } from 'next/navigation';

export default function LoginForm() {
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // ... login logic

    // Navigate after login
    router.push('/dashboard');

    // Or replace (no back navigation)
    router.replace('/dashboard');

    // Go back
    router.back();

    // Refresh current route
    router.refresh();
  };

  return <form onSubmit={handleSubmit}>{/* form fields */}</form>;
}
```

## Route Groups

Route groups organize routes without affecting the URL:

```
app/
├── (marketing)/
│   ├── layout.tsx       # Marketing layout
│   ├── about/page.tsx   # /about
│   └── pricing/page.tsx # /pricing
├── (shop)/
│   ├── layout.tsx       # Shop layout
│   ├── products/page.tsx # /products
│   └── cart/page.tsx    # /cart
└── (auth)/
    ├── layout.tsx       # Auth layout
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
      <header>Marketing Header</header>
      {children}
    </div>
  );
}
```

## Parallel Routes

Render multiple pages simultaneously in the same layout:

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

## Metadata

### Static Metadata

```tsx
// app/about/page.tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn more about our company',
  openGraph: {
    title: 'About Us',
    description: 'Learn more about our company',
  },
};

export default function AboutPage() {
  return <h1>About Us</h1>;
}
```

### Dynamic Metadata

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

## Static Generation

### generateStaticParams

Pre-render dynamic routes at build time:

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

## Summary

| File | Purpose |
|------|---------|
| `page.tsx` | Route UI component |
| `layout.tsx` | Shared layout wrapper |
| `loading.tsx` | Loading state UI |
| `error.tsx` | Error boundary |
| `not-found.tsx` | 404 page |
| `[slug]` | Dynamic route segment |
| `[...slug]` | Catch-all route |
| `(group)` | Route group (no URL impact) |
| `@slot` | Parallel route slot |

Key takeaways:

- App Router uses file-system based routing with special file conventions
- Layouts persist across navigations and can be nested
- Dynamic routes use bracket notation: `[slug]`, `[...slug]`, `[[...slug]]`
- Use `Link` for navigation and `useRouter` for programmatic navigation
- Route groups `(name)` organize code without affecting URLs
- Metadata can be static or dynamically generated
- `generateStaticParams` enables static generation for dynamic routes

The App Router provides a more intuitive and powerful routing system that integrates seamlessly with React Server Components.

## References

- [Next.js App Router Documentation](https://nextjs.org/docs/app)
- [Next.js Routing Fundamentals](https://nextjs.org/docs/app/building-your-application/routing)
- Schwarzmüller, Maximilian. *React Key Concepts - Second Edition*. Packt, 2025.
