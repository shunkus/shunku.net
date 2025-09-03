import React from 'react';

interface Book {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  author: string;
  description: string;
  publishedDate: string;
  updatedDate: string;
  tags: string[];
  coverImage: string;
  locale: string;
  chapters: Array<{
    id: string;
    slug: string;
    title: string;
    content: string;
    order: number;
  }>;
}

interface TestBookDetailProps {
  book: Book | null;
}

export default function TestBookDetail({ book }: TestBookDetailProps) {
  if (!book) {
    return (
      <div>
        <header>
          <nav>Header navigation</nav>
        </header>
        <main>
          <p>Book not found</p>
          <a href="/books">Back to Books</a>
        </main>
        <footer>
          <p>© 2024 Shun Kushigami</p>
        </footer>
      </div>
    );
  }

  return (
    <div>
      <header>
        <nav>Header navigation</nav>
      </header>
      <h1>{book.title}</h1>
      <p>{book.subtitle}</p>
      <p>{book.description}</p>
      <div>
        <span>Published on</span>
        <span>August 31, 2024</span>
      </div>
      <div>
        <span>Updated on</span>
        <span>September 1, 2024</span>
      </div>
      <div>
        <span>{book.author}</span>
      </div>
      <div>
        {book.tags.map(tag => (
          <span key={tag}>#{tag}</span>
        ))}
      </div>
      <div>
        <h2>Table of Contents</h2>
        {book.chapters.length > 0 ? (
          book.chapters.map((chapter, index) => (
            <div key={chapter.slug}>
              <a href={`/books/${book.slug}/${chapter.slug}`}>
                {index + 1} {chapter.title}
              </a>
            </div>
          ))
        ) : (
          <p>No chapters available</p>
        )}
      </div>
      {book.chapters.length > 0 && (
        <div>
          <a href={`/books/${book.slug}/${book.chapters[0]?.slug}`}>
            Start Reading
          </a>
        </div>
      )}
      <div>
        <a href="/books">Back to Books</a>
      </div>
      <div>
        <img src={book.coverImage || '/default-book-cover.png'} alt={book.title} />
      </div>
      <div>
        {book.chapters.length} chapters
      </div>
      <div>
        <button>🇺🇸 English</button>
      </div>
      <main>
        <article>
          <aside>Sidebar</aside>
        </article>
      </main>
      <div>
        <a href="/books">Books</a>
        <span> / </span>
        <span>{book.title}</span>
      </div>
      <footer>
        <p>© 2024 Shun Kushigami</p>
      </footer>
    </div>
  );
}