# Quickstart: Game Initialization for "2 to Twelve"

**Feature**: Game Initialization
**Date**: 2025-10-14
**Phase**: Phase 1 - Development Setup Guide

## Overview

This guide helps developers set up their environment and start working on the game initialization feature for "2 to Twelve". Follow these steps to get the application running locally and begin development.

## Prerequisites

Before you begin, ensure you have the following installed:

| Tool | Version | Check Command | Install Link |
|------|---------|---------------|--------------|
| Node.js | 18.x or 20.x | `node --version` | https://nodejs.org/ |
| pnpm | 8.x or later | `pnpm --version` | https://pnpm.io/installation |
| Git | Any recent version | `git --version` | https://git-scm.com/ |

**Note**: If `pnpm` is not installed, you can install it globally via npm:
```bash
npm install -g pnpm
```

## Initial Setup

### 1. Clone the Repository (if not already done)

```bash
git clone <repository-url>
cd speckit-workshop
```

### 2. Checkout the Feature Branch

```bash
git checkout 001-initialize-game-i
```

### 3. Create Next.js Application

If the Next.js app doesn't exist yet, create it using `pnpm`:

```bash
pnpm create next-app@latest . --typescript --tailwind --app --use-pnpm --no-src-dir
```

**Prompts and Recommended Answers**:
- Would you like to use TypeScript? → **Yes**
- Would you like to use ESLint? → **Yes**
- Would you like to use Tailwind CSS? → **Yes**
- Would you like to use `src/` directory? → **No** (we use `app/` and `lib/` at root)
- Would you like to use App Router? → **Yes**
- Would you like to customize the default import alias? → **No**

### 4. Install Dependencies

```bash
pnpm install
```

### 5. Install Testing Dependencies

```bash
# Jest and React Testing Library
pnpm add -D jest @types/jest ts-jest jest-environment-jsdom
pnpm add -D @testing-library/react @testing-library/jest-dom @testing-library/user-event

# Playwright
pnpm create playwright
```

**Playwright Setup Prompts**:
- Do you want to use TypeScript? → **Yes**
- Where to put your end-to-end tests? → **__tests__/e2e**
- Add a GitHub Actions workflow? → **No** (for now)
- Install Playwright browsers? → **Yes**

## Project Structure Setup

### 6. Create Directory Structure

```bash
# Create lib directory for business logic
mkdir -p lib

# Create component directory
mkdir -p app/components

# Create test directories
mkdir -p __tests__/unit
mkdir -p __tests__/e2e
```

## Configuration Files

### 7. Configure Jest

Create `jest.config.js`:

```javascript
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './',
})

// Custom Jest configuration
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
}

module.exports = createJestConfig(customJestConfig)
```

Create `jest.setup.js`:

```javascript
import '@testing-library/jest-dom'
```

### 8. Configure Playwright

Update `playwright.config.ts`:

```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './__tests__/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],

  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

### 9. Update package.json Scripts

Add the following scripts to `package.json`:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "jest --watch",
    "test:unit": "jest",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:all": "pnpm test:unit && pnpm test:e2e"
  }
}
```

## Running the Application

### Development Mode

```bash
pnpm dev
```

The application will start at http://localhost:3000

### Production Build

```bash
pnpm build
pnpm start
```

## Running Tests

### Unit Tests (Jest)

```bash
# Run all unit tests
pnpm test:unit

# Run tests in watch mode (interactive)
pnpm test

# Run tests with coverage
pnpm test:unit --coverage
```

### E2E Tests (Playwright)

```bash
# Run all E2E tests
pnpm test:e2e

# Run E2E tests in UI mode (interactive)
pnpm test:e2e:ui

# Run E2E tests for specific browser
pnpm test:e2e --project=chromium

# Run specific test file
pnpm test:e2e start-game.spec.ts
```

### All Tests

```bash
pnpm test:all
```

## Development Workflow

### 1. Start Development Server

```bash
pnpm dev
```

### 2. Create a New Component

Example: Create `app/components/StartGameButton.tsx`

```typescript
'use client'

interface StartGameButtonProps {
  onClick: () => void
  disabled: boolean
}

export function StartGameButton({ onClick, disabled }: StartGameButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      Start New Game
    </button>
  )
}
```

### 3. Create TypeScript Types

Example: Create `lib/types.ts`

```typescript
export interface QuestionSet {
  id: string
  theme: string
  targetWord: string
  questions: Question[]
}

export interface Question {
  id: string
  text: string
  answer: string
  revealedLetter: string
}

export interface GameSession {
  questionSetId: string
  theme: string
  state: 'inactive' | 'active'
}
```

### 4. Write Unit Tests

Example: Create `__tests__/unit/gameLogic.test.ts`

