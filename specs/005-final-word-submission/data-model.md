# Data Model: Final Word Submission

**Phase**: 1 (Design)  
**Date**: 2025-10-15  
**Status**: Complete

## Entity Definitions

### FinalAnswer

**Purpose**: Represents the player's 12-letter word submission attempt.

**Fields**:
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `value` | `string` | Exactly 12 letters, A-Z only, uppercase | The submitted final word |
| `position` | `number` | 0-11 | Current input cursor position within the 12 boxes |
| `submitted` | `boolean` | true/false | Whether this answer has been locked in (submitted) |
| `timestamp` | `number` | Unix epoch ms | When the answer was submitted (if submitted=true) |

**Validation Rules**:
- Length must be exactly 12 characters for submission (editable up to 12)
- Only alphabetic characters allowed (A-Z, converted to uppercase)
- Non-submitted answers may have fewer than 12 characters
- Once submitted, answer becomes immutable
- Must be case-insensitive for comparison against target word

**State Transitions**:
```
EMPTY → EDITING → FULL (12 chars) → SUBMITTED → LOCKED
       (add letter)  (add letter)  (user clicks submit)
       ← (backspace allows return)
```

**Example**:
```typescript
{
  value: "WATERMELONS",
  position: 11,
  submitted: false,
  timestamp: null
}
```

---

### GameResult

**Purpose**: Outcome of the final answer submission and terminal game state.

**Fields**:
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `outcome` | `'win' \| 'loss' \| null` | Enumerated | Result of final answer validation |
| `correctAnswer` | `string` | 12 letters | The target word for reference |
| `playerAnswer` | `string` | 12 letters | What the player submitted |
| `timestamp` | `number` | Unix epoch ms | When the game ended |

**Validation Rules**:
- `outcome` is null until final answer submitted
- Once set to 'win' or 'loss', game becomes terminal (no further input accepted)
- Comparison is case-insensitive despite uppercase storage

**Example - Win**:
```typescript
{
  outcome: 'win',
  correctAnswer: "WATERMELONS",
  playerAnswer: "WATERMELONS",
  timestamp: 1697385372000
}
```

**Example - Loss**:
```typescript
{
  outcome: 'loss',
  correctAnswer: "WATERMELONS",
  playerAnswer: "BANANASPLIT",
  timestamp: 1697385375000
}
```

---

## Type Extensions

### Extended GameSession

Extends existing `GameSession` type with final answer fields:

```typescript
interface GameSession {
  // Existing fields
  isActive: boolean;
  selectedQuestionSet: QuestionSet | null;
  collectedLetters: CollectedLetters;
  
  // NEW: Final answer tracking
  finalAnswer: FinalAnswer;
  gameResult: GameResult | null;
  gameEnded: boolean;
}
```

**Invariants**:
- When `gameEnded` is true, `gameResult` must not be null
- When `gameEnded` is false, `gameResult` should be null
- `finalAnswer.submitted` aligns with `gameEnded` state

---

## Relationships

```
GameSession
  ├── QuestionSet (existing)
  ├── CollectedLetters (existing)
  ├── FinalAnswer (NEW)
  │   └── Related to: QuestionSet.targetWord (comparison target)
  └── GameResult (NEW)
      ├── References: FinalAnswer.value
      └── References: QuestionSet.targetWord
```

**Interaction Flow**:
1. Player navigates questions and collects letters (existing)
2. Player clicks on FinalAnswer input area → `FinalAnswer` created, `position = 0`
3. Player types letters → `FinalAnswer.value` updates, letters distributed to 12 boxes
4. Player presses backspace → `FinalAnswer.value` shortened, `position` decremented
5. Player submits (12 letters only) → Validation occurs:
   - If matches `QuestionSet.targetWord`: `GameResult.outcome = 'win'`, boxes turn green
   - If not match: `GameResult.outcome = 'loss'`, boxes turn red
6. `gameEnded = true` → UI frozen, no further interaction allowed

---

## State Lifecycle

### Initialization

```typescript
// When game starts (existing)
const gameSession: GameSession = {
  isActive: true,
  selectedQuestionSet: loadedQuestionSet,
  collectedLetters: { 1: null, 2: null, ..., 12: null },
  
  // NEW: Final answer not yet started
  finalAnswer: {
    value: "",
    position: 0,
    submitted: false,
    timestamp: null
  },
  gameResult: null,
  gameEnded: false
};
```

### During Gameplay

