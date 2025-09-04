import { render, screen } from '@testing-library/react';
import { GetStaticProps } from 'next';
import TagPage, { getStaticProps, getStaticPaths } from '../../../../pages/blog/tag/[tag]';
import { getBlogPostsByTag, getAllTagSlugs } from '../../../../lib/blog';

// Mock next/router
jest.mock('next/router', () => ({
  useRouter: () => ({
    locale: 'en',
    locales: ['en', 'ja', 'ko', 'zh', 'es', 'fr'],
    asPath: '/blog/tag/react',
  }),
}));

// Mock next-i18next
jest.mock('next-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: { [key: string]: unknown }) => {
      const translations: { [key: string]: string } = {
        'tagPageTitle': `Posts tagged with ${options?.tag}`,
        'tagPageDescription': `${options?.count} posts tagged with ${options?.tag}`,
        'backToBlog': 'Back to Blog',
        'postsTaggedWith': 'Posts tagged with',
        'postsFound': `${options?.count} posts found`,
        'noPostsFound': 'No posts found for this tag',
        'by': 'by',
        'updated': 'Updated',
      };
      return translations[key] || key;
    },
  }),
}));

// Mock next-i18next/serverSideTranslations
jest.mock('next-i18next/serverSideTranslations', () => ({
  serverSideTranslations: jest.fn().mockResolvedValue({
    _nextI18Next: {
      initialI18nStore: {},
      initialLocale: 'en',
    },
  }),
}));

// Mock Link component
jest.mock('next/link', () => {
  const MockedLink = ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => {
    return <a href={href} {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}>{children}</a>;
  };
  MockedLink.displayName = 'MockedLink';
  return MockedLink;
});

// Mock Head component
jest.mock('next/head', () => {
  const MockedHead = ({ children }: { children: React.ReactNode }) => {
    return <>{children}</>;
  };
  MockedHead.displayName = 'MockedHead';
  return MockedHead;
});

// Mock blog functions
jest.mock('../../../../lib/blog', () => ({
  getBlogPostsByTag: jest.fn(),
  getAllTagSlugs: jest.fn(),
}));

const mockPosts = [
  {
    slug: 'react-basics',
    title: 'React Basics Tutorial',
    date: '2024-01-15',
    updatedDate: '2024-01-20',
    excerpt: 'Learn the fundamentals of React development.',
    tags: ['React', 'JavaScript', 'Tutorial'],
    author: 'Test Author',
    locale: 'en',
  },
  {
    slug: 'advanced-react',
    title: 'Advanced React Patterns',
    date: '2024-02-10',
    excerpt: 'Master advanced React patterns and techniques.',
    tags: ['React', 'Advanced', 'Patterns'],
    author: 'Test Author',
    locale: 'en',
  },
];

