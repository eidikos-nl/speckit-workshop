# Quickstart Guide: Question Navigation Flow

**Date**: 2025-10-14  
**Feature**: Question Navigation Flow  
**For**: Developers implementing this feature

## Prerequisites

Before starting implementation:
1. ✅ Feature 001 (Initialize Game) is complete and merged
2. ✅ `GameSession` and `Question` types exist in `lib/types.ts`
3. ✅ Game initialization logic exists in `lib/gameLogic.ts`
4. ✅ Development environment running (`pnpm dev`)
5. ✅ Test runners available (`pnpm test:unit`, `pnpm test:e2e`)

## Quick Reference

**What**: Add question navigation UI (sequential chevrons + direct grid selection)  
**Where**: `app/components/` for UI, `lib/navigationLogic.ts` for helpers  
**How**: React components + useState for navigation state  
**Tests**: Unit tests for helpers, E2E tests for user flows

## Implementation Steps (TDD Recommended)

### Step 1: Create Navigation Helper Functions

**File**: `lib/navigationLogic.ts` (NEW)

**Purpose**: Pure functions for navigation logic (unit testable)

```typescript
export function canNavigateNext(currentIndex: number, totalQuestions: number): boolean {
  return currentIndex < totalQuestions - 1;
}

export function canNavigatePrevious(currentIndex: number): boolean {
  return currentIndex > 0;
}

export function getNextQuestionIndex(currentIndex: number, totalQuestions: number): number {
  return canNavigateNext(currentIndex, totalQuestions) ? currentIndex + 1 : currentIndex;
}

export function getPreviousQuestionIndex(currentIndex: number): number {
  return canNavigatePrevious(currentIndex) ? currentIndex - 1 : currentIndex;
}

export function isValidQuestionIndex(index: number, totalQuestions: number): boolean {
  return index >= 0 && index < totalQuestions;
}
```

**Test First** (optional but recommended):
- Create `__tests__/unit/navigationLogic.test.ts`
- Write tests for all 5 functions (boundaries, edge cases)
- Run `pnpm test:unit` to see failures
- Implement functions to pass tests

---

### Step 2: Create QuestionGrid Component

**File**: `app/components/QuestionGrid.tsx` (NEW)

**Purpose**: Display 12 clickable squares for direct navigation

```typescript
import { clsx } from 'clsx';

interface QuestionGridProps {
  currentQuestionIndex: number;
  totalQuestions: number;
  onSelectQuestion: (index: number) => void;
}

export function QuestionGrid({ 
  currentQuestionIndex, 
  totalQuestions, 
  onSelectQuestion 
}: QuestionGridProps) {
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {Array.from({ length: totalQuestions }, (_, index) => (
        <button
          key={index}
          onClick={() => onSelectQuestion(index)}
          data-testid={`question-square-${index + 1}`}
          className={clsx(
            "w-12 h-12 rounded border-2 transition-all",
            index === currentQuestionIndex
              ? "border-blue-500 border-4 bg-blue-50"
              : "border-gray-300 hover:border-gray-400"
          )}
          aria-label={`Navigate to question ${index + 1}`}
        >
          {/* Empty for now, will show letters in future feature */}
        </button>
      ))}
    </div>
  );
}
```

**Key Points**:
- Use `clsx` for conditional styling (active vs inactive squares)
- Use `data-testid` for E2E tests (constitution requirement)
- Flexbox with `flex-wrap` handles responsive layout automatically
- ARIA label for accessibility (not used for tests, per constitution)

---

### Step 3: Create NavigationChevrons Component

**File**: `app/components/NavigationChevrons.tsx` (NEW)

**Purpose**: Next/Previous sequential navigation controls

```typescript
interface NavigationChevronsProps {
  canGoNext: boolean;
  canGoPrevious: boolean;
  onNext: () => void;
  onPrevious: () => void;
}

export function NavigationChevrons({
  canGoNext,
  canGoPrevious,
  onNext,
  onPrevious
}: NavigationChevronsProps) {
  return (
    <div className="flex gap-4 justify-center items-center">
      <button
        onClick={onPrevious}
        disabled={!canGoPrevious}
        data-testid="previous-chevron"
        className="px-4 py-2 border-2 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
        aria-label="Previous question"
      >
        ← Previous
      </button>
      
      <button
        onClick={onNext}
        disabled={!canGoNext}
        data-testid="next-chevron"
        className="px-4 py-2 border-2 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
        aria-label="Next question"
      >
        Next →
      </button>
    </div>
  );
}
```

