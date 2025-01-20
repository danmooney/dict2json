import { test, expect } from '@playwright/test';

test('File upload functionality works', async ({ page }) => {
  await page.goto('http://localhost:3000');

  // Create a test file with Python dictionary content
  const fileContent = "{'test': True, 'nested': {'key': 'value'}}";
  const expectedOutput = '{\n  "test": true,\n  "nested": {\n    "key": "value"\n  }\n}';

  // Set up file input handling
  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles({
    name: 'test.txt',
    mimeType: 'text/plain',
    buffer: Buffer.from(fileContent),
  });

  // Wait for the input to be populated
  await expect(page.locator('textarea').first()).toHaveValue(fileContent);

  // Check if the output is correctly converted
  await expect(page.locator('.output-content')).toHaveValue(expectedOutput);
});

test('File upload works in mobile view', async ({ page }) => {
  // Set mobile viewport
  await page.setViewportSize({ width: 500, height: 800 });
  await page.goto('http://localhost:3000');

  // Create a test file with Python dictionary content
  const fileContent = "{'test': True, 'nested': {'key': 'value'}}";
  const expectedOutput = '{\n  "test": true,\n  "nested": {\n    "key": "value"\n  }\n}';

  // Set up file input handling
  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles({
    name: 'test.txt',
    mimeType: 'text/plain',
    buffer: Buffer.from(fileContent),
  });

  // Wait for the input to be populated
  await expect(page.locator('textarea').first()).toHaveValue(fileContent);

  // Switch to output tab to verify conversion
  await page.click('.tabs button:has-text("Output")');
  await expect(page.locator('.output-content')).toHaveValue(expectedOutput);
}); 