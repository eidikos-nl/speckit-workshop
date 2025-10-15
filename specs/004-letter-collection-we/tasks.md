# Tasks: Letter Collection Display

**Feature**: 004-letter-collection-we  
**Date**: 2025-10-15  
**Status**: Ready for Implementation  
**Tech Stack**: TypeScript 5.x, React 18.3.0, Next.js 15.0.0, Tailwind CSS, Jest 29.7.0, Playwright 1.40.0

---

## Overview

Implement letter collection display in navigation boxes, showing actual letters for correctly answered questions and periods "." for unanswered questions. Letters persist throughout a game session and reset when a new game starts. All three user stories (P1) can be completed in parallel or sequentially with minimal dependencies.

---

## Executive Summary

- **Total Tasks**: 21
- **Task Breakdown**: 
  - Phase 1 (Setup): 2 tasks
  - Phase 2 (Foundational): 4 tasks
  - Phase 3 (US1: View Collected Letters): 5 tasks
  - Phase 4 (US2: View Unanswered Indicators): 3 tasks
  - Phase 5 (US3: Persistence): 3 tasks
  - Phase 6 (Polish): 4 tasks
- **Parallel Opportunities**: US1, US2, US3 can be implemented in parallel after foundational phase
- **Independent Test Criteria Per Story**:
  - **US1**: Answer question correctly → verify letter displays in corresponding box
  - **US2**: Start game with no answers → verify all boxes show periods
  - **US3**: Answer questions, navigate between questions → verify letters persist; stop game → verify letters reset
- **Suggested MVP Scope**: All three user stories (they are all P1 and interdependent for complete feature)

---

## Dependency Graph

```
Phase 1: Setup (project structure)
    ↓
Phase 2: Foundational (types, helpers, initialization)
    ↓
    ├─→ Phase 3: US1 (Display Collected Letters)
    ├─→ Phase 4: US2 (Display Unanswered Indicators)
    └─→ Phase 5: US3 (State Persistence)
         (Can be done in parallel)
    ↓
Phase 6: Polish & Cross-Cutting (E2E tests, validation)
```

---

## Phase 1: Setup

- [x] T001 Verify project structure and existing test configuration in place (`jest.config.js`, `playwright.config.ts`)
- [x] T002 Create feature task tracking by updating this file with progress status

---

## Phase 2: Foundational Prerequisites

- [x] T003 Add `CollectedLetters` type definition to `lib/types.ts` with Record<number, string | null> structure
- [x] T004 Extend `GameSession` interface in `lib/types.ts` to include `collectedLetters: CollectedLetters` property
- [x] T005 Add helper function `getDisplayLetter(questionNumber: number, collectedLetters: CollectedLetters): string` to `lib/validationLogic.ts` returning letter or "."
- [x] T006 Add helper function `isAnsweredCorrectly(questionNumber: number, collectedLetters: CollectedLetters): boolean` to `lib/validationLogic.ts` checking if letter exists

---

## Phase 3: User Story 1 - View Collected Letters (P1)

**Goal**: Display the actual letter in navigation boxes when questions are correctly answered, maintaining green color styling

**Independent Test Criteria**:
- Answer question correctly → corresponding navigation box displays the actual letter
- Verified via E2E test: answer question 1 correctly → check `data-testid="question-square-1"` contains letter

**Acceptance Scenarios** (from spec.md):
1. Answer question correctly with letter → box displays letter + maintains green color
2. Multiple correct answers → all corresponding boxes show their letters
3. Navigate between questions → all letters remain visible

**Tasks**:

- [x] T007 [P] [US1] Update `gameLogic.ts` startGame() to initialize collectedLetters with all positions set to null
- [x] T008 [P] [US1] Add letter extraction and state update to answer validation flow in `lib/validationLogic.ts`
- [x] T009 [P] [US1] Update `GameContainer.tsx` to manage collectedLetters state and pass as prop to child components
- [x] T010 [P] [US1] Update `NavigationChevrons.tsx` to accept collectedLetters prop and display letter or period for each box
- [x] T011 [P] [US1] Update `QuestionGrid.tsx` to accept collectedLetters prop and display letter or period for each square

---

## Phase 4: User Story 2 - View Unanswered Question Indicators (P1)

**Goal**: Display period "." in navigation boxes for questions not yet correctly answered

**Independent Test Criteria**:
- Start new game with no answers → all boxes display period "."
- Answer one question correctly → all other boxes still show period "."
- Verified via E2E test: verify `data-testid="question-square-{N}"` contains "." for unanswered questions

