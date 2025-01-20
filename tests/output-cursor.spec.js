import {test, expect} from '@playwright/test';

test.describe('Output textarea cursor behavior', () => {
  test.beforeEach(async ({page}) => {
    await page.goto('http://localhost:3000');
    // Add input that will generate multi-line JSON output
    await page.fill('textarea:not(.output-content)', "{'test': {'nested': 123}}");
    // Wait for output to be populated
    await expect(page.locator('.output-content')).toHaveValue(/\{[\s\S]*\}/);
  });

  test('allows navigation keys with multi-line awareness', async ({page}) => {
    const output = page.locator('.output-content');
    await output.focus();
    
    // Set cursor to start of second line
    await output.evaluate(el => {
      const lines = el.value.split('\n');
      const firstLineLength = lines[0].length;
      el.setSelectionRange(firstLineLength + 1, firstLineLength + 1);
    });

    // Verify we're on the second line
    const secondLineStart = await output.evaluate(el => {
      const lines = el.value.split('\n');
      return lines[0].length + 1;
    });
    expect(await output.evaluate(el => el.selectionStart)).toBe(secondLineStart);

    // Test End key - should go to end of current line
    await output.press('End');
    const endOfSecondLine = await output.evaluate(el => {
      const lines = el.value.split('\n');
      return lines[0].length + 1 + lines[1].length;
    });
    expect(await output.evaluate(el => el.selectionStart)).toBe(endOfSecondLine);

    // Test Home key - should go to start of current line
    await output.press('Home');
    expect(await output.evaluate(el => el.selectionStart)).toBe(secondLineStart);

    // Test Cmd+Down - should go to end of entire text
    const isMac = process.platform === 'darwin';
    const modifier = isMac ? 'Meta' : 'Control';
    await page.keyboard.down(modifier);
    await output.press('ArrowDown');
    const textLength = await output.evaluate(el => el.value.length);
    expect(await output.evaluate(el => el.selectionStart)).toBe(textLength);
    await page.keyboard.up(modifier);
  });

  test('blocks regular keypresses but maintains cursor position', async ({page}) => {
    const output = page.locator('.output-content');
    
    // Click at position 5
    await output.click({position: {x: 30, y: 10}});
    const initialPos = await output.evaluate(el => el.selectionStart);

    // Try typing various characters
    await output.press('a');
    expect(await output.evaluate(el => el.selectionStart)).toBe(initialPos);

    await output.press('1');
    expect(await output.evaluate(el => el.selectionStart)).toBe(initialPos);

    await output.press('Space');
    expect(await output.evaluate(el => el.selectionStart)).toBe(initialPos);
  });

  test('allows keyboard shortcuts', async ({page}) => {
    const output = page.locator('.output-content');
    const isMac = process.platform === 'darwin';
    const modifier = isMac ? 'Meta' : 'Control';

    // Test select all
    await output.press(`${modifier}+a`);
    const textLength = await output.evaluate(el => el.value.length);
    
    const start = await output.evaluate(el => el.selectionStart);
    const end = await output.evaluate(el => el.selectionEnd);
    
    expect(start).toBe(0);
    expect(end).toBe(textLength);

    // Selection should persist after keyup
    await page.keyboard.up(modifier);
    expect(await output.evaluate(el => el.selectionStart)).toBe(0);
    expect(await output.evaluate(el => el.selectionEnd)).toBe(textLength);
  });

  test('maintains selection during blocked keypresses', async ({page}) => {
    const output = page.locator('.output-content');
    
    // Select a portion of text
    await output.focus();
    await page.keyboard.down('Shift');
    await output.press('ArrowRight');
    await output.press('ArrowRight');
    await output.press('ArrowRight');
    await page.keyboard.up('Shift');

    const initialStart = await output.evaluate(el => el.selectionStart);
    const initialEnd = await output.evaluate(el => el.selectionEnd);
    expect(initialStart).toBeLessThan(initialEnd); // Verify we have a selection

    // Try typing - should maintain selection
    await output.press('a');
    expect(await output.evaluate(el => el.selectionStart)).toBe(initialStart);
    expect(await output.evaluate(el => el.selectionEnd)).toBe(initialEnd);
  });

  test('blocks all non-navigation keys without modifier', async ({page}) => {
    const output = page.locator('.output-content');
    await output.click();
    const initialPos = await output.evaluate(el => el.selectionStart);

    // Test various keys
    const keysToTest = ['a', 'b', '1', '2', 'Space', '[', ']', '-', '=', ';'];
    
    for (const key of keysToTest) {
      await output.press(key);
      expect(await output.evaluate(el => el.selectionStart)).toBe(initialPos);
      expect(await output.evaluate(el => el.value)).not.toContain(key);
    }
  });
});
