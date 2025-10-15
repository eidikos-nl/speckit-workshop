import { Page, Locator } from '@playwright/test';

/**
 * Base Page Object containing shared functionality across all page objects
 * Provides common locators and helper methods for game navigation and state management
 */
export class BasePage {
  readonly page: Page;
  readonly startButton: Locator;
  readonly stopButton: Locator;
  readonly themeDisplay: Locator;

  constructor(page: Page) {
    this.page = page;
    // Define all common locators here
    this.startButton = page.getByTestId('start-game-button');
    this.stopButton = page.getByTestId('stop-game-button');
    this.themeDisplay = page.getByTestId('theme-display');
  }

  /**
   * Navigate to home page and wait for it to be fully loaded
   */
  async navigateToHome(): Promise<void> {
    await this.page.goto('/');
    // Wait for question sets to load as this is common across all tests
    await this.page.waitForSelector('text=question sets available', { timeout: 5000 });
  }

  /**
   * Start a game by clicking the start button and waiting for game to be active
   */
  async startGame(): Promise<void> {
    // Wait for start button to be visible and enabled before clicking
    await this.startButton.waitFor({ state: 'visible' });
    await this.startButton.click();
    await this.themeDisplay.waitFor({ state: 'visible' });
  }

  /**
   * Stop the current game and wait for it to return to initial state
   */
  async stopGame(): Promise<void> {
    await this.stopButton.click();
    await this.themeDisplay.waitFor({ state: 'hidden' });
  }

  /**
   * Navigate to home and start a game in one step
   */
  async navigateAndStartGame(): Promise<void> {
    await this.navigateToHome();
    await this.startGame();
  }

  /**
   * Get the current theme text
   */
  async getThemeText(): Promise<string | null> {
    return await this.themeDisplay.textContent();
  }

  /**
   * Check if start button is visible
   */
  async isStartButtonVisible(): Promise<boolean> {
    return await this.startButton.isVisible();
  }

  /**
   * Check if stop button is visible
   */
  async isStopButtonVisible(): Promise<boolean> {
    return await this.stopButton.isVisible();
  }

  /**
   * Wait for the page to be in initial state (before game starts)
   */
  async waitForInitialState(): Promise<void> {
    await this.startButton.waitFor({ state: 'visible' });
    await this.themeDisplay.waitFor({ state: 'hidden' });
    await this.page.waitForSelector('text=ready to test your knowledge');
  }

  /**
   * Wait for game to be active (after starting)
   */
  async waitForGameActive(): Promise<void> {
    await this.stopButton.waitFor({ state: 'visible' });
    await this.themeDisplay.waitFor({ state: 'visible' });
  }
}
