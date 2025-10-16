# API Contracts: Scoring System

**Feature**: Implement Scoring System for "2 to Twelve"
**Date**: 2025-10-16

## Overview

This directory contains TypeScript type contracts for the scoring system feature. All types are defined in the main `lib/types.ts` file to maintain a single source of truth for game state.

## Type Contracts

### GameSession (Extended)

**Location**: [`lib/types.ts`](../../lib/types.ts)

**Extension**:
```typescript
interface GameSession {
  // Existing fields...
  isActive: boolean;
  selectedQuestionSet: QuestionSet | null;
  collectedLetters: CollectedLetters;
  finalAnswer?: FinalAnswer;
  gameResult?: GameResult;
  gameEnded?: boolean;
  timerState: TimerState;
  
  // NEW SCORING FIELDS:
  currentScore: number;     // Running point total (0-1200)
  isFailed: boolean;        // True if final word guess failed
}
```

**Field Descriptions**:
- `currentScore`: Integer tracking accumulated points from all sources:
  - +10 for each correct answer
  - -1 for each incorrect answer (minimum 0)
  - +N for remaining seconds when completing 12 questions
  - +N for remaining seconds when guessing final word correctly
  - Set to 0 if final word guess fails

- `isFailed`: Boolean flag indicating game loss status:
  - `false` by default
  - `true` only when final word guess fails and timer expires
  - Used to enforce score reset to 0 on loss

---

## Validation Contracts

### validateScore

```typescript
export function validateScore(score: number): ScoreValidation;

interface ScoreValidation {
  isValid: boolean;
  errors: string[];
}
```

**Purpose**: Validates a score value against business rules.

**Rules**:
- Must be an integer (no decimals)
- Must be ≥ 0 (non-negative)
- Must be ≤ 1200 (theoretical maximum)

**Returns**: Object with `isValid` boolean and `errors` array (empty if valid).

**Example**:
```typescript
const result = validateScore(-1);
// { isValid: false, errors: ['Score cannot be negative'] }
```

---

### validateGameResult

```typescript
export function validateGameResult(result: GameResult): ScoreValidation;
```

**Purpose**: Validates GameResult including final score calculation.

**Rules**:
- If outcome is 'loss', finalScore must be 0
- finalScore must be an integer
- finalScore must be ≥ 0
- finalScore must be ≤ 1200

**Returns**: Same as validateScore (isValid + errors array).

**Example**:
```typescript
const result = validateGameResult({
  outcome: 'loss',
  finalScore: 250,  // ERROR: loss should have finalScore: 0
  correctAnswer: 'COMPUTERSCIENCE',
  playerAnswer: 'WRONGGUESS',
  timestamp: '2025-10-16T15:50:00Z'
});
// { isValid: false, errors: ['Final score must be 0 for loss outcome'] }
```

---

## Component Props Contracts

### ScorePanel

```typescript
interface ScorePanelProps {
  score: number;           // Current score value
  dataTestId?: string;     // For E2E testing (default: 'score-panel')
}

// Usage:
<ScorePanel score={gameSession.currentScore} dataTestId="score-panel" />
```

**Requirements**:
- Must display score value below divider
- Must display "Score" label above divider
- Must match styling of existing TimerPanel (lower left positioning, same visual treatment)

---

### SuccessMessage (Extended)

```typescript
interface SuccessMessageProps {
  // Existing props...
  gameResult: GameResult;  // Includes finalScore
  
  // New requirement:
  // Success message MUST include finalScore in displayed text
}

// Example display:
// "Congratulations! You completed the game with a final score of 450!"
```

---

## State Update Contracts

### Answer Submission Handler

```typescript
type HandleAnswerSubmit = (
  isCorrect: boolean,
  gameSession: GameSession
) => GameSession;

// Pseudo-implementation showing contract:
function handleAnswerSubmit(isCorrect: boolean, session: GameSession): GameSession {
  const basePoints = isCorrect ? 10 : -1;
  const newScore = Math.max(0, session.currentScore + basePoints);
  
  return {
    ...session,
    currentScore: newScore,
    // ... other updates
  };
}
```

**Contract**: Returns updated GameSession with modified `currentScore`.

---

### Phase Transition Handler (Exploration → Final Answer)

```typescript
type HandlePhaseTransition = (
  fromPhase: GamePhase,
  toPhase: GamePhase,
  gameSession: GameSession
) => GameSession;

// When transitioning from EXPLORATION to FINAL_ANSWER with all 12 answers correct:
// - Add mainTimeRemaining as bonus points to currentScore
```

**Contract**: If transitioning to FINAL_ANSWER and all questions answered correctly, add time bonus.

---

### Final Word Submission Handler

```typescript
type HandleFinalWordSubmit = (
  isCorrect: boolean,
  finalTimeRemaining: number,
  gameSession: GameSession
) => GameSession;

// If correct:
//   - Add finalTimeRemaining as bonus to currentScore
//   - Set gameResult.finalScore = currentScore
//   - Set isFailed = false
// If incorrect:
//   - Set currentScore = 0
//   - Set isFailed = true
//   - Set gameResult.finalScore = 0
```

**Contract**: Updates score and sets isFailed flag appropriately.

---

## Data Type Hierarchy

```
GameSession
├── currentScore: number
├── isFailed: boolean
└── gameResult: GameResult
    ├── outcome: 'win' | 'loss'
    └── finalScore: number (0 if loss, ≥ 0 if win)
```

---

## Testing Contracts

### Unit Test Expectations

```typescript
describe('Score Calculations', () => {
  // Correct answer: +10 points
  expect(calculateAnswerScore(true, 100)).toBe(110);
  
  // Incorrect answer: -1 point
  expect(calculateAnswerScore(false, 100)).toBe(99);
  
  // Incorrect answer at 0: stays at 0
  expect(calculateAnswerScore(false, 0)).toBe(0);
  
  // Time bonus: add seconds
  expect(addTimeBonus(100, 50)).toBe(150);
  
  // Final loss: reset to 0
  expect(calculateFinalScore(500, false)).toBe(0);
  
  // Final win: preserve score
  expect(calculateFinalScore(500, true)).toBe(500);
});
```

---

### E2E Test Expectations

```typescript
// Score panel appears and updates
- Score panel visible at start (0 points)
- Score increases by 10 after correct answer
- Score decreases by 1 after incorrect answer
- Score bonus applied after 12th correct answer
- Score bonus applied after correct final word
- Score reset to 0 after incorrect final word
- Final score displayed in success message
```

---

## References

- **Data Model**: [`data-model.md`](./data-model.md)
- **Implementation Research**: [`research.md`](./research.md)
- **Feature Specification**: [`spec.md`](./spec.md)
- **Type Definitions**: [`lib/types.ts`](../../lib/types.ts)