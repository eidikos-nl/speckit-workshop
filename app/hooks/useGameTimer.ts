'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { TimerState, GamePhase } from '@/lib/types';
import { calculateRemaining, determinePhase } from '@/lib/timerLogic';

/**
 * Return type for useGameTimer hook
 * Extends TimerState with the stopTimer and transitionToFinalAnswer functions
 */
export interface UseGameTimerReturn extends TimerState {
  stopTimer: () => void;
  transitionToFinalAnswer: () => void;
}

/**
 * Custom hook for managing countdown timers with dual-timer support
 *
 * Features:
 * - Timestamp-based calculation for accuracy across tab visibility changes
 * - Page Visibility API integration for recalculation on tab regain
 * - Memory leak prevention via useEffect cleanup
 * - Phase transition logic (EXPLORATION → FINAL_ANSWER → ENDED)
 * - Timer stop functionality for successful answer submissions
 *
 * @param mainDuration - Duration of main timer in seconds (default: 600 = 10 minutes)
 * @param finalDuration - Duration of final timer in seconds (default: 120 = 2 minutes)
 * @param onMainTimerExpire - Callback when main timer reaches 0
 * @param onFinalTimerExpire - Callback when final timer reaches 0
 * @returns Object containing TimerState and stopTimer function
 */
export function useGameTimer(
  mainDuration: number = 600,
  finalDuration: number = 120,
  onMainTimerExpire?: () => void,
  onFinalTimerExpire?: () => void
): UseGameTimerReturn {
  // Initialize timer state with EXPLORATION phase and full durations
  const [timerState, setTimerState] = useState<TimerState>({
    mainTimeRemaining: mainDuration,
    finalTimeRemaining: finalDuration,
    mainTimerStarted: Date.now(),
    finalTimerStarted: null,
    isTimerStopped: false,
    phase: GamePhase.EXPLORATION,
  });

  // Track interval ID for cleanup
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Track whether main timer expiry has been handled (prevent multiple calls)
  const mainTimerExpiredRef = useRef(false);

  // Track whether final timer expiry has been handled (prevent multiple calls)
  const finalTimerExpiredRef = useRef(false);

  // Function to stop both timers (freeze at current values)
  const stopTimer = useCallback(() => {
    setTimerState(prev => ({
      ...prev,
      isTimerStopped: true,
      phase: GamePhase.ENDED,
    }));
  }, []);

  // Function to transition to FINAL_ANSWER phase early (when all questions are answered)
  // Freezes the main timer and starts the final timer
  const transitionToFinalAnswer = useCallback(() => {
    setTimerState(prev => {
      if (prev.finalTimerStarted !== null) {
        return prev; // Already in final answer phase
      }
      const now = Date.now();
      return {
        ...prev,
        finalTimerStarted: now,
        phase: GamePhase.FINAL_ANSWER,
      };
    });
  }, []);

  // Page Visibility API integration for tab focus/blur handling
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Recalculate remaining times based on actual elapsed time
        setTimerState(prev => {
          if (prev.isTimerStopped) {
            return prev; // Don't update if timer is stopped
          }

          const now = Date.now();
          // When transitioning early (all questions answered), freeze main timer at current value
          const newMainRemaining = prev.finalTimerStarted !== null
            ? prev.mainTimeRemaining // Freeze main timer if final timer has started
            : calculateRemaining(prev.mainTimerStarted, mainDuration, now);
          const newFinalRemaining = prev.finalTimerStarted
            ? calculateRemaining(prev.finalTimerStarted, finalDuration, now)
            : finalDuration;

          return {
            ...prev,
            mainTimeRemaining: newMainRemaining,
            finalTimeRemaining: newFinalRemaining,
            phase: determinePhase({
              ...prev,
              mainTimeRemaining: newMainRemaining,
              finalTimeRemaining: newFinalRemaining,
            }),
          };
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [mainDuration, finalDuration]);

  // Main countdown logic with 1000ms updates
  useEffect(() => {
    if (timerState.isTimerStopped) {
      // Don't update if timer is stopped
      return;
    }

    intervalRef.current = setInterval(() => {
      setTimerState(prev => {
        if (prev.isTimerStopped) {
          return prev; // Don't update if timer is stopped
        }

        const now = Date.now();

        // Calculate remaining times based on elapsed time from start timestamps
        // When transitioning early (all questions answered), freeze main timer at current value
        const newMainRemaining = prev.finalTimerStarted !== null 
          ? prev.mainTimeRemaining // Freeze main timer if final timer has started
          : calculateRemaining(prev.mainTimerStarted, mainDuration, now);
        let newFinalRemaining = prev.finalTimeRemaining;

        // If final timer has started (either by main expiry or early transition), calculate final remaining time
        if (prev.finalTimerStarted) {
          newFinalRemaining = calculateRemaining(prev.finalTimerStarted, finalDuration, now);
        }

        const newPhase = determinePhase({
          mainTimeRemaining: newMainRemaining,
          finalTimeRemaining: newFinalRemaining,
          mainTimerStarted: prev.mainTimerStarted,
          finalTimerStarted: prev.finalTimerStarted,
          isTimerStopped: prev.isTimerStopped,
          phase: prev.phase,
        });

        // Handle main timer expiration (transition to FINAL_ANSWER phase)
        if (newMainRemaining === 0 && !mainTimerExpiredRef.current && prev.finalTimerStarted === null) {
          mainTimerExpiredRef.current = true;
          // Trigger main timer expiration callback
          if (onMainTimerExpire) {
            onMainTimerExpire();
          }
        }

        // Handle final timer expiration (game ends)
        if (newFinalRemaining === 0 && !finalTimerExpiredRef.current && prev.finalTimerStarted !== null) {
          finalTimerExpiredRef.current = true;
          // Trigger final timer expiration callback
          if (onFinalTimerExpire) {
            onFinalTimerExpire();
          }
        }

        return {
          ...prev,
          mainTimeRemaining: newMainRemaining,
          finalTimeRemaining: newFinalRemaining,
          // Set finalTimerStarted when main timer reaches 0 (if not already started)
          finalTimerStarted: newMainRemaining === 0 && prev.finalTimerStarted === null ? now : prev.finalTimerStarted,
          phase: newPhase,
        };
      });
    }, 1000);

    // Cleanup function - clear interval on unmount or when timer stops
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [mainDuration, finalDuration, onMainTimerExpire, onFinalTimerExpire, timerState.isTimerStopped]);

  return {
    ...timerState,
    stopTimer,
    transitionToFinalAnswer,
  };
}
