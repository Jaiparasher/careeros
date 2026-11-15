// Project and Behavioral Interviews: 33 total
// tcs-project-deep-dive (12), lovable-project-deep-dive (11), behavioral (10)
module.exports = function(addQ) {
  // --- TCS E-PROCUREMENT PROJECT DEEP DIVE (12) ---
  addQ({
    id: "tcs-01",
    skill_slug: "tcs-project-deep-dive",
    skill_name: "TCS E-Procurement Project Deep Dive",
    skill_category: "career-and-projects",
    topic: "Architecture and request lifecycle",
    subtopic: "E-Procurement High-Level Architecture",
    question_title: "Describe the high-level architecture and request flow of the TCS E-Procurement platform.",
    question_prompt: "Walk through the end-to-end architecture of the TCS E-Procurement system: Client request, API Gateway, Spring Boot microservices, Spring Security JWT authentication, Oracle/PostgreSQL database, and asynchronous processing.",
    question_type: "practical_scenario",
    difficulty: "intermediate",
    priority: "critical",
    expected_answer_points: [
      "Enterprise context: Scalable multi-tenant B2B e-procurement portal facilitating vendor onboarding, RFQs (Request For Quotation), purchase requisitions, approval workflows, and purchase orders.",
      "Tech stack: Java 17, Spring Boot, Spring Security, Hibernate/JPA, PostgreSQL/Oracle, Docker, Kubernetes.",
      "Request flow: Client -> Nginx Ingress / API Gateway -> JWT validation filter -> Microservice Controller -> Service business layer -> Spring Data JPA Repository -> Database.",
      "Auditing: Envers / custom audit logging on critical purchase order state transitions.",
      "Asynchronous integrations: Kafka / JMS message queues for vendor notification dispatches and ERP synchronization."
    ],
    sample_answer: "The TCS E-Procurement platform is an enterprise Spring Boot application managing end-to-end purchasing: vendor onboarding, purchase requisitions, approval workflows, and PO generation. Requests enter via an API Gateway, pass through a Spring Security JWT authentication filter, and hit REST controllers. The service layer handles business rules and transaction boundaries (@Transactional), persisting through Hibernate/JPA into the relational database. Asynchronous tasks like vendor email alerts and SAP ERP integrations are offloaded to message queues.",
    follow_up_questions: [
      "What were the key database entities and their relationships in the procurement workflow?",
      "How did the system handle multi-level management approval hierarchies?"
    ],
    estimated_minutes: 12
  });

  addQ({
    id: "tcs-02",
    skill_slug: "tcs-project-deep-dive",
    skill_name: "TCS E-Procurement Project Deep Dive",
    skill_category: "career-and-projects",
    topic: "REST API design and implementation",
    subtopic: "Purchase Order Lifecycle & State Machine",
    question_title: "How did you design the Purchase Order Lifecycle and state transitions in REST APIs?",
    question_prompt: "Explain the states of a Purchase Order (Draft -> Submitted -> Under Approval -> Approved / Rejected -> Issued -> Fulfilled / Cancelled). How did you enforce valid state transitions and prevent illegal status jumps in Spring Boot?",
    question_type: "coding",
    difficulty: "intermediate",
    priority: "critical",
    expected_answer_points: [
      "State Machine: Clear enum-driven lifecycle: DRAFT, PENDING_APPROVAL, APPROVED, REJECTED, ISSUED, FULFILLED, CANCELLED.",
      "State transition guard: A state machine service validates that transitions only follow permitted paths (e.g. cannot transition directly from DRAFT to ISSUED without APPROVAL).",
      "Optimistic locking: @Version column on PurchaseOrder entity prevents concurrent approval race conditions (two managers approving/rejecting simultaneously).",
      "Audit trail: Captures who changed the status, timestamp, and rejection reason.",
      "REST contract: POST /api/v1/orders/{id}/approvals with request body { decision: 'APPROVE', comments: '...' }."
    ],
    sample_answer: "The Purchase Order lifecycle moves through strict states: DRAFT, PENDING_APPROVAL, APPROVED, REJECTED, ISSUED, and FULFILLED. We modeled this with an enum-based state transition service that enforces valid state paths before updating the database. To prevent race conditions where two managers might approve or reject the same order simultaneously, we used JPA optimistic locking (@Version). Every state transition writes an immutable audit record detailing the acting user, previous state, new state, and comments.",
    follow_up_questions: [
      "What happens if two approvers review the same purchase order simultaneously (OptimisticLockException handling)?",
      "Why is a dedicated transition endpoint (POST /orders/{id}/approvals) better than generic PATCH /orders/{id}?"
    ],
    estimated_minutes: 12
  });

  addQ({
    id: "tcs-03",
    skill_slug: "tcs-project-deep-dive",
    skill_name: "TCS E-Procurement Project Deep Dive",
    skill_category: "career-and-projects",
    topic: "Hibernate/JPA data flow",
    subtopic: "Solving N+1 Queries in Requisition Item Fetching",
    question_title: "Describe a real Hibernate N+1 query problem you diagnosed and resolved in the TCS project.",
    question_prompt: "Walk through a concrete performance issue: Fetching a list of 50 Purchase Requisitions along with their RequisitionLineItems and Supplier entities triggering 100+ SQL queries. How did you diagnose it with SQL logs and resolve it using @EntityGraph / JOIN FETCH?",
    question_type: "practical_scenario",
    difficulty: "intermediate",
    priority: "critical",
    expected_answer_points: [
      "Diagnosis: Dashboard loading latency was 2.8 seconds. Enabling SQL logging (spring.jpa.show-sql=true or datasource-proxy) revealed 1 query for 50 requisitions followed by 50 queries for suppliers and 50 queries for line items (101 queries total).",
      "Root cause: FetchType.LAZY on @ManyToOne Supplier and @OneToMany LineItems triggered on JSON serialization.",
      "Solution: Created a custom repository method using @EntityGraph(attributePaths = {'supplier', 'lineItems'}) or JPQL JOIN FETCH.",
      "Result: Reduced database roundtrips from 101 queries to 1 single SQL join query, dropping API response time from 2,800ms down to 180ms.",
      "Pagination caveat: When paginating, applied JOIN FETCH on ToOne relations (supplier) and configured default_batch_fetch_size: 50 for collection line items to prevent in-memory pagination warnings."
    ],
    sample_answer: "In our requisition dashboard, loading 50 orders triggered over 100 SQL queries because lazy associations on Supplier and LineItems were initialized during DTO mapping (classic N+1 problem), taking 2.8s. By analyzing query counts with datasource-proxy, I replaced the default findAll() with a custom query utilizing @EntityGraph(attributePaths = {'supplier', 'items'}). This collapsed the 101 queries into a single optimized SQL join, dropping latency from 2,800ms to 180ms and significantly reducing database connection pool contention.",
    follow_up_questions: [
      "Why does using JOIN FETCH on a @OneToMany collection break database-level pagination in Hibernate?",
      "How does default_batch_fetch_size: 50 solve the collection N+1 problem during pagination?"
    ],
    estimated_minutes: 15
  });

  addQ({
    id: "tcs-04",
    skill_slug: "tcs-project-deep-dive",
    skill_name: "TCS E-Procurement Project Deep Dive",
    skill_category: "career-and-projects",
    topic: "Third-party KYC integration",
    subtopic: "Vendor KYC Integration & Resilient External APIs",
    question_title: "How did you design the integration with the third-party Vendor KYC verification service?",
    question_prompt: "Explain how the e-procurement platform onboarded vendors by verifying tax IDs (GST/PAN) and bank details against external government/banking KYC APIs. Discuss timeouts, retries with Resilience4j, and handling vendor downtime.",
    question_type: "practical_scenario",
    difficulty: "advanced",
    priority: "critical",
    expected_answer_points: [
      "Business requirement: New vendors must be verified against government tax registries and banking APIs before they can bid on contracts.",
      "Integration client: Configured Spring Cloud OpenFeign or WebClient with strict connection timeout (3s) and read timeout (5s).",
      "Resilience: Wrapped call with Resilience4j Circuit Breaker and Retry. For transient network glitches, retried twice with exponential backoff.",
      "Asynchronous / Offline fallback: If external KYC API was down, vendor status marked 'KYC_PENDING_VERIFICATION'. Scheduled Spring Batch / Quartz job polled or re-tried pending verifications in background.",
      "Security: Signed outbound requests with HMAC signatures and encrypted API keys stored in HashiCorp Vault."
    ],
    sample_answer: "During vendor onboarding, our system verified vendor tax credentials and banking accounts against an external KYC verification provider. Because external government APIs were prone to high latency and intermittent outages, we integrated via OpenFeign protected by Resilience4j. We enforced strict 3-second timeouts and wrapped calls in a circuit breaker. If the provider was down, we didn't block the vendor; we saved the application with status 'KYC_PENDING' and queued background retry jobs, notifying vendors once verification succeeded.",
    follow_up_questions: [
      "How did you prevent submitting duplicate KYC verification requests if a user clicked submit twice?",
      "How did you mock external KYC APIs during integration tests using WireMock?"
    ],
    estimated_minutes: 15
  });

  addQ({
    id: "tcs-05",
    skill_slug: "tcs-project-deep-dive",
    skill_name: "TCS E-Procurement Project Deep Dive",
    skill_category: "career-and-projects",
    topic: "Validation, exception handling and logging",
    subtopic: "RFC 7807 Global Exception Handling in E-Procurement",
    question_title: "How did you structure validation and error contracts across the procurement microservices?",
    question_prompt: "Explain how you standardized error responses using @RestControllerAdvice. How did you differentiate between client validation errors (invalid tax ID format), business rule violations (insufficient budget), and server errors?",
    question_type: "coding",
    difficulty: "intermediate",
    priority: "high",
    expected_answer_points: [
      "Standardized error response: ProblemDetail (RFC 7807) with type, title, status, detail, timestamp, and path.",
      "Client validation: Captured MethodArgumentNotValidException from @Valid on DTOs; extracted FieldErrors into an array of { field, message } with HTTP 400.",
      "Domain business exceptions: Custom BusinessException hierarchy (e.g. BudgetExceededException -> 422 Unprocessable Entity, OrderAlreadyApprovedException -> 409 Conflict).",
      "Security exceptions: AccessDeniedException mapped to 403 Forbidden with generic safe message.",
      "Logging: Injected correlationId/traceId into SLF4J MDC so error responses could be traced directly in centralized Kibana logs."
    ],
    sample_answer: "We centralized exception handling using @RestControllerAdvice returning RFC 7807 ProblemDetail objects. Input validation errors caught MethodArgumentNotValidException, returning HTTP 400 with a detailed field-level error list. Domain business rule violations threw specific exceptions (like InsufficientBudgetException) mapped to HTTP 422 Unprocessable Entity with clear business guidance. All errors included a unique traceId from SLF4J MDC, enabling support teams to look up the exact server log trace in Kibana.",
    follow_up_questions: [
      "Why is returning HTTP 422 better than HTTP 400 for business logic violations?",
      "How do you sanitize sensitive data (credit cards, bank numbers) from appearing in error log traces?"
    ],
    estimated_minutes: 12
  });

  addQ({
    id: "tcs-06",
    skill_slug: "tcs-project-deep-dive",
    skill_name: "TCS E-Procurement Project Deep Dive",
    skill_category: "career-and-projects",
    topic: "Production debugging and defect resolution",
    subtopic: "Production Incident: Database Connection Pool Exhaustion",
    question_title: "Describe a critical production defect or incident you resolved in the TCS E-Procurement platform.",
    question_prompt: "Walk through a real-world production incident using the STAR method (Situation, Task, Action, Result): for example, HikariCP database connection pool exhaustion or high API latency under peak procurement billing cycles.",
    question_type: "practical_scenario",
    difficulty: "advanced",
    priority: "critical",
    expected_answer_points: [
      "Situation: During end-of-quarter fiscal closing, users reported HTTP 500 errors and timeout alerts on the purchase order approval endpoint. New requests failed with 'HikariPool-1 - Connection is not available, request timed out after 30000ms'.",
      "Task: Identify the root cause of connection starvation, restore production stability immediately, and implement permanent structural fixes.",
      "Action: 1) Thread dump analysis revealed 50+ threads in BLOCKED state waiting for DB connections; 2) Discovered that a service method annotated with @Transactional was calling an external slow legacy ERP web service (taking 15-20s) inside the active transaction; 3) The database connection was acquired at method entry and held idle for 20s while waiting for network I/O; 4) Refactored the code to move the external HTTP call OUTSIDE the database transactional boundary; 5) Increased HikariCP pool size and added connection leak detection (leakDetectionThreshold: 5000).",
      "Result: Connection wait times dropped from 30s to <10ms, eliminating all connection pool timeouts and restoring system availability under 3x peak load."
    ],
    sample_answer: "During quarter-end peak traffic, the platform suffered connection pool exhaustion with HikariCP throwing 30-second timeouts. Thread dumps revealed that a service method annotated with @Transactional was calling a slow third-party ERP service while holding an open database connection, idling for 15 seconds per request and exhausting the pool. I refactored the method to execute the external API call first, and opened the @Transactional database boundary only when writing the final response. Connection pool wait times plummeted from 30 seconds to under 5ms, resolving the incident permanently.",
    follow_up_questions: [
      "Why should network HTTP calls never be executed inside a database transaction boundary?",
      "How does HikariCP's leakDetectionThreshold alert on leaked or slow-held connections?"
    ],
    estimated_minutes: 15
  });

  addQ({
    id: "tcs-07",
    skill_slug: "tcs-project-deep-dive",
    skill_name: "TCS E-Procurement Project Deep Dive",
    skill_category: "career-and-projects",
    topic: "Trade-offs and lessons learned",
    subtopic: "Monolith vs Microservices Trade-offs in E-Procurement",
    question_title: "What architectural trade-offs did your team face when choosing between a Modular Monolith and Microservices?",
    question_prompt: "Evaluate the decision to structure procurement domains (Catalog, RFQ, Purchasing, Invoicing): Why did you maintain a modular monolith for core purchasing while extracting notifications/reporting into microservices? What were the distributed transaction and operational trade-offs?",
    question_type: "conceptual",
    difficulty: "intermediate",
    priority: "high",
    expected_answer_points: [
      "Trade-off: Fully distributed microservices introduce distributed transaction complexity (Sagas, eventual consistency) for tightly coupled purchasing operations (PO creation, inventory reservation, budget checks).",
      "Modular Monolith for Core: Kept Requisitions, Approvals, and Orders in a single codebase with clean package boundaries. Benefit: Local ACID transactions guarantee immediate financial consistency without two-phase commit overhead.",
      "Microservices for Peripheral Domains: Extracted Vendor KYC verification, Email/SMS notifications, and Analytical Reporting into standalone microservices. Benefit: Independent scaling without risking core purchasing stability.",
      "Lesson learned: Do not prematurely split tightly-coupled transactional domains into microservices until team size or independent scaling requirements strictly demand it."
    ],
    sample_answer: "We chose a pragmatic hybrid approach: core procurement (Requisitions, Approvals, Orders) ran as a Modular Monolith with clear package boundaries, allowing us to leverage local ACID transactions and avoid the distributed transaction overhead of Sagas for financial operations. Conversely, we decoupled peripheral domains (Notifications, Document Generation, and Reporting) into standalone microservices. This preserved strong transactional consistency for core financial data while allowing high-CPU reporting tasks to scale independently.",
    follow_up_questions: [
      "What challenges would arise if Order Service and Inventory Service were split into separate microservices with private databases?",
      "How did you enforce package encapsulation to prevent circular dependencies in a modular monolith?"
    ],
    estimated_minutes: 12
  });

  addQ({
    id: "tcs-08",
    skill_slug: "tcs-project-deep-dive",
    skill_name: "TCS E-Procurement Project Deep Dive",
    skill_category: "career-and-projects",
    topic: "Architecture and request lifecycle",
    subtopic: "Role-Based Access Control (RBAC) in Procurement",
    question_title: "How was Role-Based Access Control (RBAC) enforced across procurement user roles?",
    question_prompt: "Explain how Spring Security enforced permissions across Buyer, Vendor, Department Manager, and Finance Officer. How did method-level @PreAuthorize and row-level tenant filtering prevent unauthorized data access?",
    question_type: "coding",
    difficulty: "intermediate",
    priority: "high",
    expected_answer_points: [
      "Roles hierarchy: BUYER (creates requisitions), MANAGER (approves department requests up to financial limit), FINANCE_OFFICER (final invoice approval), VENDOR (views and bids on RFQs).",
      "Method security: @PreAuthorize(\"hasRole('MANAGER') and #deptId == authentication.principal.departmentId\").",
      "Multi-tenancy / Data isolation: Department managers must only view requisitions from their own department. Implemented via Hibernate @Filter or JPA Specifications (WHERE department_id = :userDeptId).",
      "JWT claim extraction: Custom JWT claims contained user role, departmentId, and approvalLimit, avoiding database lookups on every authorization check."
    ],
    sample_answer: "We implemented RBAC using Spring Security and JWT claims. Method-level security (@PreAuthorize) enforced role permissions (e.g. only FINANCE_OFFICER can approve payments). For row-level data isolation, we ensured department managers could only access requisitions within their jurisdiction by injecting the user's departmentId from the authenticated JWT into Spring Data JPA specifications. This guaranteed that API consumers could never access records from other departments even by guessing requisition IDs.",
    follow_up_questions: [
      "How did you enforce financial approval authority limits (e.g. Manager can approve up to $50,000, Director up to $500,000)?",
      "What is the difference between URL-based security matchers and method-level @PreAuthorize?"
    ],
    estimated_minutes: 12
  });

  addQ({
    id: "tcs-09",
    skill_slug: "tcs-project-deep-dive",
    skill_name: "TCS E-Procurement Project Deep Dive",
    skill_category: "career-and-projects",
    topic: "Hibernate/JPA data flow",
    subtopic: "Bulk Purchase Order Processing & Batch Inserts",
    question_title: "How did you optimize high-volume bulk Purchase Order line item ingestion in Spring Data JPA?",
    question_prompt: "When importing CSV files with 10,000+ line items, default Spring Data saveAll() executes 10,000 individual SQL inserts. How did you configure JDBC batching (hibernate.jdbc.batch_size) and handle primary key generation strategies?",
    question_type: "coding",
    difficulty: "advanced",
    priority: "high",
    expected_answer_points: [
      "Problem: Default saveAll() with GenerationType.IDENTITY completely disables Hibernate batch inserts because Hibernate must execute each INSERT immediately to retrieve the database-generated ID.",
      "Fix 1 (Key Generation): Switched from GenerationType.IDENTITY to GenerationType.SEQUENCE with an allocationSize of 50 (or client-generated UUID / TSID).",
      "Fix 2 (Batch configuration): Set spring.jpa.properties.hibernate.jdbc.batch_size=50 and hibernate.order_inserts=true.",
      "Fix 3 (Manual flushing): Processed items in batches of 50, calling em.flush() and em.clear() after each batch to prevent the Persistence Context First-Level Cache from consuming excessive RAM and causing OutOfMemoryError.",
      "Alternative: Used Spring JdbcTemplate.batchUpdate() for raw speed on huge data loads."
    ],
    sample_answer: "By default, GenerationType.IDENTITY disables Hibernate batching because each row must execute individually to fetch its generated ID. For bulk line item imports, we changed key generation to GenerationType.SEQUENCE with allocationSize=50 and configured hibernate.jdbc.batch_size=50 and order_inserts=true. In our import service, we flushed and cleared the EntityManager every 50 records to prevent memory exhaustion in the first-level cache, reducing import times from 45 seconds to 1.8 seconds.",
    follow_up_questions: [
      "Why does GenerationType.IDENTITY disable Hibernate JDBC batching?",
      "Why must you call em.clear() periodically during large batch insertions?"
    ],
    estimated_minutes: 15
  });

  addQ({
    id: "tcs-10",
    skill_slug: "tcs-project-deep-dive",
    skill_name: "TCS E-Procurement Project Deep Dive",
    skill_category: "career-and-projects",
    topic: "Production debugging and defect resolution",
    subtopic: "Database Concurrency: Double Approval Defect",
    question_title: "Explain how you resolved a race condition where an order was approved twice concurrently.",
    question_prompt: "Describe how concurrent approvals by two approvers caused race conditions in the approval workflow. How did you implement Optimistic Locking (@Version) and idempotent validation to eliminate double-approvals?",
    question_type: "debugging",
    difficulty: "intermediate",
    priority: "high",
    expected_answer_points: [
      "Symptom: A purchase order was approved by a manager and simultaneously marked rejected or re-approved by another, resulting in duplicate ERP purchase order dispatches.",
      "Root cause: Lack of concurrency control; two threads read status 'PENDING_APPROVAL' simultaneously, passed the validation check, and both wrote updates.",
      "Resolution: Added an integer @Version column to the PurchaseOrder entity.",
      "Execution: When Thread 1 commits, version increments from 1 to 2. When Thread 2 tries to commit with version 1, JPA detects zero rows updated and throws OptimisticLockException.",
      "Controller handling: Caught OptimisticLockException, re-read the fresh state from DB, recognized that the order was already finalized, and returned HTTP 409 Conflict with 'Order has already been processed by another manager'."
    ],
    sample_answer: "Under high concurrency, two managers simultaneously clicked approve on the same order. Both threads read status PENDING_APPROVAL and issued approval commits, triggering duplicate downstream vendor notifications. I resolved this by adding an @Version column to the PurchaseOrder entity to enforce optimistic locking. The first commit succeeds and increments the version; the second throws an OptimisticLockException. Our global exception handler caught this and returned HTTP 409 Conflict with a clear message that the order was already processed.",
    follow_up_questions: [
      "When would you choose Pessimistic Locking (SELECT FOR UPDATE) over Optimistic Locking in an order system?",
      "How do idempotency keys on the approval endpoint prevent double-click submissions from the UI?"
    ],
    estimated_minutes: 12
  });

  addQ({
    id: "tcs-11",
    skill_slug: "tcs-project-deep-dive",
    skill_name: "TCS E-Procurement Project Deep Dive",
    skill_category: "career-and-projects",
    topic: "Validation, exception handling and logging",
    subtopic: "Automated Testing Strategy in TCS E-Procurement",
    question_title: "What was your automated testing strategy in the TCS project (Unit, Integration, and Mockito)?",
    question_prompt: "Explain how you tested the procurement service layer: Unit testing business rules with JUnit 5 and Mockito vs Integration testing with @SpringBootTest, Testcontainers, and MockMvc.",
    question_type: "coding",
    difficulty: "intermediate",
    priority: "medium",
    expected_answer_points: [
      "Testing pyramid: Heavy unit tests for business logic, sliced integration tests for controllers/repositories, Testcontainers for real database testing.",
      "Service Unit Tests: Plain JUnit 5 + Mockito (@ExtendWith(MockitoExtension.class)). Mocked repositories and external clients. Tested state transitions, tax calculations, and edge cases in milliseconds without booting Spring context.",
      "Controller Tests: @WebMvcTest(OrderController.class) with MockMvc. Tested JSON serialization, input validation (@Valid), and HTTP status codes with mocked services.",
      "Repository & Integration Tests: Used Testcontainers (PostgreSQL container) rather than H2 in-memory DB to ensure exact dialect, JSONB, and constraint compatibility with production.",
      "Coverage target: Maintained >80% line and branch coverage enforced via JaCoCo in CI build."
    ],
    sample_answer: "Our testing strategy followed the testing pyramid: We used JUnit 5 and Mockito for fast, lightweight unit tests of complex business calculations and state transitions without booting Spring. For API contract validation, we used @WebMvcTest with MockMvc to test request validation and HTTP status codes. For persistence integration tests, we used Testcontainers with a real PostgreSQL Docker instance rather than H2 to ensure 100% dialect and constraint fidelity with production, enforcing an 80% coverage threshold via JaCoCo in our CI pipeline.",
    follow_up_questions: [
      "Why is testing with real PostgreSQL in Testcontainers superior to using an in-memory H2 database?",
      "How did you mock external REST services during integration tests using WireMock?"
    ],
    estimated_minutes: 12
  });

  addQ({
    id: "tcs-12",
    skill_slug: "tcs-project-deep-dive",
    skill_name: "TCS E-Procurement Project Deep Dive",
    skill_category: "career-and-projects",
    topic: "Trade-offs and lessons learned",
    subtopic: "Key Engineering Accomplishments and Impact",
    question_title: "Summarize your key technical contributions and quantifiable impact on the TCS project.",
    question_prompt: "How do you succinctly articulate your role, technologies used, problems solved, and measurable business impact on the TCS E-Procurement platform in an interview?",
    question_type: "practical_scenario",
    difficulty: "intermediate",
    priority: "critical",
    expected_answer_points: [
      "Role & Tech: Java Backend Developer building RESTful microservices using Spring Boot, Spring Security, Hibernate/JPA, and PostgreSQL in an Agile Scrum environment.",
      "Key contribution 1: Designed and implemented the core Purchase Requisition approval state engine, cutting approval cycle times.",
      "Key contribution 2: Integrated external vendor KYC verification APIs with Resilience4j circuit breakers and asynchronous background polling, improving onboarding resilience.",
      "Key contribution 3: Diagnosed and resolved critical database N+1 query bottlenecks and connection pool exhaustion, dropping 95th percentile latency from 2.8s to <200ms.",
      "Impact: Supported over 10,000+ active enterprise suppliers, reduced system downtime, and improved end-to-end procurement turnaround by 35%."
    ],
    sample_answer: "As a Java Backend Developer on the TCS E-Procurement platform, I engineered core microservices using Spring Boot, Spring Security, and PostgreSQL. I architected the multi-tier purchase order approval engine with optimistic concurrency control, integrated external vendor KYC verification using Resilience4j circuit breakers, and resolved severe database N+1 query bottlenecks using fetch graphs. My optimizations reduced dashboard API latency by 90% (from 2.8s to 180ms) and eliminated connection timeouts during quarter-end peak traffic, supporting over 10,000 enterprise vendors.",
    follow_up_questions: [
      "If you could re-architect one component of the TCS system today, what would you change and why?",
      "How did you collaborate with frontend developers and QA engineers in your sprint cycles?"
    ],
    estimated_minutes: 10
  });

  // --- LOVABLE AI BUILDER PROJECT DEEP DIVE (11) ---
  addQ({
    id: "lovable-01",
    skill_slug: "lovable-project-deep-dive",
    skill_name: "Lovable AI Builder Project Deep Dive",
    skill_category: "career-and-projects",
    topic: "Architecture and component boundaries",
    subtopic: "Lovable AI Architecture Overview",
    question_title: "Describe the architecture and end-to-end workflow of the Lovable AI Builder project.",
    question_prompt: "Explain the architecture of the Lovable AI Builder: Frontend (React, Vite, Tailwind CSS), Backend (Spring Boot, Spring AI), LLM integration (OpenAI/Anthropic), PostgreSQL with pgvector, and real-time streaming.",
    question_type: "practical_scenario",
    difficulty: "advanced",
    priority: "critical",
    expected_answer_points: [
      "Product vision: AI-assisted full-stack development platform that turns natural language user prompts into working web applications, database schemas, and API code.",
      "Frontend: React, Tailwind CSS, Monaco code editor, sandboxed web preview iframe, Server-Sent Events (SSE) stream consumer.",
      "Backend: Spring Boot 3 with Spring AI, ChatClient fluent API, and PgVectorStore.",
      "RAG flow: Indexes component templates, UI design patterns, and code snippets in PostgreSQL using pgvector embeddings.",
      "Tool Calling: LLM can invoke backend tools (e.g. create_file, execute_sql, test_endpoint) to iteratively construct projects.",
      "Streaming: Uses SseEmitter to stream code generation tokens in real time to the browser editor."
    ],
    sample_answer: "Lovable AI Builder is an AI-native development assistant that generates full-stack web applications from conversational prompts. The frontend is built with React and Tailwind CSS featuring a live Monaco code editor and an interactive preview sandbox. The backend is a Spring Boot 3 application leveraging Spring AI's ChatClient. It utilizes a RAG architecture backed by PostgreSQL with pgvector to ground the LLM with verified component libraries and design patterns, executing tool calls to create files and streaming code tokens to the browser via SSE.",
    follow_up_questions: [
      "How do you isolate the generated frontend code inside the preview iframe securely (sandbox attributes)?",
      "Why did you choose Server-Sent Events (SSE) over WebSockets for code streaming?"
    ],
    estimated_minutes: 15
  });

  addQ({
    id: "lovable-02",
    skill_slug: "lovable-project-deep-dive",
    skill_name: "Lovable AI Builder Project Deep Dive",
    skill_category: "career-and-projects",
    topic: "Spring AI and model integration",
    subtopic: "Spring AI ChatClient & Prompt Engineering",
    question_title: "How did you configure Spring AI's ChatClient and construct system prompts for code generation?",
    question_prompt: "Explain how you configured ChatClient with system prompt instructions, temperature settings, and structured output. How did you instruct the model to produce valid React/TypeScript code without markdown conversational noise?",
    question_type: "coding",
    difficulty: "intermediate",
    priority: "high",
    expected_answer_points: [
      "ChatClient bean configuration: Injected ChatModel and configured base parameters using ChatClient.builder(chatModel).defaultSystem(...).build().",
      "System prompt directives: Explicitly constrained output format: 'You are an expert full-stack engineer. Output ONLY valid TypeScript/React code. Do not wrap in conversational pleasantries. Adhere to Tailwind CSS classes.'",
      "Temperature tuning: Set temperature to 0.1-0.2 for deterministic, syntactically correct code generation.",
      "Structured output: Used BeanOutputConverter or JSON Schema mode for file manipulation operations (returning { filePath, code, action: 'CREATE' | 'UPDATE' })."
    ],
    sample_answer: "We configured Spring AI's ChatClient with a low temperature (0.2) to prioritize syntactic accuracy over creative randomness. The system prompt established strict role constraints, specifying that the model must output clean TypeScript and Tailwind CSS code without conversational filler. For multi-file modifications, we enforced structured outputs using BeanOutputConverter to parse the LLM's response into a strongly-typed Java Record containing file paths, diff actions, and code contents.",
    follow_up_questions: [
      "How did you prevent the LLM from truncating long code files with comments like '// rest of code remains unchanged'?",
      "How did you handle switching between OpenAI GPT-4o and Anthropic Claude 3.5 Sonnet in Spring AI?"
    ],
    estimated_minutes: 12
  });

  addQ({
    id: "lovable-03",
    skill_slug: "lovable-project-deep-dive",
    skill_name: "Lovable AI Builder Project Deep Dive",
    skill_category: "career-and-projects",
    topic: "RAG and tool calling flow",
    subtopic: "RAG Ingestion and Vector Search in Lovable AI",
    question_title: "How did you design the RAG pipeline for component templates using pgvector?",
    question_prompt: "Explain how UI component templates and documentation were chunked, embedded, and stored in PostgreSQL pgvector. How did runtime similarity search retrieve the most relevant component templates for user prompts?",
    question_type: "practical_scenario",
    difficulty: "advanced",
    priority: "critical",
    expected_answer_points: [
      "Problem: Base LLMs often hallucinate outdated UI component props or invent non-existent CSS classes.",
      "Ingestion pipeline: Parsed verified UI components (shadcn/ui, Tailwind blocks). Used TokenTextSplitter to create structured chunks with metadata (componentName, category, dependencies).",
      "Embedding: Generated 1536-dimensional embeddings using OpenAI text-embedding-3-small.",
      "Storage: Stored in PostgreSQL documents table with vector(1536) column and an HNSW index using cosine distance (<=>).",
      "Runtime RAG: When a user prompts 'build a pricing table with toggle', Spring AI's QuestionAnswerAdvisor performs similarity search, retrieves top 3 matching pricing component templates, and injects them into the prompt context."
    ],
    sample_answer: "To prevent the LLM from hallucinating invalid UI libraries, we built a RAG pipeline over verified Tailwind and shadcn/ui components. During ingestion, components were split into semantic chunks and embedded into a PostgreSQL pgvector table indexed with HNSW. At runtime, the user's prompt is embedded and queried against the vector store using cosine distance (<=>). The top 3 matching component templates are retrieved and injected into the LLM prompt context, ensuring generated code uses verified, modern syntax.",
    follow_up_questions: [
      "Why did you use an HNSW index instead of IVFFlat in pgvector?",
      "How did you filter vector search results by category metadata (e.g. only searching 'dashboard' components)?"
    ],
    estimated_minutes: 15
  });

  addQ({
    id: "lovable-04",
    skill_slug: "lovable-project-deep-dive",
    skill_name: "Lovable AI Builder Project Deep Dive",
    skill_category: "career-and-projects",
    topic: "RAG and tool calling flow",
    subtopic: "Function/Tool Calling for Project File Manipulation",
    question_title: "How did you implement Tool Calling for creating and modifying project files?",
    question_prompt: "Explain how you exposed Java functions as tools to the LLM (createFile, modifyFile, deleteFile, listDirectory). Walk through the multi-turn tool execution loop in Spring AI.",
    question_type: "coding",
    difficulty: "advanced",
    priority: "critical",
    expected_answer_points: [
      "Tool definitions: Declared Spring @Bean methods returning java.util.function.Function<FileRequest, FileResponse> annotated with @Description.",
      "Tools exposed: 1) writeFile(path, content); 2) readFile(path); 3) executeSql(query); 4) installPackage(name).",
      "Tool registration: Bound to ChatClient via .tools('writeFileFunction', 'readFileFunction').",
      "Execution flow: User asks 'Add an auth login form' -> LLM determines it needs to inspect App.tsx -> calls readFile('App.tsx') -> Spring AI executes tool locally and returns file content -> LLM generates LoginForm.tsx -> calls writeFile('LoginForm.tsx', code) -> LLM returns confirmation to user.",
      "Sandboxing: Strict path traversal validation (path.normalize().startsWith(projectRoot)) prevents writing files outside project directory."
    ],
    sample_answer: "We implemented tool calling by defining Java Function beans with @Description annotations explaining their purpose and parameter schemas. We exposed tools like writeFile and readFile to the ChatClient. When a user requests a feature, the LLM analyzes the request and triggers a tool call. Spring AI intercepts the request, executes the Java function locally (e.g. writing the file to disk after validating against directory traversal), returns the tool result to the LLM, and the LLM completes the task.",
    follow_up_questions: [
      "How did you prevent Path Traversal attacks (e.g. an LLM trying to write to /etc/passwd)?",
      "What happens if a tool execution throws a runtime exception during the tool call loop?"
    ],
    estimated_minutes: 15
  });

  addQ({
    id: "lovable-05",
    skill_slug: "lovable-project-deep-dive",
    skill_name: "Lovable AI Builder Project Deep Dive",
    skill_category: "career-and-projects",
    topic: "SSE streaming",
    subtopic: "Real-Time Code Streaming with Server-Sent Events",
    question_title: "How did you stream generated code from Spring AI to the React frontend using Server-Sent Events?",
    question_prompt: "Explain the streaming architecture: ChatClient.prompt().stream().content() returning Flux<String>, mapping to SseEmitter or Flux<ServerSentEvent>, and consumption in the React frontend.",
    question_type: "coding",
    difficulty: "intermediate",
    priority: "high",
    expected_answer_points: [
      "User experience requirement: Generating complex React components takes 15-30 seconds; waiting for full completion causes perceived UI freeze. Streaming provides instant feedback within 500ms.",
      "Backend implementation: Spring MVC controller returns SseEmitter or MediaType.TEXT_EVENT_STREAM_VALUE with Flux<String>.",
      "Spring AI streaming: chatClient.prompt().user(prompt).stream().content() returns a reactive Flux streaming tokens as they are generated by the LLM.",
      "Frontend consumption: Native browser fetch with readable stream reader (response.body.getReader()) or EventSource, appending incoming text chunks to Monaco Editor state in real time."
    ],
    sample_answer: "Waiting 20 seconds for an LLM to generate code feels sluggish. We used Server-Sent Events (SSE) to stream tokens in real time. The Spring Boot controller returns a reactive Flux<String> with MediaType.TEXT_EVENT_STREAM_VALUE connected to Spring AI's `chatClient.prompt().stream().content()`. On the React frontend, we read the incoming stream chunks using the Fetch Streams API, appending tokens to the Monaco Editor state as they arrive, providing visual feedback within 500ms.",
    follow_up_questions: [
      "What happens to the LLM stream if the user closes their browser tab mid-generation?",
      "How do you handle error events mid-stream in SSE?"
    ],
    estimated_minutes: 12
  });

  addQ({
    id: "lovable-06",
    skill_slug: "lovable-project-deep-dive",
    skill_name: "Lovable AI Builder Project Deep Dive",
    skill_category: "career-and-projects",
    topic: "PostgreSQL/pgvector data flow",
    subtopic: "Multi-Tenant Workspace Data Isolation",
    question_title: "How did you enforce multi-tenant isolation across user project workspaces in PostgreSQL?",
    question_prompt: "In a platform where users create multiple projects with private files and vector embeddings, how did you enforce tenant boundaries using PostgreSQL Row-Level Security (RLS) and foreign keys?",
    question_type: "practical_scenario",
    difficulty: "intermediate",
    priority: "high",
    expected_answer_points: [
      "Data model: Users -> Workspaces -> Projects -> ProjectFiles / Embeddings. Every entity has a foreign key to user_id / workspace_id.",
      "Row-Level Security (RLS): Enabled on tables: ALTER TABLE project_files ENABLE ROW LEVEL SECURITY.",
      "RLS policy: CREATE POLICY user_isolation_policy ON project_files FOR ALL USING (user_id = auth.uid()).",
      "Vector embeddings: Embeddings table tagged with workspace_id; similarity searches include WHERE workspace_id = :current_workspace to ensure users only search their own indexed documents.",
      "Defense in depth: Checked ownership in Spring Security @PreAuthorize AND at the database level with RLS."
    ],
    sample_answer: "We enforced multi-tenant workspace isolation using a defense-in-depth model. All project files, chat histories, and vector embeddings contain explicit user_id and workspace_id foreign keys. We enabled PostgreSQL Row-Level Security (RLS) policies ensuring users can only SELECT or UPDATE rows matching their authenticated user ID. In our pgvector queries, we enforced metadata filtering on workspace_id so similarity searches only search within the user's private project scope.",
    follow_up_questions: [
      "What is the difference between enforcing multi-tenancy via separate schemas vs shared tables with tenant_id?",
      "How do you test that RLS policies cannot be bypassed by malicious SQL injections?"
    ],
    estimated_minutes: 12
  });

  addQ({
    id: "lovable-07",
    skill_slug: "lovable-project-deep-dive",
    skill_name: "Lovable AI Builder Project Deep Dive",
    skill_category: "career-and-projects",
    topic: "Docker/Kubernetes deployment",
    subtopic: "Containerizing and Deploying the AI Platform",
    question_title: "How did you containerize and deploy the Lovable AI platform using Docker and Kubernetes?",
    question_prompt: "Explain multi-stage Docker builds for the Spring Boot backend and React frontend. How was the platform deployed to Kubernetes (Deployments, Services, Ingress, PersistentVolumes for workspaces)?",
    question_type: "practical_scenario",
    difficulty: "intermediate",
    priority: "medium",
    expected_answer_points: [
      "Frontend container: Multi-stage Dockerfile (Node.js build stage -> Nginx Alpine production server serving static assets, <30MB image).",
      "Backend container: Multi-stage build (Maven compiler -> Eclipse Temurin JRE Alpine runtime with non-root user).",
      "Kubernetes deployment: 1) Deployments for frontend and backend with liveness/readiness probes; 2) ClusterIP services; 3) Ingress controller with TLS termination routing /api to backend and / to frontend; 4) StatefulSet with PersistentVolumeClaims (PVC) for sandboxed user project workspaces on disk.",
      "Environment secrets: External Secrets Operator pulling API keys (OpenAI key, DB credentials) into Kubernetes Secrets."
    ],
    sample_answer: "We containerized the platform using multi-stage Docker builds: the React frontend compiles into static assets served by Nginx Alpine (<30MB), and the Spring Boot backend compiles into a lightweight JRE image running as a non-root user. In Kubernetes, we ran Deployments for stateless services behind an Ingress controller with SSL termination. User workspace files were mounted using PersistentVolumeClaims (PVC). LLM API keys and database credentials were injected via Kubernetes Secrets.",
    follow_up_questions: [
      "How did you configure Kubernetes resource requests and limits for the Spring Boot container?",
      "Why did you use an Ingress controller instead of multiple NodePort or LoadBalancer services?"
    ],
    estimated_minutes: 10
  });

  addQ({
    id: "lovable-08",
    skill_slug: "lovable-project-deep-dive",
    skill_name: "Lovable AI Builder Project Deep Dive",
    skill_category: "career-and-projects",
    topic: "Challenges, incomplete features and trade-offs",
    subtopic: "Engineering Challenges & Incomplete Features",
    question_title: "What was the most difficult engineering challenge in the Lovable AI project, and what trade-offs did you make?",
    question_prompt: "Discuss handling LLM token limits, context degradation during long conversational editing sessions, hallucinated dependencies, and features you had to scope down or defer.",
    question_type: "practical_scenario",
    difficulty: "advanced",
    priority: "critical",
    expected_answer_points: [
      "Challenge 1 (Context window saturation): In multi-turn chat, passing entire project source code in every prompt exhausted token limits and spiked API costs. Solution: Context pruning and sliding window chat history; only included active files and compressed older messages.",
      "Challenge 2 (Hallucinated packages): LLM would import non-existent npm libraries. Solution: Pre-prompt whitelist of approved UI packages (Lucide icons, Radix UI, Tailwind) and a post-generation validation AST parser.",
      "Trade-off / Incomplete feature: Full in-browser live code compilation (WebContainers / full Node execution in browser) proved too heavy for mobile and low-spec machines; we scoped it down to client-side Babel compilation in an iframe for React components."
    ],
    sample_answer: "The greatest challenge was context window degradation during prolonged editing sessions: sending the entire codebase on every turn caused token exhaustion and high latency. We implemented a sliding window chat history with AST-based context pruning, passing only the files relevant to the active user prompt. Another challenge was hallucinated npm packages; we constrained the system prompt with a whitelist of approved libraries and used an AST parser to strip unauthorized imports before rendering in the preview sandbox.",
    follow_up_questions: [
      "How did you track and control OpenAI token costs during development?",
      "How would you implement full terminal execution for generated backend code in a future phase?"
    ],
    estimated_minutes: 15
  });

  addQ({
    id: "lovable-09",
    skill_slug: "lovable-project-deep-dive",
    skill_name: "Lovable AI Builder Project Deep Dive",
    skill_category: "career-and-projects",
    topic: "Challenges, incomplete features and trade-offs",
    subtopic: "Preventing Prompt Injections & Code Execution Security",
    question_title: "How did you secure the application against Prompt Injections and malicious generated code?",
    question_prompt: "What security measures prevent users from tricking the LLM into revealing system prompts, leaking other users' code, or generating malicious cross-site scripting (XSS) payloads in preview sandboxes?",
    question_type: "practical_scenario",
    difficulty: "advanced",
    priority: "high",
    expected_answer_points: [
      "Prompt Injection defense: Strict system prompt delimiter boundaries (using XML tags <user_input>...</user_input>) and instructions to ignore any user directives attempting to override core system rules.",
      "Sandbox execution: The generated code runs inside a sandboxed <iframe> with restrictive attributes: sandbox=\"allow-scripts\" (deliberately omitting allow-same-origin, allow-top-navigation, and allow-modals).",
      "Token isolation: The preview iframe runs on a separate sub-domain or null origin, ensuring it has zero access to the host app's localStorage, cookies, or auth tokens, neutralizing XSS.",
      "Backend file isolation: All file operations are verified to stay strictly inside the project root path."
    ],
    sample_answer: "We defended against prompt injection and malicious code generation through architectural isolation. User inputs are wrapped in strict XML delimiters (<user_input>) with system instructions to ignore meta-commands. Generated code executes inside an isolated iframe with restricted sandbox attributes (sandbox='allow-scripts' without 'allow-same-origin'). Because the sandbox has a distinct origin, generated scripts cannot read the parent application's cookies, localStorage, or authentication tokens, completely preventing XSS attacks.",
    follow_up_questions: [
      "Why is omitting 'allow-same-origin' in the iframe sandbox attribute crucial for preventing XSS?",
      "What is an Indirect Prompt Injection and how could it occur if the AI reads external GitHub repositories?"
    ],
    estimated_minutes: 12
  });

  addQ({
    id: "lovable-10",
    skill_slug: "lovable-project-deep-dive",
    skill_name: "Lovable AI Builder Project Deep Dive",
    skill_category: "career-and-projects",
    topic: "Architecture and component boundaries",
    subtopic: "Frontend State Management with Zustand / React",
    question_title: "How was frontend state structured in the Lovable AI Builder (Zustand / React)?",
    question_prompt: "Explain how you managed complex frontend state: active file tree, open editor tabs, chat conversation history, streaming buffer, and preview synchronization using Zustand or Context.",
    question_type: "coding",
    difficulty: "intermediate",
    priority: "medium",
    expected_answer_points: [
      "State separation: Split state into WorkspaceStore (file tree, active tab, modified files), ChatStore (messages, isStreaming, currentTurn), and PreviewStore (preview URL, reloadTrigger).",
      "Why Zustand over Redux: Lightweight, minimal boilerplate, out-of-context hook access, excellent performance with selective subscription (useWorkspaceStore(state => state.activeFile)).",
      "Debounced preview updates: Code changes in the editor update the in-memory file tree immediately, but trigger the preview iframe re-render via a debounced (300ms) callback to prevent iframe freezing during fast typing.",
      "Persistence: Persisted active workspace settings in localStorage."
    ],
    sample_answer: "We used Zustand for frontend state management, partitioning state into modular stores: FileTreeStore (managing directory hierarchy and open tabs), ChatStore (managing message turns and streaming status), and PreviewStore. Zustand's selector subscriptions (useFileStore(state => state.activeFile)) ensured components only re-rendered when their specific data changed. We decoupled Monaco Editor keystrokes from the preview sandbox using a 300ms debounce to prevent constant iframe reloading while typing.",
    follow_up_questions: [
      "Why is Zustand preferred over Redux Toolkit for applications with heavy real-time streaming updates?",
      "How did you synchronize editor changes back to the backend file system?"
    ],
    estimated_minutes: 10
  });

  addQ({
    id: "lovable-11",
    skill_slug: "lovable-project-deep-dive",
    skill_name: "Lovable AI Builder Project Deep Dive",
    skill_category: "career-and-projects",
    topic: "Challenges, incomplete features and trade-offs",
    subtopic: "Measurable Impact & Technical Takeaways",
    question_title: "Summarize your key engineering accomplishments and technical lessons from the Lovable AI project.",
    question_prompt: "How do you present the Lovable AI project in technical interviews as evidence of modern full-stack, distributed AI, and Spring AI expertise?",
    question_type: "practical_scenario",
    difficulty: "intermediate",
    priority: "high",
    expected_answer_points: [
      "Demonstrated modern stack: Full-stack proficiency combining Spring Boot 3, Spring AI, PostgreSQL pgvector, and React.",
      "Demonstrated AI engineering: Hands-on experience with RAG pipelines, vector embedding indexing, HNSW distance operators, and LLM Tool Calling.",
      "Demonstrated systems engineering: Real-time SSE streaming architectures, multi-tenant isolation with PostgreSQL RLS, and iframe sandbox security.",
      "Quantifiable outcome: Built a working end-to-end prototype capable of generating multi-component web applications in under 30 seconds with sub-500ms initial streaming response time."
    ],
    sample_answer: "The Lovable AI Builder project demonstrated my ability to engineer modern AI-native applications. I architected a full-stack system using Spring Boot 3, Spring AI, and React, implementing a RAG pipeline with PostgreSQL pgvector to ground code generation in verified component templates. I implemented function calling for file manipulation and real-time SSE token streaming, delivering responsive feedback in under 500ms. The project highlights my expertise across Spring backend development, vector databases, and real-time frontend architectures.",
    follow_up_questions: [
      "How does your experience with Spring AI compare to Python-based frameworks like LangChain or LlamaIndex?",
      "What did building this project teach you about designing systems around non-deterministic LLMs?"
    ],
    estimated_minutes: 10
  });

  // --- BEHAVIORAL AND HR QUESTIONS (10) ---
  addQ({
    id: "beh-01",
    skill_slug: "behavioral",
    skill_name: "Behavioral and HR Questions",
    skill_category: "career-and-projects",
    topic: "Tell me about yourself",
    subtopic: "Professional Introduction (Elevator Pitch)",
    question_title: "Tell me about yourself / Walk me through your resume.",
    question_prompt: "Deliver a compelling 2-minute elevator pitch using the Present-Past-Future framework: Current role/expertise (Java backend, Spring Boot, distributed systems), Past background and key achievements at TCS, and Future career goals.",
    question_type: "practical_scenario",
    difficulty: "beginner",
    priority: "critical",
    expected_answer_points: [
      "Structure: Present (who you are today), Past (relevant experience & concrete accomplishments), Future (why this role/company).",
      "Duration: 90 - 120 seconds maximum. Do not re-read your resume chronologically.",
      "Present: Software Engineer specializing in backend Java development, Spring Boot microservices, REST APIs, and database engineering.",
      "Past: At TCS, engineered enterprise E-Procurement platforms, optimized database queries (reducing latency by 90%), built resilient third-party integrations with Resilience4j, and collaborated in Agile teams. Also built modern AI applications using Spring AI and pgvector.",
      "Future: Looking to take on greater backend ownership in high-scale systems where I can contribute to mission-critical distributed architectures."
    ],
    sample_answer: "I am a Software Engineer with expertise in Java backend engineering, Spring Boot microservices, and database optimization. In my current experience at TCS, I built enterprise E-Procurement services managing purchase order lifecycles and vendor KYC integrations, where I resolved critical database N+1 query bottlenecks and connection pool starvation to drop API latency by 90%. I have also expanded into modern AI systems, building RAG architectures with Spring AI and pgvector. I am excited about this role because it offers the opportunity to tackle complex distributed backend challenges at scale.",
    follow_up_questions: [
      "What is your single greatest technical strength as a backend engineer?",
      "What areas of software engineering are you currently working to improve?"
    ],
    estimated_minutes: 8
  });

  addQ({
    id: "beh-02",
    skill_slug: "behavioral",
    skill_name: "Behavioral and HR Questions",
    skill_category: "career-and-projects",
    topic: "Production incident or difficult bug",
    subtopic: "Handling a High-Pressure Production Bug (STAR)",
    question_title: "Describe a difficult bug or production incident you diagnosed and resolved.",
    question_prompt: "Use the STAR method (Situation, Task, Action, Result) to explain resolving a high-severity production issue: technical triage, staying calm under pressure, root cause analysis, and post-mortem prevention.",
    question_type: "practical_scenario",
    difficulty: "intermediate",
    priority: "critical",
    expected_answer_points: [
      "Situation: Production requisition service experienced sudden connection pool exhaustion during quarter-end peak traffic, rejecting user approvals with 500 errors.",
      "Task: Lead immediate triage to restore service availability and eliminate the root cause without data loss.",
      "Action: Inspected thread dumps and found threads blocked on HikariCP connection acquisition. Discovered that an external slow ERP call was executing inside an active @Transactional boundary, locking connections for 15s. Moved the external call outside the transaction, increased pool headroom, and added leak detection.",
      "Result: Wait times dropped from 30s to <10ms; zero dropped requests during subsequent peak traffic; authored an internal post-mortem and team coding guideline on transactional boundaries."
    ],
    sample_answer: "During a peak fiscal close at TCS, our approval service threw connection pool timeout errors. As part of the triage team, I analyzed thread dumps and discovered that a service method was holding an active database transaction while waiting on a 15-second external ERP network call, starving the Hikari pool. I refactored the method to execute the external call first, opening the database transaction only for the final update. Connection wait times dropped from 30s to under 10ms, restoring production, and I published a post-mortem guideline to prevent similar issues.",
    follow_up_questions: [
      "How do you maintain communication with non-technical stakeholders during an active production outage?",
      "What monitoring alerts did you establish after this incident to detect early connection pool pressure?"
    ],
    estimated_minutes: 10
  });

  addQ({
    id: "beh-03",
    skill_slug: "behavioral",
    skill_name: "Behavioral and HR Questions",
    skill_category: "career-and-projects",
    topic: "Ownership and conflict",
    subtopic: "Resolving Technical Disagreements & Conflicts",
    question_title: "Describe a time you had a technical disagreement with a team member or lead.",
    question_prompt: "Use the STAR method: How do you handle differing technical perspectives (e.g. library choice, architectural pattern)? How do you use data, prototypes, and respectful communication to resolve conflict constructively?",
    question_type: "practical_scenario",
    difficulty: "intermediate",
    priority: "high",
    expected_answer_points: [
      "Core competencies: Empathy, objective data-driven decision making, 'Disagree and Commit'.",
      "Situation: During sprint planning, a colleague advocated using an in-memory H2 database for integration tests, while I advocated using Testcontainers with real PostgreSQL Docker containers.",
      "Conflict: Colleague argued H2 was faster to set up; I was concerned that H2 masked PostgreSQL-specific JSONB operators and constraint syntax differences, which had caused production bugs in the past.",
      "Action: Instead of debating opinions, I created a quick benchmark prototype demonstrating that H2 accepted an invalid JSONB syntax query that failed on real PostgreSQL. I also measured Testcontainers startup time, showing Docker reuse added less than 4 seconds to the build.",
      "Result: The team agreed on Testcontainers, catching two subtle dialect bugs in CI before deployment."
    ],
    sample_answer: "When deciding on our integration testing stack, a senior colleague preferred in-memory H2 for setup speed, while I advocated for Testcontainers with real PostgreSQL to ensure constraint fidelity. Rather than debating opinions, I built a quick prototype demonstrating that H2 passed a query with JSONB syntax that failed on PostgreSQL. Seeing the concrete dialect discrepancy and that Docker container reuse only added 3 seconds to our build, my colleague agreed, and the team adopted Testcontainers, catching several SQL bugs in CI.",
    follow_up_questions: [
      "What do you do if a technical decision is made that you disagree with, but leadership decides to proceed anyway (Disagree and Commit)?",
      "How do you deliver constructive code review feedback without causing friction?"
    ],
    estimated_minutes: 10
  });

  addQ({
    id: "beh-04",
    skill_slug: "behavioral",
    skill_name: "Behavioral and HR Questions",
    skill_category: "career-and-projects",
    topic: "Learning from failure",
    subtopic: "Learning from Mistakes & Failures",
    question_title: "Tell me about a time you made a mistake or failed at a project deliverable.",
    question_prompt: "Use the STAR method: Select a genuine professional mistake. How did you take immediate ownership, transparently communicate with the team, rectify the error, and implement preventive guardrails?",
    question_type: "practical_scenario",
    difficulty: "intermediate",
    priority: "high",
    expected_answer_points: [
      "Genuine mistake: Deployed a database migration script in early staging that omitted an index on a foreign key, causing a report query to lock the table.",
      "Ownership: Did not deflect blame or make excuses; immediately alerted the tech lead and rolled back the change.",
      "Action: Analyzed query execution plan with EXPLAIN, added the missing index, and tested on a staging database with production-scale data volumes.",
      "Permanent improvement: Introduced an automated CI check (using migration linters) to verify all foreign keys and frequently queried columns have associated index migrations before PR approval.",
      "Takeaway: Mistakes are learning opportunities to build automated guardrails that protect the whole team."
    ],
    sample_answer: "Early in my career, I authored a database migration that added a foreign key but omitted an index on the column, causing a reporting query to run full table scans and lock staging tables. I immediately took ownership, notified the team lead, and reverted the migration. After adding the index and verifying with EXPLAIN ANALYZE on production-scale data, I automated an index check in our CI pipeline to flag unindexed foreign keys. The experience taught me to always test migrations against production-volume data.",
    follow_up_questions: [
      "How do you ensure you don't repeat the same mistake twice?",
      "Why is blameless post-mortem culture important in software engineering teams?"
    ],
    estimated_minutes: 10
  });

  addQ({
    id: "beh-05",
    skill_slug: "behavioral",
    skill_name: "Behavioral and HR Questions",
    skill_category: "career-and-projects",
    topic: "Collaboration and feedback",
    subtopic: "Handling Ambiguous Requirements & Tight Deadlines",
    question_title: "How do you handle ambiguous requirements and tight sprint deadlines?",
    question_prompt: "Describe a situation where a business requirement was vague or specifications were missing mid-sprint. How did you proactively clarify scope with the Product Owner and deliver on schedule?",
    question_type: "practical_scenario",
    difficulty: "intermediate",
    priority: "high",
    expected_answer_points: [
      "Proactive communication: Don't guess or make silent assumptions; schedule a quick sync with Product Owner or business analysts.",
      "Proposing solutions: Bring 2 concrete implementation options with trade-offs rather than just asking 'what should this do?'",
      "Scope slicing: Break the requirement into a core MVP deliverable that satisfies 80% of user needs within the sprint, deferring edge-case bells and whistles.",
      "Documentation: Document agreed assumptions in Jira/Confluence tickets to ensure alignment across engineering, product, and QA."
    ],
    sample_answer: "When tasked with building a vendor bulk export feature with vague filtering criteria, I didn't guess the business intent. I scheduled a 15-minute sync with the Product Owner, presenting two concrete implementation proposals: a simple date-and-status filter that could ship in the current sprint, versus a complex custom multi-attribute query builder. The PO confirmed that date and status covered 90% of user needs. We scoped the MVP accordingly and delivered on schedule, documenting the agreed criteria in Jira.",
    follow_up_questions: [
      "How do you push back politely if a stakeholder demands an unrealistic deadline?",
      "What is the difference between an acceptable MVP and cutting corners on software quality?"
    ],
    estimated_minutes: 10
  });

  addQ({
    id: "beh-06",
    skill_slug: "behavioral",
    skill_name: "Behavioral and HR Questions",
    skill_category: "career-and-projects",
    topic: "Why switch and why this role",
    subtopic: "Why Are You Looking to Switch Jobs?",
    question_title: "Why are you looking to leave your current role and make a job switch?",
    question_prompt: "How do you frame your motivation positively? Focus on seeking greater backend ownership, architectural challenges at scale, and career growth rather than criticizing your current employer.",
    question_type: "practical_scenario",
    difficulty: "beginner",
    priority: "critical",
    expected_answer_points: [
      "Rule 1: Always speak positively and respectfully about current employer (TCS provided strong foundations, enterprise exposure, and teamwork discipline).",
      "Rule 2: Focus on seeking technical growth and ownership: wanting to work closer to product engineering, tackle high-throughput distributed scale, and deepen Java/cloud architectural mastery.",
      "Rule 3: Align with the target role: Explain why THIS specific company and engineering team is the ideal next step for your career trajectory."
    ],
    sample_answer: "TCS has provided a fantastic foundation in enterprise software engineering, rigorous testing, and collaborating across agile teams on mission-critical procurement systems. However, I have reached a point where I am hungry for greater technical ownership in a fast-paced product engineering environment. I want to tackle high-scale distributed systems challenges, work closer to the product lifecycle, and take full end-to-end accountability for backend architectures, which is exactly what excites me about this team.",
    follow_up_questions: [
      "What kind of engineering culture brings out the best in you?",
      "Where do you see yourself technically in 3 to 5 years?"
    ],
    estimated_minutes: 8
  });

  addQ({
    id: "beh-07",
    skill_slug: "behavioral",
    skill_name: "Behavioral and HR Questions",
    skill_category: "career-and-projects",
    topic: "Collaboration and feedback",
    subtopic: "Giving and Receiving Code Review Feedback",
    question_title: "How do you approach Code Reviews: giving feedback and handling critiques of your code?",
    question_prompt: "Explain code review philosophy: Reviewing for correctness, maintainability, and security rather than stylistic nitpicks. How do you respond when a reviewer requests significant architectural changes?",
    question_type: "practical_scenario",
    difficulty: "intermediate",
    priority: "medium",
    expected_answer_points: [
      "Code review goals: Knowledge sharing, bug catching, maintaining architecture standards, and collective code ownership.",
      "Giving feedback: Be respectful, explain the 'why' behind suggestions (link to docs/benchmarks), differentiate blocking bugs from non-blocking nitpicks (using prefix 'nit:'), and praise clever solutions.",
      "Receiving feedback: Detach ego from code ('I am not my code'); treat critiques as learning opportunities; ask clarifying questions respectfully; assume positive intent.",
      "Automating style: Use Spotless/Checkstyle/ESLint in CI to prevent style nitpicks during human reviews."
    ],
    sample_answer: "I view code reviews as an opportunity for collective code ownership and knowledge sharing. When giving reviews, I focus on correctness, concurrency safety, and performance rather than stylistic preferences (which should be handled by automated linters), and I always explain the 'why' behind my comments. When receiving feedback, I detach my ego from my code: if a reviewer points out a flaw or suggests a cleaner architectural approach, I welcome it as a chance to improve system quality before it reaches production.",
    follow_up_questions: [
      "What do you do if a code review turns into a subjective bikeshedding debate?",
      "How do Conventional Comments (e.g. 'suggestion:', 'question:', 'blocking:') clarify PR discussions?"
    ],
    estimated_minutes: 10
  });

  addQ({
    id: "beh-08",
    skill_slug: "behavioral",
    skill_name: "Behavioral and HR Questions",
    skill_category: "career-and-projects",
    topic: "Why switch and why this role",
    subtopic: "Why This Company / Why This Role?",
    question_title: "Why do you want to work for our company specifically?",
    question_prompt: "How do you tailor your answer to demonstrate company research: understanding their engineering challenges, product mission, and why your technical skillset aligns with their needs?",
    question_type: "practical_scenario",
    difficulty: "beginner",
    priority: "critical",
    expected_answer_points: [
      "Demonstrate homework: Cite specific company products, recent tech blog posts, open source contributions, or scaling challenges.",
      "Technical alignment: Connect your skills in Java, Spring Boot, distributed messaging (Kafka), and database performance directly to their active problems.",
      "Cultural fit: Express excitement for their engineering values (e.g. autonomy, customer obsession, high bar for code quality).",
      "Avoid generic flattery: Never say 'because you are a Fortune 500 company' or 'great benefits'; talk about specific engineering work."
    ],
    sample_answer: "I've been following your engineering team's work, particularly your recent tech blog post on migrating to event-driven architectures with Kafka. Your commitment to high reliability under millions of transactions directly aligns with the problems I love solving. My experience optimizing database access, building resilient Spring Boot microservices, and implementing asynchronous pipelines makes me confident I can hit the ground running and make an immediate impact on your backend systems.",
    follow_up_questions: [
      "What questions do you have about our engineering team's tech stack or roadmap?",
      "What is an example of an engineering blog or tech book that has recently influenced your work?"
    ],
    estimated_minutes: 8
  });

  addQ({
    id: "beh-09",
    skill_slug: "behavioral",
    skill_name: "Behavioral and HR Questions",
    skill_category: "career-and-projects",
    topic: "Questions to ask the interviewer",
    subtopic: "Smart Questions to Ask the Interviewer",
    question_title: "What smart, insightful questions should you ask the interviewer at the end of an interview?",
    question_prompt: "List 4-5 thoughtful questions that demonstrate technical curiosity, engineering rigor, and cultural insight when the interviewer asks 'Do you have any questions for me?'.",
    question_type: "practical_scenario",
    difficulty: "beginner",
    priority: "critical",
    expected_answer_points: [
      "Never say 'No, I have no questions'; it signals lack of interest or curiosity.",
      "Technical Question: 'What is the most challenging technical hurdle or architectural bottleneck your team is currently tackling this quarter?'",
      "Engineering Process Question: 'What does the path from a merged pull request to production look like here? How automated are your deployments and rollbacks?'",
      "Team Culture Question: 'How does the team balance shipping new features with paying down technical debt and refactoring?'",
      "Onboarding Question: 'What does success look like for someone in this role in their first 90 days?'"
    ],
    sample_answer: "At the end of an interview, ask insightful questions that show engineering maturity: 1) 'What is the biggest architectural bottleneck or technical debt challenge your team is tackling right now?' 2) 'How does code get from a merged PR to production—how automated are your deployment pipelines and canary validations?' 3) 'How does engineering leadership balance product feature delivery with refactoring and technical debt?' 4) 'What would success look like for an engineer in this role during their first 90 days?'",
    follow_up_questions: [
      "Why should you avoid asking about salary, perks, or vacation time during early technical interview rounds?",
      "How do you adapt your questions when interviewing with an Engineering Manager vs a Staff Engineer?"
    ],
    estimated_minutes: 8
  });

  addQ({
    id: "beh-10",
    skill_slug: "behavioral",
    skill_name: "Behavioral and HR Questions",
    skill_category: "career-and-projects",
    topic: "Ownership and conflict",
    subtopic: "Continuous Learning & Staying Updated",
    question_title: "How do you stay up-to-date with evolving software technologies and best practices?",
    question_prompt: "Discuss your learning habits: Reading engineering blogs (Uber, Netflix, DoorDash), books (Designing Data-Intensive Applications), experimenting with hands-on personal projects (like CareerOS, Lovable AI), and practicing algorithmic problem solving (Grind 75).",
    question_type: "practical_scenario",
    difficulty: "beginner",
    priority: "medium",
    expected_answer_points: [
      "Engineering blogs: Regularly read engineering tech blogs from tech leaders (Uber, Stripe, Netflix) to understand real-world scaling patterns.",
      "Books: Cite foundational books like Martin Kleppmann's 'Designing Data-Intensive Applications', Joshua Bloch's 'Effective Java', and Robert Martin's 'Clean Architecture'.",
      "Hands-on building: The best way to learn is by building real projects—such as building CareerOS with Next.js and Supabase, and building an AI builder with Spring AI and pgvector.",
      "Continuous practice: Disciplined algorithmic problem solving on LeetCode/Grind 75 to keep data structure and algorithmic intuition sharp."
    ],
    sample_answer: "I stay current through a combination of reading, continuous practice, and hands-on building. I regularly read engineering blogs from Stripe and Netflix to see how distributed systems are architected in production, and study foundational books like 'Designing Data-Intensive Applications'. More importantly, I learn by building: when Spring AI and pgvector emerged, I built a full-stack AI builder to master vector retrieval and tool calling firsthand. I also practice algorithmic problem solving consistently to keep my core fundamentals sharp.",
    follow_up_questions: [
      "What is an interesting technical concept you learned recently that changed how you write code?",
      "How do you evaluate whether a new framework or technology is mature enough to adopt in production?"
    ],
    estimated_minutes: 8
  });
};
