# Data Model: Game Initialization

**Feature**: Game Initialization for "2 to Twelve"
**Date**: 2025-10-14
**Phase**: Phase 1 (Design)

## Overview

This document defines the data entities, TypeScript interfaces, and validation rules for the game initialization feature. The model is intentionally minimal, following YAGNI principles, and includes only what's needed for starting and stopping games with theme display.

---

## Entity Definitions

### 1. QuestionSet

Represents a collection of 12 questions that together reveal a 12-letter word. Each set has a theme that provides context to players.

**Purpose**: Core game content; randomly selected when player starts a game.

**Fields**:

| Field | Type | Required | Description | Validation Rules |
|-------|------|----------|-------------|------------------|
| `id` | string | Yes | Unique identifier for the question set | Non-empty string, unique across all sets |
| `theme` | string | Yes | Descriptive category/topic label | Non-empty string, 3-50 characters, human-readable |
| `mainAnswer` | string | Yes | The 12-letter word to be guessed | Exactly 12 uppercase letters A-Z, no spaces/punctuation |
| `difficulty` | string | Yes | Difficulty level indicator | One of: "easy", "medium", "hard" |
| `language` | string | Yes | Language code for the question set | ISO 639-1 code (e.g., "EN", "NL", "FR") |
| `questions` | Question[] | Yes | Array of 12 questions | Must contain exactly 12 Question objects |

**Relationships**:
- Has many `Question` objects (exactly 12)
- Referenced by `GameSession.questionSetId`

**Example**:
```json
{
  "id": "set-001",
  "theme": "Seasons & Nature",
  "mainAnswer": "BIODIVERSITY",
  "difficulty": "medium",
  "language": "EN",
  "questions": [ /* 12 Question objects */ ]
}
```

**State Transitions**: Static data; no state changes during gameplay.

---

### 2. Question

Represents a single general knowledge question within a question set. Each correct answer reveals one letter.

**Purpose**: Individual question content (not displayed in this feature, but part of data structure).

**Fields**:

| Field | Type | Required | Description | Validation Rules |
|-------|------|----------|-------------|------------------|
| `id` | string | Yes | Unique identifier within the question set | Non-empty string, unique within parent QuestionSet |
| `questionText` | string | Yes | The question to be displayed to the player | Non-empty string, 10-500 characters |
| `correctAnswer` | string | Yes | The correct answer to the question | Non-empty string, 1-100 characters |
| `revealedLetter` | string | Yes | The letter revealed when answered correctly | Single uppercase letter A-Z |
| `positionInAnswer` | number | Yes | Position of the letter in the 12-letter word (0-indexed) | Integer 0-11 |

**Relationships**:
- Belongs to one `QuestionSet`

**Example**:
```json
{
  "id": "q1",
  "questionText": "What is the largest ocean on Earth?",
  "correctAnswer": "Pacific Ocean",
  "revealedLetter": "B",
  "positionInAnswer": 0
}
```

**State Transitions**: Not modified in this feature (future: answered/unanswered states).

---

### 3. GameSession

Represents an active game instance. Tracks the selected question set and game state (active/inactive).

**Purpose**: Runtime state management for the current game.

**Fields**:

| Field | Type | Required | Description | Validation Rules |
|-------|------|----------|-------------|------------------|
| `isActive` | boolean | Yes | Whether a game is currently in progress | true or false |
| `selectedTheme` | string \| null | Yes | Theme of the current question set (for display) | Non-empty string when isActive=true, null when isActive=false |
| `questionSetId` | string \| null | Yes | ID of the selected question set | Valid QuestionSet ID when isActive=true, null when isActive=false |

**Relationships**:
- References one `QuestionSet` via `questionSetId`

**Example (Active Game)**:
```json
{
  "isActive": true,
  "selectedTheme": "Seasons & Nature",
  "questionSetId": "set-001"
}
```

**Example (Inactive Game)**:
```json
{
  "isActive": false,
  "selectedTheme": null,
  "questionSetId": null
}
```

**State Transitions**:

```
Initial State: { isActive: false, selectedTheme: null, questionSetId: null }
      |
      | [User clicks "Start New Game"]
      | → selectRandomQuestionSet() called
      | → GameSession updated with selected set
      ↓
Active State: { isActive: true, selectedTheme: "Theme Name", questionSetId: "set-xxx" }
      |
      | [User clicks "Stop Game"]
      | → GameSession reset
      ↓
Initial State: { isActive: false, selectedTheme: null, questionSetId: null }
```

