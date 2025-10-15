/**
 * End-to-End tests for Final Word Submission feature
 *
 * Tests all three user stories:
 * - User Story 1: Submit final answer with win/loss feedback
 * - User Story 2: Letter-by-letter input with backspace support
 * - User Story 3: Visual separation and styling consistency
 */

import { test, expect, Page } from '@playwright/test';
import { FinalAnswerPage } from './page-objects/finalAnswerPage';

// Helper to navigate to game start and wait for final answer boxes
async function startGameAndWaitForFinalAnswer(finalAnswerPage: FinalAnswerPage) {
  await finalAnswerPage.navigateAndStartGame();
  // Wait for final answer boxes to be visible and ready for input
  await finalAnswerPage.waitForBoxesReady();
}

// Test state variables
let finalAnswerPage: FinalAnswerPage;

test.beforeEach(async ({ page }) => {
  finalAnswerPage = new FinalAnswerPage(page);
  await startGameAndWaitForFinalAnswer(finalAnswerPage);
});

test.describe('User Story 1: Submit Final Answer', () => {
  test('US1-01: Should display 12 final answer input boxes', async ({ page }) => {
    // Verify all 12 boxes are present
    for (let i = 1; i <= 12; i++) {
      const box = page.locator(`[data-testid="final-answer-box-${i}"]`);
      await expect(box).toBeVisible();
    }
  });

  test('US1-02: Should have submit button in disabled state when empty', async ({ page }) => {
    const submitButton = page.locator('[data-testid="final-answer-submit"]');
    await expect(submitButton).toBeDisabled();
  });

  test('US1-03: Should enable submit button when 12 characters entered', async ({ page }) => {
    const submitButton = page.locator('[data-testid="final-answer-submit"]');

    // Focus and start typing 12 characters
    await page.locator('[data-testid="final-answer-box-1"]').click();
    await page.keyboard.type('ABCDEFGHIJKL');

    // Button should now be enabled
    await expect(submitButton).toBeEnabled();
  });

  test('US1-04: Should submit correct answer and show green win state', async ({ page }) => {
    // Get the first final answer box to determine if we need to fill all boxes
    const box1 = finalAnswerPage.getBox(1);
    await expect(box1).toBeVisible();

    // Submit the actual correct answer for the current question set
    await finalAnswerPage.submitCorrectMainAnswer();

    // Wait for result message
    await expect(finalAnswerPage.getResultMessage()).toBeVisible();

    // Check for WIN message only
    const text = await finalAnswerPage.getResultText();
    expect(text.toLowerCase()).toContain('congratulations');

    // Boxes should show win state (green) ONLY
    expect(await finalAnswerPage.hasWinStyling(1)).toBe(true);
    expect(await finalAnswerPage.hasLossStyling(1)).toBe(false);
  });

  test('US1-05: Should submit incorrect answer and show red loss state', async ({ page }) => {
    // Focus and type an intentionally wrong 12-letter word
    await page.locator('[data-testid="final-answer-box-1"]').click();
    await page.keyboard.type('WRONGWORDHERE');

    // Click submit button
    const submitButton = page.locator('[data-testid="final-answer-submit"]');
    await submitButton.click();

    // Wait for result message
    const resultMessage = page.locator('[data-testid="final-answer-result-message"]');
    await expect(resultMessage).toBeVisible();

    // Check for loss message
    const text = await resultMessage.textContent();
    expect(text?.toLowerCase()).toContain('incorrect');

    // All boxes should show loss state (red)
    const firstBox = page.locator('[data-testid="final-answer-box-1"]');
    const boxClass = await firstBox.getAttribute('class');
    expect(boxClass).toContain('bg-red');
  });

  test('US1-06: Should prevent input after game ends', async ({ page }) => {
    // Focus and type answer and submit
    await page.locator('[data-testid="final-answer-box-1"]').click();
    await page.keyboard.type('TESTWORDABCDE');
    const submitButton = page.locator('[data-testid="final-answer-submit"]');
    await submitButton.click();

    // Wait for game to end
    const resultMessage = page.locator('[data-testid="final-answer-result-message"]');
    await expect(resultMessage).toBeVisible();

    // Try typing more characters (should not be added)
    const firstBoxBefore = page.locator('[data-testid="final-answer-box-1"]');
    const textBefore = await firstBoxBefore.textContent();

    await page.keyboard.type('XYZ');

    const firstBoxAfter = page.locator('[data-testid="final-answer-box-1"]');
    const textAfter = await firstBoxAfter.textContent();

    // Text in boxes should not change
    expect(textBefore).toBe(textAfter);
  });

  test('US1-07: Submit button should be hidden when game ends', async ({ page }) => {
    const submitButton = page.locator('[data-testid="final-answer-submit"]');
    await expect(submitButton).toBeVisible();

    // Focus and type answer and submit
    await page.locator('[data-testid="final-answer-box-1"]').click();
    await page.keyboard.type('TESTWORDABCDE');
    await submitButton.click();

    // Wait for game end
    const resultMessage = page.locator('[data-testid="final-answer-result-message"]');
    await expect(resultMessage).toBeVisible();

    // Submit button should be hidden
    await expect(submitButton).not.toBeVisible();
  });
});

test.describe('User Story 2: Letter-by-Letter Input', () => {
  test('US2-01: Should add letters sequentially as typed', async ({ page }) => {
    // Focus and type first 3 letters
    await page.locator('[data-testid="final-answer-box-1"]').click();
    await page.keyboard.type('ABC');

    // Verify boxes show letters
    const box1 = page.locator('[data-testid="final-answer-box-1"]');
    const box2 = page.locator('[data-testid="final-answer-box-2"]');
    const box3 = page.locator('[data-testid="final-answer-box-3"]');

    await expect(box1).toContainText('A');
    await expect(box2).toContainText('B');
    await expect(box3).toContainText('C');
  });

  test('US2-02: Should convert lowercase to uppercase', async ({ page }) => {
    // Focus and type lowercase letters
    await page.locator('[data-testid="final-answer-box-1"]').click();
    await page.keyboard.type('abc');

    // Verify boxes show uppercase
    const box1 = page.locator('[data-testid="final-answer-box-1"]');
    const box2 = page.locator('[data-testid="final-answer-box-2"]');
    const box3 = page.locator('[data-testid="final-answer-box-3"]');

    await expect(box1).toContainText('A');
    await expect(box2).toContainText('B');
    await expect(box3).toContainText('C');
  });

  test('US2-03: Should prevent input beyond 12 characters', async ({ page }) => {
    // Focus and type 15 characters (should stop at 12)
    await page.locator('[data-testid="final-answer-box-1"]').click();
    await page.keyboard.type('ABCDEFGHIJKLMNOPQRST');

    // Count filled boxes
    const boxes = await page.locator('[data-testid^="final-answer-box-"]').all();

    let filledCount = 0;
    for (const box of boxes) {
      const text = await box.textContent();
      if (text && text.trim().length > 0) {
        filledCount++;
      }
    }

    expect(filledCount).toBe(12);
  });

  test('US2-04: Should remove last character on backspace', async ({ page }) => {
    // Focus and type 5 characters
    await page.locator('[data-testid="final-answer-box-1"]').click();
    await page.keyboard.type('ABCDE');

    // Verify 5 boxes are filled
    const box5 = page.locator('[data-testid="final-answer-box-5"]');
    await expect(box5).toContainText('E');

    // Press backspace
    await page.keyboard.press('Backspace');

    // Box 5 should be empty, box 4 should still have D
    await expect(box5).toContainText('');
    const box4 = page.locator('[data-testid="final-answer-box-4"]');
    await expect(box4).toContainText('D');
  });

  test('US2-05: Should handle multiple backspaces', async ({ page }) => {
    // Focus and type 5 characters
    await page.locator('[data-testid="final-answer-box-1"]').click();
    await page.keyboard.type('ABCDE');

    // Press backspace 3 times
    await page.keyboard.press('Backspace');
    await page.keyboard.press('Backspace');
    await page.keyboard.press('Backspace');

    // Only AB should remain
    const box1 = page.locator('[data-testid="final-answer-box-1"]');
    const box2 = page.locator('[data-testid="final-answer-box-2"]');
    const box3 = page.locator('[data-testid="final-answer-box-3"]');

    await expect(box1).toContainText('A');
    await expect(box2).toContainText('B');
    await expect(box3).toContainText('');
  });

  test('US2-06: Should handle Enter key to submit when 12 characters present', async ({ page }) => {
    // Focus and type exactly 12 characters
    await page.locator('[data-testid="final-answer-box-1"]').click();
    await page.keyboard.type('ABCDEFGHIJKL');

    // Press Enter
    await page.keyboard.press('Enter');

    // Game should end (result message should appear)
    const resultMessage = page.locator('[data-testid="final-answer-result-message"]');
    await expect(resultMessage).toBeVisible();
  });

  test('US2-07: Should ignore non-letter characters', async ({ page }) => {
    // Focus and type letters with special characters mixed in
    await page.locator('[data-testid="final-answer-box-1"]').click();
    await page.keyboard.type('A1B2C!D@E');

    // Only letters should be entered
    const box1 = page.locator('[data-testid="final-answer-box-1"]');
    const box2 = page.locator('[data-testid="final-answer-box-2"]');
    const box3 = page.locator('[data-testid="final-answer-box-3"]');
    const box4 = page.locator('[data-testid="final-answer-box-4"]');
    const box5 = page.locator('[data-testid="final-answer-box-5"]');

    await expect(box1).toContainText('A');
    await expect(box2).toContainText('B');
    await expect(box3).toContainText('C');
    await expect(box4).toContainText('D');
    await expect(box5).toContainText('E');
  });

  test('US2-08: Should show focus indicator on active box', async ({ page }) => {
    // Focus and type one character (focus should move to second box)
    await page.locator('[data-testid="final-answer-box-1"]').click();
    await page.keyboard.type('A');

    // The first box should now have focus styling (ring)
    const box1 = page.locator('[data-testid="final-answer-box-1"]');
    const box1Class = await box1.getAttribute('class');
    expect(box1Class).toContain('ring');
  });
});

