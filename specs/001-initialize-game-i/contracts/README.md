# Type Contracts: Game Initialization

**Feature**: Game Initialization for "2 to Twelve"
**Date**: 2025-10-14
**Phase**: Phase 1 (Design)

## Overview

This document defines the TypeScript type contracts for the game initialization feature. Since this is a client-side only feature with no API endpoints, the contracts focus on data structures, function signatures, and component prop types.

---

## Core Type Contracts

### Data Types (`lib/types.ts`)

#### Question Interface

```typescript
/**
 * Represents a single question within a question set.
 * Each question reveals one letter of the 12-letter answer.
 */
export interface Question {
  /** Unique identifier within the question set */
  id: string

  /** The question text displayed to the player */
  questionText: string

  /** The correct answer to the question */
  correctAnswer: string

  /** The letter revealed when this question is answered correctly (A-Z) */
  revealedLetter: string

  /** Zero-indexed position of the revealed letter in the 12-letter answer (0-11) */
  positionInAnswer: number
}
```

**Contract Guarantees**:
- `id`: Non-empty string, unique within parent QuestionSet
- `questionText`: Non-empty string
- `correctAnswer`: Non-empty string
- `revealedLetter`: Single uppercase letter [A-Z]
- `positionInAnswer`: Integer in range [0, 11]

---

#### QuestionSet Interface

```typescript
/**
 * Represents a collection of 12 questions that together reveal a 12-letter word.
 * Question sets are randomly selected when a player starts a new game.
 */
export interface QuestionSet {
  /** Unique identifier for this question set */
  id: string

  /** Theme or category name displayed to the player (e.g., "World Capitals") */
  theme: string

  /** The 12-letter word that is the final answer (uppercase A-Z only) */
  mainAnswer: string

  /** Difficulty level: easy, medium, or hard */
  difficulty: 'easy' | 'medium' | 'hard'

  /** Language code (ISO 639-1, e.g., "EN", "NL", "FR") */
  language: string

  /** Array of exactly 12 questions */
  questions: Question[]
}
```

**Contract Guarantees**:
- `id`: Non-empty string, globally unique
- `theme`: String of length 3-50
- `mainAnswer`: Exactly 12 uppercase letters [A-Z], no spaces or punctuation
- `difficulty`: Literal type 'easy' | 'medium' | 'hard'
- `language`: 2-letter uppercase ISO 639-1 code
- `questions`: Array with exactly 12 Question objects

---

#### GameSession Interface

```typescript
/**
 * Represents the current game session state.
 * Tracks whether a game is active and which question set is selected.
 */
export interface GameSession {
  /** Whether a game is currently in progress */
  isActive: boolean

  /** Theme of the currently selected question set (null when no game is active) */
  selectedTheme: string | null

  /** ID of the currently selected question set (null when no game is active) */
  questionSetId: string | null
}
```

**Contract Guarantees** (Invariants):
- If `isActive === true`, then `selectedTheme !== null` AND `questionSetId !== null`
- If `isActive === false`, then `selectedTheme === null` AND `questionSetId === null`

**Type Guard**:
```typescript
/**
 * Type guard to check if a GameSession is in a valid state.
 * @param session - The game session to validate
 * @returns true if the session state is consistent, false otherwise
 */
export function isValidActiveSession(session: GameSession): boolean {
  if (session.isActive) {
    return session.selectedTheme !== null && session.questionSetId !== null
  } else {
    return session.selectedTheme === null && session.questionSetId === null
  }
}
```

---

## Function Contracts (`lib/gameLogic.ts`)

### selectRandomQuestionSet

```typescript
/**
 * Randomly selects one question set from the provided array.
 * Each question set has equal probability of being selected.
 *
 * @param sets - Array of question sets to choose from
 * @returns A randomly selected question set
 * @throws {Error} If the input array is empty
 *
 * @example
 * const sets = [set1, set2, set3]
 * const selected = selectRandomQuestionSet(sets)
 * console.log(selected.theme) // e.g., "World Capitals"
 */
export function selectRandomQuestionSet(sets: QuestionSet[]): QuestionSet
```

