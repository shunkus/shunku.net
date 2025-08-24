import { test, expect } from '@playwright/test';

test.describe('E2E Coverage Tests', () => {
  test('should cover main user interactions', async ({ page }) => {
    // Start collecting coverage
    await page.coverage.startJSCoverage();
    await page.coverage.startCSSCoverage();

    // Navigate to the portfolio
    await page.goto('/');
    
    // Wait for page to fully load
    await page.waitForLoadState('networkidle');

    // Simulate user interactions
    
    // 1. Scroll through all sections (simulates reading behavior)
    await page.getByRole('heading', { name: /about/i }).scrollIntoViewIfNeeded();
    await page.getByRole('heading', { name: /key achievements/i }).scrollIntoViewIfNeeded();
    await page.getByRole('heading', { name: /professional experience/i }).scrollIntoViewIfNeeded();
    await page.getByRole('heading', { name: /technical skills/i }).scrollIntoViewIfNeeded();
    await page.getByRole('heading', { name: /recognition highlights/i }).scrollIntoViewIfNeeded();
    await page.getByRole('heading', { name: /education/i }).scrollIntoViewIfNeeded();
    await page.getByRole('heading', { name: /languages/i }).scrollIntoViewIfNeeded();

    // 2. Hover over skill tags (interactive elements)
    const skillTags = page.locator('.bg-blue-100');
    const count = await skillTags.count();
    for (let i = 0; i < Math.min(count, 5); i++) {
      await skillTags.nth(i).hover();
      await page.waitForTimeout(100);
    }

    // 3. Hover over achievement cards
    const achievementCards = page.locator('[class*="hover:shadow-md"]');
    const achievementCount = await achievementCards.count();
    for (let i = 0; i < achievementCount; i++) {
      await achievementCards.nth(i).hover();
      await page.waitForTimeout(100);
    }

    // 4. Test responsive behavior by changing viewport
    await page.setViewportSize({ width: 768, height: 1024 }); // Tablet
    await page.waitForTimeout(500);
    await page.setViewportSize({ width: 375, height: 667 }); // Mobile
    await page.waitForTimeout(500);
    await page.setViewportSize({ width: 1920, height: 1080 }); // Desktop

    // 5. Check LinkedIn link (without clicking to external site)
    const linkedinLink = page.getByRole('link', { name: /linkedin profile/i });
    await linkedinLink.hover();
    
    // Stop coverage collection
    const jsCoverage = await page.coverage.stopJSCoverage();
    const cssCoverage = await page.coverage.stopCSSCoverage();

    // Log coverage summary
    let totalBytes = 0;
    let usedBytes = 0;

    console.log('\n=== JavaScript Coverage ===');
    for (const entry of jsCoverage) {
      if (entry.url.includes('/_next/static/') || entry.url.includes('.js')) {
        const fileSize = entry.text?.length || 0;
        totalBytes += fileSize;
        
        let fileUsedBytes = 0;
        for (const range of entry.ranges) {
          fileUsedBytes += range.end - range.start - 1;
        }
        usedBytes += fileUsedBytes;
        
        const fileCoverage = fileSize > 0 ? ((fileUsedBytes / fileSize) * 100).toFixed(2) : '0';
        console.log(`${entry.url.split('/').pop()}: ${fileCoverage}% (${fileUsedBytes}/${fileSize} bytes)`);
      }
    }

    const jsCoveragePercent = totalBytes > 0 ? ((usedBytes / totalBytes) * 100).toFixed(2) : '0';
    console.log(`\nOverall JS Coverage: ${jsCoveragePercent}% (${usedBytes}/${totalBytes} bytes)`);

    let totalCSSBytes = 0;
    let usedCSSBytes = 0;

    console.log('\n=== CSS Coverage ===');
    for (const entry of cssCoverage) {
      if (entry.url.includes('/_next/static/') || entry.url.includes('.css')) {
        const fileSize = entry.text?.length || 0;
        totalCSSBytes += fileSize;
        
        let fileUsedBytes = 0;
        for (const range of entry.ranges) {
          fileUsedBytes += range.end - range.start - 1;
        }
        usedCSSBytes += fileUsedBytes;
        
        const fileCoverage = fileSize > 0 ? ((fileUsedBytes / fileSize) * 100).toFixed(2) : '0';
        console.log(`${entry.url.split('/').pop()}: ${fileCoverage}% (${fileUsedBytes}/${fileSize} bytes)`);
      }
    }

    const cssCoveragePercent = totalCSSBytes > 0 ? ((usedCSSBytes / totalCSSBytes) * 100).toFixed(2) : '0';
    console.log(`\nOverall CSS Coverage: ${cssCoveragePercent}% (${usedCSSBytes}/${totalCSSBytes} bytes)`);

    // Basic assertions
    expect(Number(jsCoveragePercent)).toBeGreaterThan(0);
    expect(Number(cssCoveragePercent)).toBeGreaterThan(0);
  });
});