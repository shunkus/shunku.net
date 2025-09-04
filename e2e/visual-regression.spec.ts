import { test, expect } from '@playwright/test';

test.describe('Visual Regression Tests', () => {
  test('should match homepage screenshot on desktop', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Wait for fonts and images to load
    await page.waitForTimeout(2000);
    
    // Desktop screenshot
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page).toHaveScreenshot('homepage-desktop.png', {
      fullPage: true,
      threshold: 0.4, // More lenient threshold
      maxDiffPixels: 10000
    });
  });

  test('should match blog index screenshot', async ({ page }) => {
    await page.goto('/blog');
    await page.waitForLoadState('networkidle');
    
    // Wait for any dynamic content to load
    await page.waitForTimeout(2000);
    
    await expect(page).toHaveScreenshot('blog-index.png', {
      fullPage: true,
      threshold: 0.4,
      maxDiffPixels: 10000
    });
  });

  test('should match books index screenshot', async ({ page }) => {
    await page.goto('/books');
    await page.waitForLoadState('networkidle');
    
    // Wait for any dynamic content to load
    await page.waitForTimeout(2000);
    
    await expect(page).toHaveScreenshot('books-index.png', {
      fullPage: true,
      threshold: 0.4,
      maxDiffPixels: 10000
    });
  });

  test('should match mobile responsive view', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Mobile screenshot
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);
    
    await expect(page).toHaveScreenshot('homepage-mobile.png', {
      fullPage: true,
      threshold: 0.4,
      maxDiffPixels: 8000
    });
  });

  // Simple visual test to verify layouts render correctly
  test('should render page layouts correctly', async ({ page }) => {
    const pages = ['/', '/blog', '/books'];
    
    for (const pagePath of pages) {
      await page.goto(pagePath);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
      
      // Check that content is actually rendered
      const body = await page.textContent('body');
      expect(body && body.length > 100).toBe(true); // Page has substantial content
      
      // Check that main elements are visible
      const hasHeading = await page.locator('h1').count() > 0;
      expect(hasHeading).toBe(true);
    }
  });

});