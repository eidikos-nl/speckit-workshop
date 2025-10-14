# Research Report: Game Initialization Implementation

**Feature**: Game Initialization for "2 to Twelve"
**Date**: 2025-10-14
**Phase**: Phase 0 (Pre-Design Research)

## Overview

This document consolidates research findings for implementing the game initialization feature using Next.js 15+ App Router, TypeScript, Tailwind CSS, Jest, and Playwright with pnpm package management. All decisions follow the YAGNI principle and project constitution requirements.

---

## 1. Next.js 15+ App Router Architecture

### Decision: Server Components by Default, Client Components for Interactive State

**Implementation**:
- Root layout (`app/layout.tsx`): Server Component
- Main game page (`app/page.tsx`): Client Component with `'use client'` directive
- Pure game logic (`lib/gameLogic.ts`): Framework-agnostic functions

**Rationale**:
1. Next.js 15 best practice: Server components by default reduce JavaScript bundle size
2. Game state management requires React hooks (`useState`), necessitating client components
3. Separating pure logic from components improves testability and follows SRP
4. Simple random selection doesn't require Server Actions (would add unnecessary complexity)

**Alternatives Considered**:
- **Full client-side app**: Unnecessary bundle size increase
- **Server Actions for random selection**: Overkill for simple random function; adds network latency
- **Context API for state**: Unnecessary for single-page app with no prop drilling

**Implementation Pattern**:
```typescript
// app/page.tsx
'use client'

import { useState } from 'react'
import { selectRandomQuestionSet } from '@/lib/gameLogic'

interface GameState {
  isActive: boolean
  selectedTheme: string | null
  questionSetId: string | null
}

export default function GamePage() {
  const [gameState, setGameState] = useState<GameState>({
    isActive: false,
    selectedTheme: null,
    questionSetId: null
  })

  const handleStartGame = () => {
    const selected = selectRandomQuestionSet(questionSets)
    setGameState({
      isActive: true,
      selectedTheme: selected.theme,
      questionSetId: selected.id
    })
  }

  // ... render UI
}
```

---

## 2. State Management Strategy

### Decision: React `useState` Hook Only (No External State Libraries)

**Implementation**:
- Single `GameState` interface with three fields: `isActive`, `selectedTheme`, `questionSetId`
- Direct state management in main page component
- No Context API, no Zustand, no Redux

**Rationale**:
1. **YAGNI Compliance**: Only need to track 2-3 simple values (boolean + strings)
2. **No Prop Drilling**: Single-page app with minimal component nesting
3. **React 19 Compatible**: `useState` works seamlessly with Next.js 15
4. **Simplicity**: Reduces cognitive load and maintenance burden
5. **Official Recommendation**: Next.js docs recommend built-in hooks for component-level state

**Alternatives Considered**:
- **Context API**: Appropriate for multi-component state sharing; unnecessary here
- **Zustand/Jotai**: Excellent libraries but add external dependency for trivial state
- **useReducer**: Overkill for simple boolean/string state without complex transitions

---

## 3. Random Selection Implementation

### Decision: Client-Side Random Selection in Button Click Handler

**Implementation**:
```typescript
// lib/gameLogic.ts (pure function)
export function selectRandomQuestionSet(sets: QuestionSet[]): QuestionSet {
  if (sets.length === 0) throw new Error('No question sets available')
  const randomIndex = Math.floor(Math.random() * sets.length)
  return sets[randomIndex]
}

// app/page.tsx (event handler)
const handleStartGame = () => {
  const selected = selectRandomQuestionSet(questionSets)
  setGameState({ /* ... */ })
}
```

**Rationale**:
1. **Hydration Safety**: Event-driven selection avoids server/client mismatch errors
2. **Performance**: Instant response without network round-trip
3. **Testability**: Pure function easily testable with mocked `Math.random()`
4. **UX Alignment**: Selection triggered by explicit user action matches spec requirements
5. **No SSR Issues**: Client-side event handlers never cause hydration problems

