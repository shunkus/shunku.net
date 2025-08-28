# Shun Kushigami - Portfolio Website

A modern, multilingual portfolio website built with Next.js, featuring comprehensive internationalization support and a technical blog.

## 🌐 Live Site

Visit the live site at: [shunku.net](https://shunku.net)

## ✨ Features

### 🌍 Internationalization
- **6 Languages Supported**: English, Japanese (日本語), Korean (한국어), Chinese (中文), Spanish (Español), French (Français)
- **Seamless Language Switching**: Dropdown language selector with flag icons
- **Localized Content**: Complete translations for all UI elements and content

### 📝 Blog System
- **Markdown Support**: Write articles in Markdown with full HTML preview support
- **Multi-language Articles**: Blog posts available in all supported languages
- **Technical Content**: HTML and CSS cheatsheets with live code examples
- **Interactive Examples**: Real HTML/CSS previews embedded in articles

### 🎨 Modern Design
- **Responsive Layout**: Works perfectly on desktop, tablet, and mobile
- **Clean UI**: Professional design with consistent styling
- **Smooth Animations**: Hover effects and transitions throughout
- **Accessibility**: Proper semantic HTML and ARIA attributes

### 🛠 Technical Stack
- **Framework**: Next.js 15.5.0 with Pages Router
- **Styling**: Tailwind CSS with custom prose styling
- **Internationalization**: next-i18next
- **Markdown Processing**: remark + remark-html
- **Typography**: Custom typography with @tailwindcss/typography
- **Icons**: Lucide React icons
- **Testing**: Jest + Playwright for comprehensive testing

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd shunku.net
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
shunku.net/
├── content/blog/           # Blog content by language
│   ├── en/                 # English articles
│   ├── ja/                 # Japanese articles
│   ├── ko/                 # Korean articles
│   ├── zh/                 # Chinese articles
│   ├── es/                 # Spanish articles
│   └── fr/                 # French articles
├── public/
│   └── locales/            # Translation files
│       ├── en/common.json
│       ├── ja/common.json
│       └── ...
├── src/
│   ├── lib/
│   │   └── blog.ts         # Blog utilities
│   ├── pages/
│   │   ├── blog/
│   │   │   ├── index.tsx   # Blog listing
│   │   │   └── [slug].tsx  # Individual posts
│   │   ├── _app.tsx        # App configuration
│   │   └── index.tsx       # Homepage
│   ├── styles/
│   │   └── globals.css     # Global styles
│   └── __tests__/          # Test files
├── next.config.ts          # Next.js configuration
├── tailwind.config.ts      # Tailwind configuration
└── next-i18next.config.js  # i18n configuration
```

## 🌐 Internationalization

The site supports 6 languages with complete localization:

- **English (en)** - Default language
- **Japanese (ja)** - 日本語
- **Korean (ko)** - 한국어  
- **Chinese (zh)** - 中文
- **Spanish (es)** - Español
- **French (fr)** - Français

### Adding New Languages

1. Add language code to `next.config.ts`
2. Create translation file in `public/locales/{lang}/common.json`
3. Add language configuration in components
4. Create blog content directory `content/blog/{lang}/`

## 📝 Blog System

### Adding New Blog Posts

1. **Create markdown file** in `content/blog/{lang}/your-post.md`
2. **Add frontmatter**:
   ```yaml
   ---
   title: "Your Post Title"
   date: "2024-01-01"
   excerpt: "Brief description of your post"
   tags: ["tag1", "tag2"]  # Optional
   author: "Author Name"   # Optional
   ---
   ```
3. **Write content** in Markdown with HTML support
4. **Repeat for all languages** you want to support

### Blog Features

- **Markdown Processing**: Full markdown support with HTML embedding
- **Code Highlighting**: Syntax highlighting for code blocks
- **Live Previews**: HTML code examples render live
- **Responsive Images**: Automatic image optimization
- **SEO Optimized**: Meta tags and structured data

## 🧪 Testing

### Unit Tests
```bash
npm run test
```

### End-to-End Tests
```bash
npm run test:e2e
```

### Type Checking
```bash
npm run type-check
```

### Linting
```bash
npm run lint
```

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Static Export (if needed)
```bash
npm run export
```

The site can be deployed to:
- **Vercel** (recommended for Next.js)
- **Netlify**
- **GitHub Pages** (with static export)
- **Any static hosting service**

## 🛠 Development Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run test` | Run unit tests |
| `npm run test:e2e` | Run E2E tests |
| `npm run type-check` | TypeScript type checking |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is private and proprietary.

## 📧 Contact

**Shun Kushigami**
- Website: [shunku.net](https://shunku.net)
- LinkedIn: [Connect with me](https://linkedin.com/in/yourprofile)

---

Built with ❤️ using Next.js, Tailwind CSS, and modern web technologies.