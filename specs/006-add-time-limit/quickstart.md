# Quickstart: Game Time Limits with Dual Timer Display

**Phase**: 1 (Design)  
**Date**: 2025-10-15

## Feature Overview

Players now have time pressure with dual countdown timers: a 10-minute main timer for exploration and a 2-minute final timer for submitting answers. Timers are displayed in a persistent floating panel in the bottom right corner, update every second, turn red in the last 10 seconds, and stop when a correct answer is submitted. When the main timer expires, question navigation is disabled and UI elements fade to 20% opacity. If the final timer expires without a valid answer, the game ends with a loss message.

## Architecture at a Glance

### Component Hierarchy
```
GameContainer (existing, enhanced)
├── Stop Game Button (existing)
├── Theme Display (existing)
├── Navigation Chevrons (existing, becomes disabled when main timer expires)
├── QuestionDisplay (existing, fades to 20% opacity when main timer expires)
├── QuestionGrid (existing, fades to 20% opacity when main timer expires)
├── FinalAnswerInput (existing, disabled when main timer expires)
└── TimerPanel (NEW - floating in bottom-right corner)
    ├── Main Timer Display (10:00 → 0:00)
    ├── Visual Separator
    └── Final Timer Display (2:00 → 0:00)
```

### State Management

```typescript
// In GameContainer.tsx
const { 
  mainTimeRemaining, 
  finalTimeRemaining, 
  phase,
  stopTimer 
} = useGameTimer(
  600,  // 10 minutes
  120,  // 2 minutes
  gameSession.isActive,
  handleMainTimerExpire,
  handleFinalTimerExpire
);

// Handlers
const handleMainTimerExpire = (): void => {
  // Disable navigation, fade UI to 20%
  setNavigationDisabled(true);
  setUIOpacity(0.2);
};

const handleFinalTimerExpire = (): void => {
  // Game ends with loss
  setGameResult({
    outcome: 'loss',
    correctAnswer: gameSession.selectedQuestionSet!.targetWord,
    playerAnswer: finalAnswer.value || "INCOMPLETE",
    timestamp: Date.now()
  });
  setGameEnded(true);
};

const handleCorrectAnswer = (): void => {
  stopTimer();  // Freeze both timers
  setGameResult({ outcome: 'win', ... });
  setGameEnded(true);
};
```

## Key Files to Create/Modify

### New Files

1. **`app/components/TimerPanel.tsx`**
   - React component: Floating dual-timer display
   - Fixed positioning (bottom-right corner)
   - Conditional styling (red when ≤10s, gray when inactive)
   - ~80-120 lines

2. **`app/hooks/useGameTimer.ts`**
   - Custom React hook: Timer countdown logic
   - Timestamp-based calculation (accurate across tab changes)
   - Page Visibility API integration
   - Phase transition management
   - ~150-200 lines

3. **`lib/timerLogic.ts`**
   - Pure functions: formatTime(), calculateRemaining(), determinePhase()
   - Testable business logic separated from React
   - ~60-80 lines

4. **`__tests__/unit/timerLogic.test.ts`**
   - Jest unit tests for pure timer functions
   - ~100-150 lines

5. **`__tests__/e2e/timer-display.spec.ts`**
   - Playwright E2E tests for timer visibility and updates
   - ~80-120 lines

6. **`__tests__/e2e/timer-phase-transition.spec.ts`**
   - Playwright E2E tests for phase transitions
   - ~100-150 lines

7. **`__tests__/e2e/timer-game-end.spec.ts`**
   - Playwright E2E tests for timer stop on game end
   - ~80-120 lines

8. **`__tests__/e2e/page-objects/timerPage.ts`**
   - Page object for test reusability
   - ~50-80 lines

### Modified Files

1. **`lib/types.ts`**
   - Add `GamePhase` enum (EXPLORATION, FINAL_ANSWER, ENDED)
   - Add `TimerState` interface
   - Extend `GameSession` with `timerState` field
   - ~40-60 new lines

