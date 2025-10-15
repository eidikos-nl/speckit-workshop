import React from 'react';
import clsx from 'clsx';
import { Question, CollectedLetters } from '@/lib/types';
import { getDisplayLetter, isAnsweredCorrectly } from '@/lib/validationLogic';

interface QuestionGridProps {
  /** Current question index (0-11) for highlighting */
  currentQuestionIndex: number;

  /** Total number of questions (always 12) */
  totalQuestions: number;

  /** Callback when user clicks a square */
  onSelectQuestion: (index: number) => void;

  /** T013: Set of answered question IDs for visual feedback (kept for backwards compatibility) */
  answeredQuestions?: Set<string>;

  /** The array of questions for checking answered status (kept for backwards compatibility) */
  questions?: Question[];

  /** T011: Collection of revealed letters for each question position (1-12) */
  collectedLetters?: CollectedLetters;
}

/**
 * QuestionGrid component displays 12 clickable squares for direct question navigation
 * Each square represents one question with visual indication of the current question
 * T014: Shows green background for answered questions
 * T016: Applies success pulse animation to answered questions
 */
export function QuestionGrid({
  currentQuestionIndex,
  totalQuestions,
  onSelectQuestion,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  answeredQuestions = new Set(),
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  questions = [],
  collectedLetters = {},
}: QuestionGridProps) {
  return (
    <div className="py-6" role="navigation" aria-label="Revealed letters grid">
      {/* Helper text moved to top */}
      <div className="text-center mb-4">
        <p className="text-sm text-gray-500">
          Revealed Letters (earn letters by answering correctly)
        </p>
      </div>
      
      {/* T032: Responsive grid layout (1×12 desktop, wrapped on mobile) */}
      <div
        className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-12 gap-3 sm:gap-4 md:gap-6"
        role="group"
        aria-label="Revealed letters for the target word"
      >
        {Array.from({ length: totalQuestions }, (_, index) => {
          // T031: Active square highlighting logic
          const isActive = index === currentQuestionIndex;
          const displayNumber = index + 1; // 1-indexed for aria-label

          // T011: Get display letter - either the collected letter or "." for unanswered
          const displayLetter = getDisplayLetter(displayNumber, collectedLetters);
          // T013: Check if answered using collected letters (same as isAnswered, but from collected letters)
          const isLetterCollected = isAnsweredCorrectly(displayNumber, collectedLetters);

          return (
            <button
              key={index}
              onClick={() => onSelectQuestion(index)}
              data-testid={`question-square-${displayNumber}`}
              aria-label={`Position ${displayNumber} - ${
                isActive
                  ? 'current question'
                  : isLetterCollected
                    ? `answered with letter ${displayLetter} - click to review`
                    : 'click to navigate to this question'
              }`}
              aria-current={isActive ? 'true' : 'false'}
              className={clsx(
                // T035: CSS transitions for smooth active square highlight changes
                'aspect-square rounded-lg font-bold text-2xl min-h-[50px]',
                'transition-all duration-300 ease-in-out',
                'hover:scale-105 active:scale-95',
                'focus:outline-none focus:ring-2 focus:ring-offset-2',
                'flex items-center justify-center',
                {
                  // T014: Answered state - green background with success animation
                  // Shows green even if this is the current question
                  'bg-green-500 border-green-600 border-2 text-white shadow-lg animate-success-pulse': isLetterCollected,
                  'focus:ring-green-500': isLetterCollected,

                  // Active state (non-answered) - highlighted to show current position
                  'bg-game-primary text-white shadow-lg scale-105 ring-2 ring-game-primary ring-offset-2': isActive && !isLetterCollected,
                  'focus:ring-game-primary': isActive && !isLetterCollected,

                  // Inactive state - empty blocks with periods for unanswered
                  'bg-white border-2 border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-gray-400': !isLetterCollected && !isActive,
                  'focus:ring-gray-400': !isLetterCollected && !isActive,
                }
              )}
            >
              {/* T011: Display the letter or period */}
              <span>{displayLetter}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}