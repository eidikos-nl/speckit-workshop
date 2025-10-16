'use client';

import { useState, useEffect } from 'react';
import { GameSession, QuestionSet, GamePhase } from '@/lib/types';
import { selectRandomQuestionSet, initializeCollectedLetters } from '@/lib/gameLogic';
import { loadQuestionSets } from '@/lib/questionSets';
import { GameContainer } from './components/GameContainer';

export default function Home() {
  // T027: GameSession state management
  const [gameSession, setGameSession] = useState<GameSession>({
    isActive: false,
    selectedQuestionSet: null,
    collectedLetters: {},
    timerState: {
      mainTimeRemaining: 600,
      finalTimeRemaining: 120,
      mainTimerStarted: Date.now(),
      finalTimerStarted: null,
      isTimerStopped: false,
      phase: GamePhase.EXPLORATION,
    },
    currentScore: 0,
    isFailed: false,
  });

  const [questionSets, setQuestionSets] = useState<QuestionSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load question sets on mount
  useEffect(() => {
    loadQuestionSets()
      .then(sets => {
        setQuestionSets(sets);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // T028: Handle start game function
  const handleStartGame = () => {
    if (questionSets.length === 0) {
      setError('No question sets available');
      return;
    }

    try {
      const selectedSet = selectRandomQuestionSet(questionSets);
      const now = Date.now();
      setGameSession({
        isActive: true,
        selectedQuestionSet: selectedSet,
        collectedLetters: initializeCollectedLetters(),
        timerState: {
          mainTimeRemaining: 600,
          finalTimeRemaining: 120,
          mainTimerStarted: now,
          finalTimerStarted: null,
          isTimerStopped: false,
          phase: GamePhase.EXPLORATION,
        },
        currentScore: 0,
        isFailed: false,
      });
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start game');
    }
  };

  // T037: Handle stop game function
  const handleStopGame = () => {
    setGameSession({
      isActive: false,
      selectedQuestionSet: null,
      collectedLetters: {},
      timerState: {
        mainTimeRemaining: 600,
        finalTimeRemaining: 120,
        mainTimerStarted: Date.now(),
        finalTimerStarted: null,
        isTimerStopped: false,
        phase: GamePhase.EXPLORATION,
      },
      currentScore: 0,
      isFailed: false,
    });
  };

  if (loading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-8">
        <div className="text-xl">Loading question sets...</div>
      </main>
    );
  }

  if (error && questionSets.length === 0) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-8">
        <div className="text-xl text-red-600">Error: {error}</div>
      </main>
    );
  }

  return (
    // T031: Responsive layout with mobile-first styling
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-4xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl sm:text-5xl font-bold text-game-text">
            2 to Twelve
          </h1>
          <p className="text-lg text-gray-600">
            Guess the 12-letter word by answering 12 questions
          </p>
        </div>

        {/* Game Area */}
        <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 space-y-6">
          {!gameSession.isActive ? (
            // Initial state - show start button
            <div className="text-center space-y-4">
              <p className="text-gray-600">
                Ready to test your knowledge? Click below to start a new game!
              </p>
              {/* T029: Start New Game button (visible when !isActive) */}
              {/* T032: Conditional button disabling */}
              <button
                onClick={handleStartGame}
                disabled={gameSession.isActive || loading}
                className="btn-primary"
                aria-label="Start a new game session"
                aria-disabled={gameSession.isActive || loading}
                data-testid="start-game-button"
              >
                Start New Game
              </button>
              {questionSets.length > 0 && (
                <p className="text-sm text-gray-500">
                  {questionSets.length} question sets available
                </p>
              )}
            </div>
          ) : (
            // Active game state - show GameContainer with navigation
            <GameContainer
              gameSession={gameSession}
              onStopGame={handleStopGame}
            />
          )}

          {/* Error display */}
          {error && questionSets.length > 0 && (
            <div className="text-center text-red-600 text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="text-center text-sm text-gray-500">
          <p>Answer 12 general knowledge questions within 12 minutes</p>
        </div>
      </div>
    </main>
  );
}