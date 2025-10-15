# Quick Start: Letter Collection Display

**Feature**: 004-letter-collection-we  
**Date**: 2025-10-15  
**Tech Stack**: TypeScript 5.x, React 18.3.0, Next.js 15.0.0, Tailwind CSS

---

## Overview

This feature adds letter collection display to the "2 to Twelve" game. When a player answers a question correctly, the corresponding navigation box displays the collected letter instead of remaining blank. Unanswered questions show a period ".". Letters persist throughout the game session and reset when a new game starts.

---

## What Gets Changed

### 1. Type Definitions (`lib/types.ts`)

Add new type for collected letters:

```typescript
export type CollectedLetters = Record<number, string | null>;
```

Update `GameSession` interface:

```typescript
export interface GameSession {
  questionIndex: number;
  questionIds: number[];
  attemptCount: number;
  correctAnswers: Map<number, string>;
  isActive: boolean;
  collectedLetters: CollectedLetters;  // NEW
}
```

### 2. Game Logic (`lib/gameLogic.ts`)

Update `startGame()` to initialize letter collection:

```typescript
export function startGame(questions: Question[]): GameSession {
  return {
    questionIndex: 0,
    questionIds: questions.map((_, i) => i + 1),
    attemptCount: 0,
    correctAnswers: new Map(),
    isActive: true,
    collectedLetters: Object.fromEntries(
      Array.from({ length: 12 }, (_, i) => [i + 1, null])
    ),
  };
}
```

### 3. Validation Logic (`lib/validationLogic.ts`)

Add helper functions for letter state:

```typescript
export function getDisplayLetter(
  questionNumber: number,
  collectedLetters: CollectedLetters
): string {
  return collectedLetters[questionNumber] ?? '.';
}

export function isAnsweredCorrectly(
  questionNumber: number,
  collectedLetters: CollectedLetters
): boolean {
  return collectedLetters[questionNumber] !== null;
}
```

Update validation result to include letter:

```typescript
export interface ValidationResult {
  isCorrect: boolean;
  letter?: string;  // NEW - letter to collect if correct
}
```

### 4. Game Container (`app/components/GameContainer.tsx`)

Add state management for letters:

```typescript
export default function GameContainer() {
  const [gameSession, setGameSession] = useState<GameSession | null>(null);

  const handleAnswerCorrect = (questionNumber: number, letter: string) => {
    setGameSession(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        collectedLetters: {
          ...prev.collectedLetters,
          [questionNumber]: letter,
        },
      };
    });
  };

  return (
    <>
      <NavigationChevrons
        currentQuestion={gameSession?.questionIndex ?? 0}
        collectedLetters={gameSession?.collectedLetters ?? {}}
        onNext={handleNextQuestion}
        onPrevious={handlePreviousQuestion}
      />
      <QuestionGrid
        currentQuestion={gameSession?.questionIndex ?? 0}
        collectedLetters={gameSession?.collectedLetters ?? {}}
        onSelectQuestion={handleSelectQuestion}
      />
      {/* ... rest of component */}
    </>
  );
}
```

### 5. Navigation Chevrons (`app/components/NavigationChevrons.tsx`)

Update to display letters:

```typescript
interface NavigationChevronProps {
  currentQuestion: number;
  collectedLetters: CollectedLetters;
  onNext: () => void;
  onPrevious: () => void;
}

export default function NavigationChevrons({
  currentQuestion,
  collectedLetters,
  onNext,
  onPrevious,
}: NavigationChevronProps) {
  return (
    <div className="flex items-center gap-4">
      <button onClick={onPrevious} data-testid="previous-chevron">
        ←
      </button>
      <div className="flex gap-2">
        {Array.from({ length: 12 }, (_, i) => {
          const questionNum = i + 1;
          const letter = getDisplayLetter(questionNum, collectedLetters);
          const isAnswered = isAnsweredCorrectly(questionNum, collectedLetters);
          return (
            <div
              key={i}
              data-testid={`question-square-${questionNum}`}
              className={clsx(
                'w-8 h-8 flex items-center justify-center text-sm font-bold',
                isAnswered ? 'bg-green-500 text-white' : 'bg-white border'
              )}
            >
              {letter}
            </div>
          );
        })}
      </div>
      <button onClick={onNext} data-testid="next-chevron">
        →
      </button>
    </div>
  );
}
```

### 6. Question Grid (`app/components/QuestionGrid.tsx`)

Update to display letters (same pattern as NavigationChevrons):

```typescript
export default function QuestionGrid({
  collectedLetters,
  onSelectQuestion,
}: QuestionGridProps) {
  return (
    <div className="grid grid-cols-6 gap-2">
      {Array.from({ length: 12 }, (_, i) => {
        const questionNum = i + 1;
        const letter = getDisplayLetter(questionNum, collectedLetters);
        const isAnswered = isAnsweredCorrectly(questionNum, collectedLetters);
        return (
          <button
            key={i}
            onClick={() => onSelectQuestion(questionNum)}
            data-testid={`question-square-${questionNum}`}
            className={clsx(
              'p-4 text-center font-bold',
              isAnswered ? 'bg-green-500 text-white' : 'bg-white border'
            )}
          >
            {letter}
          </button>
        );
      })}
    </div>
  );
}
```

