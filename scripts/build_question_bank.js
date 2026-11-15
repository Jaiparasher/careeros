const fs = require('fs');
const path = require('path');

const cat = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../seed-data/interview-skills-catalog.json'), 'utf8'));

// Helper to construct questions
const questions = [];

function addQ({
  id,
  skill_slug,
  skill_name,
  skill_category,
  topic,
  subtopic,
  question_title,
  question_prompt,
  question_type,
  difficulty,
  priority,
  target_roles = ["Java Backend Developer", "Software Engineer"],
  tags = [],
  expected_answer_points,
  sample_answer,
  follow_up_questions,
  estimated_minutes = 12
}) {
  questions.push({
    source_external_id: id,
    skill_slug,
    skill_name,
    skill_category,
    topic,
    subtopic: subtopic || null,
    question_title,
    question_prompt,
    question_type,
    difficulty,
    priority,
    target_roles,
    tags: Array.from(new Set([skill_slug, topic.toLowerCase().replace(/\s+/g, '-'), ...tags])),
    expected_answer_points,
    sample_answer,
    follow_up_questions,
    estimated_minutes,
    source_name: "CareerOS curated"
  });
}

console.log("Building high-yield interview questions dataset...");

// --- 1. Programming Languages ---
// Java (12)
addQ({
  id: "java-01",
  skill_slug: "java",
  skill_name: "Java",
  skill_category: "programming-languages",
  topic: "Collections",
  subtopic: "HashMap Internals",
  question_title: "How does HashMap work internally in Java 8+?",
  question_prompt: "Explain the internal architecture of HashMap in Java 8+. Detail how buckets, hash codes, collisions, load factors, rehashing, and the treeification threshold (TreeNode/Red-Black Tree) function.",
  question_type: "conceptual",
  difficulty: "intermediate",
  priority: "critical",
  expected_answer_points: [
    "HashMap uses an array of Node<K,V> (buckets) with initial capacity 16 and default load factor 0.75.",
    "Hash code is calculated and mixed via (h ^ (h >>> 16)) to spread higher bits, and bucket index is computed as (n - 1) & hash.",
    "When a collision occurs, entries are chained as a singly linked list.",
    "In Java 8+, if a bucket length exceeds TREEIFY_THRESHOLD (8) and total table capacity is at least 64 (MIN_TREEIFY_CAPACITY), the list transforms into a Red-Black Tree, improving worst-case search from O(n) to O(log n).",
    "Rehashing doubles the table capacity when size exceeds capacity * load factor, redistributing nodes based on the new bit mask."
  ],
  sample_answer: "In Java 8, HashMap is backed by an array of Node<K,V> buckets. When inserting, the key's hash code is perturbed and indexed via (n - 1) & hash. Collisions initially form a linked list. If a bucket's collision chain exceeds 8 nodes and the total table capacity is at least 64, it converts to a Red-Black Tree (O(log n) lookup). When the element count exceeds capacity * load factor (default 0.75), the array doubles and rehashes entries.",
  follow_up_questions: [
    "Why is the treeification threshold chosen as 8 and untreeify threshold as 6?",
    "Why must keys used in HashMap be immutable and implement both equals() and hashCode()?",
    "How does ConcurrentHashMap achieve thread safety without locking the whole table?"
  ],
  estimated_minutes: 15
});

addQ({
  id: "java-02",
  skill_slug: "java",
  skill_name: "Java",
  skill_category: "programming-languages",
  topic: "Object-Oriented Programming",
  subtopic: "equals and hashCode contract",
  question_title: "Explain the equals() and hashCode() contract in Java and consequences of breaking it.",
  question_prompt: "What is the contract between equals() and hashCode() in Java? What specific bugs occur in hash-based collections if you override equals() without overriding hashCode()?",
  question_type: "conceptual",
  difficulty: "basic",
  priority: "critical",
  expected_answer_points: [
    "If two objects are equal according to equals(Object), their hashCode() must produce the same integer.",
    "If two objects produce the same hashCode, they do not necessarily have to be equal (hash collision).",
    "If equals() is overridden without hashCode(), two logically equivalent objects will have distinct identity hash codes.",
    "In HashSet or HashMap, duplicate keys will be stored in different buckets or failed lookups will return null because get() checks hashCode first before calling equals()."
  ],
  sample_answer: "The contract states that if a.equals(b) is true, then a.hashCode() must equal b.hashCode(). If equals() is overridden without hashCode(), two logically identical objects produce different hash codes. In a HashMap or HashSet, a lookup with an identical key will search the wrong bucket and return null, or duplicate keys will be inserted, corrupting set invariants.",
  follow_up_questions: [
    "Can two unequal objects have the same hashCode?",
    "What fields should typically be included in the hashCode computation?"
  ],
  estimated_minutes: 10
});

