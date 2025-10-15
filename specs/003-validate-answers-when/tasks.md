---
description: "Task list for Answer Validation feature implementation"
---

# Tasks: Answer Validation

**Input**: Design documents from `/specs/003-validate-answers-when/`
**Prerequisites**: plan.md, spec.md, research.md

**Tests**: This feature includes E2E tests to validate user stories and unit tests for validation logic.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: No additional setup needed - project structure already exists from Features 001 and 002

✅ Setup complete - proceeding to foundational tasks

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core validation infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T001 [P] Create validation logic module with normalizeAnswer function in lib/validationLogic.ts
- [x] T002 [P] Add validateAnswer function to lib/validationLogic.ts
- [x] T003 [P] Add AnswerValidationResult interface to lib/types.ts

**Checkpoint**: ✅ Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Submit and Validate Answer (Priority: P1) 🎯 MVP

**Goal**: Allow players to submit answers and receive immediate validation feedback with green navigation box for correct answers

**Independent Test**: Load a question, enter the correct answer in any case variation (lowercase/uppercase/mixed), submit via Enter key or button, verify the navigation box turns green with animation

### E2E Tests for User Story 1

**NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T004 [P] [US1] Create E2E test for correct answer validation with green feedback in __tests__/e2e/answer-validation.spec.ts
- [x] T005 [P] [US1] Create page object for answer validation interactions in __tests__/e2e/page-objects/answerValidationPage.ts

### Implementation for User Story 1

- [x] T006 [US1] Add answeredQuestions state (Set<string>) to GameContainer in app/components/GameContainer.tsx
- [x] T007 [US1] Add handleAnswerSubmit callback to GameContainer that validates answers and updates answeredQuestions state in app/components/GameContainer.tsx
- [x] T008 [US1] Update QuestionDisplay to add local state for input value and validation feedback in app/components/QuestionDisplay.tsx
- [x] T009 [US1] Add onAnswerSubmit callback prop to QuestionDisplay interface in app/components/QuestionDisplay.tsx
- [x] T010 [US1] Implement Enter key handler (onKeyDown) for answer submission in QuestionDisplay in app/components/QuestionDisplay.tsx
- [x] T011 [US1] Implement button click handler for answer submission in QuestionDisplay in app/components/QuestionDisplay.tsx
- [x] T012 [US1] Pass answeredQuestions state and handleAnswerSubmit callback from GameContainer to QuestionDisplay
- [x] T013 [US1] Update QuestionGrid to accept answeredQuestions prop in app/components/QuestionGrid.tsx
- [x] T014 [US1] Add conditional styling for answered questions (green background) using clsx in QuestionGrid in app/components/QuestionGrid.tsx
- [x] T015 [US1] Add success pulse animation keyframe to app/globals.css
- [x] T016 [US1] Apply animate-success-pulse class to answered navigation boxes in QuestionGrid in app/components/QuestionGrid.tsx

**Checkpoint**: ✅ User Story 1 is fully functional - players can submit correct answers and see green navigation boxes with animations

---

## Phase 4: User Story 2 - Incorrect Answer Feedback (Priority: P2)

**Goal**: Provide clear feedback when players submit incorrect answers so they understand and can try again

**Independent Test**: Enter an incorrect answer, submit, verify "That is incorrect" text appears, modify input to verify feedback clears

### E2E Tests for User Story 2

- [x] T017 [P] [US2] Create E2E test for incorrect answer feedback in __tests__/e2e/incorrect-answer-feedback.spec.ts

### Implementation for User Story 2

- [x] T018 [US2] Update handleAnswerSubmit in QuestionDisplay to set feedbackText to "That is incorrect" for wrong answers in app/components/QuestionDisplay.tsx
- [x] T019 [US2] Update input onChange handler to clear feedbackText when user modifies answer in app/components/QuestionDisplay.tsx
- [x] T020 [US2] Replace placeholder text "Answer verification coming in a future update" with dynamic feedbackText in QuestionDisplay in app/components/QuestionDisplay.tsx
- [x] T021 [US2] Add data-testid="validation-feedback" to feedback paragraph element in app/components/QuestionDisplay.tsx

**Checkpoint**: At this point, User Stories 1 AND 2 should both work - players get visual feedback for both correct (green box) and incorrect (text message) answers

---

## Phase 5: User Story 3 - Multiple Submission Attempts (Priority: P2)

**Goal**: Allow players to submit multiple answers for the same question, learning through trial without penalties

**Independent Test**: Submit several incorrect answers followed by the correct answer, verify all attempts are processed and final correct submission updates navigation box; revisit question and verify state persists

### E2E Tests for User Story 3