**Alternatives Considered**:
- **Server Actions**: Adds unnecessary network latency for instant client-side operation
- **useEffect on mount**: Violates spec requirement (game starts only on button click)
- **Suppress hydration warnings**: Anti-pattern that hides real issues

---

## 4. Tailwind CSS Configuration

### Decision: Tailwind v3 with TypeScript Config and Minimal Theme Extensions

**Configuration**:

**File: `tailwind.config.ts`**
```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'game-active': '#10b981',
        'game-inactive': '#6b7280',
        'game-primary': '#3b82f6',
        'game-danger': '#ef4444',
      },
    },
  },
  plugins: [],
}

export default config
```

**File: `app/globals.css`**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply antialiased bg-gray-50 text-gray-900;
  }
}

@layer components {
  .btn-primary {
    @apply px-6 py-3 bg-game-primary text-white rounded-lg font-medium
           hover:bg-blue-600 active:bg-blue-700
           transition-colors duration-200
           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
           disabled:opacity-50 disabled:cursor-not-allowed;
  }

  .btn-danger {
    @apply px-6 py-3 bg-game-danger text-white rounded-lg font-medium
           hover:bg-red-600 active:bg-red-700
           transition-colors duration-200
           focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2;
  }
}
```

**Rationale**:
1. **Tailwind v3 Stability**: v4 still in beta; v3 provides mature, production-ready solution
2. **TypeScript Config**: Better IDE support and type safety
3. **Minimal Extensions**: Only add game-specific colors; leverage Tailwind defaults otherwise
4. **Component Classes**: Use `@apply` only for repeated button patterns (DRY principle)
5. **Mobile-First**: Tailwind's default approach aligns with mobile game requirements

**Styling Approach**:
- **Utility-first**: Most styles inline using utility classes
- **@apply for buttons**: Repeated patterns defined once in globals.css
- **Responsive**: Mobile-first with `md:` and `lg:` breakpoints
- **Conditional styling**: Use `clsx` library for state-based classes

**Alternatives Considered**:
- **Tailwind v4**: Rejected due to beta status
- **CSS Modules**: Less appropriate for rapid prototyping
- **Styled Components**: Adds runtime overhead; unnecessary for utility-first approach

---

## 5. Testing Configuration

### Decision: Jest for Unit Tests, Playwright for E2E Tests

**Jest Configuration** (`jest.config.js`):
```javascript
const nextJest = require('next/jest')

const createJestConfig = nextJest({ dir: './' })

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  testMatch: [
    '**/__tests__/unit/**/*.test.ts',
    '**/__tests__/unit/**/*.test.tsx',
  ],
  collectCoverageFrom: [
    'lib/**/*.{ts,tsx}',
    'app/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
}

module.exports = createJestConfig(customJestConfig)
```

**Playwright Configuration** (`playwright.config.ts`):
```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './__tests__/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
})
```

**Rationale**:
1. **next/jest**: Zero-config integration for Next.js-specific transformations
2. **Separation**: Jest for fast unit tests, Playwright for comprehensive E2E tests
3. **Auto-server**: Playwright's `webServer` config eliminates manual server management
4. **CI-Ready**: Retries and single workers for CI stability
5. **Official Stack**: Most common and well-documented Next.js testing approach

**Unit Testing Pattern for Pure Functions**:
```typescript
// __tests__/unit/gameLogic.test.ts
import { selectRandomQuestionSet } from '@/lib/gameLogic'

describe('selectRandomQuestionSet', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('selects first item when Math.random returns 0', () => {
    jest.spyOn(global.Math, 'random').mockReturnValue(0)
    const selected = selectRandomQuestionSet(mockSets)
    expect(selected).toBe(mockSets[0])
  })

  it('throws error when input array is empty', () => {
    expect(() => selectRandomQuestionSet([])).toThrow('No question sets available')
  })
})
```

**E2E Testing Pattern**:
```typescript
// __tests__/e2e/start-game.spec.ts
import { test, expect } from '@playwright/test'

