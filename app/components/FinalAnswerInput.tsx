'use client';

import { useRef, useState, useEffect } from 'react';
import { GameResult } from '@/lib/types';

interface FinalAnswerInputProps {
  /** The current final answer value (12-character string) */
  value: string;
  /** Callback when value changes (typically on letter input) */
  onChange: (newValue: string) => void;
  /** Callback when player submits the final answer */
  onSubmit: () => void;
  /** Whether the game has ended (prevents further interaction) */
  gameEnded?: boolean;
  /** The result of the final answer submission (for displaying win/loss state) */
  gameResult?: GameResult | null;
}

/**
 * FinalAnswerInput component for the "2 to Twelve" game
 *
 * Displays a grid of 12 boxes where players can enter their final answer.
 * Each box displays one letter of the 12-letter word they're trying to guess.
 * Provides visual feedback with green (win) or red (loss) styling based on game result.
 *
 * This component handles:
 * - Display of 12 individual letter boxes
 * - Letter entry and removal
 * - Keyboard navigation (Enter to submit, Backspace to remove)
 * - Win/loss visual feedback
 * - Result messaging
 */
export function FinalAnswerInput({
  value,
  onChange,
  onSubmit,
  gameEnded = false,
  gameResult = null,
}: FinalAnswerInputProps) {
  // Track local focus/position state for active box indicator
  const [focusPosition, setFocusPosition] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  // Track whether the component has focus to prevent capturing keyboard input globally
  const [isFocused, setIsFocused] = useState<boolean>(false);

  // Handle keyboard input for letter entry
  useEffect(() => {
    if (gameEnded || !isFocused) {
      return; // Disable input handling when game has ended or component is not focused
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      // Filter input to accept only A-Z characters, convert to uppercase
      if (e.key.length === 1 && /^[a-zA-Z]$/.test(e.key)) {
        e.preventDefault();
        // Enforce 12-character maximum length
        if (value.length < 12) {
          const newValue = value + e.key.toUpperCase();
          onChange(newValue);
          // Move focus right as letters are added
          setFocusPosition(newValue.length - 1);
        }
        return;
      }

      // Handle backspace to remove last character
      if (e.key === 'Backspace') {
        e.preventDefault();
        if (value.length > 0) {
          const newValue = value.slice(0, -1);
          onChange(newValue);
          setFocusPosition(newValue.length > 0 ? newValue.length - 1 : null);
        }
        return;
      }

      // Enter key handler to trigger submission when 12 characters present
      if (e.key === 'Enter' && value.length === 12) {
        e.preventDefault();
        onSubmit();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [value, onChange, onSubmit, gameEnded, isFocused]);

  const isComplete = value.length === 12;
  const isWin = gameResult?.outcome === 'win';

  // Handle focus event to enable keyboard capture
  const handleFocus = () => {
    if (!gameEnded) {
      setIsFocused(true);
      setFocusPosition(Math.min(value.length, 11));
    }
  };

  // Handle blur event to disable keyboard capture
  const handleBlur = () => {
    setIsFocused(false);
    setFocusPosition(null);
  };

  // Handle click on container to focus it
  const handleContainerClick = () => {
    if (!gameEnded && containerRef.current) {
      containerRef.current.focus();
    }
  };

  return (
    <div 
      className="space-y-4 outline-none" 
      ref={containerRef}
      tabIndex={gameEnded ? -1 : 0}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onClick={handleContainerClick}
    >
      {/* 12-box grid for letter display */}
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-12 gap-3 sm:gap-4 md:gap-6">
        {Array.from({ length: 12 }).map((_, index) => {
          const letter = value[index] ?? '';
          const isAnswered = letter !== '';
          const isActive = focusPosition === index; // Check if box has active cursor indicator

          // Determine box styling based on game state
          // Add smooth color transition animations using transition-colors duration-300
          // Add focus indicators with ring utilities
          let boxClasses = 'aspect-square rounded-lg border-2 border-gray-300 flex items-center justify-center font-bold text-xl transition-colors duration-300 relative cursor-pointer';

          if (gameEnded && gameResult) {
            boxClasses +=
              isWin ? ' bg-green-500 text-white border-green-600' : ' bg-red-500 text-white border-red-600';
          } else if (isAnswered) {
            boxClasses += ' bg-game-primary text-white border-game-primary';
          } else {
            boxClasses += ' bg-white text-gray-700 hover:border-game-primary';
          }

          // Add focus ring styling for active box indicator
          if (isActive && !gameEnded) {
            boxClasses += ' ring-2 ring-game-primary ring-offset-2';
          }

          return (
            <div
              key={index}
              className={boxClasses}
              data-testid={`final-answer-box-${index + 1}`}
               // Add ARIA labels describing position and state for accessibility
              aria-label={`Final answer box ${index + 1}${letter ? ` containing letter ${letter}` : ''}${isActive ? ', currently focused' : ''}${gameEnded ? (isWin ? ', answered correctly' : ', answered incorrectly') : ''}`}
              tabIndex={0}
              role="textbox"
              aria-readonly={gameEnded}
            >
              {letter}
              {/* Visual cursor indicator in active box */}
              {isActive && !gameEnded && !letter && (
                <div className="absolute inset-0 flex items-center justify-center">
                  {/* Optional blinking cursor animation using animate-pulse */}
                  <div className="w-0.5 h-6 bg-game-primary animate-pulse"></div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Submit button */}
      {!gameEnded && (
        <div className="flex justify-center">
          <button
            onClick={onSubmit}
            disabled={!isComplete}
            data-testid="final-answer-submit"
             // Verify all interactive elements have appropriate hover states
            className={`px-6 py-2 rounded-lg font-semibold transition-all duration-200 ${
              isComplete
                ? 'bg-game-primary text-white hover:bg-game-primary/80 cursor-pointer shadow-md hover:shadow-lg active:shadow-md active:translate-y-0.5'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
            aria-label="Submit final answer"
          >
            Submit Answer
          </button>
        </div>
      )}

      {/* Result message */}
      {gameEnded && gameResult && (
        <div className="text-center space-y-2">
          <div
            data-testid="final-answer-result-message"
            className={`text-lg font-semibold ${isWin ? 'text-green-600' : 'text-red-600'}`}
          >
            {isWin
              ? `Congratulations! You solved the puzzle with the word: ${gameResult.playerAnswer.toUpperCase()}`
              : 'That is incorrect, try again in a new game'}
          </div>
        </div>
      )}
    </div>
  );
}
