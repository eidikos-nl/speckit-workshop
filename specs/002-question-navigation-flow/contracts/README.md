# Component Contracts: Question Navigation Flow

**Date**: 2025-10-14  
**Feature**: Question Navigation Flow  
**Type**: Frontend Component Interfaces (TypeScript)

## Overview

This feature is purely frontend with no REST or GraphQL APIs. The "contracts" are TypeScript interfaces defining component props and navigation helper functions. These contracts ensure type safety and clear component boundaries following Interface Segregation Principle (ISP).

---

## Component Prop Interfaces

### 1. GameContainer (State Orchestrator)

**Purpose**: Manages navigation state and coordinates all navigation components

**Internal State**:
```typescript
interface GameContainerState {
  currentQuestionIndex: number; // 0-11
}
```

**Props** (receives from parent):
```typescript
interface GameContainerProps {
  gameSession: GameSession; // From lib/types.ts
}
```

**Behavior**:
- Manages `currentQuestionIndex` via useState
- Computes derived values (canGoNext, canGoPrevious, currentQuestion)
- Passes callbacks to child components
- Handles navigation state changes

---

### 2. QuestionGrid Component

**Purpose**: Displays 12 clickable squares for direct question selection

**Props Interface**:
```typescript
interface QuestionGridProps {
  /** Current question index (0-11) for highlighting */
  currentQuestionIndex: number;
  
  /** Total number of questions (always 12) */
  totalQuestions: number;
  
  /** Callback when user clicks a square */
  onSelectQuestion: (index: number) => void;
}
```

**Behavior Contract**:
- MUST render exactly `totalQuestions` squares
- MUST highlight square at `currentQuestionIndex` with distinct styling
- MUST call `onSelectQuestion(index)` when any square is clicked
- MUST use data-testid `question-square-{N}` where N is 1-12 (display numbering)
- MAY use CSS transitions for highlight changes

**Example Usage**:
```tsx
<QuestionGrid
  currentQuestionIndex={2}
  totalQuestions={12}
  onSelectQuestion={(index) => setCurrentQuestionIndex(index)}
/>
```

---

### 3. NavigationChevrons Component

**Purpose**: Provides next/previous sequential navigation controls

**Props Interface**:
```typescript
interface NavigationChevronsProps {
  /** Whether the "Next" button should be enabled */
  canGoNext: boolean;
  
  /** Whether the "Previous" button should be enabled */
  canGoPrevious: boolean;
  
  /** Callback when user clicks "Next" */
  onNext: () => void;
  
  /** Callback when user clicks "Previous" */
  onPrevious: () => void;
}
```

**Behavior Contract**:
- MUST disable/hide previous chevron when `canGoPrevious` is false
- MUST disable/hide next chevron when `canGoNext` is false
- MUST call `onNext()` only when next chevron is clicked and enabled
- MUST call `onPrevious()` only when previous chevron is clicked and enabled
- MUST use data-testid `next-chevron` and `previous-chevron`
- SHOULD provide visual feedback (disabled state styling)

**Example Usage**:
```tsx
<NavigationChevrons
  canGoNext={currentQuestionIndex < 11}
  canGoPrevious={currentQuestionIndex > 0}
  onNext={() => setCurrentQuestionIndex(prev => prev + 1)}
  onPrevious={() => setCurrentQuestionIndex(prev => prev - 1)}
/>
```

---

### 4. QuestionDisplay Component

**Purpose**: Displays current question text, number, and answer input interface

**Props Interface**:
```typescript
interface QuestionDisplayProps {
  /** The question object to display */
  question: Question; // From lib/types.ts
  
  /** Display number (1-indexed, e.g., 1-12) */
  questionNumber: number;
  
  /** Total questions for "Question X of Y" display */
  totalQuestions: number;
}
```

**Behavior Contract**:
- MUST display "Question {questionNumber} of {totalQuestions}"
- MUST display `question.question` text
- MUST render answer input field (empty by default)
- MUST render "Verify Answer" button (non-functional)
- MUST use data-testid `current-question-display`, `answer-input`, `verify-button`
- MUST clear input value when question changes (via key prop)
- SHOULD use CSS transition for smooth question changes

**Example Usage**:
```tsx
<QuestionDisplay
  question={questions[currentQuestionIndex]}
  questionNumber={currentQuestionIndex + 1}
  totalQuestions={12}
/>
```

---

## Navigation Helper Functions

### Location: `lib/navigationLogic.ts` (new file)

These pure functions provide navigation logic that can be unit tested independently.

### Function: canNavigateNext

**Purpose**: Determines if "Next" navigation is allowed

**Signature**:
```typescript
function canNavigateNext(currentIndex: number, totalQuestions: number): boolean
```

**Contract**:
- **Input**: Current question index (0-indexed), total question count
- **Output**: true if currentIndex < totalQuestions - 1, false otherwise
- **Invariants**: Pure function, no side effects
- **Examples**:
  - `canNavigateNext(0, 12)` → `true` (can go from Q1 to Q2)
  - `canNavigateNext(11, 12)` → `false` (already on last question)

---

### Function: canNavigatePrevious

**Purpose**: Determines if "Previous" navigation is allowed

