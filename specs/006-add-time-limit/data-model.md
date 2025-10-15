# Data Model: Game Time Limits with Dual Timer Display

**Phase**: 1 (Design)  
**Date**: 2025-10-15  
**Status**: Complete

## Entity Definitions

### TimerState

**Purpose**: Represents the current state of both countdown timers including remaining time, active phase, and urgency indicators.

**Fields**:
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `mainTimeRemaining` | `number` | 0-600 seconds | Seconds remaining on 10-minute main timer |
| `finalTimeRemaining` | `number` | 0-120 seconds | Seconds remaining on 2-minute final timer |
| `mainTimerStarted` | `number` | Unix epoch ms | Timestamp when main timer started (for accuracy) |
| `finalTimerStarted` | `number \| null` | Unix epoch ms or null | Timestamp when final timer started (null until main expires) |
| `isTimerStopped` | `boolean` | true/false | Whether timers have been stopped (e.g., correct answer submitted) |
| `phase` | `GamePhase` | enum | Current game phase determining UI state and available actions |

**Validation Rules**:
- `mainTimeRemaining` must be between 0 and 600 (inclusive)
- `finalTimeRemaining` must be between 0 and 120 (inclusive)
- When `phase` is EXPLORATION, `mainTimeRemaining` > 0
- When `phase` is FINAL_ANSWER, `mainTimeRemaining` === 0 and `finalTimeRemaining` > 0
- When `phase` is ENDED, both timers must be 0 or `isTimerStopped` must be true
- `finalTimerStarted` is null when `mainTimeRemaining` > 0
- Once `isTimerStopped` is true, it cannot become false (immutable)

**State Transitions**:
```
INITIALIZATION → EXPLORATION → FINAL_ANSWER → ENDED
                (main timer      (main timer   (final timer expires
                starts at 600s)   reaches 0)    OR valid answer submitted)
                
Alternative path:
EXPLORATION → ENDED (valid answer submitted before main timer expires)
```

**Example - Exploration Phase**:
```typescript
{
  mainTimeRemaining: 420,        // 7 minutes remaining
  finalTimeRemaining: 120,       // Not active yet, shows full time
  mainTimerStarted: 1697385000000,
  finalTimerStarted: null,
  isTimerStopped: false,
  phase: GamePhase.EXPLORATION
}
```

**Example - Final Answer Phase**:
```typescript
{
  mainTimeRemaining: 0,          // Expired
  finalTimeRemaining: 85,        // 1:25 remaining
  mainTimerStarted: 1697385000000,
  finalTimerStarted: 1697385600000,
  isTimerStopped: false,
  phase: GamePhase.FINAL_ANSWER
}
```

**Example - Stopped (Success)**:
```typescript
{
  mainTimeRemaining: 327,        // Frozen at time of submission
  finalTimeRemaining: 120,       // Never activated
  mainTimerStarted: 1697385000000,
  finalTimerStarted: null,
  isTimerStopped: true,
  phase: GamePhase.ENDED
}
```

---

### GamePhase (Enum)

**Purpose**: Defines the three distinct phases of gameplay that determine UI state and player capabilities.

**Values**:
| Value | Description | UI State | Player Actions Available |
|-------|-------------|----------|-------------------------|
| `EXPLORATION` | Main timer active, players exploring questions | All elements enabled, full opacity | Navigate questions, collect letters, view hints |
| `FINAL_ANSWER` | Final timer active, question navigation locked | Questions/answers at 20% opacity, disabled | Submit final answer only |
| `ENDED` | Game concluded (timer expired or answer submitted) | Terminal state | None (game over) |

**Type Definition**:
```typescript
export enum GamePhase {
  EXPLORATION = 'exploration',
  FINAL_ANSWER = 'final_answer',
  ENDED = 'ended'
}
```

**Phase Determination Logic**:
```typescript
function determinePhase(state: TimerState): GamePhase {
  if (state.isTimerStopped) {
    return GamePhase.ENDED;
  }
  
  if (state.mainTimeRemaining > 0) {
    return GamePhase.EXPLORATION;
  }
  
  if (state.finalTimeRemaining > 0) {
    return GamePhase.FINAL_ANSWER;
  }
  
  return GamePhase.ENDED;
}
```

