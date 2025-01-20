import { test, expect } from '@playwright/test';

test('Copy to clipboard functionality works', async ({ page }) => {
  await page.goto('http://localhost:3000');

  // Enter some test data
  await page.fill('textarea', "{'test': True}");

  // Wait for conversion and click copy button
  await page.waitForSelector('.output-content');
  await expect(page.locator('.output-content')).toHaveValue('{\n  "test": true\n}');
  
  await page.getByTestId('copy-button').click();

  // Wait for clipboard operation to complete
  await page.waitForTimeout(100);

  // Get clipboard content
  const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
  expect(clipboardText).toBe('{\n  "test": true\n}');

  // Verify toast appears
  const toast = page.locator('.toast');
  await expect(toast).toBeVisible();
  await expect(toast).toContainText('Copied to clipboard!');
});

test('Copy to clipboard works in mobile view', async ({ page }) => {
  // Set mobile viewport
  await page.setViewportSize({ width: 500, height: 800 });
  await page.goto('http://localhost:3000');

  // Enter test data
  await page.fill('textarea', "{'test': True}");

  // Switch to output tab and copy
  await page.click('.tabs button:has-text("Output")');
  await expect(page.locator('.output-content')).toHaveValue('{\n  "test": true\n}');
  
  await page.getByTestId('copy-button').click();

  // Wait for clipboard operation to complete
  await page.waitForTimeout(100);

  // Get clipboard content
  const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
  expect(clipboardText).toBe('{\n  "test": true\n}');

  // Verify toast appears
  const toast = page.locator('.toast');
  await expect(toast).toBeVisible();
  await expect(toast).toContainText('Copied to clipboard!');
});

test('Copy error message to clipboard when error exists', async ({ page }) => {
  await page.goto('http://localhost:3000');
  
  // Enter invalid Python dictionary
  await page.fill('textarea', "{'invalid': syntax}}");
  
  // Wait for error to appear
  const expectedError = await page.locator('.output-content').inputValue();
  
  // Click copy button
  await page.getByTestId('copy-button').click();
  
  // Wait for clipboard operation to complete
  await page.waitForTimeout(100);
  
  // Get clipboard content and verify it contains error message
  const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
  expect(clipboardText).toBe(expectedError);
  
  // Verify toast appears
  const toast = page.locator('.toast');
  await expect(toast).toBeVisible();
  await expect(toast).toContainText('Copied to clipboard!');
}); 