**Signature**:
```typescript
function canNavigatePrevious(currentIndex: number): boolean
```

**Contract**:
- **Input**: Current question index (0-indexed)
- **Output**: true if currentIndex > 0, false otherwise
- **Invariants**: Pure function, no side effects
- **Examples**:
  - `canNavigatePrevious(0)` → `false` (already on first question)
  - `canNavigatePrevious(5)` → `true` (can go back to Q5)

---

### Function: getNextQuestionIndex

**Purpose**: Computes the next valid question index

**Signature**:
```typescript
function getNextQuestionIndex(
  currentIndex: number,
  totalQuestions: number
): number
```

**Contract**:
- **Input**: Current index (0-indexed), total question count
- **Output**: currentIndex + 1 if valid, otherwise currentIndex (no change)
- **Invariants**: Pure function, result is always within bounds [0, totalQuestions - 1]
- **Examples**:
  - `getNextQuestionIndex(5, 12)` → `6`
  - `getNextQuestionIndex(11, 12)` → `11` (boundary case)

---

### Function: getPreviousQuestionIndex

**Purpose**: Computes the previous valid question index

**Signature**:
```typescript
function getPreviousQuestionIndex(currentIndex: number): number
```

**Contract**:
- **Input**: Current index (0-indexed)
- **Output**: currentIndex - 1 if valid, otherwise currentIndex (no change)
- **Invariants**: Pure function, result is always >= 0
- **Examples**:
  - `getPreviousQuestionIndex(5)` → `4`
  - `getPreviousQuestionIndex(0)` → `0` (boundary case)

---

### Function: isValidQuestionIndex

**Purpose**: Validates a question index is within bounds

**Signature**:
```typescript
function isValidQuestionIndex(index: number, totalQuestions: number): boolean
```

**Contract**:
- **Input**: Index to validate, total question count
- **Output**: true if 0 <= index < totalQuestions, false otherwise
- **Invariants**: Pure function, no side effects
- **Examples**:
  - `isValidQuestionIndex(5, 12)` → `true`
  - `isValidQuestionIndex(-1, 12)` → `false`
  - `isValidQuestionIndex(12, 12)` → `false` (off by one)

---

## Type Exports

### Location: `lib/types.ts` (existing file, extended)

**New Exports** (if needed):
```typescript
// QuestionGridSquare type (internal to QuestionGrid component)
export interface QuestionGridSquare {
  index: number;
  isActive: boolean;
  revealedLetter?: string; // Future feature
}

// Re-export existing types for convenience
export type { Question, QuestionSet, GameSession } from './types';
```

**Note**: Most navigation types are defined locally in components. Only shared types are exported from `lib/types.ts`.

---

## Contract Testing Strategy

### Unit Tests (Jest + @testing-library/react)

**File**: `__tests__/unit/navigationLogic.test.ts`

Test all pure functions in `lib/navigationLogic.ts`:
- `canNavigateNext`: boundary cases (first, last, middle questions)
- `canNavigatePrevious`: boundary cases
- `getNextQuestionIndex`: valid progression and boundaries
- `getPreviousQuestionIndex`: valid progression and boundaries
- `isValidQuestionIndex`: valid/invalid indices

### Component Tests (Jest + @testing-library/react)

**Files**:
- `__tests__/unit/QuestionGrid.test.tsx`
- `__tests__/unit/NavigationChevrons.test.tsx`
- `__tests__/unit/QuestionDisplay.test.tsx`

Test prop contracts:
- Components render with expected props
- Callbacks are invoked with correct arguments
- Disabled states are respected
- data-testid attributes are present

### E2E Tests (Playwright)

**Files**:
- `__tests__/e2e/sequential-navigation.spec.ts`
- `__tests__/e2e/direct-selection.spec.ts`

Test end-to-end behavior:
- User clicks chevrons → question changes
- User clicks grid square → correct question displays
- Disabled chevrons cannot be clicked
- All acceptance scenarios from spec.md

---

## Contract Guarantees

### Type Safety
- All component props are TypeScript interfaces
- All navigation functions have explicit return types
- No `any` types in public contracts

### Interface Segregation (ISP)
- Each component receives only the props it needs
- No "God objects" with unused properties
- Clear separation between data and callbacks

### Dependency Inversion (DIP)
- Components depend on abstract callbacks (`onNext`, `onSelectQuestion`)
- No direct coupling to GameContainer implementation
- Navigation helpers are pure functions (no dependencies)

### Testability
- All pure functions can be unit tested in isolation
- Component contracts enable mocking for component tests
- E2E tests verify contracts work together correctly

---

## Future Extensions

When answer verification is added (future feature):
- QuestionGridProps may add `answeredQuestions: Set<number>`
- QuestionDisplayProps may add `onVerifyAnswer: (answer: string) => void`
- New helper functions: `isQuestionAnswered`, `getRevealedLetters`

The current contracts are designed to be extended without breaking changes (Open/Closed Principle).

---

## Summary

This feature defines 4 component interfaces and 5 navigation helper functions. All contracts are:
- Type-safe (TypeScript interfaces)
- Testable (pure functions, clear props)
- Focused (ISP compliance)
- Extensible (OCP compliance)

No external API contracts exist. All interactions are component-to-component via React props and callbacks.