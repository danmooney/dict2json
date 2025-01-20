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
});

