import { test, expect } from '@playwright/test';
import { GamePage } from './page-objects/gamePage';
import { NavigationPage } from './page-objects/navigationPage';

/**
 * E2E tests for User Story 3: Answer Input Interface
 * 
 * Tests the non-functional answer input and verify button UI scaffolding
 */
test.describe('Answer Input UI', () => {
  let gamePage: GamePage;
  let navPage: NavigationPage;

  test.beforeEach(async ({ page }) => {
    gamePage = new GamePage(page);
    navPage = new NavigationPage(page);
    
    // Navigate to the game and start it
    await page.goto('/');
    await gamePage.startGame();
    
    // Wait for game to be active
    await expect(gamePage.stopButton).toBeVisible();
  });

  test('T038: Answer input field visible on all questions', async ({ page }) => {
    // Verify input is visible on Q1
    await expect(navPage.answerInput).toBeVisible();
    
    // Navigate to Q5
    for (let i = 0; i < 4; i++) {
      await navPage.clickNext();
      await page.waitForTimeout(100);
    }
    
    // Input should still be visible
    await expect(navPage.answerInput).toBeVisible();
    
    // Navigate to Q12
    for (let i = 0; i < 7; i++) {
      await navPage.clickNext();
      await page.waitForTimeout(100);
    }
    
    // Input should still be visible
    await expect(navPage.answerInput).toBeVisible();
  });

  test('T039: Verify button visible next to input', async ({ page }) => {
    // Check both input and button are visible
    await expect(navPage.answerInput).toBeVisible();
    await expect(navPage.verifyButton).toBeVisible();
    
    // Navigate to different question
    await navPage.clickNext();
    await page.waitForTimeout(200);
    
    // Both should still be visible
    await expect(navPage.answerInput).toBeVisible();
    await expect(navPage.verifyButton).toBeVisible();
  });

  test('T040: Typing in input works (non-functional verify)', async ({ page }) => {
    // Type in the input field
    await navPage.answerInput.fill('test answer');
    
    // Verify the text was entered
    const inputValue = await navPage.answerInput.inputValue();
    expect(inputValue).toBe('test answer');
    
    // Click verify button (should not cause errors even though non-functional)
    await navPage.verifyButton.click();
    
    // Input should still contain the text
    const valueAfterClick = await navPage.answerInput.inputValue();
    expect(valueAfterClick).toBe('test answer');
  });

  test('T041: Input clears when navigating between questions', async ({ page }) => {
    // Type in the input field on Q1
    await navPage.answerInput.fill('answer for question 1');
    
    let inputValue = await navPage.answerInput.inputValue();
    expect(inputValue).toBe('answer for question 1');
    
    // Navigate to Q2 using next
    await navPage.clickNext();
    await page.waitForTimeout(200);
    
    // Input should be cleared
    inputValue = await navPage.answerInput.inputValue();
    expect(inputValue).toBe('');
    
    // Type in input for Q2
    await navPage.answerInput.fill('answer for question 2');
    inputValue = await navPage.answerInput.inputValue();
    expect(inputValue).toBe('answer for question 2');
    
    // Navigate using grid to Q5
    await navPage.clickQuestionSquare(5);
    await page.waitForTimeout(200);
    
    // Input should be cleared again
    inputValue = await navPage.answerInput.inputValue();
    expect(inputValue).toBe('');
    
    // Type in input for Q5
    await navPage.answerInput.fill('answer for question 5');
    
    // Navigate back using previous
    await navPage.clickPrevious();
    await page.waitForTimeout(200);
    
    // Input should be cleared
    inputValue = await navPage.answerInput.inputValue();
    expect(inputValue).toBe('');
  });

  test('Input and button have proper styling and accessibility', async ({ page }) => {
    // Check input has placeholder
    const placeholder = await navPage.answerInput.getAttribute('placeholder');
    expect(placeholder).toBeTruthy();
    
    // Check button has text
    const buttonText = await navPage.verifyButton.textContent();
    expect(buttonText).toContain('Verify');
    
    // Check both are enabled
    await expect(navPage.answerInput).toBeEnabled();
    await expect(navPage.verifyButton).toBeEnabled();
  });
});