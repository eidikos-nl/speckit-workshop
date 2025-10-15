# API Contracts: Game Time Limits with Dual Timer Display

**Phase**: 1 (Design)  
**Date**: 2025-10-15

## Overview

This feature is entirely client-side (no new API endpoints required). The timer feature operates within the existing game session state management model using React hooks, custom hooks for timer logic, and local state updates.

## Component Contracts

### TimerPanel Component

**Location**: `app/components/TimerPanel.tsx`

**Purpose**: Display dual countdown timers in a persistent floating panel in the bottom right corner of the screen.

**Props Interface**:
```typescript
interface TimerPanelProps {
  /** Seconds remaining on 10-minute main timer (0-600) */
  mainTimeRemaining: number;
  
  /** Seconds remaining on 2-minute final timer (0-120) */
  finalTimeRemaining: number;
  
  /** Current game phase determining which timer is active */
  phase: GamePhase;
  
  /** Is timer stopped due to successful answer submission? */
  isTimerStopped: boolean;
}
```

**Behavior**:
- Floating panel positioning:
  - Fixed position in bottom-right corner (`fixed bottom-4 right-4`)
  - High z-index (`z-50`) to stay above game content
  - Shadow effect for depth (`shadow-lg`)
  - White background with rounded corners
- Timer display layout:
  - Main timer in top portion of panel
  - Visual separator (subtle horizontal line)
  - Final timer in bottom portion of panel
  - Each timer shows label + formatted time (MM:SS)
- Color urgency indicators:
  - Normal state: `text-gray-900` (dark gray)
  - Urgent state (≤10 seconds): `text-red-600` (red)
  - Inactive timer: `text-gray-400` (light gray)
- Timer states:
  - Active timer: normal/urgent color, counting down
  - Inactive timer: light gray, not counting
  - Stopped timers: frozen at current values

**Output/Rendering**:
```jsx
<div 
  className="fixed bottom-4 right-4 z-50 bg-white rounded-lg shadow-lg p-4"
  data-testid="timer-panel"
>
  <div className="space-y-3">
    {/* Main Timer */}
    <div className="text-center">
      <div className="text-xs text-gray-500 mb-1">Main Timer</div>
      <div 
        className={clsx(
          'text-2xl font-mono font-bold',
          mainTimeRemaining <= 10 && phase === GamePhase.EXPLORATION 
            ? 'text-red-600' 
            : phase === GamePhase.EXPLORATION 
            ? 'text-gray-900' 
            : 'text-gray-400'
        )}
        data-testid="main-timer-display"
      >
        {formatTime(mainTimeRemaining)}
      </div>
    </div>
    
    {/* Separator */}
    <div className="border-t border-gray-200" />
    
    {/* Final Timer */}
    <div className="text-center">
      <div className="text-xs text-gray-500 mb-1">Final Timer</div>
      <div 
        className={clsx(
          'text-2xl font-mono font-bold',
          finalTimeRemaining <= 10 && phase === GamePhase.FINAL_ANSWER 
            ? 'text-red-600' 
            : phase === GamePhase.FINAL_ANSWER 
            ? 'text-gray-900' 
            : 'text-gray-400'
        )}
        data-testid="final-timer-display"
      >
        {formatTime(finalTimeRemaining)}
      </div>
    </div>
  </div>
</div>
```

**Test Selectors** (data-testid):
- `timer-panel`: Container for entire timer panel
- `main-timer-display`: Main timer text display
- `final-timer-display`: Final timer text display

---

### useGameTimer Hook

**Location**: `app/hooks/useGameTimer.ts`

**Purpose**: Manage timer countdown logic, timestamp-based calculation, and phase transitions.

**Signature**:
```typescript
export function useGameTimer(
  mainDuration: number,      // Duration in seconds (e.g., 600)
  finalDuration: number,     // Duration in seconds (e.g., 120)
  isGameActive: boolean,     // Is game currently active?
  onMainTimerExpire: () => void,   // Callback when main timer reaches 0
  onFinalTimerExpire: () => void   // Callback when final timer reaches 0
): {
  mainTimeRemaining: number;
  finalTimeRemaining: number;
  phase: GamePhase;
  stopTimer: () => void;
}
```

**Behavior**:
- Initialization:
  - Starts main timer immediately when `isGameActive` becomes true
  - Records start timestamp for accuracy
  - Sets up 1-second interval
- Countdown logic:
  - Uses timestamp-based calculation (not tick counting)
  - Every second: recalculates remaining time from elapsed time
  - Clamps remaining time to 0 (no negative values)
- Phase transitions:
  - EXPLORATION: main timer active, final timer shows full duration
  - FINAL_ANSWER: main timer at 0, final timer starts counting
  - ENDED: both timers stopped
- Page Visibility API integration:
  - Listens for `visibilitychange` events
  - Recalculates time when tab regains focus
  - Handles timer expiration that occurred while tab was hidden
- Cleanup:
  - Clears interval on unmount
  - Removes event listeners
  - Prevents memory leaks
- Stop functionality:
  - `stopTimer()` freezes both timers at current values
  - Called when valid answer is submitted

**Example Usage**:
```typescript
const GameContainer = () => {
  const { 
    mainTimeRemaining, 
    finalTimeRemaining, 
    phase,
    stopTimer 
  } = useGameTimer(
    600,  // 10 minutes
    120,  // 2 minutes
    gameSession.isActive,
    handleMainTimerExpire,
    handleFinalTimerExpire
  );
  
  // When correct answer submitted:
  const handleCorrectAnswer = () => {
    stopTimer();  // Freeze timers
    setGameResult({ outcome: 'win', ... });
  };
};
```

---

## Function Contracts

### formatTime

**Location**: `lib/timerLogic.ts`

**Signature**:
```typescript
export function formatTime(seconds: number): string
```

**Purpose**: Convert seconds to MM:SS format with zero-padding.

**Behavior**:
- Accepts seconds as input (can be any non-negative number)
- Calculates minutes: `Math.floor(seconds / 60)`
- Calculates remaining seconds: `seconds % 60`
- Formats with zero-padding: `M:SS` or `MM:SS`

**Examples**:
```typescript
formatTime(600)  // "10:00"
formatTime(65)   // "1:05"
formatTime(9)    // "0:09"
formatTime(0)    // "0:00"
formatTime(3661) // "61:01" (hours not shown, just total minutes)
```

**Edge Cases**:
- Negative input: Should be clamped to 0 before calling (handled by caller)
- Large values: Minutes can exceed 99 (no upper limit)
- Zero: Returns "0:00"

---

### calculateRemaining

**Location**: `lib/timerLogic.ts`

**Signature**:
```typescript
export function calculateRemaining(
  startTimestamp: number,  // When timer started (Date.now())
  duration: number,        // Total duration in seconds
  currentTimestamp: number // Current time (Date.now())
): number
```

**Purpose**: Calculate remaining seconds based on elapsed time from start timestamp.

**Behavior**:
- Calculates elapsed milliseconds: `currentTimestamp - startTimestamp`
- Converts to seconds: `Math.floor(elapsed / 1000)`
- Calculates remaining: `duration - elapsedSeconds`
- Clamps to 0 minimum: `Math.max(0, remaining)`

**Examples**:
```typescript
// Timer started 5 minutes ago (300 seconds)
calculateRemaining(
  Date.now() - 300000,  // 5 minutes ago
  600,                  // 10 minute duration
  Date.now()           // Now
)  // Returns 300 (5 minutes remaining)

// Timer started 11 minutes ago (more than duration)
calculateRemaining(
  Date.now() - 660000,  // 11 minutes ago
  600,                  // 10 minute duration
  Date.now()
)  // Returns 0 (clamped)
```

**Edge Cases**:
- Elapsed time exceeds duration: Returns 0
- Start timestamp in future: Returns duration (no time elapsed)
- Timestamp precision: Uses milliseconds but rounds to seconds

---

### determinePhase

**Location**: `lib/timerLogic.ts`

**Signature**:
```typescript
export function determinePhase(
  mainTimeRemaining: number,
  finalTimeRemaining: number,
  isTimerStopped: boolean
): GamePhase
```

