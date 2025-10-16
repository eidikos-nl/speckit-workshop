'use client';

import clsx from 'clsx';
import { formatTime } from '@/lib/timerLogic';
import { GamePhase } from '@/lib/types';

interface TimerPanelProps {
  mainTimeRemaining: number;
  finalTimeRemaining: number;
  phase: GamePhase;
  isTimerStopped: boolean;
}

/**
 * TimerPanel displays both countdown timers in a floating panel
 *
 * Features:
 * - Fixed positioning in bottom-right corner (z-50)
 * - Dual timer display: main timer and final timer
 * - Conditional red coloring when time <= 10 seconds
 * - Gray coloring for inactive timers
 * - Shadow effect for visual separation
 * - Accessibility: aria-live and aria-labels
 *
 * @param mainTimeRemaining - Seconds remaining on main timer
 * @param finalTimeRemaining - Seconds remaining on final timer
 * @param phase - Current game phase (EXPLORATION, FINAL_ANSWER, or ENDED)
 * @param isTimerStopped - Whether timers have been stopped (frozen)
 */
export function TimerPanel({
  mainTimeRemaining,
  finalTimeRemaining,
  phase,
}: TimerPanelProps) {
   // Determine styling based on phase and urgency
  const mainTimerIsActive = phase === GamePhase.EXPLORATION;
  const finalTimerIsActive = phase === GamePhase.FINAL_ANSWER;

  const mainTimerIsUrgent = mainTimeRemaining <= 10 && mainTimerIsActive;
  const finalTimerIsUrgent = finalTimeRemaining <= 10 && finalTimerIsActive;

  const mainTimerClass = clsx(
    'text-2xl font-mono font-bold transition-colors duration-200',
    mainTimerIsActive
      ? mainTimerIsUrgent
        ? 'text-red-600'
        : 'text-gray-900'
      : 'text-gray-400'
  );

  const finalTimerClass = clsx(
    'text-2xl font-mono font-bold transition-colors duration-200',
    finalTimerIsActive
      ? finalTimerIsUrgent
        ? 'text-red-600'
        : 'text-gray-900'
      : 'text-gray-400'
  );

  return (
     // Fixed positioning with bottom-right placement and high z-index
    <div
      className="fixed bottom-4 right-4 z-50 bg-white rounded-lg shadow-lg p-4 min-w-[120px]"
      data-testid="timer-panel"
      aria-live="polite"
      aria-label="Game timer display"
    >
      <div className="space-y-3 text-center">
        {/* Main Timer Display */}
         {/* Main timer with data-testid for E2E testing */}
        <div
          className="flex flex-col items-center"
          data-testid="main-timer-display"
        >
          <div
            className={mainTimerClass}
            aria-label={`Main timer: ${formatTime(mainTimeRemaining)}`}
          >
            {formatTime(mainTimeRemaining)}
          </div>
        </div>

        {/* Separator */}
        <div className="border-t border-gray-300"></div>

        {/* Final Timer Display */}
         {/* Final timer with data-testid for E2E testing */}
        <div
          className="flex flex-col items-center"
          data-testid="final-timer-display"
        >
          <div
            className={finalTimerClass}
            aria-label={`Final timer: ${formatTime(finalTimeRemaining)}`}
          >
            {formatTime(finalTimeRemaining)}
          </div>
        </div>
      </div>
    </div>
  );
}
