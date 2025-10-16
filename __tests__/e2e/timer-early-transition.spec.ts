import { test, expect } from '@playwright/test';
import { AnswerValidationPage } from './page-objects/answerValidationPage';
import { TimerPage } from './page-objects/timerPage';

/**
 * E2E tests for early transition to FINAL_ANSWER phase
 *
 * When all 12 questions are answered correctly before the main timer expires,
 * the game should immediately transition to the FINAL_ANSWER phase, freeze the
 * main timer, and start the 2-minute final timer.
 */
test.describe('Timer Early Transition - All Questions Answered', () => {
  let answerValidationPage: AnswerValidationPage;
  let timerPage: TimerPage;

  test.beforeEach(async ({ page }) => {
    answerValidationPage = new AnswerValidationPage(page);
    timerPage = new TimerPage(page);

    // Install clock before navigation to control time
    await page.clock.install({ time: new Date('2024-01-01T00:00:00') });

    // Navigate to the game
    await answerValidationPage.navigateAndStartGame();

    // Wait for timers to be visible
    await timerPage.waitForTimersVisible();
  });

  test('should transition to FINAL_ANSWER phase when all 12 questions are answered', async ({
    page,
  }) => {
    // Get the initial main timer value
    const initialMainTimer = await timerPage.getMainTimer();
    expect(initialMainTimer).toBe('10:00');

    // Get the initial final timer value
    const initialFinalTimer = await timerPage.getFinalTimer();
    expect(initialFinalTimer).toBe('2:00');

    // Answer all 12 questions
    await answerValidationPage.answerAllQuestions();

    // Fast-forward clock to trigger the interval update
    await page.clock.fastForward(1000);
    await page.waitForTimeout(100);

    // Verify that the main timer is now frozen (should not change)
    const mainTimerAfterAnswering = await timerPage.getMainTimer();
    expect(mainTimerAfterAnswering).not.toBe('10:00'); // Should have counted down

    // Store the main timer value
    const frozenMainTimer = mainTimerAfterAnswering;

    // Fast-forward 2 seconds and verify main timer is still the same (frozen)
    await page.clock.fastForward(2000);
    await page.waitForTimeout(100);
    const mainTimerAfterWait = await timerPage.getMainTimer();
    expect(mainTimerAfterWait).toBe(frozenMainTimer); // Should be frozen

    // Verify that the final timer has started counting down from 2:00
    const finalTimerAfterAnswering = await timerPage.getFinalTimer();
    expect(finalTimerAfterAnswering).not.toBe('2:00'); // Should have counted down

    // Verify that the final answer input is now visible and ready
    const submitButton = page.getByTestId('final-answer-submit');
    await expect(submitButton).toBeVisible();
  });

  test('should display main timer as frozen after all questions answered', async ({ page }) => {
    // Answer all 12 questions
    await answerValidationPage.answerAllQuestions();

    // Fast-forward clock to trigger the interval update
    await page.clock.fastForward(1000);
    await page.waitForTimeout(100);

    // Get main timer value after answering all questions
    const mainTimerAtTransition = await timerPage.getMainTimer();

    // Fast-forward 3 seconds
    await page.clock.fastForward(3000);
    await page.waitForTimeout(100);

    // Verify main timer hasn't changed (frozen)
    const mainTimerAfterWait = await timerPage.getMainTimer();
    expect(mainTimerAfterWait).toBe(mainTimerAtTransition);
  });

  test('should transition final timer to active state', async ({ page }) => {
    // Get initial final timer state (should be gray/inactive)
    const initialFinalTimerGray = await timerPage.isFinalTimerGray();

    // Answer all 12 questions
    await answerValidationPage.answerAllQuestions();

    // Fast-forward clock to trigger the interval update
    await page.clock.fastForward(1000);
    await page.waitForTimeout(100);

    // Get final timer value - it should now be counting down
    const finalTimerAtTransition = await timerPage.getFinalTimer();
    expect(finalTimerAtTransition).not.toBe('2:00');

    // Fast-forward 2 seconds
    await page.clock.fastForward(2000);
    await page.waitForTimeout(100);

    // Get final timer value again - it should have decreased further
    const finalTimerAfterWait = await timerPage.getFinalTimer();
    expect(finalTimerAfterWait).not.toBe(finalTimerAtTransition);
  });

  test('should keep question navigation disabled after early transition', async ({ page }) => {
    // Answer all 12 questions
    await answerValidationPage.answerAllQuestions();

    // Fast-forward clock to trigger the interval update
    await page.clock.fastForward(1000);
    await page.waitForTimeout(100);

    // Check that next and previous chevrons are disabled
    const nextChevron = page.getByTestId('next-chevron');
    const previousChevron = page.getByTestId('previous-chevron');

    // Both chevrons should be disabled
    const nextIsDisabled = await nextChevron.isDisabled();
    const previousIsDisabled = await previousChevron.isDisabled();

    expect(nextIsDisabled).toBe(true);
    expect(previousIsDisabled).toBe(true);
  });

  test('should apply opacity to question display after early transition', async ({ page }) => {
    // Answer all 12 questions
    await answerValidationPage.answerAllQuestions();

    // Fast-forward clock to trigger the interval update
    await page.clock.fastForward(1000);
    await page.waitForTimeout(200);

    // Find the question display - check parent wrapper opacity via evaluate
    const questionDisplay = page.locator('[data-testid="current-question-display"]');

    // During FINAL_ANSWER phase, parent wrapper opacity should be 0.2 (20%)
    const opacity = await questionDisplay.evaluate((el) => {
      return window.getComputedStyle(el.parentElement!).opacity;
    });
    expect(parseFloat(opacity)).toBe(0.2);
  });

  test('should allow final answer submission after early transition', async ({ page }) => {
    // Answer all 12 questions
    await answerValidationPage.answerAllQuestions();

    // Fast-forward clock to trigger the interval update
    await page.clock.fastForward(1000);
    await page.waitForTimeout(100);

    // Get the correct final answer
    const correctMainAnswer = await answerValidationPage.getMainAnswer();

    // Click on the first final answer box to focus the component
    const finalAnswerBox = page.getByTestId('final-answer-box-1');
    await finalAnswerBox.click();
    await page.waitForTimeout(50);

    // Type the final answer
    await page.keyboard.type(correctMainAnswer);

    // Verify submit button is enabled
    const submitButton = page.getByTestId('final-answer-submit');
    const isEnabled = await submitButton.isEnabled();
    expect(isEnabled).toBe(true);

    // Submit the answer
    await submitButton.click();

    // Wait for result message
    await page.waitForTimeout(100);

    // Verify result message shows win
    const resultMessage = page.getByTestId('final-answer-result-message');
    const resultText = await resultMessage.textContent();
    expect(resultText).toContain('Congratulations');
  });
});
