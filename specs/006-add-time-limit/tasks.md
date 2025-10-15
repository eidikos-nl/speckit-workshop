# Tasks: Game Time Limits with Dual Timer Display

**Feature**: `006-add-time-limit`  
**Input**: Design documents from `/specs/006-add-time-limit/`  
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅, quickstart.md ✅

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization - no tasks needed as project already exists with TypeScript, React, Next.js, Tailwind CSS, Jest, and Playwright configured.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core type definitions and pure logic functions that MUST be complete before ANY user story implementation

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T001 [P] Add GamePhase enum (EXPLORATION, FINAL_ANSWER, ENDED) to lib/types.ts
- [x] T002 [P] Add TimerState interface to lib/types.ts with mainTimeRemaining, finalTimeRemaining, mainTimerStarted, finalTimerStarted, isTimerStopped, and phase fields
- [x] T003 [P] Extend GameSession interface in lib/types.ts to include timerState field
- [x] T004 [P] Create lib/timerLogic.ts with formatTime() pure function to convert seconds to MM:SS format
- [x] T005 [P] Add calculateRemaining() function to lib/timerLogic.ts for timestamp-based time calculation
- [x] T006 [P] Add determinePhase() function to lib/timerLogic.ts to calculate current game phase from timer states
- [x] T007 [P] Create __tests__/unit/timerLogic.test.ts with tests for formatTime() function (600→"10:00", 65→"1:05", 9→"0:09", 0→"0:00")
- [x] T008 [P] Add tests for calculateRemaining() function in __tests__/unit/timerLogic.test.ts (elapsed time calculation, expiry clamping to 0)
- [x] T009 [P] Add tests for determinePhase() function in __tests__/unit/timerLogic.test.ts (all phase state combinations)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Continuous Time Awareness (Priority: P1) 🎯 MVP

**Goal**: Players can see exactly how much time remains throughout gameplay via a persistent dual-timer display in the bottom right corner that updates every second.

**Independent Test**: Start a game and observe that both timers are visible, positioned correctly, update every second, and display correct countdown values.

### Implementation for User Story 1

- [x] T010 [P] [US1] Create app/hooks/useGameTimer.ts custom hook with state management for mainTimeRemaining and finalTimeRemaining
- [x] T011 [US1] Add timestamp-based countdown logic to app/hooks/useGameTimer.ts using setInterval with 1000ms updates
- [x] T012 [US1] Implement Page Visibility API integration in app/hooks/useGameTimer.ts to recalculate time when tab regains focus
- [x] T013 [US1] Add cleanup function in app/hooks/useGameTimer.ts to prevent memory leaks by clearing intervals on unmount
- [x] T014 [US1] Implement phase transition logic in app/hooks/useGameTimer.ts (EXPLORATION → FINAL_ANSWER → ENDED)
- [x] T015 [US1] Add stopTimer() function to app/hooks/useGameTimer.ts to freeze both timers when called
- [x] T016 [P] [US1] Create app/components/TimerPanel.tsx with fixed positioning (bottom-4 right-4 z-50) and shadow effect
- [x] T017 [US1] Add dual timer display layout to app/components/TimerPanel.tsx (main timer top, separator, final timer bottom)
- [x] T018 [US1] Implement timer text formatting in app/components/TimerPanel.tsx using formatTime() from lib/timerLogic.ts
- [x] T019 [US1] Add data-testid attributes to app/components/TimerPanel.tsx (timer-panel, main-timer-display, final-timer-display)
- [x] T020 [US1] Integrate useGameTimer hook into app/components/GameContainer.tsx with 600s main duration and 120s final duration
- [x] T021 [US1] Add TimerPanel component to JSX in app/components/GameContainer.tsx passing mainTimeRemaining, finalTimeRemaining, phase, and isTimerStopped props
- [x] T022 [US1] Initialize timerState in GameContainer.tsx state when game starts with mainTimeRemaining: 600, finalTimeRemaining: 120, phase: EXPLORATION

### E2E Tests for User Story 1

- [x] T023 [P] [US1] Create __tests__/e2e/timer-display.spec.ts with test for timers visible on game start showing "10:00" and "2:00"
- [x] T024 [P] [US1] Add test to __tests__/e2e/timer-display.spec.ts verifying main timer counts down every second (10:00 → 9:59)
- [x] T025 [P] [US1] Add test to __tests__/e2e/timer-display.spec.ts verifying timer panel remains visible and positioned in bottom-right during gameplay

**Checkpoint**: At this point, User Story 1 should be fully functional - players can see both timers updating every second in a floating panel

---

## Phase 4: User Story 2 - Gameplay Phase Transition (Priority: P2)

**Goal**: When the 10-minute main timer expires, the game automatically transitions to final answer phase where navigation is disabled and UI fades to 20% opacity.

**Independent Test**: Wait for (or manually set) the main timer to reach zero and verify that question navigation becomes disabled, visual opacity changes occur, and final timer starts counting.

### Implementation for User Story 2

- [x] T026 [US2] Implement handleMainTimerExpire callback in app/components/GameContainer.tsx to disable navigation and set UI opacity to 20%
- [x] T027 [US2] Add phase prop to NavigationChevrons component in app/components/GameContainer.tsx to disable when phase !== EXPLORATION
- [x] T028 [P] [US2] Update app/components/NavigationChevrons.tsx to accept disabled prop and prevent navigation when disabled is true
- [x] T029 [US2] Add opacity and disabled props to QuestionDisplay in app/components/GameContainer.tsx based on phase
- [x] T030 [P] [US2] Update app/components/QuestionDisplay.tsx to accept opacity prop and apply style={{ opacity }} and pointer-events-none when phase === FINAL_ANSWER
- [x] T031 [P] [US2] Update app/components/QuestionDisplay.tsx to accept disabled prop and prevent interactions when disabled is true
- [x] T032 [US2] Add opacity prop to QuestionGrid in app/components/GameContainer.tsx to set 0.2 when phase === FINAL_ANSWER
- [x] T033 [P] [US2] Update app/components/QuestionGrid.tsx to accept opacity prop and apply style={{ opacity }}

### E2E Tests for User Story 2

- [x] T034 [P] [US2] Create __tests__/e2e/timer-phase-transition.spec.ts with test for main timer expiry triggering phase transition (main reaches 0:00, final starts countdown)
- [x] T035 [P] [US2] Add test to __tests__/e2e/timer-phase-transition.spec.ts verifying navigation controls become disabled when main timer expires
- [x] T036 [P] [US2] Add test to __tests__/e2e/timer-phase-transition.spec.ts verifying questions and answers fade to 20% opacity when main timer expires
- [x] T037 [P] [US2] Add test to __tests__/e2e/timer-phase-transition.spec.ts verifying question/answer components do not respond to interactions after main timer expiry

**Checkpoint**: At this point, User Stories 1 AND 2 should both work - timers display correctly and phase transition occurs with proper UI changes

---

## Phase 5: User Story 3 - Urgency Visual Indicators (Priority: P3)

**Goal**: Players receive clear visual warnings when time is running critically low through red color changes in the last 10 seconds.

**Independent Test**: Observe timer display when less than 10 seconds remain on either timer and verify the red color change occurs.

### Implementation for User Story 3

- [x] T038 [US3] Add conditional red styling to main timer in app/components/TimerPanel.tsx when mainTimeRemaining <= 10 and phase === EXPLORATION
- [x] T039 [US3] Add conditional red styling to final timer in app/components/TimerPanel.tsx when finalTimeRemaining <= 10 and phase === FINAL_ANSWER
- [x] T040 [US3] Add conditional gray styling to inactive timers in app/components/TimerPanel.tsx (main when phase !== EXPLORATION, final when phase !== FINAL_ANSWER)
- [x] T041 [US3] Use clsx utility in app/components/TimerPanel.tsx to apply text-red-600 for urgent state and text-gray-400 for inactive state

### E2E Tests for User Story 3

- [x] T042 [P] [US3] Create __tests__/e2e/timer-urgency.spec.ts with test for main timer turning red when reaching 10 seconds or less
- [x] T043 [P] [US3] Add test to __tests__/e2e/timer-urgency.spec.ts for final timer turning red when reaching 10 seconds or less
- [x] T044 [P] [US3] Add test to __tests__/e2e/timer-urgency.spec.ts verifying timers remain default color when above 10 seconds

