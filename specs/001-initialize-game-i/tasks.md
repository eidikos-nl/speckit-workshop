# Tasks: Game Initialization for "2 to Twelve"

**Input**: Design documents from `/specs/001-initialize-game-i/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Unit tests for pure functions and E2E tests for user journeys are included per the constitution requirements.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

## Path Conventions
- **Next.js App Router**: `app/`, `lib/`, `__tests__/` at repository root
- Paths follow plan.md structure (no `src/` directory)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization with Next.js 15+, TypeScript, Tailwind CSS, Jest, and Playwright

- [ ] T001 Initialize Next.js project with TypeScript, Tailwind CSS, and App Router using pnpm
- [ ] T002 [P] Install core dependencies: clsx for conditional styling in package.json
- [ ] T003 [P] Install testing dependencies: Jest, @testing-library/react, @testing-library/jest-dom in package.json
- [ ] T004 [P] Install Playwright for E2E testing in package.json
- [ ] T005 [P] Configure Jest with next/jest in jest.config.js
- [ ] T006 [P] Create Jest setup file jest.setup.js with @testing-library/jest-dom import
- [ ] T007 [P] Configure Playwright with webServer auto-start in playwright.config.ts
- [ ] T008 [P] Configure Tailwind CSS with custom game colors in tailwind.config.ts
- [ ] T009 [P] Create global CSS with Tailwind directives and button utility classes in app/globals.css
- [ ] T010 [P] Update package.json scripts for dev, build, test:unit, test:e2e, test:all
- [ ] T011 [P] Create TypeScript configuration with strict mode and path aliases in tsconfig.json
- [ ] T012 [P] Create directory structure: lib/, app/components/, __tests__/unit/, __tests__/e2e/
- [ ] T013 [P] Update root layout to import globals.css and set metadata in app/layout.tsx

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core types, data structures, and business logic that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T014 [P] Define Question interface in lib/types.ts
- [ ] T015 [P] Define QuestionSet interface with validation rules in lib/types.ts
- [ ] T016 [P] Define GameSession interface with state invariants in lib/types.ts
- [ ] T017 [P] Implement isValidActiveSession type guard function in lib/types.ts
- [ ] T018 [P] Define ValidationResult discriminated union types in lib/types.ts
- [ ] T019 [P] Implement validateQuestionSet runtime validation function in lib/types.ts
- [ ] T020 Implement selectRandomQuestionSet pure function in lib/gameLogic.ts (random selection logic)
- [ ] T021 Create questionSets array with 2-3 sample question sets in lib/questionSets.ts (each with 12 questions)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Start New Game (Priority: P1) 🎯 MVP

**Goal**: Players can click "Start New Game" button, which randomly selects a question set and displays its theme on screen

**Independent Test**: Click start button and verify a theme from an available question set is displayed within 1 second

### Unit Tests for User Story 1

- [ ] T022 [P] [US1] Unit test: selectRandomQuestionSet returns element from input array in __tests__/unit/gameLogic.test.ts
- [ ] T023 [P] [US1] Unit test: selectRandomQuestionSet throws error when array is empty in __tests__/unit/gameLogic.test.ts
- [ ] T024 [P] [US1] Unit test: selectRandomQuestionSet selects first item when Math.random returns 0 in __tests__/unit/gameLogic.test.ts
- [ ] T025 [P] [US1] Unit test: selectRandomQuestionSet selects last item when Math.random returns 0.99 in __tests__/unit/gameLogic.test.ts
- [ ] T026 [P] [US1] Unit test: selectRandomQuestionSet covers all sets over multiple iterations (statistical test) in __tests__/unit/gameLogic.test.ts

### Implementation for User Story 1

- [ ] T027 [US1] Implement main game page with 'use client' directive and GameSession useState in app/page.tsx
- [ ] T028 [US1] Implement handleStartGame function that calls selectRandomQuestionSet and updates state in app/page.tsx
- [ ] T029 [US1] Render "Start New Game" button with btn-primary class (visible when !isActive) in app/page.tsx
- [ ] T030 [US1] Render theme display with data-testid="theme-display" (visible when isActive) in app/page.tsx
- [ ] T031 [US1] Add responsive layout with mobile-first styling and max-width container in app/page.tsx
- [ ] T032 [US1] Implement conditional button disabling to prevent starting game while one is active in app/page.tsx

### E2E Tests for User Story 1

- [ ] T033 [US1] E2E test: US1.1 - Start game displays theme in __tests__/e2e/start-game.spec.ts
- [ ] T034 [US1] E2E test: US1.2 - Multiple game starts show theme variety over 10 iterations in __tests__/e2e/start-game.spec.ts
- [ ] T035 [US1] E2E test: US1.3 - Theme is clearly identifiable with readable font size in __tests__/e2e/start-game.spec.ts
- [ ] T036 [US1] E2E test: Performance - Game starts within 1 second (SC-001) in __tests__/e2e/start-game.spec.ts

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently. Players can start a game and see a theme.

---

## Phase 4: User Story 2 - Stop Active Game (Priority: P2)

**Goal**: Players can stop an active game and return to the initial state where they can start a new game

**Independent Test**: Start a game (which displays theme), click stop button, and verify the interface returns to initial state with start button visible

### Implementation for User Story 2

- [ ] T037 [US2] Implement handleStopGame function that resets GameSession state to inactive in app/page.tsx
- [ ] T038 [US2] Render "Stop Game" button with btn-danger class (visible only when isActive) in app/page.tsx
- [ ] T039 [US2] Ensure theme display is hidden when game is stopped (isActive === false) in app/page.tsx
- [ ] T040 [US2] Verify start button becomes visible again after stop in app/page.tsx

### E2E Tests for User Story 2

- [ ] T041 [US2] E2E test: US2.1 - Stop game returns to initial state in __tests__/e2e/stop-game.spec.ts
- [ ] T042 [US2] E2E test: US2.2 - New game after stop selects question set independently in __tests__/e2e/stop-game.spec.ts
- [ ] T043 [US2] E2E test: US2.3 - Stop action has no effect when no game is active in __tests__/e2e/stop-game.spec.ts
- [ ] T044 [US2] E2E test: Performance - Stop completes within 2 seconds (SC-003) in __tests__/e2e/stop-game.spec.ts

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently. Full start/stop game flow is complete.

---

## Phase 5: Edge Cases & Polish

**Purpose**: Handle edge cases and cross-cutting concerns affecting multiple user stories

- [ ] T045 [P] E2E test: Edge case - Rapid multiple clicks on Start button handled gracefully in __tests__/e2e/edge-cases.spec.ts
- [ ] T046 [P] E2E test: Edge case - Only one question set available (random selection always returns it) in __tests__/e2e/edge-cases.spec.ts
- [ ] T047 [P] Add error boundary for graceful error handling (future-proofing) in app/error.tsx
- [ ] T048 [P] Verify responsive design works on mobile, tablet, and desktop viewports via Playwright device emulation
- [ ] T049 [P] Add accessibility attributes (ARIA labels, focus states) to all interactive elements
- [ ] T050 [P] Verify all acceptance scenarios from spec.md pass via E2E tests
- [ ] T051 Run complete test suite (pnpm test:all) and verify 100% user story coverage
- [ ] T052 Validate against success criteria SC-001 through SC-005 from spec.md
- [ ] T053 Run quickstart.md validation and verify all setup instructions work

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-4)**: All depend on Foundational phase completion
  - User Story 1 (P1) can proceed independently after Phase 2
  - User Story 2 (P2) can start after Phase 2 (integrates with US1 but independently testable)
- **Polish (Phase 5)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Uses same GameSession state from US1 but independently testable

### Within Each User Story

- Unit tests should be written alongside implementation
- State management (app/page.tsx) before E2E tests
- Core implementation before E2E validation
- Story complete and validated before moving to next priority

### Parallel Opportunities

**Phase 1 (Setup)**: All tasks marked [P] can run in parallel
- T002, T003, T004 (dependency installation)
- T005, T006, T007 (test configuration)
- T008, T009, T010, T011, T012, T013 (project configuration)

**Phase 2 (Foundational)**: All tasks marked [P] can run in parallel
- T014, T015, T016, T017, T018, T019 (type definitions in lib/types.ts can be added in any order)

**Phase 3 (User Story 1)**: Tests marked [P] can run in parallel
- T022-T026 (all unit tests are independent)

**Phase 4 (User Story 2)**: Implementation tasks can proceed sequentially as they modify the same file (app/page.tsx)

**Phase 5 (Polish)**: All tasks marked [P] can run in parallel
- T045, T046, T047, T048, T049, T050 (different files and test scenarios)

---

## Parallel Example: User Story 1 Unit Tests

```bash
# Launch all unit tests for User Story 1 together:
Task: "Unit test: selectRandomQuestionSet returns element from input array in __tests__/unit/gameLogic.test.ts"
Task: "Unit test: selectRandomQuestionSet throws error when array is empty in __tests__/unit/gameLogic.test.ts"
Task: "Unit test: selectRandomQuestionSet selects first item when Math.random returns 0 in __tests__/unit/gameLogic.test.ts"
Task: "Unit test: selectRandomQuestionSet selects last item when Math.random returns 0.99 in __tests__/unit/gameLogic.test.ts"
Task: "Unit test: selectRandomQuestionSet covers all sets over multiple iterations in __tests__/unit/gameLogic.test.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T013)
2. Complete Phase 2: Foundational (T014-T021) - CRITICAL, blocks all stories
3. Complete Phase 3: User Story 1 (T022-T036)
4. **STOP and VALIDATE**: Run `pnpm test:all`, verify all US1 tests pass
5. **DEMO READY**: Players can start a game and see a theme - minimum viable product achieved!

### Incremental Delivery

1. Complete Setup + Foundational (T001-T021) → Foundation ready
2. Add User Story 1 (T022-T036) → Test independently → **Deploy/Demo (MVP!)**
3. Add User Story 2 (T037-T044) → Test independently → **Deploy/Demo (Complete game flow!)**
4. Add Edge Cases & Polish (T045-T053) → Final validation → **Production ready**

Each phase adds value without breaking previous functionality.

### Parallel Team Strategy

With multiple developers:

1. **Team completes Phase 1 + Phase 2 together** (foundational work benefits from collaboration)
2. Once Phase 2 is done:
   - **Developer A**: User Story 1 (T022-T036)
   - **Developer B**: User Story 2 (T037-T044) - can start in parallel but will integrate US1's state management
3. **Join for Phase 5**: Edge cases and polish together

**Note**: While US1 and US2 *could* be done in parallel by different developers, they share the same file (app/page.tsx) for state management, so sequential implementation is recommended to avoid merge conflicts. The value of US2 also depends on US1 existing, so priority order (P1 → P2) is the natural flow.

---

## Notes

- **[P] tasks** = different files, no dependencies, can be parallelized
- **[Story] label** maps task to specific user story for traceability
- **Each user story should be independently completable and testable**
- **Commit after each task** or logical group of related tasks
- **Stop at any checkpoint** to validate story works independently
- **File paths are absolute**: All paths relative to repository root
- **Constitution compliance**: All tasks follow SOLID principles and YAGNI - no unnecessary abstractions
- **Success criteria validation**: Tasks T050-T053 ensure all spec.md success criteria are met

---

## Task Summary

**Total Tasks**: 53
- **Phase 1 (Setup)**: 13 tasks (12 parallelizable)
- **Phase 2 (Foundational)**: 8 tasks (6 parallelizable)
- **Phase 3 (User Story 1)**: 15 tasks (5 unit tests, 6 implementation, 4 E2E tests)
- **Phase 4 (User Story 2)**: 8 tasks (4 implementation, 4 E2E tests)
- **Phase 5 (Polish)**: 9 tasks (6 parallelizable)

**User Story Breakdown**:
- **User Story 1**: 15 tasks (T022-T036)
- **User Story 2**: 8 tasks (T037-T044)
- **Shared/Setup**: 21 tasks (T001-T021)
- **Polish**: 9 tasks (T045-T053)

**Parallel Opportunities Identified**: 24 tasks marked [P] can be executed in parallel within their phases

**MVP Scope**: Tasks T001-T036 (Setup + Foundational + User Story 1) = 36 tasks for minimum viable product

**Independent Test Criteria**:
- **User Story 1**: Start game → theme displays → tests pass → independently deployable
- **User Story 2**: Start game → stop game → initial state restored → tests pass → independently deployable