test.describe('User Story 1: Start New Game', () => {
  test('US1.1: Start game displays theme', async ({ page }) => {
    await page.goto('/')

    const startButton = page.getByRole('button', { name: /start new game/i })
    await startButton.click()

    const themeDisplay = page.getByTestId('theme-display')
    await expect(themeDisplay).toBeVisible()
    await expect(themeDisplay).not.toBeEmpty()
  })
})
```

**Alternatives Considered**:
- **Vitest**: Faster but Jest has better Next.js ecosystem support
- **Cypress**: Good DX but Playwright offers better performance and multi-browser support
- **Co-located tests**: Clutters source directories; separate `__tests__/` is cleaner

---

## 6. Project Structure

### Decision: Flat Structure with `app/`, `lib/`, `__tests__/` at Root

**Directory Layout**:
```
speckit-workshop/
├── app/
│   ├── layout.tsx          # Root layout (server component)
│   ├── page.tsx            # Main game page ('use client')
│   ├── globals.css         # Global styles with Tailwind
│   └── components/
│       ├── StartGameButton.tsx
│       ├── StopGameButton.tsx
│       └── ThemeDisplay.tsx
├── lib/
│   ├── types.ts            # TypeScript interfaces
│   ├── gameLogic.ts        # Pure functions
│   └── questionSets.ts     # Static data
├── __tests__/
│   ├── unit/
│   │   └── gameLogic.test.ts
│   └── e2e/
│       ├── start-game.spec.ts
│       └── stop-game.spec.ts
├── public/
├── jest.config.js
├── jest.setup.js
├── playwright.config.ts
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

**Rationale**:
1. **Official Next.js Structure**: Matches Next.js 15 App Router conventions
2. **Clear Separation**: `app/` for UI, `lib/` for logic, `__tests__/` for tests
3. **No src/ Directory**: Less nesting; Next.js docs show root-level `app/`
4. **YAGNI Compliance**: No unnecessary folders like `features/`, `services/`, `hooks/`
5. **Test Organization**: Parallel structure makes test types obvious

**Alternatives Considered**:
- **src/ directory**: Adds nesting without benefit for small project
- **Features-based structure**: Over-engineered for single-feature game
- **Co-located tests**: Clutters source tree; harder to exclude from builds

---

## 7. Responsive Design Strategy

### Decision: Mobile-First Design with Strategic Breakpoints

**Implementation Approach**:
```typescript
// Mobile-first layout
<main className="min-h-screen p-4 md:p-8 lg:p-12">
  <div className="max-w-2xl mx-auto space-y-6 md:space-y-8">
    {/* Content */}
  </div>
</main>

// Responsive button sizing (larger tap targets on mobile)
<button className="w-full md:w-auto px-6 py-4 md:py-3 btn-primary">
  Start New Game
</button>

// Typography scaling
<h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold">
  2 to Twelve
</h1>
```

**Breakpoints**:
- **Base (mobile)**: 0px - 767px (default styles)
- **md (tablet)**: 768px+ (moderate adjustments)
- **lg (desktop)**: 1024px+ (spacious layouts)

**Rationale**:
1. **Mobile-first aligns with usage**: Most game players use mobile devices
2. **Tailwind default**: Built-in mobile-first approach
3. **Simplicity**: Only use 2-3 breakpoints; avoid over-complication
4. **Touch targets**: Larger buttons on mobile improve UX

**Alternatives Considered**:
- **Desktop-first**: Inappropriate for mobile game
- **Fixed layouts**: Poor UX across devices
- **Complex breakpoints (sm, xl, 2xl)**: Unnecessary for simple interface

---

## 8. Conditional Styling Pattern

### Decision: Use `clsx` Library for State-Based Classes

**Installation**:
```bash
pnpm add clsx
```

