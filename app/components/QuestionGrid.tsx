import React from 'react';
import clsx from 'clsx';

interface QuestionGridProps {
  /** Current question index (0-11) for highlighting */
  currentQuestionIndex: number;
  
  /** Total number of questions (always 12) */
  totalQuestions: number;
  
  /** Callback when user clicks a square */
  onSelectQuestion: (index: number) => void;
}

/**
 * QuestionGrid component displays 12 clickable squares for direct question navigation
 * Each square represents one question with visual indication of the current question
 */
export function QuestionGrid({
  currentQuestionIndex,
  totalQuestions,
  onSelectQuestion,
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
          
          return (
            <button
              key={index}
              onClick={() => onSelectQuestion(index)}
              data-testid={`question-square-${displayNumber}`}
              aria-label={`Position ${displayNumber} - ${isActive ? 'current question' : 'click to navigate to this question'}`}
              aria-current={isActive ? 'true' : 'false'}
              className={clsx(
                // T035: CSS transitions for smooth active square highlight changes
                'aspect-square rounded-lg font-bold text-2xl min-h-[50px]',
                'transition-all duration-300 ease-in-out',
                'hover:scale-105 active:scale-95',
                'focus:outline-none focus:ring-2 focus:ring-offset-2',
                'flex items-center justify-center',
                {
                  // Active state - highlighted to show current position
                  'bg-game-primary text-white shadow-lg scale-105 ring-2 ring-game-primary ring-offset-2': isActive,
                  'focus:ring-game-primary': isActive,
                  
                  // Inactive state - empty blocks for future letters
                  'bg-gray-100 border-2 border-gray-300 text-gray-400 hover:bg-gray-200 hover:border-gray-400': !isActive,
                  'focus:ring-gray-400': !isActive,
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