# Feature Specification: Implement Scoring System

**Feature Branch**: `007-implement-scoring-system`  
**Created**: 2025-10-16  
**Status**: Draft  
**Input**: User description: "implement scoring system for the app. I want to be able to show the amount of points the user has scored during a single playthrough. This means showing the total score in a panel in the lower left just like the panel for the time which is in the lower right. The scoring system should work as follows: (1) The player gets ten points for every correct individual answer. If they answer wrong, 1 point is subtracted from the total score. Score cannot go below 0. (2) If the player finishes the 12 questions correctly before the 10 minute timer is up, the seconds left should be added as additional points. (3) If the player fails to guess the correct word, the final score is 0. (4) If the player guesses the word before the final 2 minute timer reaches zero, the difference in seconds is added to the existing score. The total score is always shown in the lower left panel with the same styling as the time panel, with text 'Score' above the divider and the accumulated score below. When the game finishes, the success message includes the total score."

## Clarifications

### Session 2025-10-16
- Q: What conditions should award bonus points? → A: No bonus points; only base points per correct answer (10 for correct, -1 for incorrect)
- Q: Should the bonus points from time remaining be added to `currentScore` immediately when phase transitions occur, or should they be tracked separately? → A: Add immediately to `currentScore` when transition happens; remove separate bonus fields
- Q: When should the time bonus from completing all 12 questions be added to the score? → A: Immediately when 12th correct answer is submitted (before UI transition)
- Q: When should the time bonus from guessing the final word be added to the score? → A: Immediately when correct final word is submitted (before success message displays)

## User Scenarios & Testing

### User Story 1 - View Running Score During Gameplay (Priority: P1)

As a player, I want to see my current score displayed throughout the game so I can track my performance and stay motivated to answer correctly.

**Why this priority**: This is essential for the scoring system to function as an engaging game mechanic. Players need real-time feedback on their performance to understand the impact of their answers.

**Independent Test**: Can be fully tested by starting a game and verifying that the score panel appears in the lower left with correct styling and updates after each answer, delivering immediate performance feedback.

**Acceptance Scenarios**:

1. **Given** the game has started, **When** the player is on the question-answering phase, **Then** the score panel is visible in the lower left position with "Score" label above a divider and "0" displayed below
2. **Given** the player has not answered any questions, **When** the score panel is displayed, **Then** it shows "0" points
3. **Given** the player has submitted an answer, **When** the answer is correct, **Then** the score increases by 10 points and displays immediately
4. **Given** the player has submitted an answer, **When** the answer is wrong, **Then** the score decreases by 1 point and displays immediately
5. **Given** the player's score would go below 0, **When** an incorrect answer is submitted, **Then** the score is set to 0 (not negative)

---

### User Story 2 - Earn Time Bonus for Early Question Completion (Priority: P2)

As a player, I want to earn bonus points if I complete all 12 questions before the 10-minute timer expires, rewarding me for efficient answering.

**Why this priority**: This adds depth to the scoring system and incentivizes players to answer quickly and correctly, increasing engagement and replayability.

**Independent Test**: Can be fully tested by answering all 12 questions correctly within the 10-minute window and verifying that the score increases by the number of remaining seconds.

**Acceptance Scenarios**:

1. **Given** the player has correctly answered all 12 questions, **When** there is time remaining before the 10-minute timer expires, **Then** the remaining seconds are added to the current score immediately upon transition to final word phase
2. **Given** the player correctly answered all 12 questions with 120 seconds remaining, **When** the transition to final word phase occurs, **Then** 120 points are added to the current score
3. **Given** the player correctly answered all 12 questions with less than 1 second remaining, **When** the transition occurs, **Then** 0 bonus points are added

---

### User Story 3 - Reset Score to Zero on Failed Final Word Guess (Priority: P2)

As a game system, I want to penalize the player severely if they fail to guess the correct word, setting their score to 0 to emphasize the importance of the final challenge.

**Why this priority**: This creates a high-stakes moment for the final word challenge and ensures the scoring system properly reflects complete task failure.

**Independent Test**: Can be fully tested by completing the question phase with a positive score and then failing to guess the correct word before the 2-minute timer expires, verifying the score becomes 0.

**Acceptance Scenarios**:

1. **Given** the player has accumulated points during the question phase, **When** they fail to guess the correct word before time expires, **Then** the score is set to 0
2. **Given** the player had 250 points accumulated, **When** they fail the final word guess, **Then** the final displayed score is 0
3. **Given** the player succeeds at the final word guess, **When** the game ends, **Then** the score is not reset to 0

---

### User Story 4 - Earn Time Bonus for Early Final Word Guess (Priority: P2)

As a player, I want to earn bonus points for guessing the final word quickly, before the 2-minute timer expires, rewarding quick and correct word identification.

