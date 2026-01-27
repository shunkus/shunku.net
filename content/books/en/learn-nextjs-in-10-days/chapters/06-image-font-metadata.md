---
title: "Day 6: Image, Font, and Metadata Optimization"
order: 6
---

# Day 6: Image, Font, and Metadata Optimization

## What You'll Learn Today

- The next/image component
- Font optimization with next/font
- Metadata API
- Open Graph Protocol (OGP) configuration
- SEO best practices

---

## Image Optimization with next/image

The `next/image` component automatically optimizes images.

```mermaid
flowchart LR
    subgraph Input["Original Image"]
        ORIG["large.jpg<br/>2MB"]
    end

    subgraph NextImage["next/image"]
        OPT["Optimization"]
    end

    subgraph Output["Output"]
        WEBP["image.webp<br/>100KB"]
        AVIF["image.avif<br/>80KB"]
    end

    ORIG --> OPT
    OPT --> WEBP
    OPT --> AVIF

    style Input fill:#ef4444,color:#fff
    style NextImage fill:#3b82f6,color:#fff
    style Output fill:#22c55e,color:#fff
```

### Basic Usage

```tsx
import Image from "next/image";

export default function Hero() {
  return (
    <div className="relative h-[500px]">
      <Image
        src="/images/hero.jpg"
        alt="Hero image"
        fill
        className="object-cover"
        priority
      />
    </div>
  );
}
```

### Key next/image Props

| Prop | Description |
|------|-------------|
| `src` | Image path (required) |
| `alt` | Alternative text (required) |
| `width` / `height` | Image dimensions |
| `fill` | Fill parent element |
| `priority` | Prioritize loading as LCP image |
| `placeholder` | Display during load ("blur", etc.) |
| `quality` | Image quality (1-100, default 75) |

### Size Specification Patterns

```tsx
// Pattern 1: Fixed size
<Image
  src="/logo.png"
  alt="Logo"
  width={200}
  height={50}
/>

// Pattern 2: Fill parent (fill)
<div className="relative w-full h-64">
  <Image
    src="/banner.jpg"
    alt="Banner"
    fill
    className="object-cover"
  />
</div>

// Pattern 3: Responsive
<Image
  src="/photo.jpg"
  alt="Photo"
  width={800}
  height={600}
  className="w-full h-auto"
/>
```

### External Image Configuration

When using external domain images, permission is required in `next.config.ts`.

```ts
// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "cdn.example.com",
        pathname: "/images/**",
      },
    ],
  },
};

export default nextConfig;
```

### Loading Display with placeholder

```tsx
import Image from "next/image";

export default function Photo() {
  return (
    <Image
      src="/large-photo.jpg"
      alt="Photo"
      width={800}
      height={600}
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRg..."
    />
  );
}
```

For local images, `blurDataURL` is auto-generated:

```tsx
import Image from "next/image";
import heroImage from "@/public/images/hero.jpg";

export default function Hero() {
  return (
    <Image
      src={heroImage}
      alt="Hero"
      placeholder="blur"
      // blurDataURL is auto-generated
    />
  );
}
```

---

## Font Optimization with next/font

`next/font` automatically optimizes fonts and prevents layout shift.

```mermaid
flowchart TB
    subgraph Traditional["Traditional Approach"]
        T1["Page load"]
        T2["Font request"]
        T3["Font download"]
        T4["Layout shift occurs"]
        T1 --> T2 --> T3 --> T4
    end

    subgraph NextFont["next/font"]
        N1["Font fetched at build"]
        N2["Self-hosted"]
        N3["No layout shift"]
        N1 --> N2 --> N3
    end

    style Traditional fill:#ef4444,color:#fff
    style NextFont fill:#22c55e,color:#fff
```

### Using Google Fonts

```tsx
// src/app/layout.tsx
import { Inter, Noto_Sans_JP } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  variable: "--font-noto-sans-jp",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${notoSansJP.variable}`}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
```

### Integration with Tailwind CSS

```ts
// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        display: ["var(--font-noto-sans-jp)", "sans-serif"],
      },
    },
  },
};

export default config;
```

```tsx
// Usage
<h1 className="font-display text-4xl">Display Heading</h1>
<p className="font-sans">Body text</p>
```

### Using Local Fonts

```tsx
import localFont from "next/font/local";

const myFont = localFont({
  src: [
    {
      path: "../fonts/MyFont-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/MyFont-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-my-font",
});
```

---

## Metadata API

Next.js provides a powerful API for setting page metadata.

### Static Metadata

```tsx
// src/app/page.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Home | My Site",
  description: "A website built with Next.js",
  keywords: ["Next.js", "React", "Web Development"],
};

export default function HomePage() {
  return <main>...</main>;
}
```

### Dynamic Metadata

```tsx
// src/app/blog/[slug]/page.tsx
import type { Metadata } from "next";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);

  return {
    title: `${post.title} | My Blog`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [post.coverImage],
    },
  };
}

