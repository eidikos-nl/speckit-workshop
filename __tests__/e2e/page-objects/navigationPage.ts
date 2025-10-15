import { Page, Locator } from '@playwright/test';

/**
 * Page Object for navigation-related elements
 * Provides reusable selectors and actions for E2E tests
 */
export class NavigationPage {
  readonly page: Page;
  readonly nextChevron: Locator;
  readonly previousChevron: Locator;
  readonly currentQuestionDisplay: Locator;
  readonly questionNumberDisplay: Locator;
  
  constructor(page: Page) {
    this.page = page;
    this.nextChevron = page.getByTestId('next-chevron');
    this.previousChevron = page.getByTestId('previous-chevron');
    this.currentQuestionDisplay = page.getByTestId('question-text');
    this.questionNumberDisplay = page.getByTestId('question-number-display');
  }

  /**
   * Get a specific question grid square by number (1-12)
   */
  getQuestionSquare(number: number): Locator {
    return this.page.getByTestId(`question-square-${number}`);
  }

  /**
   * Get the answer input field
   */
  get answerInput(): Locator {
    return this.page.getByTestId('answer-input');
  }

  /**
   * Get the verify button
   */
  get verifyButton(): Locator {
    return this.page.getByTestId('verify-button');
  }

  /**
   * Navigate to the next question using the chevron
   */
  async clickNext(): Promise<void> {
    await this.nextChevron.click();
  }

  /**
   * Navigate to the previous question using the chevron
   */
  async clickPrevious(): Promise<void> {
    await this.previousChevron.click();
  }

  /**
   * Click a specific question square
   */
  async clickQuestionSquare(number: number): Promise<void> {
    await this.getQuestionSquare(number).click();
  }

  /**
   * Check if the next chevron is enabled
   */
  async isNextEnabled(): Promise<boolean> {
    return await this.nextChevron.isEnabled();
  }

  /**
   * Check if the previous chevron is enabled
   */
  async isPreviousEnabled(): Promise<boolean> {
    return await this.previousChevron.isEnabled();
  }

  /**
   * Get the current question display text (includes "Question X of 12")
   */
  async getQuestionText(): Promise<string> {
    const questionNumber = await this.questionNumberDisplay.textContent() || '';
    const questionContent = await this.currentQuestionDisplay.textContent() || '';
    return questionNumber + questionContent;
  }

  /**
   * Check if a specific question square is highlighted/active
   */
  async isQuestionSquareActive(number: number): Promise<boolean> {
    const square = this.getQuestionSquare(number);
    const className = await square.getAttribute('class') || '';
    // Looking for active/highlighted state in class names
    return className.includes('active') || className.includes('bg-blue');
  }
}