import { test, expect, Page } from '@playwright/test';
import { GamePage } from './page-objects/gamePage';
import { AnswerValidationPage } from './page-objects/answerValidationPage';
import { FinalAnswerPage } from './page-objects/finalAnswerPage';

test.describe('Scoring System E2E Tests', () => {
  let gamePage: GamePage;
  let answerValidationPage: AnswerValidationPage;
  let finalAnswerPage: FinalAnswerPage;

  test.beforeEach(async ({ page }: { page: Page }) => {
    gamePage = new GamePage(page);
    answerValidationPage = new AnswerValidationPage(page);
    finalAnswerPage = new FinalAnswerPage(page);
    await gamePage.navigateToHome();
  });

  test.describe('User Story 1: View Running Score During Gameplay', () => {
    test('should display score panel in lower left with initial score of 0', async ({ page }) => {
      await gamePage.startGame();

      // Verify score panel is visible
      const scorePanel = page.locator('[data-testid="score-panel"]');
      await expect(scorePanel).toBeVisible();

      // Verify initial score is 0
      const scoreValue = page.locator('[data-testid="score-value"]');
      await expect(scoreValue).toHaveText('0');

      // Verify "Score" label is displayed
      await expect(scorePanel).toContainText('Score');
    });

    test('should position score panel in bottom-left corner', async ({ page }) => {
      await gamePage.startGame();

      const scorePanel = page.locator('[data-testid="score-panel"]');

      // Verify fixed positioning
      const position = await scorePanel.evaluate((el) => {
        return window.getComputedStyle(el).position;
      });
      expect(position).toBe('fixed');

      // Verify bottom-left positioning
      const boundingBox = await scorePanel.boundingBox();
      expect(boundingBox).toBeTruthy();

      if (boundingBox) {
        const viewportSize = page.viewportSize();
        expect(viewportSize).toBeTruthy();

        if (viewportSize) {
          // Check if in bottom-left quadrant
          const isLeft = boundingBox.x < viewportSize.width * 0.5;
          const isBottom = boundingBox.y > viewportSize.height * 0.5;

          expect(isLeft).toBe(true);
          expect(isBottom).toBe(true);
        }
      }
    });

    test('should match timer panel styling (shadow, rounded, white background)', async ({ page }) => {
      await gamePage.startGame();

      const scorePanel = page.locator('[data-testid="score-panel"]');

      // Verify shadow effect
      const boxShadow = await scorePanel.evaluate((el) => {
        return window.getComputedStyle(el).boxShadow;
      });
      expect(boxShadow).not.toBe('none');

      // Verify white background
      const backgroundColor = await scorePanel.evaluate((el) => {
        return window.getComputedStyle(el).backgroundColor;
      });
      expect(backgroundColor).toBe('rgb(255, 255, 255)');

      // Verify rounded corners
      const borderRadius = await scorePanel.evaluate((el) => {
        return window.getComputedStyle(el).borderRadius;
      });
      expect(parseFloat(borderRadius)).toBeGreaterThan(0);
    });

    test('should increase score by 10 for correct answer', async ({ page }) => {
      await gamePage.startGame();

      const scoreValue = page.locator('[data-testid="score-value"]');

      // Initial score should be 0
      await expect(scoreValue).toHaveText('0');

      // Submit correct answer
      await answerValidationPage.submitCorrectAnswer();

      // Wait for score update
      await page.waitForTimeout(100);

      // Score should be 10
      await expect(scoreValue).toHaveText('10');
    });

    test('should decrease score by 1 for incorrect answer', async ({ page }) => {
      await gamePage.startGame();

      const scoreValue = page.locator('[data-testid="score-value"]');

      // Get initial correct answer first to build up score
      await answerValidationPage.submitCorrectAnswer();
      await page.waitForTimeout(100);
      await expect(scoreValue).toHaveText('10');

      // Submit incorrect answer
      await answerValidationPage.submitIncorrectAnswer();
      await page.waitForTimeout(100);

      // Score should decrease to 9
      await expect(scoreValue).toHaveText('9');
    });

    test('should never allow score to go below 0', async ({ page }) => {
      await gamePage.startGame();

      const scoreValue = page.locator('[data-testid="score-value"]');

      // Score starts at 0
      await expect(scoreValue).toHaveText('0');

      // Submit incorrect answer (would be -1 if not floored)
      await answerValidationPage.submitIncorrectAnswer();
      await page.waitForTimeout(100);

      // Score should remain 0 (not go negative)
      await expect(scoreValue).toHaveText('0');

      // Submit another incorrect answer
      await answerValidationPage.submitIncorrectAnswer();
      await page.waitForTimeout(100);

      // Score should still be 0
      await expect(scoreValue).toHaveText('0');
    });

    test('should update score in real-time with multiple answers', async ({ page }) => {
      await gamePage.startGame();

      const scoreValue = page.locator('[data-testid="score-value"]');

      // Answer 1: Correct (+10)
      await answerValidationPage.submitCorrectAnswer();
      await page.waitForTimeout(100);
      await expect(scoreValue).toHaveText('10');

      // Answer 2: Correct (+10)
      await gamePage.navigateToNextQuestion();
      await answerValidationPage.submitCorrectAnswer();
      await page.waitForTimeout(100);
      await expect(scoreValue).toHaveText('20');

      // Answer 3: Incorrect (-1)
      await gamePage.navigateToNextQuestion();
      await answerValidationPage.submitIncorrectAnswer();
      await page.waitForTimeout(100);
      await expect(scoreValue).toHaveText('19');

      // Answer 4: Correct (+10)
      await gamePage.navigateToNextQuestion();
      await answerValidationPage.submitCorrectAnswer();
      await page.waitForTimeout(100);
      await expect(scoreValue).toHaveText('29');
    });
  });

  test.describe('User Story 2: Time Bonus for Question Completion', () => {
    test('should add time bonus when all 12 questions answered correctly', async ({ page }) => {
      // Install clock for time control
      await page.clock.install({ time: new Date('2024-01-01T00:00:00') });

      await gamePage.navigateToHome();
      await gamePage.startGame();

      const scoreValue = page.locator('[data-testid="score-value"]');

      // Fast-forward 300 seconds (5 minutes) using runFor to advance time precisely
      await page.clock.runFor(300000);

      // Answer all 12 questions correctly
      for (let i = 0; i < 12; i++) {
        await answerValidationPage.submitCorrectAnswer();

        if (i < 11) {
          await gamePage.navigateToNextQuestion();
        }
      }

      // Wait for phase transition with actual timeout (not fake clock)
      await page.waitForTimeout(300);

      // Base score: 12 * 10 = 120
      // Time bonus: 600 - 300 = ~300 seconds remaining (allow 1-2 second variance)
      // Total score: 120 + ~300 = ~420
      const finalScore = await scoreValue.textContent();
      const score = parseInt(finalScore || '0');
      expect(score).toBeGreaterThanOrEqual(418);
      expect(score).toBeLessThanOrEqual(420);
    });

    test('should add accurate time bonus based on remaining seconds', async ({ page }) => {
      // Install clock for time control
      await page.clock.install({ time: new Date('2024-01-01T00:00:00') });

      await gamePage.navigateToHome();
      await gamePage.startGame();

      const scoreValue = page.locator('[data-testid="score-value"]');

      // Fast-forward 540 seconds (9 minutes) - leaving 60 seconds
      await page.clock.runFor(540000);

      // Answer all 12 questions correctly
      for (let i = 0; i < 12; i++) {
        await answerValidationPage.submitCorrectAnswer();

        if (i < 11) {
          await gamePage.navigateToNextQuestion();
        }
      }

      await page.waitForTimeout(300);

      // Base score: 12 * 10 = 120
      // Time bonus: ~60 seconds remaining (allow 1-2 second variance)
      // Total score: 120 + ~60 = ~180
      const finalScore = await scoreValue.textContent();
      const score = parseInt(finalScore || '0');
      expect(score).toBeGreaterThanOrEqual(178);
      expect(score).toBeLessThanOrEqual(180);
    });

    test('should add minimal bonus when completing just before timer expires', async ({ page }) => {
      // Install clock for time control
      await page.clock.install({ time: new Date('2024-01-01T00:00:00') });

      await gamePage.navigateToHome();
      await gamePage.startGame();

      const scoreValue = page.locator('[data-testid="score-value"]');

      // Fast-forward to 598 seconds (2 seconds remaining)
      // This tests the edge case of completing with minimal time left
      await page.clock.runFor(598000);

      // Answer all 12 questions correctly before timer expires
      for (let i = 0; i < 12; i++) {
        await answerValidationPage.submitCorrectAnswer();

        if (i < 11) {
          await gamePage.navigateToNextQuestion();
        }
      }

      await page.waitForTimeout(300);

      // Base score: 12 * 10 = 120
      // Time bonus: ~2 seconds remaining (very minimal)
      // Total score: 120 + ~2 = ~122 (allow 1-2 second variance)
      const finalScore = await scoreValue.textContent();
      const score = parseInt(finalScore || '0');
      expect(score).toBeGreaterThanOrEqual(120);
      expect(score).toBeLessThanOrEqual(124);
    });
  });

  test.describe('User Story 3: Score Reset on Failed Final Word', () => {
    test('should reset score to 0 when final word guess is incorrect', async ({ page }) => {
      await gamePage.startGame();

      const scoreValue = page.locator('[data-testid="score-value"]');

      // Answer all 12 questions correctly to get to final word phase
      for (let i = 0; i < 12; i++) {
        await answerValidationPage.submitCorrectAnswer();
        await page.waitForTimeout(100);

        if (i < 11) {
          await gamePage.navigateToNextQuestion();
        }
      }

      await page.waitForTimeout(200);

      // Verify we have accumulated points
      const scoreBeforeFailure = await scoreValue.textContent();
      expect(parseInt(scoreBeforeFailure || '0')).toBeGreaterThan(0);

      // Submit incorrect final word
      await finalAnswerPage.typeIncorrectFinalWord();
      await finalAnswerPage.submitFinalAnswer();

      await page.waitForTimeout(200);

      // Score should be reset to 0
      await expect(scoreValue).toHaveText('0');
    });

    test('should reset score to 0 even with high accumulated points', async ({ page }) => {
      // Install clock for time control
      await page.clock.install({ time: new Date('2024-01-01T00:00:00') });

      await gamePage.navigateToHome();
      await gamePage.startGame();

      const scoreValue = page.locator('[data-testid="score-value"]');

      // Fast-forward only 60 seconds to leave lots of time bonus
      await page.clock.runFor(60000);

      // Answer all 12 questions correctly
      for (let i = 0; i < 12; i++) {
        await answerValidationPage.submitCorrectAnswer();

        if (i < 11) {
          await gamePage.navigateToNextQuestion();
        }
      }

      await page.waitForTimeout(300);

      // Should have high score: 120 (base) + 540 (bonus) = 660
      const highScore = await scoreValue.textContent();
      expect(parseInt(highScore || '0')).toBeGreaterThan(500);

      // Submit incorrect final word
      await finalAnswerPage.typeIncorrectFinalWord();
      await finalAnswerPage.submitFinalAnswer();

      await page.waitForTimeout(200);

      // Even with high score, should reset to 0
      await expect(scoreValue).toHaveText('0');
    });

    test('should reset score to 0 when final timer expires', async ({ page }) => {
      // Install clock for time control
      await page.clock.install({ time: new Date('2024-01-01T00:00:00') });

      await gamePage.navigateToHome();
      await gamePage.startGame();

      const scoreValue = page.locator('[data-testid="score-value"]');

      // Answer all 12 questions correctly
      for (let i = 0; i < 12; i++) {
        await answerValidationPage.submitCorrectAnswer();
        await page.waitForTimeout(100);

        if (i < 11) {
          await gamePage.navigateToNextQuestion();
        }
      }

      await page.waitForTimeout(200);

      // Verify we have accumulated points
      const scoreBeforeTimeout = await scoreValue.textContent();
      expect(parseInt(scoreBeforeTimeout || '0')).toBeGreaterThan(0);

      // Fast-forward final timer to expiry (120 seconds)
      await page.clock.runFor(120000);
      await page.waitForTimeout(300);

      // Score should be reset to 0 due to timeout
      await expect(scoreValue).toHaveText('0');
    });
  });

  test.describe('User Story 4: Time Bonus for Final Word', () => {
    test('should add final word time bonus when guessed correctly', async ({ page }) => {
      // Install clock for time control
      await page.clock.install({ time: new Date('2024-01-01T00:00:00') });

      await gamePage.navigateToHome();
      await gamePage.startGame();

      const scoreValue = page.locator('[data-testid="score-value"]');

      // Answer all 12 questions correctly
      for (let i = 0; i < 12; i++) {
        await answerValidationPage.submitCorrectAnswer();
        await page.waitForTimeout(100);

        if (i < 11) {
          await gamePage.navigateToNextQuestion();
        }
      }

      await page.waitForTimeout(200);

      // Get score before final word
      const scoreBeforeFinal = await scoreValue.textContent();
      const scoreBefore = parseInt(scoreBeforeFinal || '0');

      // Fast-forward 60 seconds in final phase (leaving 60 seconds)
      await page.clock.runFor(60000);

      // Submit correct final word
      await finalAnswerPage.typeCorrectFinalWord();
      await finalAnswerPage.submitFinalAnswer();

      await page.waitForTimeout(200);

      // Score should include ~60-second bonus (allow 1-2 second variance)
      const finalScoreText = await scoreValue.textContent();
      const finalScore = parseInt(finalScoreText || '0');
      expect(finalScore).toBeGreaterThanOrEqual(scoreBefore + 59);
      expect(finalScore).toBeLessThanOrEqual(scoreBefore + 61);
    });

    test('should add accurate final word bonus based on remaining time', async ({ page }) => {
      // Install clock for time control
      await page.clock.install({ time: new Date('2024-01-01T00:00:00') });

      await gamePage.navigateToHome();
      await gamePage.startGame();

      const scoreValue = page.locator('[data-testid="score-value"]');

      // Answer all 12 questions correctly fast
      for (let i = 0; i < 12; i++) {
        await answerValidationPage.submitCorrectAnswer();
        await page.waitForTimeout(100);

        if (i < 11) {
          await gamePage.navigateToNextQuestion();
        }
      }

      await page.waitForTimeout(200);

      const scoreBeforeFinal = await scoreValue.textContent();
      const scoreBefore = parseInt(scoreBeforeFinal || '0');

      // Fast-forward only 10 seconds in final phase (leaving 110 seconds)
      await page.clock.runFor(10000);

      // Submit correct final word
      await finalAnswerPage.typeCorrectFinalWord();
      await finalAnswerPage.submitFinalAnswer();

      await page.waitForTimeout(200);

      // Score should include ~110-second bonus (allow 1-2 second variance)
      const finalScoreText = await scoreValue.textContent();
      const finalScore = parseInt(finalScoreText || '0');
      expect(finalScore).toBeGreaterThanOrEqual(scoreBefore + 109);
      expect(finalScore).toBeLessThanOrEqual(scoreBefore + 111);
    });
  });

  test.describe('User Story 5: Final Score Display in Success Message', () => {
    test('should display final score in success message after winning', async ({ page }) => {
      await gamePage.startGame();

      // Answer all 12 questions correctly
      for (let i = 0; i < 12; i++) {
        await answerValidationPage.submitCorrectAnswer();
        await page.waitForTimeout(100);

        if (i < 11) {
          await gamePage.navigateToNextQuestion();
        }
      }

      await page.waitForTimeout(200);

      // Get score before final word
      const scoreValue = page.locator('[data-testid="score-value"]');
      const scoreBeforeFinal = await scoreValue.textContent();

      // Submit correct final word
      await finalAnswerPage.typeCorrectFinalWord();
      await finalAnswerPage.submitFinalAnswer();

      await page.waitForTimeout(200);

      // Verify final score display exists and is visible
      const finalScoreDisplay = page.locator('[data-testid="final-score-display"]');
      await expect(finalScoreDisplay).toBeVisible();

      // Verify final score is displayed in success message
      const finalScore = await scoreValue.textContent();
      await expect(finalScoreDisplay).toContainText(`Your final score: ${finalScore}`);
    });

    test('should display final score with all bonuses included', async ({ page }) => {
      // Install clock for time control
      await page.clock.install({ time: new Date('2024-01-01T00:00:00') });

      await gamePage.navigateToHome();
      await gamePage.startGame();

      const scoreValue = page.locator('[data-testid="score-value"]');

      // Fast-forward 240 seconds (4 minutes), leaving 360 seconds
      await page.clock.runFor(240000);

      // Answer all 12 questions correctly
      for (let i = 0; i < 12; i++) {
        await answerValidationPage.submitCorrectAnswer();

        if (i < 11) {
          await gamePage.navigateToNextQuestion();
        }
      }

      await page.waitForTimeout(300);

      // Fast-forward 60 seconds in final phase, leaving 60 seconds
      await page.clock.runFor(60000);

      // Submit correct final word
      await finalAnswerPage.typeCorrectFinalWord();
      await finalAnswerPage.submitFinalAnswer();

      await page.waitForTimeout(200);

      // Expected final score:
      // Base: 12 * 10 = 120
      // Main bonus: ~360 seconds
      // Final bonus: ~60 seconds
      // Total: 120 + ~360 + ~60 = ~540 (allow 3-5 second variance for both timers)
      const finalScoreDisplay = page.locator('[data-testid="final-score-display"]');
      await expect(finalScoreDisplay).toBeVisible();
      const displayText = await finalScoreDisplay.textContent();
      const scoreMatch = displayText?.match(/\d+/);
      const displayedScore = scoreMatch ? parseInt(scoreMatch[0]) : 0;
      expect(displayedScore).toBeGreaterThanOrEqual(537);
      expect(displayedScore).toBeLessThanOrEqual(540);
    });

    test('should not display final score message on loss', async ({ page }) => {
      await gamePage.startGame();

      // Answer all 12 questions correctly
      for (let i = 0; i < 12; i++) {
        await answerValidationPage.submitCorrectAnswer();
        await page.waitForTimeout(100);

        if (i < 11) {
          await gamePage.navigateToNextQuestion();
        }
      }

      await page.waitForTimeout(200);

      // Submit incorrect final word
      await finalAnswerPage.typeIncorrectFinalWord();
      await finalAnswerPage.submitFinalAnswer();

      await page.waitForTimeout(200);

      // Final score display should not be visible for loss
      const finalScoreDisplay = page.locator('[data-testid="final-score-display"]');
      await expect(finalScoreDisplay).not.toBeVisible();
    });
  });

  test.describe('Edge Cases and Integration', () => {
    test('should persist score throughout entire game session', async ({ page }) => {
      await gamePage.startGame();

      const scoreValue = page.locator('[data-testid="score-value"]');

      // Answer first question
      await answerValidationPage.submitCorrectAnswer();
      await page.waitForTimeout(100);
      await expect(scoreValue).toHaveText('10');

      // Navigate through multiple questions
      for (let i = 0; i < 5; i++) {
        await gamePage.navigateToNextQuestion();
        await page.waitForTimeout(100);
        // Score should persist
        await expect(scoreValue).toHaveText('10');
      }

      // Answer another question
      await answerValidationPage.submitCorrectAnswer();
      await page.waitForTimeout(100);
      await expect(scoreValue).toHaveText('20');

      // Navigate back and forth
      await gamePage.navigateToPreviousQuestion();
      await page.waitForTimeout(100);
      await expect(scoreValue).toHaveText('20');

      await gamePage.navigateToNextQuestion();
      await page.waitForTimeout(100);
      await expect(scoreValue).toHaveText('20');
    });

    test('should handle rapid answer changes correctly', async ({ page }) => {
      await gamePage.startGame();

      const scoreValue = page.locator('[data-testid="score-value"]');

      // Submit correct answer
      await answerValidationPage.submitCorrectAnswer();
      await page.waitForTimeout(50);

      // Quickly submit incorrect answer
      await answerValidationPage.submitIncorrectAnswer();
      await page.waitForTimeout(50);

      // Quickly submit correct answer again
      await answerValidationPage.submitCorrectAnswer();
      await page.waitForTimeout(100);

      // Score should reflect all submissions: 0 + 10 - 1 + 10 = 19
      await expect(scoreValue).toHaveText('19');
    });

    test('should maintain score across question grid interactions', async ({ page }) => {
      await gamePage.startGame();

      const scoreValue = page.locator('[data-testid="score-value"]');

      // Answer first question
      await answerValidationPage.submitCorrectAnswer();
      await page.waitForTimeout(100);
      await expect(scoreValue).toHaveText('10');

      // Click on question 5 directly via grid
      const questionBox5 = page.locator('[data-testid="question-square-5"]');
      await questionBox5.click();
      await page.waitForTimeout(100);

      // Score should persist
      await expect(scoreValue).toHaveText('10');

      // Answer question 5
      await answerValidationPage.submitCorrectAnswer();
      await page.waitForTimeout(100);
      await expect(scoreValue).toHaveText('20');
    });
  });
});