describe('TagPage', () => {
  beforeEach(() => {
    (getBlogPostsByTag as jest.Mock).mockReturnValue(mockPosts);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders tag page with posts', () => {
    render(<TagPage posts={mockPosts} tag="React" />);
    
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByText('Posts tagged with:')).toBeInTheDocument();
    expect(screen.getAllByText('#React')).toHaveLength(3); // One in header, two in post tags
    expect(screen.getByText('2 posts found')).toBeInTheDocument();
  });

  it('renders all posts for the tag', () => {
    render(<TagPage posts={mockPosts} tag="React" />);
    
    expect(screen.getByText('React Basics Tutorial')).toBeInTheDocument();
    expect(screen.getByText('Advanced React Patterns')).toBeInTheDocument();
    expect(screen.getByText('Learn the fundamentals of React development.')).toBeInTheDocument();
    expect(screen.getByText('Master advanced React patterns and techniques.')).toBeInTheDocument();
  });

  it('renders post metadata correctly', () => {
    render(<TagPage posts={mockPosts} tag="React" />);
    
    // Check dates - they should be formatted
    expect(screen.getByText('January 15, 2024')).toBeInTheDocument();
    expect(screen.getByText('February 10, 2024')).toBeInTheDocument();
    
    // Check updated date
    expect(screen.getByText('(Updated: January 20, 2024)')).toBeInTheDocument();
    
    // Check authors
    expect(screen.getAllByText('by Test Author')).toHaveLength(2);
  });

  it('renders post tags with current tag highlighted', () => {
    render(<TagPage posts={mockPosts} tag="React" />);
    
    // Current tag should be highlighted
    const reactTags = screen.getAllByText('#React');
    expect(reactTags.length).toBeGreaterThan(0);
    
    // Other tags should also be present
    expect(screen.getByText('#JavaScript')).toBeInTheDocument();
    expect(screen.getByText('#Tutorial')).toBeInTheDocument();
    expect(screen.getByText('#Advanced')).toBeInTheDocument();
    expect(screen.getByText('#Patterns')).toBeInTheDocument();
  });

  it('renders post title links correctly', () => {
    render(<TagPage posts={mockPosts} tag="React" />);
    
    const titleLinks = screen.getAllByRole('link');
    const postLinks = titleLinks.filter(link => 
      link.getAttribute('href')?.includes('/blog/') && 
      !link.getAttribute('href')?.includes('/tag/')
    );
    
    expect(postLinks).toHaveLength(2);
    expect(postLinks[0]).toHaveAttribute('href', '/blog/react-basics');
    expect(postLinks[1]).toHaveAttribute('href', '/blog/advanced-react');
  });

  it('renders tag links correctly', () => {
    render(<TagPage posts={mockPosts} tag="React" />);
    
    const tagLinks = screen.getAllByRole('link').filter(link => 
      link.getAttribute('href')?.includes('/blog/tag/')
    );
    
    expect(tagLinks.length).toBeGreaterThan(0);
    
    // Check specific tag links
    const jsTagLink = tagLinks.find(link => link.textContent === '#JavaScript');
    expect(jsTagLink).toHaveAttribute('href', '/blog/tag/JavaScript');
  });

  it('renders back to blog link', () => {
    render(<TagPage posts={mockPosts} tag="React" />);
    
    const backLink = screen.getByRole('link', { name: /back to blog/i });
    expect(backLink).toBeInTheDocument();
    expect(backLink).toHaveAttribute('href', '/blog');
  });

  it('handles empty posts array', () => {
    render(<TagPage posts={[]} tag="EmptyTag" />);
    
    expect(screen.getByText('Posts tagged with:')).toBeInTheDocument();
    expect(screen.getByText('#EmptyTag')).toBeInTheDocument();
    expect(screen.getByText('0 posts found')).toBeInTheDocument();
    expect(screen.getByText('No posts found for this tag')).toBeInTheDocument();
  });

  it('handles posts without optional fields', () => {
    const minimalPosts = [
      {
        slug: 'minimal-post',
        title: 'Minimal Post',
        date: '2024-01-01',
        excerpt: 'A minimal post without optional fields.',
        locale: 'en',
      },
    ];
    
    render(<TagPage posts={minimalPosts} tag="Minimal" />);
    
    expect(screen.getByText('Minimal Post')).toBeInTheDocument();
    expect(screen.getByText('A minimal post without optional fields.')).toBeInTheDocument();
    expect(screen.getByText('January 1, 2024')).toBeInTheDocument();
    
    // Should not show author or updated date
    expect(screen.queryByText(/by /)).not.toBeInTheDocument();
    expect(screen.queryByText(/Updated:/)).not.toBeInTheDocument();
  });

  it('handles posts with tags but no current tag', () => {
    const postsWithoutCurrentTag = [
      {
        slug: 'other-post',
        title: 'Other Post',
        date: '2024-01-01',
        excerpt: 'A post with other tags.',
        tags: ['Vue', 'JavaScript'],
        locale: 'en',
      },
    ];
    
    render(<TagPage posts={postsWithoutCurrentTag} tag="React" />);
    
    expect(screen.getByText('Other Post')).toBeInTheDocument();
    expect(screen.getByText('#Vue')).toBeInTheDocument();
    expect(screen.getByText('#JavaScript')).toBeInTheDocument();
  });

  it('formats dates according to locale', () => {
    render(<TagPage posts={mockPosts} tag="React" />);
    
    // Dates should be formatted in English locale format
    expect(screen.getByText('January 15, 2024')).toBeInTheDocument();
    expect(screen.getByText('February 10, 2024')).toBeInTheDocument();
  });

  it('handles posts with same date and updated date', () => {
    const postsWithSameDate = [
      {
        slug: 'same-date-post',
        title: 'Same Date Post',
        date: '2024-01-01',
        updatedDate: '2024-01-01',
        excerpt: 'A post where date and updated date are the same.',
        tags: ['Test'],
        locale: 'en',
      },
    ];
    
    render(<TagPage posts={postsWithSameDate} tag="Test" />);
    
    // Updated date should not be shown when it's the same as published date
    expect(screen.queryByText(/Updated:/)).not.toBeInTheDocument();
  });
});

