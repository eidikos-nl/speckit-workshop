'use client';

import React, { useState } from 'react';
import { Question } from '@/lib/types';

interface QuestionDisplayProps {
  /** The question object to display */
  question: Question;

  /** Display number (1-indexed, e.g., 1-12) */
  questionNumber: number;

  /** Total questions for "Question X of Y" display */
  totalQuestions: number;

  /** T009: Callback function for answer submission
   * @param answer - The submitted answer string
   * @returns true if answer is correct, false if incorrect
   */
  onAnswerSubmit?: (answer: string) => boolean;
}

/**
 * QuestionDisplay component shows the current question text and number
 * T008: Local state for input value and validation feedback
 * T010: Implements Enter key handler for answer submission
 * T011: Implements button click handler for answer submission
 * T018: Shows "That is incorrect" feedback for wrong answers
 */
export function QuestionDisplay({
  question,
  onAnswerSubmit,
}: QuestionDisplayProps) {
  // T008: Local state for the input field value
  const [inputValue, setInputValue] = useState('');

  // T008: Local state for validation feedback text
  const [feedbackText, setFeedbackText] = useState('');

  // Track whether the last answer was correct (for styling)
  const [wasCorrect, setWasCorrect] = useState(false);

  // T011: Handle submit button click
  const handleSubmit = () => {
    if (!onAnswerSubmit) return;

    const isCorrect = onAnswerSubmit(inputValue);
    if (!isCorrect) {
      // T018: Display "That is incorrect" for wrong answers
      setFeedbackText('That is incorrect');
      setWasCorrect(false);
    } else {
      // T018: Display "That is correct" in green for correct answers
      setFeedbackText('That is correct');
      setWasCorrect(true);
    }
  };

  // T010: Handle Enter key press
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  // T019: Clear feedback when input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setFeedbackText(''); // Clear feedback on input change
  };

  return (
    <div
      className="space-y-6 py-6 animate-fade-in"
      data-testid="current-question-display"
    >
      {/* Question Text with smooth transitions */}
      <div className="bg-gray-50 rounded-lg p-6 min-h-[120px] flex items-center justify-center
                    transition-all duration-200 ease-in-out">
        <p className="text-xl text-gray-800 text-center break-words" data-testid="question-text">
          {question.question}
        </p>
      </div>

      {/* Answer Input Section */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-center">
        <input
          type="text"
          placeholder="Enter your answer..."
          data-testid="answer-input"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className="w-full sm:w-96 px-4 py-3 border-2 border-gray-300 rounded-lg
                   focus:outline-none focus:border-game-primary focus:ring-2 focus:ring-game-primary/20
                   transition-all duration-200"
          aria-label="Answer input field"
        />
        <button
          type="button"
          data-testid="verify-button"
          onClick={handleSubmit}
          className="w-full sm:w-auto px-6 py-3 bg-game-secondary text-white rounded-lg
                   hover:bg-game-secondary/90 transition-all duration-200
                   font-semibold shadow-md hover:shadow-lg"
          aria-label="Verify answer"
        >
          Verify Answer
        </button>
      </div>

      {/* T020: Validation feedback text */}
      <div className="text-center">
        <p
          className={`text-sm ${
            wasCorrect ? 'text-green-500 font-semibold' : 'text-gray-500'
          }`}
          data-testid="validation-feedback"
        >
          {feedbackText || 'Answer verification coming in a future update'}
        </p>
      </div>
    </div>
  );
}