**Key Points**:
- Use `disabled` attribute (not conditional rendering) for better UX
- Tailwind `disabled:` modifiers for visual feedback
- data-testid on both buttons for E2E tests

---

### Step 4: Create QuestionDisplay Component

**File**: `app/components/QuestionDisplay.tsx` (NEW)

**Purpose**: Show current question with answer input (non-functional)

```typescript
import { Question } from '@/lib/types';

interface QuestionDisplayProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
}

export function QuestionDisplay({ 
  question, 
  questionNumber, 
  totalQuestions 
}: QuestionDisplayProps) {
  return (
    <div 
      key={question.id}
      className="space-y-4 transition-opacity duration-150"
      data-testid="current-question-display"
    >
      <h2 className="text-xl font-bold">
        Question {questionNumber} of {totalQuestions}
      </h2>
      
      <p className="text-lg">{question.question}</p>
      
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Your answer"
          data-testid="answer-input"
          className="flex-1 px-3 py-2 border-2 rounded"
        />
        
        <button
          data-testid="verify-button"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Verify Answer
        </button>
      </div>
    </div>
  );
}
```

**Key Points**:
- Use `key={question.id}` to trigger CSS transition on question change
- Answer input is uncontrolled (no state) - clears on navigation
- Verify button does nothing (onClick intentionally omitted)
- CSS transition on parent div for smooth fade

---

### Step 5: Update GameContainer Component

**File**: `app/components/GameContainer.tsx` (MODIFY EXISTING)

**Purpose**: Integrate navigation components and manage state

```typescript
import { useState } from 'react';
import { GameSession } from '@/lib/types';
import { canNavigateNext, canNavigatePrevious } from '@/lib/navigationLogic';
import { QuestionGrid } from './QuestionGrid';
import { NavigationChevrons } from './NavigationChevrons';
import { QuestionDisplay } from './QuestionDisplay';

interface GameContainerProps {
  gameSession: GameSession;
  onStopGame: () => void;
}

export function GameContainer({ gameSession, onStopGame }: GameContainerProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  
  if (!gameSession.isActive || !gameSession.selectedQuestionSet) {
    return null;
  }
  
  const { questions } = gameSession.selectedQuestionSet;
  const currentQuestion = questions[currentQuestionIndex];
  
  const handleNext = () => {
    if (canNavigateNext(currentQuestionIndex, questions.length)) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };
  
  const handlePrevious = () => {
    if (canNavigatePrevious(currentQuestionIndex)) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };
  
  const handleSelectQuestion = (index: number) => {
    setCurrentQuestionIndex(index);
  };
  
  return (
    <div className="space-y-8 p-4">
      {/* Question Grid */}
      <QuestionGrid
        currentQuestionIndex={currentQuestionIndex}
        totalQuestions={questions.length}
        onSelectQuestion={handleSelectQuestion}
      />
      
      {/* Navigation Chevrons */}
      <NavigationChevrons
        canGoNext={canNavigateNext(currentQuestionIndex, questions.length)}
        canGoPrevious={canNavigatePrevious(currentQuestionIndex)}
        onNext={handleNext}
        onPrevious={onPrevious}
      />
      
      {/* Current Question */}
      <QuestionDisplay
        question={currentQuestion}
        questionNumber={currentQuestionIndex + 1}
        totalQuestions={questions.length}
      />
      
      {/* Existing Stop Game button */}
      <button onClick={onStopGame} /* ... existing styles ... */>
        Stop Game
      </button>
    </div>
  );
}
```

**Integration Notes**:
- GameContainer already exists from Feature 001
- Add navigation state and components to existing structure
- Keep existing game stop functionality
- Layout order: Grid → Chevrons → Question → Stop button

---

### Step 6: Write E2E Tests

**File**: `__tests__/e2e/sequential-navigation.spec.ts` (NEW)

