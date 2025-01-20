import { test, expect } from '@playwright/test';

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
    expectedOutput: '{\n  "city": "New York",\n  "country": "Canada"\n}',
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
  {
    input: `\n\n    {'data': {'nested': {"stuff": "{in quotes ' \\" the raven }"}}}    \n\n`,
    expectedOutput: '{\n  "data": {\n    "nested": {\n      "stuff": "{in quotes \' \\" the raven }"\n    }\n  }\n}',
  },
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