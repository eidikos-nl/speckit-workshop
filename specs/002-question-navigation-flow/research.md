# Research: Question Navigation Flow

**Date**: 2025-10-14  
**Feature**: Question Navigation Flow  
**Purpose**: Research best practices and design patterns for implementing question navigation UI

## Research Tasks Completed

### 1. React State Management for Navigation

**Decision**: Use React useState hook with controlled component pattern

**Rationale**:
- Simple, single-component state (current question index 0-11)
- No complex state mutations or async operations required
- Navigation state is local to the game container, no global state needed
- React's built-in useState provides all necessary features

**Alternatives Considered**:
- **useReducer**: Overkill for simple index tracking; reducer pattern adds unnecessary complexity for sequential navigation
- **Context API**: No need for deep prop drilling, navigation state stays in GameContainer
- **External state library (Zustand/Redux)**: Violates YAGNI principle; no multi-component state sharing needed

**Implementation Pattern**:
```typescript
const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

const handleNext = () => {
  if (currentQuestionIndex < 11) {
    setCurrentQuestionIndex(prev => prev + 1);
  }
};

const handlePrevious = () => {
  if (currentQuestionIndex > 0) {
    setCurrentQuestionIndex(prev => prev - 1);
  }
};

const handleSelectQuestion = (index: number) => {
  setCurrentQuestionIndex(index);
};
```

---

### 2. Tailwind CSS Responsive Grid Layout (1×12)

**Decision**: Use flexbox with wrap for responsive 1×12 grid layout

**Rationale**:
- Flexbox provides natural wrapping behavior for mobile screens
- Tailwind's responsive modifiers (sm:, md:, lg:) enable breakpoint-specific styling
- Simpler than CSS Grid for single-row layout that wraps
- Better browser compatibility and easier to debug

**Alternatives Considered**:
- **CSS Grid**: More powerful but overkill for simple horizontal layout; flexbox wrapping is simpler
- **Fixed grid columns**: Would require media query breakpoints; Tailwind flex-wrap is more elegant
- **Separate mobile/desktop components**: Code duplication; responsive CSS is cleaner

**Implementation Pattern**:
```tsx
<div className="flex flex-wrap gap-2 justify-center">
  {[...Array(12)].map((_, index) => (
    <button
      key={index}
      className={clsx(
        "w-12 h-12 border-2 rounded",
        index === currentQuestionIndex
          ? "border-blue-500 border-4"  // Active square
          : "border-gray-300"             // Inactive square
      )}
      onClick={() => onSelectQuestion(index)}
      data-testid={`question-square-${index + 1}`}
    />
  ))}
</div>
```

