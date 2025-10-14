# Implementation Plan: Question Navigation Flow

**Branch**: `002-question-navigation-flow` | **Date**: 2025-10-14 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-question-navigation-flow/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Implement question navigation UI for the "2 to Twelve" game, allowing players to navigate through 12 questions using chevron controls (next/previous) and direct selection via a clickable grid. Display one question at a time with visual indication of current position, plus non-functional answer input and verify button scaffolding. Technical approach uses React state management with controlled components, CSS transitions for smooth navigation, and responsive Tailwind layout for desktop/mobile.

## Technical Context

**Language/Version**: TypeScript 5.x, React 18.3.0, Next.js 15.0.0
**Primary Dependencies**: Next.js (React framework), Tailwind CSS (styling), clsx (conditional classes)
**Storage**: N/A (client-side state only, builds on existing GameSession from Feature 001)
**Testing**: Jest 29.7.0 (unit tests), Playwright 1.40.0 (E2E tests), @testing-library/react 14.0.0
**Target Platform**: Web browsers (desktop and mobile responsive)
**Project Type**: Web application (Next.js App Router with React components)
**Performance Goals**: Navigation response <200ms, smooth transitions (100-200ms fade animations), 60fps UI rendering
**Constraints**: Must maintain existing GameSession state structure, responsive layout 1×12 grid on desktop adapting to mobile
**Scale/Scope**: Single feature with 3 user stories, ~3-5 React components, 12 navigation states (questions 1-12)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### SOLID Principles

**✅ Single Responsibility Principle (SRP)**
- Navigation state management separated from question display logic
- Grid component handles direct selection, chevron component handles sequential navigation
- Question display component focuses only on rendering current question

**✅ Open/Closed Principle (OCP)**
- Navigation logic extensible for future keyboard shortcuts without modifying existing code
- Grid squares designed for future letter display without changing core navigation

**✅ Liskov Substitution Principle (LSP)**
- Not applicable - no inheritance hierarchies in this feature

**✅ Interface Segregation Principle (ISP)**
- Components receive only props they need (no fat interfaces)
- Navigation callbacks separated by purpose (onNext, onPrevious, onSelectQuestion)

**✅ Dependency Inversion Principle (DIP)**
- Navigation logic depends on GameSession abstraction (already defined in types.ts)
- UI components depend on navigation state interface, not concrete implementation

### Testing Standards

**✅ Unit Testing for Pure Functions**
- Navigation boundary logic (isFirstQuestion, isLastQuestion) will have unit tests
- Question index calculations will be tested in isolation

**✅ E2E Testing for All Features**
- All 3 user stories have acceptance scenarios that map to E2E tests
- Tests will cover sequential navigation, direct selection, and UI scaffolding

**✅ E2E Test Selector Strategy**
- All interactive elements will use data-testid attributes:
  - `next-chevron`, `previous-chevron`
  - `question-square-{N}` for grid squares (N = 1-12)
  - `answer-input`, `verify-button`
  - `current-question-display`

**✅ Test-First Development**
- Not explicitly required in spec, will follow standard development workflow

### Simplicity and Pragmatism

**✅ YAGNI (You Aren't Gonna Need It)**
- Answer input is non-functional (no premature validation logic)
- No keyboard shortcuts (deferred to future feature)
- No answer persistence (out of scope)
- Navigation state uses simple React useState, no complex state management library

**✅ Readability Over Cleverness**
- Clear component names (QuestionGrid, NavigationChevrons, QuestionDisplay)
- Explicit navigation logic over clever algorithms
- Standard Tailwind classes for styling

**GATE STATUS: ✅ PASSED** - All constitution principles aligned, no violations requiring justification

## Project Structure

### Documentation (this feature)

```
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```
app/
├── components/
│   ├── QuestionGrid.tsx         # 12-square grid for direct navigation
│   ├── NavigationChevrons.tsx   # Next/Previous controls
│   ├── QuestionDisplay.tsx      # Current question + input scaffolding
│   └── GameContainer.tsx        # (existing) - updated to include navigation
├── page.tsx                     # (existing) - main game page
└── globals.css                  # (existing) - styling

lib/
├── types.ts                     # (existing) - GameSession, Question types
├── gameLogic.ts                 # (existing) - game initialization
└── navigationLogic.ts           # NEW - navigation state helpers

__tests__/
├── unit/
│   └── navigationLogic.test.ts  # NEW - unit tests for navigation helpers
└── e2e/
    ├── sequential-navigation.spec.ts  # NEW - chevron navigation tests (US1)
    ├── direct-selection.spec.ts       # NEW - grid selection tests (US2)
    ├── answer-input-ui.spec.ts        # NEW - answer input interface tests (US3)
    └── page-objects/
        └── navigationPage.ts          # NEW - page object for navigation
```

**Structure Decision**: This is a Next.js App Router web application. New navigation components will be added to `app/components/`, new navigation logic helpers to `lib/`, and corresponding tests to `__tests__/`. The existing GameContainer component will be extended to manage navigation state.

## Complexity Tracking

*Fill ONLY if Constitution Check has violations that must be justified*

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
