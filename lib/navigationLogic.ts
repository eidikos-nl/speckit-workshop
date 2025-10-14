/**
 * Navigation helper functions for question flow
 * Pure functions with no side effects, easily unit testable
 */

/**
 * Determines if "Next" navigation is allowed
 * 
 * @param currentIndex - Current question index (0-indexed)
 * @param totalQuestions - Total number of questions
 * @returns true if currentIndex < totalQuestions - 1, false otherwise
 * 
 * @example
 * canNavigateNext(0, 12) // true (can go from Q1 to Q2)
 * canNavigateNext(11, 12) // false (already on last question)
 */
export function canNavigateNext(currentIndex: number, totalQuestions: number): boolean {
  return currentIndex < totalQuestions - 1;
}

/**
 * Determines if "Previous" navigation is allowed
 * 
 * @param currentIndex - Current question index (0-indexed)
 * @returns true if currentIndex > 0, false otherwise
 * 
 * @example
 * canNavigatePrevious(0) // false (already on first question)
 * canNavigatePrevious(5) // true (can go back)
 */
export function canNavigatePrevious(currentIndex: number): boolean {
  return currentIndex > 0;
}

/**
 * Computes the next valid question index
 * 
 * @param currentIndex - Current index (0-indexed)
 * @param totalQuestions - Total question count
 * @returns currentIndex + 1 if valid, otherwise currentIndex (no change)
 * 
 * @example
 * getNextQuestionIndex(5, 12) // 6
 * getNextQuestionIndex(11, 12) // 11 (boundary case, no change)
 */
export function getNextQuestionIndex(
  currentIndex: number,
  totalQuestions: number
): number {
  if (canNavigateNext(currentIndex, totalQuestions)) {
    return currentIndex + 1;
  }
  return currentIndex;
}

/**
 * Computes the previous valid question index
 * 
 * @param currentIndex - Current index (0-indexed)
 * @returns currentIndex - 1 if valid, otherwise currentIndex (no change)
 * 
 * @example
 * getPreviousQuestionIndex(5) // 4
 * getPreviousQuestionIndex(0) // 0 (boundary case, no change)
 */
export function getPreviousQuestionIndex(currentIndex: number): number {
  if (canNavigatePrevious(currentIndex)) {
    return currentIndex - 1;
  }
  return currentIndex;
}

/**
 * Validates a question index is within bounds
 * 
 * @param index - Index to validate
 * @param totalQuestions - Total question count
 * @returns true if 0 <= index < totalQuestions, false otherwise
 * 
 * @example
 * isValidQuestionIndex(5, 12) // true
 * isValidQuestionIndex(-1, 12) // false
 * isValidQuestionIndex(12, 12) // false (off by one)
 */
export function isValidQuestionIndex(index: number, totalQuestions: number): boolean {
  return index >= 0 && index < totalQuestions;
}