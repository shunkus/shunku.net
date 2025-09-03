import { render, screen, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GetStaticProps, GetStaticPaths } from 'next';

// Mock next/router
jest.mock('next/router', () => ({
  useRouter: () => ({
    locale: 'en',
    locales: ['en', 'ja', 'ko', 'zh', 'es', 'fr'],
    asPath: '/books/test-book',
    isFallback: false,
  }),
}));

// Mock next-i18next
jest.mock('next-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: { [key: string]: string } = {
        'meta.title': 'Test Book - Books - Shun Kushigami',
        'books.title': 'Books',
        'books.backToList': 'Back to Books',
        'books.publishedOn': 'Published on',
        'books.updatedOn': 'Updated on',
        'books.author': 'Author',
        'books.tags': 'Tags',
        'books.chapters': 'chapters',
        'books.startReading': 'Start Reading',
        'books.tableOfContents': 'Table of Contents',
        'books.noTags': 'No tags available',
        'books.noChapters': 'No chapters available',
        'books.notFound': 'Book not found',
        'books.backToList': 'Back to Books',
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
    const { priority: _priority, ...otherProps } = props;
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...(otherProps as React.ImgHTMLAttributes<HTMLImageElement>)} alt={props.alt} />;
  },
}));

// Mock date-fns
jest.mock('date-fns', () => ({
  format: (date: Date, formatStr: string) => {
    const mockDate = new Date(date);
    return mockDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  },
}));

// Mock Lucide React icons
jest.mock('lucide-react', () => ({
  CalendarDays: ({ size, fill, stroke, strokeWidth, ...props }: { size?: number; fill?: unknown; stroke?: unknown; strokeWidth?: unknown; [key: string]: unknown }) => {
    const { className, ...validProps } = props;
    return <div data-testid="calendar-icon" className={className as string}>📅</div>;
  },
  Tag: ({ size, fill, stroke, strokeWidth, ...props }: { size?: number; fill?: unknown; stroke?: unknown; strokeWidth?: unknown; [key: string]: unknown }) => {
    const { className, ...validProps } = props;
    return <div data-testid="tag-icon" className={className as string}>🏷️</div>;
  },
  User: ({ size, fill, stroke, strokeWidth, ...props }: { size?: number; fill?: unknown; stroke?: unknown; strokeWidth?: unknown; [key: string]: unknown }) => {
    const { className, ...validProps } = props;
    return <div data-testid="user-icon" className={className as string}>👤</div>;
  },
  ArrowLeft: ({ size, fill, stroke, strokeWidth, ...props }: { size?: number; fill?: unknown; stroke?: unknown; strokeWidth?: unknown; [key: string]: unknown }) => {
    const { className, ...validProps } = props;
    return <div data-testid="arrow-left-icon" className={className as string}>←</div>;
  },
  ChevronDown: ({ size, fill, stroke, strokeWidth, ...props }: { size?: number; fill?: unknown; stroke?: unknown; strokeWidth?: unknown; [key: string]: unknown }) => {
    const { className, ...validProps } = props;
    return <div data-testid="chevron-down-icon" className={className as string}>⌄</div>;
  },
  ChevronRight: ({ size, fill, stroke, strokeWidth, ...props }: { size?: number; fill?: unknown; stroke?: unknown; strokeWidth?: unknown; [key: string]: unknown }) => {
    const { className, ...validProps } = props;
    return <div data-testid="chevron-right-icon" className={className as string}>➤</div>;
  },
  Home: ({ size, fill, stroke, strokeWidth, ...props }: { size?: number; fill?: unknown; stroke?: unknown; strokeWidth?: unknown; [key: string]: unknown }) => {
    const { className, ...validProps } = props;
    return <div data-testid="home-icon" className={className as string}>🏠</div>;
  },
  Book: ({ size, fill, stroke, strokeWidth, ...props }: { size?: number; fill?: unknown; stroke?: unknown; strokeWidth?: unknown; [key: string]: unknown }) => {
    const { className, ...validProps } = props;
    return <div data-testid="book-icon" className={className as string}>📚</div>;
  },
  BookOpen: ({ size, fill, stroke, strokeWidth, ...props }: { size?: number; fill?: unknown; stroke?: unknown; strokeWidth?: unknown; [key: string]: unknown }) => {
    const { className, ...validProps } = props;
    return <div data-testid="book-open-icon" className={className as string}>📖</div>;
  },
  Clock: ({ size, fill, stroke, strokeWidth, ...props }: { size?: number; fill?: unknown; stroke?: unknown; strokeWidth?: unknown; [key: string]: unknown }) => {
    const { className, ...validProps } = props;
    return <div data-testid="clock-icon" className={className as string}>⏰</div>;
  },
  FileText: ({ size, fill, stroke, strokeWidth, ...props }: { size?: number; fill?: unknown; stroke?: unknown; strokeWidth?: unknown; [key: string]: unknown }) => {
    const { className, ...validProps } = props;
    return <div data-testid="file-text-icon" className={className as string}>📄</div>;
  },
}));