2. **`app/components/GameContainer.tsx`**
   - Integrate `useGameTimer` hook
   - Add timer event handlers
   - Pass phase to child components for disabling/opacity
   - Render `<TimerPanel>` component
   - Call `stopTimer()` on correct answer
   - ~50-80 new lines

3. **`app/components/NavigationChevrons.tsx`**
   - Accept `disabled` prop based on phase
   - Prevent navigation when phase ≠ EXPLORATION
   - ~10-20 new lines

4. **`app/components/QuestionDisplay.tsx`**
   - Accept `opacity` and `disabled` props
   - Apply 20% opacity when phase = FINAL_ANSWER
   - ~10-20 new lines

5. **`app/components/QuestionGrid.tsx`**
   - Accept `opacity` prop
   - Apply 20% opacity when phase = FINAL_ANSWER
   - ~5-10 new lines

## Implementation Sequence

### Step 1: Pure Logic Functions
1. Create `lib/timerLogic.ts` with pure functions:
   - `formatTime(seconds: number): string`
   - `calculateRemaining(start: number, duration: number, now: number): number`
   - `determinePhase(main: number, final: number, stopped: boolean): GamePhase`
2. Write unit tests in `__tests__/unit/timerLogic.test.ts`
3. Verify all pure logic works correctly

### Step 2: Type Definitions
4. Update `lib/types.ts` with:
   - `GamePhase` enum
   - `TimerState` interface
   - `GameSession` extension

### Step 3: Custom Hook
5. Create `app/hooks/useGameTimer.ts`:
   - Timestamp-based countdown
   - setInterval with 1-second updates
   - Page Visibility API integration
   - Cleanup on unmount
   - Phase transition logic
   - stopTimer() function

### Step 4: UI Component
6. Create `app/components/TimerPanel.tsx`:
   - Fixed positioning (bottom-4 right-4, z-50)
   - Two timer displays with labels
   - Conditional red styling (≤10s)
   - Conditional gray styling (inactive)
   - Shadow and rounded corners

### Step 5: Integration
7. Update `app/components/GameContainer.tsx`:
   - Import and use `useGameTimer` hook
   - Add timer event handlers
   - Pass phase/opacity props to children
   - Render `<TimerPanel>`
   - Call `stopTimer()` on success

8. Update child components to accept phase-based props:
   - `NavigationChevrons.tsx` (disabled prop)
   - `QuestionDisplay.tsx` (opacity + disabled props)
   - `QuestionGrid.tsx` (opacity prop)

### Step 6: Testing
9. Create E2E tests:
   - `timer-display.spec.ts` (visibility, countdown, color changes)
   - `timer-phase-transition.spec.ts` (main→final transition, UI changes)
   - `timer-game-end.spec.ts` (timer stop, expiration handling)
10. Create page object: `timerPage.ts`
11. Run all tests and verify they pass

## Visual Design

### Layout
```
┌─────────────────────────────────────┐
│ Theme Display                       │
├─────────────────────────────────────┤
│ [<] Question 1 of 12 [>]           │
├─────────────────────────────────────┤
│ Question and Answer Input           │
├─────────────────────────────────────┤
│ Revealed Letters Grid               │
│ [·] [S] [·] [C] ...                │
├─────────────────────────────────────┤
│ Final Answer Input                  │
│ [W] [A] [T] [E] [R] [M] [E] [L]   │
│ [O] [N] [S] [·]                    │
└─────────────────────────────────────┘
                               ┌───────────┐
                               │Main Timer │
                               │   10:00   │
                               ├───────────┤
                               │Final Timer│
                               │   2:00    │
                               └───────────┘
                            (bottom-right float)
```

### Timer Panel States

**Exploration Phase (Main Timer Active)**:
```
┌─────────────┐
│ Main Timer  │  ← Gray label
│   7:34      │  ← Black/Red text (red if ≤10s)
├─────────────┤
│Final Timer  │  ← Gray label
│   2:00      │  ← Light gray text (inactive)
└─────────────┘
```

