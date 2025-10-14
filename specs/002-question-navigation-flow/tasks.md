---
description: "Task list for Question Navigation Flow feature implementation"
---

# Tasks: Question Navigation Flow

**Input**: Design documents from `/specs/002-question-navigation-flow/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/
**Tech Stack**: TypeScript 5.x, React 18.3.0, Next.js 15.0.0, Tailwind CSS, clsx

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project structure verification and minimal setup required

- [ ] T001 Verify existing project structure matches plan.md requirements (app/, lib/, __tests__ directories)
- [ ] T002 Verify existing types in lib/types.ts include GameSession and Question interfaces

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core navigation logic that MUST be complete before ANY user story UI can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T003 [P] Create navigation helper function canNavigateNext in lib/navigationLogic.ts
- [ ] T004 [P] Create navigation helper function canNavigatePrevious in lib/navigationLogic.ts
- [ ] T005 [P] Create navigation helper function getNextQuestionIndex in lib/navigationLogic.ts
- [ ] T006 [P] Create navigation helper function getPreviousQuestionIndex in lib/navigationLogic.ts
- [ ] T007 [P] Create navigation helper function isValidQuestionIndex in lib/navigationLogic.ts
- [ ] T008 [P] Write unit tests for navigation helpers in __tests__/unit/navigationLogic.test.ts
- [ ] T009 Verify all unit tests pass for navigation logic (pnpm test:unit)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - View and Navigate Questions Sequentially (Priority: P1) 🎯 MVP

**Goal**: Implement sequential question navigation with next/previous chevron controls, displaying one question at a time with boundary constraints (disabled chevrons at Q1 and Q12)

**Independent Test**: Start game, verify Q1 displays with previous disabled, click next repeatedly to Q12 with next disabled, click previous to navigate back

### E2E Tests for User Story 1

**NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T010 [P] [US1] Create page object for navigation helpers in __tests__/e2e/page-objects/navigationPage.ts
- [ ] T011 [P] [US1] Create E2E test file for sequential navigation in __tests__/e2e/sequential-navigation.spec.ts
- [ ] T012 [US1] Write E2E test scenario: First question displays with "Question 1 of 12" in __tests__/e2e/sequential-navigation.spec.ts
- [ ] T013 [US1] Write E2E test scenario: Previous chevron disabled on question 1 in __tests__/e2e/sequential-navigation.spec.ts
- [ ] T014 [US1] Write E2E test scenario: Next chevron advances to question 2 and enables previous in __tests__/e2e/sequential-navigation.spec.ts
- [ ] T015 [US1] Write E2E test scenario: Previous chevron navigates back in __tests__/e2e/sequential-navigation.spec.ts
- [ ] T016 [US1] Write E2E test scenario: Next chevron disabled on question 12 in __tests__/e2e/sequential-navigation.spec.ts

### Implementation for User Story 1

- [ ] T017 [P] [US1] Create NavigationChevrons component in app/components/NavigationChevrons.tsx
- [ ] T018 [P] [US1] Create QuestionDisplay component with question number display in app/components/QuestionDisplay.tsx
- [ ] T019 [US1] Update GameContainer component to add navigation state management (useState for currentQuestionIndex) in app/components/GameContainer.tsx
- [ ] T020 [US1] Integrate NavigationChevrons into GameContainer with next/previous handlers in app/components/GameContainer.tsx
- [ ] T021 [US1] Integrate QuestionDisplay into GameContainer to show current question in app/components/GameContainer.tsx
- [ ] T022 [US1] Add data-testid attributes to NavigationChevrons (next-chevron, previous-chevron) in app/components/NavigationChevrons.tsx
- [ ] T023 [US1] Add data-testid attribute to QuestionDisplay (current-question-display) in app/components/QuestionDisplay.tsx
- [ ] T024 [US1] Verify all E2E tests pass for User Story 1 (pnpm test:e2e sequential-navigation)

**Checkpoint**: At this point, User Story 1 should be fully functional - sequential navigation with chevrons works independently

---

## Phase 4: User Story 2 - Direct Question Selection via Grid (Priority: P2)

**Goal**: Implement 12-square clickable grid for direct question navigation with visual indication of current question

**Independent Test**: Start game, click square 5 to jump to Q5, click square 2 to jump to Q2, verify active square highlighting changes

### E2E Tests for User Story 2

- [ ] T025 [P] [US2] Create E2E test file for direct selection in __tests__/e2e/direct-selection.spec.ts
- [ ] T026 [US2] Write E2E test scenario: Clicking grid square navigates to corresponding question in __tests__/e2e/direct-selection.spec.ts
- [ ] T027 [US2] Write E2E test scenario: Clicking different squares jumps between questions in __tests__/e2e/direct-selection.spec.ts
- [ ] T028 [US2] Write E2E test scenario: Rapid clicking handles gracefully in __tests__/e2e/direct-selection.spec.ts
- [ ] T029 [US2] Write E2E test scenario: Clicking current square keeps same question displayed in __tests__/e2e/direct-selection.spec.ts

### Implementation for User Story 2

- [ ] T030 [US2] Create QuestionGrid component with 12 clickable squares in app/components/QuestionGrid.tsx
- [ ] T031 [US2] Add active square highlighting logic using currentQuestionIndex prop in app/components/QuestionGrid.tsx
- [ ] T032 [US2] Implement responsive grid layout (1×12 desktop, wrapped on mobile) using Tailwind in app/components/QuestionGrid.tsx
- [ ] T033 [US2] Add data-testid attributes to grid squares (question-square-1 through question-square-12) in app/components/QuestionGrid.tsx
- [ ] T034 [US2] Integrate QuestionGrid into GameContainer with onSelectQuestion handler in app/components/GameContainer.tsx
- [ ] T035 [US2] Add CSS transitions for smooth active square highlight changes in app/components/QuestionGrid.tsx
- [ ] T036 [US2] Verify all E2E tests pass for User Story 2 (pnpm test:e2e direct-selection)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently - both chevron and grid navigation functional

---

## Phase 5: User Story 3 - View Answer Input Interface (Priority: P3)

**Goal**: Add non-functional answer input field and verify button as UI scaffolding for future answer verification feature

**Independent Test**: Navigate to any question, verify input field and verify button are visible and styled, type in input, click verify (no action), navigate to different question (input clears)

### E2E Tests for User Story 3

- [ ] T037 [P] [US3] Create E2E test file for answer input interface in __tests__/e2e/answer-input-ui.spec.ts
- [ ] T038 [US3] Write E2E test scenario: Answer input field visible on all questions in __tests__/e2e/answer-input-ui.spec.ts
- [ ] T039 [US3] Write E2E test scenario: Verify button visible next to input in __tests__/e2e/answer-input-ui.spec.ts
- [ ] T040 [US3] Write E2E test scenario: Typing in input works (non-functional verify) in __tests__/e2e/answer-input-ui.spec.ts
- [ ] T041 [US3] Write E2E test scenario: Input clears when navigating between questions in __tests__/e2e/answer-input-ui.spec.ts

### Implementation for User Story 3

- [ ] T042 [US3] Add answer input field to QuestionDisplay component in app/components/QuestionDisplay.tsx
- [ ] T043 [US3] Add verify button next to input field (no onClick handler) in app/components/QuestionDisplay.tsx
- [ ] T044 [US3] Add data-testid attributes (answer-input, verify-button) in app/components/QuestionDisplay.tsx
- [ ] T045 [US3] Style input field and button using Tailwind CSS in app/components/QuestionDisplay.tsx
- [ ] T046 [US3] Add key prop to QuestionDisplay to clear input on navigation in app/components/GameContainer.tsx
- [ ] T047 [US3] Verify all E2E tests pass for User Story 3 (pnpm test:e2e answer-input-ui)

**Checkpoint**: All user stories should now be independently functional - complete navigation UI with non-functional answer input

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements affecting multiple user stories and final quality checks

- [ ] T048 [P] Add CSS transitions for smooth question changes (fade effect 100-200ms) in app/components/QuestionDisplay.tsx
- [ ] T049 [P] Verify responsive layout works on mobile (test at 375px width) across all components
- [ ] T050 [P] Add ARIA labels for accessibility to all interactive elements
- [ ] T051 [P] Test long question text handling (verify text wrapping and scrolling work correctly)
- [ ] T052 Verify all E2E tests pass together (pnpm test:e2e)
- [ ] T053 Verify all unit tests pass (pnpm test:unit)
- [ ] T054 Run linting and fix any issues (pnpm run lint)
- [ ] T055 Manual testing: Navigate through all 12 questions using chevrons
- [ ] T056 Manual testing: Jump between questions using grid squares
- [ ] T057 Manual testing: Verify disabled states at boundaries (Q1 and Q12)
- [ ] T058 Manual testing: Test rapid navigation and edge cases
- [ ] T059 Run quickstart.md validation and verify all checkboxes complete

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Integrates with US1 but independently testable
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Extends US1 but independently testable

### Within Each User Story

- E2E tests MUST be written and FAIL before implementation
- Components can be built in parallel if marked [P]
- Integration tasks depend on component creation
- E2E test verification comes after implementation
- Story complete before moving to next priority

### Parallel Opportunities

**Phase 2 (Foundational):**
- Tasks T003-T008 (all navigation helper functions and tests) can run in parallel

**Phase 3 (User Story 1):**
- Tasks T010-T016 (page object and E2E test scenarios) can be written in parallel
- Tasks T017-T018 (NavigationChevrons and QuestionDisplay components) can be built in parallel

**Phase 4 (User Story 2):**
- Tasks T025-T029 (all E2E test scenarios) can be written in parallel

**Phase 5 (User Story 3):**
- Tasks T037-T041 (all E2E test scenarios) can be written in parallel

**Phase 6 (Polish):**
- Tasks T048-T051 (CSS transitions, responsive testing, ARIA labels, long text) can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch all E2E test scenarios for User Story 1 together:
Task T010: "Create page object for navigation helpers"
Task T011: "Create E2E test file for sequential navigation"
Task T012: "Write E2E test scenario: First question displays"
Task T013: "Write E2E test scenario: Previous chevron disabled"
Task T014: "Write E2E test scenario: Next chevron advances"
Task T015: "Write E2E test scenario: Previous chevron navigates back"
Task T016: "Write E2E test scenario: Next chevron disabled on Q12"

# Launch component creation for User Story 1 together:
Task T017: "Create NavigationChevrons component"
Task T018: "Create QuestionDisplay component"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T002)
2. Complete Phase 2: Foundational (T003-T009) - CRITICAL, blocks all stories
3. Complete Phase 3: User Story 1 (T010-T024)
4. **STOP and VALIDATE**: Test User Story 1 independently with E2E tests
5. Deploy/demo if ready - basic sequential navigation working

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready (T001-T009)
2. Add User Story 1 → Test independently → Deploy/Demo (T010-T024) - **MVP!**
3. Add User Story 2 → Test independently → Deploy/Demo (T025-T036)
4. Add User Story 3 → Test independently → Deploy/Demo (T037-T047)
5. Polish → Final quality checks → Deploy (T048-T059)
6. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers (after Foundational phase complete):

1. Team completes Setup + Foundational together (T001-T009)
2. Once Foundational is done:
   - Developer A: User Story 1 (T010-T024)
   - Developer B: User Story 2 (T025-T036)
   - Developer C: User Story 3 (T037-T047)
3. Stories complete and integrate independently
4. Team reconvenes for Polish phase (T048-T059)

---

## Summary

**Total Tasks**: 59 tasks across 6 phases
- Phase 1 (Setup): 2 tasks
- Phase 2 (Foundational): 7 tasks (CRITICAL - blocks everything)
- Phase 3 (User Story 1 - P1): 15 tasks (MVP target)
- Phase 4 (User Story 2 - P2): 12 tasks
- Phase 5 (User Story 3 - P3): 11 tasks
- Phase 6 (Polish): 12 tasks

**Parallel Opportunities**: 31 tasks marked [P] can run in parallel within their phase

**Independent Test Criteria**:
- **US1**: Sequential navigation with chevrons works, boundaries enforced
- **US2**: Grid selection jumps to correct question, active highlighting works
- **US3**: Answer input and verify button visible, input clears on navigation

**Suggested MVP Scope**: User Story 1 only (Phase 1 + Phase 2 + Phase 3 = 24 tasks)
- Delivers core sequential navigation functionality
- Provides immediate gameplay value
- Can be deployed and validated independently
- Foundation for adding US2 and US3 incrementally

---

## Notes

- All tasks follow strict checklist format: `- [ ] [ID] [P?] [Story?] Description with file path`
- [P] tasks = different files, no dependencies within phase
- [Story] label (US1, US2, US3) maps task to specific user story for traceability
- Each user story is independently completable and testable
- E2E tests written first (TDD approach), verify they fail before implementation
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence