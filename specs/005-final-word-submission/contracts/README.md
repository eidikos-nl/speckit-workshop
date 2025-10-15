# API Contracts: Final Word Submission

**Phase**: 1 (Design)  
**Date**: 2025-10-15

## Overview

This feature is entirely client-side (no new API endpoints required). The final word submission feature operates within the existing game session state management model using React hooks and local validation.

## Component Contracts

### FinalAnswerInput Component

**Location**: `app/components/FinalAnswerInput.tsx`

**Purpose**: Render 12 styled input boxes and manage letter-by-letter text input, matching the visual style of `QuestionGrid`.

**Props Interface**:
```typescript
interface FinalAnswerInputProps {
  /** Current value: exactly 12 characters when ready to submit */
  value: string;
  
  /** Called on every character change (max 12 chars) */
  onChange: (value: string) => void;
  
  /** Called when user submits with Enter key or Submit button (value must be exactly 12 chars) */
  onSubmit: () => void;
  
  /** Is the game already ended? If true, render read-only with result feedback */
  gameEnded: boolean;
  
  /** Win/loss/null - determines color feedback in terminal state */
  result?: 'win' | 'loss' | null;
}
```

**Behavior**:
- Renders 12 individual boxes, each displaying one letter (styled identically to `QuestionGrid` squares)
- Input mode (editable):
  - Focus on first box initially
  - Accepts A-Z characters only (converted to uppercase)
  - Each letter fills one box left-to-right
  - Backspace removes rightmost character
  - Arrow keys move focus between boxes (optional: can move cursor within string)
  - Tab navigates out of component
  - When exactly 12 letters entered, submit button becomes enabled
  - Enter key or click submit triggers `onSubmit()` callback
- Terminal mode (`gameEnded = true`):
  - All boxes display final answer
  - Background color feedback: green (`bg-green-500`) for win, red (`bg-red-500`) for loss
  - Input disabled
  - Submit button disabled
  - Victory/loss message displayed below boxes

**Output/Rendering**:
- 12 boxes: `<div class="aspect-square rounded-lg...">` each with `data-testid="final-answer-box-{1-12}"`
- Letter text in center of each box
- Submit button: `data-testid="final-answer-submit"`
- Status message: `data-testid="final-answer-result-message"`
- Subtle spacer above boxes: light border-top with padding (visual separation from question grid)

---

### GameContainer Integration Points

**Location**: `app/components/GameContainer.tsx`

**New Handler**:
```typescript
const handleFinalAnswerSubmit = (): void => {
  const validationResult = validateFinalAnswer(
    finalAnswer.value,
    gameSession.selectedQuestionSet!.targetWord
  );
  
  setGameResult({
    outcome: validationResult.isCorrect ? 'win' : 'loss',
    correctAnswer: gameSession.selectedQuestionSet!.targetWord,
    playerAnswer: finalAnswer.value,
    timestamp: Date.now()
  });
  
  setGameEnded(true);
};
```

**Props to FinalAnswerInput**:
```typescript
<FinalAnswerInput
  value={finalAnswer}
  onChange={setFinalAnswer}
  onSubmit={handleFinalAnswerSubmit}
  gameEnded={gameEnded}
  result={gameResult?.outcome || null}
/>
```

**State Updates**:
- Add `finalAnswer: string` state (empty initially)
- Add `gameEnded: boolean` state (false initially)
- Add `gameResult: { outcome: 'win' | 'loss', timestamp: number } | null` state

---

## Validation Function Contract

### validateFinalAnswer

**Location**: `lib/validationLogic.ts`

**Signature**:
```typescript
export function validateFinalAnswer(
  submitted: string,
  target: string
): { isCorrect: boolean; normalizedSubmitted: string; normalizedTarget: string }
```

**Behavior**:
- Normalizes both strings to uppercase
- Compares for exact equality (case-insensitive)
- Returns true if match, false if not
- Also returns normalized versions for logging/debugging

**Examples**:
```typescript
validateFinalAnswer("watermelons", "WATERMELONS")
// { isCorrect: true, normalizedSubmitted: "WATERMELONS", normalizedTarget: "WATERMELONS" }

validateFinalAnswer("BANANASPLIT", "WATERMELONS")
// { isCorrect: false, normalizedSubmitted: "BANANASPLIT", normalizedTarget: "WATERMELONS" }
```

**Edge Cases Handled**:
- Empty string: Returns false (validation ensures 12 chars before calling)
- Non-alphabetic characters: Not expected (UI filters these, but function could add validation)
- Different lengths: Returns false automatically (not equal)

