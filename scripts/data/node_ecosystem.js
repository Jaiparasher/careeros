// Node.js Ecosystem questions: 15 total
// nodejs (8), expressjs (7)
module.exports = function(addQ) {
  // --- NODE.JS (8) ---
  addQ({
    id: "node-01",
    skill_slug: "nodejs",
    skill_name: "Node.js",
    skill_category: "node-ecosystem",
    topic: "Event loop and asynchronous I/O",
    subtopic: "libuv & 6 Event Loop Phases",
    question_title: "Explain the libuv Event Loop phases in Node.js.",
    question_prompt: "Walk through the 6 phases of the Node.js event loop: Timers, Pending callbacks, Idle/prepare, Poll, Check (setImmediate), and Close callbacks. Where do process.nextTick and Promise microtasks execute?",
    question_type: "conceptual",
    difficulty: "advanced",
    priority: "critical",
    expected_answer_points: [
      "libuv provides the multi-platform abstraction for asynchronous non-blocking I/O.",
      "1. Timers phase: Executes callbacks scheduled by setTimeout and setInterval whose thresholds have passed.",
      "2. Pending I/O callbacks: Executes I/O callbacks deferred from the previous loop iteration (e.g. TCP errors).",
      "3. Idle, prepare: Used internally by libuv.",
      "4. Poll phase: Retrieves new I/O events; executes I/O related callbacks (file reads, network reads); calculates how long to block.",
      "5. Check phase: Executes setImmediate callbacks.",
      "6. Close callbacks: Executes socket/handle close events (e.g. socket.on('close')).",
      "Microtasks & process.nextTick: Not part of libuv loop phases. They execute immediately between any phase transition whenever the C++ boundary is crossed."
    ],
    sample_answer: "The Node.js event loop runs via libuv through 6 distinct phases: Timers (setTimeout/setInterval), Pending callbacks (system I/O), Idle/prepare (internal), Poll (incoming network/disk I/O and blocking), Check (setImmediate callbacks), and Close callbacks (socket.destroy). Microtask queues (process.nextTick followed by Promise.then) do not wait for a specific phase; they drain completely between any phase transitions whenever the call stack empties.",
    follow_up_questions: [
      "Why does setImmediate execute before setTimeout(fn, 0) when called inside an I/O callback?",
      "What is the libuv Thread Pool size (UV_THREADPOOL_SIZE) and which operations use it?"
    ],
    estimated_minutes: 15
  });

  addQ({
    id: "node-02",
    skill_slug: "nodejs",
    skill_name: "Node.js",
    skill_category: "node-ecosystem",
    topic: "Event loop and asynchronous I/O",
    subtopic: "libuv Thread Pool & CPU-Bound Operations",
    question_title: "What operations run in the libuv thread pool, and how do you handle CPU-bound tasks in Node.js?",
    question_prompt: "Explain why Node.js is not truly single-threaded under the hood. Which operations use the libuv thread pool (fs, crypto, zlib, dns.lookup)? How should CPU-intensive tasks (e.g. video encoding, heavy math) be handled using Worker Threads or child processes?",
    question_type: "conceptual",
    difficulty: "intermediate",
    priority: "high",
    expected_answer_points: [
      "Single-threaded JS engine (V8), but asynchronous I/O backed by libuv thread pool (default 4 worker threads, configurable via UV_THREADPOOL_SIZE).",
      "Operations utilizing thread pool: fs (file system calls), crypto (pbkdf2, randomBytes, scrypt), zlib (compression), dns.lookup.",
      "Network I/O: Handled by OS kernel non-blocking mechanisms (epoll on Linux, kqueue on macOS, IOCP on Windows) WITHOUT consuming thread pool threads.",
      "CPU-bound tasks: Block the main event loop, causing all incoming requests to freeze.",
      "Handling CPU tasks: 1) worker_threads module (shares memory via SharedArrayBuffer); 2) child_process (fork); 3) Dedicated worker service offloaded via message queue."
    ],
    sample_answer: "While JavaScript runs on a single main thread, libuv utilizes a background thread pool (default 4 threads) for blocking system tasks like file system I/O, heavy crypto hashing, and zlib compression. Network sockets do not use thread pool threads; they use kernel epoll/kqueue. CPU-intensive computations block the main event loop and should be offloaded to Node.js worker_threads, spawned child processes, or an external task queue (like Celery or BullMQ).",
    follow_up_questions: [
      "How do you increase UV_THREADPOOL_SIZE and where must it be set?",
      "What is the difference between worker_threads and child_process.fork()?"
    ],
    estimated_minutes: 12
  });

  addQ({
    id: "node-03",
    skill_slug: "nodejs",
    skill_name: "Node.js",
    skill_category: "node-ecosystem",
    topic: "Streams and buffers",
    subtopic: "Streams Architecture & Backpressure",
    question_title: "How do Node.js Streams work, and what is Backpressure?",
    question_prompt: "Explain the four Stream types: Readable, Writable, Duplex, and Transform. What is Backpressure, how does stream.pipe() handle it, and what happens if backpressure is ignored?",
    question_type: "conceptual",
    difficulty: "advanced",
    priority: "critical",
    expected_answer_points: [
      "Streams process data sequentially chunk-by-chunk without loading the entire dataset into RAM.",
      "4 Types: Readable (fs.createReadStream), Writable (fs.createWriteStream), Duplex (net.Socket), Transform (zlib.createGzip).",
      "Backpressure: Occurs when data is read from a fast source faster than the slow destination can write it.",
      "If backpressure is ignored, data accumulates in RAM buffers until the Node process crashes with an OutOfMemoryError.",
      "Handling: writable.write(chunk) returns false when highWaterMark (default 16KB) is exceeded. Reader must pause (readable.pause()) until writer emits 'drain' event.",
      "stream.pipe() and stream.pipeline() handle backpressure and error propagation automatically."
    ],
    sample_answer: "Streams allow reading and writing data in chunks, keeping memory consumption constant regardless of file size. Backpressure occurs when the producer reads faster than the consumer can write. When the consumer's internal buffer (highWaterMark) fills, writable.write() returns false, signaling the readable stream to pause. Once the consumer flushes to disk/network, it emits a 'drain' event, resuming reads. Using stream.pipeline() automatically manages backpressure and ensures proper error cleanup.",
    follow_up_questions: [
      "Why is stream.pipeline() preferred over stream.pipe() in production?",
      "How do async iterators (for await...of) simplify consuming Readable streams?"
    ],
    estimated_minutes: 15
  });

  addQ({
    id: "node-04",
    skill_slug: "nodejs",
    skill_name: "Node.js",
    skill_category: "node-ecosystem",
    topic: "Streams and buffers",
    subtopic: "Buffers & Binary Data Handling",
    question_title: "What is a Buffer in Node.js, and how does it manage off-heap memory?",
    question_prompt: "Explain what Buffer represents in Node.js. How is Buffer allocated in raw native memory outside the V8 heap, and what are security risks of Buffer.allocUnsafe()?",
    question_type: "conceptual",
    difficulty: "intermediate",
    priority: "high",
    expected_answer_points: [
      "Buffer: Raw fixed-size chunk of binary memory allocated outside the V8 JavaScript heap (using C++ malloc).",
      "Created for handling TCP streams, binary file protocols, image manipulation, and cryptography.",
      "Buffer.alloc(size): Allocates zero-filled memory. Safe, but slightly slower.",
      "Buffer.allocUnsafe(size): Allocates uninitialized memory. Very fast, but dangerous because the buffer may contain sensitive residual data from old memory allocations (passwords, tokens, keys).",
      "Security rule: Never send allocUnsafe buffers over network without overwriting/filling first."
    ],
    sample_answer: "A Buffer represents raw binary data allocated outside V8's garbage-collected heap in native C++ memory. Buffers are used for low-level I/O like TCP networking and file operations. Buffer.alloc(size) initializes all bytes to zero safely. Buffer.allocUnsafe(size) is faster because it does not zero-out memory, but creates critical security vulnerabilities if uninitialized memory contains sensitive residual secrets that get transmitted over the network.",
    follow_up_questions: [
      "What is the relationship between Node.js Buffer and JavaScript Uint8Array?",
      "How does Buffer.from(string, 'utf-8') perform character encoding?"
    ],
    estimated_minutes: 10
  });

  addQ({
    id: "node-05",
    skill_slug: "nodejs",
    skill_name: "Node.js",
    skill_category: "node-ecosystem",
    topic: "Error handling",
    subtopic: "Uncaught Exceptions & Process Lifecycle",
    question_title: "How should Uncaught Exceptions and Unhandled Rejections be handled in Node.js?",
    question_prompt: "Explain process.on('uncaughtException') and process.on('unhandledRejection'). Why is it mandatory to exit the process (process.exit(1)) after an uncaught exception, and how do process managers (PM2/Kubernetes) recover?",
    question_type: "practical_scenario",
    difficulty: "intermediate",
    priority: "high",
    expected_answer_points: [
      "uncaughtException: Emitted when an exception bubbles all the way back to the event loop without being caught by try/catch.",
      "Why exit is mandatory: The application is in an undefined, corrupted state (locks may be held, memory references leaked, sockets left half-open). Continuing to serve requests causes data corruption and cascading failures.",
      "Proper handling: Log the error to disk/observability, close open connections/servers gracefully, and call process.exit(1).",
      "Process supervisors: Kubernetes pod restarts or PM2 automatically spin up a fresh instance immediately.",
      "unhandledRejection: Modern Node.js versions treat unhandled Promise rejections as uncaught exceptions, terminating the process by default."
    ],
    sample_answer: "When an uncaught exception reaches the event loop, the application enters an undefined state with potential memory leaks and corrupted data structures. Attempting to keep running is an anti-pattern. The correct pattern is to catch process.on('uncaughtException'), flush logs, reject new requests, close server connections within a timeout, and terminate with process.exit(1). External supervisors like Kubernetes or PM2 then immediately spawn a clean replacement container.",
    follow_up_questions: [
      "What is the difference between operational errors and programmer errors in Node.js?",
      "How does domain module (deprecated) compare with modern async_hooks for error context?"
    ],
    estimated_minutes: 12
  });

  addQ({
    id: "node-06",
    skill_slug: "nodejs",
    skill_name: "Node.js",
    skill_category: "node-ecosystem",
    topic: "Process and environment configuration",
    subtopic: "Cluster Module & Multi-Core Scaling",
    question_title: "How does the Node.js Cluster module scale across multi-core processors?",
    question_prompt: "Since Node.js runs on a single thread, how does cluster.fork() utilize all CPU cores on a server? Explain master-worker process communication (IPC) and round-robin port sharing.",
    question_type: "conceptual",
    difficulty: "intermediate",
    priority: "medium",
    expected_answer_points: [
      "Node.js runs single-threaded per process; on a 16-core server, 1 process uses only ~6% of available CPU.",
      "Cluster module spawns child worker processes using child_process.fork(), each running its own V8 instance and event loop.",
      "Port sharing: The master process binds to the TCP port (e.g. 3000) and accepts incoming connections, distributing them across worker processes using Round-Robin (default on Linux/macOS).",
      "IPC (Inter-Process Communication): Master and workers communicate via serialization over IPC channels (process.send() and process.on('message')).",
      "Modern alternative: In containerized Kubernetes setups, clustering is often delegated to Kubernetes replicas rather than in-process Node clustering."
    ],
    sample_answer: "The Cluster module enables scaling a Node.js server across all CPU cores. A primary master process creates a worker process for each CPU core using cluster.fork(). The master listens on the server port and distributes incoming connections to workers using round-robin scheduling. Each worker runs its own event loop and memory space. If a worker crashes, the master receives an 'exit' event and forks a replacement worker.",
    follow_up_questions: [
      "Why must session data not be stored in in-memory variables when running a clustered Node application?",
      "How does PM2 cluster mode abstract the native cluster module?"
    ],
    estimated_minutes: 12
  });

  addQ({
    id: "node-07",
    skill_slug: "nodejs",
    skill_name: "Node.js",
    skill_category: "node-ecosystem",
    topic: "Modules and package management",
    subtopic: "Package Locks & Dependency Resolution",
    question_title: "What is the purpose of package-lock.json, and how does npm ci differ from npm install?",
    question_prompt: "Explain semantic versioning (^ vs ~) and why package-lock.json is required for reproducible builds. Compare npm install and npm ci in continuous integration (CI) pipelines.",
    question_type: "practical_scenario",
    difficulty: "beginner",
    priority: "medium",
    expected_answer_points: [
      "Semver: ^ allows minor/patch updates (^1.2.0 installs 1.3.0); ~ allows only patch updates (~1.2.0 installs 1.2.5).",
      "package-lock.json: Pins the exact dependency tree, sub-dependencies, integrity hashes, and resolved URLs, ensuring identical node_modules across all developer machines and servers.",
      "npm install: Can modify package-lock.json if ranges allow; resolves dependencies dynamically.",
      "npm ci: Built strictly for CI/CD pipelines. Never modifies package-lock.json. Deletes node_modules first, installs exact lockfile versions, and fails immediately if lockfile is out of sync with package.json. Much faster and deterministic."
    ],
    sample_answer: "Semantic version ranges in package.json (^, ~) permit dynamic updates that can introduce breaking changes. package-lock.json locks the exact dependency tree and cryptographic hashes to guarantee reproducible builds. In CI pipelines, always use 'npm ci' instead of 'npm install': npm ci deletes existing node_modules, installs the exact lockfile versions without modifying the lockfile, and fails the build if package.json and package-lock.json are mismatched.",
    follow_up_questions: [
      "What is an npm audit vulnerability and how do peer dependencies resolve in npm v7+?",
      "What are npx and corepack in the Node ecosystem?"
    ],
    estimated_minutes: 10
  });

  addQ({
    id: "node-08",
    skill_slug: "nodejs",
    skill_name: "Node.js",
    skill_category: "node-ecosystem",
    topic: "Event loop and asynchronous I/O",
    subtopic: "Memory Leak Detection & Heap Snapshots",
    question_title: "How do you detect, profile, and fix Memory Leaks in Node.js?",
    question_prompt: "What causes memory leaks in Node.js (global variables, un-cleared intervals, closures, event listeners)? How do you capture and inspect heap snapshots using Chrome DevTools or v8.writeHeapSnapshot()?",
    question_type: "debugging",
    difficulty: "advanced",
    priority: "high",
    expected_answer_points: [
      "Common causes: 1) Global variables or unbounded caches; 2) Event listeners attached to long-lived emitters without removeListener(); 3) Closures capturing large parent scope contexts; 4) Timers (setInterval) retaining callbacks.",
      "Detection: Monitor process.memoryUsage().heapUsed over time under load (sawtooth pattern with rising baseline indicates leak).",
      "Heap Snapshots: Capture via v8.writeHeapSnapshot() or node --inspect attached to Chrome DevTools (chrome://inspect).",
      "Analysis: Take two snapshots before and after load test; use 'Comparison' view in Chrome DevTools to locate objects with high Retained Size and trace back to GC roots."
    ],
    sample_answer: "Memory leaks in Node.js occur when objects remain reachable from GC roots—common culprits include unbounded in-memory caches, unclosed event listeners (emitter.on without off), and lingering setInterval closures. To troubleshoot, run Node with --inspect, connect Chrome DevTools, and record Heap Snapshots before and after simulating traffic. By comparing snapshots, identify object types with increasing allocation counts and inspect the Retainer tree to find what reference is preventing garbage collection.",
    follow_up_questions: [
      "What does the EventEmitter warning 'MaxListenersExceededWarning' indicate?",
      "What is the difference between RSS (Resident Set Size) and Heap Used in Node.js memory metrics?"
    ],
    estimated_minutes: 12
  });

  // --- EXPRESS.JS (7) ---
  addQ({
    id: "exp-01",
    skill_slug: "expressjs",
    skill_name: "Express.js",
    skill_category: "node-ecosystem",
    topic: "Routing and middleware",
    subtopic: "Middleware Architecture & next() Function",
    question_title: "Explain the Express.js Middleware pipeline and the role of next().",
    question_prompt: "How does Express execute middleware sequentially? What happens if next() is omitted, called multiple times, or called with an argument next(err)?",
    question_type: "conceptual",
    difficulty: "intermediate",
    priority: "critical",
    expected_answer_points: [
      "Middleware: A function with signature (req, res, next) that has access to request, response, and next middleware in stack.",
      "Sequence: Middlewares execute in the exact order they are registered via app.use() or router.use().",
      "Calling next(): Hands execution to the next middleware in chain. If omitted, the request hangs indefinitely until client timeout.",
      "Calling next(err) with an argument: Skips all remaining standard middlewares and jumps directly to the first error-handling middleware ((err, req, res, next)).",
      "Calling next() twice: Causes 'Cannot set headers after they are sent to the client' errors if both paths attempt to write to res."
    ],
    sample_answer: "Express is a routing and middleware web framework. Middlewares execute sequentially in the order registered. Calling next() passes control to the next middleware; if omitted and no response is sent, the request hangs until timeout. Calling next() with any argument (next(err)) signals an error, causing Express to skip all subsequent standard middlewares and jump directly to registered error-handling middleware.",
    follow_up_questions: [
      "What causes the error 'ERR_HTTP_HEADERS_SENT: Cannot set headers after they are sent to the client'?",
      "How do you ensure execution stops after sending a response (e.g. return res.json(...))?"
    ],
    estimated_minutes: 10
  });

  addQ({
    id: "exp-02",
    skill_slug: "expressjs",
    skill_name: "Express.js",
    skill_category: "node-ecosystem",
    topic: "Centralized error handling",
    subtopic: "Global Error Handling Middleware",
    question_title: "How do you implement Centralized Error Handling in Express.js?",
    question_prompt: "Explain how Express identifies error-handling middleware by its 4-parameter signature (err, req, res, next). How do you handle unhandled async errors in Express 4 vs Express 5?",
    question_type: "coding",
    difficulty: "intermediate",
    priority: "critical",
    expected_answer_points: [
      "Signature requirement: Express checks function.length === 4; error handlers MUST declare exactly 4 arguments: (err, req, res, next), even if next is unused.",
      "Location: Must be registered at the very bottom of the app stack after all routes.",
      "Async error pitfall in Express 4: Errors thrown inside async functions do NOT bubble to next(err) automatically; they cause unhandled promise rejections unless wrapped in try/catch or an asyncHandler wrapper.",
      "Express 5 improvement: Natively handles rejected promises from async route handlers, routing them to error middleware automatically.",
      "Standard error response: Returns standardized JSON { error: { message, status } } and maps custom ApplicationError subclasses to HTTP status codes."
    ],
    sample_answer: "Centralized error handling in Express uses a middleware with exactly 4 parameters: (err, req, res, next). Express inspects function arity; omitting 'next' causes it to be treated as normal middleware. In Express 4, errors thrown in async functions are not caught automatically and must be caught via try/catch and passed to next(err) (or wrapped with an async wrapper). In Express 5, rejected promises are forwarded to error middleware automatically. Place this middleware last to return standardized JSON error responses.",
    follow_up_questions: [
      "How do you implement a reusable asyncHandler higher-order function in Express 4?",
      "Why must error-handling middleware be registered AFTER all routes?"
    ],
    estimated_minutes: 12
  });

  addQ({
    id: "exp-03",
    skill_slug: "expressjs",
    skill_name: "Express.js",
    skill_category: "node-ecosystem",
    topic: "Validation and authentication middleware",
    subtopic: "Authentication Middleware & JWT Verification",
    question_title: "How do you write a custom JWT Authentication and Role Authorization middleware in Express?",
    question_prompt: "Implement an authenticateToken middleware that parses the Authorization header, verifies JWT with jsonwebtoken, attaches req.user, and a requireRole('admin') middleware for RBAC.",
    question_type: "coding",
    difficulty: "intermediate",
    priority: "high",
    expected_answer_points: [
      "authenticateToken extracts 'Authorization' header and validates 'Bearer <token>' format.",
      "jwt.verify(token, secret, (err, decoded) => ...): if invalid, returns res.status(403).json({ error: 'Invalid token' }); if expired, returns appropriate message.",
      "Attaches verified payload to request object: req.user = decoded.",
      "Calls next() to proceed.",
      "Role authorization factory: requireRole(...roles) returns middleware checking if roles.includes(req.user.role); returns 403 Forbidden if unauthorized."
    ],
    sample_answer: "The authenticateToken middleware extracts the Bearer token from req.headers.authorization, verifies it using jwt.verify, and attaches the decoded payload to req.user before calling next(). If missing, it returns 401 Unauthorized; if invalid or expired, 403 Forbidden. For role-based access control, write a higher-order middleware factory: function authorize(roles) { return (req, res, next) => { if (!roles.includes(req.user.role)) return res.status(403).json({ error: 'Forbidden' }); next(); }; }.",
    follow_up_questions: [
      "How do you type augment the Express.Request interface in TypeScript to include the user property?",
      "Why should JWT secrets never be hardcoded in application source code?"
    ],
    estimated_minutes: 12
  });

  addQ({
    id: "exp-04",
    skill_slug: "expressjs",
    skill_name: "Express.js",
    skill_category: "node-ecosystem",
    topic: "Validation and authentication middleware",
    subtopic: "Input Validation with Zod in Express",
    question_title: "How do you validate request body, params, and query using Zod in Express?",
    question_prompt: "Write a reusable validateRequest(schema) middleware that validates req.body, req.query, and req.params using a Zod schema before the route handler executes.",
    question_type: "coding",
    difficulty: "intermediate",
    priority: "high",
    expected_answer_points: [
      "Middleware factory: validate(schema) returns (req, res, next) => { ... }.",
      "Calls schema.safeParseAsync({ body: req.body, query: req.query, params: req.params }).",
      "If parse fails: returns res.status(400).json({ errors: result.error.errors.map(e => ({ field: e.path.join('.'), message: e.message })) }).",
      "If parse succeeds: replaces req.body / req.query / req.params with validated and sanitized result.data and calls next().",
      "Guarantees type-safe input data reaching controller business logic."
    ],
    sample_answer: "Create a higher-order middleware that accepts a Zod schema representing expected body, params, and query shapes. Inside the middleware, execute schema.safeParse({ body: req.body, query: req.query, params: req.params }). If parsing fails, format the Zod issues and return HTTP 400 Bad Request immediately. If valid, assign the parsed, sanitized data back to req and call next(), ensuring controllers only ever execute with validated data.",
    follow_up_questions: [
      "What is the difference between safeParse and parse in Zod?",
      "How does Zod stripping (.strip()) prevent mass-assignment attacks?"
    ],
    estimated_minutes: 10
  });

  addQ({
    id: "exp-05",
    skill_slug: "expressjs",
    skill_name: "Express.js",
    skill_category: "node-ecosystem",
    topic: "Routing and middleware",
    subtopic: "Security Best Practices with Helmet & Rate Limiting",
    question_title: "How do you secure an Express.js production API using Helmet, CORS, and Rate Limiting?",
    question_prompt: "Explain the essential security middlewares for Express: Helmet (setting HTTP security headers), cors, express-rate-limit, and hpp (HTTP Parameter Pollution).",
    question_type: "practical_scenario",
    difficulty: "intermediate",
    priority: "high",
    expected_answer_points: [
      "Helmet: Sets 15+ secure HTTP response headers (Content-Security-Policy, X-Frame-Options, X-Content-Type-Options, Strict-Transport-Security, hidePoweredBy).",
      "app.disable('x-powered-by'): Prevents advertising Express version to attackers.",
      "express-rate-limit: Caps request rate per IP (e.g. 100 requests per 15 minutes) to protect login/register endpoints against brute-force attacks.",
      "cors: Restricts cross-origin requests to explicit allowed whitelist origins.",
      "hpp: Protects against HTTP Parameter Pollution where attackers submit duplicate query params (?id=1&id=2) to bypass validation."
    ],
    sample_answer: "Securing an Express API requires layering standard security middlewares: apply helmet() to configure protective HTTP security headers (HSTS, CSP, X-Frame-Options) and disable the 'X-Powered-By' fingerprint. Use express-rate-limit backed by Redis to prevent brute-force attacks on auth endpoints. Configure cors() with explicit allowed origins, and use hpp() to prevent HTTP parameter pollution attacks where duplicate query parameters turn strings into arrays.",
    follow_up_questions: [
      "Why is storing rate-limit counts in-memory problematic when running multiple Node instances behind a load balancer?",
      "What does Content-Security-Policy (CSP) prevent?"
    ],
    estimated_minutes: 10
  });

  addQ({
    id: "exp-06",
    skill_slug: "expressjs",
    skill_name: "Express.js",
    skill_category: "node-ecosystem",
    topic: "Routing and middleware",
    subtopic: "Express.Router & Modular Routing",
    question_title: "How do you organize large Express applications using Express.Router?",
    question_prompt: "Explain how Express.Router creates modular, mountable route handlers. Discuss directory structuring (routes, controllers, services, middlewares) and mergeParams: true for nested routes.",
    question_type: "conceptual",
    difficulty: "beginner",
    priority: "medium",
    expected_answer_points: [
      "Express.Router: Isolated instance of middleware and routes; acts as a mini-application.",
      "Mounting: Define router in routes/users.js and mount via app.use('/api/v1/users', userRouter).",
      "Separation of concerns: Routes define URL and apply middlewares; Controllers handle HTTP request/response; Services contain pure business logic; Repositories handle database queries.",
      "mergeParams: true: Router({ mergeParams: true }) allows child routers to access path parameters defined on parent routers (e.g. /users/:userId/posts/:postId)."
    ],
    sample_answer: "Express.Router encapsulates sub-routes as isolated mini-apps. In an enterprise structure, routes are split into modular files mounted on root prefixes (app.use('/api/v1/orders', orderRouter)). For nested relational routes like /users/:userId/posts, instantiate the child router with express.Router({ mergeParams: true }) so the child route can access req.params.userId from the parent path.",
    follow_up_questions: [
      "What happens if mergeParams is false when accessing a parent route param?",
      "Why should controller functions never contain raw SQL/database queries directly?"
    ],
    estimated_minutes: 10
  });

  addQ({
    id: "exp-07",
    skill_slug: "expressjs",
    skill_name: "Express.js",
    skill_category: "node-ecosystem",
    topic: "Request lifecycle",
    subtopic: "Body Parsing & Payload Size Limits",
    question_title: "How does express.json() work, and why must payload size limits be enforced?",
    question_prompt: "Explain how express.json() and express.urlencoded() parse incoming request streams. Why is configuring { limit: '10kb' } critical to defend against Denial-of-Service (DoS) attacks?",
    question_type: "practical_scenario",
    difficulty: "beginner",
    priority: "medium",
    expected_answer_points: [
      "express.json() is built on body-parser; it buffers the incoming HTTP request stream, checks Content-Type: application/json, and parses the JSON string into req.body.",
      "Payload limits: Defaults to '100kb'.",
      "DoS vulnerability: If no limit or an excessively large limit is allowed, an attacker can send multi-megabyte JSON payloads, forcing the Node server to spend all CPU cycles parsing strings and exhausting V8 heap memory.",
      "Configuring app.use(express.json({ limit: '10kb' })) drops oversized payloads immediately with HTTP 413 Payload Too Large.",
      "File uploads should be handled via multipart/form-data parsers (Multer) with streaming rather than JSON body parsers."
    ],
    sample_answer: "express.json() buffers the incoming HTTP stream and parses JSON into req.body. By default, it accepts payloads up to 100kb. In production, configure explicit size limits (e.g. express.json({ limit: '10kb' })) because accepting arbitrary payload sizes allows malicious actors to flood the single Node event loop with massive JSON payloads that block CPU during parsing and crash the process via heap exhaustion (DoS).",
    follow_up_questions: [
      "How does Multer handle multi-part file uploads without loading the whole file into RAM?",
      "What HTTP status code is returned when a payload exceeds the configured limit?"
    ],
    estimated_minutes: 10
  });
};
