# Implementation Plan: Letter Collection Display

**Branch**: `004-letter-collection-we` | **Date**: 2025-10-15 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-letter-collection-we/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Implement letter collection display in navigation boxes, showing actual letters for correctly answered questions and periods "." for unanswered questions. Letters collected during a game session persist throughout navigation and reset when a new game starts. Technical approach extends existing GameSession state in React to track collected letters, updates the NavigationChevrons component to display letter content, and maintains state consistency through the game lifecycle.

## Technical Context

**Language/Version**: TypeScript 5.x, React 18.3.0, Next.js 15.0.0
**Primary Dependencies**: Next.js (React framework), Tailwind CSS (styling), clsx (conditional classes)
**Storage**: Client-side state (React hooks managing GameSession state)
**Testing**: Jest 29.7.0 (unit tests), Playwright 1.40.0 (E2E tests), @testing-library/react 14.0.0
**Target Platform**: Web browsers (desktop and mobile responsive)
**Project Type**: Web application (Next.js App Router with React components)
**Performance Goals**: Letter display update <100ms after answer validation, smooth state transitions
**Constraints**: Must preserve existing green color styling for correct answers, work with existing navigation box structure
**Scale/Scope**: Single feature with 3 user stories, updates to 1-2 existing React components, 12 letter positions

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### SOLID Principles

**✅ Single Responsibility Principle (SRP)**
- Letter collection state management separated from navigation UI rendering
- Navigation box display logic focused solely on rendering letter content
- Answer validation logic (existing) remains separate from letter collection logic

**✅ Open/Closed Principle (OCP)**
- Letter display format can be extended (e.g., animations) without modifying core collection logic
- Navigation boxes designed to accommodate different content types (letter, period, future symbols)

**✅ Liskov Substitution Principle (LSP)**
- Not applicable - no inheritance hierarchies in this feature

**✅ Interface Segregation Principle (ISP)**
- Components receive only props they need (collected letters map, game state reference)
- No fat interfaces or unnecessary dependencies

**✅ Dependency Inversion Principle (DIP)**
- Components depend on GameSession abstraction (already defined in types.ts)
- Letter collection logic depends on abstraction, not concrete implementation details

### Testing Standards

**✅ Unit Testing for Pure Functions**
- Helper functions for letter state (isLetterCollected, getLetterAtPosition) will have unit tests
- Letter collection update logic will be tested in isolation

**✅ E2E Testing for All Features**
- All 3 user stories have acceptance scenarios that map to E2E tests
- Tests will cover letter display, period display, and state persistence across navigation

**✅ E2E Test Selector Strategy**
- All interactive elements will use data-testid attributes:
  - `question-square-{N}` for grid squares showing letters/periods (N = 1-12)
  - Letter content will be validated via text assertion rather than separate selectors

**✅ Test-First Development**
- Not explicitly required in spec, will follow standard development workflow

### Simplicity and Pragmatism

**✅ YAGNI (You Aren't Gonna Need It)**
- Only implementing letter display functionality specified
- No animations or advanced effects (out of scope)
- No letter ordering logic (separate feature planned)
- Using existing state management approach (React hooks)

**✅ Readability Over Cleverness**
- Clear variable names (collectedLetters, isAnsweredCorrectly)
- Explicit display logic for periods vs. letters
- Standard Tailwind classes for styling

**GATE STATUS: ✅ PASSED** - All constitution principles aligned, no violations requiring justification

## Project Structure

### Documentation (this feature)

```
specs/004-letter-collection-we/
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
│   ├── NavigationChevrons.tsx   # (existing, updated) - display letter content in boxes
│   ├── QuestionGrid.tsx          # (existing, updated) - display letter content in grid squares
│   └── GameContainer.tsx         # (existing, updated) - manage collected letters state
├── page.tsx                      # (existing) - main game page
└── globals.css                   # (existing) - styling

lib/
├── types.ts                      # (existing, updated) - add CollectedLetters type
├── gameLogic.ts                  # (existing, updated) - initialize letter collection on game start
└── validationLogic.ts            # (existing, updated) - update letter collection on correct answer

__tests__/
├── unit/
│   └── validationLogic.test.ts   # (existing, updated) - tests for letter collection updates
└── e2e/
    ├── answer-validation.spec.ts # (existing, updated) - verify letters display after validation
    ├── multiple-attempts.spec.ts # (existing, updated) - verify letter persistence
    └── page-objects/
        └── gamePage.ts           # (existing, updated) - selectors for letter display
```

**Structure Decision**: This feature builds on the existing Next.js App Router web application by extending existing components and types to manage and display collected letters. Key updates are to GameContainer (state management), NavigationChevrons and QuestionGrid (display), types.ts (new CollectedLetters type), and existing test files to verify letter collection behavior. No new files required; primarily additions to existing ones.

## Complexity Tracking

*Fill ONLY if Constitution Check has violations that must be justified*

None - feature adheres to all Constitution principles with no violations.