export default async function BlogPost({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);
  return <article>...</article>;
}
```

### Default Settings in Root Layout

```tsx
// src/app/layout.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "My Site",
    template: "%s | My Site",
  },
  description: "A website built with Next.js",
  metadataBase: new URL("https://example.com"),
};
```

With `template`, child page titles are automatically formatted:

- Child page: `title: "Blog"` → `"Blog | My Site"`

---

## Open Graph Protocol (OGP) Configuration

Configure how your site appears when shared on social media.

```tsx
// src/app/layout.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Site",
  description: "A site built with Next.js",
  openGraph: {
    title: "My Site",
    description: "A site built with Next.js",
    url: "https://example.com",
    siteName: "My Site",
    images: [
      {
        url: "https://example.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "My Site",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "My Site",
    description: "A site built with Next.js",
    images: ["https://example.com/og-image.jpg"],
  },
};
```

### Dynamic OGP Image Generation

Create `opengraph-image.tsx` to dynamically generate OGP images.

```tsx
// src/app/opengraph-image.tsx
import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "My Site";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 48,
          background: "linear-gradient(to bottom, #1e3a8a, #3b82f6)",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
        }}
      >
        My Site
      </div>
    ),
    { ...size }
  );
}
```

### Blog Post OGP Image

```tsx
// src/app/blog/[slug]/opengraph-image.tsx
import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Blog Post";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: { slug: string };
}) {
  const post = await getPost(params.slug);

  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 40,
          background: "#000",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          padding: 40,
        }}
      >
        <div style={{ fontSize: 24, marginBottom: 20 }}>Blog</div>
        <div style={{ textAlign: "center" }}>{post.title}</div>
      </div>
    ),
    { ...size }
  );
}
```

---

## SEO Best Practices

### robots.txt

```tsx
// src/app/robots.ts
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/api/"],
    },
    sitemap: "https://example.com/sitemap.xml",
  };
}
```

### sitemap.xml

```tsx
// src/app/sitemap.ts
import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getAllPosts();

  const blogUrls = posts.map((post) => ({
    url: `https://example.com/blog/${post.slug}`,
    lastModified: post.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [
    {
      url: "https://example.com",
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 1,
    },
    {
      url: "https://example.com/about",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    ...blogUrls,
  ];
}
```

### JSON-LD Structured Data

```tsx
// src/app/blog/[slug]/page.tsx
export default async function BlogPost({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    author: {
      "@type": "Person",
      name: post.author,
    },
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article>...</article>
    </>
  );
}
```

---

## Practice: Blog Site Optimization

```tsx
// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter, Noto_Sans_JP } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-noto-sans-jp",
});

export const metadata: Metadata = {
  title: {
    default: "Tech Blog",
    template: "%s | Tech Blog",
  },
  description: "A technical blog about web development",
  metadataBase: new URL("https://tech-blog.example.com"),
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Tech Blog",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${notoSansJP.variable}`}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
```

---

## Summary

| Concept | Description |
|---------|-------------|
| next/image | Automatic image optimization, lazy loading |
| next/font | Font optimization, layout shift prevention |
| Metadata API | Static/dynamic metadata configuration |
| OGP | Social media sharing display settings |
| SEO | robots.txt, sitemap.xml, structured data |

### Key Points

1. **Always use next/image**: Automatic optimization and lazy loading
2. **Use next/font for fonts**: Prevents layout shift
3. **Set metadata per page**: Optimize SEO and social sharing
4. **Add structured data**: Help search engines understand content

---

## Practice Exercises

### Exercise 1: Basic
Create an image gallery page displaying optimized images with `next/image`. Include external images (like Unsplash).

### Exercise 2: Intermediate
Set dynamic metadata for blog post pages. Generate title, description, and OGP image from post data.

### Challenge
Implement dynamic OGP image generation. Include the blog post title in the OGP image and use custom fonts.

---

## References

- [next/image](https://nextjs.org/docs/app/api-reference/components/image)
- [next/font](https://nextjs.org/docs/app/building-your-application/optimizing/fonts)
- [Metadata](https://nextjs.org/docs/app/building-your-application/optimizing/metadata)
- [generateMetadata](https://nextjs.org/docs/app/api-reference/functions/generate-metadata)

---

**Coming Up Next**: In Day 7, we'll learn about "Rendering Strategies." We'll explore the differences between static generation, dynamic rendering, streaming, and ISR.
