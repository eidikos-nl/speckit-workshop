import { QuestionSet, CollectedLetters } from './types';

/**
 * Randomly selects one question set from an array of question sets
 * 
 * This is a pure function that:
 * - Takes an array of QuestionSet objects
 * - Returns one randomly selected QuestionSet
 * - Gives each set equal probability of selection (1/n where n is array length)
 * - Throws an error if the array is empty
 * 
 * @param questionSets - Array of available question sets
 * @returns A randomly selected question set
 * @throws Error if questionSets array is empty
 * 
 * @example
 * const sets = [set1, set2, set3];
 * const selected = selectRandomQuestionSet(sets);
 * // selected will be one of set1, set2, or set3 with equal probability
 */
export function selectRandomQuestionSet(questionSets: QuestionSet[]): QuestionSet {
  if (questionSets.length === 0) {
    throw new Error('Cannot select from empty question sets array');
  }

  // Generate random index: Math.random() returns [0, 1)
  // Multiply by length and floor to get integer in range [0, length-1]
  const randomIndex = Math.floor(Math.random() * questionSets.length);

  return questionSets[randomIndex];
}

/**
 * Initializes an empty letter collection for a new game
 *
 * Creates a CollectedLetters object with all 12 positions set to null,
 * indicating that no questions have been answered yet.
 *
 * @returns A CollectedLetters object with positions 1-12 all set to null
 *
 * @example
 * const letters = initializeCollectedLetters();
 * // returns { 1: null, 2: null, ..., 12: null }
 */
export function initializeCollectedLetters(): CollectedLetters {
  const letters: CollectedLetters = {};
  for (let i = 1; i <= 12; i++) {
    letters[i] = null;
  }
  return letters;
}