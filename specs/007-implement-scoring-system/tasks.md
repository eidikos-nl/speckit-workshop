---
description: "Task list for implementing the scoring system feature"
---

# Tasks: Implement Scoring System

**Input**: Design documents from `/specs/007-implement-scoring-system/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4, US5)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Extend GameSession type with scoring fields in `lib/types.ts`
- [x] T002 Create `lib/scoringLogic.ts` with pure scoring calculation functions

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T003 Create ScorePanel component in `app/components/ScorePanel.tsx` matching TimerPanel styling
- [x] T004 Add data-testid attributes to ScorePanel for E2E testing

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - View Running Score During Gameplay (Priority: P1) 🎯 MVP

**Goal**: Display a running score panel in the lower left of the game interface that updates with each answer submission (+10 for correct, -1 for incorrect, minimum 0)

**Independent Test**: Start a game and verify the score panel appears in the lower left and updates correctly after each correct/incorrect answer, with the score never going negative

### Tests for User Story 1 (Unit)

- [x] T005 [P] [US1] Unit test for calculateAnswerScore() with correct answers in `__tests__/unit/scoringLogic.test.ts`
- [x] T006 [P] [US1] Unit test for calculateAnswerScore() with incorrect answers and negative prevention in `__tests__/unit/scoringLogic.test.ts`

### Tests for User Story 1 (E2E)

- [ ] T007 [US1] E2E test for score panel visibility and styling in `__tests__/e2e/scoring-system.spec.ts`
- [ ] T008 [US1] E2E test for score +10 on correct answer in `__tests__/e2e/scoring-system.spec.ts`
- [ ] T009 [US1] E2E test for score -1 on incorrect answer in `__tests__/e2e/scoring-system.spec.ts`
- [ ] T010 [US1] E2E test for score minimum 0 (no negative scores) in `__tests__/e2e/scoring-system.spec.ts`

### Implementation for User Story 1

- [x] T011 [US1] Implement calculateAnswerScore() function in `lib/scoringLogic.ts` (returns newScore based on isCorrect flag)
- [x] T012 [US1] Initialize currentScore to 0 in GameSession at game start in `app/components/GameContainer.tsx`
- [x] T013 [US1] Integrate score update in answer validation handler in `app/components/GameContainer.tsx`
- [x] T014 [US1] Render ScorePanel component in GameContainer with current score in `app/components/GameContainer.tsx`

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Earn Time Bonus for Early Question Completion (Priority: P2)

**Goal**: Award bonus points equal to remaining seconds when the player completes all 12 questions before the 10-minute timer expires

**Independent Test**: Answer all 12 questions correctly with time remaining and verify the bonus points are added to the current score

### Tests for User Story 2 (Unit)

- [x] T015 [P] [US2] Unit test for addTimeBonus() with various remaining times in `__tests__/unit/scoringLogic.test.ts`
- [x] T016 [P] [US2] Unit test for addTimeBonus() with zero remaining seconds in `__tests__/unit/scoringLogic.test.ts`

### Tests for User Story 2 (E2E)

- [ ] T017 [US2] E2E test for time bonus on 12th correct answer in `__tests__/e2e/scoring-system.spec.ts`
- [ ] T018 [US2] E2E test for bonus calculation accuracy (mainTimeRemaining) in `__tests__/e2e/scoring-system.spec.ts`

### Implementation for User Story 2

- [x] T019 [US2] Implement addTimeBonus() function in `lib/scoringLogic.ts`
- [x] T020 [US2] Track when 12th correct answer is submitted in `app/components/GameContainer.tsx`
- [x] T021 [US2] Apply mainTimeRemaining bonus to currentScore on 12th correct answer in `app/components/GameContainer.tsx`
- [x] T022 [US2] Ensure bonus is applied before phase transition to FINAL_ANSWER in `app/components/GameContainer.tsx`

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Reset Score to Zero on Failed Final Word Guess (Priority: P2)

**Goal**: Set the score to 0 and mark isFailed as true if the player fails to guess the correct word before the 2-minute timer expires

**Independent Test**: Complete the question phase with positive score and fail the final word guess, verifying the score becomes 0

### Tests for User Story 3 (Unit)

- [x] T023 [P] [US3] Unit test for calculateFinalScore() with incorrect final word in `__tests__/unit/scoringLogic.test.ts`
- [x] T024 [P] [US3] Unit test for calculateFinalScore() with correct final word in `__tests__/unit/scoringLogic.test.ts`

### Tests for User Story 3 (E2E)

- [ ] T025 [US3] E2E test for score reset to 0 on failed final word in `__tests__/e2e/scoring-system.spec.ts`
- [ ] T026 [US3] E2E test for isFailed flag set on final word failure in `__tests__/e2e/scoring-system.spec.ts`

### Implementation for User Story 3

- [x] T027 [US3] Implement calculateFinalScore() function in `lib/scoringLogic.ts` (returns 0 if failed, score if success)
- [x] T028 [US3] Initialize isFailed to false in GameSession at game start in `app/components/GameContainer.tsx`
- [x] T029 [US3] Detect final word failure (timeout) in `app/components/FinalAnswerInput.tsx`
- [x] T030 [US3] Set currentScore to 0 and isFailed to true on final word failure in `app/components/FinalAnswerInput.tsx`

**Checkpoint**: All user stories 1-3 should now be independently functional

---

## Phase 6: User Story 4 - Earn Time Bonus for Early Final Word Guess (Priority: P2)

**Goal**: Award bonus points equal to remaining seconds from the 2-minute timer when the player guesses the final word correctly

**Independent Test**: Complete all 12 questions correctly and guess the final word correctly with time remaining, verifying the bonus is added to the score

### Tests for User Story 4 (Unit)

- [x] T031 [P] [US4] Unit test for adding finalTimeRemaining bonus in `__tests__/unit/scoringLogic.test.ts`

### Tests for User Story 4 (E2E)

- [ ] T032 [US4] E2E test for time bonus on correct final word guess in `__tests__/e2e/scoring-system.spec.ts`
- [ ] T033 [US4] E2E test for bonus calculation accuracy (finalTimeRemaining) in `__tests__/e2e/scoring-system.spec.ts`

### Implementation for User Story 4

- [x] T034 [US4] Detect correct final word submission in `app/components/FinalAnswerInput.tsx`
- [x] T035 [US4] Apply finalTimeRemaining bonus to currentScore on correct final word in `app/components/FinalAnswerInput.tsx`
- [x] T036 [US4] Set isFailed to false on correct final word in `app/components/FinalAnswerInput.tsx`

**Checkpoint**: All user stories 1-4 should now be independently functional

---

## Phase 7: User Story 5 - Display Final Score in Success Message (Priority: P2)

**Goal**: Include the final score in the success message displayed when the game completes successfully

**Independent Test**: Complete a full game successfully (all 12 questions + correct final word) and verify the success message displays the final score

### Tests for User Story 5 (Unit)

- [x] T037 [P] [US5] Unit test for GameResult validation including finalScore in `__tests__/unit/scoringLogic.test.ts`

### Tests for User Story 5 (E2E)

- [ ] T038 [US5] E2E test for final score display in success message in `__tests__/e2e/scoring-system.spec.ts`

### Implementation for User Story 5

- [x] T039 [US5] Set gameResult.finalScore to currentScore in GameContainer when game ends successfully
- [x] T040 [US5] Modify success message component to include finalScore in displayed text
- [x] T041 [US5] Ensure finalScore displays correctly with data-testid="final-score-display" in success message

**Checkpoint**: All user stories 1-5 should now be fully functional

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T042 [P] Run full test suite (`npm test` and `npx playwright test`) to ensure all tests pass
- [x] T043 [P] Validate scoring logic edge cases (score boundaries, rapid submissions)
- [x] T044 Verify score persists correctly throughout entire game session
- [x] T045 Validate score panel positioning and styling matches timer panel
- [x] T046 [P] Add comprehensive comments and JSDoc to `lib/scoringLogic.ts`
- [ ] T047 Validate all acceptance criteria from spec.md are met
- [ ] T048 Run `/speckit.quickstart.md` validation scenarios

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (US1 → US2 → US3 → US4 → US5)
- **Polish (Phase 8)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories - MVP critical path
- **User Story 2 (P2)**: Can start after US1 complete - Depends on answer submission working
- **User Story 3 (P2)**: Can start after US1 complete - Depends on final word submission
- **User Story 4 (P2)**: Can start after US3 complete - Depends on successful final word submission
- **User Story 5 (P2)**: Can start after US4 complete - Depends on game completion flow

### Within Each User Story

- Unit tests MUST be written and FAIL before implementation
- E2E tests MUST be written and FAIL before implementation
- Implementation completes the feature
- Story complete before moving to next priority

### Parallel Opportunities

- T005-T006 can run in parallel (different test functions)
- T007-T010 can run in parallel (different E2E test scenarios)
- T015-T016 can run in parallel (different unit test functions)
- T023-T024 can run in parallel (different unit test functions)
- T031 unit test can run independently
- T032-T033 can run in parallel (different E2E scenarios)
- T037 unit test can run independently
- T038 E2E test runs independently
- T042-T043 can run in parallel (independent test runs)

---

## Parallel Example: User Story 1 Full Cycle

```bash
# Phase 1: Write tests first (these should FAIL)
npm test -- __tests__/unit/scoringLogic.test.ts

