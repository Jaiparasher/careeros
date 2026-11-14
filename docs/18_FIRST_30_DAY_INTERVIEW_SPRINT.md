# 18. First 30-Day Interview Sprint and Adaptive Continuation

## 18.1 Goal

The first 30 calendar days form an interview-focused sprint. The planner must cover the essential question areas across the user's resume skills and target roles while tracking the official Grind 75 core collection. It is a configurable plan, not a promise that every question can be completed regardless of available time.

The sprint must cover: Grind 75 DSA practice; Java and Spring backend; SQL/DBMS; React and JavaScript/TypeScript; Node/Express/Next.js/Redux; REST/API integration; databases; Docker/Kubernetes/Git/Maven/CI-CD; microservices/Kafka; CS fundamentals; LLD/HLD; AWS foundations; behavioral and project deep dives.

## 18.2 Grind 75 source and workload warning

Use the official Tech Interview Handbook Grind 75 page as the source of truth: https://www.techinterviewhandbook.org/grind75/ . The official page supports customization by schedule, difficulty and topic and can show the core 75 or expanded list. The live site currently describes a 169-question pool with a selected core 75. Its default 75 view recently showed 24 Easy, 42 Medium and 9 Hard with an estimated 64 hours; those counts and estimates can change, so fetch or verify current metadata instead of hardcoding it. See the About and FAQ pages: https://www.techinterviewhandbook.org/grind75/about and https://www.techinterviewhandbook.org/grind75/faq .

The current 64-hour estimate means a complete 75-question Grind 75 run in 30 days is intensive (about 2.1 hours/day for DSA alone before technology questions and review). The planner must calculate the actual workload from imported question estimates and the user's available minutes. Show an explicit capacity warning and offer a 45- or 60-day alternative if the full 30-day target does not fit. Never silently overload the user's day or mark missed tasks as failure.

Do not reproduce full LeetCode problem statements or editorial solutions in the seed data. Store title, difficulty, topic, canonical URL, source order and estimated time, and link to the official problem. Preserve source attribution. If the official list cannot be imported reliably, show the official link and provide CSV/manual import rather than fabricating entries.

## 18.3 Daily planning template

At setup, ask the user to choose the sprint start date, target role focus and daily available study minutes. Do not assume a fixed daily availability. The daily planner should allocate time in this order:

1. Due revision from previously attempted questions/topics.
2. Scheduled Grind 75 problem(s) with their source-estimated time.
3. Skill-wise interview questions from the day's technology/topic focus.
4. Short recap / answer notes.
5. Optional stretch task only when there is remaining time.

Daily skill-bank work should normally select 4-6 focused questions (or fewer if the available time is lower). The user can answer aloud, write notes, or mark a question as attempted. Do not require perfect written answers for every question. Use a user-controlled status and confidence rating.

## 18.4 Day-by-day starter plan

The Grind 75 numbers below mean official source order after a verified import; they are not fabricated question titles. Review days do not introduce new Grind 75 items.

