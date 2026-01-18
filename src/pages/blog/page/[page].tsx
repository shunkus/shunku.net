import { GetStaticPaths, GetStaticProps } from 'next';
import Link from 'next/link';
import Head from 'next/head';
import { format } from 'date-fns';
import { CalendarDays, Tag, User, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
import { useState, useEffect, useRef } from 'react';
import { getPaginatedBlogPosts, getTagsWithCounts, getBlogPosts, BlogPostMeta } from '../../../lib/blog';

const POSTS_PER_PAGE = 10;

interface BlogPageProps {
  posts: BlogPostMeta[];
  totalPages: number;
  currentPage: number;
  tags: { tag: string; count: number }[];
}

export default function BlogPage({ posts, totalPages, currentPage, tags }: BlogPageProps) {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { locale, locales, asPath } = router;
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isTagCloudOpen, setIsTagCloudOpen] = useState(false);
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

  // Calculate tag cloud sizes based on count
  const maxCount = Math.max(...tags.map(t => t.count));
  const minCount = Math.min(...tags.map(t => t.count));
  const getTagSize = (count: number) => {
    if (maxCount === minCount) return 'text-sm';
    const ratio = (count - minCount) / (maxCount - minCount);
    if (ratio > 0.8) return 'text-lg font-semibold';
    if (ratio > 0.5) return 'text-base font-medium';
    if (ratio > 0.2) return 'text-sm';
    return 'text-xs';
  };

  // Generate pagination links
  const getPaginationLinks = () => {
    const links: (number | 'ellipsis')[] = [];
    const showPages = 5;

    if (totalPages <= showPages + 2) {
      for (let i = 1; i <= totalPages; i++) {
        links.push(i);
      }
    } else {
      links.push(1);

      if (currentPage > 3) {
        links.push('ellipsis');
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        links.push(i);
      }

      if (currentPage < totalPages - 2) {
        links.push('ellipsis');
      }

      links.push(totalPages);
    }

    return links;
  };

  const getPageUrl = (page: number) => {
    if (page === 1) return '/blog';
    return `/blog/page/${page}`;
  };

  return (
    <>
      <Head>
        <title>{`${t('blog.title')} - ${t('blog.page')} ${currentPage} - ${t('name')}`}</title>
        <meta name="description" content={t('blog.description')} />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-4xl mx-auto px-4 py-6">
            {/* Navigation and Language Switcher */}
            <div className="flex justify-between items-center mb-4">
              <nav>
                <Link
                  href="/"
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  ← {t('blog.backToHome')}
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
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <h1 className="text-4xl font-bold text-gray-900">{t('blog.title')}</h1>
            <p className="text-gray-600 mt-2">{t('blog.subtitle')}</p>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-8">
          {/* Tag Cloud - Collapsible */}
          {tags.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm mb-8 overflow-hidden">
              <button
                onClick={() => setIsTagCloudOpen(!isTagCloudOpen)}
                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
              >
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Tag size={20} />
                  {t('blog.tags')}
                  <span className="text-sm font-normal text-gray-500">({tags.length})</span>
                </h2>
                <ChevronDown
                  size={20}
                  className={`text-gray-500 transition-transform duration-200 ${isTagCloudOpen ? 'rotate-180' : ''}`}
                />
              </button>
              {isTagCloudOpen && (
                <div className="px-6 pb-6 flex flex-wrap gap-2 border-t border-gray-100 pt-4">
                  {tags.map(({ tag, count }) => (
                    <Link
                      key={tag}
                      href={`/blog/tag/${encodeURIComponent(tag)}`}
                      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors ${getTagSize(count)}`}
                    >
                      #{tag}
                      <span className="text-blue-500 text-xs">({count})</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {posts.length > 0 ? (
            <>
              <div className="space-y-8">
                {posts.map((post) => (
                  <article key={post.slug} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6">
                    <Link href={`/blog/${post.slug}`} className="group">
                      <h2 className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-3">
                        {post.title}
                      </h2>
                    </Link>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-1">
                        <CalendarDays size={16} />
                        <time dateTime={post.date}>
                          {format(new Date(post.date), 'PPP')}
                        </time>
                      </div>

                      {post.author && (
                        <div className="flex items-center gap-1">
                          <User size={16} />
                          <span>{post.author}</span>
                        </div>
                      )}
                    </div>

                    <p className="text-gray-700 leading-relaxed mb-4">{post.excerpt}</p>

                    {post.tags && post.tags.length > 0 && (
                      <div className="flex items-center gap-2 mb-4">
                        <Tag size={16} className="text-gray-500" />
                        <div className="flex flex-wrap gap-2">
                          {post.tags.map((tag) => (
                            <Link
                              key={tag}
                              href={`/blog/tag/${encodeURIComponent(tag)}`}
                              className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full hover:bg-blue-200 transition-colors cursor-pointer"
                            >
                              #{tag}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    <Link
                      href={`/blog/${post.slug}`}
                      className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                    >
                      {t('blog.readMore')} →
                    </Link>
                  </article>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <nav className="flex justify-center items-center gap-2 mt-12">
                  {/* Previous button */}
                  {currentPage > 1 ? (
                    <Link
                      href={getPageUrl(currentPage - 1)}
                      className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <ChevronLeft size={16} />
                      <span className="hidden sm:inline">{t('blog.previous')}</span>
                    </Link>
                  ) : (
                    <span className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-400 bg-gray-100 border border-gray-200 rounded-lg cursor-not-allowed">
                      <ChevronLeft size={16} />
                      <span className="hidden sm:inline">{t('blog.previous')}</span>
                    </span>
                  )}

                  {/* Page numbers */}
                  <div className="flex items-center gap-1">
                    {getPaginationLinks().map((item, index) => {
                      if (item === 'ellipsis') {
                        return (
                          <span key={`ellipsis-${index}`} className="px-2 py-2 text-gray-500">
                            ...
                          </span>
                        );
                      }

                      const isCurrentPage = item === currentPage;
                      return (
                        <Link
                          key={item}
                          href={getPageUrl(item)}
                          className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                            isCurrentPage
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {item}
                        </Link>
                      );
                    })}
                  </div>

                  {/* Next button */}
                  {currentPage < totalPages ? (
                    <Link
                      href={getPageUrl(currentPage + 1)}
                      className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <span className="hidden sm:inline">{t('blog.next')}</span>
                      <ChevronRight size={16} />
                    </Link>
                  ) : (
                    <span className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-400 bg-gray-100 border border-gray-200 rounded-lg cursor-not-allowed">
                      <span className="hidden sm:inline">{t('blog.next')}</span>
                      <ChevronRight size={16} />
                    </span>
                  )}
                </nav>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {t('blog.noPosts')}
              </h2>
              <p className="text-gray-600">
                {t('blog.noPostsDescription')}
              </p>
            </div>
          )}
        </main>
      </div>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const locales = ['en', 'ja'];
  const paths: { params: { page: string }; locale: string }[] = [];

  for (const locale of locales) {
    const allPosts = getBlogPosts(locale);
    const totalPages = Math.ceil(allPosts.length / POSTS_PER_PAGE);

    // Generate paths for page 2 and onwards (page 1 is handled by /blog)
    for (let page = 2; page <= totalPages; page++) {
      paths.push({
        params: { page: String(page) },
        locale,
      });
    }
  }

  return {
    paths,
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps = async ({ params, locale }) => {
  const page = parseInt(params?.page as string, 10);

  // Redirect page 1 to /blog
  if (page === 1) {
    return {
      redirect: {
        destination: '/blog',
        permanent: true,
      },
    };
  }

  const { posts, totalPages } = getPaginatedBlogPosts(locale || 'en', page, POSTS_PER_PAGE);
  const tags = getTagsWithCounts(locale || 'en');

  // If page is out of range, return 404
  if (page > totalPages || page < 1) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      posts,
      totalPages,
      currentPage: page,
      tags,
      ...(await serverSideTranslations(locale || 'en', ['common'])),
    },
  };
};
