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

test('Converting Python dict to JSON', async ({ page }) => {
  await page.goto('http://localhost:3000');

  // Enter a Python dictionary in the input textarea
  await page.fill('textarea', "{'name': 'John', 'age': 30}");

  // Wait for the output to be generated
  await page.waitForSelector('.output-content');

  // Check if the output is the expected JSON
  const outputJson = await page.textContent('.output-content');
  expect(outputJson).toBe('{\n  "name": "John",\n  "age": 30\n}');
});