**Checkpoint**: All user stories 1-3 should now work - timers display, update, transition phases, and show urgency indicators

---

## Phase 6: User Story 4 - Time Expiration Game Loss (Priority: P4)

**Goal**: When the final 2-minute timer expires without a valid answer submission, the game ends with a clear loss notification.

**Independent Test**: Allow the final timer to reach zero without submitting an answer and verify the loss message "The time is up, you lost!" appears.

### Implementation for User Story 4

- [x] T045 [US4] Implement handleFinalTimerExpire callback in app/components/GameContainer.tsx to set gameResult to loss and display loss message
- [x] T046 [US4] Set gameResult.outcome to 'loss' in handleFinalTimerExpire in app/components/GameContainer.tsx with correctAnswer and incomplete playerAnswer
- [x] T047 [US4] Set gameEnded to true in handleFinalTimerExpire in app/components/GameContainer.tsx to prevent further gameplay
- [x] T048 [US4] Display "The time is up, you lost!" message in app/components/GameContainer.tsx when gameResult.outcome === 'loss' and final timer expired

### E2E Tests for User Story 4

- [x] T049 [P] [US4] Create __tests__/e2e/timer-game-end.spec.ts with test for final timer expiration showing loss message
- [x] T050 [P] [US4] Add test to __tests__/e2e/timer-game-end.spec.ts verifying both timers stop counting when final timer reaches 0:00
- [x] T051 [P] [US4] Add test to __tests__/e2e/timer-game-end.spec.ts verifying player cannot continue playing or submit answers after final timer expiry

**Checkpoint**: All user stories 1-4 should work - complete timer lifecycle including time expiration loss scenario

---

## Phase 7: User Story 5 - Timer Stops on Success (Priority: P5)

**Goal**: When a player successfully submits the correct final answer, both timers immediately stop counting, indicating the time pressure is over.

**Independent Test**: Submit a correct final answer and verify both timers stop at their current values and remain frozen.

### Implementation for User Story 5

- [x] T052 [US5] Call stopTimer() function in app/components/GameContainer.tsx when correct answer is validated and accepted
- [x] T053 [US5] Update handleCorrectAnswer in app/components/GameContainer.tsx to invoke stopTimer before setting gameResult
- [x] T054 [US5] Verify isTimerStopped is set to true in timerState when stopTimer is called in app/components/GameContainer.tsx
- [x] T055 [US5] Ensure timer displays remain frozen at stopped values in app/components/TimerPanel.tsx when isTimerStopped === true

### E2E Tests for User Story 5

- [x] T056 [P] [US5] Add test to __tests__/e2e/timer-game-end.spec.ts for timers freezing when correct answer submitted during exploration phase
- [x] T057 [P] [US5] Add test to __tests__/e2e/timer-game-end.spec.ts for timers freezing when correct answer submitted during final answer phase
- [x] T058 [P] [US5] Add test to __tests__/e2e/timer-game-end.spec.ts verifying timer displays remain unchanged after 3+ seconds when stopped

**Checkpoint**: All user stories 1-5 complete - full timer feature with display, transitions, urgency, expiration, and success scenarios

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Test infrastructure improvements and final validation

- [x] T059 [P] Create __tests__/e2e/page-objects/timerPage.ts with methods for interacting with timer panel (getMainTimer, getFinalTimer, waitForTimerUpdate, isTimerRed)
- [x] T060 [P] Add aria-live="polite" to timer panel in app/components/TimerPanel.tsx for screen reader accessibility
- [x] T061 [P] Add descriptive aria-label attributes to main and final timer displays in app/components/TimerPanel.tsx
- [x] T062 Run npm test to verify all unit tests pass
- [ ] T063 Run npm test:e2e to verify all E2E tests pass
- [ ] T064 Run quickstart.md validation by manually testing all scenarios described in specs/006-add-time-limit/quickstart.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No tasks - project infrastructure already exists
- **Foundational (Phase 2)**: No dependencies - can start immediately - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (US1 → US2 → US3 → US4 → US5)
- **Polish (Phase 8)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Depends on Foundational (Phase 2) - No dependencies on other stories - Core timer display
- **User Story 2 (P2)**: Depends on US1 completion (needs timer and phase management) - Phase transition functionality
- **User Story 3 (P3)**: Depends on US1 completion (enhances timer display) - Can run parallel with US2
- **User Story 4 (P4)**: Depends on US1 and US2 completion (needs phase management) - Game loss scenario
- **User Story 5 (P5)**: Depends on US1 completion (uses stopTimer function) - Can run parallel with US2-4