test.describe('User Story 3: Visual Separation and Styling', () => {
  test('US3-01: Should have visual separator between question grid and final answer', async ({ page }) => {
    // The separator should be visible in the DOM
    // Note: This is a visual test that may need additional setup
    const pageContent = await page.content();
    expect(pageContent).toContain('border-t');
  });

  test('US3-02: Final answer boxes should match question grid styling', async ({ page }) => {
    // Get styling from final answer box
    const finalAnswerBox = page.locator('[data-testid="final-answer-box-1"]');
    const boxClass = await finalAnswerBox.getAttribute('class');

    // Should have consistent styling attributes
    expect(boxClass).toContain('aspect-square');
    expect(boxClass).toContain('rounded-lg');
    expect(boxClass).toContain('border-2');
    expect(boxClass).toContain('transition');
  });

  test('US3-03: Should have proper spacing between final answer boxes', async ({ page }) => {
    // Use the FinalAnswerPage method to get grid classes
    const gridClass = await finalAnswerPage.getGridClasses();

    // Should have proper spacing classes (either gap- or space-)
    expect(gridClass).toMatch(/(gap-\d+|space-[xy]-\d+)/);
  });

  test('US3-04: Final answer boxes should show consistent colors on win', async ({ page }) => {
    // Submit the correct answer to ensure a win
    await finalAnswerPage.submitCorrectMainAnswer();

    // Wait for result
    await expect(finalAnswerPage.getResultMessage()).toBeVisible();

    // All boxes should have consistent GREEN styling for a win
    const hasGreen1 = await finalAnswerPage.hasWinStyling(1);
    const hasGreen12 = await finalAnswerPage.hasWinStyling(12);

    expect(hasGreen1).toBe(true);
    expect(hasGreen12).toBe(true);

    // Should not have red styling
    expect(await finalAnswerPage.hasLossStyling(1)).toBe(false);
    expect(await finalAnswerPage.hasLossStyling(12)).toBe(false);
  });
});

test.describe('Accessibility', () => {
  test('ACC-01: Final answer boxes should have ARIA labels', async ({ page }) => {
    // Check that boxes have aria-labels
    const box1 = page.locator('[data-testid="final-answer-box-1"]');
    const ariaLabel = await box1.getAttribute('aria-label');

    expect(ariaLabel).toBeTruthy();
    expect(ariaLabel).toContain('Final answer box');
  });

  test('ACC-02: Submit button should have accessible label', async ({ page }) => {
    const submitButton = page.locator('[data-testid="final-answer-submit"]');
    const ariaLabel = await submitButton.getAttribute('aria-label');

    expect(ariaLabel).toBeTruthy();
    expect(ariaLabel?.toLowerCase()).toContain('submit');
  });

  test('ACC-03: Result message should be visible to screen readers', async ({ page }) => {
    // Focus and type and submit
    await page.locator('[data-testid="final-answer-box-1"]').click();
    await page.keyboard.type('TESTWORDABCDE');
    const submitButton = page.locator('[data-testid="final-answer-submit"]');
    await submitButton.click();

    // Result message should have proper text content
    const resultMessage = page.locator('[data-testid="final-answer-result-message"]');
    const text = await resultMessage.textContent();

    expect(text).toBeTruthy();
    expect(text?.length).toBeGreaterThan(0);
  });
});
