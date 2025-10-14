# Data Model: Question Navigation Flow

**Date**: 2025-10-14  
**Feature**: Question Navigation Flow  
**Status**: Phase 1 Design

## Overview

This document defines the data structures and state management for question navigation. The navigation system builds on existing `GameSession` and `Question` types (defined in `lib/types.ts`) and introduces new navigation-specific state and helper functions.

## Entities

### 1. Navigation State

**Description**: Tracks the current position in the question sequence and navigation boundaries.

**Data Structure**:
```typescript
interface NavigationState {
  /** Current question index (0-indexed internally, displayed as 1-indexed) */
  currentQuestionIndex: number;
  
  /** Total number of questions in the set (always 12 for this game) */
  totalQuestions: number;
}
```

**Invariants**:
- `currentQuestionIndex` must be >= 0 and < `totalQuestions`
- `totalQuestions` is always 12 (derived from GameSession.selectedQuestionSet.questions.length)

**State Management**:
- Stored in React component state using `useState(0)` hook
- Managed by GameContainer component
- Passed to child components as props

**Derived Values**:
```typescript
// Computed from NavigationState
const canNavigatePrevious = currentQuestionIndex > 0;
const canNavigateNext = currentQuestionIndex < totalQuestions - 1;
const displayQuestionNumber = currentQuestionIndex + 1; // 1-indexed for display
```

---

### 2. Question Grid Representation

**Description**: Visual representation of all questions as clickable squares. Each square corresponds to one question and provides direct navigation.

**Data Structure**:
```typescript
interface QuestionGridSquare {
  /** Position in the question sequence (0-indexed) */
  index: number;
  
  /** Whether this square represents the currently displayed question */
  isActive: boolean;
  
  /** Future: will contain the revealed letter (Phase N feature) */
  revealedLetter?: string;
}
```

**Invariants**:
- Exactly 12 squares exist (one per question)
- Exactly one square has `isActive: true` at any time
- `index` must be 0-11

**Rendering Logic**:
```typescript
// Grid is rendered from NavigationState
const squares: QuestionGridSquare[] = Array.from({ length: 12 }, (_, index) => ({
  index,
  isActive: index === currentQuestionIndex,
  revealedLetter: undefined, // Future feature
}));
```

---

### 3. Current Question Display

**Description**: Presents the currently selected question including metadata, text, and answer input interface.

**Data Structure**:
```typescript
interface CurrentQuestionDisplay {
  /** The question object from the selected question set */
  question: Question; // From lib/types.ts
  
  /** Display number (1-indexed) */
  questionNumber: number;
  
  /** Total questions (for "Question X of Y" display) */
  totalQuestions: number;
  
  /** Answer input value (non-functional, cleared on navigation) */
  answerInputValue: string;
}
```

**Invariants**:
- `question` is always a valid Question object from GameSession.selectedQuestionSet.questions
- `questionNumber` is `currentQuestionIndex + 1` (1-12 range)
- `answerInputValue` is reset to empty string on navigation

**Relationship to GameSession**:
```typescript
// Derived from GameSession and NavigationState
const currentQuestion = gameSession.selectedQuestionSet.questions[currentQuestionIndex];
const displayData: CurrentQuestionDisplay = {
  question: currentQuestion,
  questionNumber: currentQuestionIndex + 1,
  totalQuestions: 12,
  answerInputValue: '', // Managed separately in QuestionDisplay component
};
```

---

## Navigation Actions

### Action: Navigate Next

**Trigger**: User clicks next chevron  
**Precondition**: `currentQuestionIndex < 11`  
**Effect**: Increment `currentQuestionIndex` by 1  
**Side Effects**: Answer input cleared, question display updated

### Action: Navigate Previous

**Trigger**: User clicks previous chevron  
**Precondition**: `currentQuestionIndex > 0`  
**Effect**: Decrement `currentQuestionIndex` by 1  
**Side Effects**: Answer input cleared, question display updated

### Action: Select Question Directly

