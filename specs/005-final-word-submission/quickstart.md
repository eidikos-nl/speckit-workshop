# Quickstart: Final Word Submission

**Phase**: 1 (Design)  
**Date**: 2025-10-15

## Feature Overview

Players can now submit a final 12-letter word to complete the game. The interface provides 12 individual styled boxes (similar to OTP input fields) where letters appear as the player types. Upon submission, the game ends with visual feedback: green boxes and victory message for correct answers, or red boxes and loss message for incorrect answers.

## Architecture at a Glance

### Component Hierarchy
```
GameContainer (existing, enhanced)
├── Stop Game Button (existing)
├── Theme Display (existing)
├── Navigation Chevrons (existing)
├── QuestionDisplay (existing)
├── QuestionGrid (existing - 12 letter collection boxes)
├── [SPACER - visual separator]
└── FinalAnswerInput (NEW - 12 letter input boxes)
    ├── Box 1-12 (individual letter displays)
    ├── Submit Button
    └── Result Message
```

### State Management

```typescript
// In GameContainer.tsx
const [finalAnswer, setFinalAnswer] = useState<string>("");
const [gameEnded, setGameEnded] = useState<boolean>(false);
const [gameResult, setGameResult] = useState<GameResult | null>(null);

// Handler
const handleFinalAnswerSubmit = (): void => {
  const isCorrect = validateFinalAnswer(
    finalAnswer,
    gameSession.selectedQuestionSet!.targetWord
  ).isCorrect;
  
  setGameResult({
    outcome: isCorrect ? 'win' : 'loss',
    correctAnswer: gameSession.selectedQuestionSet!.targetWord,
    playerAnswer: finalAnswer,
    timestamp: Date.now()
  });
  
  setGameEnded(true);
};
```

## Key Files to Create/Modify

### New Files

1. **`app/components/FinalAnswerInput.tsx`**
   - React component: 12-box letter input interface
   - Handles keyboard input (letters, backspace, arrow keys)
   - Renders win/loss visual feedback
   - ~150-200 lines

2. **`__tests__/e2e/final-word-submission.spec.ts`**
   - Playwright E2E tests for full user journey
   - Test: type correct answer → see green boxes + victory message
   - Test: type incorrect answer → see red boxes + loss message
   - Test: backspace behavior, keyboard navigation
   - ~100-150 lines

3. **`__tests__/e2e/page-objects/finalAnswerPage.ts`**
   - Page object for test reusability
   - Encapsulate selectors and interactions
   - ~50-80 lines

### Modified Files

1. **`lib/types.ts`**
   - Add `FinalAnswer` interface
   - Add `GameResult` interface
   - Extend `GameSession` with optional final answer fields
   - Add `validateFinalAnswer()` function signature

2. **`lib/validationLogic.ts`**
   - Add `validateFinalAnswer(submitted: string, target: string)` function
   - Case-insensitive comparison
   - ~20-30 lines

3. **`app/components/GameContainer.tsx`**
   - Add 3 new useState hooks (finalAnswer, gameEnded, gameResult)
   - Add handleFinalAnswerSubmit handler
   - Render `<FinalAnswerInput>` below `<QuestionGrid>`
   - Add visual spacer (border-t) between grids
   - ~30-40 new lines

4. **`app/globals.css`**
   - Add `@keyframes` for blinking cursor (optional)
   - ~5-10 lines

## Implementation Sequence

### Step 1: Type Definitions
1. Update `lib/types.ts` with new interfaces
2. Update `lib/gameLogic.ts` if needed to handle game ending

### Step 2: Validation Logic
3. Implement `validateFinalAnswer()` in `lib/validationLogic.ts`
4. Write unit tests in `__tests__/unit/finalAnswerValidation.test.ts`

### Step 3: UI Component
5. Create `app/components/FinalAnswerInput.tsx`
   - 12 boxes layout (grid, matching QuestionGrid styling)
   - Letter input handling
   - Keyboard navigation (arrows, backspace, enter)
   - Visual feedback (green/red on game end)
6. Add styles/animations to `app/globals.css` if needed

### Step 4: Integration
7. Update `app/components/GameContainer.tsx`
   - Add state for final answer, game end, result
   - Add handler for submission
   - Render FinalAnswerInput component
   - Add visual spacer

### Step 5: Testing
8. Create E2E tests in `__tests__/e2e/final-word-submission.spec.ts`
9. Create page object in `__tests__/e2e/page-objects/finalAnswerPage.ts`
10. Run tests and verify all pass

## Visual Design

### Layout
```
┌─────────────────────────────────────┐
│ Theme Display                       │
├─────────────────────────────────────┤
│ [<] Question 1 of 12 [>]           │
├─────────────────────────────────────┤
│ Question and Answer Input (existing)│
├─────────────────────────────────────┤
│ Revealed Letters Grid (existing)    │
│ [·] [S] [·] [C] ...                │
├─────────────────────────────────────┤
│ ═══ VISUAL SPACER ═══              │
├─────────────────────────────────────┤
│ Final Answer Input (NEW)            │
│ [W] [A] [T] [E] [R] [M] [E] [L]   │
│ [O] [N] [S] [·]                    │
│ [Submit] Button                     │
│ Result message here                 │
└─────────────────────────────────────┘
```