- [x] T022 [P] [US3] Create E2E test for multiple submission attempts in __tests__/e2e/multiple-attempts.spec.ts

### Implementation for User Story 3

- [x] T023 [US3] Verify answeredQuestions Set persists during question navigation in GameContainer in app/components/GameContainer.tsx
- [x] T024 [US3] Ensure validation works correctly for already-answered questions (maintains green state) in app/components/GameContainer.tsx
- [x] T025 [US3] Test that feedback clears properly between multiple incorrect submissions in app/components/QuestionDisplay.tsx

**Checkpoint**: All user stories should now be independently functional - players can submit multiple attempts, correct answers update state persistently

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Comprehensive testing and refinements that affect multiple user stories

- [x] T026 [P] Create unit tests for normalizeAnswer function covering edge cases (whitespace, empty strings, unicode) in __tests__/unit/validationLogic.test.ts
- [x] T027 [P] Create unit tests for validateAnswer function covering all validation scenarios in __tests__/unit/validationLogic.test.ts
- [x] T028 [P] Verify all E2E tests pass with both Enter key and button click submission methods
- [x] T029 Run all existing tests to ensure no regressions from Features 001 and 002
- [x] T030 Performance validation - ensure validation completes in <100ms and animations in 300ms

**Checkpoint**: ✅ All phases complete - comprehensive testing validated

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Complete ✅
- **Foundational (Phase 2)**: No dependencies - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - User stories can proceed in parallel (if staffed) after Phase 2
  - Or sequentially in priority order (P1 → P2 → P2)
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Builds on US1 (uses same state/components) but is independently testable
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - Builds on US1 and US2 but is independently testable

### Within Each User Story

- E2E tests MUST be written and FAIL before implementation
- State management before component updates
- QuestionDisplay updates before QuestionGrid styling
- Core validation before feedback mechanisms
- Story complete before moving to next priority

### Parallel Opportunities

- All Foundational tasks (T001-T003) can run in parallel
- E2E tests and page objects (T004-T005) can run in parallel
- Within US1 implementation:
  - T006-T007 (GameContainer state) can run in parallel
  - T008-T011 (QuestionDisplay handlers) can be done together
  - T015 (CSS animation) can be done in parallel with component work
- All unit tests (T026-T027) can run in parallel
- Test validation (T028-T029) can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch all E2E tests for User Story 1 together:
Task: "Create E2E test for correct answer validation with green feedback in __tests__/e2e/answer-validation.spec.ts"
Task: "Create page object for answer validation interactions in __tests__/e2e/page-objects/answerValidationPage.ts"

# Core validation logic (sequential):
Task: "Add answeredQuestions state to GameContainer"
Task: "Add handleAnswerSubmit callback to GameContainer"

# Component updates can overlap:
Task: "Update QuestionDisplay for input/validation state"
Task: "Add success pulse animation to globals.css"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup ✅
2. Complete Phase 2: Foundational (T001-T003)
3. Complete Phase 3: User Story 1 (T004-T016)
4. **STOP and VALIDATE**: Test User Story 1 independently
   - Enter correct answer (various cases)
   - Verify green box with animation
   - Test both Enter key and button
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Validation logic ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP! Core validation works)
3. Add User Story 2 → Test independently → Deploy/Demo (Now with feedback for wrong answers)
4. Add User Story 3 → Test independently → Deploy/Demo (Full validation experience)
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers after Foundational phase completes:

1. **Developer A**: User Story 1 (Core validation + green feedback)
2. **Developer B**: User Story 2 (Incorrect feedback text)
3. **Developer C**: User Story 3 (Multiple attempts validation)

Stories integrate seamlessly since they share the same state infrastructure but test different aspects.

---

## Notes

- [P] tasks = different files, no dependencies, can run in parallel
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- E2E tests should fail before implementation begins
- Unit tests validate pure validation logic
- Existing components are extended, not replaced (minimal disruption)
- No UI repositioning - only content and styling changes
- Animation uses CSS transitions (hardware accelerated, performant)
- State management follows existing pattern from GameContainer
- All three user stories share same infrastructure but test different flows

## Success Validation

After completing all tasks, verify:

- ✅ Validation completes in <100ms (target from plan.md)
- ✅ Green transition animation completes in 300ms
- ✅ Case-insensitive validation works (uppercase, lowercase, mixed)
- ✅ Both Enter key and button produce identical results
- ✅ "That is incorrect" text displays for wrong answers
- ✅ Feedback clears when input changes
- ✅ Multiple submission attempts work correctly
- ✅ State persists during navigation
- ✅ All existing tests still pass (no regressions)