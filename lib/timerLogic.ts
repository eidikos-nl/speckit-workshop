/**
 * Pure timer logic functions for countdown timer calculations
 *
 * These functions are stateless and used for:
 * - Formatting time values for display
 * - Calculating remaining time based on timestamps
 * - Determining current game phase from timer state
 */

import { TimerState, GamePhase } from './types';

/**
 * Formats seconds into MM:SS display format with leading zeros
 *
 * @param seconds - Number of seconds to format
 * @returns Formatted time string in MM:SS format (e.g., "10:00", "0:09")
 *
 * @example
 * formatTime(600) // "10:00"
 * formatTime(65)  // "1:05"
 * formatTime(9)   // "0:09"
 * formatTime(0)   // "0:00"
 */
export const formatTime = (seconds: number): string => {
  const clampedSeconds = Math.max(0, seconds);
  const minutes = Math.floor(clampedSeconds / 60);
  const remainingSeconds = clampedSeconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

/**
 * Calculates remaining time based on elapsed time from start timestamp
 *
 * This function handles:
 * - Timestamp-based calculation for accuracy across tab visibility changes
 * - Clamping result to 0 (prevents negative values)
 * - Works independently of setInterval delays
 *
 * @param startTimestamp - Unix timestamp in milliseconds when timer started
 * @param duration - Total duration in seconds
 * @param currentTime - Current time in milliseconds (defaults to Date.now())
 * @returns Remaining seconds clamped to range [0, duration]
 *
 * @example
 * const start = Date.now();
 * calculateRemaining(start, 600) // ~600 if called immediately
 * // After 300 seconds pass:
 * calculateRemaining(start, 600) // ~300
 * // After 700 seconds pass (past expiry):
 * calculateRemaining(start, 600) // 0 (clamped)
 */
export const calculateRemaining = (
  startTimestamp: number,
  duration: number,
  currentTime: number = Date.now()
): number => {
  const elapsedMs = currentTime - startTimestamp;
  const elapsedSeconds = Math.floor(elapsedMs / 1000);
  const remaining = Math.max(0, duration - elapsedSeconds);
  return remaining;
};

/**
 * Determines the current game phase based on timer state
 *
 * Phase transition logic:
 * - If isTimerStopped: return ENDED (terminal state)
 * - If mainTimeRemaining > 0: return EXPLORATION (main timer active)
 * - If finalTimeRemaining > 0: return FINAL_ANSWER (final timer active)
 * - Otherwise: return ENDED (both timers expired)
 *
 * @param timerState - Current timer state
 * @returns Current GamePhase
 *
 * @example
 * // Exploration phase
 * determinePhase({ mainTimeRemaining: 300, finalTimeRemaining: 120, isTimerStopped: false })
 * // Returns: GamePhase.EXPLORATION
 *
 * // Final answer phase
 * determinePhase({ mainTimeRemaining: 0, finalTimeRemaining: 60, isTimerStopped: false })
 * // Returns: GamePhase.FINAL_ANSWER
 *
 * // Ended phase (by expiration)
 * determinePhase({ mainTimeRemaining: 0, finalTimeRemaining: 0, isTimerStopped: false })
 * // Returns: GamePhase.ENDED
 *
 * // Ended phase (by successful submission)
 * determinePhase({ mainTimeRemaining: 300, finalTimeRemaining: 120, isTimerStopped: true })
 * // Returns: GamePhase.ENDED
 */
export const determinePhase = (timerState: TimerState): GamePhase => {
  if (timerState.isTimerStopped) {
    return GamePhase.ENDED;
  }

  if (timerState.mainTimeRemaining > 0) {
    return GamePhase.EXPLORATION;
  }

  if (timerState.finalTimeRemaining > 0) {
    return GamePhase.FINAL_ANSWER;
  }

  return GamePhase.ENDED;
};
