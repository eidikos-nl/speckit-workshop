# Implementation Plan: Answer Validation

**Branch**: `003-validate-answers-when` | **Date**: 2025-10-15 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-validate-answers-when/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Implement answer validation for the "2 to Twelve" game, allowing players to submit answers via Enter key or verify button, with case-insensitive comparison against correct answers. Correct answers trigger a green color change with smooth animation on the corresponding navigation box, while incorrect answers display "That is incorrect" in the existing feedback text location. Technical approach uses React state management, pure validation functions, CSS transitions for animations, and existing UI elements without structural changes.

## Technical Context

**Language/Version**: TypeScript 5.x, React 18.3.0, Next.js 15.0.0
**Primary Dependencies**: Next.js (React framework), Tailwind CSS (styling), clsx (conditional classes)
**Storage**: Client-side state for answered questions (extends existing GameSession state pattern)
**Testing**: Jest 29.7.0 (unit tests), Playwright 1.40.0 (E2E tests), @testing-library/react 14.0.0
**Target Platform**: Web browsers (desktop and mobile responsive)
**Project Type**: Web application (Next.js App Router with React components)
**Performance Goals**: Validation response <100ms, color transition animations 300ms, maintain 60fps during animations
**Constraints**: 
- No UI element repositioning (use existing feedback text location at line 62 of QuestionDisplay.tsx)
- Must work with existing navigation state and component structure
- Case-insensitive validation required
- Multiple submission attempts allowed
**Scale/Scope**: Single feature with 3 user stories, ~2 new utility functions, updates to 2-3 existing components, persistent answer state for 12 questions

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### SOLID Principles

**✅ Single Responsibility Principle (SRP)**
- Validation logic separated into pure function (`validateAnswer()` in lib/)
- Answer normalization logic isolated (`normalizeAnswer()`)
- UI feedback rendering separated from validation logic
- State management for answered questions separated from validation

**✅ Open/Closed Principle (OCP)**
- Validation function extensible for future rules (whitespace, special chars) without modifying core logic
- Feedback rendering can be extended with new feedback types without changing validation
- Animation system open for additional transition effects

**✅ Liskov Substitution Principle (LSP)**
- Not applicable - no inheritance hierarchies in this feature

**✅ Interface Segregation Principle (ISP)**
- Components receive only needed props (answer state, validation callback)
- Validation function has minimal, focused interface (answer, correctAnswer) → boolean

**✅ Dependency Inversion Principle (DIP)**
- QuestionDisplay depends on validation callback abstraction, not concrete implementation
- Navigation box coloring depends on answered questions state interface, not validation logic
- Pure validation functions have no dependencies on React or UI libraries

### Testing Standards

**✅ Unit Testing for Pure Functions**
- `validateAnswer()` will have comprehensive unit tests covering:
  - Case-insensitive matching (uppercase, lowercase, mixed)
  - Whitespace trimming (leading, trailing, internal spaces)
  - Special character handling
  - Empty string handling
- `normalizeAnswer()` will be tested in isolation

**✅ E2E Testing for All Features**
- All 3 user stories have acceptance scenarios that map to E2E tests:
  - US1: Submit correct answer → verify green navigation box with animation
  - US2: Submit incorrect answer → verify "That is incorrect" text
  - US3: Multiple attempts → verify state persistence
- Tests will cover both Enter key and button click submission methods

**✅ E2E Test Selector Strategy**
- Reuse existing test selectors:
  - `answer-input` (existing) - for input interaction
  - `verify-button` (existing) - for button clicks
  - `question-square-{N}` (existing) - for verifying green state
- Add new selectors only if needed:
  - `validation-feedback` - for feedback text visibility

**✅ Test-First Development**
- Unit tests for validation logic written before implementation
- E2E tests guide UI integration approach

### Simplicity and Pragmatism

