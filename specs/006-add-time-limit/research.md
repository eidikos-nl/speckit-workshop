# Research: Game Time Limits with Dual Timer Display

**Feature**: `006-add-time-limit`  
**Date**: 2025-10-15  
**Purpose**: Resolve technical clarifications and establish best practices for timer implementation

## Research Questions

### 1. Browser Tab Focus/Sleep Timer Behavior

**Question**: How should timers behave when browser tab loses focus or device goes to sleep?

**Decision**: Use timestamp-based calculation with Page Visibility API

**Rationale**:
- `setInterval` is throttled or paused when tab is inactive (can be delayed up to 1000ms in background tabs)
- Timestamp-based approach calculates elapsed time from start timestamp, ensuring accuracy regardless of tab state
- Page Visibility API (`document.visibilityState`) allows detection of tab state changes
- When tab regains focus, recalculate remaining time based on actual elapsed time (not interval ticks)

**Implementation Pattern**:
```typescript
// Store start timestamp instead of relying on interval ticks
const startTimestamp = Date.now();
const duration = 600000; // 10 minutes in ms

// In interval callback, calculate remaining time from timestamp
const elapsed = Date.now() - startTimestamp;
const remaining = Math.max(0, duration - elapsed);
```

**Alternatives Considered**:
- Pure `setInterval`: Rejected - unreliable in background tabs
- `requestAnimationFrame`: Rejected - completely stops in background tabs
- Web Workers: Rejected - adds complexity without significant benefit for 1-second granularity

**References**:
- MDN Page Visibility API: https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API
- Background timer throttling: Chrome throttles to 1000ms minimum in background

---

### 2. Timer State Synchronization on Tab Regain

**Question**: What pattern should we use to sync timer state when tab regains focus?

**Decision**: Use `visibilitychange` event listener with timestamp recalculation

**Rationale**:
- Seamless user experience when switching tabs
- No timer jumps or incorrect values
- Handles edge case where tab is inactive for longer than remaining time

**Implementation Pattern**:
```typescript
useEffect(() => {
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      // Recalculate remaining time based on actual elapsed time
      const elapsed = Date.now() - startTimestamp;
      const newRemaining = Math.max(0, duration - elapsed);
      setRemainingTime(newRemaining);
      
      // Check if timer expired while tab was hidden
      if (newRemaining === 0) {
        handleTimerExpired();
      }
    }
  };
  
  document.addEventListener('visibilitychange', handleVisibilityChange);
  return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
}, [startTimestamp, duration]);
```

**Alternatives Considered**:
- No synchronization: Rejected - creates poor UX and inaccurate times
- Pause timer on blur: Rejected - spec requires continuous countdown
- Server-side timer: Rejected - unnecessary complexity for client-only game

---

### 3. Memory Leak Prevention Strategy

**Question**: How do we prevent memory leaks from timer intervals?

**Decision**: Use `useEffect` cleanup function with interval reference tracking

**Rationale**:
- React's useEffect cleanup runs on component unmount and dependency changes
- Storing interval ID in ref allows cleanup even if component unmounts during countdown
- Clear pattern matches React best practices

**Implementation Pattern**:
```typescript
const useGameTimer = (duration: number, onExpire: () => void) => {
  const [remaining, setRemaining] = useState(duration);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  
  useEffect(() => {
    startTimeRef.current = Date.now();
    
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const newRemaining = Math.max(0, duration - elapsed);
      
      setRemaining(newRemaining);
      
      if (newRemaining === 0) {
        clearInterval(intervalRef.current!);
        onExpire();
      }
    }, 1000);
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [duration, onExpire]);
  
  return remaining;
};
```

**Testing Strategy**:
- Unit tests verify cleanup function is called
- E2E tests verify no memory growth during repeated game sessions
- Monitor for interval leaks in browser dev tools

**Alternatives Considered**:
- Manual cleanup tracking: Rejected - more error-prone than useEffect
- No cleanup: Rejected - guaranteed memory leak
- `setTimeout` recursion: Rejected - more complex, similar memory concerns

---

### 4. Timer Update Interval Pattern

**Question**: Should we use `setInterval` or `requestAnimationFrame` for timer updates?

**Decision**: Use `setInterval` with 1000ms updates

**Rationale**:
- Spec requires 1-second granularity (no need for 60fps updates)
- `setInterval` at 1000ms is more battery-efficient than RAF
- Timestamp-based calculation ensures accuracy despite interval variance
- Works reliably with Page Visibility API

**Performance Characteristics**:
- CPU: Minimal (1 calculation per second)
- Memory: ~100 bytes per timer instance
- Battery: Negligible impact with 1s interval

**Alternatives Considered**:
- `requestAnimationFrame`: Rejected - stops completely in background tabs, overkill for 1s updates
- 100ms interval: Rejected - unnecessary CPU usage for 1s granularity
- Server polling: Rejected - network overhead for purely client-side feature

---

### 5. Floating Panel Positioning Strategy

**Question**: What CSS approach ensures the timer panel stays visible and doesn't obstruct gameplay?

**Decision**: Use Tailwind's `fixed` positioning with `bottom-4 right-4` and `z-50`

**Rationale**:
- `position: fixed` keeps panel in viewport regardless of scroll
- Bottom-right corner is standard for non-intrusive UI elements (e.g., chat widgets)
- `z-50` ensures panel renders above game content but below modals (z-50 < z-modal-backdrop)
- Tailwind spacing utilities provide consistent positioning