addQ({
  id: "java-03",
  skill_slug: "java",
  skill_name: "Java",
  skill_category: "programming-languages",
  topic: "JVM and Memory Management",
  subtopic: "Garbage Collection & Generations",
  question_title: "Describe the JVM generational heap memory model and GC process.",
  question_prompt: "Explain how the JVM divides heap memory into Young (Eden, S0, S1) and Tenured/Old generation. How do Minor GC and Major/Full GC work, and how does object aging/tenuring happen?",
  question_type: "conceptual",
  difficulty: "intermediate",
  priority: "critical",
  expected_answer_points: [
    "Heap is partitioned into Young Generation (Eden, Survivor 0, Survivor 1) and Old (Tenured) Generation, based on the Weak Generational Hypothesis.",
    "New objects are allocated in Eden. When Eden fills, a Minor GC triggers, copying live objects to a Survivor space with tenure age 1.",
    "Survivor spaces alternate roles (From-space and To-space) using a copying collector.",
    "When an object's age exceeds the threshold (MaxTenuringThreshold, default typically 15), it is promoted to the Old Generation.",
    "Old generation is collected via Major/Full GC when it fills up, which is typically more expensive and can cause noticeable STW (Stop-The-World) pauses."
  ],
  sample_answer: "JVM heap memory is split into Young (Eden, S0, S1) and Old generations based on the hypothesis that most objects die young. Minor GC collects Eden and surviving objects move between S0 and S1 with incremented age. Once an object survives enough cycles (typically age 15), it is promoted to the Old generation. When the Old generation lacks space, a Full GC occurs, which cleans both young and old spaces with longer Stop-The-World pauses.",
  follow_up_questions: [
    "What is the difference between G1 GC and ZGC in modern Java versions?",
    "What triggers an OutOfMemoryError: Java heap space vs Metaspace?"
  ],
  estimated_minutes: 15
});

addQ({
  id: "java-04",
  skill_slug: "java",
  skill_name: "Java",
  skill_category: "programming-languages",
  topic: "Multithreading and Concurrency",
  subtopic: "Volatile vs Synchronized",
  question_title: "Compare volatile vs synchronized in Java multithreading.",
  question_prompt: "Explain the difference between the volatile keyword and synchronized blocks in Java. What does volatile guarantee regarding visibility and instruction reordering, and why does it not guarantee atomicity?",
  question_type: "conceptual",
  difficulty: "intermediate",
  priority: "critical",
  expected_answer_points: [
    "volatile guarantees visibility across CPU caches by establishing a happens-before relationship and flushing writes directly to main memory.",
    "volatile prevents instruction reordering via memory barriers (load-load, store-store, etc.).",
    "volatile does NOT guarantee atomicity for compound operations (e.g. count++ involves read, modify, write).",
    "synchronized provides mutual exclusion (locking) ensuring both atomicity and visibility across threads for the synchronized block.",
    "For atomic compound operations without lock overhead, AtomicInteger or VarHandle should be preferred."
  ],
  sample_answer: "The volatile keyword guarantees visibility and ordering (preventing instruction reordering via memory barriers), ensuring all threads read the latest value directly from main memory. However, volatile does not guarantee atomicity for compound operations like count++. synchronized guarantees both mutual exclusion (atomicity) and visibility by acquiring an intrinsic monitor lock on an object.",
  follow_up_questions: [
    "How does the Double-Checked Locking singleton pattern work and why is volatile mandatory in it?",
    "What are Java's Atomic classes based on (CAS instruction)?"
  ],
  estimated_minutes: 15
});