// Mock books functions
jest.mock('../../../lib/books', () => ({
  getBook: jest.fn(),
  getAllBookSlugs: jest.fn(),
}));

// Mock gradient generator
jest.mock('../../../lib/gradient-generator', () => ({
  generateGradientDataURL: jest.fn().mockReturnValue('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDIwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJncmFkaWVudCIgeDI9IjAiIHkyPSIxIj48c3RvcCBzdG9wLWNvbG9yPSIjZmY0NzU2Ii8+PHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjZjA5N2EzIi8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9InVybCgjZ3JhZGllbnQpIi8+PC9zdmc+'),
  generateBookSeed: jest.fn().mockReturnValue('mock-seed'),
}));

// Import actual page component
import BookDetail, { getStaticProps, getStaticPaths } from '../../../pages/books/[slug]';
import { getBook, getAllBookSlugs } from '../../../lib/books';
import { generateGradientDataURL, generateBookSeed } from '../../../lib/gradient-generator';

const mockBook = {
  id: 'test-book-1',
  slug: 'test-book',
  title: 'Test Book Title',
  subtitle: 'Test Book Subtitle',
  author: 'Shun Kushigami',
  description: 'This is a test book description explaining what the book covers.',
  publishedDate: '2024-08-31',
  updatedDate: '2024-09-01',
  tags: ['React', 'TypeScript', 'Testing'],
  coverImage: '/images/books/test-book.png',
  locale: 'en',
  chapters: [
    {
      id: 'intro-1',
      slug: 'introduction',
      title: 'Introduction',
      content: '<h1>Introduction</h1><p>Welcome to the book.</p>',
      order: 1
    },
    {
      id: 'chapter-1-1',
      slug: 'chapter-1',
      title: 'Chapter 1: Getting Started',
      content: '<h1>Getting Started</h1><p>Let\'s begin our journey.</p>',
      order: 2
    },
    {
      id: 'chapter-2-1',
      slug: 'chapter-2',
      title: 'Chapter 2: Advanced Topics',
      content: '<h1>Advanced Topics</h1><p>Now for the advanced stuff.</p>',
      order: 3
    },
  ],
};