**Acceptance Scenarios** (from spec.md):
1. New game start → all 12 boxes show periods
2. Unanswered question → box displays period "." and is not green
3. Wrong answer attempt → box continues showing period until correct answer

**Tasks**:

- [x] T012 [P] [US2] Update styling logic in `NavigationChevrons.tsx` to show white background with border for period display
- [x] T013 [P] [US2] Update styling logic in `QuestionGrid.tsx` to show white background with border for period display
- [x] T014 [P] [US2] Verify conditional styling applies correct Tailwind classes (bg-green-500 for letters, bg-white border for periods)

---

## Phase 5: User Story 3 - Letter State Persistence (P1)

**Goal**: Maintain letter collection state throughout game session, reset on new game

**Independent Test Criteria**:
- Answer questions, navigate between them → all letters persist
- Stop game and start new game → all boxes reset to periods
- Verified via E2E test: answer Q1, Q3, Q5 → navigate to Q2 → back to Q1 → verify Q1, Q3, Q5 still show letters

**Acceptance Scenarios** (from spec.md):
1. Collect letters from multiple questions → navigate between questions → all letters remain visible
2. Stop game and start new game → new game starts fresh with all boxes showing periods
3. View complete grid → clearly distinguish answered boxes (letters, green) from unanswered (periods, white)

**Tasks**:

- [x] T015 [P] [US3] Verify collectedLetters state persists when question selection changes in `GameContainer.tsx`
- [x] T016 [P] [US3] Verify collectedLetters resets to all null values in `gameLogic.ts` stopGame() and startGame() when new game begins
- [x] T017 [P] [US3] Add manual testing scenario: answer 3+ questions, navigate between them, verify persistence; stop and restart game, verify reset

---

## Phase 6: Polish & Cross-Cutting Concerns

- [x] T018 [P] Add unit tests for `getDisplayLetter()` helper function in `__tests__/unit/validationLogic.test.ts` covering all 12 positions and null values
- [x] T019 [P] Add unit tests for `isAnsweredCorrectly()` helper function in `__tests__/unit/validationLogic.test.ts` covering true and false cases
- [x] T020 [P] Update `__tests__/e2e/answer-validation.spec.ts` to verify letter displays in navigation box after correct answer submission
- [x] T021 [P] Update `__tests__/e2e/multiple-attempts.spec.ts` to verify letters persist when navigating between questions and reset on new game

---

## Parallel Execution Examples

**Scenario A: Sequential (All 3 Stories in Order)**
```
Phase 2 (Foundational) → Phase 3 (US1) → Phase 4 (US2) → Phase 5 (US3) → Phase 6 (Polish)
Timeline: ~2-3 hours per phase
```

**Scenario B: Parallel (All 3 Stories Simultaneously)**
```
Phase 2 (Foundational) 
    ↓
    ├─→ Phase 3 (US1) → Phase 6a (US1 Tests)
    ├─→ Phase 4 (US2) → Phase 6b (US2 Tests) 
    └─→ Phase 5 (US3) → Phase 6c (US3 Tests)
Timeline: ~3-4 hours total (Phase 2 + max(Phase 3,4,5) + Phase 6)
```

**Scenario C: Feature-Complete Incremental**
```
Phase 2 (Foundational) → Phase 3 (US1 Complete) → Phase 4 (US2 Complete) → Phase 5 (US3 Complete) → Phase 6 (All Tests)
(Each phase includes its component updates and E2E tests)
```

---

## Implementation Strategy

### MVP Scope (Recommended)
**All three user stories** - they are interdependent:
- US1 requires US2 (need to distinguish answered from unanswered)
- US2 requires US1 (need to show letters to complete the contrast)
- US3 is automatic when US1+US2 implemented (state management already handles it)
- Total effort: ~1 day for full feature

### Incremental Delivery Order
1. **Foundational** (T003-T006): 30 min - establish types and helpers
2. **US1 Components** (T007-T011): 1 hour - display letters in boxes
3. **US2 Styling** (T012-T014): 30 min - period indicators and styling
4. **US3 Verification** (T015-T017): 30 min - state persistence checks
5. **Polish & Tests** (T018-T021): 1 hour - comprehensive test coverage

### Code Review Checkpoints
- After T006: Review type definitions and contracts
- After T011: Review component prop passing and display logic
- After T017: Review state management and persistence
- After T021: Review test coverage and E2E scenarios

---

## File Changes Summary

| File | Changes | Task IDs |
|------|---------|----------|
| `lib/types.ts` | Add CollectedLetters type; extend GameSession | T003, T004 |
| `lib/gameLogic.ts` | Initialize collectedLetters in startGame() | T007 |
| `lib/validationLogic.ts` | Add helpers; integrate letter collection | T005, T006, T008 |
| `app/components/GameContainer.tsx` | Manage collectedLetters state | T009 |
| `app/components/NavigationChevrons.tsx` | Accept and display collectedLetters | T010, T012 |
| `app/components/QuestionGrid.tsx` | Accept and display collectedLetters | T011, T013 |
| `__tests__/unit/validationLogic.test.ts` | Add helper function tests | T018, T019 |
| `__tests__/e2e/answer-validation.spec.ts` | Verify letter display after validation | T020 |
| `__tests__/e2e/multiple-attempts.spec.ts` | Verify persistence and reset | T021 |

---

## Success Criteria Validation

| Task ID | Success Criteria | Validation Method |
|---------|------------------|-------------------|
| T003-T006 | Types compile without errors | `npm run lint` |
| T007-T011 | Letters display in boxes after correct answer | Manual browser test |
| T012-T014 | Periods show for unanswered; correct styling applied | Visual inspection |
| T015-T017 | Letters persist across navigation; reset on new game | Manual test scenario |
| T018-T019 | All helper functions have passing unit tests | `npm test -- validationLogic` |
| T020-T021 | E2E tests verify display, persistence, reset | `npm run test:e2e` |

---

## Testing Notes

### Unit Test Selectors
- No DOM selectors needed (pure functions)
- Test data: CollectedLetters objects with various null/letter combinations
- Coverage: All 12 positions, null values, edge cases

### E2E Test Selectors
- `data-testid="question-square-{N}"` - Navigation box for question N (N = 1-12)
- Text content assertion: `expect(element).toContainText('S')` or `expect(element).toContainText('.')`
- Styling validation: Check computed classes for `bg-green-500`, `bg-white`

### Manual Testing Checklist
- [ ] Start game → all boxes show period "."
- [ ] Answer question correctly → box turns green with letter
- [ ] Answer multiple questions → all show letters + periods
- [ ] Navigate between questions → letters persist
- [ ] Stop game, start new game → all boxes reset to period "."
- [ ] Test on mobile viewport → responsive grid adapts, text readable
- [ ] Test on multiple browsers → consistent display

---

## Known Constraints & Assumptions

**Constraints**:
- Must preserve existing green color styling for correct answers
- Works with existing navigation box structure
- 12 letter positions (hardcoded)
- Single-character letter display only

**Assumptions**:
- Each question provides exactly one letter (from question data)
- Letter field always present and valid in question-sets/*.json
- React hooks sufficient for state management (no Redux needed)
- CollectedLetters always contains all 12 positions (no sparse objects)
- Navigation between questions doesn't clear state

---

## Next Steps After Completion

1. **Code Review**: Review all component and logic changes against Constitution principles
2. **Full Test Suite**: Run `npm test` (unit) and `npm run test:e2e` (E2E)
3. **Manual Testing**: Desktop and mobile browsers
4. **Feature Demo**: Show letter collection working end-to-end
5. **Prepare for Feature 005**: Letter ordering will reuse CollectedLetters type

---

## Troubleshooting Guide

| Issue | Likely Cause | Solution |
|-------|--------------|----------|
| Letters not displaying | Component not receiving collectedLetters prop | Check prop passing in GameContainer |
| Wrong letter displayed | Question number key mismatch (0-11 vs 1-12) | Verify keys are 1-12, not 0-11 |
| Box not turning green | Styling condition logic incorrect | Check `isAnsweredCorrectly()` return value |
| Letters reset unexpectedly | New GameSession created unintentionally | Verify `startGame()` called only on "New Game" |
| Tests failing with selector not found | Wrong data-testid format | Use exact format: `question-square-{N}` (N = 1-12) |
| Type errors on compilation | Missing type definitions | Verify CollectedLetters and GameSession extended in types.ts |

---

## References

- **Spec**: [`specs/004-letter-collection-we/spec.md`](./spec.md)
- **Data Model**: [`specs/004-letter-collection-we/data-model.md`](./data-model.md)
- **Contracts**: [`specs/004-letter-collection-we/contracts/README.md`](./contracts/README.md)
- **Quick Start**: [`specs/004-letter-collection-we/quickstart.md`](./quickstart.md)
- **Research**: [`specs/004-letter-collection-we/research.md`](./research.md)