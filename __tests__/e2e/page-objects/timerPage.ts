import { Page, Locator } from '@playwright/test';

/**
 * Page Object for Timer Panel interactions
 *
 * Provides methods for interacting with and inspecting the timer panel component
 */
export class TimerPage {
  readonly page: Page;
  readonly timerPanel: Locator;
  readonly mainTimerDisplay: Locator;
  readonly finalTimerDisplay: Locator;

  constructor(page: Page) {
    this.page = page;
    this.timerPanel = page.locator('[data-testid="timer-panel"]');
    this.mainTimerDisplay = page.locator('[data-testid="main-timer-display"]');
    this.finalTimerDisplay = page.locator('[data-testid="final-timer-display"]');
  }

  /**
   * Get the main timer text value
   * @returns The displayed time (e.g., "10:00", "5:23")
   */
  async getMainTimer(): Promise<string> {
    const text = await this.mainTimerDisplay.textContent();
    return text?.trim() || '';
  }

  /**
   * Get the final timer text value
   * @returns The displayed time (e.g., "2:00", "0:45")
   */
  async getFinalTimer(): Promise<string> {
    const text = await this.finalTimerDisplay.textContent();
    return text?.trim() || '';
  }

  /**
   * Wait for timer to update from initial value
   * @param initialValue - The initial timer value to wait to change from
   * @param timeout - Maximum time to wait in milliseconds (default: 2000)
   */
  async waitForTimerUpdate(initialValue: string, timeout: number = 2000): Promise<void> {
    await this.page.waitForFunction(
      ({ selector, initial }) => {
        const element = document.querySelector(selector);
        return element?.textContent?.trim() !== initial;
      },
      { selector: '[data-testid="main-timer-display"]', initial: initialValue },
      { timeout }
    );
  }

  /**
   * Check if main timer is displaying in red (urgent state)
   * @returns true if timer is red, false otherwise
   */
  async isMainTimerRed(): Promise<boolean> {
    const innerDiv = this.mainTimerDisplay.locator('> div');
    const color = await innerDiv.evaluate((el) => {
      return window.getComputedStyle(el).color;
    });

    // text-red-600 is rgb(220, 38, 38)
    return color === 'rgb(220, 38, 38)';
  }

  /**
   * Check if final timer is displaying in red (urgent state)
   * @returns true if timer is red, false otherwise
   */
  async isFinalTimerRed(): Promise<boolean> {
    const innerDiv = this.finalTimerDisplay.locator('> div');
    const color = await innerDiv.evaluate((el) => {
      return window.getComputedStyle(el).color;
    });

    // text-red-600 is rgb(220, 38, 38)
    return color === 'rgb(220, 38, 38)';
  }

  /**
   * Check if main timer is displaying in gray (inactive state)
   * @returns true if timer is gray, false otherwise
   */
  async isMainTimerGray(): Promise<boolean> {
    const innerDiv = this.mainTimerDisplay.locator('> div');
    const color = await innerDiv.evaluate((el) => {
      return window.getComputedStyle(el).color;
    });

    // text-gray-400 is rgb(156, 163, 175)
    return color === 'rgb(156, 163, 175)';
  }

  /**
   * Check if final timer is displaying in gray (inactive state)
   * @returns true if timer is gray, false otherwise
   */
  async isFinalTimerGray(): Promise<boolean> {
    const innerDiv = this.finalTimerDisplay.locator('> div');
    const color = await innerDiv.evaluate((el) => {
      return window.getComputedStyle(el).color;
    });

    // text-gray-400 is rgb(156, 163, 175)
    return color === 'rgb(156, 163, 175)';
  }

  /**
   * Get the color of the main timer
   * @returns RGB color string (e.g., "rgb(17, 24, 39)")
   */
  async getMainTimerColor(): Promise<string> {
    const innerDiv = this.mainTimerDisplay.locator('> div');
    return await innerDiv.evaluate((el) => {
      return window.getComputedStyle(el).color;
    });
  }

  /**
   * Get the color of the final timer
   * @returns RGB color string (e.g., "rgb(156, 163, 175)")
   */
  async getFinalTimerColor(): Promise<string> {
    const innerDiv = this.finalTimerDisplay.locator('> div');
    return await innerDiv.evaluate((el) => {
      return window.getComputedStyle(el).color;
    });
  }

  /**
   * Verify timer panel is positioned in bottom right corner
   * @returns true if positioned correctly, false otherwise
   */
  async isPositionedBottomRight(): Promise<boolean> {
    const position = await this.timerPanel.evaluate((el) => {
      return window.getComputedStyle(el).position;
    });

    if (position !== 'fixed') {
      return false;
    }

    const boundingBox = await this.timerPanel.boundingBox();
    if (!boundingBox) {
      return false;
    }

    const viewportSize = this.page.viewportSize();
    if (!viewportSize) {
      return false;
    }

    // Check if in bottom-right quadrant
    const isRight = boundingBox.x > viewportSize.width * 0.5;
    const isBottom = boundingBox.y > viewportSize.height * 0.5;

    return isRight && isBottom;
  }

  /**
   * Wait for both timers to be visible
   */
  async waitForTimersVisible(): Promise<void> {
    await this.timerPanel.waitFor({ state: 'visible' });
    await this.mainTimerDisplay.waitFor({ state: 'visible' });
    await this.finalTimerDisplay.waitFor({ state: 'visible' });
  }

  /**
   * Verify timer has shadow effect
   * @returns true if shadow is applied, false otherwise
   */
  async hasShadowEffect(): Promise<boolean> {
    const boxShadow = await this.timerPanel.evaluate((el) => {
      return window.getComputedStyle(el).boxShadow;
    });

    return boxShadow !== 'none' && boxShadow.length > 0;
  }
}