**Purpose**: Determine current game phase based on timer states.

**Behavior**:
- If `isTimerStopped` is true: return `GamePhase.ENDED`
- If `mainTimeRemaining > 0`: return `GamePhase.EXPLORATION`
- If `finalTimeRemaining > 0`: return `GamePhase.FINAL_ANSWER`
- Otherwise: return `GamePhase.ENDED`

**Truth Table**:
| mainTime | finalTime | stopped | Result |
|----------|-----------|---------|--------|
| > 0 | any | false | EXPLORATION |
| 0 | > 0 | false | FINAL_ANSWER |
| 0 | 0 | false | ENDED |
| any | any | true | ENDED |

**Examples**:
```typescript
determinePhase(300, 120, false)  // GamePhase.EXPLORATION
determinePhase(0, 85, false)     // GamePhase.FINAL_ANSWER
determinePhase(0, 0, false)      // GamePhase.ENDED
determinePhase(234, 120, true)   // GamePhase.ENDED (stopped)
```

---

## Type Definitions

### lib/types.ts

**New Enum**:
```typescript
export enum GamePhase {
  EXPLORATION = 'exploration',
  FINAL_ANSWER = 'final_answer',
  ENDED = 'ended'
}
```

**New Interface**:
```typescript
export interface TimerState {
  mainTimeRemaining: number;        // 0-600 seconds
  finalTimeRemaining: number;       // 0-120 seconds
  mainTimerStarted: number;         // Unix timestamp (ms)
  finalTimerStarted: number | null; // Unix timestamp (ms) or null
  isTimerStopped: boolean;          // Frozen state
  phase: GamePhase;                 // Current phase
}
```

**GameSession Extension**:
```typescript
export interface GameSession {
  // ... existing fields ...
  timerState: TimerState;
}
```

---

## Integration Points

### GameContainer Updates

**Location**: `app/components/GameContainer.tsx`

**New State**:
```typescript
const [timerState, setTimerState] = useState<TimerState>({
  mainTimeRemaining: 600,
  finalTimeRemaining: 120,
  mainTimerStarted: 0,
  finalTimerStarted: null,
  isTimerStopped: false,
  phase: GamePhase.EXPLORATION
});
```

**Hook Usage**:
```typescript
const { 
  mainTimeRemaining, 
  finalTimeRemaining, 
  phase,
  stopTimer 
} = useGameTimer(
  600,  // 10 minutes
  120,  // 2 minutes
  gameSession.isActive,
  handleMainTimerExpire,
  handleFinalTimerExpire
);

// Update local timerState from hook
useEffect(() => {
  setTimerState(prev => ({
    ...prev,
    mainTimeRemaining,
    finalTimeRemaining,
    phase
  }));
}, [mainTimeRemaining, finalTimeRemaining, phase]);
```

**Event Handlers**:
```typescript
const handleMainTimerExpire = (): void => {
  // Main timer expired, transition to final answer phase
  // Disable navigation, fade UI to 20% opacity
  setNavigationDisabled(true);
  setUIOpacity(0.2);
};

const handleFinalTimerExpire = (): void => {
  // Final timer expired without valid answer
  setGameResult({
    outcome: 'loss',
    correctAnswer: gameSession.selectedQuestionSet!.targetWord,
    playerAnswer: finalAnswer.value || "INCOMPLETE",
    timestamp: Date.now()
  });
  setGameEnded(true);
  // Show message: "The time is up, you lost!"
};

const handleCorrectAnswer = (): void => {
  stopTimer();  // Freeze timers
  setGameResult({
    outcome: 'win',
    correctAnswer: gameSession.selectedQuestionSet!.targetWord,
    playerAnswer: finalAnswer.value,
    timestamp: Date.now()
  });
  setGameEnded(true);
};
```