After player types "WAT" in final answer boxes:
```typescript
{
  ...gameSession,
  finalAnswer: {
    value: "WAT",
    position: 3,
    submitted: false,
    timestamp: null
  },
  gameResult: null,
  gameEnded: false
}
```

### Upon Submission (Win Scenario)

```typescript
{
  ...gameSession,
  finalAnswer: {
    value: "WATERMELONS",
    position: 12,
    submitted: true,
    timestamp: 1697385372000
  },
  gameResult: {
    outcome: 'win',
    correctAnswer: "WATERMELONS",
    playerAnswer: "WATERMELONS",
    timestamp: 1697385372000
  },
  gameEnded: true
}
```

### Upon Submission (Loss Scenario)

```typescript
{
  ...gameSession,
  finalAnswer: {
    value: "BANANASPLIT",
    position: 12,
    submitted: true,
    timestamp: 1697385375000
  },
  gameResult: {
    outcome: 'loss',
    correctAnswer: "WATERMELONS",
    playerAnswer: "BANANASPLIT",
    timestamp: 1697385375000
  },
  gameEnded: true
}
```

---

## Validation Rules Summary

| Entity | Rule | Implementation |
|--------|------|-----------------|
| `FinalAnswer.value` | Only A-Z letters | Input filter in component (only alphabetic keys accepted) |
| `FinalAnswer.value` | Max 12 characters | Length check before adding character |
| `FinalAnswer` | Immutable after submit | Component disables input when `gameEnded = true` |
| `GameResult.outcome` | Must be win or loss | Comparison function returns one of two values |
| `GameResult.playerAnswer` | Case-insensitive match | Both normalized to uppercase before comparison |
| `GameSession` | Consistent state | GameContainer manages all transitions |

---

## Design Patterns Applied

### Single Responsibility
- `FinalAnswer`: Tracks input state only
- `GameResult`: Tracks outcome only
- Validation logic: Separated to `lib/validationLogic.ts`
- UI rendering: Separated to `FinalAnswerInput.tsx` component

### Immutability After Terminal State
- Once `gameEnded = true`, all input disabled
- `finalAnswer.submitted` lock prevents re-editing
- `gameResult` is immutable record of what happened

### Type Safety
- Explicit TypeScript interfaces prevent invalid state combinations
- Union type for `outcome` (`'win' | 'loss' | null`) prevents invalid values
- Validation functions return typed results

---

## Edge Cases & Handling

| Scenario | Data Model Impact | Handling |
|----------|------------------|----------|
| Player submits with <12 letters | Cannot occur; submit button disabled | UI validation in component |
| Player types non-alphabetic | Rejected by input filter | onKeyDown handler prevents input |
| Player submits duplicate answer (multiple rapid clicks) | Only first submission processed | `submitted = true` prevents second call |
| Player wins then tries more input | Input disabled via `gameEnded` flag | Component renders read-only UI |

---

## Testing Considerations

### Unit Test Coverage (validationLogic)
- `validateFinalAnswer("WATERMELONS", "WATERMELONS")` → `{ outcome: 'win' }`
- `validateFinalAnswer("WATERMELONS", "BANANASPLIT")` → `{ outcome: 'loss' }`
- `validateFinalAnswer("watermelons", "WATERMELONS")` → `{ outcome: 'win' }` (case-insensitive)
- `validateFinalAnswer("", "WATERMELONS")` → Error (handled by UI, not here)

### E2E Test Coverage
- Type 12 letters sequentially into boxes → All appear in order
- Backspace after typing → Letter removed from end, position decremented
- Submit correct answer → Green boxes, victory message
- Submit incorrect answer → Red boxes, loss message
- Try to type after game ended → No input accepted

---

## Backward Compatibility

Extending `GameSession` type with new fields (marked as optional for backward compatibility):
```typescript
interface GameSession {
  // Existing fields
  isActive: boolean;
  selectedQuestionSet: QuestionSet | null;
  collectedLetters: CollectedLetters;
  
  // NEW: Optional for backward compatibility but logically required when feature is active
  finalAnswer?: FinalAnswer;      // Optional for existing code, required when game supports final answer
  gameResult?: GameResult | null; // Optional for existing code, required when game ends
  gameEnded?: boolean;            // Optional for existing code, defaults to false
}
```

**Note**: While TypeScript types show these as optional (`?`), the implementation should treat them as conceptually required when the final answer feature is used. The optional syntax is only for backward compatibility with existing code that doesn't yet use this feature.

Existing code that doesn't use final answer feature continues to work. New code explicitly handles these fields when needed.