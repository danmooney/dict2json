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
    input: "{'city': 'New York', \"country\": 'USA'}",
    expectedOutput: '{\n  "city": "New York",\n  "country": "USA"\n}',
  },
  {
    input: "{'city': 'New York', 'country': 'USA',}",
    expectedOutput: '{\n  "city": "New York",\n  "country": "USA"\n}',
  },
  {
    input: "{'city': 'New York', 'country': 'USA', 'country': 'Canada'}",
    expectedOutput: '{\n  "city": "New York",\n  "country": "Canada"\n}', // last entry wins
  },
  {
    input: "{'is_cool': True}",
    expectedOutput: '{\n  "is_cool": true\n}',
  },
  {
    input: "{'is_cool': False}",
    expectedOutput: '{\n  "is_cool": false\n}',
  },
  {
    input: "{'data': None}",
    expectedOutput: '{\n  "data": null\n}',
  },
  {
    input: "{'status': True, 'message': None, 'error': False}",
    expectedOutput: '{\n  "status": true,\n  "message": null,\n  "error": false\n}',
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

