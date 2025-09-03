// Mock all remark-related modules before importing
jest.mock('remark', () => ({
  remark: jest.fn().mockReturnValue({
    use: jest.fn().mockReturnThis(),
    process: jest.fn().mockResolvedValue({
      toString: jest.fn().mockReturnValue('<h1>Chapter 1</h1><p>This is the first chapter.</p>'),
    }),
  }),
}));

jest.mock('remark-gfm', () => jest.fn());
jest.mock('remark-rehype', () => jest.fn());
jest.mock('rehype-prism-plus', () => jest.fn());
jest.mock('rehype-stringify', () => jest.fn());

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

import {
  getBooks,
  getBook,
  getBookChapter,
  getAllBookSlugs,
  getAllBookChapterSlugs,
  getBooksByTag,
  getAllBookTags,
  Book,
  BookMeta,
  BookChapter,
} from '../../lib/books';

// Mock file system operations
jest.mock('fs');
jest.mock('path');
jest.mock('gray-matter');

const mockFs = fs as jest.Mocked<typeof fs>;
const mockPath = path as jest.Mocked<typeof path>;
const mockMatter = matter as jest.MockedFunction<typeof matter>;

// Mock data
const mockBookMetadata = {
  id: 'test-book-1',
  title: 'Test Book Title',
  subtitle: 'Test Book Subtitle',
  author: 'Test Author',
  publishedDate: '2024-01-15',
  updatedDate: '2024-01-20',
  description: 'This is a test book description.',
  coverImage: '/images/books/test-book.png',
  tags: ['React', 'TypeScript', 'Testing'],
};

const mockChapterData = {
  id: 'chapter-1',
  title: 'Chapter 1: Introduction',
  order: 1,
};

const mockChapterContent = '# Chapter 1\n\nThis is the first chapter.';



const mockDirent = (name: string, isDirectory: boolean = true) => ({
  name,
  isDirectory: () => isDirectory,
});