**Validation Rules**:
- **Invariant 1**: If `isActive === true`, then `selectedTheme !== null` and `questionSetId !== null`
- **Invariant 2**: If `isActive === false`, then `selectedTheme === null` and `questionSetId === null`

---

## TypeScript Interfaces

**File Location**: `/lib/types.ts`

```typescript
/**
 * Represents a single question within a question set.
 * Each question reveals one letter of the 12-letter answer.
 */
export interface Question {
  /** Unique identifier within the question set */
  id: string

  /** The question text displayed to the player */
  questionText: string

  /** The correct answer to the question */
  correctAnswer: string

  /** The letter revealed when this question is answered correctly (A-Z) */
  revealedLetter: string

  /** Zero-indexed position of the revealed letter in the 12-letter answer (0-11) */
  positionInAnswer: number
}

/**
 * Represents a collection of 12 questions that together reveal a 12-letter word.
 * Question sets are randomly selected when a player starts a new game.
 */
export interface QuestionSet {
  /** Unique identifier for this question set */
  id: string

  /** Theme or category name displayed to the player (e.g., "World Capitals") */
  theme: string

  /** The 12-letter word that is the final answer (uppercase A-Z only) */
  mainAnswer: string

  /** Difficulty level: easy, medium, or hard */
  difficulty: 'easy' | 'medium' | 'hard'

  /** Language code (ISO 639-1, e.g., "EN", "NL", "FR") */
  language: string

  /** Array of exactly 12 questions */
  questions: Question[]
}

/**
 * Represents the current game session state.
 * Tracks whether a game is active and which question set is selected.
 */
export interface GameSession {
  /** Whether a game is currently in progress */
  isActive: boolean

  /** Theme of the currently selected question set (null when no game is active) */
  selectedTheme: string | null

  /** ID of the currently selected question set (null when no game is active) */
  questionSetId: string | null
}

/**
 * Type guard to check if a GameSession is in a valid active state.
 */
export function isValidActiveSession(session: GameSession): boolean {
  if (session.isActive) {
    return session.selectedTheme !== null && session.questionSetId !== null
  } else {
    return session.selectedTheme === null && session.questionSetId === null
  }
}
```

---

## Data Validation Rules

### QuestionSet Validation

**Function**: `validateQuestionSet(set: unknown): QuestionSet | ValidationError`

```typescript
export interface ValidationError {
  valid: false
  errors: string[]
}

export interface ValidationSuccess<T> {
  valid: true
  data: T
}

export type ValidationResult<T> = ValidationSuccess<T> | ValidationError

export function validateQuestionSet(set: unknown): ValidationResult<QuestionSet> {
  const errors: string[] = []

  if (typeof set !== 'object' || set === null) {
    return { valid: false, errors: ['QuestionSet must be an object'] }
  }

  const obj = set as Record<string, unknown>

  // Validate id
  if (typeof obj.id !== 'string' || obj.id.trim().length === 0) {
    errors.push('id must be a non-empty string')
  }

  // Validate theme
  if (typeof obj.theme !== 'string' || obj.theme.length < 3 || obj.theme.length > 50) {
    errors.push('theme must be a string between 3 and 50 characters')
  }

  // Validate mainAnswer
  if (typeof obj.mainAnswer !== 'string' || !/^[A-Z]{12}$/.test(obj.mainAnswer)) {
    errors.push('mainAnswer must be exactly 12 uppercase letters (A-Z)')
  }

  // Validate difficulty
  if (!['easy', 'medium', 'hard'].includes(obj.difficulty as string)) {
    errors.push('difficulty must be one of: easy, medium, hard')
  }

  // Validate language
  if (typeof obj.language !== 'string' || !/^[A-Z]{2}$/.test(obj.language)) {
    errors.push('language must be a 2-letter ISO 639-1 code (uppercase)')
  }

  // Validate questions
  if (!Array.isArray(obj.questions)) {
    errors.push('questions must be an array')
  } else if (obj.questions.length !== 12) {
    errors.push('questions array must contain exactly 12 questions')
  }

  if (errors.length > 0) {
    return { valid: false, errors }
  }

  return { valid: true, data: obj as QuestionSet }
}
```

### GameSession Validation

**Function**: `validateGameSession(session: GameSession): boolean`

```typescript
export function validateGameSession(session: GameSession): boolean {
  return isValidActiveSession(session)
}
```

---

## Sample Data

### Initial Question Sets (Minimum 2-3 for Testing)

**File Location**: `/lib/questionSets.ts`

