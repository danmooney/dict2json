import { test, expect } from '@playwright/test';

test('Mobile view shows tabs and toggles content correctly', async ({ page }) => {
  // Set viewport to mobile size
  await page.setViewportSize({ width: 500, height: 800 });
  await page.goto('http://localhost:3000');

  // Check if tabs are visible in mobile view
  const tabs = await page.locator('.tabs');
  expect(await tabs.isVisible()).toBe(true);

  // Initially input should be visible and output hidden
  expect(await page.locator('.input').isVisible()).toBe(true);
  expect(await page.locator('.output').isVisible()).toBe(false);

  // Click output tab
  await page.click('.tabs button:has-text("Output")');
  
  // Now output should be visible and input hidden
  expect(await page.locator('.input').isVisible()).toBe(false);
  expect(await page.locator('.output').isVisible()).toBe(true);

  // Click input tab
  await page.click('.tabs button:has-text("Input")');
  
  // Input should be visible again and output hidden
  expect(await page.locator('.input').isVisible()).toBe(true);
  expect(await page.locator('.output').isVisible()).toBe(false);

  // Test that conversion still works in mobile view
  await page.fill('textarea', "{'test': True}");
  await page.click('.tabs button:has-text("Output")');
  const outputJson = await page.textContent('.output-content');
  expect(outputJson).toBe('{\n  "test": true\n}');
});

test('Desktop view shows both panels simultaneously', async ({ page }) => {
  // Set viewport to desktop size
  await page.setViewportSize({ width: 1024, height: 768 });
  await page.goto('http://localhost:3000');

  // Tabs should not be visible in desktop view
  const tabs = await page.locator('.tabs');
  expect(await tabs.isVisible()).toBe(false);

  // Both panels should be visible
  expect(await page.locator('.input').isVisible()).toBe(true);
  expect(await page.locator('.output').isVisible()).toBe(true);
}); 