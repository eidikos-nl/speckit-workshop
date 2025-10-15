/**
 * Answer validation logic for the "2 to Twelve" game
 *
 * Provides case-insensitive answer comparison and normalization.
 * Pure functions that can be unit tested independently of React components.
 */

import { CollectedLetters } from './types';

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

/**
 * Gets the display character for a question position
 *
 * Returns the collected letter if the question has been answered correctly,
 * otherwise returns a period "." to indicate an unanswered question.
 *
 * @param questionNumber - The position (1-12) of the question in the game
 * @param collectedLetters - The current collection of answered letters
 * @returns Either the collected letter or "." for unanswered questions
 *
 * @example
 * getDisplayLetter(1, { 1: "S", 2: null }) // returns "S"
 * getDisplayLetter(2, { 1: "S", 2: null }) // returns "."
 */
export function getDisplayLetter(
  questionNumber: number,
  collectedLetters: CollectedLetters
): string {
  const letter = collectedLetters[questionNumber];
  return letter ?? '.';
}

/**
 * Checks if a question has been answered correctly
 *
 * A question is considered answered correctly if a letter is collected for it.
 *
 * @param questionNumber - The position (1-12) of the question in the game
 * @param collectedLetters - The current collection of answered letters
 * @returns true if the question has been answered correctly, false otherwise
 *
 * @example
 * isAnsweredCorrectly(1, { 1: "S", 2: null }) // returns true
 * isAnsweredCorrectly(2, { 1: "S", 2: null }) // returns false
 */
export function isAnsweredCorrectly(
  questionNumber: number,
  collectedLetters: CollectedLetters
): boolean {
  return collectedLetters[questionNumber] !== null && collectedLetters[questionNumber] !== undefined;
}
