# Feature Specification: Game Time Limits with Dual Timer Display

**Feature Branch**: `006-add-time-limit`
**Created**: 2025-10-15
**Status**: 🚧 Implementation Complete (E2E tests pending for US2-US5)
**Input**: User description: "Add time limit to the game which should count down from the moment the game is started from 10 minutes to 0 and when that time is reached the 2 minute guessing timer will start counting down. this means we need to have 2 timers visually shown in the screen. Since this is an important component it should always be visible floating in the bottom right corner. I envision a floating panel with a slight shadow with the top of the panel containing the 10 minute timer and the bottom containing the 2 minute timer. For both of these timers the color of the text should change to red in the last 10 seconds. Of course the timer should visually update every second. When the 10 minute timer is up, it should no longer be possible to navigate through questions and the question and answer components should fade out to 20% opacity and be disabled. When the 2 minute timer ends without a valid answer this shows the "The time is up, you lost!" message. Whenever a valid final answer was given, the timer is stopped as well."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Continuous Time Awareness (Priority: P1)

Players can see exactly how much time remains throughout gameplay via a persistent dual-timer display, enabling them to pace their progress and make strategic decisions about question navigation and answer submission.

**Why this priority**: Core game mechanic that affects all player decisions. Without visible timers, players cannot manage their time effectively, making the entire time-limit feature meaningless.

**Independent Test**: Can be fully tested by starting a game and observing that both timers are visible, update every second, and display correct countdown values.

**Acceptance Scenarios**:

1. **Given** a game has just started, **When** the player views the game screen, **Then** they see a floating panel in the bottom right corner displaying "10:00" for the main timer and "2:00" for the final timer
2. **Given** the game is in progress, **When** one second passes, **Then** both timer displays update to reflect the new remaining time
3. **Given** the main timer shows "5:30" remaining, **When** the player navigates between questions, **Then** the timer panel remains visible and continues counting down
4. **Given** the main timer reaches "0:09", **When** the timer updates, **Then** the timer text color changes to red
5. **Given** the game is in progress, **When** the player scrolls or interacts with game elements, **Then** the floating timer panel remains fixed in the bottom right corner

---

### User Story 2 - Gameplay Phase Transition (Priority: P2)

When the 10-minute main timer expires, the game automatically transitions to a final answer phase where players can no longer explore questions but must submit their final answer within 2 minutes.

**Why this priority**: Defines the critical game state transition that creates urgency and changes available player actions. Essential for proper game flow.

**Independent Test**: Can be tested by waiting for (or manually setting) the main timer to reach zero and verifying that question navigation becomes disabled and visual changes occur.

**Acceptance Scenarios**:

1. **Given** the main timer reaches "0:00", **When** the timer expires, **Then** the final timer begins counting down from "2:00"
2. **Given** the main timer has expired, **When** the player attempts to navigate to a different question, **Then** the navigation controls do not respond
3. **Given** the main timer has expired, **When** the game displays questions and answers, **Then** these components appear at 20% opacity
4. **Given** the main timer has expired, **When** the player interacts with question or answer components, **Then** these components do not respond to interactions
5. **Given** the final timer is active and counting down, **When** the player views the timer panel, **Then** the main timer shows "0:00" and the final timer shows remaining time

---

### User Story 3 - Urgency Visual Indicators (Priority: P3)

Players receive clear visual warnings when time is running critically low through color changes, helping them recognize when immediate action is needed without constantly checking exact time values.

**Why this priority**: Enhances user experience by providing peripheral awareness of time pressure. Important for accessibility and reducing cognitive load, but game is still playable without it.

**Independent Test**: Can be tested by observing timer display when less than 10 seconds remain on either timer and verifying the red color change occurs.

**Acceptance Scenarios**:

1. **Given** the main timer reaches "0:10", **When** it continues counting down to "0:09", **Then** the main timer text changes from its default color to red
2. **Given** the final timer reaches "0:10", **When** it continues counting down to "0:09", **Then** the final timer text changes from its default color to red
3. **Given** the main timer shows "0:05" in red, **When** the player glances at the screen, **Then** they can immediately perceive the time urgency through the color
4. **Given** either timer is above "0:10", **When** the timers are displayed, **Then** both timers show in their default color (not red)

---

### User Story 4 - Time Expiration Game Loss (Priority: P4)

When the final 2-minute timer expires without a valid answer submission, the game ends with a clear loss notification, providing closure and feedback to the player.

**Why this priority**: Defines the final failure condition for the game. Essential for complete game rules but depends on the timer mechanics being established first.

**Independent Test**: Can be tested by allowing the final timer to reach zero without submitting an answer and verifying the loss message appears.

**Acceptance Scenarios**:

1. **Given** the final timer is counting down, **When** it reaches "0:00" and no valid answer has been submitted, **Then** the message "The time is up, you lost!" is displayed to the player
2. **Given** the final timer has expired, **When** the loss message is shown, **Then** the player cannot continue playing or submit answers
3. **Given** the final timer shows "0:01", **When** it counts down to "0:00" and no answer was submitted, **Then** both timers stop counting

