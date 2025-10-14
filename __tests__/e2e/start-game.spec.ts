import { test, expect, Page } from '@playwright/test';
import { GamePage } from './page-objects/gamePage';

test.describe('User Story 1: Start New Game', () => {
  let gamePage: GamePage;

  test.beforeEach(async ({ page }: { page: Page }) => {
    gamePage = new GamePage(page);
    // Navigate to home and wait for initial state once per test
    await gamePage.navigateToHome();
  });
  // T033: US1.1 - Start game displays theme
  test('should display theme when start game button is clicked', async () => {
    // Click the Start New Game button
    await gamePage.startButton.click();

    // Verify theme is displayed
    await expect(gamePage.themeDisplay).toBeVisible();

    // Verify theme has actual content (not empty)
    const themeText = await gamePage.getThemeText();
    expect(themeText).toBeTruthy();
    expect(themeText!.length).toBeGreaterThan(0);
  });

  // T034: US1.2 - Multiple game starts show theme variety over 10 iterations
  test('should show theme variety over multiple game sessions', async ({ page }) => {
    const themes = new Set<string>();
    const iterations = 10;

    for (let i = 0; i < iterations; i++) {
      // Start a new game
      await gamePage.startButton.click();

      // Get the theme
      await expect(gamePage.themeDisplay).toBeVisible();
      const theme = await gamePage.getThemeText();

      if (theme) {
        themes.add(theme);
      }

      // Reload page to reset state for next iteration
      await page.reload();
      await expect(page.getByText(/question sets available/i)).toBeVisible({ timeout: 5000 });
    }

    // Verify we got at least 2 different themes (proves random selection)
    // With 12 question sets and 10 iterations, we should see variety
    expect(themes.size).toBeGreaterThanOrEqual(2);
  });

  // T035: US1.3 - Theme is clearly identifiable with readable font size
  test('should display theme with readable font size', async () => {
    // Start game
    await gamePage.startButton.click();

    // Get theme display element
    await expect(gamePage.themeDisplay).toBeVisible();

    // Check font size is readable (at least 24px)
    const fontSize = await gamePage.themeDisplay.evaluate((el) => {
      return window.getComputedStyle(el).fontSize;
    });

    const fontSizeValue = parseInt(fontSize);
    expect(fontSizeValue).toBeGreaterThanOrEqual(24);

    // Verify theme text is clearly visible (not transparent or too light)
    const color = await gamePage.themeDisplay.evaluate((el) => {
      return window.getComputedStyle(el).color;
    });

    // Color should be defined (not transparent)
    expect(color).toBeTruthy();
    expect(color).not.toBe('rgba(0, 0, 0, 0)');
  });

  // T036: Performance - Game starts within 1 second (SC-001)
  test('should start game within 1 second', async () => {
    // Measure time to start game
    const startTime = Date.now();

    // Click start button
    await gamePage.startButton.click();

    // Wait for theme to be visible
    await expect(gamePage.themeDisplay).toBeVisible();

    const endTime = Date.now();
    const duration = endTime - startTime;

    // Verify it took less than 1000ms (1 second)
    expect(duration).toBeLessThan(1000);
  });

  test('should show start button when no game is active', async () => {
    // Verify start button is visible
    await expect(gamePage.startButton).toBeVisible();
    await expect(gamePage.startButton).toBeEnabled();
  });

  test('should not show theme display when no game is active', async () => {
    // Verify theme display is not visible
    await expect(gamePage.themeDisplay).not.toBeVisible();
  });

  test('should display game title and description', async ({ page }) => {
    // Verify title
    await expect(page.getByRole('heading', { name: /2 to twelve/i })).toBeVisible();

    // Verify description
    await expect(page.getByText(/guess the 12-letter word/i)).toBeVisible();
  });
});