describe('TagPage getStaticPaths', () => {
  const mockTagSlugs = [
    { params: { tag: 'react' }, locale: 'en' },
    { params: { tag: 'vue' }, locale: 'en' },
    { params: { tag: 'javascript' }, locale: 'ja' },
  ];

  beforeEach(() => {
    (getAllTagSlugs as jest.Mock).mockReturnValue(mockTagSlugs);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns all tag slugs for static generation', async () => {
    const result = await getStaticPaths({});

    expect(result).toEqual({
      paths: mockTagSlugs,
      fallback: 'blocking',
    });

    expect(getAllTagSlugs).toHaveBeenCalled();
  });

  it('handles empty tag slugs', async () => {
    (getAllTagSlugs as jest.Mock).mockReturnValue([]);
    
    const result = await getStaticPaths({});

    expect(result).toEqual({
      paths: [],
      fallback: 'blocking',
    });
  });
});

describe('TagPage getStaticProps', () => {
  beforeEach(() => {
    (getBlogPostsByTag as jest.Mock).mockReturnValue(mockPosts);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns posts and tag for valid tag', async () => {
    const context = {
      params: { tag: 'react' },
      locale: 'en',
    };

    const result = await getStaticProps(context as Parameters<GetStaticProps>[0]);

    expect(result).toEqual({
      props: {
        posts: mockPosts,
        tag: 'react',
        _nextI18Next: {
          initialI18nStore: {},
          initialLocale: 'en',
        },
      },
    });

    expect(getBlogPostsByTag).toHaveBeenCalledWith('react', 'en');
  });

  it('returns 404 when no posts found for tag', async () => {
    (getBlogPostsByTag as jest.Mock).mockReturnValue([]);
    
    const context = {
      params: { tag: 'nonexistent' },
      locale: 'en',
    };

    const result = await getStaticProps(context as Parameters<GetStaticProps>[0]);

    expect(result).toEqual({
      notFound: true,
    });
  });

  it('handles URL-encoded tag names', async () => {
    const context = {
      params: { tag: 'C%2B%2B' }, // C++ encoded
      locale: 'en',
    };

    await getStaticProps(context as Parameters<GetStaticProps>[0]);

    expect(getBlogPostsByTag).toHaveBeenCalledWith('C++', 'en');
  });

  it('handles different locales correctly', async () => {
    const context = {
      params: { tag: 'react' },
      locale: 'ja',
    };

    await getStaticProps(context as Parameters<GetStaticProps>[0]);

    expect(getBlogPostsByTag).toHaveBeenCalledWith('react', 'ja');
  });

  it('handles missing locale parameter', async () => {
    const context = {
      params: { tag: 'react' },
      // locale is undefined
    };

    await getStaticProps(context as Parameters<GetStaticProps>[0]);

    expect(getBlogPostsByTag).toHaveBeenCalledWith('react', undefined);
  });
});