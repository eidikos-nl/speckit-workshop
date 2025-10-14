<!--
Sync Impact Report (v1.0.0):
- Version change: INITIAL → 1.0.0
- Added sections:
  * Core Principles: SOLID Principles for Code Quality
  * Core Principles: Testing Standards
  * Development Workflow
  * Governance
- Templates requiring updates:
  ✅ plan-template.md (reviewed - Constitution Check section aligns)
  ✅ spec-template.md (reviewed - Requirements and Success Criteria align)
  ✅ tasks-template.md (reviewed - Testing guidance aligns)
- Follow-up TODOs: None
- Ratification date set to today (2025-10-14) as initial version

Sync Impact Report (v1.1.0):
- Version change: 1.0.0 → 1.1.0
- Added section: Testing Standards - E2E Test Selector Strategy (data-testid requirement)
- Rationale: During implementation of 001-initialize-game-i, discovered that using ARIA labels
  for test selectors caused test failures when accessibility attributes changed. Data-testid
  attributes provide stable, implementation-independent selectors.
- Templates requiring updates:
  ⚠️ plan-template.md (should include data-testid guidance in testing section)
  ⚠️ tasks-template.md (E2E test tasks should mention data-testid requirements)
- Follow-up TODOs:
  * Update plan and spec templates to include data-testid best practices
  * Consider adding automated linting to enforce data-testid on interactive elements
- Amendment date: 2025-10-14
-->

# Spec-Kit Workshop Project Constitution

## Core Principles

### I. SOLID Principles for Code Quality

**Single Responsibility Principle (SRP)**: Every class, module, or function MUST have one and only one reason to change. Each component MUST serve a single, well-defined purpose.

**Rationale**: SRP reduces coupling, improves testability, and makes code easier to understand and maintain. When a component has multiple responsibilities, changes to one responsibility can inadvertently affect others, leading to fragile code.

**Implementation Requirements**:
- Functions MUST perform a single, clearly defined operation
- Classes MUST encapsulate a single concept or behavior
- Modules MUST group related functionality with a unified purpose
- Code reviews MUST reject components with mixed concerns

**Open/Closed Principle (OCP)**: Software entities (classes, modules, functions) MUST be open for extension but closed for modification. New functionality MUST be added through extension mechanisms, not by modifying existing code.

**Rationale**: OCP protects working code from breaking when adding new features. It encourages stable, reusable abstractions and reduces regression risk.

**Implementation Requirements**:
- Use interfaces, abstract classes, or protocols to define contracts
- Prefer composition and dependency injection over inheritance
- Design plugin/extension points for anticipated variations
- Avoid modifying existing functions when adding variants—create new implementations

**Liskov Substitution Principle (LSP)**: Objects of a superclass MUST be replaceable with objects of a subclass without breaking the application. If a function expects a Bird, it MUST work correctly with a Sparrow or a Duck.

**Rationale**: LSP ensures that inheritance hierarchies are logically sound and that polymorphism works as expected. Violations lead to fragile abstractions and unexpected runtime errors.

**Implementation Requirements**:
- Subclasses MUST honor all contracts established by their parent classes
- Subclasses MUST NOT strengthen preconditions or weaken postconditions
- Behavioral substitutability MUST be verified through tests
- If a subclass cannot fulfill the parent contract, reconsider the inheritance relationship

**Interface Segregation Principle (ISP)**: Clients MUST NOT be forced to depend on interfaces they do not use. Split large, monolithic interfaces into smaller, more specific ones so that implementing classes only need to implement methods they actually require.

**Rationale**: ISP prevents bloated interfaces that create unnecessary coupling. Smaller, focused interfaces lead to cleaner, more maintainable code.

**Implementation Requirements**:
- Define focused interfaces with cohesive method groups
- Avoid "fat" interfaces with unrelated methods
- Clients MUST depend only on the methods they actually call
- When an interface grows too large, split it based on client usage patterns

**Dependency Inversion Principle (DIP)**: High-level modules MUST NOT depend on low-level modules. Both MUST depend on abstractions. Abstractions MUST NOT depend on details; details MUST depend on abstractions.

**Rationale**: DIP decouples high-level business logic from implementation details, making systems more flexible, testable, and maintainable.

**Implementation Requirements**:
- Define interfaces or abstract base classes for dependencies
- Inject dependencies rather than instantiating them directly
- High-level business logic MUST reference abstractions, not concrete implementations
- Use dependency injection frameworks or manual injection patterns

### II. Testing Standards

**Unit Testing for Pure Functions**: Unit tests MUST be written for all pure functions (functions with no side effects that return consistent outputs for given inputs).

**Rationale**: Pure functions are deterministic and isolated, making them ideal candidates for fast, reliable unit tests. Unit tests for pure functions provide rapid feedback and serve as executable documentation.

**Implementation Requirements**:
- Identify all pure functions in the codebase
- Write at least one unit test per pure function covering nominal cases
- Add additional tests for edge cases and boundary conditions
- Unit tests MUST run in isolation without external dependencies
- Unit tests MUST execute quickly (target: <100ms per test)

**End-to-End (E2E) Testing for All Features**: Every user-facing feature MUST have comprehensive end-to-end tests that validate complete user journeys from start to finish.

**Rationale**: E2E tests verify that the entire system works together correctly from the user's perspective. They catch integration issues, configuration problems, and real-world failure modes that unit tests miss.

