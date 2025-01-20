import { test, expect } from '@playwright/test';

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