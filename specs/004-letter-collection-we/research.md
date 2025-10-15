# Research: Letter Collection Display

**Feature**: 004-letter-collection-we  
**Date**: 2025-10-15  
**Status**: Complete - No clarifications needed  

## Overview

This research consolidates technical findings for implementing letter collection display in the "2 to Twelve" game. The feature builds on established technology choices and patterns from the existing codebase (features 001 and 002).

---

## 1. State Management for Letter Collection

### Decision: Extend GameSession State with CollectedLetters

**Rationale**:
- The existing `GameSession` type (defined in `lib/types.ts`) already manages game state including current question and answer attempts
- Adding letter collection as a new property on GameSession maintains consistency with existing patterns
- React hooks (useState) continue to be sufficient for this client-side state management need
- No external state management library required (aligns with YAGNI principle)

**Implementation Approach**:
```typescript
interface CollectedLetters {
  [questionNumber: number]: string | null;  // null = unanswered, string = collected letter
}
```

**Alternatives Considered**:
- Redux/Zustand: Rejected - overcomplicated for single-screen state
- URL parameters: Rejected - letters must persist across multiple question transitions
- LocalStorage: Rejected - spec requires reset when new game starts (client-side state only)

---

## 2. Answer Validation Integration

### Decision: Update Validation Logic to Collect Letters

**Rationale**:
- `lib/validationLogic.ts` already exists and handles correct answer detection
- Answer objects in the question data already contain the letter to collect (from existing question sets)
- Minimal change: when `isAnswerCorrect()` returns true, also store the associated letter in CollectedLetters

**Implementation Approach**:
- Question set JSON files already include letter field: `"letter": "T"`
- When validation passes, extract letter from question object and store in state
- No additional API calls or data fetching required

**Alternatives Considered**:
- Generating random letters on validation: Rejected - questions already have specific letters
- Storing letters in a separate service: Rejected - unnecessary complexity

---

## 3. Component Display Strategy

### Decision: Update NavigationChevrons and QuestionGrid Components

**Rationale**:
- `NavigationChevrons.tsx` already renders the 12 navigation boxes (currently shows only green/white states)
- `QuestionGrid.tsx` already renders clickable grid squares
- Both components have direct access to question data and can conditionally render letters vs. periods
- Minimal prop additions needed (collectedLetters map)

**Implementation Approach**:
- Pass `collectedLetters` state as prop from GameContainer
- In rendering logic: `collectedLetters[questionNumber] ? letter : '.'`
- Preserve existing green color styling for correct answers (letter content replaces placeholder)

**Alternatives Considered**:
- Creating a new separate "LetterDisplay" component: Rejected - adds unnecessary layer
- Using CSS-only solution: Rejected - content must be dynamic based on state

---

## 4. State Persistence Across Navigation

### Decision: Store CollectedLetters in GameSession State (not localStorage)

**Rationale**:
- Spec requires: "maintained for the duration of a game session"
- Spec requires: "reset when a new game starts" (new GameSession)
- Client-side React state naturally supports this pattern
- GameContainer already manages question selection - it can manage letter collection simultaneously

**Implementation Approach**:
- CollectedLetters initialized as empty object when new GameSession created
- Update on correct answer validation (via props callback)
- Automatically reset when `stopGame()` called and new game starts

**Alternatives Considered**:
- Session storage: Same result but requires explicit clearing
- IndexedDB: Unnecessary for single-page game session
- Backend persistence: Out of scope per feature spec

---

## 5. Data Flow Architecture

### Decision: Unidirectional State Flow (Parent → Child Props)

**Rationale**:
- Follows React best practices and existing codebase pattern
- GameContainer manages game state (questions, attempts, collected letters)
- Navigation and display components are "dumb" - receive props and render

**Flow**:
1. User answers question correctly
2. `validationLogic.ts` detects correct answer
3. GameContainer callback updates CollectedLetters state
4. New state passed as props to NavigationChevrons and QuestionGrid
5. Components re-render with new letter content in boxes

**Alternatives Considered**:
- Bidirectional binding (Vuex-style): Rejected - React unidirectional is simpler
- Event-driven architecture: Rejected - overkill for current scope

---

## 6. Testing Strategy

### Unit Tests

**Functions to Test**:
- `isLetterCollected(questionNumber, collectedLetters)` → boolean
- `getLetterDisplay(questionNumber, collectedLetters)` → string (letter or ".")
- Validation update logic correctly stores letter

**Approach**:
- Jest tests in `__tests__/unit/validationLogic.test.ts`
- Pure function testing with no external dependencies
- Test both happy paths and edge cases (all 12 positions, unanswered boxes)

### E2E Tests

**Scenarios to Cover**:
- User answers one question → letter appears in navigation box
- Multiple questions answered → all letters visible simultaneously
- Navigation to different questions → letters persist
- New game started → all letters reset to periods
- Box displays period initially (before any answer)

**Approach**:
- Playwright tests extending existing `answer-validation.spec.ts` and `multiple-attempts.spec.ts`
- Use `data-testid="question-square-{N}"` selectors
- Assert letter content via `expect(element).toContainText('T')`

---

## 7. Performance Considerations

### Decision: Direct Re-render on State Change (No Optimization Needed)

**Rationale**:
- Only 12 navigation boxes - minimal render overhead
- Letter display update <100ms already achievable with React
- No animation or complex calculations required
- User perception: instant visual feedback

**Alternatives Considered**:
- useMemo for CollectedLetters calculations: Rejected - unnecessary complexity
- Virtual scrolling: Rejected - only 12 items
- Debouncing updates: Rejected - defeats purpose of immediate feedback

---

## 8. Browser Compatibility & Responsive Design

### Decision: Inherit Existing Responsive Patterns

**Rationale**:
- Feature 002 already established responsive grid layout for desktop/mobile
- Tailwind CSS classes already applied consistently
- No new CSS required - letter content fits in existing box dimensions

**Constraints**:
- Navigation boxes must remain readable with period or uppercase letter
- Current box size already accommodates single-character text
- Mobile viewport: 12-square grid adapts to screen width (existing implementation)

---

## 9. Data Integrity Assumptions

**As Per Spec**:
- Each question provides exactly one letter
- Letters are single, displayable characters
- All question sets in `question-sets/*.json` include valid letter field
- No data validation needed for letter field (assumed valid during question creation)

---

## Key Dependencies & Versions

| Package | Version | Used For |
|---------|---------|----------|
| React | 18.3.0 | State management (hooks) |
| Next.js | 15.0.0 | App Router, component framework |
| TypeScript | 5.x | Type safety for state interfaces |
| Tailwind CSS | Latest | Existing styling |
| Jest | 29.7.0 | Unit test runner |
| Playwright | 1.40.0 | E2E test runner |

---

## Migration Notes

**Backward Compatibility**:
- Existing question sets already contain letter field (from earlier planning)
- Existing GameSession type extensions are additive
- No breaking changes to existing components

**Integration Points**:
- Update `types.ts`: Add optional `collectedLetters: CollectedLetters` to GameSession
- Update `gameLogic.ts`: Initialize collectedLetters on game start
- Update `validationLogic.ts`: Store letter when validation passes
- Update `GameContainer.tsx`: Pass collectedLetters to child components
- Update `NavigationChevrons.tsx` and `QuestionGrid.tsx`: Display letters/periods

---

## Conclusion

All technical questions have been resolved through review of existing codebase patterns and the feature specification. The implementation will follow established React patterns, use existing technology stack, and require minimal new code (primarily prop additions and display logic).

**Status**: ✅ Ready to proceed to Phase 1 (data model and contracts)