**Preconditions**:
- `sets` must be a non-empty array
- Each element in `sets` must be a valid QuestionSet

**Postconditions**:
- Returns one element from the input `sets` array
- Each element has equal probability (1/n) of being selected
- Throws Error with message "No question sets available" if `sets.length === 0`

**Purity**: Pure function (no side effects, deterministic for given random seed)

**Test Cases Required**:
- Returns element from input array
- Throws error when array is empty
- Returns the only element when array has length 1
- All elements selected over multiple iterations (statistical test)

---

## Component Prop Contracts (`app/components/`)

### StartGameButton Props

```typescript
/**
 * Props for the StartGameButton component.
 */
export interface StartGameButtonProps {
  /** Callback function invoked when the button is clicked */
  onClick: () => void

  /** Whether the button should be disabled (e.g., when a game is already active) */
  disabled?: boolean
}
```

**Contract**:
- `onClick`: Required callback, invoked on button click
- `disabled`: Optional boolean, defaults to false

**Usage**:
```typescript
<StartGameButton
  onClick={handleStartGame}
  disabled={gameState.isActive}
/>
```

---

### StopGameButton Props

```typescript
/**
 * Props for the StopGameButton component.
 */
export interface StopGameButtonProps {
  /** Callback function invoked when the button is clicked */
  onClick: () => void

  /** Whether the button should be visible (only shown when game is active) */
  visible: boolean
}
```

**Contract**:
- `onClick`: Required callback, invoked on button click
- `visible`: Required boolean, controls component visibility

**Usage**:
```typescript
<StopGameButton
  onClick={handleStopGame}
  visible={gameState.isActive}
/>
```

---

### ThemeDisplay Props

```typescript
/**
 * Props for the ThemeDisplay component.
 */
export interface ThemeDisplayProps {
  /** The theme text to display (e.g., "World Capitals") */
  theme: string | null

  /** Whether the theme display should be visible */
  visible: boolean
}
```

**Contract**:
- `theme`: Theme string or null (null when no game is active)
- `visible`: Required boolean, controls component visibility

**Rendering Rules**:
- If `visible === false`, component renders nothing (or returns null)
- If `visible === true` and `theme === null`, component should not render (defensive programming)
- If `visible === true` and `theme !== null`, display the theme

**Usage**:
```typescript
<ThemeDisplay
  theme={gameState.selectedTheme}
  visible={gameState.isActive}
/>
```

---

## Validation Contracts

### ValidationResult Type

```typescript
/**
 * Represents the result of a validation operation.
 */
export interface ValidationError {
  valid: false
  errors: string[]
}

export interface ValidationSuccess<T> {
  valid: true
  data: T
}

export type ValidationResult<T> = ValidationSuccess<T> | ValidationError
```

**Usage**: Discriminated union for type-safe validation results.

---

### validateQuestionSet Function

```typescript
/**
 * Validates a QuestionSet object against the schema.
 *
 * @param set - The object to validate (unknown type for safety)
 * @returns ValidationResult with either errors or validated data
 *
 * @example
 * const result = validateQuestionSet(rawData)
 * if (result.valid) {
 *   const questionSet: QuestionSet = result.data
 * } else {
 *   console.error(result.errors)
 * }
 */
export function validateQuestionSet(set: unknown): ValidationResult<QuestionSet>
```

**Contract**:
- **Input**: `unknown` type (safest for runtime validation)
- **Output**: `ValidationResult<QuestionSet>` discriminated union
- **Validation Rules**:
  - `id`: Non-empty string
  - `theme`: String length 3-50
  - `mainAnswer`: Regex `/^[A-Z]{12}$/`
  - `difficulty`: One of ['easy', 'medium', 'hard']
  - `language`: Regex `/^[A-Z]{2}$/`
  - `questions`: Array with length 12

---

## State Management Contracts (`app/page.tsx`)

### Game State Hook

```typescript
/**
 * Custom hook managing game session state (or useState in main component).
 */
const [gameState, setGameState] = useState<GameSession>({
  isActive: false,
  selectedTheme: null,
  questionSetId: null
})
```

**State Transitions**:

