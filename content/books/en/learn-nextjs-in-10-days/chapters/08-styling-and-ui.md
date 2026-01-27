---
title: "Day 8: Styling and UI"
order: 8
---

# Day 8: Styling and UI

## What You'll Learn Today

- CSS Modules
- Tailwind CSS integration
- Global styles
- Component library integration
- Dark mode support

---

## Styling Options in Next.js

Next.js supports multiple styling methods.

```mermaid
flowchart TB
    subgraph Built-in["Built-in"]
        CSS["CSS Modules"]
        GLOBAL["Global CSS"]
    end

    subgraph Framework["Framework"]
        TW["Tailwind CSS"]
        SC["styled-components"]
        EMOTION["Emotion"]
    end

    subgraph Library["UI Library"]
        SHADCN["shadcn/ui"]
        MUI["Material UI"]
        CHAKRA["Chakra UI"]
    end

    style Built-in fill:#3b82f6,color:#fff
    style Framework fill:#22c55e,color:#fff
    style Library fill:#8b5cf6,color:#fff
```

---

## CSS Modules

**CSS Modules** scope CSS to components, preventing class name collisions.

### Basic Usage

```css
/* src/components/Button.module.css */
.button {
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 600;
  transition: all 0.2s;
}

.primary {
  background-color: #3b82f6;
  color: white;
}

.primary:hover {
  background-color: #2563eb;
}

.secondary {
  background-color: #e5e7eb;
  color: #1f2937;
}

.secondary:hover {
  background-color: #d1d5db;
}
```

```tsx
// src/components/Button.tsx
import styles from "./Button.module.css";

type ButtonProps = {
  variant?: "primary" | "secondary";
  children: React.ReactNode;
  onClick?: () => void;
};

export function Button({
  variant = "primary",
  children,
  onClick,
}: ButtonProps) {
  return (
    <button
      className={`${styles.button} ${styles[variant]}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
```

### Combining Class Names

```tsx
// Example using clsx
import clsx from "clsx";
import styles from "./Card.module.css";

type CardProps = {
  highlighted?: boolean;
  className?: string;
};

export function Card({ highlighted, className }: CardProps) {
  return (
    <div
      className={clsx(
        styles.card,
        highlighted && styles.highlighted,
        className
      )}
    >
      {/* ... */}
    </div>
  );
}
```

---

## Tailwind CSS

Next.js provides excellent integration with Tailwind CSS. Select it during `create-next-app`.

### Setup

```bash
npx create-next-app@latest my-app
# "Would you like to use Tailwind CSS?" → Yes
```

Adding to existing project:

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### Configuration File

```ts
// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#eff6ff",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
        },
      },
    },
  },
  plugins: [],
};

export default config;
```

### Adding Tailwind to Global CSS

```css
/* src/app/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Custom base styles */
@layer base {
  body {
    @apply bg-white text-gray-900;
  }
}

/* Custom components */
@layer components {
  .btn {
    @apply px-4 py-2 rounded-md font-semibold transition-colors;
  }

  .btn-primary {
    @apply bg-primary-500 text-white hover:bg-primary-600;
  }
}
```

### Creating Components with Tailwind

```tsx
// src/components/Card.tsx
type CardProps = {
  title: string;
  description: string;
  image?: string;
};

export function Card({ title, description, image }: CardProps) {
  return (
    <div className="rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {image && (
        <img
          src={image}
          alt={title}
          className="w-full h-48 object-cover"
        />
      )}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {title}
        </h3>
        <p className="text-gray-600 text-sm">
          {description}
        </p>
      </div>
    </div>
  );
}
```

---

## Global Styles

Set styles that apply across the entire application.

### Import in Root Layout

```tsx
// src/app/layout.tsx
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

### Using CSS Variables

```css
/* src/app/globals.css */
:root {
  --background: #ffffff;
  --foreground: #171717;
  --primary: #3b82f6;
  --primary-hover: #2563eb;
}

@media (prefers-color-scheme: dark) {
  :root {
    --background: #0a0a0a;
    --foreground: #ededed;
  }
}

body {
  background-color: var(--background);
  color: var(--foreground);
}
```

---

## Dark Mode Support

### Dark Mode with Tailwind CSS

```ts
// tailwind.config.ts
const config: Config = {
  darkMode: "class", // or "media"
  // ...
};
```

### Theme Toggle Component

```tsx
// src/components/ThemeToggle.tsx
"use client";

import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Get initial value from localStorage or system preference
    const stored = localStorage.getItem("theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;

    if (stored === "dark" || (!stored && prefersDark)) {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);

    if (newIsDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-md bg-gray-200 dark:bg-gray-800"
      aria-label="Toggle theme"
    >
      {isDark ? "🌙" : "☀️"}
    </button>
  );
}
```

