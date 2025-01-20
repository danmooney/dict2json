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
    page.on('console', msg => console.log(msg.text()));

    const output = page.locator('.output-content');
    await output.focus();

    // Log initial text content and formatting
    const initialText = await output.evaluate(el => {
      console.log('Initial text content:', JSON.stringify(el.value));
      console.log('Lines:', el.value.split('\n').map(line => JSON.stringify(line)));
      return el.value;
    });

    // Set cursor to start of second line
    await output.evaluate(el => {
      const lines = el.value.split('\n');
      const firstLineLength = lines[0].length;
      el.setSelectionRange(firstLineLength + 1, firstLineLength + 1);
      console.log('First line length:', firstLineLength);
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

    // Test Cmd/Ctrl+Down - should go to end of text
    const isMac = process.platform === 'darwin';
    const modifier = isMac ? 'Meta' : 'Control';
    
    // Store position before the shortcut
    const beforePos = await output.evaluate(el => {
      console.log('Before position:', el.selectionStart);
      return el.selectionStart;
    });
    
    await page.keyboard.down(modifier);
    await output.press('ArrowDown');
    
    // Verify cursor moved to a later position
    const afterPos = await output.evaluate(el => {
      console.log('After position:', el.selectionStart);
      return el.selectionStart;
    });
    expect(afterPos).toBeGreaterThan(beforePos);
    
    // Verify cursor is at the end
    const textLength = await output.evaluate(el => {
      console.log('Text length:', el.value.length);
      console.log('Final text content:', JSON.stringify(el.value));
      return el.value.length;
    });
    expect(afterPos).toBe(textLength);
    
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
    
    // Wait for output to be populated and focused
    await expect(output).toHaveValue(/\{[\s\S]*\}/);
    await output.focus();
    await page.waitForTimeout(100); // Give the focus time to settle

    // Create a small selection at the start
    await output.evaluate(el => {
      // Force selection of first few characters
      el.focus();
      el.setSelectionRange(0, 5);
    });

    // Verify initial selection
    const initialStart = await output.evaluate(el => el.selectionStart);
    const initialEnd = await output.evaluate(el => el.selectionEnd);
    expect(initialStart).toBe(0);
    expect(initialEnd).toBe(5);

    // Try typing - should maintain selection
    await output.press('a');
    expect(await output.evaluate(el => el.selectionStart)).toBe(initialStart);
    expect(await output.evaluate(el => el.selectionEnd)).toBe(initialEnd);

    // Try typing another character - selection should still be maintained
    await output.press('b');
    expect(await output.evaluate(el => el.selectionStart)).toBe(initialStart);
    expect(await output.evaluate(el => el.selectionEnd)).toBe(initialEnd);

    // Verify the text wasn't modified
    const finalText = await output.evaluate(el => el.value);
    expect(finalText).not.toContain('a');
    expect(finalText).not.toContain('b');
  });

  test('blocks all non-navigation keys without modifier', async ({page}) => {
    const output = page.locator('.output-content');
    await output.click();
    const initialPos = await output.evaluate(el => el.selectionStart);
    const initialText = await output.evaluate(el => el.value);

    // Test various keys that won't be in the JSON output
    const keysToTest = ['q', 'w', '@', '#', 'Space', '?', '>', '<', '~', '|'];
    
    for (const key of keysToTest) {
      await output.press(key);
      expect(await output.evaluate(el => el.selectionStart)).toBe(initialPos);
      
      // Verify the text hasn't changed
      const currentText = await output.evaluate(el => el.value);
      expect(currentText).toBe(initialText);
    }
  });
});