**Final Answer Phase (Final Timer Active)**:
```
┌─────────────┐
│ Main Timer  │  ← Gray label
│   0:00      │  ← Light gray text (expired)
├─────────────┤
│Final Timer  │  ← Gray label
│   1:23      │  ← Black/Red text (red if ≤10s)
└─────────────┘
```

**Game Ended (Both Frozen)**:
```
┌─────────────┐
│ Main Timer  │  ← Gray label
│   4:12      │  ← Black text (frozen)
├─────────────┤
│Final Timer  │  ← Gray label
│   2:00      │  ← Light gray text (never activated)
└─────────────┘
```

### Styling Notes
- Panel: White background, rounded corners (rounded-lg), shadow (shadow-lg)
- Position: Fixed bottom-4 right-4 z-50
- Padding: p-4 for comfortable spacing
- Timer text: text-2xl font-mono font-bold
- Labels: text-xs text-gray-500
- Normal state: text-gray-900
- Urgent state (≤10s): text-red-600
- Inactive state: text-gray-400
- Separator: border-t border-gray-200

## CSS Classes Used

**Tailwind utilities**:
```
fixed bottom-4 right-4    # Fixed positioning
z-50                       # High z-index
bg-white                   # White background
rounded-lg                 # Rounded corners
shadow-lg                  # Drop shadow
p-4                        # Padding
space-y-3                  # Vertical spacing between sections
text-center                # Center-align text
text-xs text-gray-500      # Small gray labels
text-2xl font-mono         # Large monospace timer text
font-bold                  # Bold weight
text-gray-900              # Active timer (normal)
text-red-600               # Active timer (urgent ≤10s)
text-gray-400              # Inactive timer
border-t border-gray-200   # Separator line
transition-colors          # Smooth color transitions
```

## Testing Checklist

### Unit Tests (timerLogic.ts)
- [x] formatTime(600) → "10:00"
- [x] formatTime(65) → "1:05"
- [x] formatTime(9) → "0:09"
- [x] formatTime(0) → "0:00"
- [x] calculateRemaining() with various elapsed times
- [x] calculateRemaining() when expired (returns 0)
- [x] determinePhase() for each state combination

### E2E Tests
- [x] Timers visible on game start (10:00 and 2:00)
- [x] Main timer counts down every second (10:00 → 9:59 → 9:58...)
- [x] Main timer turns red when ≤10 seconds
- [x] Main timer reaches 0:00 → phase transition
- [x] Questions/answers fade to 20% opacity on transition
- [x] Navigation disabled on transition
- [x] Final timer activates and counts down (2:00 → 1:59...)
- [x] Final timer turns red when ≤10 seconds
- [x] Final timer expires → loss message displayed
- [x] Correct answer → both timers freeze
- [x] Tab blur/focus → timer accuracy maintained

### Manual Testing
- [x] Timer panel doesn't obstruct gameplay
- [x] Floating panel stays in bottom-right corner on scroll
- [x] Shadow effect visible and subtle
- [x] Red color provides clear urgency signal
- [x] Monospace font makes time easy to read
- [x] Separator distinguishes two timers
- [x] Touch-friendly on mobile (no interaction needed)
- [x] High contrast for accessibility

## Success Metrics

✅ **SC-001**: Players see current time at any moment without navigating  
✅ **SC-002**: Timer updates smoothly every 1s with <100ms variance  
✅ **SC-003**: Visual urgency (red) appears exactly at 10 seconds  
✅ **SC-004**: Phase transition occurs within 1s of main timer expiry  
✅ **SC-005**: Loss message displays within 1s of final timer expiry  
✅ **SC-006**: 100% of answer submissions freeze timers immediately  
✅ **SC-007**: Timer panel visible across all screens and interactions

## Common Pitfalls to Avoid

❌ **Don't**: Use tick-counting for time remaining (drifts over time)  
✅ **Do**: Use timestamp-based calculation (Date.now() - startTime)

