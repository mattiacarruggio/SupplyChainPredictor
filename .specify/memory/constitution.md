<!--
SYNC IMPACT REPORT
==================
Version Change: 1.0.0 → 1.1.0
Rationale: MINOR version bump - Added 5 critical governance sections + enhanced clarification
and legal compliance requirements to prevent project risks

Modified Principles:
- Principle I: Enhanced with measurement framework (time, cost, error, revenue metrics)
- Principle VII: Clarified extensibility decision rules (10% complexity threshold)
- Principle VIII: Enhanced with 100% certainty threshold + speckit.clarify command requirements
- NEW Principle XI: Security by Design & Legal Compliance (OWASP Top 10, GDPR mandatory,
  threat modeling, security reviews, privacy by design)

Added Sections:
- Principle XI: Security by Design
- Definition of Done (10 mandatory criteria)
- Incident Response & Rollback (severity levels, rollback procedures)
- Data Privacy & Compliance (GDPR, data classification, encryption, audit trails)
- Decision Authority & Conflict Resolution (technical decisions, principle violations)
- Observability Standards (logging levels, error handling, metrics)

Modified Sections:
- Testing Expectations: Added CI/CD enforcement mechanism for coverage targets
- Architecture Constraints & Standards: Added Observability Standards subsection

Removed Sections:
- None

Templates Requiring Updates:
- ✅ Constitution principles now complete for Phase 1-3 execution
- ⚠️ .specify/templates/plan-template.md (constitution check section validated)
- ⚠️ .specify/templates/spec-template.md (security requirements now addressable)
- ⚠️ .specify/templates/tasks-template.md (DoD criteria now enforceable)

Follow-up TODOs:
- Non-Functional Requirements section (defer to Phase 2)
- Technical Debt Management section (defer to Phase 2)
- Technology flexibility escape hatch (defer to architecture.md)

Date: 2025-11-29
Amendment Author: Claude (Senior AI Architect)
Approved By: User
-->

# Supply Chain Risk & Disruption Predictor Constitution

## Purpose

This constitution defines the authoritative rules, decision principles, workflow structure,
interaction model, and quality standards that guide the development of the Supply Chain Risk
& Disruption Predictor SaaS application within VS Code using Claude + Spec Kit + Claude Code.
This constitution ensures consistency, quality, and alignment across all stages of development.

## Vision

Build a production-grade, multi-tenant, stand-alone platform that:

- Integrates with ERP systems (starting with D365 F&O via OData; expanding to SAP & Oracle)
- Detects upcoming production and supply chain disruptions using deterministic heuristics
- Provides prescriptive, financially quantified recommendations for planners & operations
  managers
- Scales from a single MVP pilot to enterprise-level deployment
- Creates defensible strategic value suitable for enterprise acquisition

## Core Principles

### I. Real Operational Impact

Every feature MUST drive measurable business impact. Features that do not solve real
operational pain or demonstrate quantifiable value are rejected. All development work must
trace back to a concrete user problem or business outcome.

**Measurement Framework**: Features must demonstrate impact via at least one metric:

- **Time saved**: Hours/week per user (quantified)
- **Cost reduction**: EUR/month quantified with calculation basis
- **Error prevention**: Percentage reduction in manual errors or rework
- **Revenue enablement**: EUR pipeline unlocked or protected

Features without quantified impact projections are rejected at specification stage.

**Rationale**: Ensures resources focus on value creation rather than speculative features.

### II. Prescriptive Over Predictive

The platform MUST provide actionable decisions, not dashboards. Outputs must include specific
recommendations with financial impact quantification, not just data visualization or alerts.

**Rationale**: Operations managers need decisions, not more data to interpret.

### III. Clarity Over Cleverness

Architecture and code MUST prioritize clean, readable, explainable design over clever
optimizations or abstractions. Code that cannot be understood by a competent developer in
<5 minutes is unacceptable unless absolutely necessary and thoroughly documented.

**Rationale**: Maintainability and team velocity trump individual cleverness.

### IV. Vertical Slice Iteration

Development MUST proceed in end-to-end usable increments, not horizontal layers. Each
iteration must deliver working functionality across all tiers (database → backend → frontend),
not incomplete infrastructure.

**Rationale**: Reduces integration risk, enables early user feedback, maintains team momentum.

### V. Stable Core, Replaceable Edges