**Props to Child Components**:
```typescript
// Pass phase to disable navigation
<NavigationChevrons
  disabled={phase !== GamePhase.EXPLORATION}
  ...
/>

// Pass phase for opacity changes
<QuestionDisplay
  opacity={phase === GamePhase.FINAL_ANSWER ? 0.2 : 1.0}
  disabled={phase !== GamePhase.EXPLORATION}
  ...
/>

// Render timer panel
<TimerPanel
  mainTimeRemaining={mainTimeRemaining}
  finalTimeRemaining={finalTimeRemaining}
  phase={phase}
  isTimerStopped={timerState.isTimerStopped}
/>
```

---

## Data Flow Diagram

```
Game Starts
    ↓
GameContainer initializes useGameTimer hook
    ↓
Timer starts: mainTimerStarted = Date.now()
    ↓
Every 1 second:
  - Calculate elapsed = now - startTime
  - Calculate remaining = duration - elapsed
  - Update mainTimeRemaining state
  - Call determinePhase()
    ↓
TimerPanel renders with updated values
  - formatTime(mainTimeRemaining) → "9:59"
  - Check if <= 10s → apply red styling
    ↓
Main Timer Reaches 0:
  - onMainTimerExpire() callback fired
  - finalTimerStarted = Date.now()
  - Phase transitions to FINAL_ANSWER
  - Navigation disabled, UI opacity → 20%
    ↓
Final Timer Counts Down (every 1s):
  - finalTimeRemaining updates
  - TimerPanel shows red when ≤ 10s
    ↓
Outcome Branch 1: Final Timer Expires
  - onFinalTimerExpire() callback fired
  - gameResult.outcome = 'loss'
  - gameEnded = true
  - Message: "The time is up, you lost!"
    ↓
Outcome Branch 2: Valid Answer Submitted
  - stopTimer() called
  - isTimerStopped = true
  - Both timers frozen
  - gameResult.outcome = 'win' or 'loss'
  - gameEnded = true
```

---

## No External API Endpoints

This feature does **not** require backend API changes:
- ✅ Timer logic is client-side (React hooks + pure functions)
- ✅ Game state managed by React hooks (no persistence required)
- ✅ All calculations performed locally
- ✅ No server communication needed

**Note**: If future persistence is needed (save game session with timer state), a new API endpoint could be added without changing this contract.

---

## Accessibility Contracts

- Timer panel has `aria-live="polite"` for screen reader updates
- Each timer has descriptive label ("Main Timer", "Final Timer")
- Color changes paired with time values (not color-only indicators)
- High contrast maintained (red text on white background: 4.5:1 ratio)
- Panel doesn't block critical UI elements
- Focus management not required (display-only component)

---

## Testing Contracts

### Unit Tests (Jest)
File: `__tests__/unit/timerLogic.test.ts`

```typescript
describe('formatTime', () => {
  test('formats 10 minutes correctly', () => {
    expect(formatTime(600)).toBe("10:00");
  });
  
  test('formats 1 minute 5 seconds correctly', () => {
    expect(formatTime(65)).toBe("1:05");
  });
  
  test('formats 9 seconds with zero padding', () => {
    expect(formatTime(9)).toBe("0:09");
  });
  
  test('formats zero correctly', () => {
    expect(formatTime(0)).toBe("0:00");
  });
});

describe('calculateRemaining', () => {
  test('calculates remaining time correctly', () => {
    const start = Date.now() - 300000; // 5 minutes ago
    const remaining = calculateRemaining(start, 600, Date.now());
    expect(remaining).toBe(300);
  });
  
  test('clamps to zero when expired', () => {
    const start = Date.now() - 700000; // 11+ minutes ago
    const remaining = calculateRemaining(start, 600, Date.now());
    expect(remaining).toBe(0);
  });
});

describe('determinePhase', () => {
  test('returns EXPLORATION when main timer active', () => {
    expect(determinePhase(300, 120, false)).toBe(GamePhase.EXPLORATION);
  });
  
  test('returns FINAL_ANSWER when main expired but final active', () => {
    expect(determinePhase(0, 85, false)).toBe(GamePhase.FINAL_ANSWER);
  });
  
  test('returns ENDED when both expired', () => {
    expect(determinePhase(0, 0, false)).toBe(GamePhase.ENDED);
  });
  
  test('returns ENDED when timer stopped', () => {
    expect(determinePhase(234, 120, true)).toBe(GamePhase.ENDED);
  });
});
```

