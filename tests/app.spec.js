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

[
  {
    input: "{'name': 'John', 'age': 30}",
    expectedOutput: '{\n  "name": "John",\n  "age": 30\n}',
  },
  {
    input: "{'city': 'New York', 'country': 'USA'}",
    expectedOutput: '{\n  "city": "New York",\n  "country": "USA"\n}',
  },
  // Add more test cases as needed
].forEach(({ input, expectedOutput }) => {
  test(`Converting Python dict to JSON with input: ${input}`, async ({ page }) => {
    await page.goto('http://localhost:3000');

    // Enter the Python dictionary in the input textarea
    await page.fill('textarea', input);

    // Wait for the output to be generated
    await page.waitForSelector('.output-content');

    // Check if the output matches the expected JSON
    const outputJson = await page.textContent('.output-content');
    expect(outputJson).toBe(expectedOutput);
  });
});