The core risk and recommendation engines MUST be decoupled from ERP connectors. Connectors
(D365, SAP, Oracle) must be swappable without core logic changes. Adapter pattern is mandatory
for external integrations.

**Rationale**: Enables ERP expansion without architectural rework; protects core IP.

### VI. Multi-Tenant by Design

Shared database with row-level isolation is mandatory. Every data table MUST include tenant_id
with enforced filtering at the ORM/query level. No single-tenant shortcuts permitted.

**Rationale**: Prevents costly re-architecture; enables SaaS economics from day one.

### VII. Extensibility Over Premature Scaling

Frameworks MUST be designed for future expansion (additional connectors, ML integration,
notification channels) but implementation MUST remain focused on MVP scope. Build extension
points ONLY when both conditions are met:

1. The extension is confirmed in Phases 1-3 of the roadmap, OR
2. The abstraction costs <10% additional complexity vs hardcoding

Speculative hooks for hypothetical future needs are prohibited.

**Rationale**: Balances YAGNI with strategic optionality; avoids refactor tax later.

### VIII. Ask Before Assuming

When requirements, architecture decisions, or technical details have ANY uncertainty, the
AI agent MUST request clarification using the structured question format (see Clarification
Protocol). The threshold for asking is: if confidence level is <100%, ask. No guessing or
"reasonable assumption" shortcuts permitted.

**Clarification Command Requirement**: When executing `/speckit.clarify`, Claude MUST ask
about EVERY aspect where certainty is less than 100%. This includes but is not limited to:

- Ambiguous feature requirements or edge cases
- Unclear data models or relationships
- Uncertain integration patterns or API contracts
- Missing acceptance criteria or success metrics
- Vague non-functional requirements (performance, security, compliance)

**Rationale**: Prevents wasted effort on incorrect implementations; ensures alignment. Better
to ask 10 questions upfront than to rebuild features later.

### IX. Fail Fast but Safely

All integration and risk logic MUST be validated using mock data before connecting to real
ERP systems. Simulation environments are mandatory. Production integrations occur only after
successful mock validation with representative edge cases.

**Rationale**: Reduces risk of ERP system disruption; accelerates safe iteration.

### X. Documentation as Deliverable

Architecture documentation, specifications, and decision logs MUST be continuously updated
as first-class deliverables, not afterthoughts. Every significant change requires
corresponding documentation updates before PR approval.

**Rationale**: Prevents knowledge erosion; enables team scaling; maintains decision context.

### XI. Security by Design & Legal Compliance

Security and legal compliance MUST be embedded at every layer, not bolted on afterward.
This is non-negotiable for enterprise SaaS handling sensitive business data.

**Security Requirements**:

- All code MUST follow OWASP Top 10 prevention guidelines
- Security reviews are mandatory for:
  - Authentication and authorization logic
  - Data access patterns and queries (SQL injection, NoSQL injection prevention)
  - External system integrations (ERP connectors, APIs)
  - API endpoints handling sensitive data
- Threat modeling required before Phase 4 (Real ERP Integration)
- Security vulnerabilities discovered in code review are blocking—PRs rejected immediately

**Legal Compliance Requirements** (MANDATORY from Day 1):

- **GDPR Compliance**: Right to erasure, data portability, consent management, breach
  notification within 72 hours (see Data Privacy & Compliance section)
- **Data Protection**: All tenant data encrypted at rest and in transit (TLS 1.3+)
- **Audit Trails**: Immutable logs of all data access and modifications with user attribution
- **Privacy by Design**: Minimal data collection, purpose limitation, data minimization
- **Cross-Border Data**: Awareness of data residency requirements (EU/US)
- **Vendor Due Diligence**: Third-party services (hosting, logging, analytics) must be
  GDPR-compliant

**Compliance Verification**:

- Every feature MUST be reviewed against GDPR requirements during specification phase
- Data handling MUST be documented in privacy impact assessments (Phase 3+)
- Legal review required for: new data collection, third-party integrations, data retention
  changes

**Rationale**: Enterprise SaaS handling sensitive ERP data cannot afford security or legal
compliance afterthoughts. A single breach or GDPR violation destroys trust, triggers
massive fines (up to 4% of global revenue), and kills enterprise deals. Security and
compliance are not optional—they are survival requirements.

## AI Interaction Rules (Claude + Spec Kit)

