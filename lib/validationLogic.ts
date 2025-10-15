/**
 * Answer validation logic for the "2 to Twelve" game
 *
 * Provides case-insensitive answer comparison and normalization.
 * Pure functions that can be unit tested independently of React components.
 */

export interface AnswerValidationResult {
  isCorrect: boolean;
  normalizedSubmitted: string;
  normalizedCorrect: string;
}

/**
 * Normalizes an answer string by trimming whitespace and converting to lowercase
 *
 * @param answer - The answer string to normalize
 * @returns The normalized answer (trimmed and lowercase)
 *
 * Edge cases handled:
 * - Leading/trailing whitespace is removed
 * - All characters converted to lowercase for case-insensitive comparison
 * - Empty strings remain empty (will not match any correct answer)
 * - Unicode characters are preserved and handled correctly
 *
 * @example
 * normalizeAnswer('  PARIS  ') // returns 'paris'
 * normalizeAnswer('Café') // returns 'café'
 * normalizeAnswer('') // returns ''
 */
export function normalizeAnswer(answer: string): string {
  return answer.trim().toLowerCase();
}

/**
 * Validates a submitted answer against the correct answer
 *
 * Performs case-insensitive comparison after normalization.
 * Returns both the validation result and normalized strings for debugging/logging.
 *
 * @param submitted - The answer submitted by the player
 * @param correct - The correct answer from the question set
 * @returns AnswerValidationResult with validation status and normalized strings
 *
 * @example
 * validateAnswer('PARIS', 'Paris')
 * // returns { isCorrect: true, normalizedSubmitted: 'paris', normalizedCorrect: 'paris' }
 *
 * validateAnswer('London', 'Paris')
 * // returns { isCorrect: false, normalizedSubmitted: 'london', normalizedCorrect: 'paris' }
 */
export function validateAnswer(
  submitted: string,
  correct: string
): AnswerValidationResult {
  const normalizedSubmitted = normalizeAnswer(submitted);
  const normalizedCorrect = normalizeAnswer(correct);

  return {
    isCorrect: normalizedSubmitted === normalizedCorrect,
    normalizedSubmitted,
    normalizedCorrect,
  };
}
