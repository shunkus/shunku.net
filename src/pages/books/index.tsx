import { GetStaticProps } from 'next';
import Link from 'next/link';
import Head from 'next/head';
import Image from 'next/image';
import { CalendarDays, User, BookOpen, ChevronDown, Tag, FileText } from 'lucide-react';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
import { useState, useEffect, useRef } from 'react';
import { getBooks, BookMeta } from '../../lib/books';
import { generateGradientDataURL, generateBookSeed } from '../../lib/gradient-generator';
import { format } from 'date-fns';

interface BooksIndexProps {
  books: BookMeta[];
}

export default function BooksIndex({ books }: BooksIndexProps) {
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

  return (
    <>
      <Head>
        <title>{t('books.title')} - {t('name')}</title>
        <meta name="description" content={t('books.description')} />
      </Head>
      
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-6xl mx-auto px-4 py-6">
            {/* Navigation and Language Switcher */}
            <div className="flex justify-between items-center mb-4">
              <nav className="flex items-center gap-4">
                <Link 
                  href="/" 
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  ← {t('books.backToHome')}
                </Link>
                <Link 
                  href="/blog" 
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  {t('nav.blog')}
                </Link>
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
            
            <div className="flex items-center gap-3">
              <BookOpen size={32} className="text-blue-600" />
              <div>
                <h1 className="text-4xl font-bold text-gray-900">{t('books.title')}</h1>
                <p className="text-gray-600 mt-1">{t('books.subtitle')}</p>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 py-8">
          {books.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {books.map((book) => (
                <article key={book.slug} className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group">
                  <Link href={`/books/${book.slug}`}>
                    <div className="relative h-64 overflow-hidden">
                      <Image
                        src={book.coverImage ?? generateGradientDataURL({
                          seed: generateBookSeed(book.title, book.author),
                          width: 300,
                          height: 400
                        })}
                        alt={book.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  </Link>
                  
                  <div className="p-6">
                    <Link href={`/books/${book.slug}`}>
                      <h2 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-1">
                        {book.title}
                      </h2>
                    </Link>
                    
                    {book.subtitle && (
                      <p className="text-sm text-gray-600 mb-3">{book.subtitle}</p>
                    )}
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                      <User size={14} />
                      <span>{book.author}</span>
                    </div>
                    
                    <p className="text-gray-700 text-sm leading-relaxed mb-4 line-clamp-3">
                      {book.description}
                    </p>
                    
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-1">
                        <FileText size={14} />
                        <span>{book.chapterCount} {t('books.chapters')}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <CalendarDays size={14} />
                        <time dateTime={book.publishedDate}>
                          {format(new Date(book.publishedDate), 'MMM yyyy')}
                        </time>
                      </div>
                    </div>

                    {book.tags && book.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {book.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <Link 
                      href={`/books/${book.slug}`}
                      className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium text-sm group"
                    >
                      {t('books.readBook')}
                      <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-lg shadow-sm">
              <BookOpen size={64} className="mx-auto text-gray-400 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {t('books.noBooks')}
              </h2>
              <p className="text-gray-600">
                {t('books.noBooksDescription')}
              </p>
            </div>
          )}
        </main>
      </div>
    </>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  const books = getBooks(locale || 'en');

  return {
    props: {
      books,
      ...(await serverSideTranslations(locale || 'en', ['common'])),
    },
  };
};