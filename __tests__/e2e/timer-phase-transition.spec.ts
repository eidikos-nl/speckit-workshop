import { test, expect, Page } from '@playwright/test';
import { GamePage } from './page-objects/gamePage';

test.describe('User Story 2: Phase Transitions', () => {
  let gamePage: GamePage;

  test.beforeEach(async ({ page }: { page: Page }) => {
    gamePage = new GamePage(page);
    await gamePage.navigateToHome();
  });

  // T034: Main timer expiry triggering phase transition
  test('should transition to final answer phase when main timer expires', async ({ page }) => {
    // Install clock before navigation to control time
    await page.clock.install({ time: new Date('2024-01-01T00:00:00') });
    
    await gamePage.navigateToHome();
    await gamePage.startButton.click();

    const mainTimerDisplay = page.locator('[data-testid="main-timer-display"]');
    const finalTimerDisplay = page.locator('[data-testid="final-timer-display"]');

    // Verify initial state - EXPLORATION phase
    await expect(mainTimerDisplay).toHaveText('10:00');
    await expect(finalTimerDisplay).toHaveText('2:00');

    // Fast-forward to when main timer expires (600 seconds)
    await page.clock.fastForward(600000);
    await page.waitForTimeout(200);

    // Should now be in FINAL_ANSWER phase
    await expect(mainTimerDisplay).toHaveText('0:00');
    await expect(finalTimerDisplay).toHaveText('2:00'); // Final timer just started

    // Verify final timer is now counting down
    await page.clock.fastForward(30000); // 30 seconds
    await page.waitForTimeout(100);

    await expect(finalTimerDisplay).toHaveText('1:30');
  });

  // T035: Navigation controls become disabled when main timer expires
  test('should disable navigation controls when transitioning to final answer phase', async ({ page }) => {
    // Install clock before navigation
    await page.clock.install({ time: new Date('2024-01-01T00:00:00') });
    
    await gamePage.navigateToHome();
    await gamePage.startButton.click();

    const nextChevron = page.locator('[data-testid="next-chevron"]');
    const previousChevron = page.locator('[data-testid="previous-chevron"]');

    // During EXPLORATION phase - next should be enabled
    await expect(nextChevron).toBeEnabled();

    // Navigate to second question to enable previous button
    await nextChevron.click();
    await page.waitForTimeout(100);

    // Both navigation controls should be enabled on question 2
    await expect(nextChevron).toBeEnabled();
    await expect(previousChevron).toBeEnabled();

    // Fast-forward to when main timer expires (600 seconds)
    await page.clock.fastForward(600000);
    await page.waitForTimeout(200);

    // Should now be in FINAL_ANSWER phase - both navigation controls disabled
    await expect(nextChevron).toBeDisabled();
    await expect(previousChevron).toBeDisabled();
  });

  // T036: Questions and answers fade to 20% opacity when main timer expires
  test('should reduce opacity to 20% when transitioning to final answer phase', async ({ page }) => {
    // Install clock before navigation
    await page.clock.install({ time: new Date('2024-01-01T00:00:00') });
    
    await gamePage.navigateToHome();
    await gamePage.startButton.click();

    // Find the question display - check parent wrapper opacity via evaluate
    const questionDisplay = page.locator('[data-testid="current-question-display"]');

    // During EXPLORATION phase, parent wrapper opacity should be 1 (full opacity)
    let opacity = await questionDisplay.evaluate((el) => {
      return window.getComputedStyle(el.parentElement!).opacity;
    });
    expect(parseFloat(opacity)).toBeGreaterThanOrEqual(0.9);

    // Fast-forward to when main timer expires (600 seconds)
    await page.clock.fastForward(600000);
    await page.waitForTimeout(200);

    // During FINAL_ANSWER phase, parent wrapper opacity should be 0.2 (20%)
    opacity = await questionDisplay.evaluate((el) => {
      return window.getComputedStyle(el.parentElement!).opacity;
    });
    expect(parseFloat(opacity)).toBe(0.2);
  });

  // T037: Question/answer components do not respond to interactions after main timer expiry
  test('should prevent interactions through pointer-events in final answer phase', async ({ page }) => {
    // Install clock before navigation
    await page.clock.install({ time: new Date('2024-01-01T00:00:00') });
    
    await gamePage.navigateToHome();
    await gamePage.startButton.click();

    // Find the question display - check parent wrapper via evaluate
    const questionDisplay = page.locator('[data-testid="current-question-display"]');

    // During EXPLORATION phase, parent wrapper pointer-events should be 'auto' (enabled)
    let pointerEvents = await questionDisplay.evaluate((el) => {
      return window.getComputedStyle(el.parentElement!).pointerEvents;
    });
    expect(pointerEvents).toBe('auto');

    // Verify input is enabled
    const answerInput = page.locator('[data-testid="answer-input"]');
    await expect(answerInput).toBeEnabled();

    // Fast-forward to when main timer expires (600 seconds)
    await page.clock.fastForward(600000);
    await page.waitForTimeout(200);

    // During FINAL_ANSWER phase, parent wrapper pointer-events should be 'none' (disabled)
    pointerEvents = await questionDisplay.evaluate((el) => {
      return window.getComputedStyle(el.parentElement!).pointerEvents;
    });
    expect(pointerEvents).toBe('none');

    // Answer input itself is not disabled, but the wrapper blocks interaction
    // Verify the input is still in the DOM but not interactable
    await expect(answerInput).toBeVisible();
  });

  // Additional test: Verify question grid also gets disabled styling
  test('should apply opacity and pointer-events to question grid in final answer phase', async ({ page }) => {
    // Install clock before navigation
    await page.clock.install({ time: new Date('2024-01-01T00:00:00') });
    
    await gamePage.navigateToHome();
    await gamePage.startButton.click();

    // Find the QuestionGrid component - check its parent wrapper via evaluate
    const questionGrid = page.locator('role=navigation[name="Revealed letters grid"]');

    // During EXPLORATION phase, parent wrapper should be full opacity and interactive
    let opacity = await questionGrid.evaluate((el) => {
      return window.getComputedStyle(el.parentElement!).opacity;
    });
    let pointerEvents = await questionGrid.evaluate((el) => {
      return window.getComputedStyle(el.parentElement!).pointerEvents;
    });
    
    expect(parseFloat(opacity)).toBeGreaterThanOrEqual(0.9);
    expect(pointerEvents).toBe('auto');

    // Fast-forward to when main timer expires (600 seconds)
    await page.clock.fastForward(600000);
    await page.waitForTimeout(200);

    // During FINAL_ANSWER phase, parent wrapper should be 20% opacity and non-interactive
    opacity = await questionGrid.evaluate((el) => {
      return window.getComputedStyle(el.parentElement!).opacity;
    });
    pointerEvents = await questionGrid.evaluate((el) => {
      return window.getComputedStyle(el.parentElement!).pointerEvents;
    });
    
    expect(parseFloat(opacity)).toBe(0.2);
    expect(pointerEvents).toBe('none');
  });

  // Additional test: Verify final timer color changes when active
  test('should change final timer color from gray to dark when phase transitions', async ({ page }) => {
    // Install clock before navigation
    await page.clock.install({ time: new Date('2024-01-01T00:00:00') });
    
    await gamePage.navigateToHome();
    await gamePage.startButton.click();

    const finalTimerText = page.locator('[data-testid="final-timer-display"] > div');

    // During EXPLORATION phase, final timer should be gray (inactive)
    let color = await finalTimerText.evaluate((el) => {
      return window.getComputedStyle(el).color;
    });
    expect(color).toBe('rgb(156, 163, 175)'); // text-gray-400

    // Fast-forward to when main timer expires (600 seconds)
    await page.clock.fastForward(600000);
    await page.waitForTimeout(200);

    // During FINAL_ANSWER phase, final timer should be dark (active)
    color = await finalTimerText.evaluate((el) => {
      return window.getComputedStyle(el).color;
    });
    // Should be dark (text-gray-900), not gray - check for low RGB values
    const darkMatch = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    expect(darkMatch).toBeTruthy();
    if (darkMatch) {
      const [, r, g, b] = darkMatch.map(Number);
      // Dark color has low RGB values (< 100)
      expect(r).toBeLessThan(100);
      expect(g).toBeLessThan(100);
      expect(b).toBeLessThan(100);
    }
  });
});
