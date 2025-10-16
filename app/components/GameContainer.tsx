'use client';

import { useState, useCallback } from 'react';
import { GameSession, CollectedLetters, GameResult } from '@/lib/types';
import { canNavigateNext, canNavigatePrevious } from '@/lib/navigationLogic';
import { validateAnswer, validateFinalAnswer } from '@/lib/validationLogic';
import { QuestionDisplay } from './QuestionDisplay';
import { QuestionGrid } from './QuestionGrid';
import { FinalAnswerInput } from './FinalAnswerInput';
import { TimerPanel } from './TimerPanel';
import { useGameTimer } from '../hooks/useGameTimer';

interface GameContainerProps {
  gameSession: GameSession;
  onStopGame: () => void;
}

/**
 * GameContainer manages navigation state and coordinates all navigation components
 * This is the main orchestrator for the question navigation feature
 */
export function GameContainer({ gameSession, onStopGame }: GameContainerProps) {
  // Navigation state management using useState
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Track which questions have been correctly answered
  // Uses Set<string> where each element is a question ID
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<string>>(new Set());

  // Manage collected letters state - tracks letters revealed by correct answers
  const [collectedLetters, setCollectedLetters] = useState<CollectedLetters>(
    gameSession.collectedLetters
  );

  // Track the final answer value (12-character string for final submission)
  const [finalAnswer, setFinalAnswer] = useState<string>('');

  // Track whether the game has ended (after final answer submission)
  const [gameEnded, setGameEnded] = useState<boolean>(false);

  // Track the result of the final answer submission (win/loss outcome)
  const [gameResult, setGameResult] = useState<GameResult | null>(null);

  // Callback when final timer expires - set game result to loss
  const handleFinalTimerExpire = useCallback(() => {
    if (!gameSession.selectedQuestionSet || gameEnded) {
      return;
    }

    const { targetWord } = gameSession.selectedQuestionSet;

    // Set game result to loss with correct answer and incomplete player answer
    setGameResult({
      outcome: 'loss',
      correctAnswer: targetWord,
      playerAnswer: finalAnswer || 'INCOMPLETE',
      timestamp: new Date().toISOString(),
    });

    // Set gameEnded to true to prevent further gameplay
    setGameEnded(true);
  }, [gameSession.selectedQuestionSet, gameEnded, finalAnswer]);

  // Initialize timer with main 600s (10 minutes) and final 120s (2 minutes)
  // Initialize with EXPLORATION phase and full durations
  const timerState = useGameTimer(
    600, // main duration
    120, // final duration
    // Callback when main timer expires - phase transition handled by hook
    useCallback(() => {
      // No additional action needed - hook handles phase transition
    }, []),
    // Callback when final timer expires
    handleFinalTimerExpire
  );

  // Guard: Only render if game is active with a valid question set
  if (!gameSession.isActive || !gameSession.selectedQuestionSet) {
    return null;
  }

  const { questions, theme } = gameSession.selectedQuestionSet;
  const totalQuestions = questions.length;
  const currentQuestion = questions[currentQuestionIndex];

  // Compute navigation capabilities
  const canGoNext = canNavigateNext(currentQuestionIndex, totalQuestions);
  const canGoPrevious = canNavigatePrevious(currentQuestionIndex);

   // Disable navigation during FINAL_ANSWER phase
  const isNavigationDisabled = timerState.phase !== 'exploration';
  const displayOpacity = timerState.phase === 'final_answer' ? 0.2 : 1;

  // Handler for final answer submission
  // Validates the submitted answer, determines win/loss outcome, and ends the game
  // Includes submission guard to prevent duplicate clicks
  const handleFinalAnswerSubmit = () => {
    if (gameEnded || !gameSession.selectedQuestionSet) {
      return; // Prevent duplicate submissions
    }

    const { targetWord } = gameSession.selectedQuestionSet;
    const result = validateFinalAnswer(finalAnswer, targetWord);

    // Stop timer when final answer is submitted (both correct and incorrect)
    timerState.stopTimer();

    setGameResult(result);
    setGameEnded(true);
  };

   // Navigation handlers
  const handleNext = () => {
    if (canGoNext) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (canGoPrevious) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  // Handler for direct question selection via grid
  const handleSelectQuestion = (index: number) => {
    if (index >= 0 && index < totalQuestions) {
      setCurrentQuestionIndex(index);
    }
  };

  // Handler for answer submission
  // Validates the submitted answer against the correct answer
  // Returns true if correct, false if incorrect
  // Updates answeredQuestions state if answer is correct
  // Collects letter when answer is correct
  // Transitions to FINAL_ANSWER phase when all 12 questions are answered
  const handleAnswerSubmit = (answer: string): boolean => {
    const validationResult = validateAnswer(answer, currentQuestion.answer);
    if (validationResult.isCorrect) {
      // Add question ID to answered questions set
      const updatedAnsweredQuestions = new Set(answeredQuestions).add(currentQuestion.id);
      setAnsweredQuestions(updatedAnsweredQuestions);
      // Update collected letters with the revealed letter for this question
      // Question index is 0-based, but letter positions are 1-12
      const questionPosition = currentQuestionIndex + 1;
      setCollectedLetters(prev => ({
        ...prev,
        [questionPosition]: currentQuestion.revealedLetter,
      }));

      // When all 12 questions are answered, transition to FINAL_ANSWER phase
      if (updatedAnsweredQuestions.size === 12) {
        timerState.transitionToFinalAnswer();
      }
    }
    return validationResult.isCorrect;
  };

  return (
    <div className="space-y-6 relative">
      {/* Stop Game Button - Top Right */}
      <button
        onClick={onStopGame}
        className="absolute top-0 right-0 p-2 rounded-full transition-all duration-200 text-gray-400 hover:text-red-500 hover:bg-red-50"
        aria-label="Stop the current game session"
        data-testid="stop-game-button"
        title="Stop Game"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Theme Display */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold text-gray-700">Theme</h2>
        <div
          data-testid="theme-display"
          className="text-3xl sm:text-4xl font-bold text-game-primary"
        >
          {theme}
        </div>
      </div>

      {/* Question Number with Chevrons beside it */}
      <div className="flex items-center justify-center gap-4 py-4">
        {/* Previous chevron button */}
        {/* Disable when phase !== EXPLORATION */}
        <button
          onClick={handlePrevious}
          disabled={!canGoPrevious || isNavigationDisabled}
          data-testid="previous-chevron"
          aria-label="Go to previous question"
          className={`
            p-2 rounded-full transition-all duration-200
            ${canGoPrevious && !isNavigationDisabled
              ? 'bg-game-primary hover:bg-game-primary/80 text-white cursor-pointer shadow-md hover:shadow-lg'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }
          `}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Question number text */}
        <p
          className="text-lg font-semibold text-gray-600 min-w-[140px] text-center"
          data-testid="question-number-display"
        >
          Question {currentQuestionIndex + 1} of {totalQuestions}
        </p>

        {/* Next chevron button */}
        {/* Disable when phase !== EXPLORATION */}
        <button
          onClick={handleNext}
          disabled={!canGoNext || isNavigationDisabled}
          data-testid="next-chevron"
          aria-label="Go to next question"
          className={`
            p-2 rounded-full transition-all duration-200
            ${canGoNext && !isNavigationDisabled
              ? 'bg-game-primary hover:bg-game-primary/80 text-white cursor-pointer shadow-md hover:shadow-lg'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }
          `}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* QuestionDisplay integrated to show current question */}
      {/* Key prop ensures input clears on navigation */}
      {/* Pass handleAnswerSubmit callback to QuestionDisplay */}
      {/* Apply opacity based on phase */}
      <div style={{ opacity: displayOpacity, pointerEvents: isNavigationDisabled ? 'none' : 'auto' }}>
        <QuestionDisplay
          key={currentQuestionIndex}
          question={currentQuestion}
          questionNumber={currentQuestionIndex + 1}
          totalQuestions={totalQuestions}
          onAnswerSubmit={handleAnswerSubmit}
        />
      </div>

      {/* QuestionGrid integrated with onSelectQuestion handler - moved below answer input */}
      {/* Pass answeredQuestions state to QuestionGrid */}
      {/* Pass collectedLetters to QuestionGrid for display */}
      {/* Apply opacity based on phase */}
      <div style={{ opacity: displayOpacity, pointerEvents: isNavigationDisabled ? 'none' : 'auto' }}>
        <QuestionGrid
          currentQuestionIndex={currentQuestionIndex}
          totalQuestions={totalQuestions}
          onSelectQuestion={handleSelectQuestion}
          answeredQuestions={answeredQuestions}
          questions={questions}
          collectedLetters={collectedLetters}
        />
      </div>

      {/* Add subtle visual spacer between QuestionGrid and FinalAnswerInput */}
      <div className="border-t border-gray-200 py-6"></div>

      {/* Integrate FinalAnswerInput below QuestionGrid */}
      {/* FinalAnswerInput handles win/loss visual feedback and messaging */}
      {/* FinalAnswerInput uses identical styling to QuestionGrid (aspect-square, rounded-lg, border-2, transitions) */}
      <FinalAnswerInput
        value={finalAnswer}
        onChange={setFinalAnswer}
        onSubmit={handleFinalAnswerSubmit}
        gameEnded={gameEnded}
        gameResult={gameResult}
      />

      {/* Integrate TimerPanel component with timer state */}
      <TimerPanel
        mainTimeRemaining={timerState.mainTimeRemaining}
        finalTimeRemaining={timerState.finalTimeRemaining}
        phase={timerState.phase}
        isTimerStopped={timerState.isTimerStopped}
      />
    </div>
  );
}