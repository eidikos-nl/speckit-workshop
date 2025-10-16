# speckit-workshop Development Guidelines

Auto-generated from all feature plans. Last updated: 2025-10-14

## Active Technologies
- TypeScript 5.x with Next.js 14+ (App Router) (001-initialize-game-i)

## Project Structure
```
src/
tests/
```

## Commands
npm test [ONLY COMMANDS FOR ACTIVE TECHNOLOGIES][ONLY COMMANDS FOR ACTIVE TECHNOLOGIES] npm run lint

## Code Style
TypeScript 5.x with Next.js 14+ (App Router): Follow standard conventions

## Recent Changes
- 007-implement-scoring-system: Added [if applicable, e.g., PostgreSQL, CoreData, files or N/A]
- 007-implement-scoring-system

<!-- MANUAL ADDITIONS START -->
```
.
├── CLAUDE.md
├── README.md
├── __tests__
│   ├── e2e
│   │   ├── answer-input-ui.spec.ts
│   │   ├── answer-validation.spec.ts
│   │   ├── direct-selection.spec.ts
│   │   ├── edge-cases.spec.ts
│   │   ├── final-word-submission.spec.ts
│   │   ├── incorrect-answer-feedback.spec.ts
│   │   ├── keyboard-focus-isolation.spec.ts
│   │   ├── multiple-attempts.spec.ts
│   │   ├── page-objects
│   │   │   ├── answerValidationPage.ts
│   │   │   ├── basePage.ts
│   │   │   ├── finalAnswerPage.ts
│   │   │   ├── gamePage.ts
│   │   │   ├── navigationPage.ts
│   │   │   └── timerPage.ts
│   │   ├── scoring-system.spec.ts
│   │   ├── sequential-navigation.spec.ts
│   │   ├── start-game.spec.ts
│   │   ├── stop-game.spec.ts
│   │   ├── timer-display.spec.ts
│   │   ├── timer-early-transition.spec.ts
│   │   ├── timer-game-end.spec.ts
│   │   ├── timer-phase-transition.spec.ts
│   │   └── timer-urgency.spec.ts
│   └── unit
│       ├── finalAnswerValidation.test.ts
│       ├── gameLogic.test.ts
│       ├── navigationLogic.test.ts
│       ├── scoringLogic.test.ts
│       ├── timerLogic.test.ts
│       └── validationLogic.test.ts
├── app
│   ├── api
│   │   └── question-sets
│   │       └── route.ts
│   ├── components
│   │   ├── FinalAnswerInput.tsx
│   │   ├── GameContainer.tsx
│   │   ├── NavigationChevrons.tsx
│   │   ├── QuestionDisplay.tsx
│   │   ├── QuestionGrid.tsx
│   │   ├── ScorePanel.tsx
│   │   └── TimerPanel.tsx
│   ├── error.tsx
│   ├── globals.css
│   ├── hooks
│   │   └── useGameTimer.ts
│   ├── layout.tsx
│   └── page.tsx
├── jest.config.js
├── jest.setup.js
├── lib
│   ├── gameLogic.ts
│   ├── navigationLogic.ts
│   ├── questionSets.ts
│   ├── scoringLogic.ts
│   ├── timerLogic.ts
│   ├── types.ts
│   └── validationLogic.ts
├── next-env.d.ts
├── next.config.js
├── package.json
├── playwright.config.ts
├── pnpm-lock.yaml
├── postcss.config.js
├── question-sets
│   ├── set-1.json
│   ├── set-10.json
│   ├── set-11.json
│   ├── set-12.json
│   ├── set-2.json
│   ├── set-3.json
│   ├── set-4.json
│   ├── set-5.json
│   ├── set-6.json
│   ├── set-7.json
│   ├── set-8.json
│   └── set-9.json
├── scripts
│   └── update-claude-tree.sh
├── specs
│   ├── 001-initialize-game-i
│   │   ├── contracts
│   │   │   └── README.md
│   │   ├── data-model.md
│   │   ├── plan.md
│   │   ├── quickstart.md
│   │   ├── research.md
│   │   ├── spec.md
│   │   └── tasks.md
│   ├── 002-question-navigation-flow
│   │   ├── checklists
│   │   │   └── requirements.md
│   │   ├── contracts
│   │   │   └── README.md
│   │   ├── data-model.md
│   │   ├── plan.md
│   │   ├── quickstart.md
│   │   ├── research.md
│   │   ├── spec.md
│   │   └── tasks.md
│   ├── 003-validate-answers-when
│   │   ├── checklists
│   │   │   └── requirements.md
│   │   ├── plan.md
│   │   ├── research.md
│   │   ├── spec.md
│   │   └── tasks.md
│   ├── 004-letter-collection-we
│   │   ├── checklists
│   │   │   └── requirements.md
│   │   ├── contracts
│   │   │   └── README.md
│   │   ├── data-model.md
│   │   ├── plan.md
│   │   ├── quickstart.md
│   │   ├── research.md
│   │   ├── spec.md
│   │   └── tasks.md
│   ├── 005-final-word-submission
│   │   ├── checklists
│   │   │   └── requirements.md
│   │   ├── contracts
│   │   │   └── README.md
│   │   ├── data-model.md
│   │   ├── plan.md
│   │   ├── quickstart.md
│   │   ├── research.md
│   │   ├── spec.md
│   │   └── tasks.md
│   ├── 006-add-time-limit
│   │   ├── checklists
│   │   │   └── requirements.md
│   │   ├── contracts
│   │   │   └── README.md
│   │   ├── data-model.md
│   │   ├── plan.md
│   │   ├── quickstart.md
│   │   ├── research.md
│   │   ├── spec.md
│   │   └── tasks.md
│   └── 007-implement-scoring-system
│       ├── checklists
│       │   └── requirements.md
│       ├── contracts
│       │   └── README.md
│       ├── plan.md
│       ├── quickstart.md
│       ├── research.md
│       ├── spec.md
│       └── tasks.md
├── tailwind.config.ts
├── tsconfig.json
└── tsconfig.tsbuildinfo

33 directories, 126 files
```
<!-- MANUAL ADDITIONS END -->