---

### TimerDisplay

**Purpose**: Presentation model for timer UI rendering with formatting and urgency styling.

**Fields**:
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `formattedTime` | `string` | MM:SS format | Formatted display string (e.g., "10:00", "0:09") |
| `isUrgent` | `boolean` | true/false | Whether urgency styling (red text) should be applied |
| `isActive` | `boolean` | true/false | Whether this timer is currently counting down |

**Derivation Rules**:
- `formattedTime`: Calculated from seconds using `formatTime()` function
- `isUrgent`: true when `remainingSeconds <= 10`, false otherwise
- `isActive`: Depends on phase (main active in EXPLORATION, final active in FINAL_ANSWER)

**Example - Normal State**:
```typescript
{
  formattedTime: "7:34",
  isUrgent: false,
  isActive: true
}
```

**Example - Urgent State**:
```typescript
{
  formattedTime: "0:09",
  isUrgent: true,
  isActive: true
}
```

---

## Type Extensions

### Extended GameSession

Extends existing `GameSession` type with timer state:

```typescript
interface GameSession {
  // Existing fields
  isActive: boolean;
  selectedQuestionSet: QuestionSet | null;
  collectedLetters: CollectedLetters;
  finalAnswer?: FinalAnswer;
  gameResult?: GameResult | null;
  gameEnded?: boolean;
  
  // NEW: Timer tracking
  timerState: TimerState;
}
```

**Invariants**:
- When `timerState.phase === GamePhase.ENDED`, `gameEnded` must be true
- When `timerState.isTimerStopped === true`, no further timer updates occur
- `timerState.mainTimeRemaining` and `timerState.finalTimeRemaining` are always >= 0
- Phase transitions are unidirectional (cannot go backward)

---

## Relationships

```
GameSession
  ├── QuestionSet (existing)
  ├── CollectedLetters (existing)
  ├── FinalAnswer (existing)
  ├── GameResult (existing)
  └── TimerState (NEW)
      ├── Controls → GamePhase
      ├── Affects → QuestionDisplay.opacity (20% when phase=FINAL_ANSWER)
      ├── Affects → NavigationChevrons.disabled (true when phase≠EXPLORATION)
      └── Triggers → GameResult (when finalTimeRemaining reaches 0)
```

**Interaction Flow**:
1. Game starts → TimerState initialized with 600s main, 120s final, EXPLORATION phase
2. Every second → mainTimeRemaining decrements, UI updates
3. Main timer reaches 10s → isUrgent=true, text turns red
4. Main timer reaches 0 → Phase transitions to FINAL_ANSWER, finalTimerStarted set
5. Final timer counts down → finalTimeRemaining decrements
6. Final timer reaches 10s → isUrgent=true for final timer
7. Either:
   - Final timer reaches 0 → Phase=ENDED, show loss message
   - Valid answer submitted → isTimerStopped=true, Phase=ENDED, timers frozen

---

## State Lifecycle

### Initialization (Game Start)

```typescript
const gameSession: GameSession = {
  isActive: true,
  selectedQuestionSet: loadedQuestionSet,
  collectedLetters: { 1: null, 2: null, ..., 12: null },
  finalAnswer: { value: "", position: 0, submitted: false, timestamp: null },
  gameResult: null,
  gameEnded: false,
  
  // NEW: Timer initialized
  timerState: {
    mainTimeRemaining: 600,      // 10 minutes
    finalTimeRemaining: 120,     // 2 minutes (not active yet)
    mainTimerStarted: Date.now(),
    finalTimerStarted: null,
    isTimerStopped: false,
    phase: GamePhase.EXPLORATION
  }
};
```

### During Exploration (5:23 remaining)

```typescript
{
  ...gameSession,
  timerState: {
    mainTimeRemaining: 323,      // 5:23
    finalTimeRemaining: 120,     // Still shows full time
    mainTimerStarted: 1697385000000,
    finalTimerStarted: null,
    isTimerStopped: false,
    phase: GamePhase.EXPLORATION
  }
}
```

