import { test, expect } from '@playwright/test';

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
  await textarea.press('Home');
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