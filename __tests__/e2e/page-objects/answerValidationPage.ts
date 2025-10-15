import { Page, Locator } from '@playwright/test';

/**
 * Page Object for answer validation interactions
 * Provides reusable selectors and actions for answer validation E2E tests
 */
export class AnswerValidationPage {
  readonly page: Page;
  readonly answerInput: Locator;
  readonly verifyButton: Locator;
  readonly validationFeedback: Locator;

  constructor(page: Page) {
    this.page = page;
    this.answerInput = page.getByTestId('answer-input');
    this.verifyButton = page.getByTestId('verify-button');
    this.validationFeedback = page.getByTestId('validation-feedback');
  }

  /**
   * Get a specific question square by number (1-12)
   */
  getQuestionSquare(number: number): Locator {
    return this.page.getByTestId(`question-square-${number}`);
  }

  /**
   * Submit an answer using the verify button
   */
  async submitAnswerViaButton(answer: string): Promise<void> {
    await this.answerInput.fill(answer);
    await this.verifyButton.click();
  }

  /**
   * Submit an answer using the Enter key
   */
  async submitAnswerViaEnter(answer: string): Promise<void> {
    await this.answerInput.fill(answer);
    await this.answerInput.press('Enter');
  }

  /**
   * Get the validation feedback text
   */
  async getValidationFeedback(): Promise<string | null> {
    return await this.validationFeedback.textContent();
  }

  /**
   * Check if a question square is marked as answered (green background)
   */
  async isQuestionAnswered(number: number): Promise<boolean> {
    const square = this.getQuestionSquare(number);
    const className = await square.getAttribute('class') || '';
    return className.includes('bg-green') || className.includes('green-500');
  }

  /**
   * Clear the answer input
   */
  async clearInput(): Promise<void> {
    await this.answerInput.clear();
  }

  /**
   * Get the current input value
   */
  async getInputValue(): Promise<string> {
    return await this.answerInput.inputValue();
  }

  /**
   * Check if the validation feedback text contains a specific string
   */
  async feedbackContains(text: string): Promise<boolean> {
    const feedback = await this.getValidationFeedback();
    return feedback?.includes(text) ?? false;
  }
}