**Implementation**:
```tsx
<div className="fixed bottom-4 right-4 z-50 bg-white rounded-lg shadow-lg p-4">
  {/* Timer content */}
</div>
```

**Responsive Considerations**:
- Mobile: Same position works, panel is compact enough
- Tablet: No adjustments needed
- Desktop: Ideal positioning

**Alternatives Considered**:
- `position: sticky`: Rejected - requires scroll context, not suitable for floating UI
- Top-right corner: Rejected - conflicts with potential header/nav elements
- Center overlay: Rejected - too intrusive for persistent display

---

### 6. Time Formatting Pattern

**Question**: How should we format MM:SS time display with leading zeros?

**Decision**: Create pure formatting function using modulo arithmetic

**Rationale**:
- Pure function is easily unit-testable
- Zero-padding ensures consistent width (avoids layout shifts)
- Standard approach for countdown timers

**Implementation**:
```typescript
export const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

// Examples:
// formatTime(600) => "10:00"
// formatTime(65)  => "1:05"
// formatTime(9)   => "0:09"
```

**Edge Cases Handled**:
- Negative values: Clamped to 0 before formatting
- Values over 59:59: Minutes can exceed 9 (e.g., "10:00")
- Zero: Displays as "0:00"

**Alternatives Considered**:
- Date objects: Rejected - overkill for simple seconds-to-MM:SS conversion
- Template literals without padding: Rejected - causes layout shift
- External library (e.g., date-fns): Rejected - unnecessary dependency

---

### 7. Color Urgency Indicator Pattern

**Question**: How should we implement the red text color change in last 10 seconds?

**Decision**: Use conditional Tailwind classes with `clsx` utility

**Rationale**:
- Declarative approach matches React patterns
- No animation needed (instant color change)
- Accessible color contrast (red still readable on white background)

**Implementation**:
```tsx
import clsx from 'clsx';

const timerClass = clsx(
  'text-2xl font-mono font-bold',
  remainingSeconds <= 10 ? 'text-red-600' : 'text-gray-900'
);

<span className={timerClass}>
  {formatTime(remainingSeconds)}
</span>
```

**Accessibility Considerations**:
- Red (#DC2626, text-red-600) has 4.5:1 contrast ratio on white background (WCAG AA compliant)
- Color alone doesn't convey critical information (time value still visible)
- Consider adding aria-live region for screen readers

**Alternatives Considered**:
- CSS animation: Rejected - spec requires instant change, not gradual transition
- Pulsing effect: Rejected - not specified, could be distracting
- Multiple color thresholds: Rejected - spec only requires red at <=10s

---

### 8. Game Phase State Management

**Question**: How should we model the exploration vs final answer phase transition?

**Decision**: Use enum-based game phase with derived state

**Rationale**:
- Explicit state machine prevents invalid states
- Single source of truth (main timer value determines phase)
- Easy to test and reason about

**Type Definition**:
```typescript
export enum GamePhase {
  EXPLORATION = 'exploration',  // Main timer active
  FINAL_ANSWER = 'final_answer', // Final timer active
  ENDED = 'ended'               // Game concluded
}

export interface TimerState {
  mainTimeRemaining: number;    // Seconds remaining on main timer
  finalTimeRemaining: number;   // Seconds remaining on final timer
  phase: GamePhase;
  isTimerStopped: boolean;      // True when valid answer submitted
}
```

**Phase Transition Logic**:
```typescript
const determinePhase = (mainTime: number, finalTime: number, stopped: boolean): GamePhase => {
  if (stopped) return GamePhase.ENDED;
  if (mainTime > 0) return GamePhase.EXPLORATION;
  if (finalTime > 0) return GamePhase.FINAL_ANSWER;
  return GamePhase.ENDED;
};
```

**Alternatives Considered**:
- Boolean flags: Rejected - leads to impossible states (both timers active)
- String literals: Rejected - no type safety
- Complex state machine library: Rejected - overkill for 3-state system

---

## Technology Stack Confirmation

**Languages/Frameworks**: TypeScript 5.x, React 18.3.0, Next.js 15.0.0 ✅  
**Styling**: Tailwind CSS with clsx utility ✅  
**State Management**: React hooks (useState, useEffect, useRef) ✅  
**Testing**: Jest (unit), Playwright (E2E) with data-testid selectors ✅

**No new dependencies required** - all functionality achievable with existing stack.

---

## Implementation Priorities

Based on research, implement in this order:

1. **Timer Logic Library** (`lib/timerLogic.ts`):
   - `formatTime()` pure function
   - `calculateRemaining()` timestamp-based calculation
   - Unit tests for edge cases

2. **Custom Hook** (`app/hooks/useGameTimer.ts`):
   - Timestamp-based countdown
   - Page Visibility API integration
   - Cleanup on unmount
   - Unit tests for state transitions

3. **Timer Panel Component** (`app/components/TimerPanel.tsx`):
   - Fixed positioning with Tailwind
   - Conditional red styling
   - data-testid attributes
   - Visual shadow effect

4. **Game Container Integration**:
   - Phase state management
   - Timer stop on answer submission
   - UI opacity changes on phase transition
   - Navigation disabling

5. **E2E Tests**:
   - Timer visibility and updates
   - Phase transitions
   - Color changes
   - Game end scenarios

---

## Open Questions Resolved

All technical clarifications have been addressed. Ready to proceed to Phase 1 (data model and contracts).