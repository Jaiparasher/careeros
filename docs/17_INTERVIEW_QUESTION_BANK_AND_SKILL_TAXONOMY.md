# 17. Resume-Wide Interview Question Bank

## 17.1 Objective

CareerOS must contain a dedicated interview question library that covers every technology, tool, framework and important skill listed in the user's resume/profile inventory. Questions must be browseable both **technology/skill-wise** and **topic-wise**. This is separate from the DSA problem tracker: DSA contains coding problems; this library contains technical concept, practical scenario, debugging, architecture, behavioral and project questions.

The bank is a comprehensive, editable starter library, not a claim that a finite application can contain every question ever asked. It must cover all skills in `seed-data/interview-skills-catalog.json`, allow new skills/topics/questions, and make missing coverage visible.

## 17.2 Initial skill coverage

Use `seed-data/interview-skills-catalog.json` as the initial inventory. It includes:

- Programming: Java, JavaScript, TypeScript, C and C++.
- Java backend: Spring Framework/Core, Spring Boot, Spring Security, Hibernate/JPA, Microservices, Apache Kafka, Spring AI/RAG/Tool Calling.
- Frontend: React, Redux, Next.js.
- Node ecosystem: Node.js, Express.js.
- Data: SQL, MySQL, MongoDB, Firebase, PostgreSQL/pgvector.
- API/integration: REST APIs, WebSockets, Server-Sent Events, JWT, Postman, Swagger/OpenAPI.
- Delivery/tools: Docker, Kubernetes, Git/GitHub, Maven, CI/CD, Agile/Scrum.
- CS/system design: DBMS, Operating Systems, Computer Networks, LLD and HLD.
- Cloud/AI: AWS foundations and AI Practitioner concepts.
- Experience: TCS e-procurement project, Lovable AI builder project and behavioral/HR interviews.

Treat this as an editable baseline. Before the first import, show a skill inventory confirmation view so the user can correct the list against their latest resume. Never claim the user is expert in a skill because it appears in the resume.

## 17.3 Taxonomy and navigation

The interview question page must support two primary browse modes:

1. **Browse by Technology / Skill**: category → technology/skill → topic → question.
2. **Browse by Topic**: topic family → individual topic → questions, regardless of technology.

Examples:
- Java → Collections → HashMap internals, equals/hashCode, collision handling.
- Spring Boot → REST APIs → validation, exception handling, request lifecycle.
- SQL → Joins → inner/left joins and query-writing prompts.
- React → Hooks → useEffect dependencies and rendering behavior.
- Docker → Images and containers → layers, volumes and networking.
- Interview topic → debugging / trade-offs / security / performance / project deep dive.

Question filters: technology/skill, topic, question type, difficulty, role relevance, priority, status, confidence, source, due for revision, and unanswered/incorrect. Search must find question text, tags and topics. Support a compact table/list and grouped view.

## 17.4 Question record and answer experience

Each question record should support:
- Skill slug/name and category.
- Topic and optional subtopic.
- Question title and full question prompt (originally authored or appropriately sourced).
- Type: conceptual, coding, debugging, practical scenario, design, behavioral, project deep dive, or SQL/query exercise.
- Difficulty: basic, intermediate, advanced.
- Priority: critical, high, medium, low.
- Target role tags (Java backend, full stack, SDE I, etc.).
- Tags/keywords.
- Expected answer points / evaluation rubric.
- Optional concise sample answer and follow-up questions.
- Source name, reference URL and attribution when sourced externally.
- Progress: not_started, learning, attempted, answered, needs_revision, strong.
- Confidence score 1-5, last attempted date, next revision date, answer notes and user notes.

An answer view should let the user reveal the key points after attempting an answer. Keep expected points concise and useful; avoid walls of text. Answers should explain why an answer is correct and include a practical example where relevant. For code-oriented technology questions, use Java by default unless the skill is JavaScript/TypeScript/React/Node/C/C++.

Do not score a question as `strong` automatically after one correct response. Allow self-rating and evidence-based assessment separately.

## 17.5 Starter content depth

Populate a non-empty starter bank before declaring the page complete. Recommended minimums:
- Critical/high-priority skills: at least 10-12 starter questions per skill, distributed across the listed topics.
- Medium-priority skills: at least 6-8 starter questions per skill.
- Low-priority skills: at least 3-5 starter questions per skill.
- Each project deep-dive category: at least 10 prompts, based only on supplied project/work context and clearly marked for user verification.