addQ({
  id: "java-05",
  skill_slug: "java",
  skill_name: "Java",
  skill_category: "programming-languages",
  topic: "Java 8+ Functional Programming",
  subtopic: "Streams API & Parallel Streams",
  question_title: "How do Java Streams work internally, and when should parallel streams be avoided?",
  question_prompt: "Explain the difference between intermediate and terminal stream operations. How does stream pipelining achieve laziness? When is parallelStream() beneficial versus counterproductive?",
  question_type: "conceptual",
  difficulty: "intermediate",
  priority: "high",
  expected_answer_points: [
    "Intermediate operations (filter, map, flatMap) are lazy and return a new Stream; they do not process elements until a terminal operation is called.",
    "Terminal operations (collect, forEach, reduce) trigger the pipeline traversal.",
    "Intermediate operations are fused into single-pass pipelines via Spliterator.",
    "parallelStream() utilizes the common ForkJoinPool (ForkJoinPool.commonPool()).",
    "Avoid parallelStream() for small datasets (overhead exceeds gain), blocking I/O tasks (saturates common pool), or stateful operations (boxed overhead, non-associative accumulators)."
  ],
  sample_answer: "Java Streams process data lazily: intermediate operations build a pipeline of stateless operations without traversing elements until a terminal operation initiates evaluation. This allows loop fusion and short-circuiting. parallelStream splits work across ForkJoinPool.commonPool. It should be avoided for I/O-bound tasks, small collections where thread overhead dominates, and stateful lambda operations.",
  follow_up_questions: [
    "What is the difference between map() and flatMap()?",
    "Why should you never execute blocking I/O calls inside a parallel stream?"
  ],
  estimated_minutes: 12
});

addQ({
  id: "java-06",
  skill_slug: "java",
  skill_name: "Java",
  skill_category: "programming-languages",
  topic: "Strings and Immutability",
  subtopic: "String Constant Pool",
  question_title: "Why is String immutable in Java and how does the String Constant Pool work?",
  question_prompt: "Why was String designed to be immutable in Java? Detail the memory, security, caching, and concurrency advantages, and explain String literal pooling versus new String().",
  question_type: "conceptual",
  difficulty: "basic",
  priority: "high",
  expected_answer_points: [
    "Security: Network connections, file paths, database URLs, and username/passwords rely on String immutability so they cannot be altered maliciously after verification.",
    "Caching: The String Constant Pool (SCP in the heap) allows identical string literals to share one instance, reducing memory footprint.",
    "Thread safety: Immutable strings are inherently thread-safe without synchronization.",
    "Hash code caching: Because the string value cannot change, hashCode is computed once lazily and cached.",
    "String literal (\"abc\") checks SCP first; new String(\"abc\") explicitly creates a new object on the heap even if \"abc\" is in SCP."
  ],
  sample_answer: "String is immutable in Java for security (preventing tampering of file paths, URLs, and auth tokens), memory optimization via the String Constant Pool, thread safety without locking, and enabling hashCode caching for O(1) hash map operations. String literals reuse instances in the SCP, while new String() allocates a distinct object on the normal heap.",
  follow_up_questions: [
    "What does String.intern() do?",
    "When should you use StringBuilder instead of StringBuffer?"
  ],
  estimated_minutes: 10
});

addQ({
  id: "java-07",
  skill_slug: "java",
  skill_name: "Java",
  skill_category: "programming-languages",
  topic: "Generics",
  subtopic: "Type Erasure and Wildcards",
  question_title: "Explain Type Erasure in Java Generics and the PECS rule.",
  question_prompt: "What is type erasure in Java Generics, and why was it introduced? Explain Producer Extends, Consumer Super (PECS) with an example.",
  question_type: "conceptual",
  difficulty: "intermediate",
  priority: "medium",
  expected_answer_points: [
    "Type erasure removes generic type information at compile-time, replacing unbounded type parameters with Object (or bounds), inserting casts where necessary.",
    "It was introduced in Java 5 to maintain backward compatibility with pre-generic bytecode.",
    "At runtime, List<String> and List<Integer> share the exact same raw Class type (List.class).",
    "PECS stands for Producer Extends, Consumer Super.",
    "Use <? extends T> when reading (producing) values from a collection (covariance).",
    "Use <? super T> when writing (consuming) values into a collection (contravariance)."
  ],
  sample_answer: "Type erasure compiles generic type information away into raw types with synthetic casts to preserve backward compatibility with legacy Java 1.4 bytecode. Because of this, generic types cannot be checked at runtime with instanceof. The PECS rule (Producer Extends, Consumer Super) dictates variance: use <? extends T> if you only read items from the collection, and <? super T> if you write items into it.",
  follow_up_questions: [
    "Why can't you create a generic array like new T[10]?",
    "How does Collections.copy(dest, src) use <? super T> and <? extends T>?"
  ],
  estimated_minutes: 12
});

