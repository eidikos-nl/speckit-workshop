# Data Model: Letter Collection Display

**Feature**: 004-letter-collection-we  
**Date**: 2025-10-15  

## Core Entities

### 1. CollectedLetters

**Purpose**: Track which letters have been collected from correctly answered questions during a game session.

**Type Definition**:
```typescript
type CollectedLetters = Record<number, string | null>;
// Example: { 1: 'S', 2: null, 3: 'E', 4: null, ..., 12: 'D' }
// Question number → collected letter (or null if unanswered)
```

**Properties**:
| Key | Type | Description | Constraints |
|-----|------|-------------|-------------|
| `[1-12]` | `string \| null` | Collected letter for question N, or null if unanswered | Single uppercase character or null; initialized as null |

**Lifecycle**:
- **Initialization**: All values set to `null` when new game starts
- **Update**: When correct answer validated, corresponding entry updated with letter character
- **Persistence**: Maintained throughout game session (across multiple question navigation)
- **Reset**: All values reset to `null` when game stopped and new game started

**Validation Rules**:
- Each question position must have value or null (no undefined)
- Letter values must be single, printable characters
- No duplicate checking (multiple questions can provide same letter)
- No ordering validation (letters stored as-is from question data)

---

### 2. GameSession (Extended)

**Existing Type** (from Feature 001):
```typescript
interface GameSession {
  questionIndex: number;           // Current question (0-11)
  questionIds: number[];           // Question numbers (1-12)
  attemptCount: number;            // Total attempts this session
  correctAnswers: Map<number, string>; // Correct answers by question
  isActive: boolean;               // Game running status
}
```

**Extension for This Feature**:
```typescript
interface GameSession {
  // ... existing properties ...
  collectedLetters: CollectedLetters; // NEW: Track collected letters
}
```

**Updated Initialization**:
```typescript
{
  questionIndex: 0,
  questionIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  attemptCount: 0,
  correctAnswers: new Map(),
  isActive: true,
  collectedLetters: {
    1: null, 2: null, 3: null, 4: null,
    5: null, 6: null, 7: null, 8: null,
    9: null, 10: null, 11: null, 12: null
  }
}
```

---

### 3. Question (Extended)

