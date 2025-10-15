import { test, expect } from '@playwright/test';
import { GamePage } from './page-objects/gamePage';
import { AnswerValidationPage } from './page-objects/answerValidationPage';

/**
 * E2E tests for User Story 3: Multiple Submission Attempts
 *
 * Tests that players can submit multiple answers for the same question,
 * learning through trial without penalties, and that state persists correctly.
 */
test.describe('Multiple Submission Attempts - User Story 3', () => {
  let gamePage: GamePage;
  let validationPage: AnswerValidationPage;

  test.beforeEach(async ({ page }) => {
    gamePage = new GamePage(page);
    validationPage = new AnswerValidationPage(page);

    // Navigate to the game and start it
    await page.goto('/');
    await gamePage.startGame();

    // Wait for game to be active
    await expect(gamePage.stopButton).toBeVisible();
  });

  test('T022: Submit multiple incorrect answers and verify feedback shows each time', async ({
    page,
  }) => {
    // First incorrect submission
    await validationPage.submitAnswerViaButton('attempt1');
    await page.waitForTimeout(100);

    let feedback = await validationPage.getValidationFeedback();
    expect(feedback).toContain('That is incorrect');

    // Clear and try second incorrect answer
    await validationPage.answerInput.fill('attempt2');
    await page.waitForTimeout(50);
    await validationPage.verifyButton.click();
    await page.waitForTimeout(100);

    feedback = await validationPage.getValidationFeedback();
    expect(feedback).toContain('That is incorrect');

    // Clear and try third incorrect answer
    await validationPage.answerInput.fill('attempt3');
    await page.waitForTimeout(50);
    await validationPage.verifyButton.click();
    await page.waitForTimeout(100);

    feedback = await validationPage.getValidationFeedback();
    expect(feedback).toContain('That is incorrect');

    // Verify we can keep trying (mechanism works for multiple attempts)
    // Each attempt shows feedback, even though we don't know the correct answer
    await validationPage.answerInput.fill('attempt4');
    await page.waitForTimeout(50);
    await validationPage.verifyButton.click();
    await page.waitForTimeout(100);

    feedback = await validationPage.getValidationFeedback();
    // Could be correct or incorrect, but should have some feedback
    expect(feedback).toBeTruthy();
  });

  test('T022: Question state persists during navigation after multiple attempts', async ({
    page,
  }) => {
    // Submit incorrect answer on Q1
    await validationPage.submitAnswerViaButton('wrong');
    await page.waitForTimeout(100);

    // Navigate to Q2
    await validationPage.getQuestionSquare(2).click();
    await page.waitForTimeout(200);

    // Navigate back to Q1
    await validationPage.getQuestionSquare(1).click();
    await page.waitForTimeout(200);

    // Input should be cleared (component reset)
    let inputValue = await validationPage.getInputValue();
    expect(inputValue).toBe('');

    // But Q1 should still be the current question
    const square1 = validationPage.getQuestionSquare(1);
    const className = await square1.getAttribute('class') || '';
    expect(className).toContain('bg-game-primary'); // Active state
  });

  test('T022: Answered question maintains state on revisit', async ({
    page,
  }) => {
    // Get initial state of Q1
    let square1 = validationPage.getQuestionSquare(1);
    let initialClass = await square1.getAttribute('class') || '';
    const initialHasGreen = initialClass.includes('green-500');

    // Navigate to Q2
    await validationPage.getQuestionSquare(2).click();
    await page.waitForTimeout(200);

    // Navigate back to Q1
    await validationPage.getQuestionSquare(1).click();
    await page.waitForTimeout(200);

    // Q1 should maintain same state (either green or not, but consistent)
    square1 = validationPage.getQuestionSquare(1);
    let revisitClass = await square1.getAttribute('class') || '';
    const revisitHasGreen = revisitClass.includes('green-500');

    // State should persist - if it was green, it stays green; if gray, stays gray
    expect(revisitHasGreen).toBe(initialHasGreen);
  });

  test('T022: Feedback clears between attempts on same question', async ({
    page,
  }) => {
    // First incorrect attempt
    await validationPage.submitAnswerViaButton('wrong1');
    await page.waitForTimeout(100);

    let feedback = await validationPage.getValidationFeedback();
    expect(feedback).toContain('That is incorrect');

    // Modify input - feedback should clear
    await validationPage.answerInput.fill('');
    await page.waitForTimeout(50);

    feedback = await validationPage.getValidationFeedback();
    expect(feedback).not.toContain('That is incorrect');

    // Try again with another wrong answer
    await validationPage.answerInput.fill('wrong2');
    await page.waitForTimeout(50);
    await validationPage.verifyButton.click();
    await page.waitForTimeout(100);

    feedback = await validationPage.getValidationFeedback();
    expect(feedback).toContain('That is incorrect');

    // Clear again
    await validationPage.answerInput.fill('');
    await page.waitForTimeout(50);

    feedback = await validationPage.getValidationFeedback();
    expect(feedback).not.toContain('That is incorrect');
  });

  test('T022: Can retry question after navigating away', async ({ page }) => {
    // Submit incorrect answer on Q1
    await validationPage.submitAnswerViaButton('wrong');
    await page.waitForTimeout(100);

    // Navigate away to Q3
    await validationPage.getQuestionSquare(3).click();
    await page.waitForTimeout(200);

    // Come back to Q1
    await validationPage.getQuestionSquare(1).click();
    await page.waitForTimeout(200);

    // Should be able to submit new answer
    await validationPage.submitAnswerViaButton('test');
    await page.waitForTimeout(100);

    // Should work fine
    const feedback = await validationPage.getValidationFeedback();
    expect(feedback).toBeTruthy();
  });

  test('T022: Multiple questions can be navigated sequentially and tracked', async ({
    page,
  }) => {
    // Navigate through several questions and submit answers
    for (let i = 1; i <= 3; i++) {
      // Submit answer (might be correct or incorrect, we don't know the answers)
      await validationPage.submitAnswerViaButton(`attempt_q${i}`);
      await page.waitForTimeout(100);

      // Verify feedback exists (either correct or incorrect)
      const feedback = await validationPage.getValidationFeedback();
      expect(feedback).toBeTruthy();

      // Move to next question if not last
      if (i < 3) {
        await validationPage.getQuestionSquare(i + 1).click();
        await page.waitForTimeout(200);
      }
    }

    // Navigate back to Q1 and verify we can still interact
    await validationPage.getQuestionSquare(1).click();
    await page.waitForTimeout(200);

    // Input should be empty (fresh navigation)
    const inputValue = await validationPage.getInputValue();
    expect(inputValue).toBe('');

    // Should still be able to submit answer
    await validationPage.submitAnswerViaButton('another_attempt');
    await page.waitForTimeout(100);
    const feedback = await validationPage.getValidationFeedback();
    expect(feedback).toBeTruthy();
  });

  test('T022: Long sequence of attempts with navigation works correctly', async ({
    page,
  }) => {
    // Attempt on Q1 multiple times
    await validationPage.submitAnswerViaButton('attempt1');
    await page.waitForTimeout(100);

    let feedback = await validationPage.getValidationFeedback();
    expect(feedback).toBeTruthy();

    await validationPage.answerInput.fill('attempt2');
    await page.waitForTimeout(50);
    await validationPage.verifyButton.click();
    await page.waitForTimeout(100);

    feedback = await validationPage.getValidationFeedback();
    expect(feedback).toBeTruthy();

    // Navigate to Q2
    await validationPage.getQuestionSquare(2).click();
    await page.waitForTimeout(200);

    // Input should be cleared on navigation
    let inputValue = await validationPage.getInputValue();
    expect(inputValue).toBe('');

    // Attempt on Q2
    await validationPage.submitAnswerViaButton('q2attempt');
    await page.waitForTimeout(100);

    feedback = await validationPage.getValidationFeedback();
    expect(feedback).toBeTruthy();

    // Navigate to Q5
    await validationPage.getQuestionSquare(5).click();
    await page.waitForTimeout(200);

    // Input cleared again
    inputValue = await validationPage.getInputValue();
    expect(inputValue).toBe('');

    // Submit answer on Q5
    await validationPage.submitAnswerViaButton('q5attempt');
    await page.waitForTimeout(100);

    feedback = await validationPage.getValidationFeedback();
    expect(feedback).toBeTruthy();

    // Go back to Q1 and verify we can still interact
    await validationPage.getQuestionSquare(1).click();
    await page.waitForTimeout(200);

    inputValue = await validationPage.getInputValue();
    expect(inputValue).toBe(''); // Input cleared

    // Should still be able to submit
    await validationPage.submitAnswerViaButton('final_attempt_q1');
    await page.waitForTimeout(100);
    feedback = await validationPage.getValidationFeedback();
    expect(feedback).toBeTruthy();
  });

  test('T022: Rapid successive submissions are handled correctly', async ({
    page,
  }) => {
    // Rapid fire submissions without wait
    await validationPage.answerInput.fill('test1');
    await validationPage.verifyButton.click();

    // Quick second attempt
    await validationPage.answerInput.fill('test2');
    await validationPage.verifyButton.click();

    // Wait for all to process
    await page.waitForTimeout(200);

    // Should have valid state
    const feedback = await validationPage.getValidationFeedback();
    expect(feedback).toBeTruthy();

    const inputValue = await validationPage.getInputValue();
    expect(inputValue).toBe('test2');
  });

  test('T021: Letters persist when navigating between questions', async ({ page }) => {
    // Submit correct answers to multiple questions
    // Get the initial letter display for Q1 (should be period)
    let square1 = validationPage.getQuestionSquare(1);
    let text1 = await square1.textContent();
    expect(text1).toBe('.'); // Initially unanswered

    // Answer Q1
    await validationPage.submitAnswerViaButton('test');
    await page.waitForTimeout(200);

    // Q1 should now show a letter
    square1 = validationPage.getQuestionSquare(1);
    text1 = await square1.textContent();
    expect(text1).not.toBe('.');
    const letterQ1 = text1;

    // Navigate to Q2
    await validationPage.getQuestionSquare(2).click();
    await page.waitForTimeout(200);

    // Q2 should show period (unanswered)
    let square2 = validationPage.getQuestionSquare(2);
    let text2 = await square2.textContent();
    expect(text2).toBe('.');

    // Answer Q2
    await validationPage.submitAnswerViaButton('test');
    await page.waitForTimeout(200);

    // Q2 should now show a letter
    square2 = validationPage.getQuestionSquare(2);
    text2 = await square2.textContent();
    expect(text2).not.toBe('.');

    // Navigate to Q3
    await validationPage.getQuestionSquare(3).click();
    await page.waitForTimeout(200);

    // Navigate back to Q1 - Q1 should still show the same letter
    await validationPage.getQuestionSquare(1).click();
    await page.waitForTimeout(200);

    square1 = validationPage.getQuestionSquare(1);
    text1 = await square1.textContent();
    expect(text1).toBe(letterQ1); // Letter persisted!

    // Q2 should still show its letter
    square2 = validationPage.getQuestionSquare(2);
    text2 = await square2.textContent();
    expect(text2).not.toBe('.');
  });

  test('T021: Letters reset when starting a new game', async ({ page }) => {
    // Answer Q1
    await validationPage.submitAnswerViaButton('test');
    await page.waitForTimeout(200);

    // Q1 should show a letter
    let square1 = validationPage.getQuestionSquare(1);
    let text1 = await square1.textContent();
    expect(text1).not.toBe('.');

    // Stop the game
    await gamePage.stopGame();
    await page.waitForTimeout(200);

    // Start a new game
    await gamePage.startGame();
    await page.waitForTimeout(200);

    // Q1 should reset to show period (not answered)
    square1 = validationPage.getQuestionSquare(1);
    text1 = await square1.textContent();
    expect(text1).toBe('.'); // Reset!
  });

  test('T021: All letters reset on new game', async ({ page }) => {
    // Answer multiple questions
    for (let i = 0; i < 3; i++) {
      if (i > 0) {
        await validationPage.getQuestionSquare(i + 1).click();
        await page.waitForTimeout(200);
      }
      await validationPage.submitAnswerViaButton(`test${i}`);
      await page.waitForTimeout(100);
    }

    // Verify all three have letters
    for (let i = 1; i <= 3; i++) {
      const square = validationPage.getQuestionSquare(i);
      const text = await square.textContent();
      expect(text).not.toBe('.');
    }

    // Stop and restart game
    await gamePage.stopGame();
    await page.waitForTimeout(200);
    await gamePage.startGame();
    await page.waitForTimeout(200);

    // All should reset to periods
    for (let i = 1; i <= 3; i++) {
      const square = validationPage.getQuestionSquare(i);
      const text = await square.textContent();
      expect(text).toBe('.');
    }
  });
});