addQ({
  id: "java-08",
  skill_slug: "java",
  skill_name: "Java",
  skill_category: "programming-languages",
  topic: "Exception Handling",
  subtopic: "Checked vs Unchecked",
  question_title: "Checked vs Unchecked Exceptions: Best practices and try-with-resources.",
  question_prompt: "Compare checked exceptions (subclasses of Exception) with unchecked exceptions (RuntimeException). What are the design guidelines for modern Java applications, and how does try-with-resources handle suppressed exceptions?",
  question_type: "conceptual",
  difficulty: "basic",
  priority: "high",
  expected_answer_points: [
    "Checked exceptions (IOException, SQLException) must be caught or declared in throws clause, representing recoverable environmental failures.",
    "Unchecked exceptions (NullPointerException, IllegalArgumentException) inherit from RuntimeException and represent programming bugs.",
    "Modern frameworks (Spring, Hibernate) wrap checked exceptions into unchecked exceptions to avoid cluttering business interfaces.",
    "try-with-resources automatically closes any resource implementing AutoCloseable.",
    "If an exception is thrown in both the try block and during auto-close, the close exception is added to the primary exception as a suppressed exception (accessible via getSuppressed())."
  ],
  sample_answer: "Checked exceptions enforce compile-time handling for recoverable external faults, while unchecked exceptions (subclasses of RuntimeException) indicate unrecoverable programming errors. Modern Java practices favor unchecked exceptions to maintain clean domain APIs. try-with-resources automatically closes AutoCloseable resources at the end of the block; any exception thrown while closing is attached as a suppressed exception to avoid masking the primary error.",
  follow_up_questions: [
    "Can a finally block override a return value from the try block?",
    "What happens if an error occurs inside a custom AutoCloseable close() method?"
  ],
  estimated_minutes: 10
});

addQ({
  id: "java-09",
  skill_slug: "java",
  skill_name: "Java",
  skill_category: "programming-languages",
  topic: "Collections",
  subtopic: "Fail-Fast vs Fail-Safe Iterators",
  question_title: "What is the difference between Fail-Fast and Fail-Safe Iterators?",
  question_prompt: "Explain how fail-fast iterators detect concurrent modification using modCount and throw ConcurrentModificationException. Contrast this with fail-safe/weakly-consistent iterators in java.util.concurrent.",
  question_type: "conceptual",
  difficulty: "intermediate",
  priority: "high",
  expected_answer_points: [
    "Fail-fast iterators (ArrayList, HashMap, HashSet) check the internal modCount against expectedModCount on each next() call.",
    "If modCount != expectedModCount, they immediately throw ConcurrentModificationException.",
    "They fail immediately to prevent non-deterministic behavior during iteration.",
    "Fail-safe / weakly consistent iterators (CopyOnWriteArrayList, ConcurrentHashMap) operate on a snapshot or cloned array, or navigate a concurrent node chain.",
    "CopyOnWriteArrayList creates a fresh copy of the backing array on every write, allowing iterators to safely traverse the snapshot without throwing exceptions."
  ],
  sample_answer: "Fail-fast iterators (e.g. in ArrayList) track structural modifications using a modCount counter. If a collection is modified structurally while being iterated, next() detects modCount != expectedModCount and immediately throws ConcurrentModificationException. Fail-safe/weakly consistent iterators (e.g. CopyOnWriteArrayList) operate on a snapshot or concurrent data structure, allowing safe traversal without locking or throwing exceptions at the cost of additional memory on writes.",
  follow_up_questions: [
    "Can a single-threaded program throw ConcurrentModificationException? How?",
    "How can you safely remove an element while iterating over an ArrayList?"
  ],
  estimated_minutes: 12
});

addQ({
  id: "java-10",
  skill_slug: "java",
  skill_name: "Java",
  skill_category: "programming-languages",
  topic: "Multithreading and Concurrency",
  subtopic: "Thread Synchronization & Deadlock",
  question_title: "How do you detect, resolve, and prevent Deadlocks in Java?",
  question_prompt: "What four conditions are necessary for a deadlock to occur? How do you diagnose a deadlock using thread dumps (jstack/jconsole), and what architectural practices prevent it?",
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
  topic: "Java 8+ Functional Programming",
  subtopic: "CompletableFuture and Asynchronous Programming",
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
    "allof waits for multiple futures in parallel.",
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
  topic: "JVM and Memory Management",
  subtopic: "Memory Leaks and Profiling",
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

console.log("Java questions created:", questions.length);

// We will append remaining skills in modular blocks to complete the entire catalog of 42 skills
fs.writeFileSync(path.resolve(__dirname, 'temp_builder_p1.json'), JSON.stringify(questions, null, 2));
