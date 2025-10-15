import { Page, Locator } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Page Object for answer validation interactions
 * Provides reusable selectors and actions for answer validation E2E tests
 */
export class AnswerValidationPage {
  readonly page: Page;
  readonly answerInput: Locator;
  readonly verifyButton: Locator;
  readonly validationFeedback: Locator;
  readonly themeDisplay: Locator;
  readonly questionDisplay: Locator;

  constructor(page: Page) {
    this.page = page;
    this.answerInput = page.getByTestId('answer-input');
    this.verifyButton = page.getByTestId('verify-button');
    this.validationFeedback = page.getByTestId('validation-feedback');
    this.themeDisplay = page.getByTestId('theme-display');
    this.questionDisplay = page.getByTestId('question-text');
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

  /**
   * Get the current theme displayed on the page
   */
  async getTheme(): Promise<string> {
    const theme = await this.themeDisplay.textContent();
    return theme?.trim() || '';
  }

  /**
   * Get the current question text displayed on the page
   */
  async getQuestionText(): Promise<string> {
    const questionText = await this.questionDisplay.textContent();
    return questionText?.trim() || '';
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
   * Find the correct answer for the current question based on theme and question text
   */
  async getCorrectAnswer(): Promise<string> {
    const theme = await this.getTheme();
    const questionText = await this.getQuestionText();

    // Load all question sets
    const questionSets = this.loadQuestionSets();

    // Find the question set matching the current theme
    const matchingSet = questionSets.find(set => set.theme === theme);

    if (!matchingSet) {
      throw new Error(`No question set found with theme: ${theme}`);
    }

    // Find the question within the set
    const question = matchingSet.questions.find((q: any) =>
      q.question === questionText
    );

    if (!question) {
      throw new Error(`No question found matching: ${questionText}`);
    }

    return question.answer;
  }

  /**
   * Submit the correct answer for the current question
   */
  async submitCorrectAnswer(): Promise<void> {
    const correctAnswer = await this.getCorrectAnswer();
    await this.submitAnswerViaButton(correctAnswer);
  }
}
