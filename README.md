
# Spec-Kit Workshop: Building "2 to Twelve"

## Workshop Overview

In this workshop, you'll learn how to use Spec-Kit to build a game called "2 to Twelve" through a structured, AI-assisted development process. By the end of this workshop, you'll understand how to professionalize "vibe-coding" by creating precise specifications that guide AI to implement exactly what you need.

## Phase 1: Understanding Spec-Kit

### What is Spec-Kit?

Spec-Kit represents an inversion of traditional AI-assisted coding otherwise known as "vibe-coding". Instead of perfecting the art of prompt engineering and hoping for the best after you press enter, you work collaboratively with AI to build increasingly detailed specifications—from user stories to technical implementation. The AI helps you think through requirements by asking *you* questions, ensuring nothing is overlooked before a single line of code is written.

Recently picked up by GitHub Copilot as the "next hot thing," Spec-Kit provides a structured workflow that transforms vague ideas into concrete, implementable features.

### The Spec-Kit Workflow

#### 1. Create Your Constitution (One-time Setup)

```bash
/speckit.constitution
```

The constitution establishes the foundational principles and standards for your project. It defines coding standards, architectural patterns, quality requirements, and any constraints that all features must adhere to. This becomes the reference point for all subsequent specifications.

Example: 
```
/speckit.constitution Create principles focused on code quality, testing standards, user experience consistency, and performance requirements
```

#### 2. Iterative Development Cycle

For each feature or slice of functionality, iterate through these steps:

##### 2a. Specify (`/speckit.specify`)

Create a high-level specification describing what you want to build from a functional perspective. This starts with user stories and desired outcomes, focusing on *what* rather than *how*. The specification should be clear enough that someone unfamiliar with the project can understand the intended functionality. This command will also create a feature branch. (it uses the first 3 words you type for the branch name)

Example: 
```
/speckit.specify Build an application that can help me organize my photos in separate photo albums. Albums are grouped by date and can be re-organized by dragging and dropping on the main page. Albums are never in other nested albums. Within each album, photos are previewed in a tile-like interface.
```

Tip: after the generation of the spec is done, review it in its entirety and update the spec either manually or ask the AI to refine it, only then proceed to the next step


##### 2b. Clarify (`/speckit.clarify`) [Optional but Recommended]

This is where the magic happens—the AI asks *you* questions about edge cases, user flows, and implementation details you might not have considered. This optional step is instrumental in achieving the inversion where AI guides you toward a more complete specification rather than making assumptions.

Example: 
```
/speckit.clarify
```

Tip: Just follow up on the questions and witness the spec get updated based on these clarifications

##### 2c. Plan (`/speckit.plan`)

Generate a technical plan that outlines the architecture, components, and technologies needed to implement the specification. This bridges the gap between functional requirements and technical implementation, providing a clear roadmap for development.

Example: 
```
/speckit.plan The application uses Vite with minimal number of libraries. Use vanilla HTML, CSS, and JavaScript as much as possible. Images are not uploaded anywhere and metadata is stored in a local SQLite database.
```

Tip: Once again, review the generated plan, research and other generated documents. These lay the technical foundation for the tasks to be generation so make sure you are happy with the plan. Manually edit or ask the AI until you are happy.

##### 2d. Tasks (`/speckit.tasks`)

Break down the plan into concrete, actionable tasks. Each task should be small enough to implement independently while contributing to the overall feature. This creates a clear checklist of work to be done.

Example:
```
/speckit.tasks
```

##### 2e. Analyze (`/speckit.analyze`) [Optional but Recommended]

Review the tasks for potential issues, dependencies, or optimizations. This step helps catch problems before implementation begins and ensures tasks are properly sequenced. Use this to validate that your plan is solid before writing code.

Example:
```
/speckit.analyze
```

##### 2f. Implement (`/speckit.implement`)

Finally, execute the tasks! With a well-defined specification, plan, and task list, the AI can implement exactly what you need. This is where you experience the "ultimate pleasure" of simply having AI execute well-specified work.

Example:
```
/speckit.implement
```

Tip: make sure to use git and ask the AI to implement phase by phase. This way you can easily track and review the changes made by the AI. Especially if you are using an AI in YOLO mode and are not approving every edit. By staging all the work you have reviewed, you can easily use the diff framework in for example VSCode to iteratively review all changes.

When you have implemented all the tasks, the feature should be completed. This is ofcourse the step to work with the AI to get the look and feel and UX of the app just right. When you are satsified, create A PR and merge the changes to the main branch.

### Key Principles

