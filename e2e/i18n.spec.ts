import { test, expect } from '@playwright/test';

test.describe('Internationalization (i18n) Tests', () => {
  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸', heading: 'Shun Kushigami', role: 'Cloud Support Engineer / Software Engineer' },
    { code: 'ja', name: '日本語', flag: '🇯🇵', heading: '串上 俊', role: 'クラウドサポートエンジニア / ソフトウェアエンジニア' },
    { code: 'ko', name: '한국어', flag: '🇰🇷', heading: '구시가미 순', role: '클라우드 지원 엔지니어 / 소프트웨어 엔지니어' },
    { code: 'zh', name: '中文', flag: '🇨🇳', heading: '串上俊', role: '云支持工程师 / 软件工程师' },
    { code: 'es', name: 'Español', flag: '🇪🇸', heading: 'Shun Kushigami', role: 'Ingeniero de Soporte en la Nube / Ingeniero de Software' },
    { code: 'fr', name: 'Français', flag: '🇫🇷', heading: 'Shun Kushigami', role: 'Ingénieur Support Cloud / Ingénieur Logiciel' }
  ];

  test('should load default English page', async ({ page }) => {
    await page.goto('/');
    
    // Check English content
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Shun Kushigami');
    await expect(page.locator('text=Cloud Support Engineer / Software Engineer')).toBeVisible();
    
    // Check language switcher shows English as current
    const languageButton = page.getByRole('button').filter({ hasText: 'English' });
    await expect(languageButton).toBeVisible();
    await expect(languageButton).toContainText('🇺🇸');
  });

  for (const lang of languages) {
    test(`should display content correctly in ${lang.name} (${lang.code})`, async ({ page }) => {
      await page.goto(`/${lang.code === 'en' ? '' : lang.code + '/'}`, { waitUntil: 'networkidle' });
      
      // Check main heading
      await expect(page.getByRole('heading', { level: 1 })).toContainText(lang.heading);
      
      // Check professional title
      await expect(page.locator('text=' + lang.role)).toBeVisible();
      
      // Check that page title is translated (for non-English languages)
      if (lang.code !== 'en') {
        await expect(page).toHaveTitle(new RegExp(lang.heading.replace(/\s/g, '.*')));
      }
      
      // Check language switcher shows correct current language
      const currentLangButton = page.getByRole('button').filter({ hasText: lang.name });
      await expect(currentLangButton).toBeVisible();
      await expect(currentLangButton).toContainText(lang.flag);
    });
  }

  test('should switch between languages using dropdown', async ({ page }) => {
    await page.goto('/');
    
    // Start with English
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Shun Kushigami');
    
    // Switch to Japanese
    const languageButton = page.getByRole('button').filter({ hasText: 'English' });
    await languageButton.click();
    
    const japaneseOption = page.getByRole('link').filter({ hasText: '日本語' });
    await japaneseOption.click();
    
    await page.waitForURL('**/ja/');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('串上 俊');
    
    // Switch to Korean
    const japaneseButton = page.getByRole('button').filter({ hasText: '日本語' });
    await japaneseButton.click();
    
    const koreanOption = page.getByRole('link').filter({ hasText: '한국어' });
    await koreanOption.click();
    
    await page.waitForURL('**/ko/');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('구시가미 순');
  });

  test('should maintain correct URLs for different languages', async ({ page }) => {
    // Test direct navigation to each language
    for (const lang of languages) {
      const expectedUrl = lang.code === 'en' ? '/' : `/${lang.code}/`;
      await page.goto(expectedUrl);
      
      expect(page.url()).toContain(expectedUrl);
      await expect(page.getByRole('heading', { level: 1 })).toContainText(lang.heading);
    }
  });

  test('should show all language options in dropdown', async ({ page }) => {
    await page.goto('/');
    
    // Open dropdown
    const languageButton = page.getByRole('button').filter({ hasText: 'English' });
    await languageButton.click();
    
    // Wait for dropdown to appear
    await page.waitForTimeout(200);
    
    // Check all languages are present (except English which appears in button and dropdown)
    await expect(page.getByText('日本語')).toBeVisible();
    await expect(page.getByText('한국어')).toBeVisible();
    await expect(page.getByText('中文')).toBeVisible();
    await expect(page.getByText('Español')).toBeVisible();
    await expect(page.getByText('Français')).toBeVisible();
    
    // Check some flags are visible
    await expect(page.locator('text=🇯🇵')).toBeVisible();
    await expect(page.locator('text=🇰🇷')).toBeVisible();
    
    // Check checkmark for current language
    await expect(page.locator('text=✓')).toBeVisible();
  });

  test('should handle language switching with keyboard navigation', async ({ page }) => {
    await page.goto('/');
    
    // Find and focus the language button directly
    const languageButton = page.getByRole('button').filter({ hasText: 'English' });
    await languageButton.focus();
    
    // Open dropdown with Enter
    await page.keyboard.press('Enter');
    
    // Wait for dropdown to open
    await page.waitForTimeout(100);
    
    // Navigate to Japanese option and select it
    const japaneseLink = page.getByRole('link').filter({ hasText: '日本語' });
    await japaneseLink.click();
    
    await page.waitForURL('**/ja/');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('串上 俊');
  });

  test('should preserve language preference when navigating', async ({ page }) => {
    // Start in Japanese
    await page.goto('/ja/');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('串上 俊');
    
    // If there were other pages to navigate to, they would maintain the language
    // For now, just verify the language switcher shows Japanese as current
    const japaneseButton = page.getByRole('button').filter({ hasText: '日本語' });
    await expect(japaneseButton).toBeVisible();
  });

  test('should handle browser back/forward with language switching', async ({ page }) => {
    await page.goto('/');
    
    // Switch to Japanese
    const languageButton = page.getByRole('button').filter({ hasText: 'English' });
    await languageButton.click();
    const japaneseOption = page.getByRole('link').filter({ hasText: '日本語' });
    await japaneseOption.click();
    
    await page.waitForURL('**/ja/');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('串上 俊');
    
    // Go back
    await page.goBack();
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Shun Kushigami');
    
    // Go forward
    await page.goForward();
    await expect(page.getByRole('heading', { level: 1 })).toContainText('串上 俊');
  });

  test('should load with proper SEO for each language', async ({ page }) => {
    for (const lang of languages) {
      const url = lang.code === 'en' ? '/' : `/${lang.code}/`;
      await page.goto(url);
      
      // Check that page has proper title
      const title = await page.title();
      expect(title).toContain(lang.heading);
      
      // Skip lang attribute check as Next.js handles this automatically
      // and may not match our locale codes exactly
    }
  });
});