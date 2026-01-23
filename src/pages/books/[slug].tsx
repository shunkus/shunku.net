import { GetStaticProps, GetStaticPaths } from 'next';
import Link from 'next/link';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { 
  BookOpen, ChevronDown, CalendarDays, User,
  FileText, ChevronRight, Home
} from 'lucide-react';
import { format } from 'date-fns';
import { getBook, getAllBookSlugs, Book } from '../../lib/books';
import { generateGradientDataURL, generateBookSeed } from '../../lib/gradient-generator';

interface BookDetailProps {
  book: Book | null;
}

export default function BookDetail({ book }: BookDetailProps) {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { locale, locales, asPath } = router;
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
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

  if (!book) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <BookOpen size={64} className="mx-auto text-gray-400 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('books.notFound')}</h1>
          <Link href="/books" className="text-blue-600 hover:text-blue-800">
            {t('books.backToList')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{`${book.title} - ${t('books.title')}`}</title>
        <meta name="description" content={book.description} />
        {book.author && <meta name="author" content={book.author} />}
      </Head>
      
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-6">
            {/* Navigation and Language Switcher */}
            <div className="flex justify-between items-center mb-6">
              <nav className="flex items-center gap-2 text-sm">
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
                <span className="text-gray-900 font-medium">{book.title}</span>
              </nav>
              
              {/* Language Switcher Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-3 sm:px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
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

        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Book Info Section */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 sticky top-4">
                {/* Mobile: Horizontal layout (image left, info right) */}
                <div className="flex flex-row lg:flex-col gap-4 lg:gap-0">
                  {/* Book Cover */}
                  <div className="flex-shrink-0">
                    <div className="relative w-28 sm:w-32 aspect-[3/4] lg:w-full lg:aspect-[3/4] lg:mb-6 rounded-lg overflow-hidden shadow-md">
                      <Image
                        src={book.coverImage ?? generateGradientDataURL({
                          seed: generateBookSeed(book.title, book.author),
                          width: 320,
                          height: 480
                        })}
                        alt={book.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>

                  {/* Mobile: Title and metadata next to image */}
                  <div className="flex-1 min-w-0 lg:contents">
                    {/* Book Title and Subtitle */}
                    <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-1 lg:mb-2 line-clamp-2 lg:line-clamp-none">{book.title}</h1>
                    {book.subtitle && (
                      <p className="text-sm lg:text-base text-gray-600 mb-2 lg:mb-4 line-clamp-1 lg:line-clamp-none">{book.subtitle}</p>
                    )}

                    {/* Book Metadata */}
                    <div className="space-y-1 lg:space-y-3 mb-3 lg:mb-6">
                      <div className="flex items-center gap-2 text-sm lg:text-base text-gray-700">
                        <User size={14} className="text-gray-500 flex-shrink-0" />
                        <span className="font-medium truncate">{book.author}</span>
                      </div>

                      <div className="flex items-center gap-2 text-sm lg:text-base text-gray-700">
                        <CalendarDays size={14} className="text-gray-500 flex-shrink-0" />
                        <time dateTime={book.publishedDate}>
                          {format(new Date(book.publishedDate), 'MMMM yyyy')}
                        </time>
                      </div>

                      <div className="flex items-center gap-2 text-sm lg:text-base text-gray-700">
                        <FileText size={14} className="text-gray-500 flex-shrink-0" />
                        <span>{book.chapters.length} {t('books.chapters')}</span>
                      </div>
                    </div>

                    {/* Tags - show limited on mobile, all on desktop */}
                    {book.tags && book.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 lg:gap-2 lg:mb-6">
                        {book.tags.map((tag, index) => (
                          <span
                            key={tag}
                            className={`bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 lg:py-1 rounded-full ${index >= 3 ? 'hidden lg:inline' : ''}`}
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Description - always below on both mobile and desktop */}
                <div className="border-t pt-4 lg:pt-6 mt-4 lg:mt-0">
                  <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-2 lg:mb-3">{t('books.about')}</h3>
                  <p className="text-sm lg:text-base text-gray-700 leading-relaxed">{book.description}</p>
                </div>
              </div>
            </div>

            {/* Table of Contents */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <FileText size={24} />
                  {t('books.tableOfContents')}
                </h2>
                
                {book.chapters.length > 0 ? (
                  <div className="space-y-1">
                    {book.chapters.map((chapter, index) => (
                      <Link
                        key={chapter.slug}
                        href={`/books/${book.slug}/${chapter.slug}`}
                        className="group block"
                      >
                        <div className="flex items-start gap-4 p-4 rounded-lg hover:bg-blue-50 transition-colors">
                          <div className="flex-shrink-0 w-10 h-10 bg-blue-100 text-blue-800 rounded-lg flex items-center justify-center font-semibold text-sm group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            {index + 1}
                          </div>
                          <div className="flex-grow">
                            <h3 className="text-lg font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                              {chapter.title}
                            </h3>
                          </div>
                          <ChevronRight size={20} className="text-gray-400 group-hover:text-blue-600 transition-colors mt-1" />
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileText size={48} className="mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600">{t('books.noChapters')}</p>
                  </div>
                )}

                {/* Start Reading Button */}
                {book.chapters.length > 0 && (
                  <div className="mt-8 flex justify-center">
                    <Link
                      href={`/books/${book.slug}/${book.chapters[0].slug}`}
                      className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm"
                    >
                      <BookOpen size={20} />
                      {t('books.startReading')}
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = getAllBookSlugs();
  
  return {
    paths: paths.map(({ params, locale }) => ({
      params,
      locale,
    })),
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params, locale }) => {
  const slug = params?.slug as string;
  const book = await getBook(slug, locale || 'en');

  if (!book) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      book,
      ...(await serverSideTranslations(locale || 'en', ['common'])),
    },
    revalidate: 60,
  };
};