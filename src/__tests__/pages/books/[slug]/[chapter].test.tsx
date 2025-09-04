import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GetStaticProps } from 'next';
import BookChapterPage, { getStaticProps, getStaticPaths } from '../../../../pages/books/[slug]/[chapter]';
import { getBook, getBookChapter, getAllBookChapterSlugs } from '../../../../lib/books';

// Mock next/router
const mockPush = jest.fn();
jest.mock('next/router', () => ({
  useRouter: () => ({
    locale: 'en',
    locales: ['en', 'ja', 'ko', 'zh', 'es', 'fr'],
    asPath: '/books/test-book/test-chapter',
    push: mockPush,
  }),
}));

// Mock next-i18next
jest.mock('next-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: { [key: string]: string } = {
        'meta.title': 'Test Chapter - Test Book - Shun Kushigami',
        'books.title': 'Books',
        'books.backToList': 'Back to Books',
        'books.tableOfContents': 'Table of Contents',
        'books.chapter': 'Chapter',
        'books.previous': 'Previous',
        'books.next': 'Next',
        'books.chapterNotFound': 'Chapter not found',
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

// Mock Lucide React icons
jest.mock('lucide-react', () => ({
  BookOpen: () => <div data-testid="book-open-icon">BookOpen</div>,
  ChevronDown: () => <div data-testid="chevron-down-icon">ChevronDown</div>,
  ChevronLeft: () => <div data-testid="chevron-left-icon">ChevronLeft</div>,
  ChevronRight: () => <div data-testid="chevron-right-icon">ChevronRight</div>,
  Home: () => <div data-testid="home-icon">Home</div>,
  Menu: () => <div data-testid="menu-icon">Menu</div>,
  X: () => <div data-testid="x-icon">X</div>,
  FileText: () => <div data-testid="file-text-icon">FileText</div>,
}));

// Mock books functions
jest.mock('../../../../lib/books', () => ({
  getBook: jest.fn(),
  getBookChapter: jest.fn(),
  getAllBookChapterSlugs: jest.fn(),
}));

const mockBook = {
  slug: 'test-book',
  title: 'Test Book Title',
  subtitle: 'Test Book Subtitle',
  author: 'Shun Kushigami',
  description: 'This is a test book description.',
  publishedDate: '2024-08-31',
  updatedDate: '2024-09-01',
  tags: ['React', 'TypeScript'],
  coverImage: '/images/books/test-book.png',
  chapters: [
    {
      slug: 'introduction',
      title: 'Introduction',
      content: '<h1>Introduction</h1><p>Welcome to the book.</p>',
    },
    {
      slug: 'chapter-1',
      title: 'Chapter 1: Getting Started',
      content: '<h1>Chapter 1: Getting Started</h1><p>Let\'s begin our journey.</p>',
    },
    {
      slug: 'chapter-2',
      title: 'Chapter 2: Advanced Topics',
      content: '<h1>Chapter 2: Advanced Topics</h1><p>Now for the advanced stuff.</p>',
    },
  ],
};

const mockChapter = {
  slug: 'chapter-1',
  title: 'Chapter 1: Getting Started',
  content: '<h1>Chapter 1: Getting Started</h1><p>Let\'s begin our journey with some <strong>important</strong> concepts.</p><ul><li>First concept</li><li>Second concept</li></ul>',
};

describe('BookChapterPage', () => {
  beforeEach(() => {
    (getBook as jest.Mock).mockReturnValue(mockBook);
    (getBookChapter as jest.Mock).mockReturnValue(mockChapter);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the chapter content', () => {
    render(<BookChapterPage book={mockBook} chapter={mockChapter} currentChapterIndex={1} />);
    
    // Chapter content should be rendered (with first h1 hidden via CSS)
    expect(screen.getByText(/Let\'s begin our journey with some/)).toBeInTheDocument();
    expect(screen.getByText('important')).toBeInTheDocument();
    expect(screen.getByText('First concept')).toBeInTheDocument();
    expect(screen.getByText('Second concept')).toBeInTheDocument();
  });

  it('renders chapter navigation info', () => {
    render(<BookChapterPage book={mockBook} chapter={mockChapter} currentChapterIndex={1} />);
    
    expect(screen.getByText('Chapter 2')).toBeInTheDocument();
    expect(screen.getAllByText('Test Book Title')[0]).toBeInTheDocument();
  });

  it('renders table of contents sidebar', () => {
    render(<BookChapterPage book={mockBook} chapter={mockChapter} currentChapterIndex={1} />);
    
    expect(screen.getByText('Table of Contents')).toBeInTheDocument();
    expect(screen.getAllByText('Introduction')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Chapter 1: Getting Started')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Chapter 2: Advanced Topics')[0]).toBeInTheDocument();
  });

  it('highlights current chapter in table of contents', () => {
    render(<BookChapterPage book={mockBook} chapter={mockChapter} currentChapterIndex={1} />);
    
    const currentChapterLink = screen.getAllByRole('link', { name: '02 Chapter 1: Getting Started' })[0];
    expect(currentChapterLink).toHaveClass('bg-blue-50', 'text-blue-700', 'font-medium');
  });

  it('renders chapter links correctly', () => {
    render(<BookChapterPage book={mockBook} chapter={mockChapter} currentChapterIndex={1} />);
    
    const introLink = screen.getAllByRole('link', { name: '01 Introduction' })[0];
    const chapter2Link = screen.getAllByRole('link', { name: '03 Chapter 2: Advanced Topics' })[0];
    
    expect(introLink).toHaveAttribute('href', '/books/test-book/introduction');
    expect(chapter2Link).toHaveAttribute('href', '/books/test-book/chapter-2');
  });

  it('renders previous/next navigation', () => {
    render(<BookChapterPage book={mockBook} chapter={mockChapter} currentChapterIndex={1} />);
    
    const prevLink = screen.getAllByText('Introduction')[0];
    const nextLink = screen.getAllByText('Chapter 2: Advanced Topics')[0];
    
    expect(prevLink).toBeInTheDocument();
    expect(nextLink).toBeInTheDocument();
  });

  it('handles first chapter (no previous)', () => {
    const firstChapter = mockBook.chapters[0];
    render(<BookChapterPage book={mockBook} chapter={firstChapter} currentChapterIndex={0} />);
    
    // Should not have previous link
    expect(screen.queryByText('Previous')).not.toBeInTheDocument();
    // Should have next link
    expect(screen.getAllByText('Chapter 1: Getting Started')[0]).toBeInTheDocument();
  });

  it('handles last chapter (no next)', () => {
    const lastChapter = mockBook.chapters[2];
    render(<BookChapterPage book={mockBook} chapter={lastChapter} currentChapterIndex={2} />);
    
    // Should have previous link
    expect(screen.getAllByText('Chapter 1: Getting Started')[0]).toBeInTheDocument();
    // Should not have next link
    expect(screen.queryByText('Next')).not.toBeInTheDocument();
  });

  it('opens and closes mobile sidebar', async () => {
    const user = userEvent.setup();
    render(<BookChapterPage book={mockBook} chapter={mockChapter} currentChapterIndex={1} />);
    
    // Find and click menu button
    const menuButton = screen.getByTestId('menu-icon').parentElement;
    expect(menuButton).toBeInTheDocument();
    
    await user.click(menuButton!);
    
    // Sidebar should be visible (check for close button)
    expect(screen.getByTestId('x-icon')).toBeInTheDocument();
    
    // Click close button
    const closeButton = screen.getByTestId('x-icon').parentElement;
    await user.click(closeButton!);
  });

  it('renders breadcrumb navigation', () => {
    render(<BookChapterPage book={mockBook} chapter={mockChapter} currentChapterIndex={1} />);
    
    expect(screen.getByTestId('home-icon')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Books' })).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: 'Test Book Title' })[0]).toBeInTheDocument();
    expect(screen.getAllByText('Chapter 1: Getting Started')[0]).toBeInTheDocument();
  });

  it('renders language switcher', () => {
    render(<BookChapterPage book={mockBook} chapter={mockChapter} currentChapterIndex={1} />);
    
    const languageButton = screen.getByRole('button', { name: /🇺🇸/ });
    expect(languageButton).toBeInTheDocument();
    expect(languageButton).toHaveTextContent('English');
  });

  it('opens language dropdown', async () => {
    const user = userEvent.setup();
    render(<BookChapterPage book={mockBook} chapter={mockChapter} currentChapterIndex={1} />);
    
    const languageButton = screen.getByRole('button', { name: /🇺🇸/ });
    await user.click(languageButton);
    
    expect(screen.getByText('日本語')).toBeInTheDocument();
    expect(screen.getByText('한국어')).toBeInTheDocument();
    expect(screen.getByText('中文')).toBeInTheDocument();
    expect(screen.getByText('Español')).toBeInTheDocument();
    expect(screen.getByText('Français')).toBeInTheDocument();
  });

  it('handles chapter not found state', () => {
    render(<BookChapterPage book={null} chapter={null} currentChapterIndex={0} />);
    
    expect(screen.getByText('Chapter not found')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /back to books/i })).toBeInTheDocument();
  });

  it('has proper semantic structure', () => {
    render(<BookChapterPage book={mockBook} chapter={mockChapter} currentChapterIndex={1} />);
    
    expect(screen.getAllByRole('banner')[0]).toBeInTheDocument(); // header
    expect(screen.getByRole('main')).toBeInTheDocument();   // main content
    expect(screen.getByRole('article')).toBeInTheDocument(); // article
    expect(screen.getByRole('complementary')).toBeInTheDocument(); // sidebar
  });

  it('renders chapter numbers in sidebar', () => {
    render(<BookChapterPage book={mockBook} chapter={mockChapter} currentChapterIndex={1} />);
    
    expect(screen.getByText('01')).toBeInTheDocument();
    expect(screen.getByText('02')).toBeInTheDocument();
    expect(screen.getByText('03')).toBeInTheDocument();
  });

  it('renders mobile book title in header', () => {
    render(<BookChapterPage book={mockBook} chapter={mockChapter} currentChapterIndex={1} />);
    
    // Should show book title and chapter title on mobile
    const mobileBookTitle = screen.getAllByText('Test Book Title')[0]; // First occurrence is mobile
    const mobileChapterTitle = screen.getAllByText('Chapter 1: Getting Started')[0];
    
    expect(mobileBookTitle).toBeInTheDocument();
    expect(mobileChapterTitle).toBeInTheDocument();
  });
});

describe('BookChapterPage getStaticProps', () => {
  beforeEach(() => {
    (getBook as jest.Mock).mockReturnValue(mockBook);
    (getBookChapter as jest.Mock).mockReturnValue(mockChapter);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns book and chapter data for valid slugs', async () => {
    const context = {
      params: { slug: 'test-book', chapter: 'chapter-1' },
      locale: 'en',
    };

    const result = await getStaticProps(context as Parameters<GetStaticProps>[0]);

    expect(result).toEqual({
      props: {
        book: mockBook,
        chapter: mockChapter,
        currentChapterIndex: 1,
        _nextI18Next: {
          initialI18nStore: {},
          initialLocale: 'en',
        },
      },
      revalidate: 60,
    });

    expect(getBook).toHaveBeenCalledWith('test-book', 'en');
    expect(getBookChapter).toHaveBeenCalledWith('test-book', 'chapter-1', 'en');
  });

  it('returns 404 for invalid book slug', async () => {
    (getBook as jest.Mock).mockReturnValue(null);
    
    const context = {
      params: { slug: 'invalid-book', chapter: 'chapter-1' },
      locale: 'en',
    };

    const result = await getStaticProps(context as Parameters<GetStaticProps>[0]);

    expect(result).toEqual({
      notFound: true,
    });
  });

  it('returns 404 for invalid chapter slug', async () => {
    (getBookChapter as jest.Mock).mockReturnValue(null);
    
    const context = {
      params: { slug: 'test-book', chapter: 'invalid-chapter' },
      locale: 'en',
    };

    const result = await getStaticProps(context as Parameters<GetStaticProps>[0]);

    expect(result).toEqual({
      notFound: true,
    });
  });

  it('defaults to English locale when none provided', async () => {
    const context = {
      params: { slug: 'test-book', chapter: 'chapter-1' },
    };

    await getStaticProps(context as Parameters<GetStaticProps>[0]);

    expect(getBook).toHaveBeenCalledWith('test-book', 'en');
    expect(getBookChapter).toHaveBeenCalledWith('test-book', 'chapter-1', 'en');
  });

  it('calculates current chapter index correctly', async () => {
    const context = {
      params: { slug: 'test-book', chapter: 'introduction' },
      locale: 'en',
    };

    const introChapter = mockBook.chapters[0];
    (getBookChapter as jest.Mock).mockReturnValue(introChapter);

    const result = await getStaticProps(context as Parameters<GetStaticProps>[0]);

    expect(result.props.currentChapterIndex).toBe(0);
  });
});

describe('BookChapterPage getStaticPaths', () => {
  const mockChapterSlugs = [
    { params: { bookSlug: 'book-1', chapterSlug: 'intro' }, locale: 'en' },
    { params: { bookSlug: 'book-1', chapterSlug: 'chapter-1' }, locale: 'en' },
    { params: { bookSlug: 'book-2', chapterSlug: 'intro' }, locale: 'ja' },
  ];

  beforeEach(() => {
    (getAllBookChapterSlugs as jest.Mock).mockReturnValue(mockChapterSlugs);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns all chapter paths for static generation', async () => {
    const result = await getStaticPaths({});

    expect(result).toEqual({
      paths: [
        { params: { slug: 'book-1', chapter: 'intro' }, locale: 'en' },
        { params: { slug: 'book-1', chapter: 'chapter-1' }, locale: 'en' },
        { params: { slug: 'book-2', chapter: 'intro' }, locale: 'ja' },
      ],
      fallback: true,
    });

    expect(getAllBookChapterSlugs).toHaveBeenCalled();
  });

  it('handles empty paths list', async () => {
    (getAllBookChapterSlugs as jest.Mock).mockReturnValue([]);
    
    const result = await getStaticPaths({});

    expect(result).toEqual({
      paths: [],
      fallback: true,
    });
  });
});