### Urgency State (Main Timer at 0:09)

```typescript
{
  ...gameSession,
  timerState: {
    mainTimeRemaining: 9,        // URGENT: <10 seconds
    finalTimeRemaining: 120,
    mainTimerStarted: 1697385000000,
    finalTimerStarted: null,
    isTimerStopped: false,
    phase: GamePhase.EXPLORATION
  }
}
// UI renders main timer in red (text-red-600)
```

### Phase Transition (Main Timer Expires)

```typescript
{
  ...gameSession,
  timerState: {
    mainTimeRemaining: 0,        // Expired
    finalTimeRemaining: 120,     // Now active, starts counting
    mainTimerStarted: 1697385000000,
    finalTimerStarted: 1697385600000,  // NEW: timestamp set
    isTimerStopped: false,
    phase: GamePhase.FINAL_ANSWER  // Phase changed
  }
}
// UI: Questions fade to 20% opacity, navigation disabled
```

### Final Answer Phase (0:08 remaining)

```typescript
{
  ...gameSession,
  timerState: {
    mainTimeRemaining: 0,
    finalTimeRemaining: 8,       // URGENT: <10 seconds
    mainTimerStarted: 1697385000000,
    finalTimerStarted: 1697385600000,
    isTimerStopped: false,
    phase: GamePhase.FINAL_ANSWER
  }
}
// UI renders final timer in red (text-red-600)
```

### Time Expiration (Loss Scenario)

```typescript
{
  ...gameSession,
  timerState: {
    mainTimeRemaining: 0,
    finalTimeRemaining: 0,       // Expired
    mainTimerStarted: 1697385000000,
    finalTimerStarted: 1697385600000,
    isTimerStopped: false,       // Not stopped by answer, expired naturally
    phase: GamePhase.ENDED
  },
  gameResult: {
    outcome: 'loss',
    correctAnswer: "WATERMELONS",
    playerAnswer: "INCOMPLETE",  // Or whatever was submitted
    timestamp: 1697385720000
  },
  gameEnded: true
}
// UI displays: "The time is up, you lost!"
```

### Valid Answer Submitted (Win During Exploration)

```typescript
{
  ...gameSession,
  timerState: {
    mainTimeRemaining: 234,      // FROZEN at time of submission
    finalTimeRemaining: 120,     // Never activated
    mainTimerStarted: 1697385000000,
    finalTimerStarted: null,
    isTimerStopped: true,        // Stopped by valid answer
    phase: GamePhase.ENDED
  },
  gameResult: {
    outcome: 'win',
    correctAnswer: "WATERMELONS",
    playerAnswer: "WATERMELONS",
    timestamp: 1697385366000
  },
  gameEnded: true
}
// Timers frozen at "3:54" and "2:00"
```

---

## Validation Rules Summary

| Entity | Rule | Implementation |
|--------|------|-----------------|
| `TimerState.mainTimeRemaining` | 0-600 seconds | Clamped to range in calculation |
| `TimerState.finalTimeRemaining` | 0-120 seconds | Clamped to range in calculation |
| `TimerState.phase` | Derived from time values | Calculated via `determinePhase()` |
| `TimerState.isTimerStopped` | Immutable once true | Set only on successful answer submission |
| `TimerDisplay.formattedTime` | MM:SS format | Generated by `formatTime()` pure function |
| `TimerDisplay.isUrgent` | True when <=10s | Boolean check in component |
| Phase transition | Unidirectional | State machine prevents backward transitions |

---

## Design Patterns Applied

### Single Responsibility
- `TimerState`: Tracks time values only
- `GamePhase`: Defines game state only
- `TimerDisplay`: Presentation formatting only
- Timer calculation logic: Separated to `lib/timerLogic.ts`
- Timer component: Separated to `app/components/TimerPanel.tsx`

### Timestamp-Based Calculation
- Store start timestamps instead of relying on interval ticks
- Calculate remaining time from elapsed time (current - start)
- Ensures accuracy across tab visibility changes and system sleep

