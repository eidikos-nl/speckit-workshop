import { test, expect, Page } from '@playwright/test';
import { GamePage } from './page-objects/gamePage';

test.describe('User Story 1: Timer Display', () => {
  let gamePage: GamePage;

  test.beforeEach(async ({ page }: { page: Page }) => {
    gamePage = new GamePage(page);
    // Navigate to home and wait for initial state
    await gamePage.navigateToHome();
  });

  // T023: Timers visible on game start showing "10:00" and "2:00"
  test('should display timers visible on game start showing correct initial values', async () => {
    // Start a new game
    await gamePage.startButton.click();

    // Wait for timer panel to be visible
    const timerPanel = gamePage.page.locator('[data-testid="timer-panel"]');
    await expect(timerPanel).toBeVisible();

    // Get main timer display
    const mainTimerDisplay = gamePage.page.locator('[data-testid="main-timer-display"]');
    await expect(mainTimerDisplay).toBeVisible();

    // Get final timer display
    const finalTimerDisplay = gamePage.page.locator('[data-testid="final-timer-display"]');
    await expect(finalTimerDisplay).toBeVisible();

    // Check main timer shows "10:00"
    const mainTimerText = await mainTimerDisplay.textContent();
    expect(mainTimerText?.trim()).toBe('10:00');

    // Check final timer shows "2:00"
    const finalTimerText = await finalTimerDisplay.textContent();
    expect(finalTimerText?.trim()).toBe('2:00');
  });

  // T024: Main timer counts down every second (10:00 → 9:59)
  test('should update main timer every second counting down', async () => {
    // Start a new game
    await gamePage.startButton.click();

    // Wait for timer panel to be visible
    const timerPanel = gamePage.page.locator('[data-testid="timer-panel"]');
    await expect(timerPanel).toBeVisible();

    // Get main timer display
    const mainTimerDisplay = gamePage.page.locator('[data-testid="main-timer-display"]');

    // Verify initial value is 10:00
    await expect(mainTimerDisplay).toHaveText('10:00');

    // Wait for timer to countdown - use Playwright's built-in polling
    // This is more robust than waitForTimeout as it actively checks the condition
    await expect(mainTimerDisplay).not.toHaveText('10:00', { timeout: 2000 });

    // Verify the timer has counted down to 9:XX range
    const updatedValue = await mainTimerDisplay.textContent();
    expect(updatedValue?.trim()).toMatch(/^9:[0-5][0-9]$/);
  });

  // T025: Timer panel remains visible and positioned in bottom-right
  test('should keep timer panel visible and positioned in bottom-right during gameplay', async () => {
    // Start a new game
    await gamePage.startButton.click();

    // Wait for timer panel to be visible
    const timerPanel = gamePage.page.locator('[data-testid="timer-panel"]');
    await expect(timerPanel).toBeVisible();

    // Check that timer panel has fixed positioning
    const position = await timerPanel.evaluate((el) => {
      return window.getComputedStyle(el).position;
    });
    expect(position).toBe('fixed');

    // Verify it's in the bottom-right area
    const boundingBox = await timerPanel.boundingBox();
    expect(boundingBox).not.toBeNull();

    if (boundingBox) {
      const viewportSize = await gamePage.page.viewportSize();
      if (viewportSize) {
        // Should be on the right side - element starts within 20% from right edge
        const distanceFromRight = viewportSize.width - boundingBox.x;
        const rightRatio = distanceFromRight / viewportSize.width;
        expect(rightRatio).toBeLessThan(0.2); // Starts within 20% of right edge

        // Should be on the bottom - element starts within 20% from bottom edge
        const distanceFromBottom = viewportSize.height - boundingBox.y;
        const bottomRatio = distanceFromBottom / viewportSize.height;
        expect(bottomRatio).toBeLessThan(0.2); // Starts within 20% of bottom edge
      }
    }
  });

  // Additional test: Timer panel should have shadow effect
  test('should display timer panel with shadow effect', async () => {
    // Start a new game
    await gamePage.startButton.click();

    // Wait for timer panel
    const timerPanel = gamePage.page.locator('[data-testid="timer-panel"]');
    await expect(timerPanel).toBeVisible();

    // Check for shadow (box-shadow property should be set)
    const boxShadow = await timerPanel.evaluate((el) => {
      return window.getComputedStyle(el).boxShadow;
    });

    // Should have a box-shadow (not 'none')
    expect(boxShadow).not.toBe('none');
    expect(boxShadow).toBeTruthy();
  });

  // Additional test: Both timers should be readable and have appropriate styling
  test('should display both timers with readable styling', async () => {
    // Start a new game
    await gamePage.startButton.click();

    // Note: data-testid is on wrapper div, but styled text is in child div
    const mainTimerDisplay = gamePage.page.locator('[data-testid="main-timer-display"] > div');
    const finalTimerDisplay = gamePage.page.locator('[data-testid="final-timer-display"] > div');

    // Check main timer font styling
    const mainFontSize = await mainTimerDisplay.evaluate((el) => {
      return window.getComputedStyle(el).fontSize;
    });
    const mainFontSizeValue = parseInt(mainFontSize);
    expect(mainFontSizeValue).toBeGreaterThanOrEqual(18); // At least 18px

    // Check final timer font styling
    const finalFontSize = await finalTimerDisplay.evaluate((el) => {
      return window.getComputedStyle(el).fontSize;
    });
    const finalFontSizeValue = parseInt(finalFontSize);
    expect(finalFontSizeValue).toBeGreaterThanOrEqual(18); // At least 18px

    // Both should have monospace font for alignment
    // Check for common monospace font indicators (more robust than checking for 'mono' substring)
    const mainFontFamily = await mainTimerDisplay.evaluate((el) => {
      return window.getComputedStyle(el).fontFamily.toLowerCase();
    });
    const isMainMonospace = mainFontFamily.includes('mono') || 
                           mainFontFamily.includes('courier') || 
                           mainFontFamily.includes('consolas') ||
                           mainFontFamily.includes('menlo');
    expect(isMainMonospace).toBe(true);

    const finalFontFamily = await finalTimerDisplay.evaluate((el) => {
      return window.getComputedStyle(el).fontFamily.toLowerCase();
    });
    const isFinalMonospace = finalFontFamily.includes('mono') || 
                            finalFontFamily.includes('courier') || 
                            finalFontFamily.includes('consolas') ||
                            finalFontFamily.includes('menlo');
    expect(isFinalMonospace).toBe(true);
  });

  // Additional test: Timer updates continuously during gameplay
  test('should continue updating main timer during gameplay', async () => {
    // Start a new game
    await gamePage.startButton.click();

    const mainTimerDisplay = gamePage.page.locator('[data-testid="main-timer-display"]');
    await expect(mainTimerDisplay).toBeVisible();

    // Verify initial value
    await expect(mainTimerDisplay).toHaveText('10:00');

    // Use Playwright's built-in waiting - wait for first countdown
    await expect(mainTimerDisplay).not.toHaveText('10:00', { timeout: 2000 });
    const firstUpdate = await mainTimerDisplay.textContent();
    expect(firstUpdate?.trim()).toMatch(/^9:[0-5][0-9]$/);

    // Wait for second countdown - ensure timer continues updating
    await expect(mainTimerDisplay).not.toHaveText(firstUpdate?.trim() || '', { timeout: 1500 });
    const secondUpdate = await mainTimerDisplay.textContent();
    expect(secondUpdate?.trim()).toMatch(/^9:[0-5][0-9]$/);

    // Verify the timer is indeed counting down (second value < first value)
    const firstSeconds = parseInt((firstUpdate?.trim() || '0:00').split(':')[1]);
    const secondSeconds = parseInt((secondUpdate?.trim() || '0:00').split(':')[1]);
    expect(secondSeconds).toBeLessThan(firstSeconds);
  });
});
