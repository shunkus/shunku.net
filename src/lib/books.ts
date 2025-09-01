import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypePrism from 'rehype-prism-plus';
import rehypeStringify from 'rehype-stringify';

const contentDirectory = path.join(process.cwd(), 'content/books');

export interface BookChapter {
  id: string;
  title: string;
  order: number;
  slug: string;
  content?: string;
}

export interface Book {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  author: string;
  publishedDate: string;
  updatedDate?: string;
  description: string;
  coverImage: string | null;
  tags?: string[];
  locale: string;
  chapters: BookChapter[];
}

export interface BookMeta {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  author: string;
  publishedDate: string;
  updatedDate?: string;
  description: string;
  coverImage: string | null;
  tags?: string[];
  locale: string;
  chapterCount: number;
}

export function getBooks(locale: string): BookMeta[] {
  const localeDirectory = path.join(contentDirectory, locale);
  
  if (!fs.existsSync(localeDirectory)) {
    return [];
  }

  const bookDirs = fs.readdirSync(localeDirectory, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  const books = bookDirs.map(bookSlug => {
    const bookDir = path.join(localeDirectory, bookSlug);
    const metaPath = path.join(bookDir, 'meta.json');
    
    if (!fs.existsSync(metaPath)) {
      return null;
    }

    const metaContent = fs.readFileSync(metaPath, 'utf8');
    const metadata = JSON.parse(metaContent);
    
    // Count chapters
    const chaptersDir = path.join(bookDir, 'chapters');
    let chapterCount = 0;
    if (fs.existsSync(chaptersDir)) {
      chapterCount = fs.readdirSync(chaptersDir)
        .filter(file => file.endsWith('.md')).length;
    }

    return {
      id: metadata.id || bookSlug,
      slug: bookSlug,
      title: metadata.title,
      subtitle: metadata.subtitle,
      author: metadata.author,
      publishedDate: metadata.publishedDate,
      updatedDate: metadata.updatedDate,
      description: metadata.description,
      coverImage: metadata.coverImage || null,
      tags: metadata.tags || [],
      locale,
      chapterCount,
    } as BookMeta;
  }).filter(book => book !== null) as BookMeta[];

  return books.sort((a, b) => 
    new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime()
  );
}

export async function getBook(slug: string, locale: string): Promise<Book | null> {
  const bookDir = path.join(contentDirectory, locale, slug);
  const metaPath = path.join(bookDir, 'meta.json');
  
  if (!fs.existsSync(metaPath)) {
    return null;
  }

  const metaContent = fs.readFileSync(metaPath, 'utf8');
  const metadata = JSON.parse(metaContent);
  
  // Load chapters
  const chaptersDir = path.join(bookDir, 'chapters');
  const chapters: BookChapter[] = [];
  
  if (fs.existsSync(chaptersDir)) {
    const chapterFiles = fs.readdirSync(chaptersDir)
      .filter(file => file.endsWith('.md'))
      .sort();

    for (const chapterFile of chapterFiles) {
      const chapterPath = path.join(chaptersDir, chapterFile);
      const fileContents = fs.readFileSync(chapterPath, 'utf8');
      const { data } = matter(fileContents);
      
      const chapterSlug = chapterFile.replace(/\.md$/, '');
      
      chapters.push({
        id: data.id || chapterSlug,
        title: data.title,
        order: data.order || chapters.length + 1,
        slug: chapterSlug,
      });
    }
  }

  // Sort chapters by order
  chapters.sort((a, b) => a.order - b.order);

  return {
    id: metadata.id || slug,
    slug,
    title: metadata.title,
    subtitle: metadata.subtitle,
    author: metadata.author,
    publishedDate: metadata.publishedDate,
    updatedDate: metadata.updatedDate,
    description: metadata.description,
    coverImage: metadata.coverImage || null,
    tags: metadata.tags || [],
    locale,
    chapters,
  };
}

export async function getBookChapter(
  bookSlug: string, 
  chapterSlug: string, 
  locale: string
): Promise<BookChapter | null> {
  const chapterPath = path.join(
    contentDirectory, 
    locale, 
    bookSlug, 
    'chapters', 
    `${chapterSlug}.md`
  );
  
  if (!fs.existsSync(chapterPath)) {
    return null;
  }

  const fileContents = fs.readFileSync(chapterPath, 'utf8');
  const { data, content } = matter(fileContents);

  // Process markdown content to HTML
  const processedContent = await remark()
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypePrism)
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(content);
  const contentHtml = processedContent.toString();

  return {
    id: data.id || chapterSlug,
    title: data.title,
    order: data.order || 0,
    slug: chapterSlug,
    content: contentHtml,
  };
}

export function getAllBookSlugs(): { params: { slug: string }; locale: string }[] {
  const locales = ['en', 'ja', 'ko', 'zh', 'es', 'fr'];
  const allSlugs: { params: { slug: string }; locale: string }[] = [];

  for (const locale of locales) {
    const localeDirectory = path.join(contentDirectory, locale);
    
    if (!fs.existsSync(localeDirectory)) {
      continue;
    }

    const bookDirs = fs.readdirSync(localeDirectory, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => ({
        params: { slug: dirent.name },
        locale,
      }));

    allSlugs.push(...bookDirs);
  }

  return allSlugs;
}

export function getAllBookChapterSlugs(): { 
  params: { bookSlug: string; chapterSlug: string }; 
  locale: string 
}[] {
  const locales = ['en', 'ja', 'ko', 'zh', 'es', 'fr'];
  const allSlugs: { 
    params: { bookSlug: string; chapterSlug: string }; 
    locale: string 
  }[] = [];

  for (const locale of locales) {
    const localeDirectory = path.join(contentDirectory, locale);
    
    if (!fs.existsSync(localeDirectory)) {
      continue;
    }

    const bookDirs = fs.readdirSync(localeDirectory, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory());

    for (const bookDir of bookDirs) {
      const chaptersDir = path.join(localeDirectory, bookDir.name, 'chapters');
      
      if (!fs.existsSync(chaptersDir)) {
        continue;
      }

      const chapterFiles = fs.readdirSync(chaptersDir)
        .filter(file => file.endsWith('.md'))
        .map(file => ({
          params: { 
            bookSlug: bookDir.name,
            chapterSlug: file.replace(/\.md$/, '')
          },
          locale,
        }));

      allSlugs.push(...chapterFiles);
    }
  }

  return allSlugs;
}

export function getBooksByTag(tag: string, locale: string): BookMeta[] {
  const books = getBooks(locale);
  return books.filter(book => book.tags?.includes(tag));
}

export function getAllBookTags(locale: string): string[] {
  const books = getBooks(locale);
  const allTags = books.flatMap(book => book.tags || []);
  return [...new Set(allTags)].sort();
}