**Existing Structure** (from question-sets/*.json):
```json
{
  "number": 1,
  "category": "Geography",
  "question": "What is the capital of France?",
  "answers": [
    { "text": "Paris", "isCorrect": true }
  ],
  "letter": "S"
}
```

**Properties Used by This Feature**:
| Property | Type | Purpose | Source |
|----------|------|---------|--------|
| `number` | number | Question position (1-12) | Existing |
| `letter` | string | Letter to collect on correct answer | Existing |

**Assumptions**:
- Letter field always populated (non-null)
- Letter is single uppercase character
- Same question always provides same letter (consistency)

---

## State Relationships

### State Flow Diagram

```
User answers question
        ↓
validationLogic.isAnswerCorrect()
        ↓
    YES? 
        ├─ YES → Extract letter from Question
        │        ↓
        │        Update GameSession.collectedLetters[questionNumber] = letter
        │        ↓
        │        GameContainer re-renders
        │        ↓
        │        NavigationChevrons/QuestionGrid receive updated props
        │        ↓
        │        Display letter in navigation box (green + letter)
        │
        └─ NO → Box remains white, displays period "."
```

### Component Props Chain

```
GameContainer (state holder)
  ├─ collectedLetters: CollectedLetters
  ├─ onAnswerCorrect: (questionNumber: number, letter: string) => void
  │
  ├─ NavigationChevrons
  │   ├─ collectedLetters: CollectedLetters (passed down)
  │   └─ Render logic: shows letter || '.' for each box
  │
  └─ QuestionGrid
      ├─ collectedLetters: CollectedLetters (passed down)
      └─ Render logic: shows letter || '.' for each square
```

---

## Display State Mapping

### Navigation Box States

For each of the 12 positions, a box can display:

| State | Visual | Content | CSS Class |
|-------|--------|---------|-----------|
| Unanswered | White | "." | `bg-white` |
| Correct Answer | Green | Letter (e.g., "S") | `bg-green-500` |

**Display Logic** (pseudocode):
```typescript
function getBoxContent(questionNumber: number, collectedLetters: CollectedLetters): string {
  const letter = collectedLetters[questionNumber];
  return letter ? letter : '.';
}

function getBoxStyle(questionNumber: number, collectedLetters: CollectedLetters): string {
  const letter = collectedLetters[questionNumber];
  return letter ? 'bg-green-500' : 'bg-white';
}
```

---

## Validation Rules

### CollectedLetters Validation

**On Initialization**:
- All 12 positions present in object
- All values initialized to `null`

**On Update** (after correct answer):
- Question number within range [1-12]
- Letter is string and single character
- Previous value can be any letter or null (allowing re-answer)

**On Game Stop/Reset**:
- All values reset to `null`
- Object structure preserved

### State Consistency Rules

1. **Uniqueness**: Each question can only have one collected letter at a time
2. **Correspondence**: collectedLetters key must match a valid question number (1-12)
3. **Immutability**: Never directly mutate collectedLetters - create new object
4. **Synchronization**: collectedLetters state changes must trigger UI re-render

---

## Query Patterns

**Helper Functions** (to implement in validationLogic.ts):

```typescript
// Check if question has been answered correctly
function isAnsweredCorrectly(questionNumber: number, collectedLetters: CollectedLetters): boolean {
  return collectedLetters[questionNumber] !== null;
}

// Get letter for display (letter or period)
function getDisplayLetter(questionNumber: number, collectedLetters: CollectedLetters): string {
  return collectedLetters[questionNumber] ?? '.';
}

// Count answered questions
function countAnswered(collectedLetters: CollectedLetters): number {
  return Object.values(collectedLetters).filter(letter => letter !== null).length;
}

// Get all collected letters in order
function getCollectedLettersArray(collectedLetters: CollectedLetters): (string | null)[] {
  return Array.from({ length: 12 }, (_, i) => collectedLetters[i + 1]);
}
```

---

## Storage & Persistence

**Storage Type**: Client-side React state (GameSession object)

**Scope**: Single game session lifetime

**Lifetime**:
- Created: When `startGame()` called
- Updated: When correct answer validated
- Cleared: When `stopGame()` called and new game starts

**No Persistence Requirements**:
- Not saved to localStorage (spec: "reset when new game starts")
- Not persisted to backend (single-player client-side game)
- Not tracked in URL (state internal to React component)

---

## Edge Cases & Constraints

### Handled Cases

1. **Re-answering same question correctly**
   - Letter state remains same
   - Box stays green with letter
   - No state change if letter already collected

2. **Answering wrong after answering right**
   - Letter state unchanged (not overwritten)
   - Unanswered status not reverted
   - Box retains green color and letter

3. **All 12 questions answered**
   - CollectedLetters has 12 non-null entries
   - All boxes display letters
   - No validation changes needed

4. **Navigation between questions**
   - State persists through navigation
   - Switching questions doesn't affect collected letters
   - Other questions' letters remain visible

### Out of Scope (Not Handled)

- Letter ordering or sorting (separate feature)
- Duplicate letter detection
- Missing letter hints
- Partial letter collection (always whole letters)

---

## Type Definitions Summary

**Add to `/lib/types.ts`**:

```typescript
// Letter collection state for a game session
export type CollectedLetters = Record<number, string | null>;

// Update existing GameSession interface
export interface GameSession {
  questionIndex: number;
  questionIds: number[];
  attemptCount: number;
  correctAnswers: Map<number, string>;
  isActive: boolean;
  collectedLetters: CollectedLetters;  // NEW
}

// Helper type for component props
export interface LetterDisplayProps {
  collectedLetters: CollectedLetters;
  questionNumber: number;
}
```

---

## Integration Points

### Components to Update

1. **GameContainer.tsx**
   - Initialize collectedLetters on game start
   - Pass as prop to NavigationChevrons and QuestionGrid
   - Add callback for onAnswerCorrect

2. **NavigationChevrons.tsx**
   - Accept collectedLetters prop
   - Render letter or period for each box
   - Apply conditional styling (green if letter, white if period)

3. **QuestionGrid.tsx**
   - Accept collectedLetters prop
   - Render letter or period for each square
   - Apply conditional styling

### Logic to Update

1. **gameLogic.ts**
   - Initialize collectedLetters: `Object.fromEntries(Array.from({length: 12}, (_, i) => [i+1, null]))`

2. **validationLogic.ts**
   - When correct answer detected, extract question.letter
   - Update collectedLetters state

---

## Success Criteria Mapped to Data Model

| Success Criteria | Data Model Requirement |
|------------------|----------------------|
| SC-001: Players identify answered questions by seeing letters | CollectedLetters stores letter for each correct answer |
| SC-002: Letter visible <100ms after validation | State update triggers immediate re-render |
| SC-003: All 12 positions maintain state through navigation | CollectedLetters persists in GameSession |
| SC-004: 100% accuracy in distinguishing answered/unanswered | Letter vs. null distinction clear in state |
| SC-005: State resets on new game | CollectedLetters re-initialized to all nulls |
