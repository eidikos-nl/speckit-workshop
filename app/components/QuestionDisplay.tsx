import React from 'react';
import { Question } from '@/lib/types';

interface QuestionDisplayProps {
  /** The question object to display */
  question: Question;
  
  /** Display number (1-indexed, e.g., 1-12) */
  questionNumber: number;
  
  /** Total questions for "Question X of Y" display */
  totalQuestions: number;
}

/**
 * QuestionDisplay component shows the current question text and number
 * Includes answer input field and verify button scaffolding (non-functional in this phase)
 */
export function QuestionDisplay({
  question,
}: QuestionDisplayProps) {
  return (
    <div
      className="space-y-6 py-6 animate-fade-in"
      data-testid="current-question-display"
    >

      {/* Question Text with smooth transitions */}
      <div className="bg-gray-50 rounded-lg p-6 min-h-[120px] flex items-center justify-center
                    transition-all duration-200 ease-in-out">
        <p className="text-xl text-gray-800 text-center break-words">
          {question.question}
        </p>
      </div>

      {/* Answer Input Section (scaffolding - non-functional in this phase) */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-center">
        <input
          type="text"
          placeholder="Enter your answer..."
          data-testid="answer-input"
          className="w-full sm:w-96 px-4 py-3 border-2 border-gray-300 rounded-lg
                   focus:outline-none focus:border-game-primary focus:ring-2 focus:ring-game-primary/20
                   transition-all duration-200"
          aria-label="Answer input field"
        />
        <button
          type="button"
          data-testid="verify-button"
          className="w-full sm:w-auto px-6 py-3 bg-game-secondary text-white rounded-lg
                   hover:bg-game-secondary/90 transition-all duration-200
                   font-semibold shadow-md hover:shadow-lg"
          aria-label="Verify answer (non-functional)"
        >
          Verify Answer
        </button>
      </div>

      {/* Helper text */}
      <div className="text-center">
        <p className="text-sm text-gray-500">
          Answer verification coming in a future update
        </p>
      </div>
    </div>
  );
}