describe('books.ts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mocks
    mockPath.join.mockImplementation((...args) => args.join('/'));
    
    // Mock process.cwd()
    jest.spyOn(process, 'cwd').mockReturnValue('/test-root');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getBooks', () => {
    it('returns books for a valid locale', () => {
      const mockBookDirs = [mockDirent('book1'), mockDirent('book2')];
      const mockChapterFiles = ['chapter1.md', 'chapter2.md'];
      
      mockFs.existsSync.mockImplementation((dirPath) => {
        const path = dirPath.toString();
        return !path.includes('nonexistent');
      });
      mockFs.readdirSync.mockImplementation((dirPath, options) => {
        const path = dirPath.toString();
        if (options && typeof options === 'object' && 'withFileTypes' in options) {
          return mockBookDirs as any;
        }
        if (path.includes('chapters')) {
          return mockChapterFiles as any;
        }
        return [] as any;
      });
      mockFs.readFileSync.mockReturnValue(JSON.stringify(mockBookMetadata));

      const result = getBooks('en');

      // Check that the necessary filesystem operations were called
      expect(mockFs.existsSync).toHaveBeenCalled();
      expect(mockFs.readdirSync).toHaveBeenCalledWith(expect.any(String), { withFileTypes: true });
      
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: 'test-book-1',
        slug: 'book1',
        title: 'Test Book Title',
        subtitle: 'Test Book Subtitle',
        author: 'Test Author',
        publishedDate: '2024-01-15',
        updatedDate: '2024-01-20',
        description: 'This is a test book description.',
        coverImage: '/images/books/test-book.png',
        tags: ['React', 'TypeScript', 'Testing'],
        locale: 'en',
        chapterCount: 2,
      });
    });

    it('returns empty array when locale directory does not exist', () => {
      mockFs.existsSync.mockReturnValue(false);

      const result = getBooks('nonexistent');

      expect(result).toEqual([]);
      expect(mockFs.readdirSync).not.toHaveBeenCalled();
    });

    it('handles books without meta.json', () => {
      const mockBookDirs = [mockDirent('book1'), mockDirent('book2')];
      
      mockFs.existsSync.mockImplementation((dirPath) => {
        const path = dirPath.toString();
        return !path.includes('meta.json');
      });
      mockFs.readdirSync.mockReturnValue(mockBookDirs as any);

      const result = getBooks('en');

      expect(result).toEqual([]);
    });

    it('handles books without chapters directory', () => {
      const mockBookDirs = [mockDirent('book1')];
      
      mockFs.existsSync.mockImplementation((dirPath) => {
        const path = dirPath.toString();
        return !path.includes('chapters');
      });
      mockFs.readdirSync.mockReturnValue(mockBookDirs as any);
      mockFs.readFileSync.mockReturnValue(JSON.stringify(mockBookMetadata));

      const result = getBooks('en');

      expect(result).toHaveLength(1);
      expect(result[0].chapterCount).toBe(0);
    });

    it('handles books with optional fields missing', () => {
      const mockMetadataMinimal = {
        title: 'Test Book',
        author: 'Test Author',
        publishedDate: '2024-01-15',
        description: 'Test description',
      };
      const mockBookDirs = [mockDirent('book1')];
      
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readdirSync.mockImplementation((dirPath, options) => {
        if (options && typeof options === 'object' && 'withFileTypes' in options) {
          return mockBookDirs as any;
        }
        return [] as any;
      });
      mockFs.readFileSync.mockReturnValue(JSON.stringify(mockMetadataMinimal));

      const result = getBooks('en');

      expect(result[0]).toEqual({
        id: 'book1',
        slug: 'book1',
        title: 'Test Book',
        subtitle: undefined,
        author: 'Test Author',
        publishedDate: '2024-01-15',
        updatedDate: undefined,
        description: 'Test description',
        coverImage: null,
        tags: [],
        locale: 'en',
        chapterCount: 0,
      });
    });

    it('sorts books by published date in descending order', () => {
      const mockBookDirs = [mockDirent('old-book'), mockDirent('new-book')];
      const mockOldBook = { ...mockBookMetadata, publishedDate: '2024-01-01' };
      const mockNewBook = { ...mockBookMetadata, publishedDate: '2024-12-31' };
      
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readdirSync.mockImplementation((dirPath, options) => {
        if (options && typeof options === 'object' && 'withFileTypes' in options) {
          return mockBookDirs as any;
        }
        return [] as any;
      });
      mockFs.readFileSync
        .mockReturnValueOnce(JSON.stringify(mockOldBook))
        .mockReturnValueOnce(JSON.stringify(mockNewBook));

      const result = getBooks('en');

      expect(result[0].publishedDate).toBe('2024-12-31'); // Newer book first
      expect(result[1].publishedDate).toBe('2024-01-01'); // Older book second
    });
  });

  describe('getBook', () => {
    it('returns a book with chapters for valid slug and locale', async () => {
      const mockChapterFiles = ['01-intro.md', '02-basics.md'];
      const mockChapter1Data = { id: 'intro', title: 'Introduction', order: 1 };
      const mockChapter2Data = { id: 'basics', title: 'Basics', order: 2 };
      
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockImplementation((filePath) => {
        const path = filePath.toString();
        if (path.includes('meta.json')) {
          return JSON.stringify(mockBookMetadata);
        }
        return 'mock chapter content';
      });
      mockFs.readdirSync.mockReturnValue(mockChapterFiles as any);
      mockMatter
        .mockReturnValueOnce({ data: mockChapter1Data, content: mockChapterContent } as any)
        .mockReturnValueOnce({ data: mockChapter2Data, content: mockChapterContent } as any);

      const result = await getBook('test-book', 'en');

      expect(result).toEqual({
        id: 'test-book-1',
        slug: 'test-book',
        title: 'Test Book Title',
        subtitle: 'Test Book Subtitle',
        author: 'Test Author',
        publishedDate: '2024-01-15',
        updatedDate: '2024-01-20',
        description: 'This is a test book description.',
        coverImage: '/images/books/test-book.png',
        tags: ['React', 'TypeScript', 'Testing'],
        locale: 'en',
        chapters: [
          {
            id: 'intro',
            title: 'Introduction',
            order: 1,
            slug: '01-intro',
          },
          {
            id: 'basics',
            title: 'Basics',
            order: 2,
            slug: '02-basics',
          },
        ],
      });
    });

    it('returns null when meta.json does not exist', async () => {
      mockFs.existsSync.mockReturnValue(false);

      const result = await getBook('nonexistent-book', 'en');

      expect(result).toBeNull();
      expect(mockFs.readFileSync).not.toHaveBeenCalled();
    });

    it('handles books without chapters directory', async () => {
      mockFs.existsSync.mockImplementation((dirPath) => {
        const path = dirPath.toString();
        return !path.includes('chapters');
      });
      mockFs.readFileSync.mockReturnValue(JSON.stringify(mockBookMetadata));

      const result = await getBook('test-book', 'en');

      expect(result?.chapters).toEqual([]);
    });

    it('sorts chapters by order', async () => {
      const mockChapterFiles = ['chapter3.md', 'chapter1.md', 'chapter2.md'];
      const mockChapter1 = { title: 'Chapter 1', order: 1 };
      const mockChapter2 = { title: 'Chapter 2', order: 2 };
      const mockChapter3 = { title: 'Chapter 3', order: 3 };
      
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockImplementation((filePath) => {
        const path = filePath.toString();
        if (path.includes('meta.json')) {
          return JSON.stringify(mockBookMetadata);
        }
        return 'mock content';
      });
      mockFs.readdirSync.mockReturnValue(mockChapterFiles as any);
      mockMatter
        .mockReturnValueOnce({ data: mockChapter3, content: '' } as any)
        .mockReturnValueOnce({ data: mockChapter1, content: '' } as any)
        .mockReturnValueOnce({ data: mockChapter2, content: '' } as any);

      const result = await getBook('test-book', 'en');

      expect(result?.chapters[0].order).toBe(1);
      expect(result?.chapters[1].order).toBe(2);
      expect(result?.chapters[2].order).toBe(3);
    });

    it('handles chapters without order field', async () => {
      const mockChapterFiles = ['chapter1.md'];
      const mockChapterData = { title: 'Chapter Without Order' };
      
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockImplementation((filePath) => {
        const path = filePath.toString();
        if (path.includes('meta.json')) {
          return JSON.stringify(mockBookMetadata);
        }
        return 'mock content';
      });
      mockFs.readdirSync.mockReturnValue(mockChapterFiles as any);
      mockMatter.mockReturnValue({ data: mockChapterData, content: '' } as any);

      const result = await getBook('test-book', 'en');

      expect(result?.chapters[0].order).toBe(1); // Default order should be chapter index + 1
    });
  });

  describe('getBookChapter', () => {
    it('returns a chapter with processed content', async () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue('mock file content');
      mockMatter.mockReturnValue({
        data: mockChapterData,
        content: mockChapterContent,
      } as any);

      const result = await getBookChapter('test-book', 'chapter-1', 'en');

      expect(mockFs.existsSync).toHaveBeenCalled();
      expect(mockFs.readFileSync).toHaveBeenCalled();

      expect(result).toEqual({
        id: 'chapter-1',
        title: 'Chapter 1: Introduction',
        order: 1,
        slug: 'chapter-1',
        content: '<h1>Chapter 1</h1><p>This is the first chapter.</p>',
      });
    });

    it('returns null when chapter file does not exist', async () => {
      mockFs.existsSync.mockReturnValue(false);

      const result = await getBookChapter('test-book', 'nonexistent-chapter', 'en');

      expect(result).toBeNull();
      expect(mockFs.readFileSync).not.toHaveBeenCalled();
    });

    it('handles chapters without optional fields', async () => {
      const mockMinimalChapterData = { title: 'Basic Chapter' };
      
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue('mock content');
      mockMatter.mockReturnValue({
        data: mockMinimalChapterData,
        content: mockChapterContent,
      } as any);

      const result = await getBookChapter('test-book', 'basic-chapter', 'en');

      expect(result).toEqual({
        id: 'basic-chapter',
        title: 'Basic Chapter',
        order: 0, // Default order
        slug: 'basic-chapter',
        content: '<h1>Chapter 1</h1><p>This is the first chapter.</p>',
      });
    });
  });

  describe('getAllBookSlugs', () => {
    it('returns slugs for all locales', () => {
      const mockBookDirsEn = [mockDirent('book1'), mockDirent('book2')];
      const mockBookDirsJa = [mockDirent('book3')];
      
      mockFs.existsSync.mockImplementation((dirPath) => {
        const path = dirPath.toString();
        return !path.includes('nonexistent');
      });
      
      mockFs.readdirSync.mockImplementation((dirPath, options) => {
        const path = dirPath.toString();
        if (path.includes('en')) return mockBookDirsEn as any;
        if (path.includes('ja')) return mockBookDirsJa as any;
        return [] as any;
      });

      const result = getAllBookSlugs();

      expect(result).toEqual([
        { params: { slug: 'book1' }, locale: 'en' },
        { params: { slug: 'book2' }, locale: 'en' },
        { params: { slug: 'book3' }, locale: 'ja' },
      ]);
    });

    it('handles non-existent locale directories', () => {
      mockFs.existsSync.mockReturnValue(false);

      const result = getAllBookSlugs();

      expect(result).toEqual([]);
    });

    it('filters out non-directory entries', () => {
      const mockEntries = [
        mockDirent('book1', true),
        mockDirent('file.txt', false),
        mockDirent('book2', true),
      ];
      
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readdirSync.mockReturnValue(mockEntries as any);

      const result = getAllBookSlugs();

      // Only directories should be included, multiplied by 6 locales that exist
      expect(result.every(item => ['book1', 'book2'].includes(item.params.slug))).toBe(true);
      expect(result.every(item => item.params.slug !== 'file.txt')).toBe(true);
    });
  });

  describe('getAllBookChapterSlugs', () => {
    it('returns chapter slugs for all books and locales', () => {
      const mockBookDirs = [mockDirent('book1'), mockDirent('book2')];
      const mockChapterFiles = ['chapter1.md', 'chapter2.md'];
      
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readdirSync.mockImplementation((dirPath, options) => {
        const path = dirPath.toString();
        if (options && typeof options === 'object' && 'withFileTypes' in options) {
          return mockBookDirs as any;
        }
        if (path.includes('chapters')) {
          return mockChapterFiles as any;
        }
        return [] as any;
      });

      const result = getAllBookChapterSlugs();

      expect(result).toContainEqual({
        params: { bookSlug: 'book1', chapterSlug: 'chapter1' },
        locale: 'en',
      });
      expect(result).toContainEqual({
        params: { bookSlug: 'book1', chapterSlug: 'chapter2' },
        locale: 'en',
      });
    });

    it('handles books without chapters directory', () => {
      const mockBookDirs = [mockDirent('book1')];
      
      mockFs.existsSync.mockImplementation((dirPath) => {
        const path = dirPath.toString();
        return !path.includes('chapters');
      });
      mockFs.readdirSync.mockReturnValue(mockBookDirs as any);

      const result = getAllBookChapterSlugs();

      expect(result).toEqual([]);
    });

    it('filters out non-markdown files', () => {
      const mockBookDirs = [mockDirent('book1')];
      const mockFiles = ['chapter1.md', 'readme.txt', 'chapter2.md'];
      
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readdirSync.mockImplementation((dirPath, options) => {
        const path = dirPath.toString();
        if (options && typeof options === 'object' && 'withFileTypes' in options) {
          return mockBookDirs as any;
        }
        if (path.includes('chapters')) {
          return mockFiles as any;
        }
        return [] as any;
      });

      const result = getAllBookChapterSlugs();

      expect(result.every(item => !item.params.chapterSlug.includes('readme'))).toBe(true);
      expect(result.some(item => item.params.chapterSlug === 'chapter1')).toBe(true);
      expect(result.some(item => item.params.chapterSlug === 'chapter2')).toBe(true);
    });
  });

  describe('getBooksByTag', () => {
    it('returns books filtered by tag', () => {
      const mockBookDirs = [mockDirent('book1'), mockDirent('book2')];
      const mockBookWithReact = { ...mockBookMetadata, tags: ['React', 'TypeScript'] };
      const mockBookWithVue = { ...mockBookMetadata, tags: ['Vue', 'JavaScript'] };
      
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readdirSync.mockImplementation((dirPath, options) => {
        if (options && typeof options === 'object' && 'withFileTypes' in options) {
          return mockBookDirs as any;
        }
        return [] as any;
      });
      mockFs.readFileSync
        .mockReturnValueOnce(JSON.stringify(mockBookWithReact))
        .mockReturnValueOnce(JSON.stringify(mockBookWithVue));

      const result = getBooksByTag('React', 'en');

      expect(result).toHaveLength(1);
      expect(result[0].slug).toBe('book1');
    });

    it('returns empty array when no books match the tag', () => {
      const mockBookDirs = [mockDirent('book1')];
      const mockBookWithoutTag = { ...mockBookMetadata, tags: ['Vue'] };
      
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readdirSync.mockImplementation((dirPath, options) => {
        if (options && typeof options === 'object' && 'withFileTypes' in options) {
          return mockBookDirs as any;
        }
        return [] as any;
      });
      mockFs.readFileSync.mockReturnValue(JSON.stringify(mockBookWithoutTag));

      const result = getBooksByTag('React', 'en');

      expect(result).toEqual([]);
    });
  });

  describe('getAllBookTags', () => {
    it('returns unique sorted tags for a locale', () => {
      const mockBookDirs = [mockDirent('book1'), mockDirent('book2')];
      const mockBook1 = { ...mockBookMetadata, tags: ['React', 'TypeScript'] };
      const mockBook2 = { ...mockBookMetadata, tags: ['TypeScript', 'Testing'] };
      
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readdirSync.mockImplementation((dirPath, options) => {
        if (options && typeof options === 'object' && 'withFileTypes' in options) {
          return mockBookDirs as any;
        }
        return [] as any;
      });
      mockFs.readFileSync
        .mockReturnValueOnce(JSON.stringify(mockBook1))
        .mockReturnValueOnce(JSON.stringify(mockBook2));

      const result = getAllBookTags('en');

      expect(result).toEqual(['React', 'Testing', 'TypeScript']); // Sorted alphabetically
    });

    it('handles books without tags', () => {
      const mockBookDirs = [mockDirent('book1')];
      const mockBookWithoutTags = { 
        title: 'Book', 
        author: 'Author', 
        publishedDate: '2024-01-01', 
        description: 'Description' 
      };
      
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readdirSync.mockImplementation((dirPath, options) => {
        if (options && typeof options === 'object' && 'withFileTypes' in options) {
          return mockBookDirs as any;
        }
        return [] as any;
      });
      mockFs.readFileSync.mockReturnValue(JSON.stringify(mockBookWithoutTags));

      const result = getAllBookTags('en');

      expect(result).toEqual([]);
    });
  });
});