**Implementation**:
```typescript
import clsx from 'clsx'

function GameButton({ isActive }: { isActive: boolean }) {
  return (
    <button
      className={clsx(
        'px-6 py-3 rounded-lg font-medium transition-all',
        isActive ? 'btn-danger' : 'btn-primary'
      )}
    >
      {isActive ? 'Stop Game' : 'Start New Game'}
    </button>
  )
}
```

**Rationale**:
1. **Lightweight**: ~200 bytes library
2. **Readable**: Cleaner than template literals for complex conditions
3. **Industry Standard**: Common pattern in React/Next.js projects
4. **Handles Edge Cases**: Properly manages falsy values and duplicates

**Alternatives Considered**:
- **Template literals**: More verbose and error-prone
- **classnames library**: Slightly heavier than clsx
- **tailwind-merge**: Overkill unless building component library with prop overrides

---

## 9. Dependencies Summary

### Required pnpm Packages

**Core Dependencies**:
```bash
pnpm create next-app@latest --typescript --tailwind --app --no-src-dir
pnpm add clsx
```

**Testing Dependencies**:
```bash
# Jest
pnpm add -D jest @types/jest jest-environment-jsdom
pnpm add -D @testing-library/react @testing-library/jest-dom @testing-library/user-event

# Playwright
pnpm create playwright
# OR manually:
pnpm add -D @playwright/test
pnpx playwright install chromium
```

**Package.json Scripts**:
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "jest --watch",
    "test:unit": "jest",
    "test:unit:coverage": "jest --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug",
    "test:all": "pnpm test:unit && pnpm test:e2e"
  }
}
```

---

## 10. Constitution Compliance Summary

### SOLID Principles
✅ **SRP**: Pure functions isolated in `lib/`, components focused on single responsibilities
✅ **OCP**: Component-based architecture allows extension through composition
✅ **LSP**: Using composition over inheritance (not extensively applicable)
✅ **ISP**: Components receive only required props
✅ **DIP**: Game logic depends on interfaces, not concrete implementations

### Testing Standards
✅ **Unit Testing Pure Functions**: Jest tests for `selectRandomQuestionSet()`
✅ **E2E Testing Features**: Playwright tests for all user stories
⚠️ **Test-First Development**: Not mandated by spec (standard test-after approach)

### Simplicity & Pragmatism
✅ **YAGNI**: No unnecessary abstractions (useState only, no state libraries)
✅ **Readability**: TypeScript, descriptive names, Tailwind utilities

---

## 11. Implementation Priority

**Phase 1: Project Setup**
1. Initialize Next.js 15 project with TypeScript and Tailwind
2. Configure Jest and Playwright
3. Set up project structure (`app/`, `lib/`, `__tests__/`)

**Phase 2: Data Layer**
4. Define TypeScript types (`lib/types.ts`)
5. Create sample question sets (`lib/questionSets.ts`)

**Phase 3: Logic Layer**
6. Implement `selectRandomQuestionSet()` function (`lib/gameLogic.ts`)
7. Write unit tests for random selection

**Phase 4: UI Layer**
8. Build main game page with state management (`app/page.tsx`)
9. Create button and theme display components

**Phase 5: Testing & Validation**
10. Write Playwright E2E tests for user stories
11. Run all tests and verify acceptance criteria
12. Performance validation (SC-001: <1 second response)

---

## Key Takeaways

✅ **Simplicity First**: React hooks and Next.js App Router patterns are sufficient
✅ **Hydration Safety**: Client-side event handlers prevent server/client mismatches
✅ **Test Strategically**: Unit test pure functions, E2E test user journeys
✅ **Follow Conventions**: Next.js 15 official structure and patterns
✅ **YAGNI Compliant**: Every decision avoids over-engineering

---

**References**:
- Next.js 15 Official Documentation
- React 19 Documentation
- Tailwind CSS v3 Documentation
- Jest Documentation
- Playwright Documentation
- Project Constitution v1.0.0