### Within Each User Story

- Foundational types and logic before hooks
- Hooks before components
- Components before integration
- Integration before tests (tests verify completed work)
- Core implementation before edge cases

### Parallel Opportunities

**Foundational Phase**:
- T001, T002, T003 (type definitions) can run in parallel
- T004, T005, T006 (pure functions) can run in parallel  
- T007, T008, T009 (unit tests) can run in parallel

**User Story 1**:
- T010-T015 (hook implementation) sequential due to dependencies
- T016-T019 (TimerPanel component) can run parallel with T010-T015
- T023, T024, T025 (E2E tests) can run in parallel

**User Story 2**:
- T028, T030, T031, T033 (component updates) can run in parallel after T026-T027
- T034, T035, T036, T037 (E2E tests) can run in parallel

**User Story 3**:
- T038-T041 (styling updates) can run in parallel
- T042, T043, T044 (E2E tests) can run in parallel

**User Story 4**:
- T045-T048 (implementation) sequential
- T049, T050, T051 (E2E tests) can run in parallel

**User Story 5**:
- T052-T055 (implementation) sequential
- T056, T057, T058 (E2E tests) can run in parallel

**Polish Phase**:
- T059, T060, T061 (improvements) can run in parallel
- T062, T063 (test runs) sequential after all implementation

---

## Parallel Example: User Story 1

```bash
# Launch foundational tasks in parallel:
Task T001: "Add GamePhase enum to lib/types.ts"
Task T002: "Add TimerState interface to lib/types.ts"
Task T003: "Extend GameSession interface in lib/types.ts"
Task T004: "Create lib/timerLogic.ts with formatTime()"
Task T005: "Add calculateRemaining() to lib/timerLogic.ts"
Task T006: "Add determinePhase() to lib/timerLogic.ts"

# After hook implementation starts, launch component work in parallel:
Task T010-T015: "Implement useGameTimer hook" (sequential)
Task T016-T019: "Create TimerPanel component" (parallel to hook)

# Launch all E2E tests for User Story 1 together:
Task T023: "Test timers visible on game start"
Task T024: "Test main timer counts down"
Task T025: "Test timer panel positioning"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 2: Foundational (types + logic + tests)
2. Complete Phase 3: User Story 1 (timer display)
3. **STOP and VALIDATE**: Test User Story 1 independently
4. Deploy/demo basic timer functionality

### Incremental Delivery

1. Complete Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP! - Timer displays)
3. Add User Story 2 → Test independently → Deploy/Demo (Phase transitions work)
4. Add User Story 3 → Test independently → Deploy/Demo (Urgency indicators work)
5. Add User Story 4 → Test independently → Deploy/Demo (Time expiration works)
6. Add User Story 5 → Test independently → Deploy/Demo (Success timer stop works)
7. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Foundational together (Phase 2)
2. Once Foundational is done:
   - Developer A: User Story 1 (blocking for others)
3. After User Story 1:
   - Developer B: User Story 2 (phase transition)
   - Developer C: User Story 3 (urgency indicators)
4. After User Story 2:
   - Developer D: User Story 4 (time expiration)
   - Developer E: User Story 5 (timer stop)
5. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies on other incomplete tasks
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- All tasks include exact file paths for clarity
- Tests verify completed work (not test-first in this feature)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Use data-testid attributes for stable E2E test selectors (not role-based)
- Timestamp-based timer calculation ensures accuracy across tab visibility changes
- All timer state managed client-side (no server persistence)