| Day | Technology / interview focus | Grind 75 target | Question-bank tasks and review |
|---:|---|---|---|
| 1 | **Java foundations** | Grind75 #01-#03 | Core syntax, JVM/JRE/JDK, primitive/reference types; answer 4-6 Java fundamentals questions. Record baseline confidence; 10-minute recap. |
| 2 | **OOP and design principles** | Grind75 #04-#06 | Encapsulation, abstraction, inheritance, polymorphism, composition, SOLID; answer 4-6 questions. Explain one concept with a practical Java example. |
| 3 | **Collections Framework** | Grind75 #07-#09 | List/Set/Map, HashMap internals, equals/hashCode, sorting, fail-fast; answer 4-6 questions. Revise errors from Days 1-2. |
| 4 | **Strings, generics and exceptions** | Grind75 #10-#12 | String pool/immutability, StringBuilder, generics, checked/unchecked exceptions, custom exceptions. Write concise answer notes. |
| 5 | **Java 8+ and functional programming** | Grind75 #13-#15 | Lambdas, streams, Optional, functional interfaces, map/filter/reduce; answer 4-6 questions. Mini Java technical quiz. |
| 6 | **Review checkpoint 1** | Review assigned Grind75 #01-#15; no new Grind75 items | Revisit incorrect/slow questions; Java fundamentals and OOP mock round. Update topic confidence and revisions. |
| 7 | **JVM and memory** | Grind75 #16-#18 | Heap/stack, GC basics, class loading, memory leaks, common JVM diagnostics. 4-6 questions; practical explanations. |
| 8 | **Multithreading and concurrency** | Grind75 #19-#21 | Thread lifecycle, Runnable/Callable, synchronized, volatile, locks, executors, race conditions. Prioritize examples over memorized definitions. |
| 9 | **Spring Core** | Grind75 #22-#24 | IoC, DI, bean lifecycle/scopes, ApplicationContext, configuration, AOP basics. 4-6 Spring Core questions. |
| 10 | **Spring Boot internals** | Grind75 #25-#27 | Auto-configuration, starters, profiles, configuration properties, application lifecycle, Actuator. Compare Spring Framework and Spring Boot. |
| 11 | **REST API development** | Grind75 #28-#30 | HTTP methods/status codes, controllers, validation, exception handling, pagination, idempotency, versioning. Design one e-procurement endpoint verbally. |
| 12 | **Hibernate and Spring Data JPA** | Grind75 #31-#33 | Entity lifecycle, mappings, fetch types, N+1, JPQL, transactions, cascading and locking. Answer with examples from work where true. |
| 13 | **Review checkpoint 2** | Review assigned Grind75 #16-#33; no new Grind75 items | Java + Spring Boot timed Q&A; review incorrect SQL/ORM concepts if any. Re-score Java and Spring topics. |
| 14 | **Spring Security and JWT** | Grind75 #34-#36 | Security filter chain, authentication/authorization, JWT lifecycle, refresh/expiry, CORS/CSRF. Explain a secure request flow. |
| 15 | **Testing and production readiness** | Grind75 #37-#39 | JUnit, Mockito, integration tests, test slices, logging, Actuator, AOP, debugging production defects. Review Coding Shuttle testing progress; no invented mastery. |
| 16 | **SQL fundamentals** | Grind75 #40-#42 | SELECT, joins, aggregation, GROUP BY/HAVING, subqueries; solve query-writing prompts. Practice SQL in a real database when possible. |
| 17 | **Advanced SQL and DBMS** | Grind75 #43-#45 | CTEs, window functions, indexes, normalization, ACID, isolation levels, locks and deadlocks. Take a timed SQL quiz. |
| 18 | **Database technology comparison** | Grind75 #46-#48 | MySQL, PostgreSQL, MongoDB and Firebase: data modeling, indexes, transactions, use cases and trade-offs. Do not claim production depth where only studied. |
| 19 | **React foundations** | Grind75 #49-#51 | Components, props/state, hooks, forms, effects, component lifecycle and rendering. Relate concepts to actual Lovable frontend work. |
| 20 | **React advanced and Redux** | Grind75 #52-#54 | Context, Redux Toolkit, selectors, async state, memoization, rendering/performance and state ownership. 4-6 targeted interview questions. |
| 21 | **JavaScript and TypeScript** | Grind75 #55-#57 | Closures, hoisting, this, prototypes, event loop, promises, async/await, TS interfaces/generics/narrowing. Compare runtime JavaScript with TypeScript type checking. |
| 22 | **Node.js and Express** | Grind75 #58-#60 | Event loop, non-blocking I/O, middleware, routing, error handling, validation, REST service structure. Mark this area by actual target-role relevance. |
| 23 | **Next.js and full-stack rendering** | Grind75 #61-#63 | App Router, server/client components, SSR/SSG/ISR, route handlers, server actions, caching, Redux fit. Explain one end-to-end request flow. |
| 24 | **API integration and real-time systems** | Grind75 #64-#66 | REST design, WebSockets vs SSE vs polling, JWT, Swagger/OpenAPI, Postman environments and tests. Build/describe one API test collection. |
| 25 | **Microservices, Kafka and Spring AI** | Grind75 #67-#69 | Service boundaries, API gateway, resilience, Kafka partitions/consumer groups, delivery semantics, RAG/tool calling. Use Lovable project only for features actually implemented. |
| 26 | **Review checkpoint 3** | Review assigned Grind75 #49-#69; no new Grind75 items | Full-stack and backend mixed revision; review mistakes and mark weak questions. Update skill priority and readiness. |
| 27 | **DevOps, tools and cloud basics** | Grind75 #70-#72 | Docker images/containers, Kubernetes Pods/Deployments/Services, Git workflows, Maven, CI/CD, AWS foundations/AI Practitioner concepts, Agile/Scrum. Focus on resume-listed tools and truthful hands-on depth. |
| 28 | **System design and CS fundamentals** | Grind75 #73-#75 | LLD, SOLID/design patterns, HLD basics, DBMS recap, OS processes/threads/deadlocks, networking TCP/HTTP/TLS/DNS; C/C++ fundamentals only if relevant. Do not over-prioritize lower-relevance C/C++ over Java/backend. |
| 29 | **Mock interview day** | No new Grind75 items | One Java backend mock, one SQL/DSA timed round or a full-stack mock depending on target role. Cover projects and follow-ups. Save scores, weak areas and follow-up topics. |
| 30 | **Final review and next-plan generation** | Review all unfinished/flagged Grind75 items; no new mandatory set | Review self-introduction, TCS project and Lovable project; behavioral questions; run baseline reassessment. Generate the next 30-day plan using role relevance, weak areas, results, due revisions and available time. |

