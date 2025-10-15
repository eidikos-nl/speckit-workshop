/**
 * E2E Regression Test: Keyboard Focus Isolation
 * 
 * This test ensures that the final answer input only captures keyboard input
 * when it is focused, and does not interfere with typing in other input fields.
 * 
 * Issue: The final answer component was previously listening to ALL keyboard events
 * globally (window.addEventListener), which meant typing in the question answer
 * input would also add letters to the final answer boxes.
 * 
 * Fix: Changed to only capture keyboard input when the final answer component
 * has focus, using focus/blur event handlers.
 */

import { test, expect } from '@playwright/test';
import { GamePage } from './page-objects/gamePage';
import { NavigationPage } from './page-objects/navigationPage';

test.describe('Keyboard Focus Isolation - Regression Tests', () => {
  let gamePage: GamePage;
  let navPage: NavigationPage;

  test.beforeEach(async ({ page }) => {
    gamePage = new GamePage(page);
    navPage = new NavigationPage(page);
    
    await gamePage.navigateAndStartGame();
    await expect(gamePage.stopButton).toBeVisible();
  });

  test('Question answer input should not trigger final answer input', async ({ page }) => {
    // Focus on the question answer input field
    await navPage.answerInput.click();
    await expect(navPage.answerInput).toBeFocused();

    // Type text in the question answer input
    await page.keyboard.type('TESTANSWER');

    // Verify the text appears in the question answer input
    const questionInputValue = await navPage.answerInput.inputValue();
    expect(questionInputValue).toBe('TESTANSWER');

    // Verify that NO letters were added to the final answer boxes
    const box1 = page.locator('[data-testid="final-answer-box-1"]');
    const box1Text = await box1.textContent();
    expect(box1Text?.trim()).toBe('');

    const box2 = page.locator('[data-testid="final-answer-box-2"]');
    const box2Text = await box2.textContent();
    expect(box2Text?.trim()).toBe('');
  });

  test('Final answer should only capture input when focused', async ({ page }) => {
    // First, verify that typing without focus does NOT add to final answer
    await page.keyboard.type('ABC');
    
    const box1Before = page.locator('[data-testid="final-answer-box-1"]');
    const box1TextBefore = await box1Before.textContent();
    expect(box1TextBefore?.trim()).toBe('');

    // Now click on the final answer container to focus it
    const finalAnswerContainer = page.locator('[data-testid="final-answer-box-1"]').locator('..');
    await finalAnswerContainer.click();

    // Type letters - these SHOULD be captured now
    await page.keyboard.type('XYZ');

    // Verify the letters appear in the final answer boxes
    const box1 = page.locator('[data-testid="final-answer-box-1"]');
    const box2 = page.locator('[data-testid="final-answer-box-2"]');
    const box3 = page.locator('[data-testid="final-answer-box-3"]');

    await expect(box1).toContainText('X');
    await expect(box2).toContainText('Y');
    await expect(box3).toContainText('Z');
  });

  test('Switching focus from final answer to question input should stop capturing', async ({ page }) => {
    // Click on final answer to focus it
    const box1 = page.locator('[data-testid="final-answer-box-1"]');
    await box1.click();

    // Type in final answer
    await page.keyboard.type('ABC');
    await expect(box1).toContainText('A');

    // Now click on the question answer input to switch focus
    await navPage.answerInput.click();
    await expect(navPage.answerInput).toBeFocused();

    // Type more characters - these should go to question input, NOT final answer
    await page.keyboard.type('DEF');

    // Verify question input has the new text
    const questionInputValue = await navPage.answerInput.inputValue();
    expect(questionInputValue).toBe('DEF');

    // Verify final answer only has the original ABC (box 4 should be empty)
    const box4 = page.locator('[data-testid="final-answer-box-4"]');
    const box4Text = await box4.textContent();
    expect(box4Text?.trim()).toBe('');
  });

  test('Clicking outside final answer should lose focus and stop capturing', async ({ page }) => {
    // Click on final answer to focus it
    const box1 = page.locator('[data-testid="final-answer-box-1"]');
    await box1.click();

    // Type in final answer
    await page.keyboard.type('ABC');
    await expect(box1).toContainText('A');

    // Click outside the final answer (e.g., on the theme display)
    const themeDisplay = page.locator('[data-testid="theme-display"]');
    await themeDisplay.click();

    // Type more characters - these should NOT be captured
    await page.keyboard.type('XYZ');

    // Verify final answer still only has ABC (box 4 should be empty)
    const box4 = page.locator('[data-testid="final-answer-box-4"]');
    const box4Text = await box4.textContent();
    expect(box4Text?.trim()).toBe('');
  });

  test('Backspace in question input should not affect final answer', async ({ page }) => {
    // Add some letters to final answer first
    const box1 = page.locator('[data-testid="final-answer-box-1"]');
    await box1.click();
    await page.keyboard.type('ABCD');

    // Verify final answer has 4 letters
    const box4 = page.locator('[data-testid="final-answer-box-4"]');
    await expect(box4).toContainText('D');

    // Click on question answer input
    await navPage.answerInput.click();
    await page.keyboard.type('TEST');

    // Press backspace multiple times in question input
    await page.keyboard.press('Backspace');
    await page.keyboard.press('Backspace');

    // Verify question input is correct
    const questionInputValue = await navPage.answerInput.inputValue();
    expect(questionInputValue).toBe('TE');

    // Verify final answer still has all 4 letters (backspace didn't affect it)
    await expect(box4).toContainText('D');
    const box3 = page.locator('[data-testid="final-answer-box-3"]');
    await expect(box3).toContainText('C');
  });

  test('Enter key in question input should not submit final answer', async ({ page }) => {
    // Fill final answer with 12 characters
    const box1 = page.locator('[data-testid="final-answer-box-1"]');
    await box1.click();
    await page.keyboard.type('ABCDEFGHIJKL');

    // Click on question answer input
    await navPage.answerInput.click();
    await page.keyboard.type('test answer');

    // Press Enter in question input
    await page.keyboard.press('Enter');

    // Wait a moment
    await page.waitForTimeout(200);

    // Verify the final answer result message does NOT appear
    const resultMessage = page.locator('[data-testid="final-answer-result-message"]');
    await expect(resultMessage).not.toBeVisible();

    // Verify submit button is still visible (game hasn't ended)
    const submitButton = page.locator('[data-testid="final-answer-submit"]');
    await expect(submitButton).toBeVisible();
  });
});
