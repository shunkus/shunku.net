import { GetStaticPaths, GetStaticProps } from 'next';
import Link from 'next/link';
import Head from 'next/head';
import { format } from 'date-fns';
import { CalendarDays, Tag, User, ArrowLeft, ChevronDown } from 'lucide-react';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
import { useState, useEffect, useRef } from 'react';
import { getBlogPost, getAllBlogSlugs, BlogPost } from '../../lib/blog';

interface BlogPostPageProps {
  post: BlogPost;
}

export default function BlogPostPage({ post }: BlogPostPageProps) {
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

  if (router.isFallback) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Head>
        <title>{post.title} - {t('name')}</title>
        <meta name="description" content={post.excerpt} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.excerpt} />
        <meta property="og:type" content="article" />
        <meta property="article:published_time" content={post.date} />
        {post.author && <meta property="article:author" content={post.author} />}
        {post.tags && (
          <meta property="article:tag" content={post.tags.join(', ')} />
        )}
      </Head>
      
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-4xl mx-auto px-4 py-6">
            {/* Navigation and Language Switcher */}
            <div className="flex justify-between items-center mb-4">
              <nav>
                <Link 
                  href="/blog" 
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  <ArrowLeft size={16} />
                  {t('blog.backToBlog')}
                </Link>
              </nav>
              
              {/* Language Switcher Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
                >
                  <span className="text-lg">{currentLanguage.flag}</span>
                  <span>{currentLanguage.name}</span>
                  <ChevronDown size={16} className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
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
            
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{post.title}</h1>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
              <div className="flex items-center gap-1">
                <CalendarDays size={16} />
                <time dateTime={post.date}>
                  {format(new Date(post.date), 'PPP')}
                </time>
              </div>
              
              {post.updatedDate && (
                <div className="flex items-center gap-1 text-green-600">
                  <span>Updated:</span>
                  <time dateTime={post.updatedDate}>
                    {format(new Date(post.updatedDate), 'PPP')}
                  </time>
                </div>
              )}
              
              {post.author && (
                <div className="flex items-center gap-1">
                  <User size={16} />
                  <span>{post.author}</span>
                </div>
              )}
            </div>

            {post.tags && post.tags.length > 0 && (
              <div className="flex items-center gap-2">
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
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-8">
          <article className="bg-white rounded-lg shadow-sm p-8">
            <div 
              className="prose prose-lg"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </article>

          {/* Navigation */}
          <div className="mt-8 flex justify-center">
            <Link 
              href="/blog"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              {t('blog.backToBlog')}
            </Link>
          </div>
        </main>
      </div>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = getAllBlogSlugs();

  return {
    paths: paths.map(({ params, locale }) => ({
      params,
      locale,
    })),
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps = async ({ params, locale }) => {
  const slug = params?.slug as string;
  const post = await getBlogPost(slug, locale || 'en');

  if (!post) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      post,
      ...(await serverSideTranslations(locale || 'en', ['common'])),
    },
  };
};