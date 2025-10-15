# API Contracts: Letter Collection Display

**Feature**: 004-letter-collection-we  
**Date**: 2025-10-15  

---

## Overview

This document defines the type contracts and interface boundaries for letter collection display. All contracts are TypeScript interfaces and types defined in `lib/types.ts`.

---

## Core Type Contract

### CollectedLetters Type

**Definition**:
```typescript
export type CollectedLetters = Record<number, string | null>;
```

**Purpose**: Represents the mapping of question positions (1-12) to collected letters or null if unanswered

**Contract Guarantees**:
- Keys are numbers 1-12 (question positions)
- Values are either a single-character string (uppercase letter) or null
- Always contains all 12 keys (no missing positions)
- Immutable within React state (new object on updates)

**Example**:
```typescript
const collected: CollectedLetters = {
  1: 'S',
  2: null,
  3: 'E',
  4: null,
  5: 'C',
  6: null,
  7: 'O',
  8: null,
  9: 'N',
  10: null,
  11: 'D',
  12: null
};
```

---

## GameSession Extension Contract

### Extended GameSession Interface

**Original**:
```typescript
interface GameSession {
  questionIndex: number;
  questionIds: number[];
  attemptCount: number;
  correctAnswers: Map<number, string>;
  isActive: boolean;
}
```

**Extended** (adds):
```typescript
interface GameSession {
  // ... existing properties ...
  collectedLetters: CollectedLetters;  // NEW
}
```

**Contract Guarantees**:
- `collectedLetters` is always present when GameSession exists
- Initialized with all values as null on game start
- Updated via immutable state update patterns (new object creation)
- Reset to all nulls when `stopGame()` called
- Never contains undefined values (always string or null)

---

## Component Props Contracts

### NavigationChevrons Component Props

**Contract**:
```typescript
interface NavigationChevronProps {
  currentQuestion: number;              // Current question index (0-11)
  collectedLetters: CollectedLetters;   // Collected letters state
  onNext: () => void;                   // Callback: navigate to next question
  onPrevious: () => void;               // Callback: navigate to previous question
}
```

**Guarantees**:
- `currentQuestion` is always in range [0, 11]
- `collectedLetters` always contains all 12 positions
- `onNext` and `onPrevious` callbacks handle boundary conditions (wrap or disable)
- Component is stateless - all state provided via props

**Rendering Contract**:
- Renders 12 navigation boxes for questions 1-12
- Each box displays letter from `collectedLetters[questionNumber]` or "."
- Green background if letter collected, white if not
- Current question highlighted with additional visual indicator

**Test Selectors** (data-testid):
- `previous-chevron`: Previous button
- `next-chevron`: Next button
- `question-square-{N}`: Navigation box for question N (N = 1-12)

---

### QuestionGrid Component Props

**Contract**:
```typescript
interface QuestionGridProps {
  collectedLetters: CollectedLetters;   // Collected letters state
  onSelectQuestion: (questionNum: number) => void;  // Callback: select question
}
```

**Guarantees**:
- `collectedLetters` always contains all 12 positions
- `onSelectQuestion` callback receives valid question numbers (1-12)
- Component is stateless - all state provided via props
- All 12 squares are clickable and functional

**Rendering Contract**:
- Renders 12 clickable squares in a grid
- Each square displays letter from `collectedLetters[questionNumber]` or "."
- Green background if letter collected, white if not
- Squares are responsive (adjust size for mobile)

**Test Selectors** (data-testid):
- `question-square-{N}`: Grid square for question N (N = 1-12)

---

### GameContainer Component Responsibilities

**State Management Contract**:
```typescript
export default function GameContainer() {
  const [gameSession, setGameSession] = useState<GameSession | null>(null);
  
  // Initialization: collectedLetters set to all null values
  // Updates: immutable pattern for collectedLetters changes
  // Reset: on stopGame, new GameSession has all null values
}
```

**Props Provided Down**:
- Pass `gameSession.collectedLetters` to NavigationChevrons
- Pass `gameSession.collectedLetters` to QuestionGrid
- Pass current question index to NavigationChevrons