---

## Testing Changes

### Unit Tests (`__tests__/unit/validationLogic.test.ts`)

Add tests for letter display helpers:

```typescript
describe('getDisplayLetter', () => {
  it('returns the letter when answered', () => {
    const letters: CollectedLetters = { 1: 'S', 2: null, /* ... */ };
    expect(getDisplayLetter(1, letters)).toBe('S');
  });

  it('returns period when not answered', () => {
    const letters: CollectedLetters = { 1: null, 2: 'E', /* ... */ };
    expect(getDisplayLetter(1, letters)).toBe('.');
  });
});

describe('isAnsweredCorrectly', () => {
  it('returns true when letter collected', () => {
    const letters: CollectedLetters = { 1: 'S', /* ... */ };
    expect(isAnsweredCorrectly(1, letters)).toBe(true);
  });

  it('returns false when not answered', () => {
    const letters: CollectedLetters = { 1: null, /* ... */ };
    expect(isAnsweredCorrectly(1, letters)).toBe(false);
  });
});
```

### E2E Tests (Update Existing)

**`__tests__/e2e/answer-validation.spec.ts`**:
```typescript
test('displays letter in navigation box after correct answer', async () => {
  await page.goto('http://localhost:3000');
  await page.click('[data-testid="answer-input"]');
  await page.type('[data-testid="answer-input"]', 'Paris');
  await page.click('[data-testid="verify-button"]');
  
  const boxContent = await page.textContent('[data-testid="question-square-1"]');
  expect(boxContent).toBe('S'); // Assuming question 1's letter is 'S'
});
```

**`__tests__/e2e/multiple-attempts.spec.ts`**:
```typescript
test('letters persist when navigating between questions', async () => {
  // Answer questions 1, 3, 5
  // Navigate to question 2, then back to 1
  // Verify questions 1, 3, 5 still show letters
});
```

---

## File Structure

```
specs/004-letter-collection-we/
├── plan.md                    ✅ Implementation plan
├── research.md                ✅ Technical research
├── data-model.md              ✅ Data structures
├── quickstart.md              ✅ This file
├── contracts/
│   └── README.md              ✅ (see below)
└── tasks.md                   (generated by /speckit.tasks)
```

---

## Integration Checklist

- [ ] **Types**: Add `CollectedLetters` to `lib/types.ts`
- [ ] **Game Logic**: Update `startGame()` in `lib/gameLogic.ts` to initialize letters
- [ ] **Validation**: Add helper functions to `lib/validationLogic.ts`
- [ ] **GameContainer**: Add state management and callback for letter updates
- [ ] **NavigationChevrons**: Accept and display `collectedLetters` prop
- [ ] **QuestionGrid**: Accept and display `collectedLetters` prop
- [ ] **Unit Tests**: Add tests for letter display helpers
- [ ] **E2E Tests**: Update answer validation tests to verify letter display
- [ ] **E2E Tests**: Add letter persistence tests across navigation
- [ ] **Data-testid**: Ensure all interactive elements have proper `data-testid` attributes

---

## Key Implementation Notes

1. **State Immutability**: Always create new objects when updating `collectedLetters`, never mutate directly
2. **Letter Display**: Use helper function `getDisplayLetter()` consistently across components
3. **Conditional Styling**: Use `clsx()` for conditional Tailwind classes (green if answered, white if not)
4. **Props Passing**: Pass `collectedLetters` from GameContainer down to child components
5. **Test Selectors**: Use `data-testid="question-square-{N}"` for all navigation boxes
6. **Browser DevTools**: When testing manually, use React DevTools to inspect `gameSession.collectedLetters` state

---

## Performance Expectations

- **State Update**: <50ms from validation to state update
- **Re-render**: <50ms for component re-render with new letters
- **Total Time**: Letter visible in box within 100ms of correct answer
- **Navigation**: No lag when switching between questions with many letters collected

---

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari 14+, Chrome Android 90+)

---

## Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| Letters not showing | Component not receiving `collectedLetters` prop | Verify prop passing in GameContainer |
| Wrong letter displayed | Letter from wrong question | Check question number key in CollectedLetters object |
| Letters reset unexpectedly | New GameSession created | Verify `startGame()` only called when "New Game" button clicked |
| Box color not green | Letter exists but styling broken | Check Tailwind CSS classes applied correctly |
| Tests failing with "element not found" | Wrong `data-testid` value | Use exact format: `question-square-{N}` (N = 1-12) |

---

## Next Steps

After completing this feature:
1. Code review against Constitution principles
2. Run full test suite (unit + E2E)
3. Manual testing on desktop and mobile
4. Prepare for 005-letter-ordering feature (will reuse CollectedLetters type)