```typescript
/**
 * Starts a new game by selecting a random question set.
 * Updates game state to active with selected theme and set ID.
 */
function handleStartGame(): void {
  const selected = selectRandomQuestionSet(questionSets)
  setGameState({
    isActive: true,
    selectedTheme: selected.theme,
    questionSetId: selected.id
  })
}

/**
 * Stops the current game and resets state to inactive.
 */
function handleStopGame(): void {
  setGameState({
    isActive: false,
    selectedTheme: null,
    questionSetId: null
  })
}
```

**Invariants Maintained**:
- `handleStartGame` always sets `isActive = true` with non-null theme and ID
- `handleStopGame` always sets `isActive = false` with null theme and ID

---

## Error Handling Contracts

### Error Types

```typescript
/**
 * Error thrown when no question sets are available for selection.
 */
export class NoQuestionSetsError extends Error {
  constructor() {
    super('No question sets available')
    this.name = 'NoQuestionSetsError'
  }
}
```

**Error Handling Strategy**:
- **selectRandomQuestionSet**: Throws `Error` (or `NoQuestionSetsError`) if array is empty
- **Component level**: Defensive checks (e.g., don't render ThemeDisplay if theme is null)
- **No try-catch in UI**: Let errors bubble to error boundary (future implementation)

---

## Testing Contracts

### Unit Test Requirements

**For `selectRandomQuestionSet`**:
```typescript
describe('selectRandomQuestionSet', () => {
  it('returns a question set from the input array', () => {
    /* Implementation */
  })

  it('throws error when input array is empty', () => {
    /* Implementation */
  })

  it('selects first item when Math.random returns 0', () => {
    /* Implementation with mocked Math.random */
  })

  it('selects all sets over multiple iterations', () => {
    /* Statistical test: run 100 times, verify all sets appear */
  })
})
```

### E2E Test Requirements

**For User Story 1** (`start-game.spec.ts`):
```typescript
test('US1.1: Start game displays theme', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: /start new game/i }).click()
  await expect(page.getByTestId('theme-display')).toBeVisible()
})
```

**For User Story 2** (`stop-game.spec.ts`):
```typescript
test('US2.1: Stop game returns to initial state', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: /start new game/i }).click()
  await page.getByRole('button', { name: /stop game/i }).click()
  await expect(page.getByTestId('theme-display')).not.toBeVisible()
})
```

---

## Component Test IDs

For E2E testing stability, use these `data-testid` attributes:

| Component | Test ID | Purpose |
|-----------|---------|---------|
| ThemeDisplay | `theme-display` | Verify theme visibility and content |
| StartGameButton | `start-game-button` | (Optional, prefer role-based selector) |
| StopGameButton | `stop-game-button` | (Optional, prefer role-based selector) |

**Selector Preference**:
1. **Role-based**: `getByRole('button', { name: /start/i })` (most resilient)
2. **Test ID**: `getByTestId('theme-display')` (for non-interactive elements)
3. **Text**: `getByText('Start New Game')` (fragile, avoid if possible)

---

## Type Safety Guarantees

### TypeScript Strict Mode

Ensure `tsconfig.json` includes:
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true
  }
}
```

### Compile-Time Checks

The type system enforces:
- ✅ `GameSession` state transitions (cannot set `isActive = true` without providing theme)
- ✅ `QuestionSet.difficulty` only accepts 'easy' | 'medium' | 'hard'
- ✅ Component props must match defined interfaces
- ✅ `selectRandomQuestionSet` returns `QuestionSet`, not `QuestionSet | undefined`

---

## Summary

**Total Contracts**: 11
- 3 Data Types (Question, QuestionSet, GameSession)
- 1 Function Contract (selectRandomQuestionSet)
- 3 Component Prop Contracts (StartGameButton, StopGameButton, ThemeDisplay)
- 2 Validation Contracts (ValidationResult, validateQuestionSet)
- 2 State Management Contracts (handleStartGame, handleStopGame)

**No API Contracts**: This feature is client-side only; no REST/GraphQL endpoints required.

**Compliance**: All contracts follow SOLID principles (SRP, ISP, DIP) and YAGNI (no unused fields or methods).
