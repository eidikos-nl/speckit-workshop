/**
 * Page Object for Final Answer UI interactions
 *
 * Provides reusable methods for interacting with the FinalAnswerInput component
 * in E2E tests. Encapsulates selectors and interaction patterns.
 */

import { Page, Locator } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { BasePage } from './basePage';

export class FinalAnswerPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  /**
   * Gets a specific final answer box by position (1-12)
   * @param position - Box position (1-12)
   * @returns Locator for the box
   */
  getBox(position: number): Locator {
    if (position < 1 || position > 12) {
      throw new Error('Position must be between 1 and 12');
    }
    return this.page.locator(`[data-testid="final-answer-box-${position}"]`);
  }

  /**
   * Gets all 12 final answer boxes
   * @returns Array of locators for all boxes
   */
  async getAllBoxes(): Promise<Locator[]> {
    const boxes: Locator[] = [];
    for (let i = 1; i <= 12; i++) {
      boxes.push(this.getBox(i));
    }
    return boxes;
  }

  /**
   * Gets the submit button
   * @returns Locator for submit button
   */
  getSubmitButton(): Locator {
    return this.page.locator('[data-testid="final-answer-submit"]');
  }

  /**
   * Gets the result message element
   * @returns Locator for result message
   */
  getResultMessage(): Locator {
    return this.page.locator('[data-testid="final-answer-result-message"]');
  }

  /**
   * Gets the entire final answer input container
   * @returns Locator for container
   */
  getContainer(): Locator {
    return this.page.locator('div').filter({ hasText: 'Submit Answer' }).first();
  }

  /**
   * Wait for final answer boxes to be ready for input
   */
  async waitForBoxesReady(): Promise<void> {
    await this.getBox(1).waitFor({ state: 'visible' });
  }

  /**
   * Focus the final answer component to enable keyboard input
   */
  async focusFinalAnswer(): Promise<void> {
    await this.getBox(1).click();
    // Wait a brief moment for focus to be established
    await this.page.waitForTimeout(50);
  }

  /**
   * Types a single character
   * @param char - Character to type
   */
  async typeCharacter(char: string): Promise<void> {
    if (char.length !== 1) {
      throw new Error('Character must be a single character');
    }
    await this.waitForBoxesReady();
    await this.focusFinalAnswer();
    await this.page.keyboard.type(char);
  }

  /**
   * Types a full answer (multiple characters)
   * @param answer - Answer string to type
   */
  async typeAnswer(answer: string): Promise<void> {
    if (answer.length > 12) {
      throw new Error('Answer cannot exceed 12 characters');
    }
    await this.waitForBoxesReady();
    await this.focusFinalAnswer();
    await this.page.keyboard.type(answer);
  }

  /**
   * Presses backspace (removes last character)
   */
  async backspace(): Promise<void> {
    await this.page.keyboard.press('Backspace');
  }

  /**
   * Presses backspace multiple times
   * @param count - Number of times to press backspace
   */
  async backspaceMultiple(count: number): Promise<void> {
    for (let i = 0; i < count; i++) {
      await this.backspace();
    }
  }

  /**
   * Presses Enter key
   */
  async pressEnter(): Promise<void> {
    await this.page.keyboard.press('Enter');
  }

  /**
   * Clicks the submit button
   */
  async clickSubmit(): Promise<void> {
    await this.getSubmitButton().click();
  }

  /**
   * Gets text content of a specific box
   * @param position - Box position (1-12)
   * @returns Character in the box, empty string if empty
   */
  async getBoxContent(position: number): Promise<string> {
    const text = await this.getBox(position).textContent();
    return text?.trim() ?? '';
  }

  /**
   * Gets all box contents as a string
   * @returns 12-character string representing all boxes
   */
  async getAllBoxContents(): Promise<string> {
    let content = '';
    const boxes = await this.getAllBoxes();
    for (const box of boxes) {
      const text = await box.textContent();
      content += text?.trim() ?? '';
    }
    return content;
  }

  /**
   * Checks if submit button is enabled
   * @returns true if button is enabled, false otherwise
   */
  async isSubmitEnabled(): Promise<boolean> {
    return !(await this.getSubmitButton().isDisabled());
  }

  /**
   * Checks if submit button is visible
   * @returns true if button is visible, false otherwise
   */
  async isSubmitVisible(): Promise<boolean> {
    return await this.getSubmitButton().isVisible();
  }

  /**
   * Checks if result message is visible
   * @returns true if result is visible, false otherwise
   */
  async isResultVisible(): Promise<boolean> {
    return await this.getResultMessage().isVisible();
  }

  /**
   * Gets the result message text
   * @returns Text content of result message
   */
  async getResultText(): Promise<string> {
    return await this.getResultMessage().textContent() ?? '';
  }

  /**
   * Checks if the game result is a win
   * @returns true if result indicates win, false for loss, null if no result yet
   */
  async isWin(): Promise<boolean | null> {
    if (!(await this.isResultVisible())) {
      return null;
    }
    const text = await this.getResultText();
    return text.toLowerCase().includes('congratulations');
  }

  /**
   * Checks if a specific box has win styling (green)
   * @param position - Box position (1-12)
   * @returns true if box has green styling
   */
  async hasWinStyling(position: number): Promise<boolean> {
    const classList = await this.getBox(position).getAttribute('class');
    return classList?.includes('green') ?? false;
  }

  /**
   * Checks if a specific box has loss styling (red)
   * @param position - Box position (1-12)
   * @returns true if box has red styling
   */
  async hasLossStyling(position: number): Promise<boolean> {
    const classList = await this.getBox(position).getAttribute('class');
    return classList?.includes('red') ?? false;
  }

  /**
   * Waits for submit button to be enabled
   * @param timeout - Timeout in milliseconds
   */
  async waitForSubmitEnabled(timeout: number = 5000): Promise<void> {
    await this.getSubmitButton().isEnabled({ timeout });
  }

  /**
   * Waits for result message to appear
   * @param timeout - Timeout in milliseconds
   */
  async waitForResult(timeout: number = 5000): Promise<void> {
    await this.getResultMessage().isVisible({ timeout });
  }

  /**
   * Clears all entered characters
   */
  async clearAll(): Promise<void> {
    const content = await this.getAllBoxContents();
    for (let i = 0; i < content.length; i++) {
      await this.backspace();
    }
  }

  /**
   * Enters a complete 12-character answer and submits it
   * @param answer - 12-character answer string
   */
  async submitAnswer(answer: string): Promise<void> {
    if (answer.length !== 12) {
      throw new Error('Answer must be exactly 12 characters');
    }
    await this.typeAnswer(answer);
    await this.clickSubmit();
  }

  /**
   * Gets ARIA label of a specific box
   * @param position - Box position (1-12)
   * @returns ARIA label text
   */
  async getBoxAriaLabel(position: number): Promise<string> {
    return (await this.getBox(position).getAttribute('aria-label')) ?? '';
  }

  /**
   * Clicks on a specific box to set focus
   * @param position - Box position (1-12)
   */
  async clickBox(position: number): Promise<void> {
    await this.getBox(position).click();
  }

  /**
   * Gets the grid container's class for styling verification
   * @returns Class string of the grid
   */
  async getGridClasses(): Promise<string> {
    // This gets the parent grid container
    const parent = await this.getBox(1).locator('xpath=ancestor::div[@class]').first();
    return (await parent.getAttribute('class')) ?? '';
  }

  /**
   * Load all question sets from the question-sets directory
   */
  private loadQuestionSets(): any[] {
    const questionSetsDir = path.join(process.cwd(), 'question-sets');
    const files = fs.readdirSync(questionSetsDir).filter(f => f.endsWith('.json'));

    return files.map(file => {
      const filePath = path.join(questionSetsDir, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content);
    });
  }

  /**
   * Get the current theme displayed on the page (inherited from BasePage as getThemeText)
   */
  async getTheme(): Promise<string> {
    const theme = await this.getThemeText();
    return theme?.trim() || '';
  }

  /**
   * Get the main answer (final word) for the current question set based on theme
   */
  async getMainAnswer(): Promise<string> {
    const theme = await this.getTheme();

    // Load all question sets
    const questionSets = this.loadQuestionSets();

    // Find the question set matching the current theme
    const matchingSet = questionSets.find(set => set.theme === theme);

    if (!matchingSet) {
      throw new Error(`No question set found with theme: ${theme}`);
    }

    return matchingSet.mainAnswer;
  }

  /**
   * Submit the correct main answer for the current question set
   */
  async submitCorrectMainAnswer(): Promise<void> {
    const mainAnswer = await this.getMainAnswer();
    await this.submitAnswer(mainAnswer);
  }
}
