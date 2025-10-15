'use client';

import { useState } from 'react';
import { GameSession, CollectedLetters, GameResult } from '@/lib/types';
import { canNavigateNext, canNavigatePrevious } from '@/lib/navigationLogic';
import { validateAnswer, validateFinalAnswer } from '@/lib/validationLogic';
import { QuestionDisplay } from './QuestionDisplay';
import { QuestionGrid } from './QuestionGrid';
import { FinalAnswerInput } from './FinalAnswerInput';

interface GameContainerProps {
  gameSession: GameSession;
  onStopGame: () => void;
}

/**
 * GameContainer manages navigation state and coordinates all navigation components
 * This is the main orchestrator for the question navigation feature
 */
export function GameContainer({ gameSession, onStopGame }: GameContainerProps) {
  // T019: Navigation state management using useState
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // T006: Track which questions have been correctly answered
  // Uses Set<string> where each element is a question ID
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<string>>(new Set());

  // T009: Manage collected letters state - tracks letters revealed by correct answers
  const [collectedLetters, setCollectedLetters] = useState<CollectedLetters>(
    gameSession.collectedLetters
  );

  // T007: Track the final answer value (12-character string for final submission)
  const [finalAnswer, setFinalAnswer] = useState<string>('');

  // T008: Track whether the game has ended (after final answer submission)
  const [gameEnded, setGameEnded] = useState<boolean>(false);

  // T009: Track the result of the final answer submission (win/loss outcome)
  const [gameResult, setGameResult] = useState<GameResult | null>(null);

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

  // T013: Handler for final answer submission
  // Validates the submitted answer, determines win/loss outcome, and ends the game
  // Includes submission guard to prevent duplicate clicks
  const handleFinalAnswerSubmit = () => {
    if (gameEnded || !gameSession.selectedQuestionSet) {
      return; // Prevent duplicate submissions
    }

    const { targetWord } = gameSession.selectedQuestionSet;
    const result = validateFinalAnswer(finalAnswer, targetWord);

    setGameResult(result);
    setGameEnded(true);
  };

  // T020: Navigation handlers
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

  // T034: Handler for direct question selection via grid
  const handleSelectQuestion = (index: number) => {
    if (index >= 0 && index < totalQuestions) {
      setCurrentQuestionIndex(index);
    }
  };

  // T007: Handler for answer submission
  // Validates the submitted answer against the correct answer
  // Returns true if correct, false if incorrect
  // Updates answeredQuestions state if answer is correct
  // T008: Collects letter when answer is correct
  const handleAnswerSubmit = (answer: string): boolean => {
    const validationResult = validateAnswer(answer, currentQuestion.answer);
    if (validationResult.isCorrect) {
      // Add question ID to answered questions set
      setAnsweredQuestions(prev => new Set(prev).add(currentQuestion.id));
      // T008: Update collected letters with the revealed letter for this question
      // Question index is 0-based, but letter positions are 1-12
      const questionPosition = currentQuestionIndex + 1;
      setCollectedLetters(prev => ({
        ...prev,
        [questionPosition]: currentQuestion.revealedLetter,
      }));
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
        <button
          onClick={handlePrevious}
          disabled={!canGoPrevious}
          data-testid="previous-chevron"
          aria-label="Go to previous question"
          className={`
            p-2 rounded-full transition-all duration-200
            ${canGoPrevious
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
        <button
          onClick={handleNext}
          disabled={!canGoNext}
          data-testid="next-chevron"
          aria-label="Go to next question"
          className={`
            p-2 rounded-full transition-all duration-200
            ${canGoNext
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

      {/* T021: QuestionDisplay integrated to show current question */}
      {/* T046: Key prop ensures input clears on navigation */}
      {/* T012: Pass handleAnswerSubmit callback to QuestionDisplay */}
      <QuestionDisplay
        key={currentQuestionIndex}
        question={currentQuestion}
        questionNumber={currentQuestionIndex + 1}
        totalQuestions={totalQuestions}
        onAnswerSubmit={handleAnswerSubmit}
      />

      {/* T034: QuestionGrid integrated with onSelectQuestion handler - moved below answer input */}
      {/* T013: Pass answeredQuestions state to QuestionGrid */}
      {/* T011: Pass collectedLetters to QuestionGrid for display */}
      <QuestionGrid
        currentQuestionIndex={currentQuestionIndex}
        totalQuestions={totalQuestions}
        onSelectQuestion={handleSelectQuestion}
        answeredQuestions={answeredQuestions}
        questions={questions}
        collectedLetters={collectedLetters}
      />

      {/* T031: Add subtle visual spacer between QuestionGrid and FinalAnswerInput */}
      <div className="border-t border-gray-200 py-6"></div>

      {/* T018: Integrate FinalAnswerInput below QuestionGrid */}
      {/* T014-T017: FinalAnswerInput handles win/loss visual feedback and messaging */}
      {/* T032: FinalAnswerInput uses identical styling to QuestionGrid (aspect-square, rounded-lg, border-2, transitions) */}
      <FinalAnswerInput
        value={finalAnswer}
        onChange={setFinalAnswer}
        onSubmit={handleFinalAnswerSubmit}
        gameEnded={gameEnded}
        gameResult={gameResult}
      />
    </div>
  );
}