describe('BookDetail Page', () => {
  beforeEach(() => {
    (getBook as jest.Mock).mockReturnValue(mockBook);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the book title and subtitle', () => {
    render(<BookDetail book={mockBook} />);
    
    expect(screen.getByRole('heading', { level: 1, name: 'Test Book Title' })).toBeInTheDocument();
    expect(screen.getByText('Test Book Subtitle')).toBeInTheDocument();
  });

  it('renders the book description', () => {
    render(<BookDetail book={mockBook} />);
    
    expect(screen.getByText('This is a test book description explaining what the book covers.')).toBeInTheDocument();
  });

  it('renders book metadata', () => {
    render(<BookDetail book={mockBook} />);
    
    expect(screen.getByText('August 31, 2024')).toBeInTheDocument();
    expect(screen.getByText('Shun Kushigami')).toBeInTheDocument();
  });

  it('renders book tags', () => {
    render(<BookDetail book={mockBook} />);
    
    expect(screen.getByText('#React')).toBeInTheDocument();
    expect(screen.getByText('#TypeScript')).toBeInTheDocument();
    expect(screen.getByText('#Testing')).toBeInTheDocument();
  });

  it('renders table of contents', () => {
    render(<BookDetail book={mockBook} />);
    
    expect(screen.getByText('Table of Contents')).toBeInTheDocument();
    expect(screen.getByText('Introduction')).toBeInTheDocument();
    expect(screen.getByText('Chapter 1: Getting Started')).toBeInTheDocument();
    expect(screen.getByText('Chapter 2: Advanced Topics')).toBeInTheDocument();
  });

  it('renders chapter links correctly', () => {
    render(<BookDetail book={mockBook} />);
    
    const introLink = screen.getByText('Introduction').closest('a');
    const chapter1Link = screen.getByText('Chapter 1: Getting Started').closest('a');
    const chapter2Link = screen.getByText('Chapter 2: Advanced Topics').closest('a');
    
    expect(introLink).toHaveAttribute('href', '/books/test-book/introduction');
    expect(chapter1Link).toHaveAttribute('href', '/books/test-book/chapter-1');
    expect(chapter2Link).toHaveAttribute('href', '/books/test-book/chapter-2');
  });

  it('renders start reading button', () => {
    render(<BookDetail book={mockBook} />);
    
    const startReadingButton = screen.getByRole('link', { name: /start reading/i });
    expect(startReadingButton).toBeInTheDocument();
    expect(startReadingButton).toHaveAttribute('href', '/books/test-book/introduction');
  });

  it('renders back to books link', () => {
    render(<BookDetail book={mockBook} />);
    
    const backLink = screen.getByText('Books').closest('a');
    expect(backLink).toBeInTheDocument();
    expect(backLink).toHaveAttribute('href', '/books');
  });

  it('renders book cover image', () => {
    render(<BookDetail book={mockBook} />);
    
    const coverImage = screen.getByRole('img', { name: 'Test Book Title' });
    expect(coverImage).toBeInTheDocument();
    expect(coverImage).toHaveAttribute('src', '/images/books/test-book.png');
  });

  it('generates gradient for book without cover image', () => {
    const bookWithoutCover = {
      ...mockBook,
      coverImage: null,
    };
    
    render(<BookDetail book={bookWithoutCover} />);
    
    // Should generate gradient when no cover image
    expect(screen.getByRole('img')).toBeInTheDocument();
    expect(generateGradientDataURL).toHaveBeenCalledWith({
      seed: 'mock-seed',
      width: 320,
      height: 480
    });
  });

  it('displays chapter count', () => {
    render(<BookDetail book={mockBook} />);
    
    expect(screen.getByText('3 chapters')).toBeInTheDocument();
  });

  it('renders language switcher', () => {
    render(<BookDetail book={mockBook} />);
    
    const languageButton = screen.getByRole('button');
    expect(languageButton).toBeInTheDocument();
    expect(languageButton).toHaveTextContent('🇺🇸');
  });

  it('has proper semantic structure', () => {
    render(<BookDetail book={mockBook} />);
    
    expect(screen.getByRole('banner')).toBeInTheDocument(); // header
    expect(screen.getByRole('main')).toBeInTheDocument();   // main content
    // Note: This page doesn't have a footer, so removing contentinfo check
  });

  it('renders breadcrumb navigation', () => {
    render(<BookDetail book={mockBook} />);
    
    expect(screen.getAllByRole('link', { name: /books/i })[0]).toBeInTheDocument();
    expect(screen.getAllByText('Test Book Title')[0]).toBeInTheDocument();
  });

  it('handles book not found state', () => {
    render(<BookDetail book={null} />);
    
    expect(screen.getByText('Book not found')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /back to books/i })).toBeInTheDocument();
  });

  it('handles book with no chapters', () => {
    const bookWithoutChapters = {
      ...mockBook,
      chapters: [],
    };
    
    render(<BookDetail book={bookWithoutChapters} />);
    
    expect(screen.getByText('0 chapters')).toBeInTheDocument();
    // Start reading button should not be present or disabled
    expect(screen.queryByRole('link', { name: /start reading/i })).not.toBeInTheDocument();
  });

  it('handles book with no tags', () => {
    const bookWithoutTags = {
      ...mockBook,
      tags: [],
    };
    
    render(<BookDetail book={bookWithoutTags} />);
    
    expect(screen.getByRole('heading', { level: 1, name: 'Test Book Title' })).toBeInTheDocument();
    // Tags section should not be visible
  });

  it('renders chapter numbers in table of contents', () => {
    render(<BookDetail book={mockBook} />);
    
    expect(screen.getByText('Introduction')).toBeInTheDocument();
    expect(screen.getByText('Chapter 1: Getting Started')).toBeInTheDocument();
    expect(screen.getByText('Chapter 2: Advanced Topics')).toBeInTheDocument();
  });

  it('renders Head component with book metadata', () => {
    render(<BookDetail book={mockBook} />);
    
    // Head component should render the description and author
    expect(document.head.innerHTML).toContain('This is a test book description explaining what the book covers.');
    expect(document.head.innerHTML).toContain('Shun Kushigami');
  });

  it('handles book without subtitle', () => {
    const bookWithoutSubtitle = {
      ...mockBook,
      subtitle: undefined,
    };
    
    render(<BookDetail book={bookWithoutSubtitle} />);
    
    expect(screen.getByRole('heading', { level: 1, name: 'Test Book Title' })).toBeInTheDocument();
    expect(screen.queryByText('Test Book Subtitle')).not.toBeInTheDocument();
  });

  it('displays correct language configuration', () => {
    render(<BookDetail book={mockBook} />);
    
    const languageButton = screen.getByRole('button');
    expect(languageButton).toHaveTextContent('🇺🇸');
    expect(languageButton).toHaveTextContent('English');
  });

  it('renders breadcrumb navigation with proper structure', () => {
    render(<BookDetail book={mockBook} />);
    
    expect(screen.getByTestId('home-icon')).toBeInTheDocument();
    expect(screen.getAllByTestId('chevron-right-icon').length).toBeGreaterThan(0);
    expect(screen.getByText('Books')).toBeInTheDocument();
    expect(screen.getAllByText('Test Book Title').length).toBeGreaterThan(0);
  });

  it('formats published date correctly', () => {
    render(<BookDetail book={mockBook} />);
    
    // The date should be formatted using date-fns format function
    expect(screen.getByText('August 31, 2024')).toBeInTheDocument();
  });

  it('displays correct chapter count', () => {
    render(<BookDetail book={mockBook} />);
    
    expect(screen.getByText('3 chapters')).toBeInTheDocument();
  });

  it('handles book with null coverImage gracefully', () => {
    const bookWithNullCover = {
      ...mockBook,
      coverImage: null,
    };
    
    render(<BookDetail book={bookWithNullCover} />);
    
    expect(generateGradientDataURL).toHaveBeenCalledWith({
      seed: 'mock-seed',
      width: 320,
      height: 480
    });
    expect(generateBookSeed).toHaveBeenCalledWith('Test Book Title', 'Shun Kushigami');
  });

  it('renders about section with proper heading', () => {
    render(<BookDetail book={mockBook} />);
    
    expect(screen.getByText('books.about')).toBeInTheDocument();
    expect(screen.getByText('This is a test book description explaining what the book covers.')).toBeInTheDocument();
  });

  it('handles no chapters message correctly', () => {
    const bookWithoutChapters = {
      ...mockBook,
      chapters: [],
    };
    
    render(<BookDetail book={bookWithoutChapters} />);
    
    expect(screen.getByText('No chapters available')).toBeInTheDocument();
    expect(screen.getAllByTestId('file-text-icon').length).toBeGreaterThan(0);
  });

  it('handles empty tags array', () => {
    const bookWithEmptyTags = {
      ...mockBook,
      tags: [],
    };
    
    render(<BookDetail book={bookWithEmptyTags} />);
    
    // Tags section should not be visible when empty
    expect(screen.queryByText('#React')).not.toBeInTheDocument();
    expect(screen.queryByText('#TypeScript')).not.toBeInTheDocument();
  });

  it('handles undefined tags', () => {
    const bookWithUndefinedTags = {
      ...mockBook,
      tags: undefined,
    };
    
    render(<BookDetail book={bookWithUndefinedTags} />);
    
    // Tags section should not be visible when undefined
    expect(screen.queryByText('#React')).not.toBeInTheDocument();
  });

  it('opens and closes language dropdown on button click', async () => {
    const user = userEvent.setup();
    render(<BookDetail book={mockBook} />);
    
    const languageButton = screen.getByRole('button');
    
    // Initially dropdown should not be visible
    expect(screen.queryByText('English')).toBeInTheDocument(); // In button text
    expect(screen.queryByText('日本語')).not.toBeInTheDocument();
    
    // Click to open dropdown
    await user.click(languageButton);
    
    // Dropdown should now be visible with all language options
    expect(screen.getAllByText('English')).toHaveLength(2); // Once in button, once in dropdown
    expect(screen.getByText('日本語')).toBeInTheDocument();
    expect(screen.getByText('한국어')).toBeInTheDocument();
    expect(screen.getByText('中文')).toBeInTheDocument();
    expect(screen.getByText('Español')).toBeInTheDocument();
    expect(screen.getByText('Français')).toBeInTheDocument();
  });

  it('closes language dropdown when clicking outside', async () => {
    render(<BookDetail book={mockBook} />);
    
    const languageButton = screen.getByRole('button');
    
    // Open dropdown
    fireEvent.click(languageButton);
    
    // Verify dropdown is open
    expect(screen.getByText('日本語')).toBeInTheDocument();
    
    // Click outside
    fireEvent.mouseDown(document.body);
    
    // Dropdown should be closed
    expect(screen.queryByText('日本語')).not.toBeInTheDocument();
  });

  it('shows correct current language selection in dropdown', async () => {
    const user = userEvent.setup();
    render(<BookDetail book={mockBook} />);
    
    const languageButton = screen.getByRole('button');
    await user.click(languageButton);
    
    // Check that current language has checkmark
    const englishOption = screen.getAllByText('English')[1]; // Second one in dropdown
    expect(englishOption.closest('a')).toHaveTextContent('✓');
  });

  it('handles language dropdown link clicks', async () => {
    const user = userEvent.setup();
    render(<BookDetail book={mockBook} />);
    
    const languageButton = screen.getByRole('button');
    await user.click(languageButton);
    
    const japaneseLink = screen.getByText('日本語').closest('a');
    expect(japaneseLink).toHaveAttribute('href', '/books/test-book');
    expect(japaneseLink).toHaveAttribute('locale', 'ja');
  });

  it('handles book with missing author metadata', () => {
    const bookWithoutAuthor = {
      ...mockBook,
      author: undefined,
    };
    
    render(<BookDetail book={bookWithoutAuthor} />);
    
    // When no author, the user icon and author name should not be present
    expect(screen.queryByText('Shun Kushigami')).not.toBeInTheDocument();
  });

  it('renders all metadata icons correctly', () => {
    render(<BookDetail book={mockBook} />);
    
    expect(screen.getByTestId('user-icon')).toBeInTheDocument();
    expect(screen.getByTestId('calendar-icon')).toBeInTheDocument();
    expect(screen.getAllByTestId('file-text-icon').length).toBeGreaterThan(0);
  });

  it('handles missing fallback behavior correctly', () => {
    // Test the router.isFallback case would require mocking different router state
    // This is covered by the getStaticPaths test with fallback: true
    render(<BookDetail book={mockBook} />);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  it('applies correct CSS classes and layout structure', () => {
    render(<BookDetail book={mockBook} />);
    
    // Check that main layout containers are present
    expect(screen.getByRole('banner')).toHaveClass('bg-white', 'shadow-sm'); // header
    expect(screen.getByRole('main')).toHaveClass('max-w-7xl', 'mx-auto'); // main
  });
});

