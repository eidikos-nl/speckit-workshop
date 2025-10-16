/**
 * Core type definitions for the "2 to Twelve" game
 */

/**
 * Defines the three distinct phases of gameplay that determine UI state and player capabilities.
 */
export enum GamePhase {
  EXPLORATION = 'exploration',
  FINAL_ANSWER = 'final_answer',
  ENDED = 'ended'
}

/**
 * Represents the current state of both countdown timers including remaining time, active phase, and urgency indicators.
 *
 * State invariants:
 * - mainTimeRemaining must be between 0 and 600 (inclusive)
 * - finalTimeRemaining must be between 0 and 120 (inclusive)
 * - When phase is EXPLORATION, mainTimeRemaining > 0
 * - When phase is FINAL_ANSWER, mainTimeRemaining === 0 and finalTimeRemaining > 0
 * - When phase is ENDED, both timers must be 0 or isTimerStopped must be true
 * - finalTimerStarted is null when mainTimeRemaining > 0
 * - Once isTimerStopped is true, it cannot become false (immutable)
 */
export interface TimerState {
  /** Seconds remaining on 10-minute main timer (0-600) */
  mainTimeRemaining: number;
  /** Seconds remaining on 2-minute final timer (0-120) */
  finalTimeRemaining: number;
  /** Unix epoch milliseconds when main timer started */
  mainTimerStarted: number;
  /** Unix epoch milliseconds when final timer started (null until main expires) */
  finalTimerStarted: number | null;
  /** Whether timers have been stopped (e.g., correct answer submitted) */
  isTimerStopped: boolean;
  /** Current game phase determining UI state and available actions */
  phase: GamePhase;
}

/**
 * Result of validating a submitted answer
 *
 * Contains the validation status and normalized strings for both submitted
 * and correct answers (useful for debugging and logging)
 */
export interface AnswerValidationResult {
  isCorrect: boolean;
  normalizedSubmitted: string;
  normalizedCorrect: string;
}

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
 * Collection of letters revealed through correct answers
 *
 * Maps question positions (1-12) to their revealed letters
 * A null value indicates the question has not been answered correctly yet
 *
 * Example: { 1: "S", 2: null, 3: "C", ... } shows letters revealed for questions 1 and 3
 */
export type CollectedLetters = Record<number, string | null>;

/**
 * Represents an active game session
 *
 * State invariants:
 * - When isActive is true, selectedQuestionSet must not be null
 * - When isActive is false, selectedQuestionSet may be null
 * - collectedLetters must contain entries for all 12 positions (1-12)
 * - When gameEnded is true, gameResult should be set
 * - finalAnswer is only populated after submission attempt
 * - timerState tracks both timers and current game phase
 * - currentScore must be >= 0 and <= 1200
 * - isFailed is false by default; becomes true only if final word guess fails
 */
export interface GameSession {
  isActive: boolean;
  selectedQuestionSet: QuestionSet | null;
  collectedLetters: CollectedLetters;
  /** Optional final answer submitted by the player (populated during entry) */
  finalAnswer?: FinalAnswer;
  /** Optional result of the final word submission (populated after submission) */
  gameResult?: GameResult;
  /** Whether the game has ended (after final answer submission) */
  gameEnded?: boolean;
  /** Timer state tracking both countdown timers and current game phase */
  timerState: TimerState;
  /** Running point total accumulated throughout the game session (0-1200) */
  currentScore: number;
  /** Whether the final word guess failed (true = loss, false = win or still playing) */
  isFailed: boolean;
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
 * Represents the final answer submitted by the player
 *
 * Contains the 12-letter word, its position in the game, and submission metadata.
 */
export interface FinalAnswer {
  /** The 12-letter word submitted by the player */
  value: string;
  /** Position of this submission (for potential future versioning) */
  position: number;
  /** Whether the answer has been submitted for validation */
  submitted: boolean;
  /** Timestamp of when the answer was submitted (ISO 8601 format) */
  timestamp: string;
}

/**
 * Represents the outcome of the final word submission
 *
 * Tracks the game result, correct answer, player's answer, and submission timestamp.
 */
export interface GameResult {
  /** 'win' if the submitted answer matches the target word, 'loss' otherwise */
  outcome: 'win' | 'loss';
  /** The correct 12-letter answer from the game's question set */
  correctAnswer: string;
  /** The answer submitted by the player for final comparison */
  playerAnswer: string;
  /** Timestamp of when the result was determined (ISO 8601 format) */
  timestamp: string;
}

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

/**
 * Result of score validation
 */
export interface ScoreValidation {
  isValid: boolean;
  errors: string[];
}

/**
 * Validates a score value against business rules
 *
 * Rules:
 * - Must be an integer (no decimals)
 * - Must be >= 0 (non-negative)
 * - Must be <= 1200 (theoretical maximum)
 *
 * @param score - The score value to validate
 * @returns ScoreValidation object with validation result
 */
export function validateScore(score: number): ScoreValidation {
  const errors: string[] = [];

  if (!Number.isInteger(score)) {
    errors.push('Score must be an integer');
  }
  if (score < 0) {
    errors.push('Score cannot be negative');
  }
  if (score > 1200) {
    errors.push('Score exceeds theoretical maximum of 1200');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validates a GameResult including final score calculation
 *
 * Rules:
 * - If outcome is 'loss', finalScore must be 0
 * - finalScore must be an integer
 * - finalScore must be >= 0
 * - finalScore must be <= 1200
 *
 * @param result - The GameResult to validate
 * @returns ScoreValidation object with validation result
 */
export function validateGameResult(result: GameResult & { finalScore: number }): ScoreValidation {
  const errors: string[] = [];

  if (result.outcome === 'loss' && result.finalScore !== 0) {
    errors.push('Final score must be 0 for loss outcome');
  }
  if (!Number.isInteger(result.finalScore)) {
    errors.push('Final score must be an integer');
  }
  if (result.finalScore < 0) {
    errors.push('Final score cannot be negative');
  }
  if (result.finalScore > 1200) {
    errors.push('Final score exceeds theoretical maximum of 1200');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}