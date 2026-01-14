import { GetStaticPaths, GetStaticProps } from 'next';
import Link from 'next/link';
import Head from 'next/head';
import { format } from 'date-fns';
import { CalendarDays, Tag, User, ArrowLeft, ChevronDown, X } from 'lucide-react';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
import { useState, useEffect, useRef } from 'react';
import mermaid from 'mermaid';
import { getBlogPost, getAllBlogSlugs, BlogPost } from '../../lib/blog';

interface BlogPostPageProps {
  post: BlogPost;
}

export default function BlogPostPage({ post }: BlogPostPageProps) {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { locale, locales, asPath } = router;
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [expandedDiagram, setExpandedDiagram] = useState<string | null>(null);
  const [processedContent, setProcessedContent] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

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

  // Process mermaid diagrams in content
  useEffect(() => {
    if (processedContent !== null) return;

    mermaid.initialize({
      startOnLoad: false,
      theme: 'default',
      securityLevel: 'loose',
    });

    const processMermaid = async () => {
      // Create a temporary container to process the HTML
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = post.content;

      const mermaidBlocks = tempDiv.querySelectorAll('pre > code.language-mermaid');
      if (mermaidBlocks.length === 0) {
        setProcessedContent(post.content);
        return;
      }

      const svgMap: Record<number, string> = {};

      for (let i = 0; i < mermaidBlocks.length; i++) {
        const block = mermaidBlocks[i];
        const code = block.textContent || '';
        const id = `mermaid-${Date.now()}-${i}`;

        try {
          const { svg } = await mermaid.render(id, code);
          svgMap[i] = svg;
        } catch (error) {
          console.error('Mermaid rendering error:', error);
        }
      }

      // Replace code blocks with rendered SVGs
      const mermaidBlocksAgain = tempDiv.querySelectorAll('pre > code.language-mermaid');
      mermaidBlocksAgain.forEach((block, i) => {
        const pre = block.parentElement;
        if (!pre || !svgMap[i]) return;

        const wrapper = document.createElement('div');
        wrapper.className = 'mermaid-diagram-wrapper';
        wrapper.setAttribute('data-diagram-index', String(i));
        wrapper.innerHTML = `
          <div class="mermaid-diagram">${svgMap[i]}</div>
          <button class="mermaid-expand-btn" data-diagram-index="${i}" title="Expand diagram">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
          </button>
        `;
        pre.replaceWith(wrapper);
      });

      setProcessedContent(tempDiv.innerHTML);
    };

    processMermaid();
  }, [post.content, processedContent]);

  // Reset processed content when post changes
  useEffect(() => {
    setProcessedContent(null);
  }, [post.slug]);

  // Handle click on expand buttons
  useEffect(() => {
    const container = contentRef.current;
    if (!container || !processedContent) return;

    const handleClick = (e: Event) => {
      const target = e.target as HTMLElement;
      const btn = target.closest('.mermaid-expand-btn') as HTMLElement;
      if (!btn) return;

      const wrapper = btn.closest('.mermaid-diagram-wrapper');
      if (!wrapper) return;

      const svg = wrapper.querySelector('.mermaid-diagram svg');
      if (svg) {
        setExpandedDiagram(svg.outerHTML);
      }
    };

    container.addEventListener('click', handleClick);
    return () => container.removeEventListener('click', handleClick);
  }, [processedContent]);

  // Close modal on ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setExpandedDiagram(null);
      }
    };

    if (expandedDiagram) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [expandedDiagram]);

  if (router.isFallback) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Head>
        <title>{`${post.title} - ${t('name')}`}</title>
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
              ref={contentRef}
              className="prose prose-lg"
              dangerouslySetInnerHTML={{ __html: processedContent || post.content }}
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

      {/* Mermaid Diagram Modal */}
      {expandedDiagram && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
          onClick={() => setExpandedDiagram(null)}
        >
          <div
            className="relative w-full h-full max-w-[95vw] max-h-[95vh] bg-white rounded-xl shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
              <span className="text-sm text-gray-500">Click outside or press ESC to close</span>
              <button
                onClick={() => setExpandedDiagram(null)}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Close"
              >
                <X size={24} />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-6">
              <div
                className="mermaid-modal-content w-full h-full flex items-center justify-center"
                dangerouslySetInnerHTML={{ __html: expandedDiagram }}
              />
            </div>
          </div>
        </div>
      )}
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