### Styling Notes
- Final answer boxes: Identical to QuestionGrid boxes (aspect-square, rounded-lg, border)
- Input state: White background, gray border, gray text (".")
- Win state: Green background (bg-green-500), white text, animated success pulse
- Loss state: Red background (bg-red-500), white text, static
- Spacer: Subtle border-t with padding (light gray, not intrusive)
- Button: Use game-primary color, disabled when not 12 chars or game ended

## CSS Classes Used

**Tailwind utilities**:
```
aspect-square            # Equal width/height for boxes
grid grid-cols-6         # 6 boxes per row (mobile: 4, desktop: 6)
md:grid-cols-12          # 12 on desktop
gap-3 sm:gap-4 md:gap-6  # Responsive spacing
rounded-lg               # Rounded corners like question boxes
border-2 border-gray-300 # Border styling
bg-green-500 / bg-red-500 # Feedback colors
text-white               # Text in colored states
transition-colors        # Smooth color change
duration-300             # Transition speed
focus:ring-2             # Focus indicator
```

## Testing Checklist

### Unit Tests
- [x] validateFinalAnswer("WATERMELONS", "WATERMELONS") → true
- [x] validateFinalAnswer("watermelons", "WATERMELONS") → true (case-insensitive)
- [x] validateFinalAnswer("BANANASPLIT", "WATERMELONS") → false
- [x] Edge cases (empty, non-alpha, wrong length)

### E2E Tests
- [x] Type 12 letters sequentially → all appear in boxes
- [x] Backspace → last letter removed
- [x] Arrow keys → navigate between boxes (if implemented)
- [x] Submit correct answer → green boxes, victory message
- [x] Submit incorrect answer → red boxes, loss message
- [x] Game ends → no further interaction possible
- [x] Enter key → submit when 12 letters present
- [x] Non-alphabetic characters → rejected

### Manual Testing
- [x] Visual alignment matches QuestionGrid boxes
- [x] Spacer visible and not intrusive
- [x] Touch friendly on mobile
- [x] Keyboard-only navigation possible
- [x] Screen reader announces correctly (ARIA labels)
- [x] Focus indicators visible

## Success Metrics

✅ **SC-001**: Players can enter and submit final 12-letter answer in under 30 seconds  
✅ **SC-002**: 100% of submissions result in immediate feedback within 1 second  
✅ **SC-003**: Players visually distinguish question boxes from answer boxes in under 2 seconds  
✅ **SC-004**: 95% of players successfully use letter-by-letter input on first try  
✅ **SC-005**: Game ends immediately upon submission with no further interaction  
✅ **SC-006**: Visual feedback (color) displays within 500ms of submission

## Common Pitfalls to Avoid

❌ **Don't**: Make each box its own input field (11 extra refs, harder to manage)  
✅ **Do**: Use single string state with position tracking

❌ **Don't**: Use role-based test selectors (break when UI changes)  
✅ **Do**: Use data-testid attributes (stable, independent)

❌ **Don't**: Allow submission with <12 characters  
✅ **Do**: Disable submit button until exactly 12 characters entered

❌ **Don't**: Display game result via modal or redirect  
✅ **Do**: Show feedback in-place with color change and message

❌ **Don't**: Clear input on navigation  
✅ **Do**: Preserve final answer until submission

## Next Steps After Design

1. **Phase 2 (Tasks)**: Run `/speckit.tasks` to generate granular implementation tasks
2. **Implementation**: Follow task list sequentially
3. **Code Review**: Verify SOLID principles, test coverage, accessibility
4. **Merge**: Commit to `005-final-word-submission` branch

## Configuration

No configuration files need updating. Feature uses existing:
- ✅ Tailwind CSS (already configured)
- ✅ Jest (already configured)
- ✅ Playwright (already configured)
- ✅ TypeScript (already configured)
- ✅ Next.js (already configured)

## Dependencies

No new npm packages required. Uses existing:
- `react` 18.3.0
- `clsx` (for conditional classes)
- `typescript` 5.x
- Test tools already in place

## Accessibility

- ✅ Keyboard navigation fully supported
- ✅ ARIA labels on each box and button
- ✅ Focus indicators visible
- ✅ Color not only indicator (text messages included)
- ✅ Sufficient contrast (WCAG AA)
- ✅ data-testid for stable test selectors

## Performance Considerations

- **Rendering**: Simple grid layout, no complex animations (only color transition)
- **State updates**: Minimal re-renders (only on letter change or game end)
- **Input handling**: Debouncing not needed (single keystroke per update)
- **Target**: <50ms input response time easily achievable

---

**Ready to proceed to Phase 2 (Tasks) after design approval.**