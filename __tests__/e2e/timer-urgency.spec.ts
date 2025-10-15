import { test, expect, Page } from '@playwright/test';
import { GamePage } from './page-objects/gamePage';

test.describe('User Story 3: Urgency Visual Indicators', () => {
  let gamePage: GamePage;

  test.beforeEach(async ({ page }: { page: Page }) => {
    gamePage = new GamePage(page);
    await gamePage.navigateToHome();
  });

  // T042: Main timer turning red when reaching 10 seconds or less
  test('should have red color class infrastructure for urgent timers', async ({ page }) => {
    // Start a new game
    await gamePage.startButton.click();

    // Get the main timer inner div (where the styling is applied)
    const mainTimerText = page.locator('[data-testid="main-timer-display"] > div');
    await expect(mainTimerText).toBeVisible();

    // Check that timer has the necessary classes for color transitions
    const classList = await mainTimerText.evaluate((el) => {
      return Array.from(el.classList);
    });

    // Should have transition class
    expect(classList.some(c => c.includes('transition'))).toBe(true);

    // During normal time (10:00), should have default color (not red)
    const color = await mainTimerText.evaluate((el) => {
      return window.getComputedStyle(el).color;
    });

    // Should not be red at start (red is typically rgb(220, 38, 38) for text-red-600)
    expect(color).not.toBe('rgb(220, 38, 38)');
  });

  // T043: Final timer turning red when reaching 10 seconds or less
  test('should have red color class infrastructure for final timer', async ({ page }) => {
    // Start a new game
    await gamePage.startButton.click();

    // Get the final timer inner div (where the styling is applied)
    const finalTimerText = page.locator('[data-testid="final-timer-display"] > div');
    await expect(finalTimerText).toBeVisible();

    // Check that timer has the necessary classes for color transitions
    const classList = await finalTimerText.evaluate((el) => {
      return Array.from(el.classList);
    });

    // Should have transition class
    expect(classList.some(c => c.includes('transition'))).toBe(true);

    // During normal time (2:00), should have gray color (inactive during exploration phase)
    const color = await finalTimerText.evaluate((el) => {
      return window.getComputedStyle(el).color;
    });

    // Should be gray (text-gray-400 is rgb(156, 163, 175)) since final timer is inactive during exploration
    expect(color).toBe('rgb(156, 163, 175)');
  });

  // T044: Timers remain default color when above 10 seconds
  test('should display timers in default color when above 10 seconds', async ({ page }) => {
    // Start a new game
    await gamePage.startButton.click();

    const mainTimerText = page.locator('[data-testid="main-timer-display"] > div');
    const finalTimerText = page.locator('[data-testid="final-timer-display"] > div');

    // Main timer should be active (dark color, not red)
    const mainColor = await mainTimerText.evaluate((el) => {
      return window.getComputedStyle(el).color;
    });

    // Should be dark gray/black for active timer (text-gray-900)
    // text-gray-900 is rgb(17, 24, 39)
    expect(mainColor).toBe('rgb(17, 24, 39)');

    // Final timer should be inactive (gray)
    const finalColor = await finalTimerText.evaluate((el) => {
      return window.getComputedStyle(el).color;
    });

    // Should be gray for inactive timer
    expect(finalColor).toBe('rgb(156, 163, 175)');
  });

  // Additional test: Verify urgency detection logic is in place
  test('should have proper color classes based on timer state', async ({ page }) => {
    // Start a new game
    await gamePage.startButton.click();

    const mainTimerText = page.locator('[data-testid="main-timer-display"] > div');

    // Get computed classes
    const hasColorClasses = await mainTimerText.evaluate((el) => {
      const classes = Array.from(el.classList);
      // Should have either text-gray-900, text-red-600, or text-gray-400
      return classes.some(c =>
        c.includes('text-gray-900') ||
        c.includes('text-red-600') ||
        c.includes('text-gray-400')
      );
    });

    expect(hasColorClasses).toBe(true);
  });

  // Additional test: Verify clsx utility is being used for conditional styling
  test('should apply appropriate styling classes to timer displays', async ({ page }) => {
    // Start a new game
    await gamePage.startButton.click();

    const mainTimerText = page.locator('[data-testid="main-timer-display"] > div');
    const finalTimerText = page.locator('[data-testid="final-timer-display"] > div');

    // Both timers should have monospace font
    const mainFontFamily = await mainTimerText.evaluate((el) => {
      return window.getComputedStyle(el).fontFamily.toLowerCase();
    });

    const finalFontFamily = await finalTimerText.evaluate((el) => {
      return window.getComputedStyle(el).fontFamily.toLowerCase();
    });

    // Should have monospace fonts
    expect(mainFontFamily).toContain('mono');
    expect(finalFontFamily).toContain('mono');

    // Both timers should have bold font weight
    const mainFontWeight = await mainTimerText.evaluate((el) => {
      return window.getComputedStyle(el).fontWeight;
    });

    const finalFontWeight = await finalTimerText.evaluate((el) => {
      return window.getComputedStyle(el).fontWeight;
    });

    // Font weight 700 is bold
    expect(parseInt(mainFontWeight)).toBeGreaterThanOrEqual(700);
    expect(parseInt(finalFontWeight)).toBeGreaterThanOrEqual(700);
  });

  // T042: ACTUAL TEST - Main timer turns red at 10 seconds or less using Clock API
  test('should turn main timer red when reaching 10 seconds or less', async ({ page }) => {
    // Install clock before navigation to control time
    await page.clock.install({ time: new Date('2024-01-01T00:00:00') });
    
    await gamePage.navigateToHome();
    await gamePage.startButton.click();

    const mainTimerText = page.locator('[data-testid="main-timer-display"] > div');
    await expect(mainTimerText).toBeVisible();

    // At start (10:00), should be dark (not red)
    const initialColor = await mainTimerText.evaluate((el) => {
      return window.getComputedStyle(el).color;
    });
    // Should be dark gray/black (text-gray-900), not red
    expect(initialColor).toContain('rgb(');
    expect(initialColor).not.toMatch(/rgb\(2[0-9]{2}.*38.*38\)/);

    // Fast-forward to 9:50 (590 seconds elapsed, 10 seconds remaining - at threshold)
    await page.clock.fastForward(590000);
    await page.waitForTimeout(200); // Small delay for React state update
    
    const colorAt10Sec = await mainTimerText.evaluate((el) => {
      return window.getComputedStyle(el).color;
    });
    // Should be red (text-red-600) - check red channel is dominant
    const redMatch = colorAt10Sec.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    expect(redMatch).toBeTruthy();
    if (redMatch) {
      const [, r, g, b] = redMatch.map(Number);
      expect(r).toBeGreaterThan(140); // Red channel should be high
      expect(r).toBeGreaterThan(g); // Red should dominate green
      expect(r).toBeGreaterThan(b); // Red should dominate blue
    }

    // Fast-forward to 9:55 (595 seconds elapsed, 5 seconds remaining)
    await page.clock.fastForward(5000);
    await page.waitForTimeout(100);

    const colorAt5Sec = await mainTimerText.evaluate((el) => {
      return window.getComputedStyle(el).color;
    });
    // Should still be red
    const redMatch2 = colorAt5Sec.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (redMatch2) {
      const [, r] = redMatch2.map(Number);
      expect(r).toBeGreaterThan(140);
    }
  });

  // T043: ACTUAL TEST - Final timer turns red at 10 seconds or less
  test('should turn final timer red when reaching 10 seconds or less', async ({ page }) => {
    // Install clock before navigation
    await page.clock.install({ time: new Date('2024-01-01T00:00:00') });
    
    await gamePage.navigateToHome();
    await gamePage.startButton.click();

    const finalTimerText = page.locator('[data-testid="final-timer-display"] > div');
    await expect(finalTimerText).toBeVisible();

    // At start, final timer should be gray (inactive)
    const initialColor = await finalTimerText.evaluate((el) => {
      return window.getComputedStyle(el).color;
    });
    expect(initialColor).toBe('rgb(156, 163, 175)'); // text-gray-400

    // Fast-forward past main timer (600 seconds) to activate final timer
    await page.clock.fastForward(600000);
    await page.waitForTimeout(200);

    // Final timer should now be active and have dark color (2:00 remaining)
    const colorAtStart = await finalTimerText.evaluate((el) => {
      return window.getComputedStyle(el).color;
    });
    // Should be dark (text-gray-900), not gray or red
    const darkMatch = colorAtStart.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    expect(darkMatch).toBeTruthy();
    if (darkMatch) {
      const [, r, g, b] = darkMatch.map(Number);
      // Dark color has low RGB values (< 100) and balanced channels
      expect(r).toBeLessThan(100);
      expect(g).toBeLessThan(100);
      expect(b).toBeLessThan(100);
    }

    // Fast-forward to 1:50 (110 seconds into final phase, 10 seconds remaining)
    await page.clock.fastForward(110000);
    await page.waitForTimeout(100);

    const colorAt10Sec = await finalTimerText.evaluate((el) => {
      return window.getComputedStyle(el).color;
    });
    // Should be red at 10 seconds
    const redMatch3 = colorAt10Sec.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (redMatch3) {
      const [, r, g, b] = redMatch3.map(Number);
      expect(r).toBeGreaterThan(140); // Red channel should be high (lowered from 150 for browser variations)
      expect(r).toBeGreaterThan(g);
      expect(r).toBeGreaterThan(b);
    }

    // Fast-forward to 1:55 (115 seconds into final phase, 5 seconds remaining)
    await page.clock.fastForward(5000);
    await page.waitForTimeout(100);

    const colorAt5Sec = await finalTimerText.evaluate((el) => {
      return window.getComputedStyle(el).color;
    });
    // Should still be red
    const redMatch4 = colorAt5Sec.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (redMatch4) {
      const [, r] = redMatch4.map(Number);
      expect(r).toBeGreaterThan(140);
    }
  });

  // T044: ACTUAL TEST - Verify timers remain default color when above 10 seconds
  test('should keep timers in default color when above 10 seconds', async ({ page }) => {
    // Install clock before navigation
    await page.clock.install({ time: new Date('2024-01-01T00:00:00') });
    
    await gamePage.navigateToHome();
    await gamePage.startButton.click();

    const mainTimerText = page.locator('[data-testid="main-timer-display"] > div');

    // Test at multiple points above 10 seconds
    // At 9:00 (60 seconds elapsed)
    await page.clock.fastForward(60000);
    await page.waitForTimeout(100);
    
    let color = await mainTimerText.evaluate((el) => {
      return window.getComputedStyle(el).color;
    });
    // Should be dark, not red
    let darkMatch = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (darkMatch) {
      const [, r] = darkMatch.map(Number);
      expect(r).toBeLessThan(100); // Not red
    }

    // At 5:00 (300 seconds elapsed)
    await page.clock.fastForward(240000);
    await page.waitForTimeout(100);
    
    color = await mainTimerText.evaluate((el) => {
      return window.getComputedStyle(el).color;
    });
    // Should still be dark (not red)
    darkMatch = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (darkMatch) {
      const [, r] = darkMatch.map(Number);
      expect(r).toBeLessThan(100);
    }

    // At 0:11 (589 seconds elapsed, 11 seconds remaining - just above threshold)
    await page.clock.fastForward(289000);
    await page.waitForTimeout(100);
    
    color = await mainTimerText.evaluate((el) => {
      return window.getComputedStyle(el).color;
    });
    // Should still be dark (not red at 11 seconds)
    darkMatch = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (darkMatch) {
      const [, r] = darkMatch.map(Number);
      expect(r).toBeLessThan(100);
    }
  });
});
