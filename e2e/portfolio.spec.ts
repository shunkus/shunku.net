import { test, expect } from '@playwright/test';

test.describe('Portfolio Site E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display main header with profile information', async ({ page }) => {
    // Check main heading
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Shun Kushigami');
    
    // Check professional title
    await expect(page.locator('text=Cloud Support Engineer / Software Engineer')).toBeVisible();
    
    // Check location
    await expect(page.locator('text=Osaka, Japan')).toBeVisible();
    
    // Check LinkedIn link
    const linkedinLink = page.getByRole('link', { name: /linkedin profile/i });
    await expect(linkedinLink).toBeVisible();
    await expect(linkedinLink).toHaveAttribute('href', 'https://www.linkedin.com/in/shun-kushigami-b9964272');
    await expect(linkedinLink).toHaveAttribute('target', '_blank');
  });

  test('should display profile image', async ({ page }) => {
    const profileImage = page.getByRole('img', { name: /shun kushigami/i });
    await expect(profileImage).toBeVisible();
    await expect(profileImage).toHaveAttribute('src', '/shunku.jpeg');
  });

  test('should navigate through all main sections', async ({ page }) => {
    // Check About section
    await expect(page.getByRole('heading', { name: /about/i })).toBeVisible();
    await expect(page.locator('text=Dedicated and skilled software engineer')).toBeVisible();

    // Check Key Achievements section
    await expect(page.getByRole('heading', { name: /key achievements/i })).toBeVisible();
    await expect(page.locator('text=AWS Support Tools Enhancement')).toBeVisible();
    await expect(page.locator('text=Automation Training Leadership')).toBeVisible();
    await expect(page.locator('text=Tooling & Automation Expertise')).toBeVisible();
    await expect(page.locator('text=Security Leadership')).toBeVisible();

    // Check Professional Experience section
    await expect(page.getByRole('heading', { name: /professional experience/i })).toBeVisible();
    await expect(page.locator('text=Amazon Web Services Japan G.K.')).toBeVisible();
    await expect(page.locator('text=i-plug Inc.')).toBeVisible();
    await expect(page.locator('text=Officemiks Ltd.')).toBeVisible();

    // Check Technical Skills section
    await expect(page.getByRole('heading', { name: /technical skills/i })).toBeVisible();
    await expect(page.locator('span:has-text("JavaScript")')).toBeVisible();
    await expect(page.locator('span:has-text("React")')).toBeVisible();
    await expect(page.locator('span:has-text("Python")')).toBeVisible();
    await expect(page.locator('span:has-text("AWS")')).toBeVisible();

    // Check Recognition Highlights section
    await expect(page.getByRole('heading', { name: /recognition highlights/i })).toBeVisible();
    await expect(page.locator('text=53')).toBeVisible();
    await expect(page.locator('text=Total Achievements')).toBeVisible();

    // Check Education section
    await expect(page.getByRole('heading', { name: /education/i })).toBeVisible();
    await expect(page.locator('text=Kansai Gaidai University')).toBeVisible();

    // Check Languages section
    await expect(page.getByRole('heading', { name: /languages/i })).toBeVisible();
    await expect(page.locator('text=Japanese')).toBeVisible();
    await expect(page.locator('span:has-text("English")')).toBeVisible();
  });

  test('should have proper SEO and accessibility', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/Shun Kushigami - Cloud Support Engineer & Software Engineer/);

    // Check main landmarks for accessibility
    await expect(page.getByRole('banner')).toBeVisible(); // header
    await expect(page.getByRole('main')).toBeVisible(); // main content
    await expect(page.getByRole('contentinfo')).toBeVisible(); // footer

    // Check that headings are properly structured
    const h1 = page.getByRole('heading', { level: 1 });
    const h2s = page.getByRole('heading', { level: 2 });
    
    await expect(h1).toHaveCount(1); // Only one h1
    await expect(h2s).toHaveCount(7); // Multiple h2s for sections
  });

  test('should be responsive on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Check that main elements are still visible
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.locator('text=Cloud Support Engineer / Software Engineer')).toBeVisible();
    
    // Check that profile image is visible
    await expect(page.getByRole('img', { name: /shun kushigami/i })).toBeVisible();
    
    // Check that key sections are accessible
    await expect(page.getByRole('heading', { name: /about/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /key achievements/i })).toBeVisible();
  });

  test('should handle external links correctly', async ({ page }) => {
    // LinkedIn link should open in new tab
    const linkedinLink = page.getByRole('link', { name: /linkedin profile/i });
    await expect(linkedinLink).toHaveAttribute('target', '_blank');
    await expect(linkedinLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  test('should display footer with copyright', async ({ page }) => {
    await expect(page.locator('text=© 2024 Shun Kushigami')).toBeVisible();
    await expect(page.locator('text=Built with Next.js and Tailwind CSS')).toBeVisible();
  });

  test('should load within reasonable time', async ({ page }) => {
    // Measure load time
    const start = Date.now();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - start;
    
    // Should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });

  test('should have no console errors', async ({ page }) => {
    const consoleErrors: string[] = [];
    
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check that there are no console errors
    expect(consoleErrors).toHaveLength(0);
  });
});