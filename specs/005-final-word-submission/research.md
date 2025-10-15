# Research: Final Word Submission

**Phase**: 0 (Research & Clarification)  
**Date**: 2025-10-15  
**Status**: Complete

## Unknowns Resolved

### 1. OTP-Style Input Component Implementation Pattern

**Decision**: Implement as a controlled React component using a single string state value with 12-character max length. Map to 12 individual box UI elements, similar to existing `QuestionGrid.tsx` pattern but for text input instead of navigation.

**Rationale**: 
- Aligns with existing project patterns (React hooks, controlled components)
- Mirrors current `QuestionGrid.tsx` visual styling approach
- OTP inputs are well-understood pattern in React community
- Maintains consistency with project architecture

**Alternatives Considered**:
- HTML5 native "autocomplete=one-time-code" input: Would not provide 12 distinct visual boxes or precise control needed
- 12 separate input fields: Would increase complexity, state management overhead, and keyboard navigation challenges
- Custom range input with display: Would not meet functional requirements for letter-by-letter typing

**Best Practice**: Use single controlled input with programmatic character distribution to visual boxes (React pattern from libraries like react-otp-input, but implemented inline for project consistency).

### 2. Final Answer Validation Logic

**Decision**: Extend existing `lib/validationLogic.ts` with new `validateFinalAnswer(submitted: string, correct: string): FinalAnswerValidationResult` function. Use case-insensitive comparison (matching existing answer validation behavior). Accept only A-Z characters.

**Rationale**:
- Consistency with existing validation pattern in project
- Case-insensitive matching is standard for word games
- Reuses existing validation infrastructure
- Pure function (no side effects) - easily testable

**Alternatives Considered**:
- API-based validation on server: Adds unnecessary latency for game already using client-side state
- Fuzzy matching/Levenshtein distance: Out of scope; spec requires exact match

**Best Practice**: Pure function with comprehensive unit tests covering edge cases (empty input, non-letters, wrong length, correct/incorrect answers).

### 3. Game End State Management

**Decision**: Add `gameEnded` boolean and `gameResult: 'win' | 'loss' | null` to `GameSession` type in `lib/types.ts`. Trigger game end from `GameContainer.tsx` via callback when final answer submitted. Prevent further interaction after game ends.

**Rationale**:
- Extends existing `GameSession` state model without breaking changes
- Allows UI to show terminal state (no further navigation, submission disabled)
- Tracks both game completion and outcome for messaging
- Centralized state management via existing GameContainer pattern

**Alternatives Considered**:
- Separate gameState context provider: Adds complexity; existing GameSession pattern sufficient
- SessionStorage or localStorage: Not needed; already managing state in React

**Best Practice**: Single source of truth in GameContainer state, propagated to child components via props/callbacks.

### 4. Visual Feedback Color Scheme

**Decision**: Use Tailwind CSS `bg-green-500` for correct answers, `bg-red-500` for incorrect answers. Match question box styling from existing `QuestionGrid.tsx` (border radius, shadow, padding).

**Rationale**:
- Consistent with existing color palette (green used in QuestionGrid for answered questions)
- Red provides clear visual distinction for loss state
- Project already uses Tailwind CSS
- High contrast for accessibility

**Alternatives Considered**:
- Custom colors: Not needed; Tailwind palette sufficient
- Animation (pulsing/shake): Spec calls for "red" color change; animation adds complexity

**Best Practice**: Use Tailwind utility classes with animated transitions for smooth color change (CSS `transition-colors duration-300`).

### 5. Keyboard Navigation and Focus Management

**Decision**: Support arrow keys (left/right) to move between boxes, backspace to delete last letter, alphanumeric keys to enter letters. Implement focus trap within 12-box group when input active.

**Rationale**:
- Matches OTP input UX conventions
- Improves accessibility for keyboard-only users
- Enhances mobile experience (though primarily web-focused)
- Reduces mouse dependency

**Alternatives Considered**:
- Tab-only navigation: Would be tedious for 12 boxes
- Mouse-only: Excludes keyboard users and accessibility requirements

