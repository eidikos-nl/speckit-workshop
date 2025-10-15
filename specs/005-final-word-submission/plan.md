# Implementation Plan: Final Word Submission

**Branch**: `005-final-word-submission` | **Date**: 2025-10-15 | **Spec**: [specs/005-final-word-submission/spec.md](spec.md)
**Input**: Feature specification from `/specs/005-final-word-submission/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Implement a 12-letter final answer submission feature where players can enter their final word across 12 individually styled boxes (similar to OTP input fields). Upon submission, the game ends with visual feedback: green boxes and victory message for correct answers, red boxes and loss message for incorrect answers. The final answer section uses identical styling to question boxes with a subtle visual spacer for clear separation. Letters are entered sequentially, with backspace support for removal and a maximum of 12 characters enforced.

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: TypeScript 5.x, React 18.3.0, Next.js 15.0.0
**Primary Dependencies**: React hooks (state management), Tailwind CSS (styling), clsx (conditional classes)
**Storage**: Client-side state only (React hooks managing GameSession)
**Testing**: Jest (unit tests), Playwright (E2E tests), following constitution 1.1.0 with data-testid selectors
**Target Platform**: Web browser (responsive design from mobile to desktop)
**Project Type**: Single web application (Next.js client-side feature)
**Performance Goals**: Immediate visual feedback (<100ms), smooth animations at 60fps
**Constraints**: <50ms input response time, accessible keyboard navigation, case-insensitive letter matching
**Scale/Scope**: Single UI component with 12 input boxes, integrates with existing GameContainer

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Compliance Status: ✅ PASS

**SOLID Principles**:
- ✅ **SRP**: FinalAnswerInput component handles single responsibility (letter-by-letter input). Validation logic separated into lib/validationLogic.ts. Game end state handled by GameContainer.
- ✅ **OCP**: Extension via new components/hooks without modifying existing code. FinalAnswerInput can be reused with different validators.
- ✅ **LSP**: Component maintains expected React component contract (props interface, rendering behavior).
- ✅ **ISP**: FinalAnswerInput accepts only necessary props (value, onChange, onSubmit, gameEnded). No bloated interfaces.
- ✅ **DIP**: Validation injected via callbacks, not hard-coupled to specific validation logic.

**Testing Standards**:
- ✅ **Unit Tests**: Validation logic (lib/validationLogic.ts) tested with pure function tests.
- ✅ **E2E Tests**: Full user journey tested (type letters, backspace, submit, see feedback).
- ✅ **E2E Selectors**: FinalAnswerInput boxes use data-testid (e.g., `final-answer-box-1`, `final-answer-submit`).

**Simplicity & Pragmatism**:
- ✅ **YAGNI**: Only building 12-box input field + validation. No over-generalized OTP library.
- ✅ **Readability**: Clear component naming, descriptive variable names, minimal complexity.

**No violations detected.**

## Project Structure

### Documentation (this feature)

```
specs/005-final-word-submission/
├── plan.md              # This file (completed Phase 1)
├── research.md          # Phase 0 output (to be generated)
├── data-model.md        # Phase 1 output (to be generated)
├── quickstart.md        # Phase 1 output (to be generated)
├── contracts/           # Phase 1 output (to be generated)
├── spec.md              # Feature specification
├── checklists/
│   └── requirements.md  # Requirements tracking
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```
app/
├── components/
│   ├── GameContainer.tsx        # Existing orchestrator
│   ├── QuestionGrid.tsx          # Existing question boxes (12 styled boxes)
│   ├── QuestionDisplay.tsx       # Existing question display
│   ├── FinalAnswerInput.tsx      # NEW: 12-box letter input (mirrors QuestionGrid styling)
│   └── NavigationChevrons.tsx    # Existing navigation
├── globals.css                   # Existing styles (add animations if needed)
├── page.tsx                      # Existing main page
└── api/
    └── question-sets/
        └── route.ts              # Existing API

lib/
├── types.ts                      # Existing types (add FinalAnswer, GameResult types)
├── gameLogic.ts                  # Existing game orchestration (add end-game handler)
├── validationLogic.ts            # Existing validation (add final answer validation)
├── navigationLogic.ts            # Existing navigation logic
└── questionSets.ts               # Existing question data

__tests__/
├── e2e/
│   ├── final-word-submission.spec.ts  # NEW: E2E tests for final answer feature
│   └── page-objects/
│       └── finalAnswerPage.ts         # NEW: Page object for final answer UI
├── unit/
│   └── finalAnswerValidation.test.ts  # NEW: Unit tests for answer validation
```

**Structure Decision**: Extends existing Option 1 (single web project). New component `FinalAnswerInput.tsx` mirrors the visual and behavioral patterns of existing `QuestionGrid.tsx` (12 styled boxes). Integrates into `GameContainer.tsx` as a new section below the question grid. Type definitions added to existing `lib/types.ts`. Validation logic extends existing `lib/validationLogic.ts`. No new directories or structural changes required—purely additive within existing patterns.

## Complexity Tracking

*Fill ONLY if Constitution Check has violations that must be justified*

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
