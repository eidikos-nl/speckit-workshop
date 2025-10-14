import React from 'react';

interface NavigationChevronsProps {
  /** Whether the "Next" button should be enabled */
  canGoNext: boolean;
  
  /** Whether the "Previous" button should be enabled */
  canGoPrevious: boolean;
  
  /** Callback when user clicks "Next" */
  onNext: () => void;
  
  /** Callback when user clicks "Previous" */
  onPrevious: () => void;
}

/**
 * NavigationChevrons component provides next/previous sequential navigation controls
 * Renders chevron buttons with disabled states at boundaries (Q1 and Q12)
 */
export function NavigationChevrons({
  canGoNext,
  canGoPrevious,
  onNext,
  onPrevious,
}: NavigationChevronsProps) {
  return (
    <div className="flex items-center justify-center gap-8 py-4">
      {/* Previous Chevron */}
      <button
        onClick={onPrevious}
        disabled={!canGoPrevious}
        data-testid="previous-chevron"
        aria-label="Go to previous question"
        className={`
          p-3 rounded-full transition-all duration-200
          ${canGoPrevious 
            ? 'bg-game-primary hover:bg-game-primary/80 text-white cursor-pointer shadow-md hover:shadow-lg' 
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }
        `}
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Next Chevron */}
      <button
        onClick={onNext}
        disabled={!canGoNext}
        data-testid="next-chevron"
        aria-label="Go to next question"
        className={`
          p-3 rounded-full transition-all duration-200
          ${canGoNext 
            ? 'bg-game-primary hover:bg-game-primary/80 text-white cursor-pointer shadow-md hover:shadow-lg' 
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }
        `}
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}