**Best Practice**: React onKeyDown handler with normalized key detection (`event.key`, `event.code`), preventDefault for handled keys, allow normal text input for letters.

### 6. Cursor/Focus Indicator

**Decision**: Show focus ring around current/active box using Tailwind `focus:ring-2 focus:ring-offset-2 focus:ring-game-primary` (matching QuestionGrid). In active state, show cursor blinking in the focused box via CSS animation.

**Rationale**:
- Matches existing project focus styles
- Cursor animation provides clear visual feedback of input point
- Accessible via ARIA and visual indicators

**Alternatives Considered**:
- Text cursor in full input: Would not work with split-box layout
- Custom cursor SVG: Unnecessary complexity; CSS sufficient

**Best Practice**: Use standard Tailwind focus utilities + CSS `::before` pseudo-element with blinking animation.

### 7. Backspace Behavior Across Box Boundaries

**Decision**: When backspace pressed on empty box, move focus to previous box and delete from there. When backspace pressed on box with letter, delete from current box. Use single string state with index tracking to manage focus position.

**Rationale**:
- Matches OTP field behavior users expect
- Simplifies state management (single source of truth: the string)
- Natural keyboard interaction

**Alternatives Considered**:
- Array of 12 input refs: Higher complexity; harder to manage focus
- Delete-only-current-box: Breaks user expectation for backspace behavior

**Best Practice**: Map focus index to string position, handle backspace by modifying string and focus index together.

### 8. Testing Strategy

**Decision**: 
- **Unit tests**: `lib/validationLogic.ts` for `validateFinalAnswer` (pure function tests for correct/incorrect/edge cases)
- **E2E tests**: `__tests__/e2e/final-word-submission.spec.ts` using Playwright. Tests full journey: type word, submit, see feedback, game ends
- **Selectors**: Use `data-testid` attributes on each box and submit button (constitution 1.1.0 requirement)

**Rationale**:
- Pure validation logic ideal for unit testing (fast, deterministic)
- E2E tests validate integration with GameContainer and UI feedback
- data-testid provides stable selectors independent of text/ARIA changes

**Alternatives Considered**:
- Snapshot testing: Not appropriate for interactive UI with dynamic state
- Integration tests without E2E: Would miss real browser behavior

**Best Practice**: Follow constitution 1.1.0 E2E test selector strategy (data-testid, not getByRole/getByText). Page object pattern for test organization.

## Technology & Architecture Decisions

### Component Architecture

**FinalAnswerInput Component**:
- Single responsibility: Render 12 input boxes + handle letter input/deletion
- Props: `value: string`, `onChange: (value: string) => void`, `onSubmit: () => void`, `gameEnded: boolean`, `result?: 'win' | 'loss'`
- State: Local focus index only (letter state passed via props)
- Integration: Placed in GameContainer after QuestionGrid

**GameContainer Integration**:
- Add state: `finalAnswer: string`, `gameEnded: boolean`, `gameResult: 'win' | 'loss' | null`
- Add handler: `handleFinalAnswerSubmit()` that validates and updates game state
- Pass to FinalAnswerInput as controlled component

### Styling Approach

Use Tailwind CSS utility classes to:
- Match QuestionGrid box styling (rounded-lg, aspect-square, border, transitions)
- Apply color feedback (green-500, red-500) on result
- Smooth transitions between states (transition-colors duration-300)
- Add subtle separator between question grid and answer boxes (border-t, padding)

### State Management

Extend existing `GameSession` type:
```typescript
interface GameSession {
  isActive: boolean;
  selectedQuestionSet: QuestionSet | null;
  collectedLetters: CollectedLetters;
  gameEnded?: boolean;          // NEW
  gameResult?: 'win' | 'loss';  // NEW
}
```

Minimal changes, backward compatible with existing code.

## Resolved Clarifications Summary

✅ All technical unknowns resolved through best practice research:
- OTP input implementation pattern defined
- Validation logic extension designed
- Game end state model extended
- Visual feedback colors selected
- Keyboard/focus behavior specified
- Testing strategy aligned with constitution
- Component architecture designed for SOLID compliance

**Gate Status**: ✅ READY FOR PHASE 1 DESIGN