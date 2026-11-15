// APIs and Integration questions: 42 total
// rest-apis (12), websockets-sse (7), jwt (10), postman (7), swagger-openapi (6)
module.exports = function(addQ) {
  // --- REST APIS (12) ---
  addQ({
    id: "rest-01",
    skill_slug: "rest-apis",
    skill_name: "REST APIs",
    skill_category: "api-and-integration",
    topic: "Idempotency and pagination",
    subtopic: "HTTP Methods & Idempotency",
    question_title: "Explain HTTP Method Idempotency and Safety.",
    question_prompt: "Define Safe and Idempotent HTTP methods. Compare GET, POST, PUT, PATCH, and DELETE. Why is PUT idempotent while POST is not, and why is PATCH conditionally idempotent?",
    question_type: "conceptual",
    difficulty: "beginner",
    priority: "critical",
    expected_answer_points: [
      "Safe methods: Do not modify server resource state (GET, HEAD, OPTIONS).",
      "Idempotent methods: Making multiple identical requests has the exact same server resource effect as a single request (GET, PUT, DELETE, HEAD, OPTIONS).",
      "POST is NOT idempotent: Repeating POST /orders creates multiple duplicate orders.",
      "PUT is idempotent: Completely replaces the target resource representation at URI. Repeating PUT /users/1 with { name: 'Alice' } leaves the user named 'Alice' regardless of execution count.",
      "PATCH is NOT strictly idempotent by default: If updating an array ({ $push: 'item' }) or incrementing a counter ({ $inc: 1 }), repeating the request compounds the change. It IS idempotent only if setting absolute values."
    ],
    sample_answer: "Safe methods (like GET) do not mutate server state. An idempotent method produces the same side-effect on the server whether executed once or 100 times. GET, PUT, and DELETE are idempotent: replacing an entity with PUT or deleting an entity with DELETE yields the same server state on repeated calls. POST is not idempotent because repeating it creates duplicate resources. PATCH is conditionally idempotent: setting a field is idempotent, but operations like incrementing a balance are not.",
    follow_up_questions: [
      "What HTTP status code should DELETE return on the second invocation if the resource is already gone (204 vs 404)?",
      "How do Idempotency Keys (Idempotency-Key header) make POST endpoints idempotent in payment processing?"
    ],
    estimated_minutes: 10
  });

  addQ({
    id: "rest-02",
    skill_slug: "rest-apis",
    skill_name: "REST APIs",
    skill_category: "api-and-integration",
    topic: "HTTP methods and status codes",
    subtopic: "HTTP Status Codes Architecture",
    question_title: "Explain the standard HTTP Status Codes: 2xx, 3xx, 4xx, and 5xx.",
    question_prompt: "Compare critical HTTP status codes: 200 OK, 201 Created, 204 No Content, 301 vs 302/307/308, 400 Bad Request, 401 Unauthorized vs 403 Forbidden, 404 Not Found, 409 Conflict, 422 Unprocessable Entity, and 500/502/503/504.",
    question_type: "conceptual",
    difficulty: "beginner",
    priority: "critical",
    expected_answer_points: [
      "201 Created: Resource created, accompanied by Location header.",
      "204 No Content: Request succeeded but response body is intentionally empty (common for DELETE and PUT).",
      "301 (Moved Permanently) vs 308 (Permanent Redirect, preserves HTTP method). 302 (Found) vs 307 (Temporary Redirect, preserves method).",
      "401 Unauthorized: Authentication is missing or invalid (user not logged in).",
      "403 Forbidden: User is authenticated but lacks required permission/role.",
      "409 Conflict: Request conflicts with current server state (e.g. duplicate unique key).",
      "422 Unprocessable Entity: Request syntax is valid JSON, but semantic business validation rules failed.",
      "502 Bad Gateway (upstream server returned invalid response) vs 504 Gateway Timeout (upstream server did not respond in time)."
    ],
    sample_answer: "HTTP status codes convey request outcomes: 201 indicates resource creation with a Location header; 204 indicates success with an empty body. 401 means the client is unauthenticated, while 403 means the user is authenticated but unauthorized for that action. 409 signals a state conflict (duplicate email), while 422 indicates semantic validation failures. In gateway architectures, 502 indicates a proxy received an error from an upstream service, while 504 indicates the upstream service timed out.",
    follow_up_questions: [
      "Why should 401 responses include a WWW-Authenticate header?",
      "What is the difference between 302 Found and 303 See Other after a POST form submission?"
    ],
    estimated_minutes: 12
  });

  addQ({
    id: "rest-03",
    skill_slug: "rest-apis",
    skill_name: "REST APIs",
    skill_category: "api-and-integration",
    topic: "Idempotency and pagination",
    subtopic: "Idempotency Keys in Payment APIs",
    question_title: "How do you implement an Idempotency-Key pattern in payment and ordering APIs?",
    question_prompt: "Walk through designing an idempotency engine for POST /charges: Idempotency-Key header, storing request hashes and response payloads in Redis/PostgreSQL, distributed locking, and returning cached responses.",
    question_type: "practical_scenario",
    difficulty: "advanced",
    priority: "critical",
    expected_answer_points: [
      "Problem: Network drops after a payment gateway charges a credit card, prompting client to retry the POST request and causing duplicate billing.",
      "Idempotency-Key: Client generates a unique UUID (Idempotency-Key header) for the transaction.",
      "Processing flow: 1) Server receives request and attempts to acquire an atomic distributed lock on 'idempotency:{key}' (e.g. Redis SET NX EX 60).",
      "2) If lock fails (in-progress), return HTTP 409 Conflict or wait briefly.",
      "3) If key already exists in DB/cache with a stored response, return the cached HTTP status code and response body immediately without executing the charge.",
      "4) If new, execute charge in DB, persist response payload under key, release lock, and return result."
    ],
    sample_answer: "The client generates a unique UUID in the Idempotency-Key header for financial mutations. When the server receives the request, it checks Redis for that key: if a completed response exists, it immediately returns the cached response without charging again. If currently processing, it returns 409 Conflict. If new, it creates a processing lock, executes the business logic, caches the resulting HTTP response and body under the key with a 24-hour TTL, and returns the result, preventing duplicate charges upon network retries.",
    follow_up_questions: [
      "What should happen if a client submits the same Idempotency-Key with a completely different request body payload?",
      "Why is a distributed lock with TTL necessary while processing an idempotent request?"
    ],
    estimated_minutes: 15
  });

  addQ({
    id: "rest-04",
    skill_slug: "rest-apis",
    skill_name: "REST APIs",
    skill_category: "api-and-integration",
    topic: "Resource and endpoint design",
    subtopic: "RESTful URL Naming & Resource Modeling",
    question_title: "What are the rules of RESTful URI design and resource modeling?",
    question_prompt: "Explain REST URI best practices: Plural nouns vs verbs, hierarchical sub-resources (/orders/{id}/items), filtering via query parameters, and modeling non-CRUD actions (e.g. cancel order, activate account).",
    question_type: "conceptual",
    difficulty: "beginner",
    priority: "high",
    expected_answer_points: [
      "Use nouns, not verbs: /api/v1/orders instead of /api/v1/getOrders or /createOrder. HTTP verbs (GET, POST, DELETE) specify the action.",
      "Plural nouns for collections: /users, /products, /orders.",
      "Hierarchical nesting: /customers/{id}/orders for parent-child ownership, but limit nesting to 2 levels deep to prevent unwieldy URIs (/customers/1/orders/2, not /customers/1/orders/2/items/3/taxes).",
      "Query parameters for non-resource operations: Filtering, sorting, and pagination belong in query strings (/orders?status=shipped&sort=-created_at&limit=20).",
      "Modeling actions: Sub-resource approach (POST /orders/{id}/cancellation) or state transition (PATCH /orders/{id} with status: 'CANCELLED')."
    ],
    sample_answer: "RESTful URIs represent resources as plural nouns (/api/v1/users, /orders) rather than verbs, letting HTTP methods define operations. Sub-resources represent relationships (e.g. /users/{id}/addresses), but nesting should not exceed 2 levels. Filtering, sorting, and pagination belong in query parameters (?status=active&sort=desc). For actions that do not fit simple CRUD (like cancelling an order), either PATCH the state attribute or model the action as a sub-resource (POST /orders/{id}/cancellation).",
    follow_up_questions: [
      "Why should API paths be lowercase and use hyphens rather than camelCase or underscores?",
      "What is Richardson Maturity Model Level 3 (HATEOAS)?"
    ],
    estimated_minutes: 10
  });

  addQ({
    id: "rest-05",
    skill_slug: "rest-apis",
    skill_name: "REST APIs",
    skill_category: "api-and-integration",
    topic: "API versioning and backward compatibility",
    subtopic: "API Versioning Strategies",
    question_title: "Compare API Versioning strategies: URI path, Query Param, Custom Header, and Content Negotiation.",
    question_prompt: "Compare the four REST API versioning strategies: URI path (/v1/users), Query parameter (/users?v=1), Custom Header (X-API-Version: 1), and Content Negotiation (Accept: application/vnd.company.v1+json). Which is most practical and why?",
    question_type: "conceptual",
    difficulty: "intermediate",
    priority: "high",
    expected_answer_points: [
      "1. URI Path (/api/v1/users): Most common and pragmatic. Easy to route, debug, and inspect in browser logs/proxies. Downside: Violates pure REST principle that URIs identify resources, not representations.",
      "2. Query Parameter (/users?version=1): Easy to test, defaults cleanly, but can complicate CDN caching.",
      "3. Custom Header (X-API-Version: 1): Keeps URIs clean. Requires custom client configuration; harder to test in plain browser.",
      "4. Content Negotiation / Accept Header (Accept: application/vnd.app.v1+json): Purest REST approach. Downside: Complex routing logic in gateways and controllers, difficult for third-party developers to adopt.",
      "Industry consensus: URI path versioning (/v1) is universally favored for developer ergonomics and simple gateway routing."
    ],
    sample_answer: "URI path versioning (/v1/orders) is the industry standard due to its simplicity, ease of browser testing, and clear CDN caching/gateway routing rules. Query parameter versioning (?version=2) is simple but can conflict with query filters. Custom headers (X-API-Version) and Content Negotiation (Accept header with vendor MIME types) adhere strictly to REST purity by keeping URIs invariant, but add friction for client integration and proxy routing.",
    follow_up_questions: [
      "What changes constitute a breaking change versus a backward-compatible change in REST APIs?",
      "How do you deprecate old API versions gracefully using Sunset and Deprecation HTTP headers?"
    ],
    estimated_minutes: 12
  });

  addQ({
    id: "rest-06",
    skill_slug: "rest-apis",
    skill_name: "REST APIs",
    skill_category: "api-and-integration",
    topic: "Rate limiting and security",
    subtopic: "Rate Limiting Algorithms: Token Bucket vs Leaky Bucket",
    question_title: "Compare Rate Limiting Algorithms: Token Bucket, Leaky Bucket, and Sliding Window Counter.",
    question_prompt: "Explain the mathematics and trade-offs of Token Bucket, Leaky Bucket, and Sliding Window Counter algorithms for API rate limiting. How are rate limits communicated to clients via standard headers (X-RateLimit-* / RFC 6585)?",
    question_type: "conceptual",
    difficulty: "advanced",
    priority: "critical",
    expected_answer_points: [
      "Token Bucket: Tokens are added at a constant fill rate up to bucket capacity. Requests consume tokens. Accommodates bursts of traffic while capping long-term throughput (standard in AWS, Stripe, Spring Cloud Gateway).",
      "Leaky Bucket: Requests enter a FIFO queue and leak out at a constant processing rate. Smoothes out traffic spikes into steady output; drops requests when buffer overflows.",
      "Sliding Window Counter: Combines fixed window counters from current and previous windows weighted by time overlap to prevent boundary bursts.",
      "Headers: X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset (epoch timestamp).",
      "Status code: HTTP 429 Too Many Requests with Retry-After header."
    ],
    sample_answer: "The Token Bucket algorithm adds tokens at a fixed rate up to capacity; requests consume tokens. It allows short bursts while enforcing sustained throughput limits, making it the industry standard (implemented via Redis lua scripts). Leaky Bucket queues requests and processes them at a strictly constant rate, smoothing spikes. Sliding Window Counter weights overlapping time windows to prevent traffic spikes at boundary resets. When limits are exceeded, the API returns HTTP 429 Too Many Requests with a Retry-After header.",
    follow_up_questions: [
      "How do you implement a distributed Token Bucket algorithm in Redis using a Lua script?",
      "What is the difference between client IP rate limiting and user-authenticated rate limiting?"
    ],
    estimated_minutes: 15
  });

  addQ({
    id: "rest-07",
    skill_slug: "rest-apis",
    skill_name: "REST APIs",
    skill_category: "api-and-integration",
    topic: "Validation and error contracts",
    subtopic: "RFC 7807 Problem Details for HTTP APIs",
    question_title: "What is RFC 7807 / RFC 9457 Problem Details, and why is it standard for API error responses?",
    question_prompt: "Explain the standard JSON structure of Problem Details (type, title, status, detail, instance). How does standardized error design eliminate custom error formats across microservices?",
    question_type: "conceptual",
    difficulty: "intermediate",
    priority: "high",
    expected_answer_points: [
      "Problem solved: Every team/service inventing proprietary error payloads ({ code: 123, msg: '...' } vs { status: 'fail', error: '...' }), making client error handling fragile.",
      "RFC 7807 specification: application/problem+json media type.",
      "Standard fields: 'type' (URI reference identifying problem type), 'title' (short human-readable summary), 'status' (HTTP status code matching response), 'detail' (human-readable explanation specific to occurrence), 'instance' (URI of specific resource request).",
      "Extension members: Custom fields allowed for validation errors (e.g. invalidParams array with field and reason).",
      "Native support: Spring Boot 3 has first-class ProblemDetail class support."
    ],
    sample_answer: "RFC 7807 defines a standardized JSON error format (application/problem+json) replacing proprietary error schemas across enterprise services. It mandates standardized properties: 'type' (URI documenting the error), 'title' (short description), 'status' (HTTP code), 'detail' (specific explanation of what went wrong), and 'instance' (request path). It allows custom extensions (like an 'invalidParams' array for form field errors), allowing client applications to write unified error-handling logic.",
    follow_up_questions: [
      "How does Spring Boot 3's ProblemDetail class integrate with @RestControllerAdvice?",
      "Why should internal stack traces never be included in the 'detail' field of ProblemDetail?"
    ],
    estimated_minutes: 10
  });

  addQ({
    id: "rest-08",
    skill_slug: "rest-apis",
    skill_name: "REST APIs",
    skill_category: "api-and-integration",
    topic: "Idempotency and pagination",
    subtopic: "Pagination & Link Header Standards",
    question_title: "How do you implement RFC 5988 Web Linking for API pagination?",
    question_prompt: "Explain the Link HTTP response header for pagination (rel='next', rel='prev', rel='first', rel='last'). Why is using headers cleaner than wrapping arrays in custom pagination JSON envelopes?",
    question_type: "conceptual",
    difficulty: "intermediate",
    priority: "medium",
    expected_answer_points: [
      "RFC 5988: Uses standard HTTP 'Link' response header to communicate hypermedia pagination links.",
      "Header format: Link: <https://api.example.com/items?page=3>; rel=\"next\", <https://api.example.com/items?page=1>; rel=\"prev\".",
      "Benefit: Clean JSON payload. The response body remains a pure array of domain entities ([{id: 1}, {id: 2}]) without polluting it with metadata wrappers ({ data: [...], pagination: {...} }).",
      "Supported by GitHub, Stripe, and modern REST APIs.",
      "Accompanying headers: X-Total-Count (total records available)."
    ],
    sample_answer: "RFC 5988 standardizes pagination via the HTTP 'Link' response header, providing URLs with rel attributes for 'next', 'prev', 'first', and 'last'. This keeps the HTTP response body a clean, unpolluted array of domain resources ([...]) rather than forcing metadata envelopes ({ meta: {}, data: [] }). Clients simply inspect the Link header to traverse pages without parsing custom envelope schemas.",
    follow_up_questions: [
      "How does Keyset pagination express next/prev cursors in the Link header?",
      "What are the pros and cons of envelope responses ({ data, meta }) versus HTTP headers?"
    ],
    estimated_minutes: 10
  });

  addQ({
    id: "rest-09",
    skill_slug: "rest-apis",
    skill_name: "REST APIs",
    skill_category: "api-and-integration",
    topic: "Resource and endpoint design",
    subtopic: "HTTP Caching: ETag & Cache-Control",
    question_title: "How does HTTP Conditional Caching work with ETags and Cache-Control?",
    question_prompt: "Explain Cache-Control directives (max-age, no-cache, no-store, private). How do ETags and If-None-Match headers return HTTP 304 Not Modified, saving network bandwidth?",
    question_type: "conceptual",
    difficulty: "intermediate",
    priority: "high",
    expected_answer_points: [
      "Cache-Control directives: 'no-store' (never cache anywhere); 'no-cache' (can cache, but must validate with server before reusing); 'max-age=3600' (fresh for 1 hour); 'private' (browser cache only, not shared CDNs).",
      "ETag (Entity Tag): Unique hash or version string representing the resource representation (e.g. ETag: \"686897696a7c76\").",
      "Conditional Request: Client caches ETag. On subsequent request, sends 'If-None-Match: \"686897696a7c76\"'.",
      "304 Not Modified: If server resource is unchanged, server returns HTTP 304 with an empty response body, instructing client to use its cached version.",
      "Saves bandwidth and server rendering CPU."
    ],
    sample_answer: "HTTP caching uses Cache-Control directives: 'no-store' forbids caching; 'no-cache' forces client revalidation before use; 'max-age' defines freshness. ETags provide conditional validation: the server emits a hash of the resource in the ETag header. On repeat requests, the client sends 'If-None-Match: <etag>'. If the entity has not changed, the server returns HTTP 304 Not Modified with zero body bytes, saving network bandwidth and latency.",
    follow_up_questions: [
      "What is the difference between a Strong ETag and a Weak ETag (W/\"...\")?",
      "How does If-Match header enable optimistic concurrency control on PUT requests?"
    ],
    estimated_minutes: 12
  });

  addQ({
    id: "rest-10",
    skill_slug: "rest-apis",
    skill_name: "REST APIs",
    skill_category: "api-and-integration",
    topic: "Rate limiting and security",
    subtopic: "API Security: Mass Assignment & Broken Object Level Authorization (BOLA)",
    question_title: "Explain the OWASP Top 10 API Security Risks: BOLA and Mass Assignment.",
    question_prompt: "What is Broken Object Level Authorization (BOLA / IDOR)? What is Mass Assignment vulnerability, and how do separate DTOs and Zod schemas prevent unauthorized parameter tampering?",
    question_type: "practical_scenario",
    difficulty: "intermediate",
    priority: "critical",
    expected_answer_points: [
      "BOLA (Broken Object Level Authorization / IDOR): The #1 API vulnerability. Endpoint accepts an ID (GET /documents/1234) and returns the document without verifying that the authenticated user actually owns that document.",
      "BOLA Defense: Always check authorization at data layer: WHERE id = :id AND user_id = :authenticated_user_id.",
      "Mass Assignment: Attacker includes unexpected fields in request JSON body (e.g. { \"isAdmin\": true, \"balance\": 999999 }), and backend framework blindly maps request fields into database entity.",
      "Mass Assignment Defense: Never bind HTTP request bodies directly to database entities; use explicit Request DTOs with strict validation (Zod .strict() / whitelist)."
    ],
    sample_answer: "BOLA (Broken Object Level Authorization) occurs when an API endpoint takes an object ID (GET /api/orders/50) and returns records without verifying whether the requesting user owns that object. Defense requires verifying ownership in every database query. Mass Assignment happens when APIs map JSON directly to DB entities, allowing attackers to inject fields like 'role: admin'. Defense requires strict Request DTOs that whitelist only user-editable fields.",
    follow_up_questions: [
      "What is Broken Function Level Authorization (BFLA) in OWASP API Top 10?",
      "Why is validating user permissions in the UI insufficient for API security?"
    ],
    estimated_minutes: 12
  });

  addQ({
    id: "rest-11",
    skill_slug: "rest-apis",
    skill_name: "REST APIs",
    skill_category: "api-and-integration",
    topic: "Resource and endpoint design",
    subtopic: "GraphQL vs REST Comparison",
    question_title: "Compare REST and GraphQL: Over-fetching, Under-fetching, and Performance.",
    question_prompt: "What problems in REST led to GraphQL? Compare over-fetching and under-fetching (multiple roundtrips) with GraphQL client queries. What are the downsides of GraphQL regarding HTTP caching and N+1 query attacks?",
    question_type: "conceptual",
    difficulty: "intermediate",
    priority: "medium",
    expected_answer_points: [
      "Over-fetching in REST: Endpoint returns 50 fields when the mobile client only needs name and avatar.",
      "Under-fetching in REST: Fetching a user, their orders, and order items requires 3 sequential HTTP roundtrips (waterfall latency).",
      "GraphQL solution: Client defines a query selecting the exact fields and nested relationships needed in a single HTTP POST request.",
      "GraphQL drawbacks: 1) Hard to cache: All requests are HTTP POST to a single /graphql endpoint, breaking standard browser/CDN HTTP caching; 2) Security: Attackers can craft deeply nested queries causing DoS; 3) Complex N+1 problem requiring DataLoader."
    ],
    sample_answer: "REST endpoints often return fixed payloads resulting in over-fetching (wasting bandwidth on mobile) or under-fetching (requiring multiple waterfall requests to fetch related data). GraphQL solves this by allowing clients to query exact fields and nested graphs in a single request. However, GraphQL makes HTTP caching difficult (all queries POST to /graphql), adds significant backend schema complexity, and exposes servers to malicious deeply nested queries and N+1 database hazards without DataLoader.",
    follow_up_questions: [
      "How does the DataLoader pattern solve the N+1 problem in GraphQL resolvers?",
      "How do query depth limiting and query complexity analysis protect GraphQL APIs?"
    ],
    estimated_minutes: 12
  });

  addQ({
    id: "rest-12",
    skill_slug: "rest-apis",
    skill_name: "REST APIs",
    skill_category: "api-and-integration",
    topic: "Resource and endpoint design",
    subtopic: "Webhooks Architecture & Signature Verification",
    question_title: "How do you design and verify Webhooks in enterprise APIs?",
    question_prompt: "Explain how Webhooks implement reverse-API push notifications (e.g. Stripe webhooks). How do you verify HMAC-SHA256 signatures (Stripe-Signature), handle retries with exponential backoff, and guarantee idempotent processing?",
    question_type: "practical_scenario",
    difficulty: "advanced",
    priority: "high",
    expected_answer_points: [
      "Webhook: HTTP POST callback sent by a service provider to a client's URL when an asynchronous event occurs.",
      "Security: Provider signs payload with a shared secret using HMAC-SHA256 and sends signature in header (Stripe-Signature: t=123,v1=hash).",
      "Signature verification: Recipient calculates HMAC-SHA256(secret, timestamp + '.' + raw_body) and performs constant-time comparison against header to prevent spoofing and replay attacks.",
      "Retry policy: If recipient returns non-2xx or times out, provider retries with exponential backoff (e.g. over 72 hours).",
      "Idempotency: Recipient must store event ID and skip duplicate executions."
    ],
    sample_answer: "Webhooks deliver real-time event notifications via HTTP POST callbacks. To prevent spoofing and replay attacks, providers include a cryptographic signature header (e.g. HMAC-SHA256 calculated using a shared webhook secret and raw payload). The receiving server must verify this signature using constant-time string comparison before processing. Because webhook delivery guarantees at-least-once delivery, receivers must record event IDs to process each event idempotently.",
    follow_up_questions: [
      "Why must you use the raw unparsed request body string when verifying HMAC webhook signatures?",
      "How does checking the timestamp in a webhook header prevent Replay Attacks?"
    ],
    estimated_minutes: 12
  });

  // --- WEBSOCKETS AND SERVER-SENT EVENTS (7) ---
  addQ({
    id: "ws-01",
    skill_slug: "websockets-sse",
    skill_name: "WebSockets and Server-Sent Events",
    skill_category: "api-and-integration",
    topic: "WebSockets versus SSE versus polling",
    subtopic: "WebSockets vs SSE vs Long Polling",
    question_title: "Compare WebSockets, Server-Sent Events (SSE), and Short/Long Polling.",
    question_prompt: "When should you choose WebSockets vs Server-Sent Events (SSE) vs Long Polling? Compare protocol (HTTP vs TCP), directionality (unidirectional vs bidirectional), overhead, reconnection, and firewall traversal.",
    question_type: "conceptual",
    difficulty: "intermediate",
    priority: "critical",
    expected_answer_points: [
      "Short Polling: Periodic client GET requests (setInterval). High HTTP header overhead and latency.",
      "Long Polling: Server holds HTTP request open until data is available, then client immediately reconnects. Better than short polling, but creates high connection turnover.",
      "Server-Sent Events (SSE): Unidirectional streaming from server to client over standard HTTP (Content-Type: text/event-stream). Built-in browser reconnection, event IDs, simple firewall/proxy traversal. Best for notifications, stock tickers, and LLM chat streaming.",
      "WebSockets: Full-duplex bidirectional communication over a single persistent TCP connection. Lowest per-message overhead. Requires custom reconnection logic and special proxy/load balancer support. Best for multiplayer games, collaborative editing, and real-time chat."
    ],
    sample_answer: "Choose Server-Sent Events (SSE) when data flows in one direction from server to client (e.g. LLM streaming, live notifications, news feeds): it operates over standard HTTP/2, traverses firewalls easily, and includes native browser reconnection. Choose WebSockets when true bidirectional, low-latency interaction is required (e.g. collaborative canvases, multiplayer gaming, chat rooms): it upgrades to a raw TCP full-duplex stream, eliminating HTTP overhead on subsequent messages.",
    follow_up_questions: [
      "Why is SSE preferred over WebSockets for streaming AI/LLM responses like ChatGPT?",
      "How does HTTP/2 multiplexing eliminate the 6-connection browser limit for SSE?"
    ],
    estimated_minutes: 12
  });

  addQ({
    id: "ws-02",
    skill_slug: "websockets-sse",
    skill_name: "WebSockets and Server-Sent Events",
    skill_category: "api-and-integration",
    topic: "WebSocket handshake and lifecycle",
    subtopic: "WebSocket Upgrade Handshake",
    question_title: "How does the HTTP to WebSocket Upgrade Handshake work?",
    question_prompt: "Walk through the HTTP 101 Switching Protocols handshake: Upgrade: websocket, Connection: Upgrade, Sec-WebSocket-Key, and Sec-WebSocket-Accept hashing.",
    question_type: "conceptual",
    difficulty: "intermediate",
    priority: "high",
    expected_answer_points: [
      "Handshake starts as standard HTTP/1.1 GET request.",
      "Client headers: Upgrade: websocket, Connection: Upgrade, Sec-WebSocket-Version: 13, Sec-WebSocket-Key: <base64-random-16-bytes>.",
      "Server processing: Server takes Sec-WebSocket-Key, appends fixed GUID '258EAFA5-E914-47DA-95CA-C5AB0DC85B11', computes SHA-1 hash, and base64-encodes result.",
      "Server response: HTTP 101 Switching Protocols with Sec-WebSocket-Accept: <computed-hash>.",
      "TCP connection remains open; protocol transitions from HTTP text framing to binary WebSocket framing."
    ],
    sample_answer: "WebSockets initiate with an HTTP/1.1 handshake request containing headers 'Upgrade: websocket', 'Connection: Upgrade', and a random 'Sec-WebSocket-Key'. The server appends a standardized magic GUID string to this key, calculates a SHA-1 hash, and returns an HTTP 101 Switching Protocols response with the hash in the 'Sec-WebSocket-Accept' header. Once the 101 handshake succeeds, the underlying TCP socket switches to lightweight WebSocket binary framing.",
    follow_up_questions: [
      "Why does the WebSocket protocol require client frames to be masked (XOR masking) while server frames are unmasked?",
      "How does authentication (JWT or cookies) work during the WebSocket handshake?"
    ],
    estimated_minutes: 12
  });

  addQ({
    id: "ws-03",
    skill_slug: "websockets-sse",
    skill_name: "WebSockets and Server-Sent Events",
    skill_category: "api-and-integration",
    topic: "Scaling real-time connections",
    subtopic: "Scaling WebSockets horizontally with Redis Pub/Sub",
    question_title: "How do you scale WebSockets horizontally across multiple server instances?",
    question_prompt: "When Client A is connected to Server 1 and Client B is connected to Server 2, how do they chat in real time? Explain scaling stateful WebSocket connections using Redis Pub/Sub or Kafka backplanes.",
    question_type: "practical_scenario",
    difficulty: "advanced",
    priority: "critical",
    expected_answer_points: [
      "The stateful challenge: WebSockets are persistent TCP connections held in memory on a specific server instance; Server 1 cannot directly write to a socket held on Server 2.",
      "Message broker backplane: Connect all WebSocket server instances to a shared Redis Pub/Sub or Kafka cluster.",
      "Communication flow: 1) Client A sends message to Server 1; 2) Server 1 publishes event to Redis channel 'room:123'; 3) All WebSocket server instances subscribed to 'room:123' receive the event; 4) Server 2 checks if it holds local sockets for room 123 and writes the frame to Client B.",
      "Load balancing: Load balancers must support WebSocket protocol upgrades and sticky sessions (optional if backplane handles routing)."
    ],
    sample_answer: "Because WebSockets are stateful TCP connections tied to specific server memory, Server 1 cannot write to a client socket connected to Server 2. To scale horizontally, connect all server instances via a shared message backplane like Redis Pub/Sub. When Server 1 receives a message, it publishes it to a Redis topic. All instances subscribed to that topic receive the message and forward it to whichever clients are connected to their local sockets.",
    follow_up_questions: [
      "What is the socket limit per server (file descriptors) and how do you tune ulimit -n for 100k+ concurrent connections?",
      "How does Socket.IO's Redis Adapter implement this pattern automatically?"
    ],
    estimated_minutes: 15
  });

  addQ({
    id: "ws-04",
    skill_slug: "websockets-sse",
    skill_name: "WebSockets and Server-Sent Events",
    skill_category: "api-and-integration",
    topic: "SSE behavior and use cases",
    subtopic: "Server-Sent Events (SSE) Protocol & Formatting",
    question_title: "How does the Server-Sent Events (SSE) wire protocol work?",
    question_prompt: "Explain the text/event-stream format: event, data, id, and retry fields. How does the browser EventSource API handle automatic reconnections and the Last-Event-ID header?",
    question_type: "coding",
    difficulty: "intermediate",
    priority: "high",
    expected_answer_points: [
      "HTTP Header: Content-Type: text/event-stream, Cache-Control: no-cache, Connection: keep-alive.",
      "Frame format: Plain text separated by double newlines (\n\n).",
      "Fields: 'event: customType\n', 'data: {\"msg\": \"hi\"}\n', 'id: 101\n', 'retry: 5000\n\n'.",
      "Automatic reconnection: The browser's native EventSource API automatically reconnects if the connection drops.",
      "Last-Event-ID: Upon reconnecting, the browser automatically sends 'Last-Event-ID: 101' header, allowing the server to replay missed events."
    ],
    sample_answer: "SSE streams data over standard HTTP with Content-Type: text/event-stream. Messages are text blocks terminated by double newlines (\n\n) containing fields like 'data: ...', 'event: customName', and 'id: 42'. Browsers consume this with EventSource. If the connection drops, EventSource automatically reconnects and includes the 'Last-Event-ID' header, enabling the server to replay any missed messages from that offset.",
    follow_up_questions: [
      "Why must proxy buffers (like nginx proxy_buffering off) be disabled when serving SSE streams?",
      "How do you implement heartbeats in SSE to prevent load balancer timeouts (: ping\n\n)?"
    ],
    estimated_minutes: 10
  });

  addQ({
    id: "ws-05",
    skill_slug: "websockets-sse",
    skill_name: "WebSockets and Server-Sent Events",
    skill_category: "api-and-integration",
    topic: "Reconnect and delivery considerations",
    subtopic: "WebSocket Heartbeats: Ping/Pong Frames",
    question_title: "How do WebSocket Ping/Pong frames detect dead connections and keep sockets alive?",
    question_prompt: "Why can a TCP connection drop silently without the server or client noticing (half-open sockets)? Explain WebSocket Ping (opcode 0x9) and Pong (opcode 0xA) frames and heartbeat intervals.",
    question_type: "conceptual",
    difficulty: "intermediate",
    priority: "medium",
    expected_answer_points: [
      "Half-open socket problem: If an intermediate router drops power or mobile device switches Wi-Fi to cellular, no TCP FIN or RST packet is sent. The server believes the socket is active forever, leaking memory and descriptors.",
      "Idle timeout: Cloud load balancers (AWS ALB) terminate idle connections after 60 seconds of inactivity.",
      "Ping/Pong protocol: Server sends Ping control frame (opcode 0x9) every 30 seconds; client RFC-compliant browser automatically replies with Pong (opcode 0xA).",
      "Dead connection detection: If no Pong is received within timeout, server calls socket.terminate(), freeing resources."
    ],
    sample_answer: "Network drops (e.g. mobile entering a tunnel) often fail to send TCP FIN packets, leaving connections 'half-open' where the server wastes memory holding dead sockets. Intermediate firewalls also terminate idle connections after 60s. To prevent this, servers send periodic Ping control frames (opcode 0x9). Compliant clients automatically respond with Pong (opcode 0xA). If a client fails to return Pong within a deadline, the server terminates the dead connection.",
    follow_up_questions: [
      "Can JavaScript in a browser manually send Ping/Pong frames via the standard WebSocket API?",
      "How does exponential backoff with jitter prevent Thundering Herd on client reconnection?"
    ],
    estimated_minutes: 10
  });

  addQ({
    id: "ws-06",
    skill_slug: "websockets-sse",
    skill_name: "WebSockets and Server-Sent Events",
    skill_category: "api-and-integration",
    topic: "WebSocket handshake and lifecycle",
    subtopic: "STOMP Protocol over WebSockets",
    question_title: "What is STOMP over WebSockets, and how is it used in Spring Boot?",
    question_prompt: "Why use STOMP (Simple Text Oriented Messaging Protocol) on top of raw WebSockets? Explain @MessageMapping, @SendTo, destination prefixes (/app vs /topic), and Spring's SimpMessagingTemplate.",
    question_type: "coding",
    difficulty: "intermediate",
    priority: "high",
    expected_answer_points: [
      "Raw WebSocket limitation: Raw WebSockets are just an empty byte pipe without routing, topics, or pub/sub message semantics.",
      "STOMP: Lightweight framing protocol adding commands (CONNECT, SUBSCRIBE, SEND, MESSAGE) and headers (destination: /topic/chat).",
      "Spring Boot integration: @EnableWebSocketMessageBroker configures STOMP endpoint with SockJS fallback.",
      "@MessageMapping('/chat.send'): Routes incoming messages to controller methods.",
      "@SendTo('/topic/public'): Broadcasts method return values to all subscribed clients.",
      "SimpMessagingTemplate: Injected service to push messages programmatically to topics or specific users (/user/{username}/queue/notifications)."
    ],
    sample_answer: "Raw WebSockets only transmit arbitrary bytes without standard conventions for topics or message destinations. STOMP runs on top of WebSockets to provide message broker semantics (SUBSCRIBE, SEND, destination headers). In Spring Boot, STOMP integrates seamlessly: controllers use @MessageMapping to handle inbound frames and @SendTo to broadcast, while services use SimpMessagingTemplate to push messages directly to specific user channels.",
    follow_up_questions: [
      "What is SockJS and how does it provide fallbacks when WebSockets are blocked by corporate firewalls?",
      "How does Spring connect to an external full STOMP broker (RabbitMQ/ActiveMQ) instead of its in-memory message broker?"
    ],
    estimated_minutes: 12
  });

  addQ({
    id: "ws-07",
    skill_slug: "websockets-sse",
    skill_name: "WebSockets and Server-Sent Events",
    skill_category: "api-and-integration",
    topic: "Scaling real-time connections",
    subtopic: "Securing Real-Time Connections",
    question_title: "How do you authenticate and secure WebSocket and SSE connections?",
    question_prompt: "Why can't custom Authorization headers be sent with the browser native WebSocket API or EventSource? Explain passing tokens via query parameter vs ticket/cookie patterns, and CSRF risks.",
    question_type: "practical_scenario",
    difficulty: "advanced",
    priority: "high",
    expected_answer_points: [
      "Browser limitation: The browser JavaScript WebSocket API and EventSource API do not permit setting custom HTTP request headers (like Authorization: Bearer <token>) during connection handshake.",
      "Anti-pattern: Passing JWT in query string (?token=...) leaks tokens into web server access logs, browser history, and proxy traces.",
      "Recommended Pattern 1: HttpOnly Secure SameSite cookies (automatically attached by browser during handshake).",
      "Recommended Pattern 2: Single-use Ticket Pattern: Client makes an authenticated REST POST /ws-auth to get a short-lived (60s) random ticket UUID, then connects to wss://.../?ticket=UUID which is validated and burned on connect.",
      "CSWSH (Cross-Site WebSocket Hijacking): Attacker site opens WebSocket connection to victim application; mitigated by checking Origin header strictly."
    ],
    sample_answer: "The browser WebSocket and EventSource APIs cannot send custom Authorization headers. Passing JWTs in query parameters is a security risk because tokens get recorded in proxy logs. The recommended approach is either using HttpOnly SameSite cookies, or the Ticket Pattern: the client requests a short-lived (60-second) single-use ticket via an authenticated REST call, then connects with wss://api.example.com?ticket=xyz. To prevent Cross-Site WebSocket Hijacking (CSWSH), the server must strictly validate the Origin header.",
    follow_up_questions: [
      "What is Cross-Site WebSocket Hijacking (CSWSH) and how does validating the Origin header prevent it?",
      "How do you authenticate users inside STOMP CONNECT frames?"
    ],
    estimated_minutes: 12
  });

  // --- JWT AND TOKEN AUTHENTICATION (10) ---
  addQ({
    id: "jwt-01",
    skill_slug: "jwt",
    skill_name: "JWT and Token Authentication",
    skill_category: "api-and-integration",
    topic: "JWT structure and signing",
    subtopic: "JWT Anatomy: Header, Payload, Signature",
    question_title: "Explain the anatomical structure of a JSON Web Token (JWT).",
    question_prompt: "Walk through the three base64url-encoded parts of a JWT: Header (algorithm, typ), Payload (registered, public, private claims), and Signature. How is the signature computed?",
    question_type: "conceptual",
    difficulty: "beginner",
    priority: "critical",
    expected_answer_points: [
      "Format: Three Base64URL-encoded strings separated by dots: header.payload.signature.",
      "Header: JSON specifying metadata e.g. {\"alg\": \"HS256\", \"typ\": \"JWT\"}.",
      "Payload: JSON containing claims. Registered claims: iss (issuer), sub (subject/user_id), exp (expiration time), nbf (not before), iat (issued at). Custom claims: roles, email.",
      "Signature: Computed by hashing header + '.' + payload using secret key: HMACSHA256(base64Url(header) + '.' + base64Url(payload), secret).",
      "Crucial security concept: Base64URL encoding is NOT encryption. Anyone can decode and read the payload; the signature only guarantees integrity/tamper-proofing."
    ],
    sample_answer: "A JWT consists of three Base64URL-encoded sections separated by dots: Header, Payload, and Signature. The Header defines the algorithm (e.g. HS256) and token type. The Payload contains claims (like sub, exp, and roles). The Signature is generated by taking the encoded header and payload, combining them with a dot, and hashing them with a secret key or private key. Note that Base64URL is encoding, not encryption; anyone can read the claims, but any alteration invalidates the signature.",
    follow_up_questions: [
      "Why must sensitive secrets (like raw credit card numbers or passwords) never be placed in a JWT payload?",
      "What is the difference between Base64 and Base64URL encoding?"
    ],
    estimated_minutes: 10
  });

  addQ({
    id: "jwt-02",
    skill_slug: "jwt",
    skill_name: "JWT and Token Authentication",
    skill_category: "api-and-integration",
    topic: "JWT structure and signing",
    subtopic: "Symmetric (HMAC) vs Asymmetric (RSA/ECDSA) Signing",
    question_title: "Compare Symmetric (HS256) and Asymmetric (RS256/ES256) signing algorithms in JWT.",
    question_prompt: "When should you use HS256 versus RS256 or ES256? How does asymmetric signing allow multiple downstream microservices to verify tokens without sharing the private signing key?",
    question_type: "conceptual",
    difficulty: "intermediate",
    priority: "critical",
    expected_answer_points: [
      "Symmetric (HS256): Uses a single shared secret key for BOTH signing and verification. Simple and fast, but every microservice that validates the token must possess the secret. If one service is compromised, an attacker can forge valid tokens for all services.",
      "Asymmetric (RS256 / ES256): Uses a public/private key pair. Auth server signs token using the Private Key. Downstream microservices verify using the Public Key.",
      "Security benefit: Downstream services only hold the public key; they can verify tokens safely but cannot forge them.",
      "JWKS (JSON Web Key Sets): Public keys are published over HTTP (.well-known/jwks.json), enabling seamless key rotation.",
      "ES256 (Elliptic Curve): Smaller signatures and faster cryptographic operations than RSA at equivalent security levels."
    ],
    sample_answer: "Symmetric signing (HS256) uses a single shared secret to both sign and verify tokens, which creates a security hazard in microservices because sharing the secret allows any service to forge tokens. Asymmetric signing (RS256/ES256) uses a public/private key pair: the central authorization service signs tokens with its private key, while downstream microservices verify signatures using only the public key. This prevents token forgery even if a microservice is breached.",
    follow_up_questions: [
      "What is the 'alg: none' vulnerability and how do modern libraries protect against it?",
      "How does key rotation work using the 'kid' (Key ID) header in a JWT?"
    ],
    estimated_minutes: 12
  });

  addQ({
    id: "jwt-03",
    skill_slug: "jwt",
    skill_name: "JWT and Token Authentication",
    skill_category: "api-and-integration",
    topic: "Secure storage and common vulnerabilities",
    subtopic: "Token Storage: LocalStorage vs HttpOnly Cookie",
    question_title: "Where should JWTs be stored on the client: LocalStorage vs HttpOnly Cookies?",
    question_prompt: "Compare storing JWTs in localStorage versus HttpOnly, Secure, SameSite cookies. How do Cross-Site Scripting (XSS) and Cross-Site Request Forgery (CSRF) impact this decision?",
    question_type: "practical_scenario",
    difficulty: "intermediate",
    priority: "critical",
    expected_answer_points: [
      "localStorage: Vulnerable to XSS (Cross-Site Scripting). Any malicious script injected via an npm dependency or unsanitized input can execute `localStorage.getItem('token')` and exfiltrate the token to an attacker server.",
      "HttpOnly Cookies: Completely inaccessible to JavaScript (document.cookie cannot read it), eliminating XSS token theft.",
      "CSRF risk with cookies: Browsers automatically attach cookies to cross-origin requests. Mitigated by setting `SameSite=Strict` or `SameSite=Lax` and implementing CSRF tokens for mutating actions.",
      "Production best practice: Store access token in memory (or short-lived HttpOnly cookie) and long-lived refresh token in an HttpOnly, Secure, SameSite=Strict cookie."
    ],
    sample_answer: "Storing JWTs in localStorage is dangerous because any Cross-Site Scripting (XSS) vulnerability allows malicious JavaScript to steal the token. HttpOnly cookies cannot be read by JavaScript, completely neutralizing token theft via XSS. While cookies can be vulnerable to CSRF, this is mitigated by configuring SameSite=Strict or SameSite=Lax flags along with custom headers. The secure standard is storing long-lived refresh tokens in HttpOnly, Secure cookies and keeping short-lived access tokens in memory.",
    follow_up_questions: [
      "What is the purpose of the 'Secure' cookie flag?",
      "What happens to in-memory access tokens when a user refreshes the browser page?"
    ],
    estimated_minutes: 12
  });

  addQ({
    id: "jwt-04",
    skill_slug: "jwt",
    skill_name: "JWT and Token Authentication",
    skill_category: "api-and-integration",
    topic: "Expiry, rotation and revocation",
    subtopic: "Token Revocation Strategies (Blacklisting)",
    question_title: "How do you invalidate or revoke stateless JWTs before their expiration date?",
    question_prompt: "Because JWT verification is stateless, how do you handle user logout, password resets, or account compromises? Compare Redis token blacklists, token versioning, and short token lifespans.",
    question_type: "practical_scenario",
    difficulty: "intermediate",
    priority: "high",
    expected_answer_points: [
      "The paradox: A JWT is valid until its 'exp' timestamp expires, regardless of whether user logged out or changed password.",
      "Strategy 1 (Short expiry): Keep access tokens very short (5-15 mins). Revocation happens naturally as tokens expire quickly; revoke the refresh token in database on logout.",
      "Strategy 2 (Redis Blacklist): Store revoked token's 'jti' (JWT ID) in Redis with TTL equal to remaining token lifespan. Verification filter checks Redis (reintroduces state, but fast).",
      "Strategy 3 (Token Version / user_epoch): Store a 'token_version' or 'password_changed_at' integer on the user DB record and in the JWT claim. When password changes, increment user version. If token version != DB version, reject token."
    ],
    sample_answer: "Stateless JWTs remain valid until their expiration claim. To invalidate them early: 1) Issue short-lived access tokens (15 mins) and revoke the refresh token in the database upon logout. 2) For immediate revocation, maintain a Redis blocklist of revoked token IDs ('jti') with a TTL matching the token's remaining time. 3) For account-wide revocation (like password changes), store a 'token_version' counter in the user record and token; incrementing it invalidates all previously issued tokens instantly.",
    follow_up_questions: [
      "What is the 'jti' (JWT ID) claim and why is it essential for blacklisting?",
      "Why is storing every active JWT in a database an anti-pattern that defeats the purpose of stateless tokens?"
    ],
    estimated_minutes: 12
  });

  addQ({
    id: "jwt-05",
    skill_slug: "jwt",
    skill_name: "JWT and Token Authentication",
    skill_category: "api-and-integration",
    topic: "Access and refresh token flow",
    subtopic: "Silent Refresh Pattern in Single Page Applications",
    question_title: "How does the Silent Token Refresh pattern work in React/Next.js Single Page Applications?",
    question_prompt: "Explain how SPAs refresh expired access tokens seamlessly without logging the user out or interrupting the user experience. How do HTTP interceptors (Axios / fetch wrappers) queue requests during a refresh?",
    question_type: "coding",
    difficulty: "intermediate",
    priority: "high",
    expected_answer_points: [
      "Workflow: Access token expires (HTTP 401 response from API).",
      "Axios/fetch interceptor catches 401 error.",
      "Interceptor queues incoming API requests while calling /api/auth/refresh (which sends the HttpOnly refresh token cookie).",
      "Once refresh endpoint returns a new access token, update the in-memory token.",
      "Replay all queued requests with the new access token and return responses to callers transparently.",
      "If refresh itself fails (refresh token expired/revoked), redirect to /login."
    ],
    sample_answer: "When an in-memory access token expires, the backend returns HTTP 401. An HTTP client interceptor catches the 401, pauses concurrent requests in a queue, and triggers a single call to /auth/refresh (which automatically includes the HttpOnly refresh cookie). Upon receiving a new access token, the interceptor updates the token, replays all queued requests with the updated Authorization header, and resumes application flow seamlessly without user disruption.",
    follow_up_questions: [
      "How do you prevent multiple simultaneous API calls from triggering multiple duplicate refresh token requests?",
      "What happens if the user opens the application in multiple browser tabs simultaneously?"
    ],
    estimated_minutes: 12
  });

  addQ({
    id: "jwt-06",
    skill_slug: "jwt",
    skill_name: "JWT and Token Authentication",
    skill_category: "api-and-integration",
    topic: "Secure storage and common vulnerabilities",
    subtopic: "Common JWT Security Attacks & Mitigations",
    question_title: "Explain common JWT vulnerabilities: Algorithm Confusion and Weak HMAC Secrets.",
    question_prompt: "What is an Algorithm Confusion attack (switching RS256 to HS256)? How do dictionary attacks crack weak HMAC secrets with hashcat, and how do you enforce cryptographically secure keys?",
    question_type: "conceptual",
    difficulty: "advanced",
    priority: "high",
    expected_answer_points: [
      "Algorithm Confusion (Key Confusion): Attacker takes a server expecting RS256, changes header to {\"alg\": \"HS256\"}, and signs token using the server's PUBLIC key as the HMAC secret. Flawed server libraries verify HMAC using the public key string, granting the attacker full signature forgery. Mitigation: Explicitly configure allowed verification algorithms; never trust the algorithm in the token header.",
      "Weak HMAC Secret: If HMAC-SHA256 secret is short or common ('secret123'), offline attackers can capture a token and brute-force the secret using tools like Hashcat or John the Ripper at billions of guesses per second.",
      "Mitigation: Secrets must be generated using cryptographically secure random number generators with at least 256 bits (32 bytes) of entropy."
    ],
    sample_answer: "In an Algorithm Confusion attack, an attacker alters a token header from RS256 to HS256 and signs it using the server's public key as an HMAC secret. If the backend blindly trusts the header algorithm, it verifies the HMAC against the public key file and accepts the forged token. Mitigate by hardcoding expected algorithms in code. Weak secrets also allow offline brute-force cracking via GPU tools like Hashcat, requiring keys to be at least 256 bits of high-entropy randomness.",
    follow_up_questions: [
      "Why must JWT verification libraries always specify an explicit algorithms whitelist (e.g. algorithms: ['RS256'])?",
      "What is the 'none' algorithm attack and why did early JWT implementations allow it?"
    ],
    estimated_minutes: 12
  });

  addQ({
    id: "jwt-07",
    skill_slug: "jwt",
    skill_name: "JWT and Token Authentication",
    skill_category: "api-and-integration",
    topic: "JWT structure and signing",
    subtopic: "Standard Claims Validation",
    question_title: "How do you properly validate standard JWT claims: exp, nbf, iss, and aud?",
    question_prompt: "Explain how verifying a JWT requires more than just checking its cryptographic signature. What are the roles of 'exp' (expiry), 'nbf' (not before), 'iss' (issuer), and 'aud' (audience), and what is clock skew tolerance?",
    question_type: "coding",
    difficulty: "beginner",
    priority: "high",
    expected_answer_points: [
      "Signature verification only proves the payload was not tampered with; claims must be explicitly validated.",
      "exp (Expiration Time): Token must be rejected if current time >= exp.",
      "nbf (Not Before): Token must be rejected if current time < nbf.",
      "iss (Issuer): Validates that the token was minted by a trusted identity provider (e.g. https://auth.mycompany.com).",
      "aud (Audience): Validates that the token was intended for THIS specific recipient service (e.g. 'order-api'), preventing token substitution from other apps.",
      "Clock Skew (Leeway): Small time allowance (e.g. 30-60 seconds) to account for slight server time drift between servers."
    ],
    sample_answer: "A valid signature only confirms integrity; claims must be checked before trusting the token. The 'exp' claim enforces expiration; 'nbf' ensures the token is not used before its active date; 'iss' checks that the token originated from an authorized issuer; and 'aud' ensures the token was intended for this specific service. Libraries allow configuring clock skew leeway (e.g. 60 seconds) to tolerate minor NTP time differences between distributed servers.",
    follow_up_questions: [
      "Why can accepting tokens without verifying the 'aud' claim expose an API to cross-service token misuse?",
      "What is the difference between 'sub' and custom user identifier claims?"
    ],
    estimated_minutes: 10
  });

  addQ({
    id: "jwt-08",
    skill_slug: "jwt",
    skill_name: "JWT and Token Authentication",
    skill_category: "api-and-integration",
    topic: "Access and refresh token flow",
    subtopic: "OAuth 2.0 / OIDC Flow Overview",
    question_title: "Explain the OAuth 2.0 Authorization Code Flow with PKCE.",
    question_prompt: "Walk through the Authorization Code Flow with Proof Key for Code Exchange (PKCE) used by Single Page Applications and Mobile apps. Why is PKCE mandatory for public clients?",
    question_type: "conceptual",
    difficulty: "advanced",
    priority: "critical",
    expected_answer_points: [
      "Public clients (SPAs, mobile apps) cannot securely hold a client_secret.",
      "PKCE mechanism: 1) Client generates random code_verifier and computes code_challenge = SHA256(code_verifier).",
      "2) Client redirects to Auth Server passing code_challenge and method=S256.",
      "3) User logs in; Auth server redirects to client with authorization code.",
      "4) Client exchanges authorization code AND code_verifier for tokens at /oauth/token.",
      "5) Auth server computes SHA256(code_verifier) and compares with stored code_challenge. If matched, issues tokens.",
      "Prevents authorization code interception attacks."
    ],
    sample_answer: "Public clients like React SPAs cannot keep a client secret secure. The Authorization Code Flow with PKCE (Proof Key for Code Exchange) protects them. The client generates a random 'code_verifier' and sends its SHA-256 hash ('code_challenge') with the initial login request. After user authentication, the authorization code is returned to the client. When exchanging the code for tokens, the client provides the raw 'code_verifier'. The authorization server hashes it to verify ownership, preventing intercepted authorization codes from being redeemed by attackers.",
    follow_up_questions: [
      "Why was the OAuth 2.0 Implicit Flow deprecated in favor of Authorization Code with PKCE?",
      "What is the difference between an ID Token (OIDC) and an Access Token (OAuth 2.0)?"
    ],
    estimated_minutes: 15
  });

  addQ({
    id: "jwt-09",
    skill_slug: "jwt",
    skill_name: "JWT and Token Authentication",
    skill_category: "api-and-integration",
    topic: "JWT structure and signing",
    subtopic: "JWKS (JSON Web Key Set) Endpoint",
    question_title: "How does the JWKS (.well-known/jwks.json) endpoint enable zero-downtime key rotation?",
    question_prompt: "Explain the structure of a JWKS document: keys array containing kty, kid, use, alg, n, e. How do resource servers cache public keys and fetch new keys when a token presents an unknown kid?",
    question_type: "conceptual",
    difficulty: "intermediate",
    priority: "high",
    expected_answer_points: [
      "JWKS is a standard JSON endpoint exposing an array of public cryptographic keys.",
      "Fields: 'kid' (Key ID matching the kid in the JWT header), 'kty' (Key Type e.g. RSA), 'alg' (RS256), 'n' (modulus), 'e' (exponent).",
      "Zero-downtime rotation: Auth server generates new key pair with a new kid and adds public key to JWKS alongside the old key.",
      "Caching: Resource servers cache the JWKS in memory. When a JWT arrives with a new kid not in cache, the resource server refreshes the JWKS from the endpoint.",
      "After all old tokens expire, the old key is decommissioned from JWKS."
    ],
    sample_answer: "A JWKS endpoint (.well-known/jwks.json) publishes public keys formatted in JSON, each identified by a 'kid' (Key ID). When validating a JWT, the resource server matches the token header's kid to a cached key in its JWKS cache. For key rotation, the identity provider publishes a new public key alongside the old key and starts signing new tokens with the new key. Resource servers fetch the updated keys dynamically upon seeing an unknown kid, enabling seamless key rotation without restarts.",
    follow_up_questions: [
      "How do resource servers protect themselves against JWKS endpoint cache exhaustion or DoS attacks?",
      "What is the difference between JWK, JWKS, and PEM format?"
    ],
    estimated_minutes: 12
  });

  addQ({
    id: "jwt-10",
    skill_slug: "jwt",
    skill_name: "JWT and Token Authentication",
    skill_category: "api-and-integration",
    topic: "Secure storage and common vulnerabilities",
    subtopic: "Stateless JWT vs Stateful Server Sessions",
    question_title: "Compare Stateless JWTs versus Stateful Server Sessions (Redis/Database).",
    question_prompt: "Evaluate the architectural trade-offs between Stateless JWTs and Stateful Sessions with session IDs. When is a hybrid approach best?",
    question_type: "conceptual",
    difficulty: "intermediate",
    priority: "medium",
    expected_answer_points: [
      "Stateless JWT: No database lookup on requests, ideal for microservices and cross-domain APIs. Trade-offs: Cannot revoke easily, large payload headers (1KB+ per request), token compromise lasts until exp.",
      "Stateful Session: Server stores session state in Redis/DB; client carries small session ID cookie (32 bytes). Benefits: Instant revocation, easy concurrent session limits, tiny cookie size. Trade-offs: Requires centralized fast session store (Redis), database lookup on every request.",
      "Hybrid approach: Short-lived stateless access token (10 mins) + stateful refresh token stored in DB for instant session revocation and rotation."
    ],
    sample_answer: "Stateless JWTs eliminate database lookups on API calls and work seamlessly across decentralized microservices, but suffer from large HTTP header payloads and cannot be revoked easily before expiration. Stateful sessions store user state in Redis with a small cookie session ID, allowing instant logout, session tracking, and permission updates, but require a shared database hit per request. The hybrid pattern (short-lived stateless access tokens + stateful database refresh tokens) combines the best of both worlds.",
    follow_up_questions: [
      "Why does microservice architecture favor stateless JWTs at internal service boundaries?",
      "How does Redis cluster failover impact stateful session architectures?"
    ],
    estimated_minutes: 10
  });

  // --- POSTMAN (7) ---
  addQ({
    id: "postman-01",
    skill_slug: "postman",
    skill_name: "Postman",
    skill_category: "api-and-integration",
    topic: "Collections and environments",
    subtopic: "Environment vs Collection Variables",
    question_title: "How do you manage Environments and Variables in Postman?",
    question_prompt: "Explain the scope hierarchy of Postman variables: Global, Collection, Environment, Data (CSV/JSON), and Local. How do you parameterize baseUrl and auth tokens across Dev, QA, and Prod?",
    question_type: "practical_scenario",
    difficulty: "beginner",
    priority: "medium",
    expected_answer_points: [
      "Variable scope hierarchy (narrowest to broadest): Local -> Data -> Environment -> Collection -> Global.",
      "Environments: Configurable key-value sets (e.g. 'Development', 'Staging', 'Production'). Allows switching active environment with 1 click to retarget {{baseUrl}}.",
      "Collection variables: Scoped to a specific collection; travel with the collection when exported or shared.",
      "Initial vs Current values: 'Initial value' is synced to team workspace; 'Current value' is local to your machine, keeping personal API keys and passwords private."
    ],
    sample_answer: "Postman variables follow a scope hierarchy from Local up to Global. Environments allow parameterizing variables like {{baseUrl}} across Dev, Staging, and Prod. A critical security feature is the distinction between Initial Value (synced to cloud/shared workspace) and Current Value (persisted only locally on your machine), which prevents leaking secret API credentials when sharing collections with team members.",
    follow_up_questions: [
      "How do you access and set variables dynamically using JavaScript in Postman tests (pm.environment.set)?",
      "Why should production credentials never be saved in variable Initial Values?"
    ],
    estimated_minutes: 10
  });

  addQ({
    id: "postman-02",
    skill_slug: "postman",
    skill_name: "Postman",
    skill_category: "api-and-integration",
    topic: "Pre-request and test scripts",
    subtopic: "Automated Test Scripts in Postman",
    question_title: "How do you write automated assertions and test scripts using pm.test()?",
    question_prompt: "Explain how to write assertion scripts in the 'Tests' tab using Chai assertions (pm.response.to.have.status(200), pm.expect(jsonData.id).to.eql(1)). How do you extract response tokens to environment variables?",
    question_type: "coding",
    difficulty: "intermediate",
    priority: "high",
    expected_answer_points: [
      "Execution timing: Tests tab executes automatically immediately after the HTTP response is received.",
      "pm.test('Status is 200', function() { pm.response.to.have.status(200); });",
      "Parsing JSON: const res = pm.response.json(); pm.expect(res.name).to.eql('John');",
      "Chaining auth tokens: pm.environment.set('accessToken', res.data.token);",
      "Response time assertions: pm.expect(pm.response.responseTime).to.be.below(500);"
    ],
    sample_answer: "Postman's Tests tab executes after an HTTP response. Using the pm.test() function backed by Chai assertions, you assert status codes (pm.response.to.have.status(200)), response time, and payload properties (pm.expect(res.data.id).to.be.a('string')). To chain authenticated requests, extract the token from the response (pm.environment.set('token', res.token)), allowing subsequent requests in the collection to authenticate automatically via {{token}}.",
    follow_up_questions: [
      "What is the difference between to.equal and to.eql in Chai assertions?",
      "How do you validate a response against a full JSON schema using tv4 or Ajv inside Postman?"
    ],
    estimated_minutes: 10
  });

  addQ({
    id: "postman-03",
    skill_slug: "postman",
    skill_name: "Postman",
    skill_category: "api-and-integration",
    topic: "Pre-request and test scripts",
    subtopic: "Pre-Request Scripts & Dynamic Signatures",
    question_title: "How do Pre-Request Scripts work in Postman?",
    question_prompt: "What is the Pre-request Script tab, and when does it execute? Walk through generating dynamic timestamps, random UUIDs, or computing HMAC-SHA256 signatures before sending an API request.",
    question_type: "coding",
    difficulty: "intermediate",
    priority: "medium",
    expected_answer_points: [
      "Execution: Runs BEFORE the HTTP request is constructed and dispatched.",
      "Use case 1: Dynamic data generation using built-in variables ({{$guid}}, {{$timestamp}}, {{$randomEmail}}).",
      "Use case 2: Computing cryptographic authentication signatures using CryptoJS (built into Postman sandbox): const signature = CryptoJS.HmacSHA256(message, secret).toString(); pm.environment.set('sig', signature);",
      "Use case 3: Refreshing an OAuth token before calling the endpoint if expired."
    ],
    sample_answer: "Pre-request scripts execute before the HTTP request is dispatched. They are used to prepare request data, compute dynamic authentication headers, or generate test values. For instance, APIs requiring an HMAC signature can use Postman's built-in CryptoJS library in a pre-request script to hash the request body with a timestamp and secret key, saving the resulting hash to a variable used in the Authorization header.",
    follow_up_questions: [
      "How do you inspect console.log statements generated by Pre-request and Test scripts in the Postman Console?",
      "Can pre-request scripts send secondary HTTP requests using pm.sendRequest()?"
    ],
    estimated_minutes: 10
  });

  addQ({
    id: "postman-04",
    skill_slug: "postman",
    skill_name: "Postman",
    skill_category: "api-and-integration",
    topic: "API debugging and automated collection runs",
    subtopic: "Newman CLI for CI/CD Integration",
    question_title: "How do you run Postman Collections in CI/CD pipelines using Newman?",
    question_prompt: "Explain Newman CLI (newman run collection.json -e environment.json). How does it generate test reports (HTML, JUnit, CLI) and integrate into GitHub Actions or GitLab CI?",
    question_type: "practical_scenario",
    difficulty: "intermediate",
    priority: "high",
    expected_answer_points: [
      "Newman: Node.js-based command-line Collection Runner for Postman.",
      "Execution command: newman run my_collection.json -e my_env.json --reporters cli,junit --reporter-junit-export results.xml.",
      "CI/CD Integration: Runs in GitHub Actions, GitLab CI, or Jenkins. If any pm.test() assertion fails, Newman exits with non-zero exit code (1), automatically failing the CI pipeline.",
      "Data-driven testing: Accepts CSV/JSON data files via -d flag to execute collections against hundreds of test scenarios."
    ],
    sample_answer: "Newman is Postman's headless CLI runner. It executes exported collection and environment JSON files directly in CI/CD pipelines (newman run collection.json -e env.json). It executes all pre-request scripts and assertions, generating JUnit XML or HTML reports. If any test assertion fails, Newman terminates with exit code 1, automatically failing the build pipeline and preventing broken API regressions from reaching production.",
    follow_up_questions: [
      "How do you securely pass secret environment variables to Newman in CI without checking secrets into Git?",
      "How do you run Newman using its official Docker container?"
    ],
    estimated_minutes: 10
  });

  addQ({
    id: "postman-05",
    skill_slug: "postman",
    skill_name: "Postman",
    skill_category: "api-and-integration",
    topic: "Auth and variables",
    subtopic: "Collection-Level Authentication",
    question_title: "How does Collection-Level Authentication simplify API testing in Postman?",
    question_prompt: "Explain how setting Bearer Token or OAuth 2.0 at the Collection root enables 'Inherit auth from parent' across dozens of child folders and requests.",
    question_type: "conceptual",
    difficulty: "beginner",
    priority: "medium",
    expected_answer_points: [
      "Problem: Manually configuring headers on 50 separate endpoints creates duplication and maintenance headaches when tokens rotate.",
      "Collection-level Auth: Configure authorization once at the collection root (Type: Bearer Token, Token: {{accessToken}}).",
      "Child requests default to 'Inherit auth from parent'.",
      "Overriding: Endpoints that are public (e.g. POST /login or GET /health) can override Auth to 'No Auth'.",
      "OAuth 2.0 helper: Postman has built-in OAuth 2.0 client that automates token retrieval and auto-refreshes."
    ],
    sample_answer: "Collection-level authentication configures auth credentials once at the root collection level. All child folders and requests set to 'Inherit auth from parent' automatically inherit the authorization headers without duplicating configuration across individual requests. Public endpoints like /login or /health can explicitly opt out by selecting 'No Auth'.",
    follow_up_questions: [
      "How does Postman's built-in OAuth 2.0 client handle token generation with callback URLs?",
      "What is the difference between setting auth via the Authorization tab vs manually adding an 'Authorization' header in Headers tab?"
    ],
    estimated_minutes: 8
  });

  addQ({
    id: "postman-06",
    skill_slug: "postman",
    skill_name: "Postman",
    skill_category: "api-and-integration",
    topic: "API debugging and automated collection runs",
    subtopic: "Postman Mock Servers",
    question_title: "How do Postman Mock Servers accelerate frontend and backend parallel development?",
    question_prompt: "Explain how Postman Mock Servers simulate backend API responses before the actual backend is coded. How do example responses and matching rules return mock data?",
    question_type: "practical_scenario",
    difficulty: "beginner",
    priority: "medium",
    expected_answer_points: [
      "Parallel development: Frontend engineers can start coding immediately against a live cloud mock URL while backend engineers develop the real services.",
      "How it works: Define request in collection -> Save an 'Example' response (status 200, mock JSON body).",
      "Create Mock Server: Postman assigns a public or private URL (https://xxxx.mock.pstmn.io).",
      "Matching algorithm: Postman matches incoming requests by method, path, headers, and query parameters to the best saved Example response.",
      "Error simulation: Mock servers can return 400, 500, or delayed latency to test frontend error handling."
    ],
    sample_answer: "Postman Mock Servers provide cloud endpoints that simulate backend APIs based on saved request examples. Frontend developers can immediately bind UI components to mock URLs while backend developers build the services. Postman matches request paths, headers, and query params to the appropriate saved example response, returning realistic data or simulated errors (404, 500) without writing any backend code.",
    follow_up_questions: [
      "How do you simulate network latency in Postman Mock Servers?",
      "What is the x-mock-response-code header used for in mock server requests?"
    ],
    estimated_minutes: 10
  });

  addQ({
    id: "postman-07",
    skill_slug: "postman",
    skill_name: "Postman",
    skill_category: "api-and-integration",
    topic: "API debugging and automated collection runs",
    subtopic: "Data-Driven Testing with CSV/JSON Files",
    question_title: "How do you execute Data-Driven Testing in Postman using external data files?",
    question_prompt: "Explain how to run a collection multiple times across hundreds of test rows using a CSV or JSON data file in Postman Collection Runner. How does the pm.iterationData object read test parameters?",
    question_type: "coding",
    difficulty: "intermediate",
    priority: "medium",
    expected_answer_points: [
      "Data-driven testing: Runs the collection in a loop, where each iteration consumes one row of an input file.",
      "File formats: CSV (first row defines variable names) or JSON (array of objects).",
      "Referencing: Use {{columnName}} directly in URL, headers, or body.",
      "Scripting access: pm.iterationData.get('columnName') inside Pre-request and Tests scripts.",
      "Use cases: Testing positive and negative validation cases (e.g. 50 invalid email formats to assert 400 Bad Request)."
    ],
    sample_answer: "In Postman Collection Runner, load a CSV or JSON file containing test cases. Each iteration binds one row of data to variables referenced via {{fieldName}} or accessed programmatically with pm.iterationData.get('fieldName'). This allows testing hundreds of boundary conditions, valid inputs, and negative validation error cases in seconds without duplicating requests in the collection.",
    follow_up_questions: [
      "How do you control request execution order dynamically using postman.setNextRequest()?",
      "How do you terminate a collection run early inside a test script?"
    ],
    estimated_minutes: 10
  });

  // --- SWAGGER / OPENAPI (6) ---
  addQ({
    id: "oas-01",
    skill_slug: "swagger-openapi",
    skill_name: "Swagger / OpenAPI",
    skill_category: "api-and-integration",
    topic: "OpenAPI schema basics",
    subtopic: "OpenAPI Specification (OAS 3.0) Structure",
    question_title: "Explain the anatomical structure of an OpenAPI 3.0 specification document.",
    question_prompt: "Walk through the top-level keys of an OpenAPI 3.0 YAML/JSON file: openapi, info, servers, paths, components (schemas, securitySchemes), and security.",
    question_type: "conceptual",
    difficulty: "beginner",
    priority: "high",
    expected_answer_points: [
      "openapi: Version string (e.g. '3.0.3' or '3.1.0').",
      "info: API metadata (title, version, description, contact, license).",
      "servers: Base URLs for API environments (dev, staging, prod) with variable templating.",
      "paths: Available endpoints (/users, /orders/{id}) and their supported operations (get, post).",
      "components: Reusable objects: 'schemas' (data models), 'securitySchemes' (JWT Bearer, OAuth2, APIKey), 'responses', 'parameters'.",
      "security: Global declaration of security requirements applied across paths."
    ],
    sample_answer: "An OpenAPI 3.0 document defines a machine-readable REST API contract. Its top-level structure includes: 'openapi' version; 'info' metadata; 'servers' base URLs; 'paths' defining endpoints, methods, parameters, and responses; 'components' holding reusable data schemas and security definitions; and 'security' applying authentication requirements across paths.",
    follow_up_questions: [
      "What is the difference between OpenAPI 3.0 and OpenAPI 3.1 (full JSON Schema alignment)?",
      "How does the $ref keyword enable modular, reusable schema references?"
    ],
    estimated_minutes: 10
  });

  addQ({
    id: "oas-02",
    skill_slug: "swagger-openapi",
    skill_name: "Swagger / OpenAPI",
    skill_category: "api-and-integration",
    topic: "API documentation and versioning",
    subtopic: "Code-First vs Design-First (Contract-First) API Development",
    question_title: "Compare Code-First vs Design-First (Contract-First) API development.",
    question_prompt: "When should you generate OpenAPI specs from code annotations (SpringDoc OpenAPI / Swagger annotations) vs writing the OpenAPI spec first and generating code with OpenAPI Generator?",
    question_type: "conceptual",
    difficulty: "intermediate",
    priority: "high",
    expected_answer_points: [
      "Code-First: Write Java/Spring controllers and annotate with @Operation, @ApiResponse. Library (springdoc-openapi) scans annotations at runtime/build time to generate openapi.json. Benefits: fast for single-stack internal teams, code and docs remain in sync. Downsides: couples API design to Java types, delays frontend team until backend code exists.",
      "Design-First (Contract-First): Write OpenAPI YAML spec first before writing any code. Benefits: True cross-team contract negotiation, frontend and backend develop in parallel using mock servers, client SDKs generated automatically via openapi-generator-cli. Downsides: requires tooling discipline to prevent code from drifting from spec.",
      "Enterprise standard: Design-first is favored for multi-team and public-facing APIs."
    ],
    sample_answer: "Code-First writes backend implementation code and generates OpenAPI docs via annotations (springdoc-openapi). It is convenient for small teams but couples API contracts to backend implementation details. Design-First authors the OpenAPI specification upfront before coding. This allows frontend and backend teams to review the contract, generate mock servers, and auto-generate client SDKs and server stubs using OpenAPI Generator, enabling parallel development.",
    follow_up_questions: [
      "How do openapi-generator Maven/Gradle plugins generate Spring server stubs from an OpenAPI YAML file?",
      "What is API contract drift and how can automated contract testing (Pact) prevent it?"
    ],
    estimated_minutes: 12
  });

  addQ({
    id: "oas-03",
    skill_slug: "swagger-openapi",
    skill_name: "Swagger / OpenAPI",
    skill_category: "api-and-integration",
    topic: "Request/response documentation",
    subtopic: "SpringDoc OpenAPI Integration in Spring Boot 3",
    question_title: "How do you integrate SpringDoc OpenAPI (Swagger UI) in Spring Boot 3?",
    question_prompt: "Explain springdoc-openapi-starter-webmvc-ui dependency. How do annotations (@Tag, @Operation, @ApiResponse, @Parameter, @Schema) customize endpoints, schemas, and Swagger UI at /swagger-ui/index.html?",
    question_type: "coding",
    difficulty: "intermediate",
    priority: "medium",
    expected_answer_points: [
      "Include dependency: springdoc-openapi-starter-webmvc-ui (replaces deprecated Springfox for Spring Boot 3).",
      "@Tag(name = 'Order Management', description = 'APIs for creating and managing orders'): Groups endpoints.",
      "@Operation(summary = 'Get order by ID', description = 'Returns full order details with line items'): Documents method.",
      "@ApiResponses({ @ApiResponse(responseCode = '200', description = 'Found'), @ApiResponse(responseCode = '404', description = 'Not Found') }).",
      "@Schema(description = 'Unique transaction identifier', example = 'ord_12345'): Documents DTO fields.",
      "Swagger UI path: Automatically available at http://localhost:8080/swagger-ui/index.html."
    ],
    sample_answer: "In Spring Boot 3, add springdoc-openapi-starter-webmvc-ui. Annotate controller classes with @Tag to organize groups, methods with @Operation to provide summaries, and @ApiResponse to document possible HTTP status codes. Use @Schema on DTO fields to define human-readable descriptions, constraints, and realistic example values. SpringDoc automatically exposes interactive documentation at /swagger-ui/index.html and raw JSON at /v3/api-docs.",
    follow_up_questions: [
      "Why should Swagger UI be disabled in production environments (springdoc.swagger-ui.enabled=false)?",
      "How do you configure JWT Bearer authentication globally in Swagger UI using an OpenAPI @Bean?"
    ],
    estimated_minutes: 12
  });

  addQ({
    id: "oas-04",
    skill_slug: "swagger-openapi",
    skill_name: "Swagger / OpenAPI",
    skill_category: "api-and-integration",
    topic: "OpenAPI schema basics",
    subtopic: "Security Schemes in OpenAPI",
    question_title: "How do you configure JWT Bearer and OAuth 2.0 Security Schemes in OpenAPI 3.0?",
    question_prompt: "Write the YAML components.securitySchemes configuration for a JWT Bearer token and an OAuth2 authorizationCode flow with scopes.",
    question_type: "coding",
    difficulty: "intermediate",
    priority: "medium",
    expected_answer_points: [
      "JWT Bearer definition: components: securitySchemes: bearerAuth: type: http, scheme: bearer, bearerFormat: JWT.",
      "OAuth2 definition: securitySchemes: oauth2Auth: type: oauth2, flows: authorizationCode: authorizationUrl: ..., tokenUrl: ..., scopes: { read: 'Read data', write: 'Write data' }.",
      "Applying security globally: security: - bearerAuth: [].",
      "In Swagger UI: Adds the 'Authorize' button allowing developers to paste tokens and make authenticated requests directly from the browser."
    ],
    sample_answer: "Define security schemes under components.securitySchemes. For JWT Bearer: set type: http, scheme: bearer, bearerFormat: JWT. For OAuth2: specify type: oauth2 with flows (authorizationCode) providing authorizationUrl, tokenUrl, and required scopes. Apply the scheme globally under root 'security: [{ bearerAuth: [] }]' or per-operation. This enables the 'Authorize' padlock button in Swagger UI, allowing developers to test protected APIs with live credentials.",
    follow_up_questions: [
      "How do you document API Key authentication passed via an X-API-KEY header in OpenAPI?",
      "Can an endpoint specify multiple alternative security schemes (OR condition vs AND condition)?"
    ],
    estimated_minutes: 10
  });

  addQ({
    id: "oas-05",
    skill_slug: "swagger-openapi",
    skill_name: "Swagger / OpenAPI",
    skill_category: "api-and-integration",
    topic: "Schema validation",
    subtopic: "Schema Composition: oneOf, anyOf, allOf",
    question_title: "Explain Schema Composition in OpenAPI: oneOf, anyOf, and allOf.",
    question_prompt: "What is the difference between oneOf (exclusive polymorphic union), anyOf, and allOf (inheritance/intersection) in OpenAPI schemas? How does a discriminator object enable polymorphic deserialization?",
    question_type: "conceptual",
    difficulty: "advanced",
    priority: "medium",
    expected_answer_points: [
      "allOf: Combines multiple schemas into one (equivalent to inheritance or intersection &). Merges fields from BaseEntity and UserEntity.",
      "oneOf: Validates that the data matches EXACTLY ONE of the specified subschemas (polymorphic union, e.g. PaymentMethod is CreditCard OR PayPal, never both).",
      "anyOf: Validates that data matches at least one subschema (can match multiple).",
      "discriminator: Used with oneOf/anyOf to define a differentiating property name (e.g. propertyName: 'type') and explicit schema mapping, enabling code generators to create polymorphic class hierarchies."
    ],
    sample_answer: "OpenAPI composition operators combine schemas: 'allOf' merges schemas to model inheritance or intersection. 'oneOf' represents a strict union where a payload must validate against exactly one subschema (e.g. Dog OR Cat). 'anyOf' allows matching one or more subschemas. The 'discriminator' object defines a key field (like 'type') that code generators use to instantiate the correct polymorphic subtype dynamically.",
    follow_up_questions: [
      "How does openapi-generator translate oneOf into Java or TypeScript interfaces?",
      "What is the difference between nullable: true (OAS 3.0) and type: ['string', 'null'] (OAS 3.1)?"
    ],
    estimated_minutes: 10
  });

  addQ({
    id: "oas-06",
    skill_slug: "swagger-openapi",
    skill_name: "Swagger / OpenAPI",
    skill_category: "api-and-integration",
    topic: "API documentation and versioning",
    subtopic: "Automated Client SDK Generation",
    question_title: "How do you generate type-safe Client SDKs from an OpenAPI specification?",
    question_prompt: "Explain how openapi-generator-cli generates client SDKs for TypeScript (Axios/Fetch) or Java (WebClient). How does this eliminate manual API client writing in frontend applications?",
    question_type: "practical_scenario",
    difficulty: "intermediate",
    priority: "medium",
    expected_answer_points: [
      "Tooling: openapi-generator-cli (Docker, npm, or Maven plugin).",
      "Command: npx @openapitools/openapi-generator-cli generate -i openapi.yaml -g typescript-axios -o src/api-client.",
      "Benefits: Automatically generates all TypeScript interfaces, DTOs, query parameters, and API service classes directly from the contract.",
      "Eliminates boilerplate: Frontend developers import typed functions (api.orders.getOrderById(id)) with full autocompletion and compile-time type safety.",
      "Breaks build on mismatch: If the backend removes or modifies a field in the OpenAPI spec, re-running generator causes immediate TypeScript compilation errors in the frontend."
    ],
    sample_answer: "Using openapi-generator-cli, teams generate type-safe client libraries from the OpenAPI spec for languages like TypeScript, Java, or Python. Running the generator produces strongly-typed API classes, models, and request functions. Frontend developers call methods with full IDE autocompletion and parameter validation without writing manual fetch wrappers. If the API contract changes, re-running the generator immediately highlights compile errors in the frontend.",
    follow_up_questions: [
      "How do you automate client SDK generation in a Git monorepo during pre-commit or CI build?",
      "What is Orval and how does it generate React Query / TanStack Query hooks from OpenAPI specs?"
    ],
    estimated_minutes: 10
  });
};
