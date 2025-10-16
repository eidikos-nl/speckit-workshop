# Data Model: Scoring System

**Feature**: Implement Scoring System for "2 to Twelve"
**Date**: 2025-10-16
**Status**: Phase 1 Design

## Entity Definitions

### GameScore (Extends GameSession)

**Purpose**: Represents the player's accumulated score throughout a single game session.

**Fields**:
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `currentScore` | `number` | 0 ≤ score ≤ 1200 | Running total points (can vary by game) |
| `isFailed` | `boolean` | true \| false | Indicates if final word guess was failed |

**Invariants**:
- `currentScore` must be ≥ 0 (never negative)
- `currentScore` must be ≤ 1200 (theoretical max: 12 correct × 10 + 600s bonus + 120s bonus)
- `isFailed` is false by default; becomes true only if final word guess fails
- When `isFailed` is true, final score is 0 (regardless of currentScore value)
- Score persists for entire game session (from start until game ends)

**Initial State**:
```typescript
{
  currentScore: 0,
  isFailed: false
}
```

**State Transitions**:
```
[Initial: currentScore=0, isFailed=false]
    ↓
[After correct answer: currentScore += 10]
    ↓
[After incorrect answer: currentScore = Math.max(0, currentScore - 1)]
    ↓
[After 12th correct answer: currentScore += mainTimeRemaining]
    ↓
[If final word correct: currentScore += finalTimeRemaining → GAME_WON]
    ↓
[If final word incorrect: currentScore = 0, isFailed = true → GAME_LOST]
```

---

## Integration With Existing GameSession

### Current GameSession Type
```typescript
export interface GameSession {
  isActive: boolean;
  selectedQuestionSet: QuestionSet | null;
  collectedLetters: CollectedLetters;
  finalAnswer?: FinalAnswer;
  gameResult?: GameResult;
  gameEnded?: boolean;
  timerState: TimerState;
}
```

### Extended GameSession Type (With Scoring)
```typescript
export interface GameSession {
  isActive: boolean;
  selectedQuestionSet: QuestionSet | null;
  collectedLetters: CollectedLetters;
  finalAnswer?: FinalAnswer;
  gameResult?: GameResult;
  gameEnded?: boolean;
  timerState: TimerState;
  // NEW FIELDS:
  currentScore: number;      // Running point total
  isFailed: boolean;         // Whether final word guess failed
}
```

**Rationale for Adding to GameSession**:
1. **Single source of truth**: Score is part of game state, not separate entity
2. **Consistency**: Follows pattern of storing timer state, game phase, etc. in GameSession
3. **Lifecycle tracking**: Score lifetime matches game session (created at start, ends at finish)
4. **Type safety**: GameSession type guard ensures score always present

---

## Scoring Calculation Entities

### AnswerScore
**Purpose**: Encapsulates score change from a single answer submission.

```typescript
interface AnswerScore {
  isCorrect: boolean;
  basePoints: number;      // 10 if correct, -1 if incorrect
  resultingScore: number;  // Math.max(0, currentScore + basePoints)
  timestamp: string;       // ISO 8601
}
```

### PhaseTransitionBonus
**Purpose**: Encapsulates time bonus from phase transitions.

```typescript
interface PhaseTransitionBonus {
  phase: 'exploration_to_final' | 'final_word_submission';
  secondsRemaining: number;
  bonusPoints: number;     // Math.floor(secondsRemaining)
  resultingScore: number;  // score + bonusPoints
  timestamp: string;       // ISO 8601
}
```

### FinalScoreCalculation
**Purpose**: Represents final score determination at game end.

```typescript
interface FinalScoreCalculation {
  gameOutcome: 'win' | 'loss';
  scoreBeforePenalty: number;
  finalScore: number;      // scoreBeforePenalty if win, 0 if loss
  timestamp: string;       // ISO 8601
}
```

---

## Validation Rules