- **Review and refine** after each phase. Don't hesitate to provide follow-up instructions or manually edit outputs.
- **The optional steps matter most**: `clarify` and `analyze` are where you ensure quality and completeness.
- **Small steps win**: Don't try to build everything at once. Iterate through slices of functionality.
- **Do not delete specs after completion**: They are the foundation of your application and make sure you can always rebuild the entire app by just going through the steps again.

## Phase 2: Setup

### Install Spec-Kit

The easiest way to install Spec-Kit is using UV:

```bash
uv tool install specify-cli --from git+https://github.com/github/spec-kit.git
```

For more installation options, see the [Spec-Kit documentation](https://github.com/github/spec-kit).

### Clone the Workshop Repository

```bash
git clone https://github.com/eidikos-nl/eidikos.nl
cd eidikos.nl
```

### Choose Your AI Implementation Tool

Refer to the [Spec-Kit documentation](https://github.com/github/spec-kit) to see available AI integrations. Recommended options include:

- **GitHub Copilot** (recommended)
- **Codex CLI**
- **Claude Code**
- Many other options available

Configure your chosen AI tool according to the Spec-Kit documentation.

## Phase 3: Building "2 to Twelve"

### Game Description

**Objective**: Guess a 12-letter word within 12 minutes.

**Gameplay**:
1. Players must answer 12 general knowledge questions, each worth one letter
2. Each question yields a letter from its answer (e.g., "What is a baby dog called?" → "pup" → letter "U")
3. Questions are presented in a fixed order, and each provides a letter for a specific position (question 3 → 3rd letter)
4. The letters are NOT in order—players must unscramble them to form the final word
5. Players earn 1 point per correct answer
6. **Time structure**: 10 minutes to answer questions, then 2 mandatory minutes to guess the final word (no new questions allowed in the final 2 minutes)
7. If the player guesses the word correctly, their score doubles
8. Total time limit: 12 minutes

### Getting Started

Question sets are pre-provided in the `question-sets` folder in JSON format—12 sets ready to use.

**Important**: In your constitution, define the standards all stories must meet. In your plan.md, clearly specify the technology stack you'll use.

**Technology Choices**: 
- Web-based frontend (React, Angular, Next.js)
- Terminal-based game
- Desktop application (Python, Java, etc.)

The choice is yours—just be explicit in your specifications!

### Suggested Development Slices

Build incrementally through these feature slices:

1. **Start/Stop Game**: Implement basic game initialization and termination
2. **Question Navigation**: Select a random question set and enable navigation through questions
3. **Answer Input & Validation**: Allow players to submit answers and show whether they're correct
4. **Letter Collection**: Display collected letters when answers are correct
5. **Final Word Submission**: Implement the interface for guessing the 12-letter word
6. **Time Limits**: Add the 10-minute question phase and 2-minute guessing phase
7. **Scoring System**: Implement point calculation and score doubling

### Stretch Goals

Once core functionality is complete, consider these enhancements:

1. **Rich Media Questions**: Add support for questions with images or videos
2. **LLM Judge**: Use an LLM to validate answers more forgivingly (accepting synonyms, alternate spellings, etc.)
3. **AI Hints**: Extend the LLM to provide hints when players request help

### Development Process

For each slice:

1. Run through the Spec-Kit workflow (`/speckit.specify` → `clarify` → `plan` → `tasks` → `analyze` → `implement`)
2. Review the implementation
3. Update specifications to reflect what was actually built
4. Move to the next slice

## Phase 4: Play and Profit

Have fun! Test your game, share it with others, and enjoy the fruits of your structured development process.

## Pro Tips

### Keep Specifications in Sync

After implementing each task, ask the AI to update the `spec.md` file:

```
Please encode the learnings from the implementation back into the @spec.md file, 
focusing only on the functional changes as this is the purpose of the spec file.
```

This ensures your specification always reflects reality. You could delete all code and regenerate the exact same functionality by following your specs!

### Take Small Steps

Don't try to build large features all at once. Small, incremental slices are easier to specify, implement, and verify. You'll make faster progress with less frustration.

### Embrace the Clarify Step

When the AI asks you questions during `/speckit.clarify`, really think about them. These questions often reveal gaps in your thinking that would have caused problems during implementation.

### Review Everything

After each Spec-Kit command, review the output carefully. Don't be afraid to iterate, provide additional context, or manually refine the results. The AI is a collaborator, not a replacement for your judgment.

### Version Control

Commit your specs, plans, and tasks to git alongside your code. This creates a rich history of not just *what* you built, but *why* you built it that way.

---

## Resources

- [Spec-Kit GitHub Repository](https://github.com/github/spec-kit)
- [Workshop Repository](https://github.com/eidikos-nl/eidikos.nl)
- Question sets available in `question-sets/` folder

Happy building! 🚀