```typescript
import { selectRandomQuestionSet } from '@/lib/gameLogic'
import { QuestionSet } from '@/lib/types'

describe('selectRandomQuestionSet', () => {
  const mockQuestionSets: QuestionSet[] = [
    {
      id: 'set-001',
      theme: 'Test Theme 1',
      targetWord: 'TESTWORDONE',
      questions: [],
    },
    {
      id: 'set-002',
      theme: 'Test Theme 2',
      targetWord: 'TESTWORDTWO',
      questions: [],
    },
  ]

  it('returns a question set from the input array', () => {
    const selected = selectRandomQuestionSet(mockQuestionSets)
    expect(mockQuestionSets).toContain(selected)
  })

  it('throws error when input array is empty', () => {
    expect(() => selectRandomQuestionSet([])).toThrow('No question sets available')
  })
})
```

### 5. Write E2E Tests

Example: Create `__tests__/e2e/start-game.spec.ts`

```typescript
import { test, expect } from '@playwright/test'

test('User Story 1.1: Start game displays theme', async ({ page }) => {
  await page.goto('/')

  // Click start button
  await page.click('button:has-text("Start New Game")')

  // Verify theme is displayed
  await expect(page.locator('[data-testid="theme-display"]')).toBeVisible()
  await expect(page.locator('[data-testid="theme-display"]')).not.toBeEmpty()
})
```

## Troubleshooting

### Common Issues

**Issue**: `pnpm: command not found`
```bash
# Solution: Install pnpm globally
npm install -g pnpm
```

**Issue**: Port 3000 already in use
```bash
# Solution: Kill the process or use a different port
PORT=3001 pnpm dev
```

**Issue**: Playwright browsers not installed
```bash
# Solution: Install browsers manually
pnpx playwright install
```

**Issue**: Jest can't find modules
```bash
# Solution: Clear Jest cache
pnpm test:unit --clearCache
```

**Issue**: TypeScript errors in IDE
```bash
# Solution: Restart TypeScript server or rebuild
pnpm build
# In VS Code: Cmd+Shift+P → "TypeScript: Restart TS Server"
```

## IDE Setup (VS Code Recommended)

### Recommended Extensions

1. **ESLint** (dbaeumer.vscode-eslint)
2. **Prettier** (esbenp.prettier-vscode)
3. **Tailwind CSS IntelliSense** (bradlc.vscode-tailwindcss)
4. **Playwright Test for VSCode** (ms-playwright.playwright)
5. **Jest Runner** (firsttris.vscode-jest-runner)

### VS Code Settings

Create `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "tailwindCSS.experimental.classRegex": [
    ["cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"],
    ["cn\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"]
  ]
}
```

## Quick Reference

### File Locations

| File | Purpose | Location |
|------|---------|----------|
| Main page | Game interface | `app/page.tsx` |
| Components | UI components | `app/components/*.tsx` |
| Types | TypeScript interfaces | `lib/types.ts` |
| Game logic | Pure functions | `lib/gameLogic.ts` |
| Question data | Static data | `lib/questionSets.ts` |
| Unit tests | Jest tests | `__tests__/unit/*.test.ts` |
| E2E tests | Playwright tests | `__tests__/e2e/*.spec.ts` |

### Common Commands

```bash
# Development
pnpm dev                 # Start dev server
pnpm build              # Build for production
pnpm lint               # Run ESLint

# Testing
pnpm test:unit          # Run Jest tests
pnpm test:e2e           # Run Playwright tests
pnpm test:all           # Run all tests

# Package management
pnpm install            # Install dependencies
pnpm add <package>      # Add production dependency
pnpm add -D <package>   # Add dev dependency
```

### URLs

- Development: http://localhost:3000
- Playwright Report: `pnpx playwright show-report`
- Jest Coverage: Open `coverage/lcov-report/index.html`

## Next Steps

1. Review the [spec.md](./spec.md) for feature requirements
2. Review the [data-model.md](./data-model.md) for entity definitions
3. Review the [contracts/README.md](./contracts/README.md) for type contracts
4. Review the [research.md](./research.md) for technology decisions
5. Wait for [tasks.md](./tasks.md) to be generated via `/speckit.tasks` command
6. Begin implementation following the task breakdown

## Getting Help

- Next.js Docs: https://nextjs.org/docs
- React Docs: https://react.dev
- Tailwind Docs: https://tailwindcss.com/docs
- Jest Docs: https://jestjs.io/docs/getting-started
- Playwright Docs: https://playwright.dev/docs/intro
- TypeScript Docs: https://www.typescriptlang.org/docs

## Feature-Specific Notes

### Question Set Data Format

When creating question sets in `lib/questionSets.ts`, ensure:
- Each set has a unique ID
- Theme is descriptive (e.g., "World Capitals", "Classic Literature")
- Target word is exactly 12 letters
- Exactly 12 questions per set
- Each question's `revealedLetter` combines to spell the target word

### Game State Management

The game session state is managed in `app/page.tsx` using React useState:
- State tracks: questionSetId, theme, state ('inactive' | 'active')
- State transitions: inactive ↔ active
- No persistence required (resets on page reload)

### Testing Strategy

- **Unit tests**: Test pure functions only (e.g., `selectRandomQuestionSet`)
- **E2E tests**: Test complete user journeys from browser perspective
- Run unit tests frequently during development (fast feedback)
- Run E2E tests before committing (slower but comprehensive)

---

**Ready to start?** Run `pnpm dev` and open http://localhost:3000 to begin development!