Prioritize depth for Java, Spring Boot, Spring Security, Hibernate/JPA, SQL/DBMS, REST APIs, DSA, React, Microservices, Kafka, Docker, LLD and project deep dives. For tools such as Postman, Swagger, Maven and Git, focus on practical workflow/troubleshooting questions rather than trivia.

Question content should be original or appropriately attributed. Do not present generic questions as verified questions asked by a particular company. If the source is unknown, label it `CareerOS curated`, not `frequently asked by Google/Amazon/etc.`. Do not copy full proprietary problem statements, book pages, paid-course material or editorial solutions.

## 17.6 Grind 75 collection

Grind 75 is a named DSA collection under DSA Practice, not just a free-text tag. Use the official Tech Interview Handbook source:
- Main tool: https://www.techinterviewhandbook.org/grind75/
- About: https://www.techinterviewhandbook.org/grind75/about
- FAQ: https://www.techinterviewhandbook.org/grind75/faq

The official tool is customizable by study duration, difficulty and topics; its selected core 75 is based on a larger pool. The live page may change. The app must:
- Include a `Grind 75 - Core 75` collection and a link to the official source.
- Preserve official order, question title, difficulty, topic tags and canonical LeetCode URL when importing.
- Store source snapshot/import date; do not hardcode official counts as permanent constants.
- Allow a user to add the expanded Grind 169 collection later, but keep Core 75 as the default first sprint target.
- Allow progress, notes, attempts and spaced revision using the existing DSA tracker.
- Detect duplicates against the user's existing DSA problem history by normalized LeetCode URL/slug. If an exact question already exists, attach it to the Grind 75 collection instead of creating a duplicate.
- Never infer individual Grind 75 completion from the user's aggregate `350+ solved` statement.
- Do not copy full problem statements or editorial solutions. Store the title, official problem link and metadata; the user opens the original platform for the full prompt.

If reliable import from the official site is not possible, do not scrape aggressively or invent records. Provide a CSV import flow and a prominent official link. A collection shell without verified question entries must be labelled `not imported`, never shown as 75/75 available.

## 17.7 Relation to the 30-day sprint

Use `docs/18_FIRST_30_DAY_INTERVIEW_SPRINT.md` for the starter schedule. The question bank is the content source for skill-based study tasks. The DSA tracker is the content source for Grind 75 tasks.

The first 30 days must expose the user to all high-priority skill groups and target-role essentials. It should not claim to exhaust every question in the bank. The 30-day sprint contains a target to complete the Grind 75 Core 75, but the system must check real estimated workload against the user's daily available time and show an overload warning when necessary.

Each planned skill question should be linked to its bank record. Tasks must record why the question was selected, estimated minutes, priority and target role relevance. The user must preview and accept the plan before tasks are created.

## 17.8 Day 31+ prioritization

After the first 30 days, generate rolling 7-day plans and a priority backlog. Use visible and editable weighting:
- 30% role/JD relevance.
- 25% assessed knowledge gap and repeated mistakes.
- 20% importance to the user's resume and target role.
- 15% revision due/recency.
- 10% user preference or upcoming interview date.

Prioritize Java, Spring Boot, Hibernate/JPA, SQL, REST APIs and DSA for Java backend roles; increase React/JavaScript/TypeScript/Node/Next.js for full-stack roles. Add job-description-specific priorities only when the user supplies a JD. Explain each recommendation in plain language. Do not let AI override a deterministic time budget.

## 17.9 AI usage

The bank must work without AI. Static question content, filters, answer notes and progress are part of Phase 2. Phase 4 may add user-triggered AI evaluation, improved answers, follow-up questions and question generation. Generated questions must be marked `AI generated`, validated before saving and deduplicated. Store provider/model metadata for AI-generated content. AI must not auto-generate hundreds of questions in the background or incur costs just by opening the bank.

## 17.10 Acceptance criteria

- [ ] All technologies in the confirmed skills catalog are visible and filterable.
- [ ] Browse-by-skill and browse-by-topic both work.
- [ ] Every displayed question has a skill, topic, type, difficulty and priority.
- [ ] Starter question content exists for all listed skills at the minimum counts above or the app clearly marks the remaining skills as `content pending`.
- [ ] User can record an answer, notes, status, confidence and revision date.
- [ ] Filters can be combined and search is responsive.
- [ ] Grind 75 is a separate collection with official source attribution and import status.
- [ ] Grind 75 duplicates link to existing DSA records rather than duplicating data.
- [ ] The planner selects question-bank items and Grind 75 problems as separate task types.
- [ ] No question is labelled company-specific or “asked in interview” without a verifiable source.
- [ ] Core question bank remains useful with AI disabled.
