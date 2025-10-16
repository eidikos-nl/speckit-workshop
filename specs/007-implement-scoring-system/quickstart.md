# Implementation Plan: Implement Scoring System

**Branch**: `007-implement-scoring-system` | **Date**: 2025-10-16 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/007-implement-scoring-system/spec.md`

## Summary

Implement a scoring system for the "2 to Twelve" word puzzle game that tracks player performance throughout gameplay. Players earn points for correct answers (+10), lose points for incorrect answers (-1, minimum 0), earn time bonuses for efficient completion, and face all-or-nothing consequences for the final word guess. The score is displayed in a lower-left panel matching the timer panel styling, updates immediately with each game event, and is included in the final success message. This feature reuses the existing TypeScript/React/Next.js infrastructure from previous features.

**Technical Approach**: Extend the existing `GameSession` type with scoring fields, create pure scoring calculation functions in a new `lib/scoringLogic.ts` file, integrate score updates at game event handlers (answer validation, phase transitions, final word submission), create a reusable `ScorePanel` component matching `TimerPanel` styling, and implement comprehensive unit and E2E tests using the existing Jest/Playwright stack.

---

## Technical Context

**Language/Version**: TypeScript 5.x with Next.js 15.0.0
**Primary Dependencies**: React 18.3.0, Tailwind CSS 3.x, clsx (existing stack)
**Storage**: Session-only memory state (no database, no persistence)
**Testing**: Jest for unit tests, Playwright for E2E tests
**Target Platform**: Web browser (desktop and mobile)
**Project Type**: Web application (Next.js App Router) - single page
**Performance Goals**:
- Score updates within 100ms of event (SC-002)
- Score calculations instant (client-side, no network latency)
- Score display updates synchronously with state changes

**Constraints**:
- Score is session-only (not persisted between games)
- Score cannot go negative (minimum 0)
- Incorrect final word guess forces score to 0
- All calculations client-side (no API endpoints needed)

**Scale/Scope**:
- Single game session at a time
- Single score value tracked
- No leaderboards, analytics, or multiplayer features
- Minimal state additions to existing GameSession

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### SOLID Principles

**Single Responsibility Principle (SRP)**: ✅ **PASS**
- Scoring logic isolated in pure functions (`lib/scoringLogic.ts`)
- ScorePanel component has single responsibility: display score
- Score updates decoupled from UI rendering
- Each function has one clear purpose (calculate answer score, add bonus, finalize score)

**Open/Closed Principle (OCP)**: ✅ **PASS**
- GameSession type extensible (adding currentScore doesn't require modifying handlers)
- ScorePanel component extensible via props (score value passed in)
- Scoring functions don't require modification to add new score types
- New game mechanics can extend score calculation without changing existing code

**Liskov Substitution Principle (LSP)**: ✅ **PASS**
- Using composition over inheritance (no inheritance hierarchies)
- TypeScript interfaces ensure contract compliance
- Not extensively applicable to simple feature, but consistent with project approach

**Interface Segregation Principle (ISP)**: ✅ **PASS**
- ScorePanel receives only `score` prop it needs
- Score calculation functions have focused parameter sets
- No bloated interfaces; each component/function receives minimal required data

**Dependency Inversion Principle (DIP)**: ✅ **PASS**
- Components depend on score value (abstraction), not calculation method
- Scoring functions are testable in isolation (no dependencies on React, UI, or timers)
- GameSession type provides abstraction for score state

### Testing Standards

**Unit Testing for Pure Functions**: ✅ **PLANNED**
- `calculateAnswerScore()` pure function with unit tests
- `addTimeBonus()` pure function with unit tests
- `calculateFinalScore()` pure function with unit tests
- Target: 100% coverage of pure scoring functions
- Test cases: nominal paths, edge cases (negative scores, zero time), boundary conditions

**End-to-End (E2E) Testing for All Features**: ✅ **PLANNED**
- User Story 1 (View Running Score) → E2E test verifying score display and updates
- User Story 2 (Time Bonus for Question Completion) → E2E test for 12-question bonus
- User Story 3 (Score Reset on Failed Final Word) → E2E test for loss penalty
- User Story 4 (Time Bonus for Final Word Guess) → E2E test for final word bonus
- User Story 5 (Final Score in Success Message) → E2E test for result display
- Edge cases and rapid interactions → E2E coverage
- **Test Selectors**: All E2E tests use `data-testid` attributes (score-panel, score-value, final-score-display)

**Test-First Development**: ❌ **NOT REQUIRED** (standard test-after approach per project convention)

### Simplicity and Pragmatism

**YAGNI (You Aren't Gonna Need It)**: ✅ **PASS**
- Implementing only spec-defined scoring (no bonus multipliers, no leaderboards, no achievements)
- Score tracking only; no persistence layer, no backend API
- Client-side only; no need for API contracts or server logic
- No new external dependencies (uses existing clsx, React hooks)
- Minimal state additions (two fields to GameSession)

**Readability Over Cleverness**: ✅ **PASS**
- Clear variable names (`currentScore`, `isFailed`, `scoreBonus`)
- Pure functions with descriptive names and documentation
- Explicit logic over clever tricks (Math.max(0, x) instead of bitwise operations)
- TypeScript types provide self-documenting code
- Standard React patterns (hooks, props drilling appropriate here)

### Overall Constitution Compliance

**Status**: ✅ **APPROVED** - All principles satisfied. Ready for Phase 0 research and Phase 1 design.

---

## Post-Phase 1 Constitution Re-check

*Re-evaluation after completing research.md, data-model.md, contracts/, and quickstart.md*

### SOLID Principles Review

**Single Responsibility Principle (SRP)**: ✅ **CONFIRMED**
- Pure scoring functions in `lib/scoringLogic.ts` (calculation only)
- ScorePanel component focused on display
- GameSession tracks state; handlers manage updates
- Clear separation: logic ≠ display ≠ state

**Open/Closed Principle (OCP)**: ✅ **CONFIRMED**
- GameSession extensible with new score fields
- Scoring functions composable for future feature additions
- Component props extensible without modification

**Interface Segregation Principle (ISP)**: ✅ **CONFIRMED**
- ScorePanel minimal props (score only)
- Event handlers receive only needed parameters
- No fat interfaces

**Dependency Inversion Principle (DIP)**: ✅ **CONFIRMED**
- Components depend on score value abstraction
- Pure functions testable in isolation
- No tight coupling to React or game engine

**Liskov Substitution Principle (LSP)**: ✅ **CONFIRMED**
- Composition-based design (no inheritance hierarchies)
- Not extensively applicable; approach consistent with project

### Testing Standards Review

**Unit Testing**: ✅ **CONFIRMED**
- `calculateAnswerScore()`, `addTimeBonus()`, `calculateFinalScore()` all unit testable
- Pure functions with predictable inputs/outputs
- Coverage targets established (100% of pure functions)

**E2E Testing**: ✅ **CONFIRMED**
- All five user stories have mapped E2E tests
- Edge cases included (negative prevention, zero bonus, timeout)
- **Test Selector Strategy**: data-testid attributes for stable selectors (score-panel, score-value, final-score-display)

**Test-First**: ❌ **NOT REQUIRED** (standard approach per project)

### Simplicity & Pragmatism Review

**YAGNI**: ✅ **CONFIRMED**
- Only scoring as specified (no extras)
- Minimal state changes (2 new fields)
- No new dependencies
- Session-only storage (no persistence layer)

**Readability**: ✅ **CONFIRMED**
- Clear entity names (currentScore, isFailed, scoreBonus)
- Explicit calculations (Math.max(0, x) for floor)
- Standard React patterns
- Well-documented types and functions

### Final Constitution Compliance

**Status**: ✅ **FULLY COMPLIANT**

All constitutional principles maintained throughout design phase:
- ✅ All SOLID principles satisfied
- ✅ Testing standards met (unit + E2E)
- ✅ YAGNI strictly followed
- ✅ Readability prioritized

**No violations to justify in Complexity Tracking**

**Ready to proceed to Phase 2** (Task generation via `/speckit.tasks` command)

---

## Project Structure

### Documentation (this feature)

```
specs/007-implement-scoring-system/
├── spec.md                     # Feature specification
├── plan.md                     # This file (implementation plan)
├── research.md                 # Phase 0 output (technology decisions)
├── data-model.md               # Phase 1 output (entity definitions)
├── quickstart.md               # Phase 1 output (implementation guide)
├── contracts/                  # Phase 1 output (type contracts)
│   └── README.md
├── checklists/                 # Specification validation
│   └── requirements.md
└── tasks.md                    # Phase 2 output (actionable tasks - NOT created yet)
```

### Source Code (repository root)

```
app/
├── components/
│   ├── ScorePanel.tsx          # NEW: Score display component
│   ├── GameContainer.tsx       # MODIFY: Add score event handlers
│   ├── FinalAnswerInput.tsx    # MODIFY: Include score in final submission
│   └── [existing components]

lib/
├── types.ts                    # MODIFY: Extend GameSession with scoring
├── scoringLogic.ts             # NEW: Pure score calculation functions
├── timerLogic.ts               # EXISTING: Timer utilities (unchanged)
├── gameLogic.ts                # EXISTING: Game logic (unchanged)
├── navigationLogic.ts          # EXISTING: Navigation logic (unchanged)
└── validationLogic.ts          # EXISTING: Answer validation (unchanged)

__tests__/
├── unit/
│   ├── scoringLogic.test.ts    # NEW: Unit tests for scoring functions
│   └── [existing unit tests]
└── e2e/
    ├── scoring-system.spec.ts  # NEW: E2E tests for all scoring scenarios
    └── [existing E2E tests]
```

**Structure Decision**: Follows established Next.js App Router conventions from previous features. Scoring feature is minimal addition to existing architecture:
- New component (ScorePanel) mirrors TimerPanel pattern
- Pure logic isolated in new `lib/scoringLogic.ts` file (testable, reusable)
- GameSession extended with two fields (currentScore, isFailed)
- Modifications to existing handlers integrate score calculations
- Tests organized by type (unit vs. E2E) in `__tests__/`

No restructuring needed; fits naturally into established patterns.

---

## Complexity Tracking

*Fill ONLY if Constitution Check has violations that must be justified*

**Status**: No violations identified.

This feature adheres to all constitutional principles with no justified complexity additions needed. All design decisions prioritize simplicity, clarity, and alignment with existing project patterns.

---

## Implementation Phases

### Phase 0: Research & Clarifications ✅ **COMPLETE**
- All technical unknowns resolved (research.md)
- All spec clarifications addressed
- Technology stack confirmed (no new dependencies)
- No external unknowns remain

### Phase 1: Design & Contracts ✅ **COMPLETE**
- Data model finalized (data-model.md)
- Type contracts defined (contracts/README.md)
- Implementation guide provided (quickstart.md)
- All validation rules specified

### Phase 2: Task Generation (PENDING)
- Run `/speckit.tasks` command to break plan into actionable tasks
- Task breakdown will include specific implementation steps
- Each task maps to feature requirements and acceptance criteria

### Phase 3: Implementation (PENDING)
- Execute tasks from Phase 2
- Implement scoring functions, components, and integration
- Write unit and E2E tests
- Validate against all acceptance criteria

### Phase 4: Validation (PENDING)
- Run full test suite (unit + E2E)
- Verify all user stories pass acceptance tests
- Performance validation (<100ms score updates)
- Code review against constitution

---

## Dependencies & Integration Points

### Modified Files
1. **lib/types.ts**: Add `currentScore` and `isFailed` to GameSession
2. **app/components/GameContainer.tsx**: Add score event handlers
3. **app/components/[result-display].tsx**: Include final score in success message

### New Files
1. **lib/scoringLogic.ts**: Pure scoring calculation functions
2. **app/components/ScorePanel.tsx**: Score display component
3. **__tests__/unit/scoringLogic.test.ts**: Unit tests
4. **__tests__/e2e/scoring-system.spec.ts**: E2E tests

### Unchanged Files
- lib/timerLogic.ts
- lib/gameLogic.ts
- lib/validationLogic.ts
- lib/navigationLogic.ts
- app/layout.tsx
- app/page.tsx

---

## Success Criteria

Feature is complete when:

1. **Functional Requirements** (FR-001 through FR-013):
   - ✅ Score tracked throughout game (FR-001)
   - ✅ +10 for correct answers (FR-002)
   - ✅ -1 for incorrect answers (FR-003)
   - ✅ Score never negative (FR-004)
   - ✅ Score displayed in lower left panel (FR-005, FR-006, FR-007)
   - ✅ Panel styling matches timer (FR-008)
   - ✅ Time bonus on question completion (FR-009, FR-010)
   - ✅ Score reset on failed final word (FR-011)
   - ✅ Time bonus on final word guess (FR-012)
   - ✅ Final score in success message (FR-013)

2. **Measurable Outcomes** (SC-001 through SC-008):
   - ✅ Score panel visible and positioned correctly (SC-001)
   - ✅ Score updates within 100ms (SC-002)
   - ✅ All calculations accurate (SC-003)
   - ✅ Score never displays negative (SC-004)
   - ✅ Time bonus calculations accurate to second (SC-005)
   - ✅ Final score correct in 95%+ of completions (SC-006)
   - ✅ Score persists for full game session (SC-007)
   - ✅ Panel styling matches timer (SC-008)

3. **Testing Coverage**:
   - ✅ 100% unit test coverage for pure functions
   - ✅ E2E tests for all five user stories
   - ✅ Edge cases tested (negative prevention, zero bonus)
   - ✅ All data-testid attributes present

4. **Code Quality**:
   - ✅ All SOLID principles maintained
   - ✅ Constitution compliance verified
   - ✅ No new dependencies introduced
   - ✅ Follows existing project patterns

---

## References

- **Feature Specification**: [spec.md](./spec.md)
- **Research Report**: [research.md](./research.md)
- **Data Model**: [data-model.md](./data-model.md)
- **Type Contracts**: [contracts/README.md](./contracts/README.md)
- **Implementation Guide**: [quickstart.md](./quickstart.md)
- **Project Constitution**: [.specify/memory/constitution.md](.specify/memory/constitution.md)
- **Existing Types**: [lib/types.ts](../../lib/types.ts)

---

**Next Step**: Run `/speckit.tasks` command to generate Phase 2 task breakdown.