### Dark Mode Styles

```tsx
// Using Tailwind's dark mode classes
export function Card({ title }: { title: string }) {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
      <h3 className="text-gray-900 dark:text-gray-100">
        {title}
      </h3>
    </div>
  );
}
```

### Using next-themes

Use `next-themes` for advanced theme management.

```bash
npm install next-themes
```

```tsx
// src/app/providers.tsx
"use client";

import { ThemeProvider } from "next-themes";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
    </ThemeProvider>
  );
}
```

```tsx
// src/app/layout.tsx
import { Providers } from "./providers";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

```tsx
// src/components/ThemeToggle.tsx
"use client";

import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="p-2 rounded-md bg-gray-200 dark:bg-gray-800"
    >
      {theme === "dark" ? "🌙" : "☀️"}
    </button>
  );
}
```

---

## UI Library Integration

### shadcn/ui

`shadcn/ui` provides beautiful copy-and-paste components.

```bash
npx shadcn@latest init
```

Add components:

```bash
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add input
```

```tsx
// Usage example
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export function Example() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Title</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Content</p>
        <Button>Click</Button>
      </CardContent>
    </Card>
  );
}
```

---

## Responsive Design

### Tailwind Breakpoints

| Prefix | Min Width | CSS |
|--------|-----------|-----|
| `sm` | 640px | `@media (min-width: 640px)` |
| `md` | 768px | `@media (min-width: 768px)` |
| `lg` | 1024px | `@media (min-width: 1024px)` |
| `xl` | 1280px | `@media (min-width: 1280px)` |
| `2xl` | 1536px | `@media (min-width: 1536px)` |

### Responsive Components

```tsx
export function ResponsiveGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <Card title="Card 1" />
      <Card title="Card 2" />
      <Card title="Card 3" />
      <Card title="Card 4" />
    </div>
  );
}
```

### Mobile-First Approach

```tsx
// Mobile-first: default is mobile, changes for larger screens
<div className="
  flex flex-col     /* Mobile: vertical */
  md:flex-row       /* Tablet+: horizontal */
  gap-4
">
  <aside className="
    w-full            /* Mobile: full width */
    md:w-64           /* Tablet+: fixed width */
  ">
    Sidebar
  </aside>
  <main className="flex-1">
    Main content
  </main>
</div>
```

---

## Practice: Blog Layout

```tsx
// src/components/Layout.tsx
import { ThemeToggle } from "./ThemeToggle";
import Link from "next/link";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
      <header className="border-b border-gray-200 dark:border-gray-800">
        <nav className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-gray-900 dark:text-white">
            My Blog
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/blog" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
              Posts
            </Link>
            <Link href="/about" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
              About
            </Link>
            <ThemeToggle />
          </div>
        </nav>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {children}
      </main>

      <footer className="border-t border-gray-200 dark:border-gray-800 mt-auto">
        <div className="max-w-4xl mx-auto px-4 py-8 text-center text-gray-600 dark:text-gray-400">
          © 2026 My Blog. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
```

---

## Summary

| Method | Use Case |
|--------|----------|
| CSS Modules | Component-scoped styles |
| Tailwind CSS | Utility-first rapid development |
| Global CSS | Base styles for entire app |
| next-themes | Dark mode management |
| shadcn/ui | High-quality UI components |

### Key Points

1. **Tailwind recommended**: Excellent Next.js integration
2. **CSS Modules for isolation**: Safe for large projects
3. **Dark mode is standard**: Improves user experience
4. **Mobile-first**: Design from small screens up

---

## Practice Exercises

### Exercise 1: Basic
Create a card component using CSS Modules that changes color on hover.

### Exercise 2: Intermediate
Create a responsive navigation bar with Tailwind CSS. Show a hamburger menu on mobile and horizontal links on desktop.

### Challenge
Implement a dark mode-enabled blog layout using `next-themes`. Follow system settings and allow manual toggle.

---

## References

- [CSS Modules](https://nextjs.org/docs/app/building-your-application/styling/css-modules)
- [Tailwind CSS](https://nextjs.org/docs/app/building-your-application/styling/tailwind-css)
- [next-themes](https://github.com/pacocoursey/next-themes)
- [shadcn/ui](https://ui.shadcn.com/)

---

**Coming Up Next**: In Day 9, we'll learn about "Authentication and Middleware." We'll explore Middleware, NextAuth.js, and protected routes.
