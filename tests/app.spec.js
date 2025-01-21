import { test, expect } from '@playwright/test';

test('App loads and displays content', async ({ page }) => {
  await page.goto('http://localhost:3000');

  // Check if the app title is visible
  const appTitle = await page.textContent('h1');
  expect(appTitle).toBe('Python Dict to JSON Converter');

  // Check if the input and output sections are present
  const inputSection = await page.isVisible('.input');
  expect(inputSection).toBe(true);

  const outputSection = await page.isVisible('.output');
  expect(outputSection).toBe(true);

  // Check that input and output sections have sufficient width
  const inputBox = await page.locator('.input').boundingBox();
  const outputBox = await page.locator('.output').boundingBox();
  const viewport = page.viewportSize();

  // Expect sections to take up at least 25% of viewport width each
  // Combined with gap this ensures they fill the 60% container appropriately
  expect(inputBox.width).toBeGreaterThan(viewport.width * 0.25);
  expect(outputBox.width).toBeGreaterThan(viewport.width * 0.25);
});

