import { test, expect } from '@playwright/test';

const BASE = process.env.E2E_BASE_URL || 'http://localhost:3001';

test.describe('Settings deep-link and copy link', () => {
  test('loads with hash and shows correct section', async ({ page }) => {
    await page.goto(BASE + '/settings#branches');
    await expect(page).toHaveURL(/#branches$/);
    // Branches heading should be visible
    await expect(page.locator('h3', { hasText: 'Branches' })).toBeVisible();
  });

  test('clicking nav updates hash and scrolls', async ({ page }) => {
    await page.goto(BASE + '/settings');
    await page.click('button:has-text("Notifications")');
    await expect(page).toHaveURL(/#notifications$/);
    // check that the notifications section header is in the viewport
    const inViewport = await page.evaluate(() => {
      const el = document.getElementById('notifications');
      if (!el) return false;
      const rect = el.getBoundingClientRect();
      return rect.top >= 0 && rect.top < window.innerHeight;
    });
    expect(inViewport).toBeTruthy();
  });

  test('copy link button writes proper url to clipboard (best-effort)', async ({ page }) => {
    await page.goto(BASE + '/settings#profile');
    // Click copy link button
    await page.click('button:has-text("Copy link")');
    // We attempt to read clipboard; some environments may deny access so this is best-effort
    const text = await page.evaluate(async () => {
      try {
        return await navigator.clipboard.readText();
      } catch (e) {
        return null;
      }
    });
    if (text) {
      expect(text).toContain('/settings#profile');
    }
  });
});
