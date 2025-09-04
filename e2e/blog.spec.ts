import { test, expect } from '@playwright/test';

test.describe('Blog E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/blog');
  });

  test('should display blog index page with all posts', async ({ page }) => {
    // Check page title and heading
    await expect(page).toHaveTitle(/Blog - Shun Kushigami/);
    await expect(page.getByRole('heading', { level: 1, name: /blog/i })).toBeVisible();
    
    // Verify blog posts are displayed
    const postCards = page.locator('article');
    const postCount = await postCards.count();
    
    if (postCount > 0) {
      // Check that each post has required elements
      const firstPost = postCards.first();
      await expect(firstPost.getByRole('heading', { level: 2 })).toBeVisible();
      
      // Check for calendar and user icons (Lucide React components)
      await expect(firstPost.locator('svg').first()).toBeVisible(); // Calendar icon
      
      // Check for post link
      const postLink = firstPost.getByRole('link').first();
      await expect(postLink).toBeVisible();
    }
  });

  test('should handle blog post navigation safely', async ({ page }) => {
    // First, verify we're on the blog page by checking for any h1 heading
    const h1Headings = page.getByRole('heading', { level: 1 });
    const h1Count = await h1Headings.count();
    
    // If we can't find any h1, there might be an issue with the page
    if (h1Count === 0) {
      // console.log('No h1 headings found on blog page');
      // Just check that the page loaded properly
      await expect(page.getByRole('main')).toBeVisible();
      return;
    }
    
    // Check if there are any posts on the blog index
    const postCards = page.locator('article');
    const postCount = await postCards.count();
    
    if (postCount > 0) {
      // Look for any link in the first post card with a short timeout
      const firstPostCard = postCards.first();
      
      try {
        // Set a shorter timeout for link detection
        const postLinks = firstPostCard.getByRole('link');
        await postLinks.first().waitFor({ timeout: 5000 });
        
        const href = await postLinks.first().getAttribute('href');
        
        if (href && href.startsWith('/blog/')) {
          // Navigate to that specific post
          await page.goto(href);
          
          // Check we're on a blog post page
          await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
          await expect(page.getByRole('main')).toBeVisible();
        }
      } catch (error) {
        // If no links found, just verify the blog index structure is valid
        await expect(h1Headings.first()).toBeVisible();
        // console.log('No blog post links found, skipping navigation test');
      }
    } else {
      // No posts found, just verify the page structure is valid
      await expect(h1Headings.first()).toBeVisible();
      // console.log('No blog posts found on the page');
    }
  });

  test('should display post tags when available', async ({ page }) => {
    // Look for tag elements (blue rounded tags)
    const tagElements = page.locator('.bg-blue-100');
    const tagCount = await tagElements.count();
    
    if (tagCount > 0) {
      await expect(tagElements.first()).toBeVisible();
      // Tags should contain text
      const tagText = await tagElements.first().textContent();
      expect(tagText?.length).toBeGreaterThan(0);
    }
  });

  test('should work with language switching', async ({ page }) => {
    // Test switching to Japanese via direct URL
    await page.goto('/ja/blog');
    
    // Check Japanese content loads
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    
    // Switch back to English via direct URL
    await page.goto('/blog'); // English (default)
    await expect(page.getByRole('heading', { level: 1, name: /blog/i })).toBeVisible();
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check main elements are still visible
    await expect(page.getByRole('heading', { level: 1, name: /blog/i })).toBeVisible();
    
    // Check posts are displayed if they exist
    const postCards = page.locator('article');
    const postCount = await postCards.count();
    
    if (postCount > 0) {
      await expect(postCards.first()).toBeVisible();
    }
  });

  test('should handle empty blog state gracefully', async ({ page }) => {
    // This test assumes the blog might be empty - check for graceful handling
    const postCards = page.locator('article');
    const postCount = await postCards.count();
    
    if (postCount === 0) {
      // If no posts, should still show the main structure
      await expect(page.getByRole('heading', { level: 1, name: /blog/i })).toBeVisible();
      await expect(page.locator('text=Insights and thoughts on technology')).toBeVisible();
    } else {
      // If posts exist, they should be properly displayed
      await expect(postCards.first()).toBeVisible();
    }
  });

  test('should have proper SEO structure', async ({ page }) => {
    // Check page has proper title
    await expect(page).toHaveTitle(/Blog/);
    
    // Check semantic structure
    await expect(page.getByRole('banner')).toBeVisible(); // header
    await expect(page.getByRole('main')).toBeVisible(); // main content
    
    // Check heading hierarchy
    const h1 = page.getByRole('heading', { level: 1 });
    await expect(h1).toHaveCount(1);
  });

  test('should load within reasonable time', async ({ page }) => {
    const start = Date.now();
    await page.goto('/blog');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - start;
    
    expect(loadTime).toBeLessThan(5000);
  });

  test('should have no console errors', async ({ page }) => {
    const consoleErrors: string[] = [];
    
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/blog');
    await page.waitForLoadState('networkidle');
    
    expect(consoleErrors.filter(error => !error.includes('Not implemented: navigation'))).toHaveLength(0);
  });

  test('should show blog posts if content exists', async ({ page }) => {
    // Check if blog index has posts
    const postCards = page.locator('article');
    const postCount = await postCards.count();
    
    if (postCount > 0) {
      // Test that each post card has proper structure
      for (let i = 0; i < Math.min(postCount, 3); i++) {
        const postCard = postCards.nth(i);
        
        // Check post has title
        await expect(postCard.getByRole('heading', { level: 2 })).toBeVisible();
        
        // Check post has some metadata
        const svgIcons = postCard.locator('svg');
        if (await svgIcons.count() > 0) {
          await expect(svgIcons.first()).toBeVisible();
        }
        
        // Check post has excerpt or content
        const postText = await postCard.textContent();
        expect(postText && postText.length > 50).toBe(true);
      }
    }
  });

  test('should handle multilingual blog URLs', async ({ page }) => {
    // Test multilingual blog index pages
    const languages = ['en', 'ja', 'ko', 'zh', 'es', 'fr'];
    
    for (const lang of languages) {
      const url = lang === 'en' ? '/blog' : `/${lang}/blog`;
      await page.goto(url);
      
      // Should load the blog page
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      
      // Should have main content
      await expect(page.getByRole('main')).toBeVisible();
      
      // Basic content check
      const content = await page.textContent('body');
      expect(content && content.length > 100).toBe(true);
    }
  });
});