❌ **Don't**: Ignore Page Visibility API (timers inaccurate when tab hidden)  
✅ **Do**: Recalculate time when tab regains visibility

❌ **Don't**: Forget to clear interval on unmount (memory leak)  
✅ **Do**: Return cleanup function from useEffect

❌ **Don't**: Use requestAnimationFrame (stops in background tabs)  
✅ **Do**: Use setInterval (throttled but not stopped)

❌ **Don't**: Modify existing components' internal state  
✅ **Do**: Pass props for opacity/disabled state from GameContainer

❌ **Don't**: Use role-based test selectors  
✅ **Do**: Use data-testid attributes (timer-panel, main-timer-display, etc.)

❌ **Don't**: Block entire UI with timer panel  
✅ **Do**: Use fixed positioning in non-intrusive corner

## Next Steps After Design

1. **Phase 2 (Tasks)**: Run `/speckit.tasks` to generate granular implementation tasks
2. **Implementation**: Follow task list sequentially
3. **Code Review**: Verify SOLID principles, timer accuracy, test coverage
4. **Merge**: Commit to `006-add-time-limit` branch

## Configuration

No configuration files need updating. Feature uses existing:
- ✅ Tailwind CSS (already configured)
- ✅ Jest (already configured)
- ✅ Playwright (already configured)
- ✅ TypeScript (already configured)
- ✅ Next.js (already configured)

## Dependencies

No new npm packages required. Uses existing:
- `react` 18.3.0 (useState, useEffect, useRef)
- `clsx` (for conditional classes)
- `typescript` 5.x
- Test tools already in place

## Accessibility

- ✅ Timer panel has aria-live="polite" for screen reader updates
- ✅ Each timer has descriptive label
- ✅ Color not only indicator (time value always visible)
- ✅ High contrast text (WCAG AA: 4.5:1 for red on white)
- ✅ No interaction required (display-only component)
- ✅ Focus management not needed
- ✅ data-testid for stable test selectors

## Performance Considerations

- **Update frequency**: 1 update per second (negligible CPU)
- **Memory**: TimerState ~64 bytes, hook overhead ~100 bytes
- **Rendering**: Minimal re-renders (only on 1s interval)
- **Accuracy**: Timestamp-based ensures <100ms variance
- **Battery**: 1s interval is battery-friendly
- **Target**: <1ms per timer calculation easily achievable

## Browser Compatibility

- **Page Visibility API**: Supported in all modern browsers (IE 10+)
- **setInterval**: Universal support
- **Fixed positioning**: Universal support
- **Tailwind classes**: All standard utilities (no experimental features)

## Phase Transition Details

### Exploration → Final Answer

**Trigger**: Main timer reaches 0:00

**UI Changes**:
1. Main timer text changes to light gray (inactive)
2. Final timer text changes to black (active)
3. Final timer starts counting down from 2:00
4. Navigation chevrons become disabled (no onClick)
5. QuestionDisplay opacity → 0.2, pointer-events-none
6. QuestionGrid opacity → 0.2
7. FinalAnswerInput remains enabled (only active input)

**Code**:
```typescript
const handleMainTimerExpire = (): void => {
  setNavigationDisabled(true);
  setQuestionOpacity(0.2);
  setAnswerOpacity(0.2);
  // Final timer automatically activates via phase transition
};
```

### Final Answer → Ended (Time Expiry)

**Trigger**: Final timer reaches 0:00 without valid answer

**UI Changes**:
1. Both timers freeze at current values
2. GameResult set to 'loss'
3. Message displayed: "The time is up, you lost!"
4. All inputs disabled

### Exploration/Final → Ended (Correct Answer)

**Trigger**: Valid answer submitted successfully

**UI Changes**:
1. `stopTimer()` called → both timers frozen
2. GameResult set to 'win'
3. Victory message displayed
4. All inputs disabled

---

**Ready to proceed to Phase 2 (Tasks) after design approval.**