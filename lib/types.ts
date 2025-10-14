/**
 * Core type definitions for the "2 to Twelve" game
 */

/**
 * Represents a single general knowledge question
 */
export interface Question {
  id: string;
  question: string;
  answer: string;
  /** The letter revealed when this question is answered correctly */
  revealedLetter: string;
}

/**
 * Represents a collection of questions that together reveal a 12-letter word
 * 
 * Invariants:
 * - Must contain exactly 12 questions
 * - Each question must reveal exactly one letter
 * - Theme must be a non-empty string
 */
export interface QuestionSet {
  id: string;
  theme: string;
  /** The target 12-letter word to be guessed */
  targetWord: string;
  /** Array of exactly 12 questions */
  questions: Question[];
}

/**
 * Represents an active game session
 * 
 * State invariants:
 * - When isActive is true, selectedQuestionSet must not be null
 * - When isActive is false, selectedQuestionSet may be null
 */
export interface GameSession {
  isActive: boolean;
  selectedQuestionSet: QuestionSet | null;
}

/**
 * Type guard to validate that a GameSession is in a valid active state
 * 
 * @param session - The game session to validate
 * @returns true if session is active and has a selected question set
 */
export function isValidActiveSession(session: GameSession): session is GameSession & { selectedQuestionSet: QuestionSet } {
  return session.isActive && session.selectedQuestionSet !== null;
}

/**
 * Discriminated union for validation results
 */
export type ValidationResult =
  | { valid: true }
  | { valid: false; errors: string[] };

/**
 * Validates a QuestionSet against all business rules
 * 
 * Rules:
 * - Must have exactly 12 questions
 * - Theme must be non-empty
 * - Target word must be exactly 12 letters
 * - Each question must have all required fields
 * - Each revealed letter must be exactly 1 character
 * 
 * @param questionSet - The question set to validate
 * @returns ValidationResult indicating success or specific errors
 */
export function validateQuestionSet(questionSet: QuestionSet): ValidationResult {
  const errors: string[] = [];

  // Validate theme
  if (!questionSet.theme || questionSet.theme.trim().length === 0) {
    errors.push('Theme must be a non-empty string');
  }

  // Validate target word
  if (!questionSet.targetWord || questionSet.targetWord.length !== 12) {
    errors.push('Target word must be exactly 12 letters');
  }

  // Validate questions array length
  if (!questionSet.questions || questionSet.questions.length !== 12) {
    errors.push('Question set must contain exactly 12 questions');
  } else {
    // Validate each question
    questionSet.questions.forEach((q, index) => {
      if (!q.id || q.id.trim().length === 0) {
        errors.push(`Question ${index + 1}: ID must be non-empty`);
      }
      if (!q.question || q.question.trim().length === 0) {
        errors.push(`Question ${index + 1}: Question text must be non-empty`);
      }
      if (!q.answer || q.answer.trim().length === 0) {
        errors.push(`Question ${index + 1}: Answer must be non-empty`);
      }
      if (!q.revealedLetter || q.revealedLetter.length !== 1) {
        errors.push(`Question ${index + 1}: Revealed letter must be exactly 1 character`);
      }
    });
  }

  return errors.length === 0 ? { valid: true } : { valid: false, errors };
}