**Trigger**: User clicks a grid square  
**Precondition**: Valid square index (0-11)  
**Effect**: Set `currentQuestionIndex` to selected square's index  
**Side Effects**: Answer input cleared, question display updated (unless already on that question)

---

## State Transitions

```
Initial State (on game start):
  currentQuestionIndex = 0
  currentQuestion = questions[0]

User clicks "Next" (at question N, N < 11):
  currentQuestionIndex = N + 1
  currentQuestion = questions[N + 1]
  answerInputValue = ""

User clicks "Previous" (at question N, N > 0):
  currentQuestionIndex = N - 1
  currentQuestion = questions[N - 1]
  answerInputValue = ""

User clicks grid square M (0 ≤ M ≤ 11):
  currentQuestionIndex = M
  currentQuestion = questions[M]
  answerInputValue = ""
```

---

## Validation Rules

### Navigation State Validation

```typescript
/**
 * Validates navigation state is within bounds
 */
function isValidNavigationState(state: NavigationState): boolean {
  return (
    state.currentQuestionIndex >= 0 &&
    state.currentQuestionIndex < state.totalQuestions &&
    state.totalQuestions === 12
  );
}

/**
 * Validates a navigation action is allowed
 */
function canExecuteNavigation(
  action: 'next' | 'previous' | 'direct',
  currentIndex: number,
  targetIndex?: number
): boolean {
  switch (action) {
    case 'next':
      return currentIndex < 11;
    case 'previous':
      return currentIndex > 0;
    case 'direct':
      return targetIndex !== undefined && 
             targetIndex >= 0 && 
             targetIndex <= 11;
    default:
      return false;
  }
}
```

---

## Relationships to Existing Types

### Extends GameSession

Navigation state is **ephemeral** (not persisted in GameSession):
- GameSession provides the question set (12 questions)
- NavigationState tracks which question is currently displayed
- When a new game starts, navigation resets to question 0

```typescript
// GameSession (existing - from lib/types.ts)
interface GameSession {
  isActive: boolean;
  selectedQuestionSet: QuestionSet | null;
}

// Navigation extends GameSession conceptually but is managed separately
interface GameWithNavigation {
  session: GameSession;
  navigation: NavigationState;
}
```

### Uses Question Type

```typescript
// Question (existing - from lib/types.ts)
interface Question {
  id: string;
  question: string;
  answer: string;
  revealedLetter: string;
}

// Navigation references questions by index, not by mutating them
const currentQuestion = gameSession.selectedQuestionSet.questions[navigationState.currentQuestionIndex];
```

---

## Implementation Notes

### Why Not Store in GameSession?

**Decision**: Navigation state is component-local (React useState), not stored in GameSession

**Rationale**:
1. **Ephemeral**: Navigation state resets on each game start; no persistence needed
2. **UI-specific**: Current question index is a UI concern, not business logic
3. **Simplicity**: useState is simpler than extending GameSession type and managing in gameLogic.ts
4. **YAGNI**: No requirement for navigation state persistence across sessions

### Data Flow

```
GameSession (from Feature 001)
    ↓
GameContainer (manages NavigationState via useState)
    ↓
    ├─→ QuestionGrid (displays 12 squares, highlights current)
    ├─→ NavigationChevrons (sequential navigation)
    └─→ QuestionDisplay (shows current question)
```

### Future Extensibility

When answer verification is implemented (future feature):
- Add `answeredQuestions: Set<number>` to track completed questions
- Update QuestionGridSquare to show revealed letters
- Navigation state structure remains unchanged
- New state managed separately in GameSession or GameContainer

---

## Summary

The navigation data model is minimal and focused:
- **NavigationState**: Single number (current index) + derived values
- **QuestionGridSquare**: Array representation for UI rendering
- **CurrentQuestionDisplay**: Derived from GameSession + NavigationState

No new persistent entities, no database schema changes, no API contracts. All state is client-side, ephemeral, and React-managed. This aligns with YAGNI (no premature complexity) and SRP (navigation logic separated from game logic).