---

## Type Extensions

### lib/types.ts

**New Interfaces**:
```typescript
export interface FinalAnswer {
  value: string;              // The 12-letter submission (or partial while editing)
  position: number;           // Cursor position (0-11)
  submitted: boolean;         // Has this answer been locked in?
  timestamp: number | null;   // When submitted (null if not yet)
}

export interface GameResult {
  outcome: 'win' | 'loss';
  correctAnswer: string;      // The target word from QuestionSet
  playerAnswer: string;       // What the player submitted
  timestamp: number;          // When the game ended
}
```

**GameSession Extension**:
```typescript
export interface GameSession {
  // ... existing fields ...
  finalAnswer?: FinalAnswer;
  gameResult?: GameResult | null;
  gameEnded?: boolean;
}
```

---

## Messaging & UX

### Victory Message
```
"Congratulations! You solved the puzzle with the word: WATERMELONS"
```
- Display below the 12 green boxes
- All boxes animate with success pulse (existing animation from QuestionGrid)

### Loss Message
```
"That is incorrect, try again in a new game"
```
- Display below the 12 red boxes
- Static display (no animation)

---

## Data Flow Diagram

```
User types letter
    ↓
FinalAnswerInput receives keystroke
    ↓
Validates: only A-Z, max 12 chars
    ↓
Calls onChange(newValue)
    ↓
GameContainer updates finalAnswer state
    ↓
FinalAnswerInput re-renders with new letter in next box
    ↓
When 12 letters present: Submit button enabled
    ↓
User clicks Submit or presses Enter
    ↓
Calls onSubmit()
    ↓
GameContainer calls validateFinalAnswer()
    ↓
Sets gameResult and gameEnded = true
    ↓
FinalAnswerInput re-renders in terminal mode:
  - Boxes locked (read-only)
  - Background color: green (win) or red (loss)
  - Message displays
    ↓
Game session frozen
```

---

## No External API Endpoints

This feature does **not** require backend API changes:
- ✅ Validation is client-side (pure function)
- ✅ Game state managed by React hooks (no persistence required for this feature)
- ✅ Answer is compared locally against `QuestionSet.targetWord` already loaded
- ✅ No server communication needed

**Note**: If future persistence is needed (save game results), a new API endpoint could be added without changing this contract.

---

## Accessibility Contracts

- Each box has `aria-label` describing its position and state
- Submit button has descriptive label
- Keyboard navigation fully supported (arrow keys, backspace, enter)
- Focus indicators visible on all interactive elements
- Color not the only differentiator (success/loss includes text message)
- All text has sufficient contrast (WCAG AA minimum)

---

## Testing Contracts

### Unit Tests (jest)
File: `__tests__/unit/finalAnswerValidation.test.ts`

```typescript
describe('validateFinalAnswer', () => {
  test('returns true for matching answers (case-insensitive)', () => {
    expect(validateFinalAnswer("watermelons", "WATERMELONS").isCorrect).toBe(true);
  });
  
  test('returns false for non-matching answers', () => {
    expect(validateFinalAnswer("BANANASPLIT", "WATERMELONS").isCorrect).toBe(false);
  });
});
```

### E2E Tests (Playwright)
File: `__tests__/e2e/final-word-submission.spec.ts`

```typescript
describe('Final Word Submission', () => {
  test('player can type and submit correct answer', async () => {
    // 1. Type W-A-T-E-R-M-E-L-O-N-S into boxes
    // 2. Verify each letter appears in sequence
    // 3. Click submit
    // 4. Verify boxes turn green
    // 5. Verify victory message
    // 6. Verify game ends (can't interact further)
  });
  
  test('player sees loss message for incorrect answer', async () => {
    // 1. Type B-A-N-A-N-A-S-P-L-I-T
    // 2. Click submit
    // 3. Verify boxes turn red
    // 4. Verify loss message
  });
});
```

**Test Selectors** (data-testid):
- `final-answer-box-1` through `final-answer-box-12`: Individual letter boxes
- `final-answer-submit`: Submit button
- `final-answer-result-message`: Result message container
- `final-answer-container`: Wrapper for entire component

---

## State Immutability After Submission

Once `gameEnded = true`:
- ✅ FinalAnswerInput renders in read-only mode
- ✅ Input events ignored
- ✅ No state mutations possible
- ✅ User cannot modify answer or submit again
- ✅ Only action: Stop Game button or start new game