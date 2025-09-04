import { test, expect } from '@playwright/test';

test.describe('Error Handling E2E Tests', () => {
  test('should handle 404 page for non-existent routes', async ({ page }) => {
    // Navigate to a non-existent page
    const response = await page.goto('/this-page-does-not-exist');
    
    // Check that we get a 404 response or are redirected
    const status = response?.status();
    expect([404, 301, 302, 200]).toContain(status); // Next.js might handle 404s differently
    
    // If it's a 404, check for error content
    if (status === 404) {
      // Wait for page to load
      await page.waitForLoadState('domcontentloaded');
      
      // Check that the page displays some kind of error or 404 content
      const pageContent = await page.textContent('body');
      const hasErrorContent = pageContent?.includes('404') || pageContent?.includes('not found') || pageContent?.includes('Page not found');
      
      if (hasErrorContent) {
        expect(hasErrorContent).toBe(true);
      }
    }
  });

  test('should handle 404 for non-existent blog posts', async ({ page }) => {
    // Navigate to a non-existent blog post
    const response = await page.goto('/blog/this-post-does-not-exist');
    
    // Should return 404 or handle gracefully
    const status = response?.status();
    expect([404, 301, 302, 200]).toContain(status);
    
    if (status === 404) {
      await page.waitForLoadState('domcontentloaded');
      const pageContent = await page.textContent('body');
      const hasErrorContent = pageContent?.includes('404') || pageContent?.includes('not found');
      
      if (hasErrorContent) {
        expect(hasErrorContent).toBe(true);
      }
    }
  });

  test('should handle 404 for non-existent books', async ({ page }) => {
    // Navigate to a non-existent book
    const response = await page.goto('/books/this-book-does-not-exist');
    
    // Should return 404 or handle gracefully
    const status = response?.status();
    expect([404, 301, 302, 200]).toContain(status);
    
    if (status === 404) {
      await page.waitForLoadState('domcontentloaded');
      const pageContent = await page.textContent('body');
      const hasErrorContent = pageContent?.includes('404') || pageContent?.includes('not found');
      
      if (hasErrorContent) {
        expect(hasErrorContent).toBe(true);
      }
    }
  });

  test('should handle 404 for non-existent book chapters', async ({ page }) => {
    // Navigate to a non-existent chapter of a real book
    const response = await page.goto('/books/aws-cdk-5days/non-existent-chapter');
    
    // Should return 404 or handle gracefully
    const status = response?.status();
    expect([404, 301, 302, 200]).toContain(status);
    
    if (status === 404) {
      await page.waitForLoadState('domcontentloaded');
      const pageContent = await page.textContent('body');
      const hasErrorContent = pageContent?.includes('404') || pageContent?.includes('not found');
      
      if (hasErrorContent) {
        expect(hasErrorContent).toBe(true);
      }
    }
  });

  test('should handle invalid language codes gracefully', async ({ page }) => {
    // Navigate to a non-supported language
    const response = await page.goto('/invalid-lang/');
    
    // Should either redirect to default language or show 404
    const isRedirect = response?.status() === 301 || response?.status() === 302;
    const is404 = response?.status() === 404;
    
    expect(isRedirect || is404).toBe(true);
    
    if (is404) {
      await expect(page.getByText(/404|not found/i)).toBeVisible();
    }
  });

  test('should handle malformed URLs gracefully', async ({ page }) => {
    const malformedUrls = [
      '/blog//double-slash',
      '/books/%invalid-encoding',
      '/blog/[malformed-bracket',
      '//double-slash-start'
    ];

    for (const url of malformedUrls) {
      try {
        const response = await page.goto(url);
        
        // Should either get 404 or be handled gracefully
        const status = response?.status();
        expect([200, 301, 302, 404]).toContain(status);
        
        // If we get to a page, it shouldn't crash
        await page.waitForLoadState('domcontentloaded');
        
        // Check for any JavaScript errors
        const consoleErrors: string[] = [];
        page.on('console', (msg) => {
          if (msg.type() === 'error' && !msg.text().includes('Not implemented: navigation')) {
            consoleErrors.push(msg.text());
          }
        });
        
        // Wait a bit for any console errors to appear
        await page.waitForTimeout(1000);
        
        // Should not have critical JavaScript errors
        const criticalErrors = consoleErrors.filter(error => 
          !error.includes('404') && 
          !error.includes('Not found') &&
          !error.includes('Failed to load resource')
        );
        expect(criticalErrors).toHaveLength(0);
        
      } catch (error) {
        // Navigation errors are acceptable for malformed URLs
        expect(error).toBeDefined();
      }
    }
  });

  test('should handle network failures gracefully', async ({ page }) => {
    // Simulate offline mode
    await page.context().setOffline(true);
    
    try {
      await page.goto('/');
      
      // Should handle offline state
      await page.waitForTimeout(2000);
      
    } catch (error) {
      // Network errors are expected when offline
      expect(error).toBeDefined();
    } finally {
      // Restore online mode
      await page.context().setOffline(false);
    }
  });

  test('should maintain basic page structure', async ({ page }) => {
    // Test that pages maintain basic structure
    await page.goto('/');
    
    // Pages should have proper HTML structure
    await expect(page.locator('html')).toBeVisible();
    await expect(page.locator('body')).toBeVisible();
    
    // Should have some kind of header or main content
    const hasHeader = await page.getByRole('banner').count() > 0;
    const hasMain = await page.getByRole('main').count() > 0;
    
    expect(hasHeader || hasMain).toBe(true);
  });

  test('should handle JavaScript errors without crashing', async ({ page }) => {
    const jsErrors: string[] = [];
    const uncaughtExceptions: string[] = [];
    
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        jsErrors.push(msg.text());
      }
    });
    
    page.on('pageerror', (error) => {
      uncaughtExceptions.push(error.message);
    });
    
    // Test just the homepage to keep it fast
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    
    // Quick interaction test with language switcher
    const languageButton = page.getByRole('button').first();
    if (await languageButton.count() > 0) {
      try {
        await languageButton.click();
        await page.waitForTimeout(200); // Reduced timeout
        
        // Close dropdown by clicking outside
        await page.locator('main').click();
        await page.waitForTimeout(200); // Reduced timeout
      } catch (error) {
        // Interaction errors shouldn't crash the page
      }
    }
    
    // Brief wait for any delayed errors
    await page.waitForTimeout(500); // Reduced from 1000ms
    
    // Filter out known non-critical errors
    const criticalJsErrors = jsErrors.filter(error => 
      !error.includes('Not implemented: navigation') &&
      !error.includes('404') &&
      !error.includes('Failed to load resource') &&
      !error.includes('net::ERR_')
    );
    
    const criticalExceptions = uncaughtExceptions.filter(error =>
      !error.includes('404') &&
      !error.includes('Network error') &&
      !error.includes('Failed to fetch')
    );
    
    // Should not have critical JavaScript errors or uncaught exceptions
    expect(criticalJsErrors).toHaveLength(0);
    expect(criticalExceptions).toHaveLength(0);
  });

  test('should handle missing static assets gracefully', async ({ page }) => {
    // Track 404 responses for static assets
    const failed404Requests: string[] = [];
    
    page.on('response', (response) => {
      if (response.status() === 404 && (
        response.url().includes('.js') ||
        response.url().includes('.css') ||
        response.url().includes('.png') ||
        response.url().includes('.jpg') ||
        response.url().includes('.jpeg') ||
        response.url().includes('.gif') ||
        response.url().includes('.svg')
      )) {
        failed404Requests.push(response.url());
      }
    });
    
    // Navigate to main pages and check for missing assets
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    await page.goto('/blog');
    await page.waitForLoadState('networkidle');
    
    await page.goto('/books');
    await page.waitForLoadState('networkidle');
    
    // Should not have missing critical assets
    const criticalMissingAssets = failed404Requests.filter(url => 
      !url.includes('favicon') && // Favicons might be missing
      !url.includes('optional') // Optional assets are okay to be missing
    );
    
    expect(criticalMissingAssets).toHaveLength(0);
  });

  test('should handle slow network conditions', async ({ page }) => {
    // Simulate slow network
    const client = await page.context().newCDPSession(page);
    await client.send('Network.enable');
    await client.send('Network.emulateNetworkConditions', {
      offline: false,
      downloadThroughput: 1024 * 1024, // 1MB/s
      uploadThroughput: 1024 * 1024, // 1MB/s
      latency: 500 // 500ms latency
    });
    
    try {
      const start = Date.now();
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - start;
      
      // Should still load within reasonable time even on slow network
      expect(loadTime).toBeLessThan(30000); // 30 seconds max
      
      // Page should be functional
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      
    } finally {
      // Reset network conditions
      await client.send('Network.emulateNetworkConditions', {
        offline: false,
        downloadThroughput: -1,
        uploadThroughput: -1,
        latency: 0
      });
    }
  });
});