Claude operates as **Senior AI Architect + Full-Stack Lead**, not a code generator.

### Claude MUST Always

- Think step-by-step before producing output
- Explain tradeoffs for major technical choices
- Request clarification when uncertainty exceeds 10%
- Provide multiple-choice reasoning with context when asking questions
- Validate decisions against constitution principles before implementation
- Update documentation alongside code changes
- **Execute commands directly instead of instructing the user to run them** - When a command needs to be run (install, build, test, etc.), Claude MUST execute it using the Bash tool rather than telling the user to run it manually

### Claude MUST Never

- Generate code without confirming alignment with architecture
- Over-engineer components in early phases
- Rewrite or remove existing modules without explicit approval
- Skip testing or validation steps
- Make assumptions about unclear requirements

## Development Workflow

### Phase 1 — Foundation (Current Phase)

- Architecture.md with system diagrams
- Repository structure scaffold
- Prisma schema for multi-tenant database
- OpenAPI specification skeleton
- Mock data generator and seed scripts
- Constitution and specification documents

### Phase 2 — Backend Core

- D365 OData Connector with abstraction layer
- Risk Engine (deterministic heuristics and rule-based evaluation)
- Recommendation Engine (prescriptive actions with financial impact calculations)
- Synchronization, structured logging, and error handling

### Phase 3 — Frontend MVP

- Authentication and login
- Dashboard with key metrics
- Risk list view and detail pages
- Recommendation acceptance/dismissal workflow

### Phase 4 — Real ERP Integration

- Live D365 F&O OData connection
- Incremental sync and delta updates
- Production monitoring and alerting

### Phase 5 — Additional Connectors & ML Enhancement

- SAP connector
- Oracle connector
- ML-based forecasting (post-MVP)
- Anomaly detection enhancements

### Phase 6 — Enterprise Hardening & Pilots

- Role-based access control (RBAC)
- Audit logging and compliance features
- SLA monitoring and reporting
- Enterprise pilot deployments

## Architecture Constraints & Standards

### Monorepo Structure

The repository MUST follow this structure:

- `/backend` — Node.js/TypeScript API server
- `/frontend` — React/TypeScript web application
- `/shared` — Shared types, utilities, and constants
- `/docs/openapi.yaml` — OpenAPI 3.x specification (source of truth for API contracts)
- `/docs/spec.md` — Spec Kit feature specifications and decision log
- `/docs/architecture.md` — System architecture and diagrams

Diagrams (C4 model or equivalent) are required for every significant architectural change.

### Code Quality Standards

All code MUST adhere to:

- TypeScript strict mode enabled (`strict: true` in tsconfig.json)
- ESLint and Prettier configurations enforced in CI/CD
- Structured logging using Pino (no console.log in production code)
- Graceful failure strategy (no silent errors; all errors logged and surfaced appropriately)
- 100% environment-based configuration via `.env` files (no hardcoded secrets or endpoints)
- Database migrations managed exclusively via Prisma Migrate

### Data Security Requirements

- `tenant_id` column enforced in all multi-tenant database tables
- Row-level security policies considered for PostgreSQL (future enhancement)
- JWT tokens with short expiry (15 minutes) and refresh token rotation
- Secrets stored in environment variables or secret management service (never in code/repo)

### Observability Standards

**Logging Levels**:

- **ERROR**: System failures requiring immediate attention (page on-call in production)
- **WARN**: Degraded state or retry scenarios (monitor, no page)
- **INFO**: Key business events (user actions, sync completions, risk detections)
- **DEBUG**: Developer troubleshooting context (disabled in production)

**Required Log Context**: Every log entry MUST include:

- `timestamp`, `level`, `tenantId`, `userId` (if applicable), `correlationId`, `component`

**Error Handling**:

- All errors MUST be logged with stack trace and context
- User-facing errors MUST be sanitized (no stack traces or sensitive data exposed)
- Errors MUST include correlation IDs for cross-service tracing
- Critical errors (data corruption, auth bypass) MUST trigger alerts

**Metrics & Monitoring**:

- Application metrics: request rate, error rate, latency (p50, p95, p99)
- Business metrics: risks detected, recommendations generated, user actions taken
- Infrastructure metrics: CPU, memory, database connections, query performance

### Testing Expectations

Testing MUST include:

