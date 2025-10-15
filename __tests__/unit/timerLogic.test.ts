import { formatTime, calculateRemaining, determinePhase } from '@/lib/timerLogic';
import { GamePhase, TimerState } from '@/lib/types';

describe('formatTime', () => {
  // T007: formatTime with various inputs
  it('should format 600 seconds to "10:00"', () => {
    expect(formatTime(600)).toBe('10:00');
  });

  it('should format 65 seconds to "1:05"', () => {
    expect(formatTime(65)).toBe('1:05');
  });

  it('should format 9 seconds to "0:09"', () => {
    expect(formatTime(9)).toBe('0:09');
  });

  it('should format 0 seconds to "0:00"', () => {
    expect(formatTime(0)).toBe('0:00');
  });

  it('should format 120 seconds to "2:00"', () => {
    expect(formatTime(120)).toBe('2:00');
  });

  it('should format 59 seconds to "0:59"', () => {
    expect(formatTime(59)).toBe('0:59');
  });

  it('should format 60 seconds to "1:00"', () => {
    expect(formatTime(60)).toBe('1:00');
  });

  it('should format 121 seconds to "2:01"', () => {
    expect(formatTime(121)).toBe('2:01');
  });

  it('should clamp negative values to "0:00"', () => {
    expect(formatTime(-5)).toBe('0:00');
    expect(formatTime(-100)).toBe('0:00');
  });

  it('should handle large values (over 1 hour)', () => {
    expect(formatTime(3661)).toBe('61:01');
  });
});

describe('calculateRemaining', () => {
  // T008: calculateRemaining with timestamp-based calculation
  it('should calculate remaining time correctly when timer just started', () => {
    const now = Date.now();
    const remaining = calculateRemaining(now, 600, now);
    expect(remaining).toBe(600);
  });

  it('should calculate remaining time after elapsed time', () => {
    const now = Date.now();
    const startTime = now - 300000; // 300 seconds ago
    const remaining = calculateRemaining(startTime, 600, now);
    expect(remaining).toBe(300);
  });

  it('should clamp to 0 when elapsed time exceeds duration', () => {
    const now = Date.now();
    const startTime = now - 700000; // 700 seconds ago (more than 600s duration)
    const remaining = calculateRemaining(startTime, 600, now);
    expect(remaining).toBe(0);
  });

  it('should work with 120 second duration (final timer)', () => {
    const now = Date.now();
    const startTime = now - 60000; // 60 seconds ago
    const remaining = calculateRemaining(startTime, 120, now);
    expect(remaining).toBe(60);
  });

  it('should use current time when not provided', () => {
    const past = Date.now() - 300000; // 300 seconds ago
    const remaining = calculateRemaining(past, 600);
    // Should be approximately 300 (allow some margin for test execution time)
    expect(remaining).toBeGreaterThanOrEqual(298);
    expect(remaining).toBeLessThanOrEqual(300);
  });

  it('should round down fractional seconds', () => {
    const now = Date.now();
    const startTime = now - 301500; // 301.5 seconds ago (rounds to 301, remaining 299)
    const remaining = calculateRemaining(startTime, 600, now);
    expect(remaining).toBe(299); // Should round down
  });
});

describe('determinePhase', () => {
  // T009: determinePhase with all phase state combinations

  // Exploration phase tests
  it('should return EXPLORATION when mainTimeRemaining > 0', () => {
    const state: TimerState = {
      mainTimeRemaining: 300,
      finalTimeRemaining: 120,
      mainTimerStarted: Date.now(),
      finalTimerStarted: null,
      isTimerStopped: false,
      phase: GamePhase.EXPLORATION,
    };
    expect(determinePhase(state)).toBe(GamePhase.EXPLORATION);
  });

  it('should return EXPLORATION when mainTimeRemaining is 1', () => {
    const state: TimerState = {
      mainTimeRemaining: 1,
      finalTimeRemaining: 120,
      mainTimerStarted: Date.now(),
      finalTimerStarted: null,
      isTimerStopped: false,
      phase: GamePhase.EXPLORATION,
    };
    expect(determinePhase(state)).toBe(GamePhase.EXPLORATION);
  });

  // Final answer phase tests
  it('should return FINAL_ANSWER when mainTimeRemaining === 0 and finalTimeRemaining > 0', () => {
    const state: TimerState = {
      mainTimeRemaining: 0,
      finalTimeRemaining: 60,
      mainTimerStarted: Date.now(),
      finalTimerStarted: Date.now(),
      isTimerStopped: false,
      phase: GamePhase.FINAL_ANSWER,
    };
    expect(determinePhase(state)).toBe(GamePhase.FINAL_ANSWER);
  });

  it('should return FINAL_ANSWER when finalTimeRemaining is 1', () => {
    const state: TimerState = {
      mainTimeRemaining: 0,
      finalTimeRemaining: 1,
      mainTimerStarted: Date.now(),
      finalTimerStarted: Date.now(),
      isTimerStopped: false,
      phase: GamePhase.FINAL_ANSWER,
    };
    expect(determinePhase(state)).toBe(GamePhase.FINAL_ANSWER);
  });

  // Ended phase tests (by expiration)
  it('should return ENDED when both timers are 0', () => {
    const state: TimerState = {
      mainTimeRemaining: 0,
      finalTimeRemaining: 0,
      mainTimerStarted: Date.now(),
      finalTimerStarted: Date.now(),
      isTimerStopped: false,
      phase: GamePhase.ENDED,
    };
    expect(determinePhase(state)).toBe(GamePhase.ENDED);
  });

  // Ended phase tests (by timer stopped)
  it('should return ENDED when isTimerStopped is true (stopped during exploration)', () => {
    const state: TimerState = {
      mainTimeRemaining: 300,
      finalTimeRemaining: 120,
      mainTimerStarted: Date.now(),
      finalTimerStarted: null,
      isTimerStopped: true,
      phase: GamePhase.ENDED,
    };
    expect(determinePhase(state)).toBe(GamePhase.ENDED);
  });

  it('should return ENDED when isTimerStopped is true (stopped during final answer)', () => {
    const state: TimerState = {
      mainTimeRemaining: 0,
      finalTimeRemaining: 60,
      mainTimerStarted: Date.now(),
      finalTimerStarted: Date.now(),
      isTimerStopped: true,
      phase: GamePhase.ENDED,
    };
    expect(determinePhase(state)).toBe(GamePhase.ENDED);
  });

  // Priority tests: isTimerStopped takes precedence
  it('should prioritize isTimerStopped over time values', () => {
    const state: TimerState = {
      mainTimeRemaining: 300,
      finalTimeRemaining: 120,
      mainTimerStarted: Date.now(),
      finalTimerStarted: null,
      isTimerStopped: true,
      phase: GamePhase.ENDED,
    };
    expect(determinePhase(state)).toBe(GamePhase.ENDED);
  });

  // Precedence tests: mainTime takes precedence over finalTime
  it('should prioritize mainTimeRemaining over finalTimeRemaining', () => {
    const state: TimerState = {
      mainTimeRemaining: 100,
      finalTimeRemaining: 120,
      mainTimerStarted: Date.now(),
      finalTimerStarted: null,
      isTimerStopped: false,
      phase: GamePhase.EXPLORATION,
    };
    expect(determinePhase(state)).toBe(GamePhase.EXPLORATION);
  });
});