### E2E Tests (Playwright)
File: `__tests__/e2e/timer-display.spec.ts`

```typescript
describe('Timer Display', () => {
  test('timers are visible when game starts', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('start-game-button').click();
    
    // Both timers should be visible
    await expect(page.getByTestId('main-timer-display')).toBeVisible();
    await expect(page.getByTestId('final-timer-display')).toBeVisible();
    
    // Main timer should show 10:00
    await expect(page.getByTestId('main-timer-display')).toHaveText('10:00');
    
    // Final timer should show 2:00
    await expect(page.getByTestId('final-timer-display')).toHaveText('2:00');
  });
  
  test('main timer counts down every second', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('start-game-button').click();
    
    // Wait for timer to tick
    await page.waitForTimeout(1100);
    
    // Main timer should have decreased
    const timerText = await page.getByTestId('main-timer-display').textContent();
    expect(timerText).toMatch(/^9:5[89]$/);  // 9:58 or 9:59
  });
  
  test('timer turns red when 10 seconds or less remain', async ({ page }) => {
    // Note: This test would need to manipulate timer state or wait
    // Implementation detail: check for text-red-600 class
  });
});
```

File: `__tests__/e2e/timer-phase-transition.spec.ts`

```typescript
describe('Timer Phase Transitions', () => {
  test('main timer expiry triggers phase transition', async ({ page }) => {
    // Note: This test would need to either:
    // 1. Set timer to near-expiry state
    // 2. Wait for full 10 minutes (impractical)
    // 3. Use test utilities to fast-forward time
    
    // Verify:
    // - Main timer reaches 0:00
    // - Final timer starts counting down
    // - Navigation becomes disabled
    // - UI opacity changes to 20%
  });
  
  test('final timer expiry shows loss message', async ({ page }) => {
    // Set up test to reach final timer expiry
    // Verify loss message appears
  });
});
```

File: `__tests__/e2e/timer-game-end.spec.ts`

```typescript
describe('Timer Stops on Game End', () => {
  test('timers freeze when correct answer submitted', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('start-game-button').click();
    
    // Type correct answer and submit
    // ...
    
    // Record timer values before submission
    const mainBefore = await page.getByTestId('main-timer-display').textContent();
    const finalBefore = await page.getByTestId('final-timer-display').textContent();
    
    // Submit answer
    await page.getByTestId('final-answer-submit').click();
    
    // Wait a few seconds
    await page.waitForTimeout(3000);
    
    // Verify timers haven't changed (frozen)
    const mainAfter = await page.getByTestId('main-timer-display').textContent();
    const finalAfter = await page.getByTestId('final-timer-display').textContent();
    
    expect(mainAfter).toBe(mainBefore);
    expect(finalAfter).toBe(finalBefore);
  });
});
```

**Test Selectors** (data-testid):
- `timer-panel`: Floating panel container
- `main-timer-display`: Main timer text (MM:SS)
- `final-timer-display`: Final timer text (MM:SS)

---

## UI State Changes by Phase

| Phase | Main Timer | Final Timer | Navigation | Questions/Answers | Final Input |
|-------|------------|-------------|------------|-------------------|-------------|
| EXPLORATION | Active (black/red) | Inactive (gray, shows 2:00) | Enabled | Full opacity, enabled | Enabled |
| FINAL_ANSWER | Stopped (gray, shows 0:00) | Active (black/red) | Disabled | 20% opacity, disabled | Enabled |
| ENDED | Frozen | Frozen | Disabled | 20% opacity, disabled | Locked |

---

## Performance Considerations

**Update Frequency**:
- 1 update per second (1 Hz)
- Minimal CPU impact (<1ms per calculation)
- No performance concerns for gameplay

**Memory Usage**:
- TimerState: ~64 bytes
- Hook overhead: ~100 bytes
- Total: <200 bytes

**Accuracy**:
- Timestamp-based: ±100ms variance
- Independent of interval drift
- Resilient to background tab throttling