### Immutability After Terminal State
- Once `phase = ENDED`, no further timer updates
- Once `isTimerStopped = true`, timers remain frozen
- Terminal states prevent invalid transitions

### Type Safety
- `GamePhase` enum prevents invalid phase values
- TypeScript interfaces enforce timer state structure
- Validation functions return typed results

---

## Edge Cases & Handling

| Scenario | Data Model Impact | Handling |
|----------|------------------|----------|
| Browser tab loses focus | Timer continues via timestamp | Page Visibility API recalculates on focus |
| Main timer expires at exact moment of answer submission | Timer stop takes precedence | Check `isTimerStopped` before phase transition |
| Final timer expires at exact moment of answer submission | Timer expiration takes precedence | Check `finalTimeRemaining === 0` first |
| Page refresh during game | All timer state lost | No persistence; player must restart |
| System clock changes | Timestamp-based calculation affected | Accept as inherent limitation |
| Multiple rapid answer submissions | Only first processed | `isTimerStopped` prevents duplicate processing |

---

## Testing Considerations

### Unit Test Coverage (timerLogic)

**formatTime() tests**:
- `formatTime(600)` → `"10:00"`
- `formatTime(65)` → `"1:05"`
- `formatTime(9)` → `"0:09"`
- `formatTime(0)` → `"0:00"`
- `formatTime(-5)` → `"0:00"` (clamped)

**calculateRemaining() tests**:
- `calculateRemaining(startTime, 600, 300)` → `300` (elapsed 300s, 300s remaining)
- `calculateRemaining(startTime, 600, 700)` → `0` (expired, clamped to 0)

**determinePhase() tests**:
- `determinePhase({ mainTimeRemaining: 300, finalTimeRemaining: 120, isTimerStopped: false })` → `EXPLORATION`
- `determinePhase({ mainTimeRemaining: 0, finalTimeRemaining: 60, isTimerStopped: false })` → `FINAL_ANSWER`
- `determinePhase({ mainTimeRemaining: 0, finalTimeRemaining: 0, isTimerStopped: false })` → `ENDED`
- `determinePhase({ mainTimeRemaining: 300, finalTimeRemaining: 120, isTimerStopped: true })` → `ENDED`

### E2E Test Coverage

**Timer display tests**:
- Game starts → Both timers visible, main at "10:00", final at "2:00"
- Wait 1 second → Main timer updates to "9:59"
- Main timer reaches "0:10" → Text turns red
- Main timer reaches "0:00" → Phase transition, questions fade to 20%, nav disabled

**Phase transition tests**:
- Main timer expires → Final timer activates and counts down
- Final timer reaches "0:10" → Text turns red
- Final timer reaches "0:00" → Loss message displayed

**Timer stop tests**:
- Submit correct answer during exploration → Both timers freeze at current values
- Submit correct answer during final phase → Both timers freeze

**Tab visibility tests**:
- Switch to another tab for 30s → Return → Timer reflects accurate elapsed time
- Switch tabs during urgency period → Return → Red styling still applied if <=10s

---

## Backward Compatibility

Extending `GameSession` type with new field:
```typescript
interface GameSession {
  // Existing fields
  isActive: boolean;
  selectedQuestionSet: QuestionSet | null;
  collectedLetters: CollectedLetters;
  finalAnswer?: FinalAnswer;
  gameResult?: GameResult | null;
  gameEnded?: boolean;
  
  // NEW: Required when game has timer feature
  timerState: TimerState;
}
```

**Migration Strategy**: Existing games without timer state will need to initialize `timerState` when loading. New games automatically include timer state from initialization.

---

## Performance Considerations

**Memory Footprint**:
- TimerState: ~64 bytes (6 primitive fields)
- No arrays or nested structures
- Minimal memory impact

**Update Frequency**:
- 1 update per second per timer
- Negligible CPU impact (<1ms per update)
- No DOM thrashing (React handles batched updates)

**Accuracy**:
- Timestamp-based calculation ensures <100ms variance
- Independent of setInterval drift
- Resilient to tab throttling