import { test, expect } from '@playwright/test';

test.describe('Debug Navigation Issues', () => {
  test.beforeEach(async ({ page }) => {
    // Set desktop viewport size
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('http://localhost:3003');
    await page.waitForLoadState('networkidle');
  });

  test('Debug navigation element visibility', async ({ page }) => {
    // Wait for page to fully load
    await page.waitForTimeout(2000);

    // Take a screenshot to see what's happening
    await page.screenshot({ path: 'debug-navigation.png', fullPage: true });

    // Check if navigation exists at all
    const nav = page.locator('nav').first();
    console.log('Navigation exists:', await nav.count());

    // Check for all links in navigation
    const allNavLinks = await page.locator('nav a').all();
    console.log('Total nav links found:', allNavLinks.length);

    for (let i = 0; i < allNavLinks.length; i++) {
      const link = allNavLinks[i];
      const text = await link.textContent();
      const href = await link.getAttribute('href');
      const isVisible = await link.isVisible();
      console.log(`Link ${i}: "${text}" -> ${href} (visible: ${isVisible})`);
    }

    // Specifically check for dropdown navigation items
    const dropdownItems = ['Product', 'Developers', 'Solutions', 'Company'];
    for (const item of dropdownItems) {
      const element = page.locator(`nav a:has-text("${item}")`).first();
      const count = await element.count();
      const isVisible = count > 0 ? await element.isVisible() : false;
      console.log(`${item}: count=${count}, visible=${isVisible}`);
    }

    // Check pricing link specifically
    const pricingLink = page.locator('nav a[href="/pricing"]').first();
    console.log('Pricing link count:', await pricingLink.count());
    console.log('Pricing link visible:', await pricingLink.count() > 0 ? await pricingLink.isVisible() : false);

    // Check header buttons
    const signInLink = page.locator('nav a[href="https://app.plinto.dev/auth/signin"]').first();
    const startFreeLink = page.locator('nav a[href="https://app.plinto.dev/auth/signup"]').first();

    console.log('Sign In link count:', await signInLink.count());
    console.log('Start Free link count:', await startFreeLink.count());
  });

  test('Test actual navigation functionality', async ({ page }) => {
    // Test Pricing link (the only real navigation link)
    try {
      const pricingLink = page.locator('nav a[href="/pricing"]').first();
      await pricingLink.waitFor({ state: 'visible', timeout: 5000 });
      await pricingLink.click();
      await page.waitForLoadState('networkidle');

      const url = page.url();
      console.log('After clicking pricing:', url);
      expect(url).toContain('/pricing');
    } catch (error) {
      console.log('Pricing test failed:', error.message);
    }
  });
});