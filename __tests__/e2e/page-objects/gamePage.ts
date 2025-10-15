import { Page } from '@playwright/test';
import { BasePage } from './basePage';

/**
 * GamePage extends BasePage and can add game-specific functionality
 * Currently inherits all functionality from BasePage
 */
export class GamePage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // All game-related methods are now inherited from BasePage
  // Add any GamePage-specific methods here if needed in the future
}