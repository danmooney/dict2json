import {test, expect} from '@playwright/test';

test('Validation icon states', async ({page}) => {
  await page.goto('http://localhost:3000');

  // Helper function to check validation icon state
  const checkValidationIcon = async (shouldExist, state = null) => {
    const icon = page.locator('.validation-icon');

    if (!shouldExist) {
      await expect(icon).not.toBeVisible();
      return;
    }

    await expect(icon).toBeVisible();

    if (state === 'valid') {
      await expect(icon).toHaveClass('validation-icon valid');
    } else if (state === 'error') {
      await expect(icon).toHaveClass('validation-icon error');
    }
  };

  // Initially no validation icon
  await checkValidationIcon(false);

  // Only whitespace - no validation icon
  await page.fill('textarea', '   \n   ');
  await checkValidationIcon(false);

  // Invalid input shows error icon
  await page.fill('textarea', "{'invalid': True,}}}");
  await page.waitForTimeout(100); // Wait for validation
  await checkValidationIcon(true, 'error');

  // Hover shows error tooltip
  await page.locator('.validation-icon').hover();
  const tooltip = page.getByTestId('validation-tooltip');
  await expect(tooltip).toBeVisible();
  await expect(tooltip).toHaveText('Invalid Python Dictionary');

  // Valid input shows success icon
  await page.fill('textarea', "{'valid': True}");
  await page.waitForTimeout(100); // Wait for validation
  await checkValidationIcon(true, 'valid');

  // Hover shows success tooltip
  await page.locator('.validation-icon').hover();
  await expect(tooltip).toBeVisible();
  await expect(tooltip).toHaveText('Valid Python Dictionary');

  // Clearing input removes validation icon
  await page.fill('textarea', '');
  await checkValidationIcon(false);
});

test('Validation icon in mobile view', async ({page}) => {
  // Set mobile viewport
  await page.setViewportSize({width: 500, height: 800});
  await page.goto('http://localhost:3000');

  const checkValidationIcon = async (shouldExist, state = null) => {
    const icon = page.locator('.validation-icon');

    if (!shouldExist) {
      await expect(icon).not.toBeVisible();
      return;
    }

    await expect(icon).toBeVisible();

    if (state === 'valid') {
      await expect(icon).toHaveClass('validation-icon valid');
    } else if (state === 'error') {
      await expect(icon).toHaveClass('validation-icon error');
    }
  };

  // Test basic validation states in mobile
  await checkValidationIcon(false);

  await page.fill('textarea', "{'test': True}");
  await page.waitForTimeout(100); // Wait for validation
  await checkValidationIcon(true, 'valid');

  await page.fill('textarea', "{'test': True,}}");
  await page.waitForTimeout(100); // Wait for validation
  await checkValidationIcon(true, 'error');

  // Switch tabs and verify icon state persists
  await page.click('.tabs button:has-text("Output")');
  await page.click('.tabs button:has-text("Input")');
  await checkValidationIcon(true, 'error');

  // Clear and verify icon disappears
  await page.fill('textarea', '');
  await checkValidationIcon(false);
});

test('Validation tooltip appears above other elements', async ({page}) => {
  await page.goto('http://localhost:3000');

  // Add some input to show validation icon
  await page.fill('textarea', "{'test': True}");
  await page.waitForTimeout(100);

  // Hover over validation icon
  const validationIcon = page.locator('.validation-icon');
  await validationIcon.hover();

  // Get tooltip element
  const tooltip = page.getByTestId('validation-tooltip');
  
  // Verify tooltip is visible
  await expect(tooltip).toBeVisible();

  // Try to click the tooltip - this will fail if it's behind other elements
  await tooltip.click();

  // Additional check - verify tooltip is still visible after click
  // This confirms the click wasn't intercepted by elements above it
  await expect(tooltip).toBeVisible();
  
  // Verify we can still hover the icon after clicking tooltip
  await validationIcon.hover();
  await expect(tooltip).toBeVisible();
}); 
