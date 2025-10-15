import { test, expect } from '@playwright/test';
import { GamePage } from './page-objects/gamePage';
import { NavigationPage } from './page-objects/navigationPage';

/**
 * E2E tests for User Story 1: Sequential Question Navigation
 * 
 * Tests chevron-based navigation (next/previous) with boundary constraints
 */
test.describe('Sequential Navigation', () => {
  let gamePage: GamePage;
  let navPage: NavigationPage;

  test.beforeEach(async ({ page }) => {
    gamePage = new GamePage(page);
    navPage = new NavigationPage(page);
    
    // Navigate to the game and start it
    await gamePage.navigateAndStartGame();
    
    // Wait for game to be active
    await expect(gamePage.stopButton).toBeVisible();
  });

  test('T012: First question displays with "Question 1 of 12"', async ({ page }) => {
    // Verify the question display shows Q1 of 12
    const questionText = await navPage.getQuestionText();
    
    expect(questionText).toContain('Question 1');
    expect(questionText).toContain('of 12');
  });

  test('T013: Previous chevron disabled on question 1', async ({ page }) => {
    // On Q1, previous should be disabled
    await expect(navPage.previousChevron).toBeDisabled();
    
    // Next should be enabled
    await expect(navPage.nextChevron).toBeEnabled();
  });

  test('T014: Next chevron advances to question 2 and enables previous', async ({ page }) => {
    // Verify we start on Q1 with previous disabled
    await expect(navPage.previousChevron).toBeDisabled();
    const q1Text = await navPage.getQuestionText();
    expect(q1Text).toContain('Question 1');
    
    // Click next
    await navPage.clickNext();
    
    // Wait for navigation to complete
    await page.waitForTimeout(200); // Allow for transition
    
    // Verify we're now on Q2
    const q2Text = await navPage.getQuestionText();
    expect(q2Text).toContain('Question 2');
    
    // Previous should now be enabled
    await expect(navPage.previousChevron).toBeEnabled();
    
    // Next should still be enabled (not on last question)
    await expect(navPage.nextChevron).toBeEnabled();
  });

  test('T015: Previous chevron navigates back', async ({ page }) => {
    // Navigate to Q2
    await navPage.clickNext();
    await page.waitForTimeout(200);
    
    const q2Text = await navPage.getQuestionText();
    expect(q2Text).toContain('Question 2');
    
    // Click previous
    await navPage.clickPrevious();
    await page.waitForTimeout(200);
    
    // Verify we're back on Q1
    const q1Text = await navPage.getQuestionText();
    expect(q1Text).toContain('Question 1');
    
    // Previous should be disabled again
    await expect(navPage.previousChevron).toBeDisabled();
  });

  test('T016: Next chevron disabled on question 12', async ({ page }) => {
    // Navigate to the last question (Q12)
    for (let i = 0; i < 11; i++) {
      await navPage.clickNext();
      await page.waitForTimeout(100);
    }
    
    // Verify we're on Q12
    const q12Text = await navPage.getQuestionText();
    expect(q12Text).toContain('Question 12');
    
    // Next should be disabled
    await expect(navPage.nextChevron).toBeDisabled();
    
    // Previous should be enabled
    await expect(navPage.previousChevron).toBeEnabled();
  });

  test('Full navigation cycle: Q1 → Q12 → Q1', async ({ page }) => {
    // Start on Q1
    let questionText = await navPage.getQuestionText();
    expect(questionText).toContain('Question 1');
    
    // Navigate forward to Q12
    for (let i = 1; i <= 11; i++) {
      await navPage.clickNext();
      await page.waitForTimeout(100);
      
      questionText = await navPage.getQuestionText();
      expect(questionText).toContain(`Question ${i + 1}`);
    }
    
    // Verify on Q12 with next disabled
    await expect(navPage.nextChevron).toBeDisabled();
    
    // Navigate back to Q1
    for (let i = 11; i >= 1; i--) {
      await navPage.clickPrevious();
      await page.waitForTimeout(100);
      
      questionText = await navPage.getQuestionText();
      expect(questionText).toContain(`Question ${i}`);
    }
    
    // Verify back on Q1 with previous disabled
    await expect(navPage.previousChevron).toBeDisabled();
  });
});