**Callbacks Handled**:
- `handleAnswerCorrect(questionNumber: number, letter: string)`: Updates collectedLetters
- `onNext()`: Increments currentQuestion
- `onPrevious()`: Decrements currentQuestion
- `onSelectQuestion(questionNumber: number)`: Sets currentQuestion

---

## Helper Function Contracts

### getDisplayLetter()

**Signature**:
```typescript
export function getDisplayLetter(
  questionNumber: number,
  collectedLetters: CollectedLetters
): string;
```

**Input Contract**:
- `questionNumber`: Valid question number (1-12)
- `collectedLetters`: Valid CollectedLetters object

**Output Contract**:
- Returns single-character string (the letter) if question answered
- Returns "." (period) if question not answered
- Never returns null or undefined
- Always returns string type

**Example**:
```typescript
getDisplayLetter(1, { 1: 'S', 2: null, ... }) === 'S'
getDisplayLetter(2, { 1: 'S', 2: null, ... }) === '.'
```

---

### isAnsweredCorrectly()

**Signature**:
```typescript
export function isAnsweredCorrectly(
  questionNumber: number,
  collectedLetters: CollectedLetters
): boolean;
```

**Input Contract**:
- `questionNumber`: Valid question number (1-12)
- `collectedLetters`: Valid CollectedLetters object

**Output Contract**:
- Returns `true` if letter collected for this question
- Returns `false` if question not answered (null)
- Always returns boolean type
- Never throws errors

**Example**:
```typescript
isAnsweredCorrectly(1, { 1: 'S', 2: null, ... }) === true
isAnsweredCorrectly(2, { 1: 'S', 2: null, ... }) === false
```

---

## State Update Contracts

### Initialization (GameSession Creation)

**Contract**:
```typescript
function startGame(questions: Question[]): GameSession {
  // Returns GameSession with:
  // - questionIndex: 0
  // - questionIds: [1, 2, ..., 12]
  // - collectedLetters: { 1: null, 2: null, ..., 12: null }
  // - isActive: true
}
```

**Guarantees**:
- All 12 positions initialized to null
- No letters pre-populated
- GameSession is ready for play

---

### Update on Correct Answer

**Contract**:
```typescript
// When correct answer validated:
setGameSession(prev => ({
  ...prev,
  collectedLetters: {
    ...prev.collectedLetters,
    [questionNumber]: letter
  }
}));
```

**Guarantees**:
- Original object not mutated (new objects created)
- Only the specified question position updated
- All other positions unchanged
- Update is immediate (React state update)

**Invalid Operations** (would violate contract):
```typescript
// ❌ DO NOT directly mutate:
gameSession.collectedLetters[1] = 'S';

// ❌ DO NOT set to undefined:
collectedLetters[1] = undefined;

// ❌ DO NOT create sparse object:
{ 1: 'S', 3: 'E' };  // Missing positions 2, 4-12
```

---

### Reset on Game Stop

**Contract**:
```typescript
function stopGame(): GameSession {
  // Previous GameSession discarded
  // New GameSession created with collectedLetters all null
}
```

**Guarantees**:
- All letters cleared
- New game has fresh state
- No state leakage between games

---

## Question Data Contract

### Question Type (Extended)

**Required Fields** (for letter collection):
```typescript
interface Question {
  number: number;           // Question position (1-12)
  letter: string;           // Letter to collect (single uppercase char)
  // ... other fields ...
}
```

**Contract Guarantees**:
- `letter` field always present
- `letter` is single character (non-empty string)
- `letter` is valid for display (printable ASCII)
- Same question always provides same letter

**Example** (from question-sets/set-1.json):
```json
{
  "number": 1,
  "category": "Geography",
  "question": "What is the capital of France?",
  "answers": [{ "text": "Paris", "isCorrect": true }],
  "letter": "S"
}
```

---

## Validation Result Contract

### ValidationResult Type

**Signature**:
```typescript
interface ValidationResult {
  isCorrect: boolean;
  letter?: string;        // NEW: Letter to collect
}
```

**Contract Guarantees**:
- `isCorrect` is always boolean
- If `isCorrect` is true, `letter` is present
- If `isCorrect` is false, `letter` may be undefined
- Letter is single uppercase character