**Why this priority**: This adds additional incentive for quick thinking during the final challenge and provides another way to increase score.

**Independent Test**: Can be fully tested by completing all 12 questions correctly and then guessing the final word before the 2-minute timer expires, verifying that the remaining seconds are added to the score.

**Acceptance Scenarios**:

1. **Given** the player has completed all 12 questions, **When** they guess the final word correctly with time remaining before the 2-minute timer expires, **Then** the remaining seconds are added to the current score immediately upon successful guess
2. **Given** the player guesses the final word with 60 seconds remaining, **When** the guess is confirmed as correct, **Then** 60 points are added to the existing score
3. **Given** the player guesses the final word with 0 seconds remaining (exactly at timeout), **When** the bonus is applied, **Then** 0 bonus points are added

---

### User Story 5 - Display Final Score in Success Message (Priority: P2)

As a player, I want to see my final score displayed in the success message when I complete the game, so I can clearly understand my final achievement.

**Why this priority**: This provides closure to the game experience and celebrates the player's achievement with their final score prominently displayed.

**Independent Test**: Can be fully tested by completing a full game successfully (answering all questions and guessing the final word correctly) and verifying that the success message includes the final score.

**Acceptance Scenarios**:

1. **Given** the player has successfully completed all questions and guessed the final word, **When** the game ends, **Then** the success message displays the final score
2. **Given** the player's final score is 150, **When** the success message appears, **Then** it includes "150" in the message

---

### Edge Cases

- What happens when a player answers 1 wrong answer with a score of 0? The score remains 0 (cannot go negative)
- What happens if a player completes all questions with exactly 0 seconds remaining? They receive 0 bonus points
- What happens if a player fails the final word guess after accumulating 1000 points? The score becomes 0
- What happens if a player guesses the final word with exactly 0 seconds remaining? They receive 0 bonus points from this phase
- What happens if the score should display but the player navigates between questions rapidly? The score updates accurately reflecting the most recent answer state

## Requirements

### Functional Requirements

- **FR-001**: System MUST track the player's cumulative score throughout the entire game session
- **FR-002**: System MUST add 10 points to the score when the player submits a correct answer
- **FR-003**: System MUST subtract 1 point from the score when the player submits an incorrect answer
- **FR-004**: System MUST ensure the score never goes below 0
- **FR-005**: System MUST display the score in a panel in the lower left position of the game interface
- **FR-006**: System MUST display "Score" as the label above the divider in the score panel
- **FR-007**: System MUST display the current cumulative score value below the divider in the score panel
- **FR-008**: System MUST apply the same styling and layout to the score panel as the existing time panel (lower right)
- **FR-009**: System MUST add remaining seconds as bonus points when the player completes all 12 questions before the 10-minute timer expires
- **FR-010**: System MUST stop the 10-minute timer when all 12 questions are correctly answered
- **FR-011**: System MUST set the score to 0 if the player fails to guess the correct word before the 2-minute timer expires
- **FR-012**: System MUST add remaining seconds as bonus points when the player guesses the final word correctly before the 2-minute timer expires
- **FR-013**: System MUST include the final score in the success message displayed when the game ends successfully

### Key Entities

- **GameScore**: Represents the player's cumulative score throughout a single game session
  - `currentScore`: The current accumulated points (integer, minimum 0); includes all answer points and applied time bonuses
  - `isFailed`: Boolean indicating if the final word was not guessed (if true, final score is 0)

## Success Criteria

### Measurable Outcomes

- **SC-001**: Score panel is visible and correctly positioned in the lower left during gameplay, matching the visual prominence of the time panel in the lower right
- **SC-002**: Score updates correctly within 100ms of answer submission, providing immediate feedback
- **SC-003**: Score calculation is accurate across all scenarios: correct answers (+10), incorrect answers (-1), time bonuses, and failure penalties
- **SC-004**: Score never displays negative values; minimum displayed score is 0
- **SC-005**: Time bonus calculations are accurate to the second for both question completion and final word guess phases
- **SC-006**: Final score is correctly calculated and displayed in the success message for at least 95% of game completions
- **SC-007**: Score persists accurately for the entire duration of a game session without resetting unexpectedly
- **SC-008**: Score panel styling and layout matches the existing time panel styling (font size, spacing, divider, background, etc.)

## Assumptions

- The game already has working timer functionality that accurately tracks time remaining (as implemented in feature 006-add-time-limit)
- The game session ends immediately after the player guesses the final word (either correctly or incorrectly)
- "Time remaining" means the difference between the current time and the timer's expiration time, measured in whole seconds
- The success message is the final screen displayed to the player after successful game completion
- The score panel should be visible during all game phases where scoring can occur (question answering and final word guessing)
- Score is a session-only metric and is not persisted between game sessions
