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

test('Tooltips are visible on hover in desktop view and hidden in mobile', async ({ page }) => {
  // Desktop view
  await page.setViewportSize({ width: 1024, height: 768 });
  await page.goto('http://localhost:3000');

  // Check upload button tooltip
  const uploadButton = page.locator('.toolbar-button', { hasText: '' }).first();
  await uploadButton.hover();
  
  // Wait for tooltip and verify its content
  const uploadTooltip = page.getByTestId('upload-tooltip');
  await expect(uploadTooltip).toBeVisible();
  await expect(uploadTooltip).toHaveText('Upload File');

  // Check copy button tooltip
  const copyButton = page.locator('.toolbar-button').last();
  await copyButton.hover();

  // Wait for tooltip and verify its content
  const copyTooltip = page.getByTestId('copy-tooltip');
  await expect(copyTooltip).toBeVisible();
  await expect(copyTooltip).toHaveText('Copy to Clipboard');

  // Mobile view - tooltips should not be visible
  await page.setViewportSize({ width: 500, height: 800 });
  
  // Hover buttons again
  await uploadButton.hover();
  await copyButton.hover();

  // Verify tooltips are not visible in mobile view
  await expect(uploadTooltip).not.toBeVisible();
  await expect(copyTooltip).not.toBeVisible();
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
  {
    input: `\n\n    {'data': {'nested': {"stuff": "{in quotes ' \\" the raven }"}}}    \n\n`,
    expectedOutput: '{\n  "data": {\n    "nested": {\n      "stuff": "{in quotes \' \\" the raven }"\n    }\n  }\n}',
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

test('Copy to clipboard functionality works', async ({ page }) => {
  await page.goto('http://localhost:3000');

  // Enter some test data
  await page.fill('textarea', "{'test': True}");

  // Wait for conversion and click copy button
  await page.waitForSelector('.output-content');
  // Wait for the output to be populated
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
  // Wait for the output to be populated
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

async function setupLineHighlightTest(page, options = {}) {
  const LINE_HEIGHT = 24;
  const isMobile = options.isMobile || false;
  const section = options.section || 'input';

  if (isMobile) {
    await page.setViewportSize({ width: 500, height: 800 });
  }
  
  await page.goto('http://localhost:3000');
  await page.fill('textarea', "{'key1': 'value1'}");

  // expect input container to have focus, and output container to not
  const inputContainer = page.locator('.input .editor-container');
  await expect(inputContainer).toHaveClass(/focused/);

  if (!isMobile) {
    const outputContainer = page.locator('.output .editor-container');
    await expect(outputContainer).not.toHaveClass(/focused/);
  }

  // get requested section's container
  const container = page.locator(`.${section} .editor-container`);
  const initialStyle = await container.getAttribute('style');
  const initialOffset = parseInt(initialStyle.match(/--line-offset: (\d+)px/)[1]);

  // get requested section's textarea
  const textarea = page.locator(`.${section} textarea`);

  return { textarea, container, initialOffset, LINE_HEIGHT };
}

async function addLineAndMoveCursor(textarea, text) {
  // Type a newline followed by the text
  await textarea.press('Enter');
  await textarea.type(text);
  await textarea.press('Home'); // Move to start of new line
}

test('Line highlighting works in desktop view', async ({ page }) => {
  const { textarea, container, initialOffset, LINE_HEIGHT } = 
    await setupLineHighlightTest(page);
  
  // Test movement through lines
  // Line 0 (first line)
  let style = await container.getAttribute('style');
  expect(style).toContain('--current-line: 0');
  expect(parseInt(style.match(/--line-offset: (\d+)px/)[1])).toBe(initialOffset);
  
  // Move to second line
  await addLineAndMoveCursor(textarea, "{'key2': 'value2'}");
  await page.waitForTimeout(100);
  style = await container.getAttribute('style');
  expect(style).toContain('--current-line: 1');
  expect(parseInt(style.match(/--line-offset: (\d+)px/)[1])).toBe(initialOffset + LINE_HEIGHT);
  
  // Move to third line
  await addLineAndMoveCursor(textarea, "{'key3': 'value3'}");
  await page.waitForTimeout(100);
  style = await container.getAttribute('style');
  expect(style).toContain('--current-line: 2');
  expect(parseInt(style.match(/--line-offset: (\d+)px/)[1])).toBe(initialOffset + LINE_HEIGHT * 2);

  // Verify highlight disappears when unfocused
  await page.click('h1');
  await expect(container).not.toHaveClass(/focused/);
});

test('Line highlighting works in output section', async ({ page }) => {
  const { textarea, container, initialOffset, LINE_HEIGHT } =
    await setupLineHighlightTest(page, { section: 'output' });
  const outputContainer = container;

  // Verify output is not focused initially after filling in the input
  await expect(outputContainer).not.toHaveClass(/focused/);
  const inputContainer = page.locator('.input .editor-container');
  await expect(inputContainer).toHaveClass(/focused/);
  
  // Now focus the output textarea and test line highlighting
  await textarea.focus();
  
  // Verify focus has moved from input to output
  await expect(outputContainer).toHaveClass(/focused/);
  await expect(inputContainer).not.toHaveClass(/focused/);
  
  // Move cursor to start by clicking at the beginning
  await textarea.click({ position: { x: 5, y: 5 } });
  await page.waitForTimeout(100);
  
  // Test movement through lines
  // Line 0 (first line)
  let style = await outputContainer.getAttribute('style');
  expect(style).toContain('--current-line: 0');
  expect(parseInt(style.match(/--line-offset: (\d+)px/)[1])).toBe(initialOffset);
});

test('Line highlighting works in mobile view', async ({ page }) => {
  const { textarea, container, initialOffset, LINE_HEIGHT } = 
    await setupLineHighlightTest(page, { isMobile: true });
  
  // Test movement through lines
  // Line 0 (first line)
  let style = await container.getAttribute('style');
  expect(style).toContain('--current-line: 0');
  expect(parseInt(style.match(/--line-offset: (\d+)px/)[1])).toBe(initialOffset);
  
  // Move to second line
  await addLineAndMoveCursor(textarea, "{'key2': 'value2'}");
  await page.waitForTimeout(100);
  style = await container.getAttribute('style');
  expect(style).toContain('--current-line: 1');
  expect(parseInt(style.match(/--line-offset: (\d+)px/)[1])).toBe(initialOffset + LINE_HEIGHT);
});