**Responsive Behavior**:
- Desktop (≥768px): Single row, 12 squares horizontally
- Mobile (<768px): Wraps to 2-3 rows as needed
- Gap between squares: 0.5rem (Tailwind's gap-2)

---

### 3. CSS Transition Best Practices for Smooth Navigation

**Decision**: Use CSS transitions with opacity fade (100-200ms)

**Rationale**:
- Opacity transitions are GPU-accelerated (better performance than layout changes)
- Short duration (150ms) provides feedback without slowing user flow
- Meets success criteria: <200ms navigation response, smooth without jarring flashes
- CSS transitions are declarative and easier to maintain than JavaScript animations

**Alternatives Considered**:
- **Transform/translate animations**: More complex, can cause layout shifts
- **React Transition Group**: External dependency, overkill for simple fade
- **Framer Motion**: Powerful but violates YAGNI; CSS transitions sufficient

**Implementation Pattern**:
```tsx
// QuestionDisplay component
<div 
  key={currentQuestion.id}  // Force remount on question change
  className="transition-opacity duration-150 ease-in-out"
  style={{ opacity: 1 }}
>
  <h2>Question {currentQuestionIndex + 1} of 12</h2>
  <p>{currentQuestion.question}</p>
</div>
```

**Animation Strategy**:
- Use React's key prop to trigger CSS transition on question change
- Opacity: 0 → 1 fade-in (150ms)
- Ease-in-out timing function for smooth acceleration/deceleration
- No layout shifts (position/size remain constant)

---

### 4. Data-testid Testing Patterns with Playwright

**Decision**: Use descriptive kebab-case data-testid attributes on all interactive elements

**Rationale**:
- Constitution mandates data-testid for E2E test selectors (v1.1.0)
- More stable than text content or ARIA labels (which may change)
- Playwright's `getByTestId()` provides reliable element location
- Descriptive IDs improve test readability

**Alternatives Considered**:
- **getByRole()**: Breaks when accessibility attributes change (learned from Feature 001)
- **getByText()**: Fragile when UI copy changes
- **CSS selectors**: Coupled to implementation details, breaks on refactoring

**Implementation Pattern**:
```tsx
// Interactive elements
<button data-testid="next-chevron">Next</button>
<button data-testid="previous-chevron">Previous</button>
<button data-testid="question-square-5">5</button>
<input data-testid="answer-input" />
<button data-testid="verify-button">Verify Answer</button>

// Playwright test
await page.getByTestId('next-chevron').click();
await expect(page.getByTestId('current-question-display'))
  .toContainText('Question 2 of 12');
```

**Naming Convention**:
- Format: `{element-purpose}-{type}` or `{element-purpose}-{index}`
- Examples: `next-chevron`, `question-square-3`, `answer-input`
- Avoid generic names like `button-1`, use descriptive identifiers

---

### 5. Component Composition Patterns for Navigation UI

**Decision**: Split navigation into focused single-responsibility components

**Rationale**:
- Aligns with SRP principle (each component has one reason to change)
- Improves testability (unit test components in isolation)
- Better code reuse and maintainability
- Clear separation of concerns

**Alternatives Considered**:
- **Monolithic component**: All navigation in one file; harder to test and maintain
- **Overly granular components**: Each chevron as separate component; unnecessary complexity
- **Render props pattern**: Overkill for simple navigation; increases cognitive load

**Component Structure**:

```tsx
// GameContainer.tsx (orchestrator)
// - Manages currentQuestionIndex state
// - Passes callbacks to child components
// - Coordinates navigation behavior

// QuestionGrid.tsx (direct selection)
// - Renders 12 clickable squares
// - Highlights current question
// - Calls onSelectQuestion(index) callback

// NavigationChevrons.tsx (sequential navigation)
// - Renders next/previous buttons
// - Disables chevrons at boundaries
// - Calls onNext/onPrevious callbacks

// QuestionDisplay.tsx (question presentation)
// - Displays current question text
// - Shows question number (1-12)
// - Includes answer input + verify button (non-functional)
```

**Prop Interface Pattern**:
```typescript
interface NavigationChevronProps {
  canGoNext: boolean;
  canGoPrevious: boolean;
  onNext: () => void;
  onPrevious: () => void;
}

interface QuestionGridProps {
  currentQuestionIndex: number;
  totalQuestions: number;
  onSelectQuestion: (index: number) => void;
}

interface QuestionDisplayProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
}
```

**Benefits**:
- Clear interfaces (ISP compliance)
- Easy to unit test navigation logic separately from UI
- Components can be developed and styled independently
- Future enhancements (keyboard shortcuts, animations) isolated to specific components

---

## Summary of Design Decisions

1. **State Management**: React useState (simple, sufficient)
2. **Layout**: Tailwind flexbox with wrap (responsive, clean)
3. **Animations**: CSS opacity transitions (performant, smooth)
4. **Testing**: data-testid attributes (stable, constitution-compliant)
5. **Architecture**: Single-responsibility components (SRP, maintainable)

All decisions align with constitution principles (SOLID, YAGNI, Readability) and meet feature requirements (navigation, responsiveness, testing). No complex abstractions or external libraries needed beyond existing dependencies.