```typescript
import { QuestionSet } from './types'

export const questionSets: QuestionSet[] = [
  {
    id: 'set-001',
    theme: 'Seasons & Nature',
    mainAnswer: 'BIODIVERSITY',
    difficulty: 'medium',
    language: 'EN',
    questions: [
      {
        id: 'q1',
        questionText: 'What is the largest ocean on Earth?',
        correctAnswer: 'Pacific Ocean',
        revealedLetter: 'B',
        positionInAnswer: 0,
      },
      {
        id: 'q2',
        questionText: 'What is the closest star to Earth?',
        correctAnswer: 'The Sun',
        revealedLetter: 'I',
        positionInAnswer: 1,
      },
      // ... (10 more questions)
    ],
  },
  {
    id: 'set-002',
    theme: 'World Capitals',
    mainAnswer: 'ARCHITECTURE',
    difficulty: 'hard',
    language: 'EN',
    questions: [
      {
        id: 'q1',
        questionText: 'What is the capital of France?',
        correctAnswer: 'Paris',
        revealedLetter: 'A',
        positionInAnswer: 0,
      },
      // ... (11 more questions)
    ],
  },
  {
    id: 'set-003',
    theme: 'Classic Literature',
    mainAnswer: 'SHAKESPEARIAN',
    difficulty: 'easy',
    language: 'EN',
    questions: [
      // ... (12 questions)
    ],
  },
]
```

---

## Data Flow Diagram

```
┌─────────────────────┐
│  questionSets.ts    │  (Static data - 2-3 QuestionSet objects)
│  (lib/)             │
└──────────┬──────────┘
           │
           │ Import
           ↓
┌─────────────────────┐
│  gameLogic.ts       │
│  selectRandomQuestionSet(sets: QuestionSet[]): QuestionSet
│  (lib/)             │
└──────────┬──────────┘
           │
           │ Called by
           ↓
┌─────────────────────┐
│  page.tsx           │  (Client component)
│  ('use client')     │
│                     │
│  [GameSession state]│ ← useState hook
│  { isActive, selectedTheme, questionSetId }
│                     │
│  handleStartGame()  │ → Calls selectRandomQuestionSet()
│  handleStopGame()   │ → Resets GameSession state
│                     │
│  UI Components:     │
│  - StartGameButton  │
│  - StopGameButton   │
│  - ThemeDisplay     │
│  (app/)             │
└─────────────────────┘
```

---

## Storage Strategy

**For This Feature**: No persistent storage required.

- **Question Sets**: Static data imported from `lib/questionSets.ts`
- **Game State**: In-memory React state (`useState` hook)
- **Session Persistence**: None (game state resets on page refresh)

**Future Considerations** (out of scope):
- User accounts → Database (PostgreSQL, Firebase, etc.)
- Game history → Database or localStorage
- Custom question sets → CMS or database

---

## Entity Relationships (ERD)

```
┌────────────────────────┐
│     QuestionSet        │
│────────────────────────│
│ + id: string (PK)      │
│ + theme: string        │
│ + mainAnswer: string   │
│ + difficulty: string   │
│ + language: string     │
│ + questions: Question[]│
└───────────┬────────────┘
            │
            │ Contains (1:12)
            │
            ↓
┌────────────────────────┐
│      Question          │
│────────────────────────│
│ + id: string (PK)      │
│ + questionText: string │
│ + correctAnswer: string│
│ + revealedLetter: string│
│ + positionInAnswer: int│
└────────────────────────┘

┌────────────────────────┐
│     GameSession        │
│────────────────────────│
│ + isActive: boolean    │
│ + selectedTheme: string?│
│ + questionSetId: string?│ ────References───> QuestionSet.id
└────────────────────────┘
```

---

## Compliance with Constitution

### SOLID Principles

✅ **SRP**: Each entity has a single, well-defined responsibility
- `QuestionSet`: Represents game content
- `Question`: Represents individual question data
- `GameSession`: Tracks runtime game state

✅ **OCP**: Interfaces allow extension (adding new fields) without modifying existing code

✅ **ISP**: No bloated interfaces; each entity exposes only necessary fields

### YAGNI Compliance

✅ **Minimal Fields**: Only includes what's needed for this feature
- No user IDs (no authentication in scope)
- No timestamps (no history tracking in scope)
- No answer history (not needed for initialization)

✅ **No Premature Abstraction**: Using plain TypeScript interfaces, not classes with methods

---

## Summary

**Total Entities**: 3 (QuestionSet, Question, GameSession)
**Storage**: Static data + in-memory state (no database)
**Validation**: TypeScript types + runtime validation functions
**Relationships**: QuestionSet → Question (1:12), GameSession → QuestionSet (reference)

This data model supports all functional requirements (FR-001 through FR-010) with minimal complexity, following YAGNI and SOLID principles.
