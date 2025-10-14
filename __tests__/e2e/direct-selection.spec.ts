import { test, expect } from '@playwright/test';
import { GamePage } from './page-objects/gamePage';
import { NavigationPage } from './page-objects/navigationPage';

/**
 * E2E tests for User Story 2: Direct Question Selection via Grid
 * 
 * Tests clickable grid for jumping directly to any question
 */
test.describe('Direct Selection', () => {
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

  test('T026: Clicking grid square navigates to corresponding question', async ({ page }) => {
    // Verify we start on Q1
    let questionText = await navPage.getQuestionText();
    expect(questionText).toContain('Question 1');
    
    // Click square 5 to jump to Q5
    await navPage.clickQuestionSquare(5);
    await page.waitForTimeout(200); // Allow for transition
    
    // Verify we're now on Q5
    questionText = await navPage.getQuestionText();
    expect(questionText).toContain('Question 5');
    
    // Click square 10 to jump to Q10
    await navPage.clickQuestionSquare(10);
    await page.waitForTimeout(200);
    
    // Verify we're now on Q10
    questionText = await navPage.getQuestionText();
    expect(questionText).toContain('Question 10');
  });

  test('T027: Clicking different squares jumps between questions', async ({ page }) => {
    // Jump to Q12
    await navPage.clickQuestionSquare(12);
    await page.waitForTimeout(200);
    
    let questionText = await navPage.getQuestionText();
    expect(questionText).toContain('Question 12');
    
    // Jump back to Q3
    await navPage.clickQuestionSquare(3);
    await page.waitForTimeout(200);
    
    questionText = await navPage.getQuestionText();
    expect(questionText).toContain('Question 3');
    
    // Jump to Q7
    await navPage.clickQuestionSquare(7);
    await page.waitForTimeout(200);
    
    questionText = await navPage.getQuestionText();
    expect(questionText).toContain('Question 7');
  });

  test('T028: Rapid clicking handles gracefully', async ({ page }) => {
    // Rapidly click multiple squares
    await navPage.clickQuestionSquare(5);
    await navPage.clickQuestionSquare(8);
    await navPage.clickQuestionSquare(3);
    
    // Wait for navigation to settle
    await page.waitForTimeout(300);
    
    // Should be on Q3 (last clicked)
    const questionText = await navPage.getQuestionText();
    expect(questionText).toContain('Question 3');
    
    // UI should still be functional
    await expect(navPage.nextChevron).toBeEnabled();
    await expect(navPage.previousChevron).toBeEnabled();
  });

  test('T029: Clicking current square keeps same question displayed', async ({ page }) => {
    // Navigate to Q6 using chevrons
    for (let i = 0; i < 5; i++) {
      await navPage.clickNext();
      await page.waitForTimeout(100);
    }
    
    let questionText = await navPage.getQuestionText();
    expect(questionText).toContain('Question 6');
    
    // Click the current square (6)
    await navPage.clickQuestionSquare(6);
    await page.waitForTimeout(200);
    
    // Should still be on Q6
    questionText = await navPage.getQuestionText();
    expect(questionText).toContain('Question 6');
  });

  test('Grid and chevrons work together', async ({ page }) => {
    // Use grid to jump to Q8
    await navPage.clickQuestionSquare(8);
    await page.waitForTimeout(200);
    
    let questionText = await navPage.getQuestionText();
    expect(questionText).toContain('Question 8');
    
    // Use chevron to go to Q9
    await navPage.clickNext();
    await page.waitForTimeout(200);
    
    questionText = await navPage.getQuestionText();
    expect(questionText).toContain('Question 9');
    
    // Use grid to go back to Q2
    await navPage.clickQuestionSquare(2);
    await page.waitForTimeout(200);
    
    questionText = await navPage.getQuestionText();
    expect(questionText).toContain('Question 2');
    
    // Use chevron to go to Q1
    await navPage.clickPrevious();
    await page.waitForTimeout(200);
    
    questionText = await navPage.getQuestionText();
    expect(questionText).toContain('Question 1');
  });
});