## 18.5 Plan generation and overload behavior

- Generate the plan as a preview first; the user accepts it before tasks are persisted.
- The full 30-day template is the target plan. If available time cannot fit the target, identify the overload in minutes/hours and let the user choose: intensive 30 days, capacity-adjusted 45 days, or capacity-adjusted 60 days.
- Within each day, prioritize Java, Spring Boot, Hibernate/JPA, SQL, REST APIs, DSA, and the user's actual target role. Include every other resume-listed skill at least in the bank; schedule lower-priority items when capacity allows.
- Do not assume the user's 350+ aggregate DSA count means any particular Grind 75 problem is solved. Only mark an exact item completed when the user imports exact history or confirms it. Deduplicate by normalized LeetCode URL/slug; if a pre-existing solved problem matches, preserve its status and do not schedule it as new work.
- Keep the official Grind 75 sequence unless the user intentionally filters or reorders it. A user can filter by topic/difficulty, but the default sprint is balanced.
- Every task must have estimated minutes, priority, date, source question/topic, status and reason for inclusion.
- When a task is deferred, preserve it and recalculate later dates only after explicit acceptance.

## 18.6 Days 31+ - priority-based continuation

After Day 30, do not automatically create another fixed curriculum. Generate a rolling 7-day plan and a backlog ordered by a transparent priority score. Suggested weighted score:

- 30%: relevance to selected target role and current job descriptions.
- 25%: demonstrated knowledge gap (failed/weak assessment, low confidence, repeated mistakes).
- 20%: importance of the skill in the verified resume and user's target job family.
- 15%: due revision / recency risk.
- 10%: user-selected focus or upcoming interview date.

Weights must be editable, and the app must display why each task is recommended. If a job description is attached, increase the relevance of its required skills without treating every keyword as mandatory. Prefer direct evidence and verified gaps over arbitrary AI suggestions.

Continue to schedule: (a) due revisions; (b) unfinished high-priority questions; (c) weak topics; (d) additional Grind 75/expanded Grind 169 questions if the user chooses; (e) mock interviews; (f) role-specific gaps. The user can pause, regenerate or manually edit any plan.

## 18.7 Sprint dashboard

Show:
- Day X of 30, start date and planned end date.
- Grind 75 completed / 75 with a clear imported/verified count.
- Technical interview questions attempted / available, grouped by skill and topic.
- Today's scheduled minutes versus available minutes.
- Missed/deferred tasks without shame-based streak messaging.
- Skill coverage: covered, assessed, weak, not yet covered.
- Readiness checkpoint at Day 7, 14, 21 and 30.
- A button to generate the next 7 days / next 30 days after Day 30.

## 18.8 Acceptance criteria

- [ ] All resume-listed technologies in `seed-data/interview-skills-catalog.json` are browsable by category, skill and topic.
- [ ] Interview question bank supports skill, topic, difficulty, question type, priority and status filters.
- [ ] Each question can be attempted, answered, noted, rated and scheduled for revision.
- [ ] Grind 75 appears as a separate DSA collection with official attribution, source order and external problem links.
- [ ] Grind 75 rows are never fabricated; imports deduplicate by canonical problem URL/slug.
- [ ] The 30-day sprint preview covers all high-priority skill areas and maps the Grind 75 target according to the verified import.
- [ ] The planner calculates workload from estimates and warns when a 30-day target exceeds available time.
- [ ] User can select a 45-/60-day alternative or continue with the intensive 30-day target.
- [ ] Day 31+ recommendations follow visible priority reasons and create a rolling plan only after user acceptance.
- [ ] The app never equates question exposure or course completion with interview readiness.