- Unit tests for service layer and risk evaluation rules
- Integration tests for API endpoints with mock database
- Mock data testing for forecast and disruption scenarios
- End-to-end tests for critical user workflows (post-MVP)

Test coverage targets: >80% for services and business logic, >60% overall.

**Enforcement**:

- CI/CD pipeline MUST fail if coverage drops below thresholds
- PRs with coverage <80% in modified services are auto-rejected
- Coverage reports MUST be generated and reviewed in every PR

## Definition of Done

A feature is DONE only when ALL criteria are met:

1. ✅ Code complete and merged to main branch
2. ✅ Unit tests pass (>80% coverage for services)
3. ✅ Integration tests pass for all affected endpoints
4. ✅ Manual testing completed for all user scenarios
5. ✅ Documentation updated (API docs, architecture.md, decision log)
6. ✅ Code reviewed and approved by at least one team member
7. ✅ Security review completed (for auth, data access, integrations)
8. ✅ Performance benchmarks meet targets (if applicable)
9. ✅ No critical or high-severity bugs outstanding
10. ✅ Deployment runbook updated (if deployment steps changed)

**Important**: "Done" does not mean "deployed"—deployment timing is a separate decision.
Features marked done are production-ready but may be held for batched releases.

## Decision Logging

All major technical decisions MUST be appended to `/docs/spec.md` under the **Decisions Log**
section with the following format:

**Decision**: [Brief title]
**Options Considered**: [List of alternatives evaluated]
**Rationale**: [Why this option was chosen]
**Date**: [YYYY-MM-DD]
**Owner**: [Claude/User name]

Examples of decisions requiring logging:

- Technology stack choices (framework, database, libraries)
- Architectural pattern selections (adapter pattern, service boundaries)
- Data model changes (schema additions, relationship changes)
- Integration approach decisions (sync vs async, polling vs webhooks)

## Clarification Protocol

When uncertainty exceeds 10%, Claude MUST ask for clarification using this format:

---

**I need clarification before proceeding.**

**Context**: [Short explanation of what needs to be decided]

**Question**: [The specific question requiring user input]

**Options**:
A) [Option A with brief description]
B) [Option B with brief description]
C) [Option C with brief description]
D) Other (please specify)

**My recommended choice**: [A/B/C/D] — [Reasoning for recommendation]

---

No output should be produced until clarification is received.

## MCP / Tools / VS Code Requirements

- Use Claude Code & Spec Kit as the primary development environment
- Leverage MCP servers when beneficial for:
  - Repository creation and file operations
  - Structured specification and architecture document generation
  - Diagram generation (Mermaid, PlantUML, C4)
  - OpenAPI schema validation and generation
  - Consistency checks across specifications and code
- Always propose tool usage if it increases productivity, correctness, or structural quality

## Success Criteria

The project is considered successful when:

- MVP is usable end-to-end with mock data (target: 8-12 weeks from start)
- First enterprise pilot demonstrates quantifiable cost savings or efficiency gains
- At least 2-3 automated recommendation actions provide financial value estimates
- Architecture supports expansion to additional ERP connectors (SAP, Oracle, IBP, MES)
  without core rewrites

## Roadmap (High-Level)

- **Phase 1**: Core architecture and repository skeleton
- **Phase 2**: Backend with risk engine and D365 connector interface
- **Phase 3**: Frontend with dashboard and user actions
- **Phase 4**: Real D365 integration and production deployment
- **Phase 5**: SAP and Oracle connectors
- **Phase 6**: ML forecasting and anomaly detection
- **Phase 7**: Notifications (Slack, Teams, email integration)
- **Phase 8**: Enterprise upgrades (RBAC, audit trails, SLA guarantees)

## Data Privacy & Compliance

### Data Classification

- **Sensitive**: Tenant business data, forecast models, financial calculations, production
  schedules
- **PII**: User emails, names (minimal collection only)
- **Public**: Aggregated anonymized analytics only (with explicit tenant opt-in)

### Compliance Requirements

**GDPR Compliance**:

- Right to erasure (data deletion on tenant request)
- Data portability (export tenant data in machine-readable format)
- Consent management (explicit opt-in for analytics)
- Data breach notification (within 72 hours)

**Data Residency**:

- Support for EU/US data isolation (post-MVP, Phase 6)
- Tenant data stored in specified geographic regions

**Audit Trails**:

