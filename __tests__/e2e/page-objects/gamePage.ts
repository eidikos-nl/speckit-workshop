import { Page, Locator } from '@playwright/test';

export class GamePage {
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

  async navigateToHome() {
    await this.page.goto('/');
    // Wait for question sets to load as this is common across all tests
    await this.page.waitForSelector('text=question sets available', { timeout: 5000 });
  }

  async startGame() {
    await this.startButton.click();
    await this.themeDisplay.waitFor({ state: 'visible' });
  }

  async stopGame() {
    await this.stopButton.click();
    await this.themeDisplay.waitFor({ state: 'hidden' });
  }

  async getThemeText(): Promise<string | null> {
    return await this.themeDisplay.textContent();
  }

  async isStartButtonVisible(): Promise<boolean> {
    return await this.startButton.isVisible();
  }

  async isStopButtonVisible(): Promise<boolean> {
    return await this.stopButton.isVisible();
  }

  async waitForInitialState() {
    await this.startButton.waitFor({ state: 'visible' });
    await this.themeDisplay.waitFor({ state: 'hidden' });
    await this.page.waitForSelector('text=ready to test your knowledge');
  }
}