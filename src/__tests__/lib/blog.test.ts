// Mock all remark-related modules before importing
jest.mock('remark', () => ({
  remark: jest.fn().mockReturnValue({
    use: jest.fn().mockReturnThis(),
    process: jest.fn().mockResolvedValue({
      toString: jest.fn().mockReturnValue('<h1>Test Content</h1><p>Test paragraph.</p>'),
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
  getBlogPosts,
  getBlogPost,
  getAllBlogSlugs,
  getAllTags,
  getBlogPostsByTag,
  getAllTagsWithCounts,
  getAllTagSlugs,
  BlogPostMeta,
} from '../../lib/blog';

// Mock file system operations
jest.mock('fs');
jest.mock('path');
jest.mock('gray-matter');

const mockFs = fs as jest.Mocked<typeof fs>;
const mockPath = path as jest.Mocked<typeof path>;
const mockMatter = matter as jest.MockedFunction<typeof matter>;

// Mock data
const mockBlogPostData = {
  title: 'Test Blog Post',
  date: '2024-01-15',
  updatedDate: '2024-01-20',
  excerpt: 'This is a test blog post excerpt.',
  tags: ['React', 'TypeScript', 'Testing'],
  author: 'Test Author',
};

const mockBlogPostContent = '# Test Blog Post\n\nThis is the content of the test blog post.';

describe('blog.ts', () => {
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

  describe('getBlogPosts', () => {
    it('returns blog posts for a valid locale', () => {
      const mockFiles = ['post1.md', 'post2.md', 'not-a-post.txt'];
      
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readdirSync.mockReturnValue(mockFiles as string[]);
      mockFs.readFileSync.mockReturnValue('mock file content');
      mockMatter.mockReturnValue({
        data: mockBlogPostData,
        content: mockBlogPostContent,
      } as matter.GrayMatterFile<string>);

      const result = getBlogPosts('en');

      // Check that the necessary filesystem operations were called
      expect(mockFs.existsSync).toHaveBeenCalled();
      expect(mockFs.readdirSync).toHaveBeenCalled();
      
      expect(result).toHaveLength(2); // Only .md files should be processed
      expect(result[0]).toEqual({
        slug: 'post2', // Files are processed in order returned by readdirSync
        title: 'Test Blog Post',
        date: '2024-01-15',
        updatedDate: '2024-01-20',
        excerpt: 'This is a test blog post excerpt.',
        tags: ['React', 'TypeScript', 'Testing'],
        author: 'Test Author',
        locale: 'en',
      });
    });

    it('returns empty array when locale directory does not exist', () => {
      mockFs.existsSync.mockReturnValue(false);

      const result = getBlogPosts('nonexistent');

      expect(result).toEqual([]);
      expect(mockFs.readdirSync).not.toHaveBeenCalled();
    });

    it('handles posts without optional fields', () => {
      const mockDataWithoutOptionals = {
        title: 'Test Post',
        date: '2024-01-15',
        excerpt: 'Test excerpt',
      };

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readdirSync.mockReturnValue(['post.md'] as string[]);
      mockFs.readFileSync.mockReturnValue('mock content');
      mockMatter.mockReturnValue({
        data: mockDataWithoutOptionals,
        content: mockBlogPostContent,
      } as matter.GrayMatterFile<string>);

      const result = getBlogPosts('en');

      expect(result[0]).toEqual({
        slug: 'post',
        title: 'Test Post',
        date: '2024-01-15',
        updatedDate: undefined,
        excerpt: 'Test excerpt',
        tags: [],
        author: null,
        locale: 'en',
      });
    });

    it('sorts posts by date in descending order', () => {
      const mockFiles = ['old-post.md', 'new-post.md'];
      const mockOldPost = { ...mockBlogPostData, date: '2024-01-01' };
      const mockNewPost = { ...mockBlogPostData, date: '2024-12-31' };

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readdirSync.mockReturnValue(mockFiles as string[]);
      mockFs.readFileSync.mockReturnValue('mock content');
      mockMatter
        .mockReturnValueOnce({ data: mockOldPost, content: mockBlogPostContent } as matter.GrayMatterFile<string>)
        .mockReturnValueOnce({ data: mockNewPost, content: mockBlogPostContent } as matter.GrayMatterFile<string>);

      const result = getBlogPosts('en');

      expect(result[0].date).toBe('2024-12-31'); // Newer post first
      expect(result[1].date).toBe('2024-01-01'); // Older post second
    });
  });

  describe('getBlogPost', () => {
    it('returns a blog post for valid slug and locale', async () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue('mock file content');
      mockMatter.mockReturnValue({
        data: mockBlogPostData,
        content: mockBlogPostContent,
      } as matter.GrayMatterFile<string>);

      const result = await getBlogPost('test-post', 'en');

      expect(mockFs.existsSync).toHaveBeenCalled();
      expect(mockFs.readFileSync).toHaveBeenCalled();

      expect(result).toEqual({
        slug: 'test-post',
        title: 'Test Blog Post',
        date: '2024-01-15',
        updatedDate: '2024-01-20',
        excerpt: 'This is a test blog post excerpt.',
        content: '<h1>Test Content</h1><p>Test paragraph.</p>',
        tags: ['React', 'TypeScript', 'Testing'],
        author: 'Test Author',
        locale: 'en',
      });
    });

    it('returns null when file does not exist', async () => {
      mockFs.existsSync.mockReturnValue(false);

      const result = await getBlogPost('nonexistent-post', 'en');

      expect(result).toBeNull();
      expect(mockFs.readFileSync).not.toHaveBeenCalled();
    });

    it('handles posts without optional fields', async () => {
      const mockDataWithoutOptionals = {
        title: 'Test Post',
        date: '2024-01-15',
        excerpt: 'Test excerpt',
      };

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue('mock content');
      mockMatter.mockReturnValue({
        data: mockDataWithoutOptionals,
        content: mockBlogPostContent,
      } as matter.GrayMatterFile<string>);

      const result = await getBlogPost('test-post', 'en');

      expect(result?.tags).toEqual([]);
      expect(result?.author).toBeNull();
      expect(result?.updatedDate).toBeUndefined();
    });
  });

  describe('getAllBlogSlugs', () => {
    it('returns slugs for all locales', () => {
      const mockFiles = {
        'en': ['post1.md', 'post2.md'],
        'ja': ['post3.md'],
        'nonexistent': [],
      };

      mockFs.existsSync.mockImplementation((dirPath) => {
        const locale = dirPath.toString().split('/').pop();
        return locale !== 'nonexistent';
      });
      
      mockFs.readdirSync.mockImplementation((dirPath) => {
        const locale = dirPath.toString().split('/').pop();
        return (mockFiles[locale as keyof typeof mockFiles] || []) as fs.Dirent[];
      });

      const result = getAllBlogSlugs();

      expect(result).toEqual([
        { params: { slug: 'post1' }, locale: 'en' },
        { params: { slug: 'post2' }, locale: 'en' },
        { params: { slug: 'post3' }, locale: 'ja' },
      ]);
    });

    it('handles non-existent locale directories', () => {
      mockFs.existsSync.mockReturnValue(false);

      const result = getAllBlogSlugs();

      expect(result).toEqual([]);
    });

    it('filters out non-markdown files', () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readdirSync.mockReturnValue(['post1.md', 'readme.txt', 'post2.md'] as string[]);

      const result = getAllBlogSlugs();

      expect(result).toHaveLength(12); // 2 .md files * 6 locales = 12 (since all locales exist in this test)
      expect(result.every(item => !item.params.slug.includes('readme'))).toBe(true);
    });
  });

  describe('getAllTags', () => {
    it('returns unique sorted tags for a locale', () => {
      // Mock getBlogPosts to return our test data
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readdirSync.mockReturnValue(['post1.md', 'post2.md'] as string[]);
      mockFs.readFileSync.mockReturnValue('mock content');
      mockMatter
        .mockReturnValueOnce({ data: { ...mockBlogPostData, tags: ['React', 'TypeScript'] }, content: '' } as matter.GrayMatterFile<string>)
        .mockReturnValueOnce({ data: { ...mockBlogPostData, tags: ['TypeScript', 'Testing'] }, content: '' } as matter.GrayMatterFile<string>);

      const result = getAllTags('en');

      expect(result).toEqual(['React', 'Testing', 'TypeScript']); // Sorted alphabetically
    });

    it('handles posts without tags', () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readdirSync.mockReturnValue(['post.md'] as string[]);
      mockFs.readFileSync.mockReturnValue('mock content');
      mockMatter.mockReturnValue({
        data: { title: 'Post', date: '2024-01-01', excerpt: 'Excerpt' },
        content: '',
      } as matter.GrayMatterFile<string>);

      const result = getAllTags('en');

      expect(result).toEqual([]);
    });
  });

  describe('getBlogPostsByTag', () => {
    it('returns posts filtered by tag', () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readdirSync.mockReturnValue(['post1.md', 'post2.md'] as string[]);
      mockFs.readFileSync.mockReturnValue('mock content');
      mockMatter
        .mockReturnValueOnce({ data: { ...mockBlogPostData, tags: ['React', 'TypeScript'] }, content: '' } as matter.GrayMatterFile<string>)
        .mockReturnValueOnce({ data: { ...mockBlogPostData, tags: ['Vue', 'JavaScript'] }, content: '' } as matter.GrayMatterFile<string>);

      const result = getBlogPostsByTag('React', 'en');

      expect(result).toHaveLength(1);
      expect(result[0].slug).toBe('post1');
    });

    it('returns empty array when no posts match the tag', () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readdirSync.mockReturnValue(['post.md'] as string[]);
      mockFs.readFileSync.mockReturnValue('mock content');
      mockMatter.mockReturnValue({
        data: { ...mockBlogPostData, tags: ['React'] },
        content: '',
      } as matter.GrayMatterFile<string>);

      const result = getBlogPostsByTag('Vue', 'en');

      expect(result).toEqual([]);
    });
  });

  describe('getAllTagsWithCounts', () => {
    it('returns tag counts across all locales', () => {
      // Mock different responses for different locale directories
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readdirSync.mockImplementation((dirPath) => {
        const locale = dirPath.toString().split('/').pop();
        if (locale === 'en') return ['post1.md', 'post2.md'] as fs.Dirent[];
        if (locale === 'ja') return ['post3.md'] as fs.Dirent[];
        return [] as fs.Dirent[];
      });
      
      mockFs.readFileSync.mockReturnValue('mock content');
      mockMatter
        .mockReturnValueOnce({ data: { ...mockBlogPostData, tags: ['React', 'TypeScript'] }, content: '' } as matter.GrayMatterFile<string>)
        .mockReturnValueOnce({ data: { ...mockBlogPostData, tags: ['TypeScript', 'Testing'] }, content: '' } as string[])
        .mockReturnValueOnce({ data: { ...mockBlogPostData, tags: ['React'] }, content: '' } as matter.GrayMatterFile<string>);

      const result = getAllTagsWithCounts();

      expect(result).toEqual({
        'React': 2, // appears in en/post1 and ja/post3
        'TypeScript': 2, // appears in en/post1 and en/post2
        'Testing': 1, // appears in en/post2
      });
    });

    it('handles locales with no posts', () => {
      mockFs.existsSync.mockReturnValue(false);

      const result = getAllTagsWithCounts();

      expect(result).toEqual({});
    });
  });

  describe('getAllTagSlugs', () => {
    it('returns encoded tag slugs for all locales', () => {
      // Mock getBlogPosts behavior for different locales
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readdirSync.mockImplementation((dirPath) => {
        const locale = dirPath.toString().split('/').pop();
        if (locale === 'en') return ['post1.md'] as fs.Dirent[];
        return [] as fs.Dirent[];
      });
      
      mockFs.readFileSync.mockReturnValue('mock content');
      mockMatter.mockReturnValue({
        data: { ...mockBlogPostData, tags: ['React Native', 'TypeScript'] },
        content: '',
      } as matter.GrayMatterFile<string>);

      const result = getAllTagSlugs();

      expect(result).toContainEqual({
        params: { tag: 'React%20Native' }, // URL encoded
        locale: 'en',
      });
      expect(result).toContainEqual({
        params: { tag: 'TypeScript' },
        locale: 'en',
      });
    });

    it('handles locales with no tags', () => {
      mockFs.existsSync.mockReturnValue(false);

      const result = getAllTagSlugs();

      expect(result).toEqual([]);
    });
  });
});