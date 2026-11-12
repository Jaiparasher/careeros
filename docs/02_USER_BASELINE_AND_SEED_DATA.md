# 2. User Baseline and Seed Data

This document is the canonical interpretation of information supplied by the user. Seed JSON under `seed-data/` mirrors this specification and should be imported without changing supplied values.

## 2.1 Career profile

- Current employer: Tata Consultancy Services (TCS).
- Current title: Associate System Engineer.
- Employment period: March 2025 to present (as last supplied).
- Education: B.Tech Computer Science, 2020-2024.
- Target roles: Java Backend Developer, Full-Stack Developer, Software Engineer / SDE I.
- Target company types: product-based companies, high-growth startups and established technology companies.
- Target compensation: 10-15+ LPA goal; this is an aspiration, not a guaranteed expected offer.
- Preparation runway: 3-6 months, adjustable.
- Career direction: remain in software development; do not steer toward data analyst or data engineering roles.

Professional experience statements supplied by the user:
- Developed and maintained 15+ REST APIs / 20+ endpoints using Java, Spring Boot, Hibernate and JPA for a government e-procurement platform.
- Integrated third-party KYC / verification APIs with validation, exception handling and logging.
- Resolved production defects and supported sprint tickets; prior resume drafts mentioned approximately 10+ production defects and 3-5 tickets per sprint. Treat quantified statements as editable claims that must be verified against the user's resume before using them externally.
- Used backend debugging, SQL validation and Postman testing in an Agile team.

Do not invent employer achievements, revenue impact, traffic scale, team size or performance improvements. When suggesting resume bullets, preserve the user's evidence and ask them to validate any estimate.

## 2.2 DSA learning baseline

Completed resource:
- Name: DSA Patterns 2026 | Crack FAANG in 3 Months | DSA Patterns by IITian.
- Creator/channel: Padho with Pratyush.
- Playlist: https://www.youtube.com/playlist?list=PLbJhGqY-mq47k_WLUtzVjmarUm1EuXPj2
- Channel: https://www.youtube.com/@padho_with_pratyush
- User reports the playlist is completed.
- User reports 350+ DSA problems solved.

Known patterns/topics mentioned in prior preparation context:
- Two Pointers.
- Fast and Slow Pointers.
- Sliding Window.
- Kadane's Algorithm.
- Prefix Sum.
- Merge Intervals.
- Stack.
- Hash Maps.
- In-place Linked List Reversal.
- Dynamic Programming.
- Graphs, BFS and DFS.
- Binary Search.
- Trees and other common interview patterns.

Important modeling rule: mark the playlist as completed and record the aggregate claim of 350+ solved problems. Do not fabricate the identities, URLs, dates, attempts or individual solution history of those 350+ questions. Known patterns are `baseline-known` / require assessment, not automatically `mastered`. Let the user import exact questions later via CSV.

## 2.3 Coding Shuttle course baseline

Course: Spring Boot 0 to 100 Cohort 4.0 [AI + DevOps].

Exact module progress supplied:

| # | Module | Progress |
|---:|---|---:|
| 1 | Introduction To Spring & Spring Boot | 100% |
| 2 | Spring Boot MVC and RESTful APIs | 100% |
| 3 | Hibernate and Spring Boot Data JPA | 100% |
| 4 | Production ready Spring Boot Features | 0% |
| 5 | Spring Security Fundamentals | 100% |
| 6 | Spring Security Advanced | 100% |
| 7 | Spring Boot Testing | 11% |
| 8 | Spring Boot Deployment with CI/CD | 0% |
| 9 | Spring AI, RAG and Tool Calling | 100% |
| 10 | Aspect-Oriented Programming | 0% |
| 11 | Caching and Concurrent Transaction Management | 0% |
| 12 | Introduction To Microservice Architecture | 0% |
| 13 | Advanced Microservice Concepts | 0% |
| 14 | Apache Kafka in Spring Boot | 0% |
| 15 | Docker with Spring Boot | 100% |
| 16 | Kubernetes Components | 100% |
| 17 | Kubernetes Advanced | 0% |
| 18 | Java Multithreading and Async Task Scheduling in Spring Boot | 0% |
| 19 | Reactive Programming Basics | 0% |
| 20 | Reactive Programming Advanced | 0% |

Computed baseline:
- 20 modules total.
- 8 modules at 100%.
- 1 module partially complete (11%).
- 11 modules at 0%.
- Arithmetic mean of module percentages: 40.55%.

The user supplied unlock dates and deadlines, all of which are historical. They are intentionally not needed for current scheduling. Do not display historical course deadlines as upcoming tasks. Preserve module order and percentage values.

Model course progress separately from:
- confidence rating (user self-rating),
- knowledge assessment result,
- practical implementation evidence,
- interview readiness.

## 2.4 Practical project baseline

Project name: Lovable (user's AI-powered application builder project; this is the user's project name and should not be confused with the commercial Lovable platform).

Technologies and areas used or explored:
- Java, Spring Boot, Spring AI, React.
- PostgreSQL and pgvector.
- RAG and tool calling.
- REST APIs and Server-Sent Events (SSE).
- Docker and Kubernetes.
- MinIO and cloud deployment.

The user says the project has been developed but not all modules/features are complete. Store it as `in_progress`, not `completed`. Do not assume every technology above is fully production-ready or deeply mastered. Allow the user to classify each technology as studied, used in project, or independently confident.

## 2.5 Seed/import behavior

- Seed files must be idempotent: re-running import must not create duplicate course modules.
- Use stable external keys for seeded course modules, e.g. `coding-shuttle-cohort-4-module-01`.
- Seed the user's initial profile once; allow edit afterwards.
- Store provenance such as `source = user_supplied_baseline`.
- Do not overwrite user edits when the seed process runs again; use an explicit reset or merge operation.
- Show a first-run review page or summary so the user can correct details before relying on them.