**✅ YAGNI (You Aren't Gonna Need It)**
- No partial match scoring (exact match only after normalization)
- No answer history/logging (future feature if needed)
- No timeout for validation (instant response)
- No debouncing on input changes (clear feedback immediately)
- No complex animation library (CSS transitions sufficient)

**✅ Readability Over Cleverness**
- Explicit validation function over regex magic
- Clear animation class names (animate-success, text-green-600)
- Simple state structure for answered questions (Map<questionId, boolean>)
- Standard Tailwind utility classes for color transitions

**GATE STATUS: ✅ PASSED** - All constitution principles aligned, no violations requiring justification

## Project Structure

### Documentation (this feature)

```
specs/003-validate-answers-when/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```
app/
├── components/
│   ├── QuestionGrid.tsx         # (existing) - UPDATED to reflect answered state with green
│   ├── QuestionDisplay.tsx      # (existing) - UPDATED for validation, feedback, submit handlers
│   └── GameContainer.tsx        # (existing) - UPDATED to manage answered questions state
│
lib/
├── types.ts                     # (existing) - UPDATED with AnswerValidationResult type
├── gameLogic.ts                 # (existing) - may add initialization for answered state
└── validationLogic.ts           # NEW - validation and normalization functions

__tests__/
├── unit/
│   └── validationLogic.test.ts  # NEW - unit tests for validation/normalization
└── e2e/
    ├── answer-validation.spec.ts        # NEW - correct answer validation (US1)
    ├── incorrect-answer-feedback.spec.ts # NEW - incorrect answer feedback (US2)
    ├── multiple-attempts.spec.ts         # NEW - multiple submission tests (US3)
    └── page-objects/
        └── answerValidationPage.ts       # NEW - page object for answer validation
```

**Structure Decision**: This is a Next.js App Router web application. New validation logic will be added to `lib/validationLogic.ts` as pure functions. Existing components (QuestionDisplay, QuestionGrid, GameContainer) will be updated to incorporate validation state and handlers. The existing feedback text element (line 62 of QuestionDisplay.tsx) will be dynamically updated based on validation results. Tests will be organized by user story for clear traceability.

## Complexity Tracking

*Fill ONLY if Constitution Check has violations that must be justified*

No violations - constitution check passed with standard patterns.

## Phase 0: Research (To Be Completed)

*This section will be filled by researching existing implementations and technical requirements*

### Questions to Research
1. How is the current GameContainer managing navigation state? (understand pattern for adding answered state)
2. What animation utilities are already available in globals.css? (reuse existing animation patterns)
3. How are question IDs structured? (ensure proper mapping to answered state)
4. What's the current pattern for handling keyboard events? (implement Enter key submission)

### Technical Investigations
1. Examine existing state management pattern in GameContainer
2. Review Tailwind transition utilities for color animations
3. Test case-insensitive string comparison performance in JS/TS
4. Verify React event handling for Enter key in text inputs

## Phase 1: Design (To Be Completed)

*This section will contain the detailed technical design after research*

### Core Validation Logic Design

**Module**: `lib/validationLogic.ts`

```typescript
// Type definitions
export interface AnswerValidationResult {
  isCorrect: boolean;
  normalizedSubmitted: string;
  normalizedCorrect: string;
}

// Pure function for answer normalization
export function normalizeAnswer(answer: string): string {
  // Trim whitespace and convert to lowercase
  // Handle empty strings
}

// Pure function for answer validation
export function validateAnswer(
  submitted: string, 
  correct: string
): AnswerValidationResult {
  // Normalize both answers
  // Compare
  // Return result with debug info
}
```

### State Management Design

**Answered Questions State**: Extend GameContainer with Map or object tracking

```typescript
// Add to GameContainer state
const [answeredQuestions, setAnsweredQuestions] = useState<Set<string>>(new Set());

// Or use Map for more flexibility
const [answeredQuestions, setAnsweredQuestions] = useState<Map<string, boolean>>(new Map());
```

### Component Integration Design

**QuestionDisplay Updates**:
1. Add `onAnswerSubmit` prop (callback from parent)
2. Add local state for current input value
3. Add local state for validation feedback ('', 'correct', 'incorrect')
4. Handle Enter key in input field
5. Handle button click
6. Update feedback text dynamically based on validation state
7. Clear feedback when input changes

**QuestionGrid Updates**:
1. Accept `answeredQuestions` prop (Set or Map)
2. Apply conditional styling to answered squares (green background, animation)
3. Use clsx for conditional class application

**Animation Design**:
- Use Tailwind `transition-colors duration-300` for smooth green transition
- Add custom animation in globals.css if needed for success pulse/glow effect
- Leverage existing `animate-fade-in` pattern if applicable

### Data Flow

```
User types answer → Enter key or button click
  ↓
QuestionDisplay: Call onAnswerSubmit(answer)
  ↓
GameContainer: Call validateAnswer(answer, question.answer)
  ↓
validationLogic: Return AnswerValidationResult
  ↓
GameContainer: Update answeredQuestions state if correct
  ↓
Props flow down:
  - QuestionDisplay: Receives feedback ('correct'/'incorrect')
  - QuestionGrid: Receives answeredQuestions set
  ↓
UI Updates:
  - QuestionDisplay: Shows "That is incorrect" or clears text
  - QuestionGrid: Green color + animation on answered square
```

## Phase 2: Implementation Tasks (Generated by /speckit.tasks)

*This section will be populated by the `/speckit.tasks` command, NOT by `/speckit.plan`*

The tasks.md file will be created separately with granular implementation steps.

## Success Metrics

From spec.md Success Criteria, implementation must achieve:

- **SC-001**: Answer submission to feedback rendering completes in <500ms (target: <100ms for validation)
- **SC-002**: Case-insensitive validation passes 100% of test cases (uppercase, lowercase, mixed)
- **SC-003**: Navigation box color transition animation completes smoothly in 300ms
- **SC-004**: Both submission methods (Enter + button) produce identical validation results
- **SC-005**: 95% of correct answers successfully update navigation box state on first attempt

## Risk Assessment

### Technical Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| State synchronization between answered questions and UI | Medium | Use single source of truth in GameContainer, pass via props |
| Animation performance on older devices | Low | Use CSS transitions (hardware accelerated), test on target devices |
| Race conditions with rapid submissions | Low | Disable input/button during validation, clear state properly |
| Whitespace/special character edge cases | Medium | Comprehensive unit tests, explicit normalization rules |

### Integration Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Conflict with existing navigation state | Low | Answered state is independent, only reads question IDs |
| Breaking existing E2E tests | Medium | Review existing tests, ensure feedback text doesn't break selectors |
| TypeScript type mismatches | Low | Extend existing types, maintain backward compatibility |

## Dependencies

### External Dependencies
- None (uses existing project dependencies)

### Internal Dependencies
- Builds on Feature 001 (game initialization) - requires Question and GameSession types
- Builds on Feature 002 (navigation) - requires navigation state and QuestionGrid component
- Requires existing QuestionDisplay component structure

### Assumptions
- Question IDs are stable and unique within a question set
- The `answer` field in Question type contains the correct answer
- The existing feedback text element (line 62) can be dynamically updated
- CSS transition support is available in target browsers (modern browsers only)

## Future Considerations

These are explicitly out of scope but documented for future features:

1. **Answer History**: Track all attempts, not just correct/incorrect state
2. **Partial Matching**: "Close enough" feedback for near-correct answers
3. **Hints System**: Progressive hints after N incorrect attempts
4. **Time-based Scoring**: Factor response time into game scoring
5. **Undo Functionality**: Allow players to "unanswer" a question
6. **Keyboard Shortcuts**: Navigate + validate with keyboard only
7. **Accessibility Enhancements**: Screen reader announcements for validation results
8. **Analytics**: Track common wrong answers for question improvement

## Notes

- The existing "Provide the correct answer and earn a letter..." text (line 62, QuestionDisplay.tsx) will be replaced with dynamic content:
  - Empty string when no answer submitted
  - "That is incorrect" when answer is wrong
  - Empty string again when answer is correct (green box is sufficient feedback)
- No structural DOM changes - only text content and CSS classes change
- Animations should feel polished but not distracting (subtle success indication)
- Consider accessibility: color should not be the only indicator (text feedback required)