- All data access and modifications logged with user attribution
- Audit logs immutable and retained per compliance requirements
- Query logs for sensitive data access (production schedules, forecasts)

**Retention Policy**:

- Configurable per tenant (default: 3 years active, then archive)
- Automated archival and deletion workflows
- Legal hold capabilities for compliance investigations

**Encryption**:

- At rest: Database encryption (PostgreSQL native encryption or volume encryption)
- In transit: TLS 1.3+ for all API communications
- Secrets: Never stored in code; use environment variables or secret management service

**Future Compliance Targets** (Phase 8): SOC 2 Type II, ISO 27001

## Incident Response & Rollback

### Rollback Criteria

Trigger immediate rollback if ANY of the following occur:

- Critical functionality broken for ANY tenant
- Data corruption detected
- Security vulnerability introduced
- Error rate >5% for any endpoint
- Performance degradation >50% from baseline

### Rollback Procedure

1. Revert to last known good deployment (<5 minutes target)
2. Notify affected tenants (if applicable)
3. Create incident post-mortem within 48 hours
4. Document root cause and prevention measures in decision log
5. Implement safeguards to prevent recurrence

### Incident Severity Levels

**P0 (Critical)**:

- System down or inaccessible
- Data loss or corruption
- Security breach or unauthorized access
- **Response**: Page on-call engineer, rollback immediately, all-hands until resolved

**P1 (High)**:

- Major feature broken (risk detection, recommendations)
- Multi-tenant impact
- **Response**: Fix within 4 hours or rollback

**P2 (Medium)**:

- Minor feature degraded
- Single-tenant impact
- Workaround available
- **Response**: Fix within 24 hours

**P3 (Low)**:

- Cosmetic issue
- No functional impact
- **Response**: Schedule fix in next sprint

### Post-Incident Requirements

- Root cause analysis (RCA) documented within 48 hours
- Action items assigned and tracked to completion
- RCA shared with affected tenants (if applicable)
- Constitution amendments if systemic issue identified

## Governance

This constitution supersedes all other development practices and guidelines. Any conflicts
between this constitution and other documents are resolved in favor of this constitution.

### Amendment Procedure

Amendments to this constitution require:

1. Documented justification with business or technical rationale
2. User approval for principle changes or new constraints
3. Impact assessment on existing code, architecture, and roadmap
4. Migration plan if existing work conflicts with amendments
5. Version increment following semantic versioning rules (see below)

### Versioning Policy

Constitution versions follow semantic versioning (MAJOR.MINOR.PATCH):

- **MAJOR**: Backward-incompatible governance changes, principle removals, or redefinitions
- **MINOR**: New principles added or materially expanded guidance sections
- **PATCH**: Clarifications, wording improvements, typo fixes, non-semantic refinements

### Compliance Review

All pull requests and code reviews MUST verify compliance with constitution principles.
Any deviation requires explicit justification and approval. Complexity or technical debt
MUST be justified against business value and documented in decision log.

Development guidance for runtime work is maintained in `/docs/architecture.md` and
`/docs/spec.md` alongside this constitution.

### Decision Authority & Conflict Resolution

**For Technical Decisions**:

1. Team discussion with data-driven arguments (benchmark results, prototypes, tradeoff
   analysis)
2. If no consensus after 2 discussions, Senior AI Architect (Claude) provides recommendation
   with explicit tradeoff documentation
3. Product Owner (User) has final authority on feature scope, priorities, and business logic
4. Technical Lead (User) has final authority on architecture, tech stack, and implementation
   patterns

**For Principle Violations**:

- Any team member (including Claude) can flag a principle violation in PR review
- Violation requires explicit written justification in decision log
- Two or more principle violations in same PR = auto-reject; redesign required
- Repeated violations (>3 in 30 days) trigger constitution review meeting

**For Constitution Amendments**:

- Proposals documented with rationale, impact assessment, and migration plan
- User approval required for all amendments (no auto-amendments)
- Emergency amendments (security, legal, compliance) can be expedited with post-facto review
  within 7 days

**Escalation Path**:

- Technical disagreements → Senior AI Architect recommendation → Technical Lead decision
- Business/scope disagreements → Product Owner decision (final)
- Constitutional interpretation → User decision (final)

---

**Version**: 1.1.0 | **Ratified**: 2025-11-29 | **Last Amended**: 2025-11-29