**Example**:
```typescript
// Correct answer
{ isCorrect: true, letter: 'S' }

// Incorrect answer
{ isCorrect: false }
```

---

## Display Rendering Contracts

### Navigation Box Display

**For Each Position (1-12)**:

| State | CSS Classes | Content | Selectable |
|-------|-------------|---------|-----------|
| Unanswered | `bg-white border` | "." | Yes (in QuestionGrid only) |
| Answered | `bg-green-500 text-white` | Letter (e.g., "S") | Yes |

**Contract Guarantees**:
- White background for unanswered (period indicator)
- Green background for answered (letter display)
- Text centered and readable
- All 12 positions always visible or accessible

---

## Error Handling Contracts

**No errors should occur if contracts are honored**:
- `getDisplayLetter()` never throws
- `isAnsweredCorrectly()` never throws
- Component rendering never throws
- All operations are safe with valid inputs

**If contracts violated**, component may:
- Display undefined/null text
- Render with incorrect styling
- Fail to respond to clicks
- Console errors may appear (but app won't crash)

---

## Performance Contracts

**State Update Latency**:
- Correct answer detected: <50ms
- State updated: <50ms
- Component re-renders: <50ms
- Letter visible in box: <100ms total

**Render Performance**:
- NavigationChevrons re-render with new props: <16ms (60fps)
- QuestionGrid re-render with new props: <16ms (60fps)
- No unnecessary re-renders (memoization may be applied)

---

## Backward Compatibility

**Breaking Changes**: None

**Non-Breaking Changes**:
- `GameSession` interface extended (additive)
- New helper functions added to validationLogic
- Existing function behavior unchanged
- Existing components updated only in props received

**Migration Path**:
- Update types.ts: Add CollectedLetters type
- Update gameLogic.ts: Initialize collectedLetters
- Update components: Accept collectedLetters prop
- No code removal or significant refactoring

---

## Contract Summary Table

| Contract | Type | Scope | Status |
|----------|------|-------|--------|
| CollectedLetters | Type | Global | ✅ Defined |
| GameSession extension | Interface | Global | ✅ Defined |
| NavigationChevronProps | Interface | Component | ✅ Defined |
| QuestionGridProps | Interface | Component | ✅ Defined |
| Helper functions | Functions | Validation | ✅ Defined |
| State updates | Pattern | Container | ✅ Defined |
| Question.letter | Field | Data | ✅ Defined |
| Display rendering | Rules | UI | ✅ Defined |

---

## Testing Against Contracts

### Unit Test Contract Validation

```typescript
// Type checking: Verify CollectedLetters structure
const collected: CollectedLetters = { 1: 'S', 2: null, ... };

// Function contract: getDisplayLetter always returns string
const result: string = getDisplayLetter(1, collected);
expect(typeof result).toBe('string');

// Function contract: isAnsweredCorrectly always returns boolean
const answered: boolean = isAnsweredCorrectly(1, collected);
expect(typeof answered).toBe('boolean');
```

### E2E Test Contract Validation

```typescript
// Display contract: Letter visible after correct answer
await page.goto('http://localhost:3000');
// Answer question 1 correctly
const boxContent = await page.textContent('[data-testid="question-square-1"]');
expect(['S', 'E', 'C', 'O', 'N', 'D']).toContain(boxContent); // Valid letter

// Display contract: Period visible for unanswered
const boxContent2 = await page.textContent('[data-testid="question-square-2"]');
expect(boxContent2).toBe('.');
```

---

## Contract Violations & Debugging

**If letter not displaying**:
1. Check `CollectedLetters` object in React DevTools
2. Verify question number is key (1-12, not 0-11)
3. Confirm letter value is string, not null

**If styling incorrect**:
1. Verify `isAnsweredCorrectly()` returning correct boolean
2. Check Tailwind CSS classes applied based on condition
3. Ensure no CSS precedence issues

**If navigation broken**:
1. Verify callbacks (`onNext`, `onPrevious`, `onSelectQuestion`) defined
2. Check component receiving props correctly
3. Inspect React DevTools for prop flow
