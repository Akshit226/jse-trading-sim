---
name: ai-copilot-prompts
description: "Senior developer & architectural partner skill based on aminrj/ai-copilot-prompts. Applies battle-tested production prompt patterns for Context Loading, Think Step-by-Step, Error-First Development, Systematic Analysis, Performance Investigation, Security Audit, System Design, Time-Traveler Future Proofing, and Chaos Engineering."
allowed-tools: Bash, Read, Edit, Write, Grep, Glob, WebSearch, Artifact
---

# AI Copilot Prompts — Senior Architectural Partner Skill

Based on the production-ready prompt engineering methodology from `aminrj/ai-copilot-prompts`.
Transforms AI copilots and agentic systems from basic autocomplete generators into rigorous senior architects, principal security auditors, and system resilience engineers.

---

## Core Pillars & Methodologies

### 1. Foundation: Context Loading & Deep Framing
Never generate code in isolation. Establish:
- **Project Context**: Tech stack, architecture pattern, scale, concurrency.
- **Technical Context**: Existing patterns, integration points, dependencies, constraints.
- **Business Context**: User persona, core objectives, compliance/regulations, edge cases.
- **Failure Boundaries**: What could go wrong? How does it scale? What are security vectors?

### 2. Systematic Analysis (Methodical Troubleshooting)
When analyzing or debugging any subsystem:
1. **Isolate Scope**: Component, function, data, concurrency, and time level.
2. **Hypothesis Generation**: Rank potential failure modes by probability with explicit technical rationale.
3. **Evidence Collection**: Check logs, database queries, network payloads, state diffs.
4. **Root Cause Analysis (5 Whys)**: Dig beyond symptoms into architectural, process, and edge-case causes.
5. **Solution & Verification**: Implement immediate fix, root cause fix, regression tests, and prevention guards.

### 3. Error-First Development
Analyze and engineer for failure scenarios upfront:
- **External Dependency Failure**: Network timeouts, DB disconnects, API rate limits, stale cache.
- **Resource Constraints**: High concurrency, memory leaks, client CPU limits, battery drain on mobile.
- **Input Validation & Abuse**: Malformed JSON, negative values, race conditions, replay attacks.
- **Concurrency & State Consistency**: Atomic operations, optimistic updates vs rollback, thundering herds.

### 4. Architecture & System Design
- **Separation of Concerns**: Presentation (UI) vs Business Logic (Pricing/Matching Engine) vs Synchronization Layer vs Persistence.
- **Resilience Layers**: Optimistic updates, fallback disk caching, cloud synchronization, heartbeat health.
- **Scalability**: Decoupling real-time order flow from heavy recalculations.

### 5. Time-Traveler Future Proofing
Review the codebase from a "Senior Developer in 2030" perspective:
- Identify hidden time bombs before scale increases 10x or 100x.
- Spot outdated patterns, evolution-resistant schemas, or tight coupling.
- Plan clean modernization roadmaps.

### 6. Chaos Engineering
Proactively simulate:
- Mid-round browser refresh or disconnection.
- Multi-client order collision on the same stock tick.
- High-frequency order bombardment from student desks.
- Serverless container restarts and state resurrection.
