# Tasks: Final Word Submission

**Input**: Design documents from `/specs/005-final-word-submission/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story. Testing tasks are included in Phase 7 to comply with project constitution requirements.

## Format: `[ID] [P?] [Story] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions
- Repository root: `/Users/marcelmaas/Developer/speckit-workshop`
- Components: `app/components/`
- Logic: `lib/`
- Tests: `__tests__/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: No project initialization needed - extending existing Next.js app

- [x] T001 Verify existing project structure and dependencies are in place

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core type definitions and validation logic that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T002 [P] Add FinalAnswer interface to lib/types.ts (value, position, submitted, timestamp fields)
- [x] T003 [P] Add GameResult interface to lib/types.ts (outcome, correctAnswer, playerAnswer, timestamp fields)
- [x] T004 Extend GameSession interface in lib/types.ts with optional finalAnswer, gameResult, and gameEnded fields
- [x] T005 Implement validateFinalAnswer function in lib/validationLogic.ts with case-insensitive string comparison

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Submit Final Answer (Priority: P1) 🎯 MVP

**Goal**: Enable players to submit a 12-letter final word and receive immediate win/loss feedback that ends the game

**Independent Test**: Enter a 12-letter word in the final answer boxes, click submit, verify game ends with appropriate green (win) or red (loss) visual feedback and message

### Implementation for User Story 1

- [x] T006 [P] [US1] Create FinalAnswerInput component skeleton in app/components/FinalAnswerInput.tsx with basic props interface
- [x] T007 [P] [US1] Add finalAnswer state (string) to app/components/GameContainer.tsx
- [x] T008 [P] [US1] Add gameEnded state (boolean) to app/components/GameContainer.tsx
- [x] T009 [P] [US1] Add gameResult state (GameResult | null) to app/components/GameContainer.tsx
- [x] T010 [US1] Implement responsive 12-box grid layout in app/components/FinalAnswerInput.tsx using Tailwind grid classes matching QuestionGrid styling (4 cols mobile, 6 cols tablet, 12 cols desktop) with consistent gap spacing (gap-3 sm:gap-4 md:gap-6)
- [x] T011 [US1] Add letter display logic in app/components/FinalAnswerInput.tsx to show each character in its corresponding box
- [x] T012 [US1] Add Submit button to app/components/FinalAnswerInput.tsx with data-testid="final-answer-submit" and disabled state when value length is not exactly 12 characters
- [x] T013 [US1] Implement handleFinalAnswerSubmit handler in app/components/GameContainer.tsx that calls validateFinalAnswer, updates game state, and includes submission guard to prevent duplicate clicks
- [x] T014 [US1] Add conditional rendering in app/components/FinalAnswerInput.tsx for terminal state with green background (bg-green-500) for win
- [x] T015 [US1] Add conditional rendering in app/components/FinalAnswerInput.tsx for terminal state with red background (bg-red-500) for loss
- [x] T016 [US1] Add victory message display in app/components/FinalAnswerInput.tsx showing "Congratulations! You solved the puzzle with the word: {answer}"
- [x] T017 [US1] Add loss message display in app/components/FinalAnswerInput.tsx showing "That is incorrect, try again in a new game"
- [x] T018 [US1] Integrate FinalAnswerInput into app/components/GameContainer.tsx below QuestionGrid with onChange and onSubmit props
- [x] T019 [US1] Add data-testid attributes to final answer boxes (final-answer-box-1 through final-answer-box-12) in app/components/FinalAnswerInput.tsx
- [x] T020 [US1] Add data-testid attributes to submit button (final-answer-submit) and result message (final-answer-result-message) in app/components/FinalAnswerInput.tsx

**Checkpoint**: At this point, User Story 1 should be fully functional - players can submit a 12-letter word and see win/loss feedback

---

## Phase 4: User Story 2 - Visual Letter-by-Letter Input (Priority: P2)

**Goal**: Provide intuitive letter-by-letter input where each typed character appears sequentially in its own box, with backspace support and 12-character limit

**Independent Test**: Click on final answer area, type letters and verify each appears in sequence across boxes, press backspace and verify last letter is removed, type 13th letter and verify it's rejected

### Implementation for User Story 2

- [x] T021 [US2] Add onKeyDown handler in app/components/FinalAnswerInput.tsx to capture keyboard input events
- [x] T022 [US2] Implement letter input filtering in app/components/FinalAnswerInput.tsx to accept only A-Z characters and convert to uppercase
- [x] T023 [US2] Add 12-character maximum length enforcement in app/components/FinalAnswerInput.tsx preventing input beyond limit
- [x] T024 [US2] Implement backspace handling in app/components/FinalAnswerInput.tsx to remove last character from value string
- [x] T025 [US2] Add local focus/position state in app/components/FinalAnswerInput.tsx to track which box is currently active
- [x] T026 [US2] Implement sequential box filling logic in app/components/FinalAnswerInput.tsx moving focus right as letters are added
- [x] T027 [US2] Add cursor indicator styling in app/components/FinalAnswerInput.tsx showing visual cursor in active box
- [x] T028 [US2] Implement click-to-focus functionality in app/components/FinalAnswerInput.tsx allowing users to click any box to start input
- [x] T029 [US2] Add Enter key handler in app/components/FinalAnswerInput.tsx to trigger submission when 12 characters are present
- [x] T030 [US2] Disable input handling in app/components/FinalAnswerInput.tsx when gameEnded is true to prevent interaction after submission

**Checkpoint**: At this point, User Stories 1 AND 2 should both work - players can type letters naturally and see them appear sequentially

---

## Phase 5: User Story 3 - Clear Visual Separation (Priority: P3)

**Goal**: Ensure clear visual distinction between question boxes and final answer boxes through subtle spacing and consistent styling

**Independent Test**: View the game screen and verify there is a noticeable but subtle visual separator between the question grid and final answer boxes, and that box styling matches

### Implementation for User Story 3

- [x] T031 [US3] Add subtle visual spacer in app/components/GameContainer.tsx between QuestionGrid and FinalAnswerInput using border-t with padding
- [x] T032 [US3] Verify final answer boxes in app/components/FinalAnswerInput.tsx use identical styling to QuestionGrid (aspect-square, rounded-lg, border-2, transitions)

**Checkpoint**: All user stories should now be independently functional with clear visual hierarchy

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final improvements and refinements affecting multiple components

- [x] T035 [P] Add smooth color transition animations in app/components/FinalAnswerInput.tsx using transition-colors duration-300
- [x] T036 [P] Add focus indicators to final answer boxes in app/components/FinalAnswerInput.tsx using focus:ring-2 utilities
- [x] T037 [P] Add ARIA labels to boxes in app/components/FinalAnswerInput.tsx describing position and state for accessibility
- [x] T038 Add optional blinking cursor animation in app/globals.css using @keyframes for active box indicator
- [x] T039 Verify all interactive elements in app/components/FinalAnswerInput.tsx have appropriate hover states
- [x] T040 Run npm run lint to verify code style compliance across all modified files
- [x] T041 Verify quickstart.md manual testing checklist against implemented feature

---

## Phase 7: Testing (Constitution Compliance)

**Purpose**: Comprehensive test coverage as mandated by project constitution

**⚠️ CRITICAL**: Constitution requires E2E tests for all features and unit tests for all pure functions

- [x] T035 [P] Create __tests__/unit/finalAnswerValidation.test.ts with unit tests for validateFinalAnswer function (case-insensitive matching, win/loss outcomes)
- [x] T036 [P] Create __tests__/e2e/final-word-submission.spec.ts for User Story 1 (submit correct answer, submit incorrect answer, game ends)
- [x] T037 [P] Add E2E tests for User Story 2 to __tests__/e2e/final-word-submission.spec.ts (letter-by-letter input, backspace, 12-character limit)
- [x] T038 [P] Add E2E tests for User Story 3 to __tests__/e2e/final-word-submission.spec.ts (visual spacer verification, styling consistency)
- [x] T039 [P] Create __tests__/e2e/page-objects/finalAnswerPage.ts with page object methods for final answer UI interactions
- [x] T040 Verify all E2E tests use data-testid selectors (final-answer-box-1 through final-answer-box-12, final-answer-submit, final-answer-result-message)
- [x] T041 Run npm test to verify all tests pass and coverage meets requirements

**Checkpoint**: All features tested - constitution compliance verified

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Final improvements and refinements affecting multiple components

- [x] T042 [P] Add smooth color transition animations in app/components/FinalAnswerInput.tsx using transition-colors duration-300
- [x] T043 [P] Add focus indicators to final answer boxes in app/components/FinalAnswerInput.tsx using focus:ring-2 utilities
- [x] T044 [P] Add ARIA labels to boxes in app/components/FinalAnswerInput.tsx describing position and state for accessibility
- [x] T045 Add optional blinking cursor animation in app/globals.css using @keyframes for active box indicator
- [x] T046 Verify all interactive elements in app/components/FinalAnswerInput.tsx have appropriate hover states
- [x] T047 Run npm run lint to verify code style compliance across all modified files
- [x] T048 Verify quickstart.md manual testing checklist against implemented feature

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Testing (Phase 7)**: Depends on all user stories being complete (Phase 3-5)
- **Polish (Phase 8)**: Depends on all user stories and tests being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after US1 completion - Builds on basic component created in US1
- **User Story 3 (P3)**: Can start after US1 completion - Refines styling established in US1

### Within Each User Story

**User Story 1 (Core Submission):**
- T006-T009: State setup tasks can run in parallel
- T010-T012: Component UI tasks sequential
- T013: Integration depends on component skeleton (T006)
- T014-T017: Feedback rendering can be done together
- T018-T020: Final integration and testing attributes

**User Story 2 (Letter Input):**
- T021-T024: Input handling tasks sequential
- T025-T027: Focus/cursor management sequential
- T028-T030: Final input refinements

**User Story 3 (Visual Separation):**
- T031-T034: Styling tasks can run together

### Parallel Opportunities

- Phase 2: All foundational tasks (T002-T005) marked [P] can run in parallel
- User Story 1: T006-T009 (state setup) can run in parallel
- Phase 7: All testing tasks (T035-T039) marked [P] can be written in parallel once implementation is complete
- Phase 8: T042-T044 (polish tasks) marked [P] can run in parallel
- Once User Story 1 completes, User Story 2 and 3 can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch all state setup tasks for User Story 1 together:
Task T006: "Create FinalAnswerInput component skeleton"
Task T007: "Add finalAnswer state to GameContainer"
Task T008: "Add gameEnded state to GameContainer"
Task T009: "Add gameResult state to GameContainer"

# Then proceed with component implementation sequentially
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (verify existing structure)
2. Complete Phase 2: Foundational (types and validation) - CRITICAL
3. Complete Phase 3: User Story 1 (core submission feature)
4. **STOP and VALIDATE**: Test submission with correct/incorrect answers independently
5. Deploy/demo if ready - game is now completable!

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready (types, validation)
2. Add User Story 1 → Test independently → Deploy/Demo (MVP - basic submission works!)
3. Add User Story 2 → Test independently → Deploy/Demo (enhanced input UX)
4. Add User Story 3 → Test independently → Deploy/Demo (polished visual design)
5. Add Polish → Final refinements → Production ready
6. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together (types, validation)
2. Once Foundational is done:
   - Developer A: Complete User Story 1 (T006-T020)
   - Developer B: Wait for US1, then start User Story 2 (T021-T030)
   - Developer C: Wait for US1, then start User Story 3 (T031-T034)
3. Developer B and C can work in parallel after US1 completes
4. Stories integrate independently into GameContainer

---

## Notes

- [P] tasks = different files, no dependencies, can run simultaneously
- [Story] label maps task to specific user story (US1, US2, US3) for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group (e.g., after completing a user story)
- Stop at any checkpoint to validate story independently
- No test tasks included - tests not explicitly requested in specification
- All tasks use existing project structure (app/, lib/, __tests__)
- Feature is entirely client-side - no API or backend changes needed
- Styling uses existing Tailwind CSS configuration
- Component follows existing pattern from QuestionGrid.tsx

---

## Total Task Count

- **Phase 1 (Setup)**: 1 task
- **Phase 2 (Foundational)**: 4 tasks
- **Phase 3 (User Story 1)**: 15 tasks
- **Phase 4 (User Story 2)**: 10 tasks
- **Phase 5 (User Story 3)**: 2 tasks (merged responsive layout into T010)
- **Phase 7 (Testing)**: 7 tasks
- **Phase 8 (Polish)**: 7 tasks

**TOTAL**: 46 tasks

**Parallelizable**: 14 tasks marked [P]

**MVP Scope**: Phase 1 + Phase 2 + Phase 3 (User Story 1) = 20 tasks
**MVP + Tests**: Add Phase 7 testing = 27 tasks

---

## Suggested MVP Scope

**Minimum Viable Product** = User Story 1 only (20 tasks)

This delivers:
- ✅ Players can submit a final 12-letter word
- ✅ Game ends with clear win/loss feedback
- ✅ Visual feedback with green (win) or red (loss) boxes
- ✅ Appropriate completion messages
- ✅ All core functional requirements met

**Enhancement scope** (optional):
- User Story 2: Better input UX (10 tasks)
- User Story 3: Visual polish (4 tasks)
- Polish phase: Accessibility and animations (7 tasks)

**Enhancement scope** (optional):
- User Story 2: Better input UX (10 tasks)
- User Story 3: Visual polish (2 tasks)
- Polish phase: Accessibility and animations (7 tasks)

**Format Validation**: ✅ All tasks follow checklist format (checkbox, ID, labels, file paths)

**Constitution Compliance**: ✅ Testing phase added with E2E and unit test coverage