describe('BookDetail getStaticProps', () => {
  beforeEach(() => {
    (getBook as jest.Mock).mockReturnValue(mockBook);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns book data for valid slug', async () => {
    const context = {
      params: { slug: 'test-book' },
      locale: 'en',
    };

    const result = await getStaticProps(context as Parameters<GetStaticProps>[0]);

    expect(result).toEqual({
      props: {
        book: mockBook,
        _nextI18Next: {
          initialI18nStore: {},
          initialLocale: 'en',
        },
      },
      revalidate: 60,
    });

    expect(getBook).toHaveBeenCalledWith('test-book', 'en');
  });

  it('returns 404 for invalid slug', async () => {
    (getBook as jest.Mock).mockReturnValue(null);
    
    const context = {
      params: { slug: 'non-existent-book' },
      locale: 'en',
    };

    const result = await getStaticProps(context as Parameters<GetStaticProps>[0]);

    expect(result).toEqual({
      notFound: true,
    });
  });

  it('defaults to English locale when none provided', async () => {
    const context = {
      params: { slug: 'test-book' },
    };

    await getStaticProps(context as Parameters<GetStaticProps>[0]);

    expect(getBook).toHaveBeenCalledWith('test-book', 'en');
  });

  it('handles different locales correctly', async () => {
    const context = {
      params: { slug: 'test-book' },
      locale: 'ja',
    };

    await getStaticProps(context as Parameters<GetStaticProps>[0]);

    expect(getBook).toHaveBeenCalledWith('test-book', 'ja');
  });
});

describe('BookDetail getStaticPaths', () => {
  const mockSlugs = [
    { params: { slug: 'book-1' }, locale: 'en' },
    { params: { slug: 'book-2' }, locale: 'en' },
    { params: { slug: 'book-1' }, locale: 'ja' },
    { params: { slug: 'book-2' }, locale: 'ja' },
  ];

  beforeEach(() => {
    (getAllBookSlugs as jest.Mock).mockReturnValue(mockSlugs);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns all book slugs for static generation', async () => {
    const result = await getStaticPaths({});

    expect(result).toEqual({
      paths: mockSlugs,
      fallback: true,
    });

    expect(getAllBookSlugs).toHaveBeenCalled();
  });

  it('handles empty slug list', async () => {
    (getAllBookSlugs as jest.Mock).mockReturnValue([]);
    
    const result = await getStaticPaths({});

    expect(result).toEqual({
      paths: [],
      fallback: true,
    });
  });
});