# Phase 2: Implement to make tests pass
# T011 & T012 can be done in parallel conceptually, but T012 requires T011's interface

# Phase 3: Verify with E2E tests
npx playwright test __tests__/e2e/scoring-system.spec.ts
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (tests + implementation)
4. **STOP and VALIDATE**: Test User Story 1 independently with `npm test` and E2E tests
5. Verify score panel visible and updates correctly

### Incremental Delivery (All 5 Stories)

1. Complete Setup + Foundational → Foundation ready
2. Complete US1 → Test independently → MVP validated
3. Complete US2 → Test independently → Question bonus working
4. Complete US3 → Test independently → Final word penalty working
5. Complete US4 → Test independently → Final word bonus working
6. Complete US5 → Test independently → Full feature complete
7. Each story adds value without breaking previous stories

---

## Testing Strategy

### Unit Tests (Pure Functions)

All unit tests in `__tests__/unit/scoringLogic.test.ts`:
- calculateAnswerScore() - correct/incorrect/minimum 0
- addTimeBonus() - with time and without time
- calculateFinalScore() - success and failure paths
- validateScore() - boundary conditions
- validateGameResult() - outcome consistency

### E2E Tests (Integration)

All E2E tests in `__tests__/e2e/scoring-system.spec.ts` using Playwright:
- Score panel visibility and positioning
- Score updates on answer submission
- Time bonus on question completion
- Score reset on final word failure
- Time bonus on final word success
- Final score display in success message

### Test Data & Selectors

- **data-testid="score-panel"**: Main score panel container
- **data-testid="score-value"**: Score number display
- **data-testid="final-score-display"**: Final score in success message

---

## Notes

- [P] tasks = can run in parallel (different files, no dependencies)
- [Story] label maps task to specific user story (US1-US5)
- Each user story is independently completable and testable
- Unit tests must fail before implementation begins
- E2E tests must fail before integration begins
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence

