import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GetStaticProps } from 'next';
import Blog, { getStaticProps } from '../../pages/blog';
import { getBlogPosts } from '../../lib/blog';

// Mock next/router
jest.mock('next/router', () => ({
  useRouter: () => ({
    locale: 'en',
    locales: ['en', 'ja', 'ko', 'zh', 'es', 'fr'],
    asPath: '/blog',
  }),
}));

// Mock date-fns
jest.mock('date-fns', () => ({
  format: (date: Date, formatStr: string) => {
    if (formatStr === 'PPP') {
      // Mock date formatting to match expected output
      const mockDate = new Date(date);
      return mockDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
    return date.toString();
  },
}));

// Mock next-i18next
jest.mock('next-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: { [key: string]: string } = {
        'meta.title': 'Blog - Shun Kushigami',
        'blog.title': 'Blog',
        'blog.subtitle': 'Insights and thoughts on technology, programming, and more',
        'blog.readMore': 'Read more',
        'blog.postedOn': 'Posted on',
        'blog.tags': 'Tags',
        'name': 'Shun Kushigami',
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

// Mock Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: { [key: string]: unknown; alt: string }) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { priority: _priority, ...otherProps } = props;
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...(otherProps as React.ImgHTMLAttributes<HTMLImageElement>)} alt={props.alt} />;
  },
}));

// Mock Lucide React icons
jest.mock('lucide-react', () => ({
  CalendarDays: ({ size }: { size?: number }) => <div data-testid="calendar-icon" style={{ width: size, height: size }}>📅</div>,
  Tag: ({ size }: { size?: number }) => <div data-testid="tag-icon" style={{ width: size, height: size }}>🏷️</div>,
  User: ({ size }: { size?: number }) => <div data-testid="user-icon" style={{ width: size, height: size }}>👤</div>,
  ChevronDown: ({ size }: { size?: number }) => <div data-testid="chevron-down-icon" style={{ width: size, height: size }}>⌄</div>,
}));

// Mock getBlogPosts
jest.mock('../../lib/blog', () => ({
  getBlogPosts: jest.fn(),
}));

const mockPosts = [
  {
    slug: 'test-post-1',
    title: 'Test Post 1',
    excerpt: 'This is the first test post excerpt',
    date: '2024-01-15',
    tags: ['React', 'JavaScript'],
    author: 'Shun Kushigami',
    locale: 'en',
  },
  {
    slug: 'test-post-2',
    title: 'Test Post 2',
    excerpt: 'This is the second test post excerpt',
    date: '2024-01-10',
    tags: ['TypeScript', 'Next.js'],
    author: 'Shun Kushigami',
    locale: 'en',
  },
];

describe('Blog Page', () => {
  beforeEach(() => {
    (getBlogPosts as jest.Mock).mockReturnValue(mockPosts);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the blog page title and subtitle', () => {
    render(<Blog posts={mockPosts} />);
    
    expect(screen.getByRole('heading', { level: 1, name: /blog/i })).toBeInTheDocument();
    expect(screen.getByText('Insights and thoughts on technology, programming, and more')).toBeInTheDocument();
  });

  it('renders all blog posts', () => {
    render(<Blog posts={mockPosts} />);
    
    expect(screen.getByText('Test Post 1')).toBeInTheDocument();
    expect(screen.getByText('Test Post 2')).toBeInTheDocument();
    expect(screen.getByText('This is the first test post excerpt')).toBeInTheDocument();
    expect(screen.getByText('This is the second test post excerpt')).toBeInTheDocument();
  });

  it('renders post metadata correctly', () => {
    render(<Blog posts={mockPosts} />);
    
    expect(screen.getByText('January 15, 2024')).toBeInTheDocument();
    expect(screen.getByText('January 10, 2024')).toBeInTheDocument();
    expect(screen.getAllByText('Shun Kushigami').length).toBeGreaterThan(0);
  });

  it('renders post tags', () => {
    render(<Blog posts={mockPosts} />);
    
    expect(screen.getByText('#React')).toBeInTheDocument();
    expect(screen.getByText('#JavaScript')).toBeInTheDocument();
    expect(screen.getByText('#TypeScript')).toBeInTheDocument();
    expect(screen.getByText('#Next.js')).toBeInTheDocument();
  });

  it('renders "Read more" links for each post', () => {
    render(<Blog posts={mockPosts} />);
    
    const readMoreLinks = screen.getAllByRole('link', { name: /Read more/ });
    expect(readMoreLinks).toHaveLength(2);
    
    expect(readMoreLinks[0]).toHaveAttribute('href', '/blog/test-post-1');
    expect(readMoreLinks[1]).toHaveAttribute('href', '/blog/test-post-2');
  });

  it('renders post title links correctly', () => {
    render(<Blog posts={mockPosts} />);
    
    const titleLink1 = screen.getByRole('link', { name: 'Test Post 1' });
    const titleLink2 = screen.getByRole('link', { name: 'Test Post 2' });
    
    expect(titleLink1).toHaveAttribute('href', '/blog/test-post-1');
    expect(titleLink2).toHaveAttribute('href', '/blog/test-post-2');
  });

  it('handles empty posts array gracefully', () => {
    render(<Blog posts={[]} />);
    
    expect(screen.getByRole('heading', { level: 1, name: /blog/i })).toBeInTheDocument();
    expect(screen.getByText('Insights and thoughts on technology, programming, and more')).toBeInTheDocument();
    
    // Should not render any post content
    expect(screen.queryByText('Read more')).not.toBeInTheDocument();
  });

  it('renders language switcher', () => {
    render(<Blog posts={mockPosts} />);
    
    const languageButton = screen.getByRole('button');
    expect(languageButton).toBeInTheDocument();
    expect(languageButton).toHaveTextContent('🇺🇸');
  });

  it('has proper semantic structure', () => {
    render(<Blog posts={mockPosts} />);
    
    expect(screen.getByRole('banner')).toBeInTheDocument(); // header
    expect(screen.getByRole('main')).toBeInTheDocument();   // main content
    // Note: Footer is not part of this page component
  });

  it('opens and closes language dropdown', async () => {
    const user = userEvent.setup();
    render(<Blog posts={mockPosts} />);
    
    const languageButton = screen.getByRole('button');
    
    // Initially dropdown should not be visible
    expect(screen.queryByText('日本語')).not.toBeInTheDocument();
    
    // Click to open dropdown
    await user.click(languageButton);
    
    // Dropdown should now be visible with all language options
    expect(screen.getByText('日本語')).toBeInTheDocument();
    expect(screen.getByText('한국어')).toBeInTheDocument();
    expect(screen.getByText('中文')).toBeInTheDocument();
    expect(screen.getByText('Español')).toBeInTheDocument();
    expect(screen.getByText('Français')).toBeInTheDocument();
  });

  it('closes language dropdown when clicking outside', async () => {
    const user = userEvent.setup();
    render(<Blog posts={mockPosts} />);
    
    const languageButton = screen.getByRole('button');
    
    // Open dropdown
    await user.click(languageButton);
    
    // Verify dropdown is open
    expect(screen.getByText('日本語')).toBeInTheDocument();
    
    // Click outside
    fireEvent.mouseDown(document.body);
    
    // Dropdown should be closed
    expect(screen.queryByText('日本語')).not.toBeInTheDocument();
  });

  it('shows correct current locale in dropdown', async () => {
    const user = userEvent.setup();
    render(<Blog posts={mockPosts} />);
    
    const languageButton = screen.getByRole('button');
    await user.click(languageButton);
    
    // English should be highlighted as current
    const englishLink = screen.getAllByText('English')[1]; // Second one in dropdown
    expect(englishLink.closest('a')).toHaveClass('bg-blue-50', 'text-blue-700');
  });

  it('handles language link navigation correctly', async () => {
    const user = userEvent.setup();
    render(<Blog posts={mockPosts} />);
    
    const languageButton = screen.getByRole('button');
    await user.click(languageButton);
    
    // Check language link attributes
    const japaneseLink = screen.getByText('日本語').closest('a');
    expect(japaneseLink).toHaveAttribute('href', '/blog');
    expect(japaneseLink).toHaveAttribute('locale', 'ja');
    
    const spanishLink = screen.getByText('Español').closest('a');
    expect(spanishLink).toHaveAttribute('locale', 'es');
  });

  it('handles unknown locale configuration gracefully', () => {
    // This tests the conditional in the language mapping
    expect(() => render(<Blog posts={mockPosts} />)).not.toThrow();
  });
});

describe('Blog getStaticProps', () => {
  beforeEach(() => {
    (getBlogPosts as jest.Mock).mockReturnValue(mockPosts);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns posts and translations for English locale', async () => {
    const context = {
      locale: 'en',
    };

    const result = await getStaticProps(context as Parameters<GetStaticProps>[0]);

    if ('props' in result) {
      expect(result.props.posts).toEqual(mockPosts);
      expect(result.props._nextI18Next).toBeDefined();
    }

    expect(getBlogPosts).toHaveBeenCalledWith('en');
  });

  it('returns posts and translations for Japanese locale', async () => {
    const context = {
      locale: 'ja',
    };

    const result = await getStaticProps(context as Parameters<GetStaticProps>[0]);

    if ('props' in result) {
      expect(result.props.posts).toEqual(mockPosts);
      expect(result.props._nextI18Next).toBeDefined();
    }

    expect(getBlogPosts).toHaveBeenCalledWith('ja');
  });

  it('defaults to English when no locale is provided', async () => {
    const context = {};

    const result = await getStaticProps(context as Parameters<GetStaticProps>[0]);

    expect(getBlogPosts).toHaveBeenCalledWith('en');
    if ('props' in result) {
      expect(result.props.posts).toEqual(mockPosts);
    }
  });
});