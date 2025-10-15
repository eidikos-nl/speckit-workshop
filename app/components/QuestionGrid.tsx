import React from 'react';
import clsx from 'clsx';
import { Question } from '@/lib/types';

interface QuestionGridProps {
  /** Current question index (0-11) for highlighting */
  currentQuestionIndex: number;

  /** Total number of questions (always 12) */
  totalQuestions: number;

  /** Callback when user clicks a square */
  onSelectQuestion: (index: number) => void;

  /** T013: Set of answered question IDs for visual feedback */
  answeredQuestions?: Set<string>;

  /** The array of questions for checking answered status */
  questions?: Question[];
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
  answeredQuestions = new Set(),
  questions = [],
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

          // T014: Check if this question has been answered correctly
          // Get the question ID from the questions array at this index
          const question = questions?.[index];
          const isAnswered = question ? answeredQuestions.has(question.id) : false;

          return (
            <button
              key={index}
              onClick={() => onSelectQuestion(index)}
              data-testid={`question-square-${displayNumber}`}
              aria-label={`Position ${displayNumber} - ${
                isActive
                  ? 'current question'
                  : isAnswered
                    ? 'answered - click to review'
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
                  'bg-green-500 border-green-600 border-2 text-white shadow-lg animate-success-pulse': isAnswered,
                  'focus:ring-green-500': isAnswered,

                  // Active state (non-answered) - highlighted to show current position
                  'bg-game-primary text-white shadow-lg scale-105 ring-2 ring-game-primary ring-offset-2': isActive && !isAnswered,
                  'focus:ring-game-primary': isActive && !isAnswered,

                  // Inactive state - empty blocks for future letters
                  'bg-gray-100 border-2 border-gray-300 text-gray-400 hover:bg-gray-200 hover:border-gray-400': !isAnswered && !isActive,
                  'focus:ring-gray-400': !isAnswered && !isActive,
                }
              )}
            >
              {/* Empty for now - will show revealed letters in future */}
            </button>
          );
        })}
      </div>
    </div>
  );
}