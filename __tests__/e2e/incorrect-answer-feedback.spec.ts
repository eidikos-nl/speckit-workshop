import { test, expect } from '@playwright/test';
import { GamePage } from './page-objects/gamePage';
import { AnswerValidationPage } from './page-objects/answerValidationPage';

/**
 * E2E tests for User Story 2: Incorrect Answer Feedback
 *
 * Tests that players receive clear feedback when submitting incorrect answers
 * and can recover by modifying their answer without penalty.
 */
test.describe('Incorrect Answer Feedback - User Story 2', () => {
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

  test('T017: Display "That is incorrect" text when wrong answer submitted', async ({
    page,
  }) => {
    // Verify input and feedback area are visible
    await expect(validationPage.answerInput).toBeVisible();
    await expect(validationPage.validationFeedback).toBeVisible();

    // Submit an incorrect answer via button
    await validationPage.submitAnswerViaButton('wrong-answer');

    await page.waitForTimeout(100);

    // Check that feedback text contains "That is incorrect"
    const feedback = await validationPage.getValidationFeedback();
    expect(feedback).toContain('That is incorrect');
  });

  test('T017: "That is incorrect" displays via Enter key submission', async ({
    page,
  }) => {
    // Submit an incorrect answer via Enter key
    await validationPage.submitAnswerViaEnter('wrong-answer');

    await page.waitForTimeout(100);

    // Verify feedback text
    const feedback = await validationPage.getValidationFeedback();
    expect(feedback).toContain('That is incorrect');
  });

  test('T017: Feedback text clears when input is modified', async ({ page }) => {
    // Submit incorrect answer
    await validationPage.submitAnswerViaButton('wrong-answer');
    await page.waitForTimeout(100);

    // Verify feedback is displayed
    let feedback = await validationPage.getValidationFeedback();
    expect(feedback).toContain('That is incorrect');

    // Modify the input
    await validationPage.answerInput.fill('different-answer');
    await page.waitForTimeout(50);

    // Feedback should clear (revert to default text)
    feedback = await validationPage.getValidationFeedback();
    expect(feedback).not.toContain('That is incorrect');
    expect(feedback).toContain('Answer verification coming in a future update');
  });

  test('T017: Feedback clears on partial keystroke changes', async ({ page }) => {
    // Submit incorrect answer
    await validationPage.submitAnswerViaButton('wrong');
    await page.waitForTimeout(100);

    // Verify feedback
    let feedback = await validationPage.getValidationFeedback();
    expect(feedback).toContain('That is incorrect');

    // Delete a character from input
    const input = validationPage.answerInput;
    await input.press('End'); // Move to end
    await input.press('Backspace'); // Delete last char

    await page.waitForTimeout(50);

    // Feedback should be cleared
    feedback = await validationPage.getValidationFeedback();
    expect(feedback).not.toContain('That is incorrect');
  });

  test('T017: Feedback color differs for incorrect vs correct answers', async ({
    page,
  }) => {
    // Submit incorrect answer
    await validationPage.submitAnswerViaButton('wrong-answer');
    await page.waitForTimeout(100);

    // Get feedback element and check its styling
    const feedbackElement = page.getByTestId('validation-feedback');
    const incorrectClass = await feedbackElement.getAttribute('class');

    // For incorrect answers, should NOT have green color
    expect(incorrectClass).not.toContain('green-500');
    expect(incorrectClass).toContain('gray-500');

    // Modify input to trigger clear
    await validationPage.answerInput.fill('modified');
    await page.waitForTimeout(50);

    // Verify class reverted to neutral
    const clearedClass = await feedbackElement.getAttribute('class');
    expect(clearedClass).toContain('gray-500');
  });

  test('T017: Multiple incorrect submissions show feedback each time', async ({
    page,
  }) => {
    // First incorrect submission
    await validationPage.submitAnswerViaButton('wrong1');
    await page.waitForTimeout(100);

    let feedback = await validationPage.getValidationFeedback();
    expect(feedback).toContain('That is incorrect');

    // Modify and submit again
    await validationPage.answerInput.fill('wrong2');
    await page.waitForTimeout(50);
    await validationPage.verifyButton.click();
    await page.waitForTimeout(100);

    // Should still show incorrect feedback
    feedback = await validationPage.getValidationFeedback();
    expect(feedback).toContain('That is incorrect');

    // One more time
    await validationPage.answerInput.fill('wrong3');
    await page.waitForTimeout(50);
    await validationPage.verifyButton.click();
    await page.waitForTimeout(100);

    feedback = await validationPage.getValidationFeedback();
    expect(feedback).toContain('That is incorrect');
  });

  test('T017: Incorrect feedback persists while viewing same question', async ({
    page,
  }) => {
    // Submit incorrect answer
    await validationPage.submitAnswerViaButton('wrong-answer');
    await page.waitForTimeout(100);

    // Verify feedback is shown
    let feedback = await validationPage.getValidationFeedback();
    expect(feedback).toContain('That is incorrect');

    // Wait and check again without changing anything
    await page.waitForTimeout(200);
    feedback = await validationPage.getValidationFeedback();
    expect(feedback).toContain('That is incorrect');
  });

  test('T017: Feedback clears on navigation to different question', async ({
    page,
  }) => {
    // Submit incorrect answer on Q1
    await validationPage.submitAnswerViaButton('wrong-answer');
    await page.waitForTimeout(100);

    // Verify feedback
    let feedback = await validationPage.getValidationFeedback();
    expect(feedback).toContain('That is incorrect');

    // Navigate to Q2
    await validationPage.getQuestionSquare(2).click();
    await page.waitForTimeout(200);

    // Input should be cleared (key prop on QuestionDisplay ensures this)
    const inputValue = await validationPage.getInputValue();
    expect(inputValue).toBe('');

    // Feedback should revert to default since new component instance
    feedback = await validationPage.getValidationFeedback();
    expect(feedback).toContain('Answer verification coming in a future update');
  });
});
