import { GetStaticProps, GetStaticPaths } from 'next';
import Link from 'next/link';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { 
  BookOpen, ChevronDown, ChevronLeft, ChevronRight, 
  Home, Menu, X, FileText
} from 'lucide-react';
import { 
  getBook, 
  getBookChapter, 
  getAllBookChapterSlugs, 
  Book, 
  BookChapter 
} from '../../../lib/books';

interface BookChapterPageProps {
  book: Book | null;
  chapter: BookChapter | null;
  currentChapterIndex: number;
}

export default function BookChapterPage({ book, chapter, currentChapterIndex }: BookChapterPageProps) {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { locale, locales, asPath } = router;
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const languageConfig = {
    en: { name: 'English', flag: '🇺🇸' },
    ja: { name: '日本語', flag: '🇯🇵' },
    ko: { name: '한국어', flag: '🇰🇷' },
    zh: { name: '中文', flag: '🇨🇳' },
    es: { name: 'Español', flag: '🇪🇸' },
    fr: { name: 'Français', flag: '🇫🇷' }
  };

  const currentLanguage = languageConfig[locale as keyof typeof languageConfig] || languageConfig.en;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [router.asPath]);

  if (!book || !chapter) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <BookOpen size={64} className="mx-auto text-gray-400 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('books.chapterNotFound')}</h1>
          <Link href="/books" className="text-blue-600 hover:text-blue-800">
            {t('books.backToList')}
          </Link>
        </div>
      </div>
    );
  }

  const prevChapter = currentChapterIndex > 0 ? book.chapters[currentChapterIndex - 1] : null;
  const nextChapter = currentChapterIndex < book.chapters.length - 1 ? book.chapters[currentChapterIndex + 1] : null;

  return (
    <>
      <Head>
        <title>{`${chapter.title} - ${book.title}`}</title>
        <meta name="description" content={`${chapter.title} - ${book.title} by ${book.author}`} />
      </Head>
      
      <div className="min-h-screen bg-white">
        {/* Header */}
        <header className="bg-white border-b sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              {/* Left side: Menu and Navigation */}
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <button
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
                  aria-label="Toggle menu"
                >
                  <Menu size={20} />
                </button>
                
                {/* Mobile: Book title and chapter */}
                <div className="lg:hidden flex-1 min-w-0">
                  <div className="flex flex-col">
                    <Link 
                      href={`/books/${book.slug}`}
                      className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors truncate"
                    >
                      {book.title}
                    </Link>
                    <span className="text-xs text-gray-600 truncate">{chapter.title}</span>
                  </div>
                </div>
                
                {/* Desktop: Full breadcrumb navigation */}
                <nav className="hidden lg:flex items-center gap-2 text-sm">
                  <Link 
                    href="/" 
                    className="text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    <Home size={16} />
                  </Link>
                  <ChevronRight size={16} className="text-gray-400" />
                  <Link 
                    href="/books" 
                    className="text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    {t('books.title')}
                  </Link>
                  <ChevronRight size={16} className="text-gray-400" />
                  <Link 
                    href={`/books/${book.slug}`}
                    className="text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    {book.title}
                  </Link>
                  <ChevronRight size={16} className="text-gray-400" />
                  <span className="text-gray-900 font-medium">{chapter.title}</span>
                </nav>
              </div>
              
              {/* Language Switcher */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-3 sm:px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <span className="text-lg">{currentLanguage.flag}</span>
                  <span className="hidden sm:inline">{currentLanguage.name}</span>
                  <ChevronDown size={16} className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''} hidden sm:inline-block`} />
                </button>
                
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                    {locales?.map((loc) => {
                      const langConfig = languageConfig[loc as keyof typeof languageConfig];
                      if (!langConfig) return null;
                      
                      return (
                        <Link
                          key={loc}
                          href={asPath}
                          locale={loc}
                          onClick={() => setIsDropdownOpen(false)}
                          className={`flex items-center gap-3 px-4 py-3 text-sm hover:bg-gray-50 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                            locale === loc ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                          }`}
                        >
                          <span className="text-lg">{langConfig.flag}</span>
                          <span className="font-medium">{langConfig.name}</span>
                          {locale === loc && (
                            <span className="ml-auto text-blue-600">✓</span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <div className="flex">
          {/* Sidebar - Table of Contents */}
          <aside className={`
            fixed lg:sticky top-16 lg:top-20 left-0 z-30 
            w-72 lg:w-80 h-[calc(100vh-4rem)] lg:h-[calc(100vh-5rem)]
            bg-white border-r overflow-y-auto
            transform transition-transform duration-300 ease-in-out
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}>
            <div className="p-4 lg:p-6">
              <div className="flex items-center justify-between mb-4 lg:hidden">
                <h2 className="text-lg font-semibold text-gray-900">{t('books.tableOfContents')}</h2>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  aria-label="Close menu"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="mb-4">
                <Link 
                  href="/books"
                  className="text-sm text-blue-600 hover:text-blue-800 transition-colors mb-2 inline-block"
                >
                  ← {t('books.backToList')}
                </Link>
                <Link href={`/books/${book.slug}`} className="block">
                  <h2 className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors">
                    {book.title}
                  </h2>
                </Link>
              </div>
              
              <nav className="space-y-1">
                {book.chapters.map((ch, index) => (
                  <Link
                    key={ch.slug}
                    href={`/books/${book.slug}/${ch.slug}`}
                    className={`
                      block px-3 py-2 rounded-lg text-sm transition-colors
                      ${ch.slug === chapter.slug 
                        ? 'bg-blue-50 text-blue-700 font-medium border-l-4 border-blue-600' 
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                      }
                    `}
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-gray-500 font-mono text-xs mt-0.5">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <span>{ch.title}</span>
                    </div>
                  </Link>
                ))}
              </nav>
            </div>
          </aside>

          {/* Overlay for mobile */}
          {isSidebarOpen && (
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            <article className="max-w-4xl mx-auto px-4 py-8 lg:px-8">
              {/* Chapter Header */}
              <header className="mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 text-sm text-gray-600 mb-4">
                  <span className="font-mono bg-gray-100 px-2 py-1 rounded inline-block w-fit">
                    {t('books.chapter')} {currentChapterIndex + 1}
                  </span>
                  <span className="hidden sm:inline">•</span>
                  <Link 
                    href={`/books/${book.slug}`}
                    className="text-blue-600 hover:text-blue-800 transition-colors font-medium"
                  >
                    {book.title}
                  </Link>
                </div>
              </header>

              {/* Chapter Content */}
              <div 
                className="prose prose-lg max-w-none [&>h1:first-child]:hidden"
                dangerouslySetInnerHTML={{ __html: chapter.content || '' }}
              />

              {/* Navigation Footer */}
              <footer className="mt-12 pt-8 border-t">
                <div className="flex justify-between items-center">
                  {prevChapter ? (
                    <Link
                      href={`/books/${book.slug}/${prevChapter.slug}`}
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors group"
                    >
                      <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                      <div className="text-left">
                        <div className="text-xs text-gray-500 mb-1">{t('books.previous')}</div>
                        <div className="font-medium">{prevChapter.title}</div>
                      </div>
                    </Link>
                  ) : (
                    <div />
                  )}

                  <Link
                    href={`/books/${book.slug}`}
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <FileText size={20} />
                  </Link>

                  {nextChapter ? (
                    <Link
                      href={`/books/${book.slug}/${nextChapter.slug}`}
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors group"
                    >
                      <div className="text-right">
                        <div className="text-xs text-gray-500 mb-1">{t('books.next')}</div>
                        <div className="font-medium">{nextChapter.title}</div>
                      </div>
                      <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                  ) : (
                    <div />
                  )}
                </div>
              </footer>
            </article>
          </main>
        </div>
      </div>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = getAllBookChapterSlugs();
  
  return {
    paths: paths.map(({ params, locale }) => ({
      params: {
        slug: params.bookSlug,
        chapter: params.chapterSlug,
      },
      locale,
    })),
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params, locale }) => {
  const bookSlug = params?.slug as string;
  const chapterSlug = params?.chapter as string;
  
  const book = await getBook(bookSlug, locale || 'en');
  const chapter = await getBookChapter(bookSlug, chapterSlug, locale || 'en');

  if (!book || !chapter) {
    return {
      notFound: true,
    };
  }

  const currentChapterIndex = book.chapters.findIndex(ch => ch.slug === chapterSlug);

  return {
    props: {
      book,
      chapter,
      currentChapterIndex,
      ...(await serverSideTranslations(locale || 'en', ['common'])),
    },
    revalidate: 60,
  };
};