**Implementation Requirements**:
- Every user story defined in spec.md MUST have corresponding E2E tests
- E2E tests MUST cover happy paths, critical error paths, and key edge cases
- E2E tests MUST run against a realistic environment (or production-like staging)
- E2E tests MUST be automated and included in the CI/CD pipeline
- E2E test failures MUST block releases

**E2E Test Selector Strategy**: E2E tests MUST use `data-testid` attributes for locating interactive elements rather than relying on text content, ARIA labels, or CSS selectors.

**Rationale**: Data-testid attributes provide stable, implementation-independent test selectors that don't break when UI text, styling, or accessibility attributes change. This reduces test brittleness and maintenance burden.

**Implementation Requirements**:
- All interactive elements (buttons, inputs, clickable areas) MUST have unique `data-testid` attributes
- E2E tests MUST prefer `getByTestId()` over `getByRole()`, `getByText()`, or CSS selectors
- Test IDs MUST be descriptive and follow kebab-case convention (e.g., `start-game-button`, `theme-display`)
- ARIA labels and accessibility attributes remain required but should not be used for test selection

**Test-First Development (CONDITIONAL)**: When explicitly specified in a feature specification, tests MUST be written before implementation (Test-Driven Development).

**Rationale**: Test-first development clarifies requirements, improves design, and ensures testability. However, it is not always the most efficient approach for exploratory or research-heavy work.

**Implementation Requirements**:
- When TDD is required, write failing tests first
- Verify tests fail for the right reasons before implementing
- Implement the minimal code to make tests pass
- Refactor while keeping tests green

### III. Simplicity and Pragmatism

**YAGNI (You Aren't Gonna Need It)**: Features, abstractions, and infrastructure MUST NOT be built until they are actually needed. Avoid premature optimization and speculative generality.

**Rationale**: Unnecessary complexity increases maintenance burden, slows development, and often addresses problems that never materialize.

**Implementation Requirements**:
- Implement only the features defined in the current specification
- Defer abstractions until multiple concrete examples justify them
- Remove unused code, dependencies, and configurations
- Complexity MUST be justified in the plan.md "Complexity Tracking" section

**Readability Over Cleverness**: Code MUST prioritize clarity and readability over clever tricks or performance micro-optimizations.

**Rationale**: Code is read far more often than it is written. Clear, understandable code reduces bugs, accelerates onboarding, and simplifies maintenance.

**Implementation Requirements**:
- Use descriptive variable and function names
- Prefer explicit logic over implicit or overly terse constructs
- Add comments to explain "why," not "what"
- Performance optimizations MUST be justified by profiling data

## Development Workflow

### Specification-Driven Development

All feature development MUST follow the Spec-Kit workflow:

1. **Constitution** (one-time): Define project principles and standards
2. **Specify** (`/speckit.specify`): Create functional specification with user stories
3. **Clarify** (`/speckit.clarify`): Iteratively refine requirements through targeted questions
4. **Plan** (`/speckit.plan`): Generate technical implementation plan
5. **Tasks** (`/speckit.tasks`): Break down plan into actionable tasks
6. **Analyze** (`/speckit.analyze`): Validate task list for consistency and completeness
7. **Implement** (`/speckit.implement`): Execute tasks

**Rationale**: Specification-driven development ensures that requirements are fully understood and documented before implementation begins, reducing rework and aligning outcomes with user needs.

### Code Review Standards

All code changes MUST be reviewed before merging. Reviews MUST verify:

- Compliance with SOLID principles
- Appropriate test coverage (unit tests for pure functions, E2E tests for features)
- Adherence to simplicity and readability standards
- Alignment with the feature specification and implementation plan

**Rationale**: Code reviews catch defects, enforce standards, and share knowledge across the team.

### Version Control Practices

- Commit messages MUST follow conventional commit format (e.g., `feat:`, `fix:`, `docs:`)
- Each commit SHOULD represent a single logical change
- Specifications, plans, and tasks MUST be committed alongside code
- Feature branches MUST be named according to the pattern `###-feature-name`

**Rationale**: Clear version control practices improve traceability, simplify rollbacks, and create a meaningful project history.

## Governance

### Amendment Procedure

This constitution can be amended through the following process:

1. Propose changes via the `/speckit.constitution` command with a clear rationale
2. Update affected templates in `.specify/templates/` to maintain consistency
3. Increment the constitution version according to semantic versioning:
   - **MAJOR**: Backward-incompatible governance or principle removals/redefinitions
   - **MINOR**: New principles, sections, or materially expanded guidance
   - **PATCH**: Clarifications, wording fixes, non-semantic refinements
4. Document the amendment in the Sync Impact Report (HTML comment at the top of this file)
5. Commit changes with message: `docs: amend constitution to vX.Y.Z (description)`

### Versioning Policy

The constitution follows semantic versioning (MAJOR.MINOR.PATCH):

- **MAJOR** version changes indicate backward-incompatible governance changes that may invalidate existing specifications or plans
- **MINOR** version changes add new principles or expand existing ones without breaking compatibility
- **PATCH** version changes clarify or refine existing principles without adding new requirements

### Compliance Review

All feature specifications, plans, and tasks MUST include a "Constitution Check" section (in plan.md) that verifies compliance with these principles. Non-compliance MUST be explicitly justified in the "Complexity Tracking" section of the plan.

### Living Document

This constitution is a living document. As the project evolves, principles should be refined based on practical experience. However, changes MUST be deliberate, documented, and propagated to all dependent templates and documentation.

**Version**: 1.1.0 | **Ratified**: 2025-10-14 | **Last Amended**: 2025-10-14
