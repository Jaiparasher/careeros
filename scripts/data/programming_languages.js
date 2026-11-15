// Programming languages questions: Java (12), JavaScript (10), TypeScript (7), C (4), C++ (4) = 37 total
module.exports = function(addQ) {
  // --- JAVA (12) ---
  addQ({
    id: "java-01",
    skill_slug: "java",
    skill_name: "Java",
    skill_category: "programming-languages",
    topic: "Collections Framework",
    subtopic: "HashMap Internals",
    question_title: "How does HashMap work internally in Java 8+?",
    question_prompt: "Explain the internal architecture of HashMap in Java 8+. Detail how buckets, hash codes, collisions, load factors, rehashing, and treeification (TreeNode/Red-Black Tree) function.",
    question_type: "conceptual",
    difficulty: "intermediate",
    priority: "critical",
    expected_answer_points: [
      "HashMap uses an array of Node<K,V> (buckets) with initial capacity 16 and default load factor 0.75.",
      "Hash code is calculated and mixed via (h ^ (h >>> 16)) to spread higher bits, and bucket index is computed as (n - 1) & hash.",
      "When a collision occurs, entries are chained as a singly linked list.",
      "In Java 8+, if a bucket length exceeds TREEIFY_THRESHOLD (8) and total table capacity is at least 64 (MIN_TREEIFY_CAPACITY), the list transforms into a Red-Black Tree, improving worst-case search from O(n) to O(log n).",
      "When size exceeds capacity * load factor (threshold), the backing array doubles and rehashes."
    ],
    sample_answer: "In Java 8+, HashMap is backed by an array of Node<K,V>. Keys are hashed with bit-mixing ((h ^ (h >>> 16))), and bucket index is determined by bitwise AND ((n-1) & hash). Collisions initially form a singly linked list. When a bucket has 8 or more nodes and the total table capacity is at least 64, it converts into a Red-Black tree to maintain O(log n) lookup. When the number of entries exceeds capacity * load factor (default 0.75), the array doubles and re-indexes all entries.",
    follow_up_questions: [
      "Why must total table capacity be at least 64 before converting a linked list bucket into a Red-Black tree?",
      "Why is HashMap capacity always kept as a power of two?"
    ],
    estimated_minutes: 12
  });

  addQ({
    id: "java-02",
    skill_slug: "java",
    skill_name: "Java",
    skill_category: "programming-languages",
    topic: "Collections Framework",
    subtopic: "ConcurrentHashMap vs SynchronizedMap",
    question_title: "How does ConcurrentHashMap achieve thread safety without locking the entire map?",
    question_prompt: "Compare ConcurrentHashMap with Hashtable and Collections.synchronizedMap. Detail how Java 8+ ConcurrentHashMap implements thread-safe reads and writes using CAS and synchronized node locks.",
    question_type: "conceptual",
    difficulty: "advanced",
    priority: "critical",
    expected_answer_points: [
      "Collections.synchronizedMap and Hashtable lock the entire table on every read/write using a single monitor, causing severe thread contention.",
      "In Java 7, ConcurrentHashMap used Segment-based locking (default 16 segments).",
      "In Java 8+, segments are replaced with CAS (Compare-And-Swap) for empty bucket insertions and synchronized on the head node of the specific bucket for collisions.",
      "Reads (get) are completely lock-free because node values and next pointers are volatile.",
      "Tree bins use a special TreeBin wrapper with a custom read-write lock so reads don't block on tree rotations."
    ],
    sample_answer: "Hashtable and Collections.synchronizedMap synchronize the entire map instance on every operation. ConcurrentHashMap in Java 8+ eliminates segment locking and instead locks only individual bucket head nodes using synchronized when inserting collisions. Empty bucket insertion uses non-blocking hardware CAS. Reads are completely lock-free because Node.val and Node.next are volatile.",
    follow_up_questions: [
      "Does ConcurrentHashMap allow null keys or null values, and why?",
      "How does size() work in ConcurrentHashMap across multiple concurrent writer threads?"
    ],
    estimated_minutes: 15
  });

  addQ({
    id: "java-03",
    skill_slug: "java",
    skill_name: "Java",
    skill_category: "programming-languages",
    topic: "Collections Framework",
    subtopic: "equals and hashCode Contract",
    question_title: "What is the contract between equals() and hashCode(), and what happens if broken?",
    question_prompt: "Explain the contract between equals() and hashCode() in Java. What specific production bugs occur if you override equals() without overriding hashCode() when using Hash-based collections?",
    question_type: "conceptual",
    difficulty: "beginner",
    priority: "critical",
    expected_answer_points: [
      "Contract 1: If two objects are equal according to equals(), they must have the same hashCode().",
      "Contract 2: If two objects have different hashCodes, they cannot be equal. If they have the same hashCode, they may or may not be equal (collision).",
      "Contract 3: Consistent: Multiple invocations on the same object must return the same integer provided no fields modified.",
      "Consequence: If equals() is overridden but hashCode() is not, two logically identical objects land in different hash buckets in a HashSet or HashMap. Contains() returns false, and duplicate entries accumulate."
    ],
    sample_answer: "The contract mandates that if two objects are equal by equals(), their hashCode() must return identical integers. If you override equals() but not hashCode(), equal objects will produce different hash codes and get placed into different hash buckets. As a result, map.get(key) or set.contains(obj) fails to find existing entries, and duplicate records accumulate in HashSets.",
    follow_up_questions: [
      "What happens if an object used as a HashMap key is mutated after being inserted?",
      "Can two unequal objects return the exact same hashCode?"
    ],
    estimated_minutes: 10
  });

  addQ({
    id: "java-04",
    skill_slug: "java",
    skill_name: "Java",
    skill_category: "programming-languages",
    topic: "String immutability and String pool",
    subtopic: "String Interning & Immutability",
    question_title: "Why is String immutable in Java, and how does the String Constant Pool work?",
    question_prompt: "Analyze why String was designed to be immutable in Java. Explain the role of the String Constant Pool in Metaspace/Heap, String interning, and performance/security implications.",
    question_type: "conceptual",
    difficulty: "intermediate",
    priority: "high",
    expected_answer_points: [
      "Security: Strings represent database credentials, network URLs, and file paths; immutability prevents malicious tampering.",
      "Thread safety: Immutable objects are intrinsically thread-safe without synchronization.",
      "HashCode caching: Hash code is calculated lazily once and cached in the hash field, making it efficient as a HashMap key.",
      "String Constant Pool (SCP): Stored in Java Heap (since Java 7). String literals reuse identical pool instances to save heap memory.",
      "String.intern() searches the pool and returns the pooled reference or registers the string if absent."
    ],
    sample_answer: "String is immutable in Java for security (preventing modification of sensitive parameters like file paths or DB URLs), thread safety (no synchronization required), and performance (caching hashCode). Immutability makes the String Constant Pool possible, where identical string literals share the same heap reference. When a string is created with new String('abc'), a new object is created on the heap outside the pool, whereas literal 'abc' points to the pool.",
    follow_up_questions: [
      "Where is the String Pool located in Java 8+ memory layout?",
      "When should you use StringBuilder or StringBuffer instead of String concatenation?"
    ],
    estimated_minutes: 10
  });

  addQ({
    id: "java-05",
    skill_slug: "java",
    skill_name: "Java",
    skill_category: "programming-languages",
    topic: "JVM memory, garbage collection and class loading",
    subtopic: "JVM Memory Structure & Generations",
    question_title: "Explain the JVM memory model: Heap, Stack, Metaspace, and GC Generations.",
    question_prompt: "Describe the runtime data areas of the JVM: Stack, Heap (Young Gen: Eden, S0, S1; Old Gen), and Metaspace. How do objects move through generations during Garbage Collection?",
    question_type: "conceptual",
    difficulty: "advanced",
    priority: "critical",
    expected_answer_points: [
      "JVM Stack: Thread-private; stores stack frames with local variables, operand stack, and method return references.",
      "Heap: Shared across threads; holds all object instances and arrays.",
      "Young Generation: Eden space (where new objects are allocated) and two Survivor spaces (S0 and S1).",
      "Minor GC collects Eden: surviving objects copy to active Survivor space with incremented age tenure.",
      "Old Generation (Tenured): Objects surviving tenuring threshold (default 15) promote to Old Gen.",
      "Metaspace: Off-heap memory (native) replacing PermGen in Java 8+, storing class metadata, bytecode, and method references."
    ],
    sample_answer: "The JVM memory consists of thread-local Stacks (holding method frames and local primitive variables/references) and a shared Heap. The Heap is split into Young Generation (Eden and Survivor spaces S0/S1) and Old (Tenured) Generation. New objects allocate in Eden; Minor GC copies survivors between S0 and S1, incrementing their age counter. When age reaches MaxTenuringThreshold (default 15), they promote to Old Gen. Metaspace stores class metadata in off-heap native memory.",
    follow_up_questions: [
      "What triggers a Full GC versus a Minor GC?",
      "What is the difference between StackOverflowError and OutOfMemoryError: Java heap space?"
    ],
    estimated_minutes: 15
  });

  addQ({
    id: "java-06",
    skill_slug: "java",
    skill_name: "Java",
    skill_category: "programming-languages",
    topic: "JVM memory, garbage collection and class loading",
    subtopic: "Garbage Collectors Comparison",
    question_title: "Compare JVM Garbage Collectors: G1GC, ZGC, and CMS.",
    question_prompt: "Compare G1GC (Garbage-First) and ZGC. Explain region-based collection, pause time targets (-XX:MaxGCPauseMillis), and concurrent marking.",
    question_type: "conceptual",
    difficulty: "advanced",
    priority: "high",
    expected_answer_points: [
      "G1GC: Default since Java 9; splits heap into equal-sized regions (1MB to 32MB) assigned logically to Eden, Survivor, or Old.",
      "G1GC focuses on regions with the highest garbage ratio first (Garbage-First) to meet user pause time goals (-XX:MaxGCPauseMillis).",
      "CMS is deprecated/removed due to memory fragmentation (lack of compaction).",
      "ZGC: Low-latency collector (Java 15+ production ready) designed for sub-millisecond pause times regardless of heap size (gigabytes to terabytes).",
      "ZGC uses colored pointers and load barriers to perform compaction concurrently while application threads run."
    ],
    sample_answer: "G1GC is the default JVM collector. It partitions the heap into equal non-contiguous regions and collects regions with the most garbage first to honor target pause times (-XX:MaxGCPauseMillis). Unlike CMS, G1 compacts memory during evacuation. ZGC is an ultra-low latency collector providing sub-millisecond pauses on heaps up to terabytes by executing all compaction and marking concurrently using colored pointers and load barriers.",
    follow_up_questions: [
      "How does G1GC handle Humongous objects that exceed 50% of a region size?",
      "What trade-off in CPU throughput do you accept when using low-latency ZGC?"
    ],
    estimated_minutes: 15
  });

  addQ({
    id: "java-07",
    skill_slug: "java",
    skill_name: "Java",
    skill_category: "programming-languages",
    topic: "Concurrency, threads and executors",
    subtopic: "volatile and Java Memory Model",
    question_title: "What does the volatile keyword guarantee in the Java Memory Model?",
    question_prompt: "Explain the guarantees provided by volatile: visibility and instruction reordering (happens-before relationship). Why is volatile alone insufficient for compound operations like count++?",
    question_type: "conceptual",
    difficulty: "intermediate",
    priority: "critical",
    expected_answer_points: [
      "Visibility guarantee: Changes to a volatile variable are immediately flushed to main memory and subsequent reads read from main memory, bypassing CPU L1/L2 caches.",
      "Ordering guarantee: The compiler and CPU memory barriers prevent instruction reordering around volatile reads and writes (happens-before edge).",
      "Atomicity limitation: Volatile guarantees atomic reads and writes of 32/64-bit references, but NOT compound operations like count++ (which is read-modify-write).",
      "For compound atomic mutations, use AtomicInteger/AtomicLong or synchronized."
    ],
    sample_answer: "volatile guarantees two things: visibility and prevention of instruction reordering. Writes to volatile variables flush directly to main memory so other threads immediately see the newest value, and the compiler inserts memory barriers establishing a happens-before order. However, volatile does not make compound operations atomic: count++ involves 3 operations (read, increment, write) where race conditions still occur. For compound operations, use AtomicInteger or synchronized locks.",
    follow_up_questions: [
      "What is a False Sharing issue in concurrent programming, and how does @Contended resolve it?",
      "How does the Double-Checked Locking singleton pattern rely on volatile?"
    ],
    estimated_minutes: 12
  });

  addQ({
    id: "java-08",
    skill_slug: "java",
    skill_name: "Java",
    skill_category: "programming-languages",
    topic: "Concurrency, threads and executors",
    subtopic: "ThreadPoolExecutor Configuration",
    question_title: "How do you correctly configure ThreadPoolExecutor parameters to prevent production outages?",
    question_prompt: "Detail corePoolSize, maximumPoolSize, keepAliveTime, and workQueue (ArrayBlockingQueue vs LinkedBlockingQueue). What happens when the queue fills up, and what are the 4 rejection policies?",
    question_type: "practical_scenario",
    difficulty: "advanced",
    priority: "critical",
    expected_answer_points: [
      "Core pool size: number of worker threads kept alive even when idle.",
      "Work queue: When core threads are busy, incoming tasks enqueue. Never use unbounded LinkedBlockingQueue in production because it causes OutOfMemoryError under traffic spikes.",
      "Max pool size: If queue fills up, pool creates additional threads up to maxPoolSize.",
      "4 Rejection Policies: AbortPolicy (throws RejectedExecutionException), CallerRunsPolicy (calling thread executes task, creating backpressure), DiscardPolicy (silently drops task), DiscardOldestPolicy (drops oldest unhandled task).",
      "Sizing guideline: CPU-bound: N_cpu + 1; I/O-bound: N_cpu * (1 + wait_time / service_time)."
    ],
    sample_answer: "A ThreadPoolExecutor starts with corePoolSize threads. When all are busy, new tasks buffer into workQueue. If the queue is bounded and fills up, the executor spawns threads up to maximumPoolSize. If max threads are busy and queue is full, the RejectedExecutionHandler triggers. In production, always use bounded queues and prefer CallerRunsPolicy to apply natural backpressure on incoming traffic rather than dropping tasks or throwing uncontrolled errors.",
    follow_up_questions: [
      "Why is Executors.newFixedThreadPool() dangerous in high-load production environments?",
      "What is the difference between execute() and submit() on an ExecutorService?"
    ],
    estimated_minutes: 15
  });

  addQ({
    id: "java-09",
    skill_slug: "java",
    skill_name: "Java",
    skill_category: "programming-languages",
    topic: "Java 8+: lambdas, streams and Optional",
    subtopic: "Streams API & Parallel Streams",
    question_title: "How do Java Streams work internally, and when should you avoid parallelStream()?",
    question_prompt: "Explain intermediate vs terminal operations, laziness, short-circuiting, and the internal Spliterator. Why can parallelStream() harm throughput in web servers handling concurrent requests?",
    question_type: "conceptual",
    difficulty: "intermediate",
    priority: "high",
    expected_answer_points: [
      "Streams are lazy: intermediate operations (filter, map) construct a pipeline of stage descriptors without executing until a terminal operation (collect, findFirst, reduce) is invoked.",
      "Short-circuiting operations (limit, findFirst, anyMatch) stop computation early when conditions match.",
      "parallelStream() utilizes the common ForkJoinPool.commonPool(), which is shared by all threads in the JVM.",
      "In a web server (e.g. Spring Boot Tomcat worker pool), using parallelStream() can starve the common ForkJoinPool, causing high latency across unrelated requests.",
      "Parallel streams also introduce thread-safety bugs if stateful accumulators are used."
    ],
    sample_answer: "Java Streams are lazy sequences where intermediate operations build an execution graph evaluated only when a terminal operation is called. They allow optimizations like loop fusion and short-circuiting. Avoid parallelStream() inside multi-threaded web applications because parallel streams default to the JVM-wide ForkJoinPool.commonPool. Heavy parallel tasks can monopolize shared worker threads and block unrelated HTTP request handling.",
    follow_up_questions: [
      "What is the difference between flatMap and map?",
      "Why should you never pass null into Optional.of()?"
    ],
    estimated_minutes: 12
  });

  addQ({
    id: "java-10",
    skill_slug: "java",
    skill_name: "Java",
    skill_category: "programming-languages",
    topic: "Concurrency, threads and executors",
    subtopic: "Thread Synchronization & Deadlock",
    question_title: "How do you detect, resolve, and prevent Deadlocks in Java?",
    question_prompt: "What four conditions are necessary for a deadlock to occur? How do you diagnose a deadlock using thread dumps (jstack/visualvm), and what architectural practices prevent it?",
    question_type: "practical_scenario",
    difficulty: "advanced",
    priority: "critical",
    expected_answer_points: [
      "Four Coffman conditions: Mutual Exclusion, Hold and Wait, No Preemption, and Circular Wait.",
      "Diagnose via jstack <pid>, visualVM, or ThreadMXBean which identifies deadlocked threads and monitors held.",
      "Prevention Strategy 1: Lock ordering — always acquire multiple locks in a global, strictly defined order.",
      "Prevention Strategy 2: Lock timeouts — use ReentrantLock.tryLock(timeout, unit) instead of synchronized to avoid waiting indefinitely.",
      "Prevention Strategy 3: Minimize lock scope — do not hold locks during network or blocking I/O calls."
    ],
    sample_answer: "Deadlocks happen when threads circular-wait for locks held by each other while holding locks needed by others. You detect them by taking a thread dump via jstack <pid> or VisualVM, which explicitly prints 'Found one Java-level deadlock'. Prevention strategies include establishing a strict global lock acquisition order across the codebase, using ReentrantLock.tryLock() with timeouts instead of un-timed synchronized blocks, and minimizing the critical section scope.",
    follow_up_questions: [
      "What is the difference between ReentrantLock and the synchronized keyword?",
      "What is thread starvation and how does fairness policy in ReentrantLock affect it?"
    ],
    estimated_minutes: 15
  });

  addQ({
    id: "java-11",
    skill_slug: "java",
    skill_name: "Java",
    skill_category: "programming-languages",
    topic: "Java 8+: lambdas, streams and Optional",
    subtopic: "CompletableFuture and Asynchronous Pipelines",
    question_title: "How does CompletableFuture work for non-blocking asynchronous workflows in Java?",
    question_prompt: "Explain how CompletableFuture enables non-blocking pipeline composition (thenApply, thenCompose, thenCombine) and error handling (exceptionally, handle).",
    question_type: "coding",
    difficulty: "intermediate",
    priority: "high",
    expected_answer_points: [
      "CompletableFuture implements Future and CompletionStage for callback-driven async programming.",
      "thenApply transforms result synchronously or asynchronously when the stage completes (mapping).",
      "thenCompose is flatMap: it chains dependent async stages where the next step returns another CompletableFuture.",
      "thenCombine combines two independent async futures when both finish.",
      "allOf waits for multiple futures in parallel.",
      "exceptionally provides fallback handling when a future completes exceptionally."
    ],
    sample_answer: "CompletableFuture enables asynchronous, reactive pipelines without blocking on .get(). Methods like supplyAsync run tasks on ForkJoinPool or a custom Executor. thenApply transforms output, thenCompose chains another dependent future (flatMap), and thenCombine combines two independent futures in parallel. exceptionally catches errors and provides default fallbacks gracefully.",
    follow_up_questions: [
      "Why should you supply a custom ExecutorService to CompletableFuture.supplyAsync?",
      "What is the difference between thenApply and thenApplyAsync?"
    ],
    estimated_minutes: 15
  });

  addQ({
    id: "java-12",
    skill_slug: "java",
    skill_name: "Java",
    skill_category: "programming-languages",
    topic: "JVM memory, garbage collection and class loading",
    subtopic: "Memory Leaks and Heap Profiling",
    question_title: "How do memory leaks occur in Java despite Garbage Collection, and how do you fix them?",
    question_prompt: "Even though Java has automatic GC, memory leaks are common. Explain 3 classic causes of memory leaks in enterprise Java applications and how to troubleshoot them using heap dumps.",
    question_type: "debugging",
    difficulty: "advanced",
    priority: "high",
    expected_answer_points: [
      "Cause 1: Static references holding collections (e.g. static List or Map cache) that grow unbounded.",
      "Cause 2: Unclosed resources, thread locals not removed in thread-pool environments (leading to ClassLoader leaks).",
      "Cause 3: Missing equals/hashCode on custom objects stored in HashSets/HashMaps causing duplicates to accumulate.",
      "Cause 4: Unregistered listeners or event subscribers.",
      "Troubleshooting: Capture heap dump via jcmd or -XX:+HeapDumpOnOutOfMemoryError, analyze GC Roots in Eclipse MAT or JProfiler to find dominator trees holding retained heap."
    ],
    sample_answer: "Memory leaks in Java occur when objects that are no longer needed remain reachable from GC Roots (such as static fields, un-cleared ThreadLocal variables in pooled threads, or unbounded caches). To troubleshoot, trigger or capture a heap dump using jcmd or -XX:+HeapDumpOnOutOfMemoryError and inspect it with Eclipse Memory Analyzer (MAT). Look at the Dominator Tree and Leak Suspects report to find which GC root is retaining the memory.",
    follow_up_questions: [
      "Why is ThreadLocal.remove() mandatory when using application servers or Tomcat worker threads?",
      "What is the difference between Shallow Heap and Retained Heap in Eclipse MAT?"
    ],
    estimated_minutes: 15
  });

  // --- JAVASCRIPT (10) ---
  addQ({
    id: "js-01",
    skill_slug: "javascript",
    skill_name: "JavaScript",
    skill_category: "programming-languages",
    topic: "Event loop, call stack and task queues",
    subtopic: "Microtasks vs Macrotasks",
    question_title: "Explain the JavaScript Event Loop, Call Stack, Microtask queue, and Macrotask queue.",
    question_prompt: "Walk through how the JavaScript engine schedules and executes synchronous code, Promise callbacks (microtasks), process.nextTick / MutationObserver, and setTimeout / setInterval / I/O callbacks (macrotasks).",
    question_type: "conceptual",
    difficulty: "intermediate",
    priority: "critical",
    expected_answer_points: [
      "JavaScript has a single-threaded Call Stack that runs synchronous code to completion (Run-to-completion).",
      "Asynchronous tasks offload to browser/Node web APIs, which push callbacks to either Microtask queue or Macrotask queue.",
      "Microtasks include Promise.then/catch/finally, queueMicrotask, and process.nextTick.",
      "Macrotasks include setTimeout, setInterval, setImmediate, and I/O events.",
      "Event loop rule: Whenever call stack is empty, it exhausts ALL queued microtasks before picking the next single macrotask."
    ],
    sample_answer: "The JavaScript engine executes synchronous frames on the Call Stack. When asynchronous operations finish, callbacks enter either the Microtask Queue (Promises, queueMicrotask) or Macrotask Queue (setTimeout, setInterval, I/O). When the stack empties, the event loop drains the entire microtask queue completely before executing the next macrotask. This is why Promise.resolve().then() runs before a setTimeout(fn, 0).",
    follow_up_questions: [
      "What happens if a microtask recursively schedules another microtask?",
      "How does process.nextTick in Node.js compare with Promise.then?"
    ],
    estimated_minutes: 12
  });

  addQ({
    id: "js-02",
    skill_slug: "javascript",
    skill_name: "JavaScript",
    skill_category: "programming-languages",
    topic: "Scope, hoisting and closures",
    subtopic: "Closures & Practical Applications",
    question_title: "What is a Closure in JavaScript, and what are its practical use cases and memory leak risks?",
    question_prompt: "Define closures with lexical scoping. Describe two practical design patterns utilizing closures (such as data encapsulation / private variables and currying / memoization) and explain how lingering closures can cause memory leaks.",
    question_type: "conceptual",
    difficulty: "intermediate",
    priority: "high",
    expected_answer_points: [
      "A closure is the combination of a function bundled together with references to its surrounding lexical environment.",
      "Inner functions retain access to outer function variables even after the outer function has returned.",
      "Use cases: Data privacy (module pattern), factory functions, partial application/currying, and event handlers.",
      "Memory risk: Retaining references to large outer scope objects in long-lived callbacks (like window event listeners or timers) prevents garbage collection."
    ],
    sample_answer: "A closure occurs when a function retains access to its lexical scope even when invoked outside that scope. Because the inner function preserves a reference to outer variables, they are not garbage collected upon outer function return. Practical uses include creating private state (encapsulation) and function factories. Memory leaks happen if long-lived callbacks (like global event listeners or intervals) retain closures holding large objects.",
    follow_up_questions: [
      "How did developers implement private properties before JavaScript ES2022 private fields (#)?",
      "Why does a classic var loop inside a setTimeout print the final index unless wrapped in an IIFE or changed to let?"
    ],
    estimated_minutes: 12
  });

  addQ({
    id: "js-03",
    skill_slug: "javascript",
    skill_name: "JavaScript",
    skill_category: "programming-languages",
    topic: "Scope, hoisting and closures",
    subtopic: "var vs let vs const & TDZ",
    question_title: "Compare var, let, and const: Hoisting, Scoping, and the Temporal Dead Zone (TDZ).",
    question_prompt: "Explain how variable declaration and initialization differ between var, let, and const. What is the Temporal Dead Zone, and why does referencing a let variable before declaration throw a ReferenceError?",
    question_type: "conceptual",
    difficulty: "beginner",
    priority: "high",
    expected_answer_points: [
      "var is function-scoped (or globally scoped) and is hoisted and initialized to undefined at creation time.",
      "let and const are block-scoped ({ ... }) and their declarations are hoisted, but they remain uninitialized.",
      "The Temporal Dead Zone (TDZ) is the period between entering block scope and the execution of the declaration.",
      "Accessing a let/const variable in the TDZ throws ReferenceError: Cannot access 'x' before initialization.",
      "const requires immediate initialization and cannot be reassigned (though internal object properties remain mutable)."
    ],
    sample_answer: "var is function-scoped and hoisted with an initial value of undefined. let and const are block-scoped and their declarations are also hoisted, but they are not initialized until the line of declaration is executed. The region between entering the block and declaration is the Temporal Dead Zone (TDZ); accessing the variable inside the TDZ throws a ReferenceError. const cannot be reassigned once bound.",
    follow_up_questions: [
      "Does Object.freeze() make a const object truly deeply immutable?",
      "Why was block scoping introduced in ES6?"
    ],
    estimated_minutes: 10
  });

  addQ({
    id: "js-04",
    skill_slug: "javascript",
    skill_name: "JavaScript",
    skill_category: "programming-languages",
    topic: "this, prototypes and inheritance",
    subtopic: "this Binding Rules",
    question_title: "How is the 'this' keyword bound in JavaScript across different contexts?",
    question_prompt: "Explain the four rules of 'this' binding: Default binding, Implicit binding, Explicit binding (call, apply, bind), and new binding. How do arrow functions differ in their handling of 'this'?",
    question_type: "conceptual",
    difficulty: "intermediate",
    priority: "high",
    expected_answer_points: [
      "1. Default binding: In non-strict mode, this refers to global object (window/global); in strict mode ('use strict'), it is undefined.",
      "2. Implicit binding: When a function is called as an object method (obj.fn()), this refers to the context object.",
      "3. Explicit binding: call(thisArg, ...args), apply(thisArg, [args]), and bind(thisArg) explicitly assign this.",
      "4. New binding: When called with new, this binds to the freshly instantiated object.",
      "Arrow functions do not have their own this; they lexically inherit this from the enclosing execution context."
    ],
    sample_answer: "The 'this' keyword is resolved based on invocation context: default binding points to global/undefined; implicit binding points to the object left of the dot (obj.method()); explicit binding is set via call, apply, or bind; and new binding binds to a newly constructed instance. In contrast, arrow functions do not have a dynamic this; they capture this lexically from their enclosing parent scope.",
    follow_up_questions: [
      "Can you rebind the 'this' of an arrow function using .bind() or .call()?",
      "What is the difference between Function.prototype.call and Function.prototype.apply?"
    ],
    estimated_minutes: 12
  });

  addQ({
    id: "js-05",
    skill_slug: "javascript",
    skill_name: "JavaScript",
    skill_category: "programming-languages",
    topic: "this, prototypes and inheritance",
    subtopic: "Prototypes & Prototypal Inheritance",
    question_title: "How does Prototypal Inheritance and the Prototype Chain work in JavaScript?",
    question_prompt: "Explain the relationship between __proto__, prototype, and Object.getPrototypeOf(). How does property lookup resolve through the prototype chain until Object.prototype?",
    question_type: "conceptual",
    difficulty: "intermediate",
    priority: "medium",
    expected_answer_points: [
      "Every JavaScript object has an internal [[Prototype]] link pointing to another object (or null).",
      "Functions have a prototype property used as the [[Prototype]] for instances created with the new keyword.",
      "When accessing obj.prop, if prop is not found on the instance, engine traverses the [[Prototype]] chain upwards.",
      "The chain terminates at Object.prototype whose prototype is null; if not found, it returns undefined.",
      "Modern code inspects and manipulates prototypes using Object.getPrototypeOf() and Object.create()."
    ],
    sample_answer: "Every JavaScript object has an internal [[Prototype]] link. When you access a property on an object, the runtime checks the object itself. If missing, it traverses up the prototype chain through its prototype object until it either finds the property or reaches Object.prototype (whose prototype is null). Class syntax in ES6 is syntactic sugar over this prototypal inheritance model.",
    follow_up_questions: [
      "What is the difference between hasOwnProperty() and the 'in' operator?",
      "How does Object.create(null) differ from a standard object literal {}?"
    ],
    estimated_minutes: 10
  });

  addQ({
    id: "js-06",
    skill_slug: "javascript",
    skill_name: "JavaScript",
    skill_category: "programming-languages",
    topic: "Promises and async/await",
    subtopic: "Promise Combinators",
    question_title: "Compare Promise.all, Promise.allSettled, Promise.race, and Promise.any.",
    question_prompt: "Explain when you would use Promise.all versus Promise.allSettled, and Promise.race versus Promise.any. How does each combinator handle errors and rejections?",
    question_type: "coding",
    difficulty: "intermediate",
    priority: "high",
    expected_answer_points: [
      "Promise.all: Resolves when ALL promises resolve; rejects immediately (fail-fast) upon the FIRST rejection.",
      "Promise.allSettled: Always waits for all promises to settle (either fulfilled or rejected); returns array of {status, value/reason}. Never short-circuits on failure.",
      "Promise.race: Settles as soon as the FIRST promise settles (either resolves OR rejects).",
      "Promise.any: Resolves as soon as the FIRST promise FULFILLS. Rejects only if ALL reject (AggregateError)."
    ],
    sample_answer: "Promise.all runs tasks in parallel and resolves an array of values, but fails fast if any single promise rejects. Promise.allSettled waits for all promises to finish regardless of failures, returning individual statuses—ideal for independent batch requests. Promise.race settles as soon as the first promise resolves or rejects (common for timeouts). Promise.any resolves on the first successful fulfillment and ignores rejections unless all fail.",
    follow_up_questions: [
      "How do you implement an API timeout wrapper using Promise.race?",
      "What type of error is thrown when all promises passed to Promise.any reject?"
    ],
    estimated_minutes: 10
  });

  addQ({
    id: "js-07",
    skill_slug: "javascript",
    skill_name: "JavaScript",
    skill_category: "programming-languages",
    topic: "Promises and async/await",
    subtopic: "Async/Await & Error Handling",
    question_title: "How does async/await work under the hood, and how should errors be handled?",
    question_prompt: "Explain how async/await is syntactic sugar on top of Generators and Promises. Describe best practices for error handling with try/catch and avoiding unhandled promise rejections.",
    question_type: "conceptual",
    difficulty: "intermediate",
    priority: "high",
    expected_answer_points: [
      "An async function always wraps its return value in a Promise.",
      "The await keyword pauses execution of the async function body until the promise settles, yielding control back to the event loop.",
      "Under the hood, async/await is equivalent to an auto-advancing Generator (coroutine) combined with Promise.resolve().",
      "Unhandled rejections in async functions must be caught using try/catch blocks or chaining .catch().",
      "In Node.js, unhandled promise rejections trigger process 'unhandledRejection' and terminate the process in modern Node versions."
    ],
    sample_answer: "Async/await turns asynchronous promise pipelines into synchronous-looking code using generator-like resumption. An async function automatically returns a Promise, and await pauses execution inside the function without blocking the main thread. Errors thrown by awaited promises convert into catchable exceptions caught by standard try/catch blocks. Unhandled rejections must be avoided as modern Node.js versions crash on unhandled rejections.",
    follow_up_questions: [
      "Why is executing multiple awaits sequentially inside a loop an anti-pattern when tasks are independent?",
      "How does Promise.all enable parallel execution with async/await?"
    ],
    estimated_minutes: 12
  });

  addQ({
    id: "js-08",
    skill_slug: "javascript",
    skill_name: "JavaScript",
    skill_category: "programming-languages",
    topic: "Array and object methods",
    subtopic: "Deep Clone vs Shallow Copy",
    question_title: "How do you perform shallow vs deep copies of objects in JavaScript?",
    question_prompt: "Compare Object.assign / spread syntax with structuredClone() and JSON.parse(JSON.stringify()). What are the edge cases and limitations of each approach?",
    question_type: "practical_scenario",
    difficulty: "beginner",
    priority: "medium",
    expected_answer_points: [
      "Shallow copy (Object.assign, { ...obj }): Copies top-level primitive values, but nested objects/arrays retain references to original memory.",
      "JSON.parse(JSON.stringify()): Deep clones plain JSON objects, but silently strips undefined, Functions, Symbols, and converts Dates to strings, and crashes on circular references.",
      "structuredClone(): Modern standard built-in API that performs deep cloning, handles circular references, Dates, RegExps, Maps, Sets, and TypedArrays.",
      "structuredClone limitation: Cannot clone Functions or DOM nodes (throws DataCloneError)."
    ],
    sample_answer: "Spread syntax and Object.assign create shallow copies, meaning nested objects are shared by reference. For deep cloning, JSON serialization has historically been used but breaks on Dates, undefined, functions, and circular references. The modern native standard is structuredClone(), which accurately deep clones complex types including Maps, Sets, and circular structures, though it cannot clone functions or DOM elements.",
    follow_up_questions: [
      "What happens when you pass an object with a circular reference into JSON.stringify()?",
      "How does Lodash cloneDeep handle function properties?"
    ],
    estimated_minutes: 10
  });

  addQ({
    id: "js-09",
    skill_slug: "javascript",
    skill_name: "JavaScript",
    skill_category: "programming-languages",
    topic: "Array and object methods",
    subtopic: "Debounce and Throttle",
    question_title: "Explain the difference between Debounce and Throttle with implementation details.",
    question_prompt: "When should you use Debounce vs Throttle? Write or explain the implementation of both functions and their typical use cases in front-end performance.",
    question_type: "coding",
    difficulty: "intermediate",
    priority: "high",
    expected_answer_points: [
      "Debounce: Delays execution until a specified quiet period has elapsed with no new triggers. Resets timer on each trigger.",
      "Debounce use case: Autocomplete search input, window resize layout recalculation, autosave after user stops typing.",
      "Throttle: Enforces a maximum execution rate: executes at most once per time window regardless of invocation frequency.",
      "Throttle use case: Scroll position tracking (infinite scroll), game loop input, mousemove listeners.",
      "Both use closures over a timer variable or timestamp."
    ],
    sample_answer: "Debounce groups multiple sequential events into a single execution after a quiet threshold: every new call cancels the pending timer and sets a new one. It is ideal for search inputs waiting for the user to pause typing. Throttle limits the execution rate so a function executes at most once every N milliseconds, ideal for high-frequency continuous events like window scrolling or mouse movements.",
    follow_up_questions: [
      "How would you support an 'immediate' (leading edge) option in a debounce function?",
      "Why is it important to cancel pending debounce timers on React component unmount?"
    ],
    estimated_minutes: 12
  });

  addQ({
    id: "js-10",
    skill_slug: "javascript",
    skill_name: "JavaScript",
    skill_category: "programming-languages",
    topic: "Error handling and modules",
    subtopic: "ES Modules vs CommonJS",
    question_title: "Compare CommonJS (require/module.exports) and ES Modules (import/export).",
    question_prompt: "What are the structural differences between CommonJS and ESM regarding static analysis, tree-shaking, synchronous vs asynchronous loading, and live bindings?",
    question_type: "conceptual",
    difficulty: "intermediate",
    priority: "medium",
    expected_answer_points: [
      "Loading mechanism: CommonJS is synchronous and runtime-evaluated; ESM is asynchronous and statically parsed.",
      "Tree-shaking: ESM static syntax (import/export at top level) allows bundlers (Webpack, Vite) to eliminate dead code. CJS dynamic require() prevents static analysis.",
      "Bindings: CJS copies values on export; ESM creates live, read-only bindings to imported values.",
      "Top-level await: Supported natively in ESM modules, but forbidden in CommonJS.",
      "Environment: Node.js defaults to CJS unless package.json specifies 'type': 'module' or files use .mjs."
    ],
    sample_answer: "CommonJS evaluates synchronously at runtime where require() returns a copied object export. ES Modules are statically parsed at compile time, enabling static analysis and tree-shaking by bundlers. ESM imports are live read-only bindings (reflecting updates in the exporting module), support top-level await, and load asynchronously. Node.js supports both via package.json 'type': 'module' or .mjs extensions.",
    follow_up_questions: [
      "Can you import a CommonJS module from an ES Module in Node.js, and vice-versa?",
      "Why does circular dependency handling behave differently in CJS vs ESM?"
    ],
    estimated_minutes: 10
  });

  // --- TYPESCRIPT (7) ---
  addQ({
    id: "ts-01",
    skill_slug: "typescript",
    skill_name: "TypeScript",
    skill_category: "programming-languages",
    topic: "Interfaces and type aliases",
    subtopic: "Interface vs Type Alias",
    question_title: "When should you use an interface versus a type alias in TypeScript?",
    question_prompt: "Compare interface and type in TypeScript. Discuss declaration merging, extending/intersection syntax, unions, primitives, and compiler performance.",
    question_type: "conceptual",
    difficulty: "beginner",
    priority: "high",
    expected_answer_points: [
      "Declaration merging: Multiple interface definitions with the same name automatically merge properties; type aliases throw duplicate identifier errors.",
      "Unions & Primitives: type aliases can model union types (type ID = string | number), tuples, and primitives; interfaces can only model object shapes.",
      "Extending: interfaces use 'extends' keyword; types use intersection (&).",
      "Compiler performance: interfaces can be cached by the type checker by name, providing minor compilation performance advantages on large object hierarchies.",
      "Rule of thumb: Use interface for public API object contracts and classes; use type for unions, intersections, and mapped types."
    ],
    sample_answer: "Interfaces define object contracts and support declaration merging (useful for library typing and extending global namespaces). Type aliases are more expressive: they can represent unions, intersections, primitives, and mapped types. Interfaces extend via 'extends' while types use intersection (&). The general guideline is to use interfaces for extensible object shapes and React component props, and types for unions and complex utility transformations.",
    follow_up_questions: [
      "Can an interface extend a union type alias?",
      "What is declaration merging and how is it used to augment Express.Request with custom user objects?"
    ],
    estimated_minutes: 10
  });

  addQ({
    id: "ts-02",
    skill_slug: "typescript",
    skill_name: "TypeScript",
    skill_category: "programming-languages",
    topic: "Generics",
    subtopic: "Generic Constraints & Keyof",
    question_title: "How do Generic Constraints and keyof work in TypeScript?",
    question_prompt: "Explain how to constrain generic type parameters using the extends keyword and keyof. Show how a type-safe getProperty<T, K extends keyof T>(obj: T, key: K) function works.",
    question_type: "coding",
    difficulty: "intermediate",
    priority: "high",
    expected_answer_points: [
      "Generics allow writing reusable components that work over a variety of types rather than a single one.",
      "The 'extends' keyword applies a constraint: <T extends { id: string }> requires T to have at least an id property.",
      "keyof T produces a union of string/number literal keys of T.",
      "getProperty<T, K extends keyof T>(obj: T, key: K): T[K] ensures compile-time safety so only valid properties can be requested, returning the exact property type."
    ],
    sample_answer: "Generics provide parameterized typing. Generic constraints use 'extends' to restrict allowable types (e.g. <T extends HasId>). Combining this with the 'keyof' operator allows type-safe property access: function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] ensures that the passed key strictly belongs to T at compile time and the return value is inferred as the exact property type.",
    follow_up_questions: [
      "What is the difference between <T extends unknown> and <T extends any>?",
      "How do default generic parameters work (e.g. <T = string>)?"
    ],
    estimated_minutes: 12
  });

  addQ({
    id: "ts-03",
    skill_slug: "typescript",
    skill_name: "TypeScript",
    skill_category: "programming-languages",
    topic: "Utility types and narrowing",
    subtopic: "Built-in Utility Types",
    question_title: "Explain key TypeScript Utility Types: Partial, Pick, Omit, Record, and ReturnType.",
    question_prompt: "Explain the implementation and usage of Partial<T>, Pick<T, K>, Omit<T, K>, Record<K, V>, and ReturnType<T>. How are mapped types and conditional types used to build them?",
    question_type: "conceptual",
    difficulty: "intermediate",
    priority: "high",
    expected_answer_points: [
      "Partial<T>: Makes all properties optional using mapped type { [P in keyof T]?: T[P] }.",
      "Pick<T, K>: Extracts a subset of properties { [P in K]: T[P] } where K extends keyof T.",
      "Omit<T, K>: Constructs type by picking all properties then removing K using Pick<T, Exclude<keyof T, K>>.",
      "Record<K, V>: Constructs an object type with property keys K and values V.",
      "ReturnType<T>: Extracts return type of a function using conditional types and infer: T extends (...args: any[]) => infer R ? R : any."
    ],
    sample_answer: "TypeScript utility types transform existing types. Partial<T> marks all properties optional. Pick<T, K> retains only specified keys, whereas Omit<T, K> excludes them. Record<K, V> creates dictionary maps. ReturnType<T> uses conditional types and the 'infer' keyword to extract what a function returns without calling it. They are essential for DRY typing across domain models and API request/response DTOs.",
    follow_up_questions: [
      "How does the infer keyword work in conditional types?",
      "What is the difference between Readonly<T> and Object.freeze()?"
    ],
    estimated_minutes: 12
  });

  addQ({
    id: "ts-04",
    skill_slug: "typescript",
    skill_name: "TypeScript",
    skill_category: "programming-languages",
    topic: "Utility types and narrowing",
    subtopic: "Type Guards and Narrowing",
    question_title: "How do Discriminated Unions and Custom Type Guards work in TypeScript?",
    question_prompt: "Explain type narrowing using typeof, instanceof, in operator, discriminated unions (tagged unions), and custom type predicates (x is Type). Why are discriminated unions ideal for Redux actions and API states?",
    question_type: "coding",
    difficulty: "intermediate",
    priority: "critical",
    expected_answer_points: [
      "Type narrowing refines an ambiguous type (e.g. string | number) to a more specific type within a conditional block.",
      "Standard guards: typeof (for primitives), instanceof (for classes), and 'in' (for checking object property existence).",
      "Discriminated unions: A set of types sharing a common literal property (e.g. type: 'success' | 'error') enabling switch-case exhaustiveness.",
      "Custom type predicate: A function returning boolean with signature 'pet is Dog', instructing the compiler to narrow inside if-blocks.",
      "Exhaustiveness check: Using 'const _exhaustiveCheck: never = x' inside default branches catches unhandled cases at compile time."
    ],
    sample_answer: "Discriminated unions use a shared literal property (like type: 'loading' | 'success' | 'error') to allow TypeScript to narrow complex union types inside switch statements. Custom type guards use the syntax 'arg is SpecificType' to provide user-defined narrowing logic. Pairing discriminated unions with a never type check in the default branch guarantees exhaustive compile-time handling of every state.",
    follow_up_questions: [
      "What is the never type and how does it guarantee exhaustive checking in TypeScript?",
      "What is the difference between unknown and any when writing type guards?"
    ],
    estimated_minutes: 12
  });

  addQ({
    id: "ts-05",
    skill_slug: "typescript",
    skill_name: "TypeScript",
    skill_category: "programming-languages",
    topic: "Static typing and inference",
    subtopic: "unknown vs any vs never",
    question_title: "Explain the differences between any, unknown, void, and never in TypeScript.",
    question_prompt: "Compare any, unknown, void, and never. Explain type safety implications and why unknown is preferred over any for unvalidated external API inputs.",
    question_type: "conceptual",
    difficulty: "beginner",
    priority: "high",
    expected_answer_points: [
      "any: Disables type-checking entirely. Any operation is permitted, turning off TypeScript guarantees.",
      "unknown: Top type (type-safe any). An unknown variable cannot have methods called or properties accessed without first narrowing via type guards or assertions.",
      "void: Indicates absence of a return value in functions that complete normally.",
      "never: Bottom type representing values that never occur (e.g. functions that always throw errors, infinite loops, or exhausted union branches)."
    ],
    sample_answer: "The 'any' type bypasses all compile-time checks, whereas 'unknown' is the type-safe counterpart where any value can be assigned to it, but nothing can be done with it until it is narrowed via type checks or validation (like Zod). 'void' represents functions that return nothing, while 'never' represents states that can never occur, such as a function that always throws an exception or an impossible union state.",
    follow_up_questions: [
      "Why should API response payloads initially be typed as unknown rather than any?",
      "Can you assign anything to a variable of type never?"
    ],
    estimated_minutes: 10
  });

  addQ({
    id: "ts-06",
    skill_slug: "typescript",
    skill_name: "TypeScript",
    skill_category: "programming-languages",
    topic: "Typing React props and API responses",
    subtopic: "React Types & Component Props",
    question_title: "How do you type React components, props, hooks, and event handlers in TypeScript?",
    question_prompt: "Detail best practices for typing React component props (children: React.ReactNode), onChange event handlers (React.ChangeEvent<HTMLInputElement>), and generic forwardRef in modern React.",
    question_type: "coding",
    difficulty: "intermediate",
    priority: "medium",
    expected_answer_points: [
      "Props should be typed with explicit interfaces or types rather than React.FC (which formerly had implicit children issues).",
      "children should be typed as React.ReactNode (covers strings, JSX elements, fragments, null).",
      "Events are typed with synthetic event generics: React.MouseEvent<HTMLButtonElement>, React.ChangeEvent<HTMLInputElement>, React.FormEvent<HTMLFormElement>.",
      "useState with non-primitive or empty states requires generic declaration: useState<User | null>(null).",
      "Component props can extend HTMLAttributes<HTMLDivElement> or ComponentPropsWithoutRef<'button'>."
    ],
    sample_answer: "In modern React with TypeScript, define explicit prop interfaces instead of using React.FC. Type children as React.ReactNode and DOM events using React's synthetic event generics like React.ChangeEvent<HTMLInputElement>. For custom reusable UI components that mirror standard HTML elements, extend React.ComponentPropsWithoutRef<'button'> to inherit native HTML attributes while passing custom props.",
    follow_up_questions: [
      "Why did the React community move away from React.FC in TypeScript?",
      "What is the difference between React.ReactNode and React.JSX.Element?"
    ],
    estimated_minutes: 10
  });

  addQ({
    id: "ts-07",
    skill_slug: "typescript",
    skill_name: "TypeScript",
    skill_category: "programming-languages",
    topic: "Static typing and inference",
    subtopic: "tsconfig Configuration & Strict Mode",
    question_title: "What does 'strict: true' enable in tsconfig.json, and why is it essential?",
    question_prompt: "Explain the key compiler options bundled inside strict: true (noImplicitAny, strictNullChecks, strictFunctionTypes, strictPropertyInitialization). How does strictNullChecks prevent runtime errors?",
    question_type: "conceptual",
    difficulty: "intermediate",
    priority: "medium",
    expected_answer_points: [
      "strict: true activates a broad suite of type-checking behaviors.",
      "noImplicitAny: Flags any expression or declaration that implicitly falls back to any.",
      "strictNullChecks: null and undefined are not in the domain of every type; accessing properties on potential null/undefined requires explicit checks or optional chaining (?.).",
      "strictPropertyInitialization: Ensures class properties are initialized in the constructor or declared optional.",
      "strictFunctionTypes: Checks function parameters contravariantly rather than bivariantly."
    ],
    sample_answer: "Setting 'strict: true' in tsconfig turns on essential flags like noImplicitAny and strictNullChecks. Without strictNullChecks, null and undefined are assignable to any type, hiding null-pointer errors at compile time. With it enabled, TypeScript forces developers to handle null and undefined explicitly through optional chaining, nullish coalescing, or type narrowing, eliminating an entire category of production runtime crashes.",
    follow_up_questions: [
      "What is the difference between the optional chaining operator (?.) and the non-null assertion operator (!)?",
      "Why is using the non-null assertion operator (!) discouraged in production code?"
    ],
    estimated_minutes: 10
  });

  // --- C (4) ---
  addQ({
    id: "c-01",
    skill_slug: "c",
    skill_name: "C",
    skill_category: "programming-languages",
    topic: "Pointers and memory",
    subtopic: "Pointers, Addresses, and Dereferencing",
    question_title: "Explain pointers, pointer arithmetic, and dereferencing in C.",
    question_prompt: "What is a pointer in C? Explain the address-of (&) and dereference (*) operators. How does pointer arithmetic scale with the data type size?",
    question_type: "conceptual",
    difficulty: "beginner",
    priority: "low",
    expected_answer_points: [
      "A pointer is a variable that stores the memory address of another variable.",
      "& (address-of) retrieves the physical memory address of a variable; * (dereference) accesses the value stored at that address.",
      "Pointer arithmetic: ptr + 1 increments the memory address by sizeof(dataType) bytes (e.g. +4 bytes for a 32-bit int, +8 bytes for a 64-bit double).",
      "Array indexing arr[i] is syntactically equivalent to *(arr + i)."
    ],
    sample_answer: "A pointer holds a memory address. The '&' operator retrieves an address, and '*' dereferences it to read or write the underlying value. Pointer arithmetic is scaled by the size of the underlying type: incrementing an int* advances the address by 4 bytes (on 32/64-bit systems). In C, arrays decay into pointers, and arr[i] is directly equivalent to *(arr + i).",
    follow_up_questions: [
      "What is a void* pointer in C, and can you perform pointer arithmetic directly on it?",
      "What is a dangling pointer and how is it created?"
    ],
    estimated_minutes: 8
  });

  addQ({
    id: "c-02",
    skill_slug: "c",
    skill_name: "C",
    skill_category: "programming-languages",
    topic: "Stack versus heap",
    subtopic: "Dynamic Memory Allocation",
    question_title: "Compare Stack vs Heap memory allocation and malloc, calloc, realloc, and free in C.",
    question_prompt: "Explain differences between stack-allocated local variables and heap memory allocated via malloc/calloc. What happens if free() is omitted or called twice (double free)?",
    question_type: "conceptual",
    difficulty: "intermediate",
    priority: "low",
    expected_answer_points: [
      "Stack: Fast, automated allocation/deallocation scoped to function frames. Limited size (stack overflow danger).",
      "Heap: Manual allocation for variable lifetime. Managed via malloc (uninitialized bytes), calloc (zero-initialized), realloc (resizes buffer), and free.",
      "Memory leak: Omitting free() retains allocated memory until process termination.",
      "Double free: Calling free() on the same pointer twice corrupts heap allocation metadata, leading to crashes or security exploits."
    ],
    sample_answer: "Stack memory is fast and automatically reclaimed when functions return, but has fixed size limits. Heap memory is allocated dynamically at runtime: malloc allocates uninitialized bytes, calloc allocates and zeroes the memory, realloc resizes existing allocations, and free returns memory to the OS. Forgetting free causes memory leaks; calling free twice causes undefined behavior and heap corruption.",
    follow_up_questions: [
      "Why should you set a pointer to NULL immediately after freeing it?",
      "What does malloc(0) return according to the C standard?"
    ],
    estimated_minutes: 10
  });

  addQ({
    id: "c-03",
    skill_slug: "c",
    skill_name: "C",
    skill_category: "programming-languages",
    topic: "Structs and unions",
    subtopic: "Structs, Unions, and Memory Alignment",
    question_title: "What is the difference between a struct and a union in C, and what is structure padding?",
    question_prompt: "Compare structs and unions in C regarding memory layout and simultaneous member access. Explain structure padding and alignment requirements.",
    question_type: "conceptual",
    difficulty: "intermediate",
    priority: "low",
    expected_answer_points: [
      "Struct: Each member has its own separate memory location; total size is at least the sum of member sizes plus padding bytes.",
      "Union: All members share the exact same memory location; total size equals the size of the largest member; only one member can be actively stored at a time.",
      "Structure padding: Compilers insert alignment padding so data members align to word boundaries (e.g. 4 or 8 bytes) for fast CPU bus access.",
      "#pragma pack(1) can disable padding to reduce memory at the cost of slower unaligned CPU memory reads."
    ],
    sample_answer: "In a struct, every member has its own distinct offset in memory, whereas in a union, all members share the same starting memory address (meaning only one member can be held at any time). The size of a union is determined by its largest member. Compilers add padding bytes to structs to ensure fields align with processor word boundaries for efficient memory bus reads.",
    follow_up_questions: [
      "How does ordering fields from largest to smallest inside a struct minimize padding bytes?",
      "What is a tagged union (variant) pattern in C?"
    ],
    estimated_minutes: 8
  });

  addQ({
    id: "c-04",
    skill_slug: "c",
    skill_name: "C",
    skill_category: "programming-languages",
    topic: "Compilation and linking",
    subtopic: "C Compilation Stages",
    question_title: "Describe the four stages of C compilation: Preprocessing, Compilation, Assembly, and Linking.",
    question_prompt: "Walk through what happens during Preprocessing (gcc -E), Compilation (gcc -S), Assembly (gcc -c), and Linking. What causes unresolved external symbol linker errors?",
    question_type: "conceptual",
    difficulty: "beginner",
    priority: "low",
    expected_answer_points: [
      "1. Preprocessing: Expands #include headers, replaces #define macros, and strips comments to produce preprocessed .i code.",
      "2. Compilation: Translates preprocessed C code into assembly instructions (.s).",
      "3. Assembly: Translates assembly instructions into machine-code relocatable object files (.o).",
      "4. Linking: Resolves function calls and external symbol references across multiple object files and static/shared libraries into a final binary executable.",
      "Unresolved external symbol errors occur at link time when a function declared in a header has no matching implementation in any linked object file or library."
    ],
    sample_answer: "The C build process has four stages: Preprocessing expands macros and includes header files; Compilation turns C code into assembly code; Assembly translates assembly into binary machine object files (.o); and Linking binds external function calls, global symbols, and library dependencies into the final executable. Linker errors occur when a declared symbol cannot be matched to any compiled object definition.",
    follow_up_questions: [
      "What is the purpose of header guards (#ifndef HEADER_H ... #endif)?",
      "What is the difference between static linking (.a/.lib) and dynamic linking (.so/.dll)?"
    ],
    estimated_minutes: 8
  });

  // --- C++ (4) ---
  addQ({
    id: "cpp-01",
    skill_slug: "cpp",
    skill_name: "C++",
    skill_category: "programming-languages",
    topic: "Memory management and RAII",
    subtopic: "RAII & Smart Pointers",
    question_title: "Explain RAII (Resource Acquisition Is Initialization) and Smart Pointers in C++.",
    question_prompt: "Define RAII. Compare std::unique_ptr, std::shared_ptr, and std::weak_ptr. How do smart pointers prevent memory leaks and dangling references?",
    question_type: "conceptual",
    difficulty: "intermediate",
    priority: "low",
    expected_answer_points: [
      "RAII binds the lifecycle of a resource (heap memory, file handle, socket, mutex lock) to the lifetime of a stack-allocated object whose destructor automatically releases the resource when scope exits.",
      "std::unique_ptr: Exclusive ownership; cannot be copied, only moved via std::move; zero runtime overhead compared to raw pointer.",
      "std::shared_ptr: Shared ownership via reference-counted control block. Reclaims memory when reference count drops to zero.",
      "std::weak_ptr: Non-owning observer of a shared_ptr; breaks circular references without preventing deletion."
    ],
    sample_answer: "RAII ties resource ownership to object lifetime: resources are acquired in constructors and released in destructors when the stack frame unwinds. Modern C++ replaces raw pointers with smart pointers: unique_ptr gives zero-overhead exclusive ownership (movable, non-copyable); shared_ptr uses atomic reference counting for shared ownership; and weak_ptr provides a non-owning reference to avoid circular reference leaks.",
    follow_up_questions: [
      "Why should you prefer std::make_unique and std::make_shared over calling new directly?",
      "How does a circular reference between two shared_ptr objects lead to a memory leak?"
    ],
    estimated_minutes: 10
  });

  addQ({
    id: "cpp-02",
    skill_slug: "cpp",
    skill_name: "C++",
    skill_category: "programming-languages",
    topic: "OOP and virtual functions",
    subtopic: "Virtual Functions & vtable Internals",
    question_title: "How does runtime polymorphism work in C++ using virtual functions and vtables?",
    question_prompt: "Explain how C++ implements dynamic dispatch using the Virtual Method Table (vtable) and Virtual Pointer (vptr). Why should a base class always have a virtual destructor?",
    question_type: "conceptual",
    difficulty: "intermediate",
    priority: "low",
    expected_answer_points: [
      "When a class declares a virtual function, the compiler generates a static vtable containing function pointers for that class.",
      "Every instance of the class receives a hidden pointer (vptr) pointing to the class vtable.",
      "Dynamic dispatch resolves calls via vptr->vtable[index] at runtime.",
      "Virtual destructor: If a derived object is deleted via a base class pointer (Base* p = new Derived()), a non-virtual destructor executes ONLY the base destructor, leaking derived class resources."
    ],
    sample_answer: "Dynamic polymorphism in C++ is implemented via vtables and vptrs. Classes with virtual functions generate a vtable containing pointers to the virtual methods, and each instance stores a hidden vptr pointing to that table. At runtime, calls are dispatched through the vptr. Base classes must have a virtual destructor so that deleting a derived object via a base pointer properly calls the derived destructor first, preventing resource leaks.",
    follow_up_questions: [
      "What is a pure virtual function (virtual void fn() = 0) and an abstract class?",
      "What is the memory size overhead added to an object when it contains virtual functions?"
    ],
    estimated_minutes: 10
  });

  addQ({
    id: "cpp-03",
    skill_slug: "cpp",
    skill_name: "C++",
    skill_category: "programming-languages",
    topic: "Move semantics basics",
    subtopic: "Move Semantics & Rvalue References",
    question_title: "What are Move Semantics and Rvalue References (&&) in C++11?",
    question_prompt: "Explain lvalues vs rvalues, rvalue references (Type&&), and std::move. How does move semantics eliminate unnecessary deep copies in standard containers?",
    question_type: "conceptual",
    difficulty: "advanced",
    priority: "low",
    expected_answer_points: [
      "Lvalue: An expression with an identifiable memory address that persists beyond a single expression (e.g. named variables).",
      "Rvalue: Temporary value or literal that does not persist beyond the expression (e.g. temporary return from a function).",
      "Rvalue reference (&&): Binds to temporary rvalues.",
      "Move semantics: Instead of deep copying internal heap arrays, a move constructor 'steals' the pointer from the rvalue and sets the source pointer to nullptr.",
      "std::move is an unconditional cast to an rvalue reference, enabling move constructors."
    ],
    sample_answer: "Move semantics allow resources (like heap memory) to be transferred from temporary objects (rvalues) instead of performing expensive deep copies. Lvalues represent persistent named variables, while rvalues are temporaries. Rvalue references (&&) bind to temporaries, enabling move constructors to steal internal buffer pointers in O(1) time. std::move simply casts an lvalue to an rvalue reference so it can be moved.",
    follow_up_questions: [
      "What is the state of an object after it has been moved from?",
      "What is perfect forwarding and why is std::forward used with universal references?"
    ],
    estimated_minutes: 10
  });

  addQ({
    id: "cpp-04",
    skill_slug: "cpp",
    skill_name: "C++",
    skill_category: "programming-languages",
    topic: "STL containers and algorithms",
    subtopic: "std::vector vs std::list & Iterator Invalidation",
    question_title: "Compare std::vector and std::list in C++: Cache locality and iterator invalidation.",
    question_prompt: "Compare std::vector (dynamic array) and std::list (doubly linked list). Why does std::vector outperform std::list in traversal and search, and how does reallocation invalidate iterators?",
    question_type: "conceptual",
    difficulty: "intermediate",
    priority: "low",
    expected_answer_points: [
      "Memory layout: std::vector stores elements in contiguous memory; std::list allocates separate heap nodes with forward/backward pointers.",
      "Cache locality: Contiguous memory in vector allows CPU prefetching and cache hits, making traversal vastly faster than pointer-chasing in list.",
      "Vector push_back: Amortized O(1) time, but when capacity is exceeded, it reallocates a larger buffer and copies/moves elements.",
      "Iterator invalidation: When a vector reallocates, ALL existing iterators, pointers, and references are invalidated. Adding to std::list never invalidates iterators to other elements."
    ],
    sample_answer: "std::vector uses contiguous memory, providing superior CPU cache locality and spatial prefetching, making it significantly faster than std::list for iteration and random access (O(1)). std::list is a doubly linked list with O(1) insertions anywhere once located, but suffers from cache misses and pointer overhead. Vector growth causes reallocation that invalidates all existing iterators, which can be mitigated with reserve().",
    follow_up_questions: [
      "What is the difference between vector.reserve() and vector.resize()?",
      "Why is std::vector<bool> specialized in the C++ standard library?"
    ],
    estimated_minutes: 10
  });
};
