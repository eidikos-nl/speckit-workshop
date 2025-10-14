import { test, expect, Page } from '@playwright/test';
import { GamePage } from './page-objects/gamePage';

test.describe('User Story 2: Stop Active Game', () => {
  let gamePage: GamePage;

  test.beforeEach(async ({ page }: { page: Page }) => {
    gamePage = new GamePage(page);
    // Navigate to home and wait for initial state once per test
    await gamePage.navigateToHome();
  });

  // T041: US2.1 - Stop game returns to initial state
  test('should return to initial state when stop game button is clicked', async () => {
    // Start a game
    await gamePage.startGame();

    // Click stop game button
    await gamePage.stopButton.click();

    // Verify we're back to initial state
    await gamePage.waitForInitialState();
  });

  // T042: US2.2 - New game after stop selects question set independently
  test('should select a new question set independently after stopping', async () => {
    // Start first game
    await gamePage.startGame();
    const firstTheme = await gamePage.getThemeText();

    // Stop the game
    await gamePage.stopButton.click();
    await expect(gamePage.themeDisplay).not.toBeVisible();

    // Start a new game
    await gamePage.startGame();
    const secondTheme = await gamePage.getThemeText();

    // Verify we got a theme (could be same or different, both are valid)
    expect(secondTheme).toBeTruthy();
    expect(secondTheme!.length).toBeGreaterThan(0);

    // The important part: the selection process happened independently
    // (We can't guarantee it's different due to random selection, but the process should work)
  });

  // T043: US2.3 - Stop action has no effect when no game is active
  test('should not show stop button when no game is active', async () => {
    // Verify stop button is not visible when no game is active
    await expect(gamePage.stopButton).not.toBeVisible();

    // Verify start button IS visible
    await expect(gamePage.startButton).toBeVisible();
  });

  // T044: Performance - Stop completes within 2 seconds (SC-003)
  test('should stop game within 2 seconds', async () => {
    // Start a game
    await gamePage.startGame();

    // Measure time to stop game
    const startTime = Date.now();

    // Click stop button
    await gamePage.stopButton.click();

    // Wait for initial state to be restored
    await expect(gamePage.startButton).toBeVisible();

    const endTime = Date.now();
    const duration = endTime - startTime;

    // Verify it took less than 2000ms (2 seconds)
    expect(duration).toBeLessThan(2000);
  });

  test('should show stop button only when game is active', async () => {
    // Initially, stop button should not be visible
    await expect(gamePage.stopButton).not.toBeVisible();

    // Start game
    await gamePage.startGame();

    // Now stop button should be visible
    await expect(gamePage.stopButton).toBeVisible();

    // Stop game
    await gamePage.stopButton.click();

    // Stop button should not be visible again
    await expect(gamePage.stopButton).not.toBeVisible();
  });

  test('should hide theme when game is stopped', async () => {
    // Start game
    await gamePage.startGame();

    // Stop game
    await gamePage.stopButton.click();

    // Theme should be hidden
    await expect(gamePage.themeDisplay).not.toBeVisible();
  });

  test('should allow multiple start/stop cycles', async () => {
    // Perform 3 start/stop cycles
    for (let i = 0; i < 3; i++) {
      // Start game
      await gamePage.startGame();

      // Stop game
      await gamePage.stopButton.click();
      await expect(gamePage.themeDisplay).not.toBeVisible();
      await expect(gamePage.startButton).toBeVisible();
    }
  });
});