---

### User Story 5 - Timer Stops on Success (Priority: P5)

When a player successfully submits the correct final answer, both timers immediately stop counting, indicating that the time pressure is over and the player has won.

**Why this priority**: Provides positive feedback and finality when player succeeds. Nice-to-have refinement that confirms success but not critical for basic functionality.

**Independent Test**: Can be tested by submitting a correct final answer and verifying both timers stop at their current values.

**Acceptance Scenarios**:

1. **Given** the player submits a valid final answer, **When** the answer is accepted, **Then** both timers immediately stop counting
2. **Given** the main timer shows "7:34" and final timer shows "2:00", **When** a correct answer is submitted, **Then** both timers remain frozen at "7:34" and "2:00"
3. **Given** timers have stopped due to correct answer, **When** time passes, **Then** the timer displays remain unchanged

---

### Edge Cases

- What happens when a player submits an answer at the exact moment a timer expires? (Answer: Timer expiration takes precedence; if final timer expires, game shows loss message regardless of submission timing)
- How do timers behave if the browser tab loses focus or the device goes to sleep? (Answer: Timers continue based on actual elapsed time when tab regains focus)
- What if a player refreshes the page during gameplay? (Answer: Game session is lost and player must restart; timers do not persist across page refreshes)
- What happens to the final timer display before the main timer expires? (Answer: Final timer shows "2:00" but is inactive/not counting down until main timer reaches zero)
- Can a player pause the game to stop the timers? (Answer: No pause functionality exists; timers run continuously from game start)
- What happens if a player answers all 12 questions before the main timer expires? (Answer: The main timer immediately freezes at its current time, the final answer phase begins, and the 2-minute final timer starts counting down from 2:00)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display two independent countdown timers simultaneously in a floating panel
- **FR-002**: Main timer MUST count down from 10 minutes (600 seconds) starting the moment the game begins
- **FR-003**: Final timer MUST count down from 2 minutes (120 seconds) starting when the main timer reaches zero
- **FR-004**: Both timers MUST update their displayed values every second to reflect current remaining time
- **FR-005**: Timer panel MUST be positioned in the bottom right corner of the game screen
- **FR-006**: Timer panel MUST remain visible (floating) above all other game content at all times during active gameplay
- **FR-007**: Timer panel MUST display the main timer in the top portion and final timer in the bottom portion
- **FR-008**: Timer panel MUST have a visual shadow effect to create depth and distinguish it from background content
- **FR-009**: System MUST change timer text color to red when either timer has 10 seconds or less remaining
- **FR-010**: System MUST disable all question navigation controls when the main timer reaches zero
- **FR-011**: System MUST reduce the opacity of question and answer display components to 20% when the main timer reaches zero
- **FR-012**: System MUST prevent all interactions with question and answer components when the main timer reaches zero
- **FR-013**: System MUST display the message "The time is up, you lost!" when the final timer reaches zero without a valid answer being submitted
- **FR-014**: System MUST stop both timers immediately when a valid final answer is submitted successfully
- **FR-015**: Timer displays MUST show time in MM:SS format (e.g., "10:00", "2:45", "0:09")
- **FR-016**: System MUST immediately transition to FINAL_ANSWER phase and freeze the main timer when all 12 individual questions have been answered correctly, starting the 2-minute final timer

### Key Entities

- **Timer State**: Represents the current state of both countdown timers including remaining seconds, active/inactive status, and visual state (normal/urgent coloring)
- **Game Phase**: Represents whether the game is in the exploration phase (main timer active) or final answer phase (final timer active), which determines available player actions

## Assumptions

- Game session exists in a single browser tab without persistence across page refreshes
- System clock on the player's device is reasonably accurate
- Browser JavaScript execution continues when tab is active and visible
- Game has a clear start point that triggers timer initialization
- Valid final answer submission is determined by existing game logic (out of scope for this feature)
- Player device has sufficient performance to update UI elements every second without noticeable lag
- No pause or timer manipulation functionality exists in the game

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Players can see current remaining time at any moment during gameplay without navigating away from the current screen
- **SC-002**: Timer displays update smoothly every second with less than 100ms variance from actual elapsed time
- **SC-003**: Players receive visual urgency indicators (red text) exactly 10 seconds before each timer expires
- **SC-004**: Game correctly transitions from exploration phase to final answer phase within 1 second of main timer expiration
- **SC-005**: Game correctly ends with loss message within 1 second of final timer expiration when no valid answer exists
- **SC-006**: 100% of successful answer submissions result in immediate timer stoppage
- **SC-007**: Timer panel remains visible and functional across all game screens and during all player interactions
- **SC-008**: Game correctly transitions to final answer phase when the 12th question is answered before main timer expiration, freezing remaining main timer time
