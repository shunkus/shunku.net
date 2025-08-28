import { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { getBlogPostsByTag, getAllTagSlugs, BlogPostMeta } from '../../../lib/blog';

interface TagPageProps {
  posts: BlogPostMeta[];
  tag: string;
}

const TagPage: NextPage<TagPageProps> = ({ posts, tag }) => {
  const { t } = useTranslation('common');
  const router = useRouter();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(router.locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <>
      <Head>
        <title>{`${t('tagPageTitle', { tag })} - Shun Kushigami`}</title>
        <meta
          name="description"
          content={t('tagPageDescription', { tag, count: posts.length })}
        />
      </Head>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <nav className="mb-4">
              <Link 
                href="/blog"
                className="text-blue-600 hover:text-blue-800 hover:underline"
              >
                ← {t('backToBlog')}
              </Link>
            </nav>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {t('postsTaggedWith')}: <span className="text-blue-600">#{tag}</span>
            </h1>
            <p className="text-gray-600">
              {t('postsFound', { count: posts.length })}
            </p>
          </div>

          {/* Posts List */}
          {posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">{t('noPostsFound')}</p>
            </div>
          ) : (
            <div className="space-y-6">
              {posts.map((post) => (
                <article
                  key={post.slug}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3">
                    <time className="text-sm text-gray-500">
                      {formatDate(post.date)}
                      {post.updatedDate && post.updatedDate !== post.date && (
                        <span className="ml-2">
                          ({t('updated')}: {formatDate(post.updatedDate)})
                        </span>
                      )}
                    </time>
                    {post.author && (
                      <span className="text-sm text-gray-600 mt-1 sm:mt-0">
                        {t('by')} {post.author}
                      </span>
                    )}
                  </div>

                  <h2 className="text-xl font-semibold mb-3">
                    <Link
                      href={`/blog/${post.slug}`}
                      className="text-gray-900 hover:text-blue-600 hover:underline"
                    >
                      {post.title}
                    </Link>
                  </h2>

                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>

                  {/* Tags */}
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {post.tags.map((postTag) => (
                        <Link
                          key={postTag}
                          href={`/blog/tag/${encodeURIComponent(postTag)}`}
                          className={`px-2 py-1 text-xs rounded-full border transition-colors ${
                            postTag === tag
                              ? 'bg-blue-100 text-blue-800 border-blue-200'
                              : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
                          }`}
                        >
                          #{postTag}
                        </Link>
                      ))}
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = getAllTagSlugs();
  return {
    paths,
    fallback: 'blocking',
  };
};

export const getStaticProps: GetStaticProps = async ({ params, locale }) => {
  const tag = decodeURIComponent(params?.tag as string);
  const posts = getBlogPostsByTag(tag, locale!);

  // If no posts found for this tag, return 404
  if (posts.length === 0) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      posts,
      tag,
      ...(await serverSideTranslations(locale!, ['common'])),
    },
  };
};

export default TagPage;