```typescript
import { test, expect } from '@playwright/test';

test.describe('Sequential Navigation', () => {
  test('User Story 1: Navigate through questions with chevrons', async ({ page }) => {
    // Setup: Start a game
    await page.goto('http://localhost:3000');
    await page.getByTestId('start-game-button').click();
    await page.getByTestId('theme-item-0').click(); // Select first theme
    
    // Scenario 1: First question displays
    await expect(page.getByTestId('current-question-display'))
      .toContainText('Question 1 of 12');
    
    // Scenario 2: Previous chevron is disabled on question 1
    await expect(page.getByTestId('previous-chevron')).toBeDisabled();
    
    // Scenario 3: Click next, question 2 displays
    await page.getByTestId('next-chevron').click();
    await expect(page.getByTestId('current-question-display'))
      .toContainText('Question 2 of 12');
    
    // Scenario 3 continued: Previous chevron becomes enabled
    await expect(page.getByTestId('previous-chevron')).toBeEnabled();
    
    // Navigate to last question
    for (let i = 2; i < 12; i++) {
      await page.getByTestId('next-chevron').click();
    }
    
    // Scenario 5: Next chevron is disabled on question 12
    await expect(page.getByTestId('current-question-display'))
      .toContainText('Question 12 of 12');
    await expect(page.getByTestId('next-chevron')).toBeDisabled();
  });
});
```

**File**: `__tests__/e2e/direct-selection.spec.ts` (NEW)

```typescript
import { test, expect } from '@playwright/test';

test.describe('Direct Question Selection', () => {
  test('User Story 2: Jump to questions via grid', async ({ page }) => {
    // Setup: Start a game
    await page.goto('http://localhost:3000');
    await page.getByTestId('start-game-button').click();
    await page.getByTestId('theme-item-0').click();
    
    // Scenario 1: Click square 5
    await page.getByTestId('question-square-5').click();
    await expect(page.getByTestId('current-question-display'))
      .toContainText('Question 5 of 12');
    
    // Scenario 2: Click square 2
    await page.getByTestId('question-square-2').click();
    await expect(page.getByTestId('current-question-display'))
      .toContainText('Question 2 of 12');
  });
});
```

**Run Tests**:
```bash
pnpm test:e2e
```

---

## Checklist

Before marking feature complete:

- [ ] All 5 navigation helper functions implemented and tested
- [ ] QuestionGrid component displays 12 squares with active highlighting
- [ ] NavigationChevrons component with disabled states at boundaries
- [ ] QuestionDisplay component with non-functional input/button
- [ ] GameContainer integrates all navigation components
- [ ] Unit tests pass for navigationLogic.ts
- [ ] E2E tests pass for all 3 user stories (9 acceptance scenarios)
- [ ] Responsive layout works on mobile (test at 375px width)
- [ ] CSS transitions smooth (<200ms)
- [ ] All interactive elements have data-testid attributes

---

## Common Pitfalls

❌ **Don't**: Use 1-indexed arrays (questions[1] for question 1)  
✅ **Do**: Use 0-indexed internally, convert to 1-indexed for display

❌ **Don't**: Store current question in state (duplication)  
✅ **Do**: Store index, derive question from questions[index]

❌ **Don't**: Use getByRole() or getByText() in E2E tests  
✅ **Do**: Use getByTestId() per constitution v1.1.0

❌ **Don't**: Add answer validation logic (out of scope)  
✅ **Do**: Keep verify button non-functional (future feature)

❌ **Don't**: Use complex state management (Redux, Context)  
✅ **Do**: Use simple useState in GameContainer

---

## Next Steps After Implementation

1. Run `/speckit.tasks` to generate task breakdown
2. Run `/speckit.analyze` to validate task list
3. Begin implementation following tasks.md
4. Submit PR when all tests pass and checklist complete

---

## Support Resources

- **Research**: See `research.md` for design decisions and alternatives
- **Data Model**: See `data-model.md` for entity definitions
- **Contracts**: See `contracts/README.md` for component interfaces
- **Constitution**: See `.specify/memory/constitution.md` for principles
- **Feature 001**: Reference existing game initialization implementation

---

## Estimated Effort

- **Navigation helpers**: 30 min (simple pure functions)
- **QuestionGrid**: 1 hour (layout + styling)
- **NavigationChevrons**: 30 min (simple buttons)
- **QuestionDisplay**: 45 min (layout + styling)
- **GameContainer integration**: 1 hour (state + composition)
- **Unit tests**: 1 hour (5 functions + boundaries)
- **E2E tests**: 2 hours (3 user stories, 9 scenarios)
- **Manual testing**: 30 min (responsive, transitions, edge cases)

**Total**: ~7-8 hours for a single developer

**Parallelization**: Components can be built independently after navigation helpers are complete.