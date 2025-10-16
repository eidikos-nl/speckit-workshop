/**
 * Pure scoring calculation functions for the "2 to Twelve" game
 *
 * All functions are deterministic with no side effects, making them
 * easily testable and reusable across the codebase.
 */

/**
 * Calculates the score change from a single answer submission
 *
 * Rules:
 * - Correct answer: +10 points
 * - Incorrect answer: -1 point
 * - Score never goes below 0 (floored at minimum)
 *
 * @param isCorrect - Whether the answer was correct
 * @param currentScore - The current accumulated score
 * @returns The new score after applying the answer points
 *
 * @example
 * calculateAnswerScore(true, 100)  // returns 110
 * calculateAnswerScore(false, 100) // returns 99
 * calculateAnswerScore(false, 0)   // returns 0 (not -1)
 */
export function calculateAnswerScore(isCorrect: boolean, currentScore: number): number {
  const basePoints = isCorrect ? 10 : -1;
  return Math.max(0, currentScore + basePoints);
}

/**
 * Adds a time bonus to the current score
 *
 * Used when:
 * - Player completes all 12 questions before time expires
 * - Player guesses final word correctly before time expires
 *
 * @param currentScore - The current accumulated score
 * @param secondsRemaining - The number of seconds remaining on the timer
 * @returns The new score after adding the time bonus
 *
 * @example
 * addTimeBonus(100, 50)  // returns 150
 * addTimeBonus(100, 0)   // returns 100 (no bonus at exactly 0 seconds)
 * addTimeBonus(100, 120) // returns 220
 */
export function addTimeBonus(currentScore: number, secondsRemaining: number): number {
  const bonusPoints = Math.floor(secondsRemaining);
  return currentScore + bonusPoints;
}

/**
 * Calculates the final score based on game outcome
 *
 * Rules:
 * - If the final word guess was incorrect: score = 0 (all-or-nothing penalty)
 * - If the final word guess was correct: score = currentScore (preserved)
 *
 * @param currentScore - The accumulated score before final word submission
 * @param finalWordCorrect - Whether the final word guess was correct
 * @returns The final score to display (0 if loss, currentScore if win)
 *
 * @example
 * calculateFinalScore(500, true)  // returns 500 (win)
 * calculateFinalScore(500, false) // returns 0 (loss - all-or-nothing penalty)
 * calculateFinalScore(0, false)   // returns 0
 */
export function calculateFinalScore(currentScore: number, finalWordCorrect: boolean): number {
  return finalWordCorrect ? currentScore : 0;
}

/**
 * Checks if the player has answered exactly N questions correctly
 *
 * Used to determine when to apply the 12-question completion bonus
 *
 * @param collectedLetters - Map of question positions to revealed letters (1-12)
 * @param questionCount - The number of questions to check for (default: 12)
 * @returns True if exactly that many questions have been answered correctly
 *
 * @example
 * const collected = { 1: 'A', 2: null, 3: 'B', ... } // 1 and 3 answered
 * hasAnsweredNQuestions(collected, 2) // returns true
 * hasAnsweredNQuestions(collected, 12) // returns false (only 2 answered)
 */
export function hasAnsweredNQuestions(
  collectedLetters: Record<number, string | null>,
  questionCount: number = 12
): boolean {
  let answeredCount = 0;
  for (let i = 1; i <= 12; i++) {
    if (collectedLetters[i] !== null) {
      answeredCount++;
    }
  }
  return answeredCount === questionCount;
}

/**
 * Validates that the current score state is consistent
 *
 * Returns any errors found in the score state
 *
 * @param currentScore - The current score value
 * @param isFailed - Whether the game has been marked as failed
 * @returns Array of error messages (empty if valid)
 *
 * @example
 * validateScoreState(100, false) // returns []
 * validateScoreState(-1, false)  // returns ['Score cannot be negative']
 * validateScoreState(1500, false) // returns ['Score exceeds theoretical maximum of 1200']
 */
export function validateScoreState(currentScore: number, isFailed: boolean): string[] {
  const errors: string[] = [];

  if (!Number.isInteger(currentScore)) {
    errors.push('Score must be an integer');
  }
  if (currentScore < 0) {
    errors.push('Score cannot be negative');
  }
  if (currentScore > 1200) {
    errors.push('Score exceeds theoretical maximum of 1200');
  }
  if (typeof isFailed !== 'boolean') {
    errors.push('isFailed must be a boolean');
  }

  return errors;
}
