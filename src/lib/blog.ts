import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import remarkRehype from 'remark-rehype';
import rehypePrism from 'rehype-prism-plus';
import rehypeStringify from 'rehype-stringify';

const contentDirectory = path.join(process.cwd(), 'content/blog');

export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  updatedDate?: string;
  excerpt: string;
  content: string;
  tags?: string[];
  author?: string | null;
  locale: string;
}

export interface BlogPostMeta {
  slug: string;
  title: string;
  date: string;
  updatedDate?: string;
  excerpt: string;
  tags?: string[];
  author?: string | null;
  locale: string;
}

export function getBlogPosts(locale: string): BlogPostMeta[] {
  const localeDirectory = path.join(contentDirectory, locale);
  
  // Check if locale directory exists
  if (!fs.existsSync(localeDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(localeDirectory);
  const allPostsData = fileNames
    .filter((fileName) => fileName.endsWith('.md'))
    .map((fileName) => {
      const slug = fileName.replace(/\.md$/, '');
      const fullPath = path.join(localeDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const { data } = matter(fileContents);

      return {
        slug,
        title: data.title,
        date: data.date,
        updatedDate: data.updatedDate,
        excerpt: data.excerpt,
        tags: data.tags || [],
        author: data.author || null,
        locale,
      } as BlogPostMeta;
    });

  // Sort posts by date
  return allPostsData.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export async function getBlogPost(slug: string, locale: string): Promise<BlogPost | null> {
  const localeDirectory = path.join(contentDirectory, locale);
  const fullPath = path.join(localeDirectory, `${slug}.md`);

  // Check if file exists
  if (!fs.existsSync(fullPath)) {
    return null;
  }

  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(fileContents);

  // Process markdown content to HTML
  const processedContent = await remark()
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypePrism)
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(content);
  const contentHtml = processedContent.toString();

  return {
    slug,
    title: data.title,
    date: data.date,
    updatedDate: data.updatedDate,
    excerpt: data.excerpt,
    content: contentHtml,
    tags: data.tags || [],
    author: data.author || null,
    locale,
  };
}

export function getAllBlogSlugs(): { params: { slug: string }; locale: string }[] {
  const locales = ['en', 'ja', 'ko', 'zh', 'es', 'fr'];
  const allSlugs: { params: { slug: string }; locale: string }[] = [];

  for (const locale of locales) {
    const localeDirectory = path.join(contentDirectory, locale);
    
    if (!fs.existsSync(localeDirectory)) {
      continue;
    }

    const fileNames = fs.readdirSync(localeDirectory);
    const slugs = fileNames
      .filter((fileName) => fileName.endsWith('.md'))
      .map((fileName) => ({
        params: { slug: fileName.replace(/\.md$/, '') },
        locale,
      }));

    allSlugs.push(...slugs);
  }

  return allSlugs;
}