### Score Validation
```typescript
interface ScoreValidation {
  isValid: boolean;
  errors: string[];
}

export function validateScore(score: number): ScoreValidation {
  const errors: string[] = [];
  
  if (!Number.isInteger(score)) {
    errors.push('Score must be an integer');
  }
  if (score < 0) {
    errors.push('Score cannot be negative');
  }
  if (score > 1200) {
    errors.push('Score exceeds theoretical maximum of 1200');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}
```

### GameResult Extension Validation
```typescript
export function validateGameResult(result: GameResult): ScoreValidation {
  const errors: string[] = [];
  
  if (result.outcome === 'loss' && result.finalScore !== 0) {
    errors.push('Final score must be 0 for loss outcome');
  }
  if (!Number.isInteger(result.finalScore)) {
    errors.push('Final score must be an integer');
  }
  if (result.finalScore < 0) {
    errors.push('Final score cannot be negative');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}
```

---

## Relationships

### GameSession → Scoring
```
GameSession
├── currentScore (number)
│   ├── Updated by: Answer validation event
│   ├── Updated by: Phase transition to FINAL_ANSWER
│   ├── Updated by: Final word guess success
│   └── Displayed by: ScorePanel component
├── isFailed (boolean)
│   ├── Updated by: Final word guess failure
│   └── Read by: GameResult calculation
└── gameResult (includes finalScore)
    ├── Set to: 0 if isFailed && outcome = 'loss'
    └── Displayed by: Success message
```

### Data Flow Sequence
```
1. Game starts → currentScore = 0, isFailed = false
2. Answer submitted → currentScore updated (+10 or -1, floored at 0)
3. 12th answer correct → currentScore += mainTimeRemaining
4. Phase: FINAL_ANSWER begins
5. Final word submitted:
   a. If correct → currentScore += finalTimeRemaining → gameResult.finalScore = currentScore
   b. If incorrect → currentScore = 0, isFailed = true → gameResult.finalScore = 0
6. Game ends → Final score displayed in success message
```

---

## Edge Cases Handled

| Scenario | Data Model Handling |
|----------|-------------------|
| Score would go negative | Math.max(0, score - 1) floors at 0 |
| Last second completion | mainTimeRemaining = 1 → +1 bonus |
| Exactly 0 seconds left | mainTimeRemaining = 0 → +0 bonus |
| Final word with 1 second | finalTimeRemaining = 1 → +1 bonus |
| Rapid answer changes | Only latest answer state persists |
| Player fails after 1000 points | currentScore = 0 via isFailed = true |

---

## Type Contracts

All types defined in `lib/types.ts`:

```typescript
// Extend GameSession
export interface GameSession {
  isActive: boolean;
  selectedQuestionSet: QuestionSet | null;
  collectedLetters: CollectedLetters;
  finalAnswer?: FinalAnswer;
  gameResult?: GameResult;
  gameEnded?: boolean;
  timerState: TimerState;
  currentScore: number;      // NEW
  isFailed: boolean;         // NEW
}

// Score validation helper
export function validateScore(score: number): ScoreValidation;
export function validateGameResult(result: GameResult): ScoreValidation;
```

---

## Persistence Scope

**Session-Only Storage**: Score is NOT persisted between game sessions.

- Score exists only in memory for duration of active game
- Page reload resets score to 0
- Browser close removes all game state
- No LocalStorage, no backend database

**Rationale**: Per spec requirements (session-only metric, not persisted between games).

---

## Summary

The scoring system is a lightweight extension to the existing `GameSession` type with:
- **Two new fields**: `currentScore` (number) and `isFailed` (boolean)
- **Clear validation rules**: Score ≥ 0, isFailed true only on final word failure
- **Pure calculation functions**: All score changes are deterministic
- **Integration points**: Triggered by answer validation and phase transitions
- **No new data persistence**: Session-only, in-memory tracking

This design maintains architectural consistency with existing game state management while providing all necessary scoring functionality as specified in FR-001 through FR-013.