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
    // Check for English in languages section specifically
    await expect(page.locator('section').last().locator('text=English')).toBeVisible();
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

  test('should display and interact with language switcher', async ({ page }) => {
    // Check that language switcher is visible
    const languageButton = page.getByRole('button').filter({ hasText: 'English' });
    await expect(languageButton).toBeVisible();
    await expect(languageButton).toContainText('🇺🇸');

    // Click to open dropdown
    await languageButton.click();

    // Check all language options are visible
    await expect(page.getByText('English').nth(1)).toBeVisible(); // Dropdown option
    await expect(page.getByText('日本語')).toBeVisible();
    await expect(page.getByText('한국어')).toBeVisible();
    await expect(page.getByText('中文')).toBeVisible();
    await expect(page.getByText('Español')).toBeVisible();
    await expect(page.getByText('Français')).toBeVisible();

    // Check that flags are displayed
    await expect(page.locator('text=🇺🇸').nth(1)).toBeVisible();
    await expect(page.locator('text=🇯🇵')).toBeVisible();
    await expect(page.locator('text=🇰🇷')).toBeVisible();
    await expect(page.locator('text=🇨🇳')).toBeVisible();
    await expect(page.locator('text=🇪🇸')).toBeVisible();
    await expect(page.locator('text=🇫🇷')).toBeVisible();
  });

  test('should switch to Japanese language', async ({ page }) => {
    // Open language switcher
    const languageButton = page.getByRole('button').filter({ hasText: 'English' });
    await languageButton.click();

    // Click on Japanese option
    const japaneseOption = page.getByRole('link').filter({ hasText: '日本語' });
    await japaneseOption.click();

    // Wait for navigation
    await page.waitForURL('**/ja/');
    
    // Check that content is in Japanese
    await expect(page.getByRole('heading', { level: 1 })).toContainText('串上 俊');
    await expect(page.locator('p:has-text("クラウドサポートエンジニア / ソフトウェアエンジニア")')).toBeVisible();
    await expect(page.getByRole('heading', { name: /自己紹介/i })).toBeVisible();
  });

  test('should maintain functionality across different languages', async ({ page }) => {
    // Test switching to each language
    const languages = [
      { code: 'ja', name: '日本語', flag: '🇯🇵', heading: '串上 俊' },
      { code: 'ko', name: '한국어', flag: '🇰🇷', heading: '구시가미 순' },
      { code: 'zh', name: '中文', flag: '🇨🇳', heading: '串上俊' },
      { code: 'es', name: 'Español', flag: '🇪🇸', heading: 'Shun Kushigami' },
      { code: 'fr', name: 'Français', flag: '🇫🇷', heading: 'Shun Kushigami' }
    ];

    for (const lang of languages) {
      // Navigate directly to language
      await page.goto(`/${lang.code}/`);
      
      // Check that the page loads
      await expect(page.getByRole('heading', { level: 1 })).toContainText(lang.heading);
      
      // Check that language switcher shows correct current language
      const currentLangButton = page.getByRole('button').filter({ hasText: lang.name });
      await expect(currentLangButton).toBeVisible();
      await expect(currentLangButton).toContainText(lang.flag);
    }
  });

  test('should close language dropdown when clicking outside', async ({ page }) => {
    // Open language switcher
    const languageButton = page.getByRole('button').filter({ hasText: 'English' });
    await languageButton.click();

    // Verify dropdown is open
    await expect(page.getByText('日本語')).toBeVisible();

    // Click outside the dropdown
    await page.locator('main').click();

    // Verify dropdown is closed
    await expect(page.getByText('日本語')).not.toBeVisible();
  });
});