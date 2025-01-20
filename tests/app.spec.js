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
  {
    input: "{'data': {\"\": 'nested', 'stuff': {\"nested\": 'value'}},}",
    expectedOutput: '{\n  "data": {\n    "": "nested",\n    "stuff": {\n      "nested": "value"\n    }\n  }\n}',
  },
  {
    input: "{'data': {'a': \"{'b': 'c'}\"}}",
    expectedOutput: '{\n  "data": {\n    "a": "{\'b\': \'c\'}"\n  }\n}',
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

