// Computer Science Fundamentals: 27 total
// dbms (11), operating-systems (8), computer-networks (8)
module.exports = function(addQ) {
  // --- DBMS FUNDAMENTALS (11) ---
  addQ({
    id: "cs-dbms-01",
    skill_slug: "dbms",
    skill_name: "DBMS Fundamentals",
    skill_category: "computer-science",
    topic: "Transactions and ACID",
    subtopic: "ACID Properties & Write-Ahead Logging",
    question_title: "Explain the four ACID properties in DBMS and how database engines enforce them.",
    question_prompt: "Detail Atomicity, Consistency, Isolation, and Durability. Which database subsystems implement each property (Undo log for Atomicity, Constraints for Consistency, Locks/MVCC for Isolation, Redo log/WAL for Durability)?",
    question_type: "conceptual",
    difficulty: "beginner",
    priority: "critical",
    expected_answer_points: [
      "Atomicity: Ensures an all-or-nothing outcome. Subsystem: Undo Logs / Rollback Segments.",
      "Consistency: Ensures data transitions from one valid state to another, preserving all schemas, types, and constraints (FK, CHECK, UNIQUE).",
      "Isolation: Ensures concurrent transactions do not observe intermediate uncommitted states. Subsystem: Lock Manager (2PL) and Multi-Version Concurrency Control (MVCC).",
      "Durability: Guarantees committed writes survive hardware crashes or power outages. Subsystem: Redo Logs and Write-Ahead Logging (WAL) flushed via fsync."
    ],
    sample_answer: "The ACID properties guarantee database reliability: Atomicity (all-or-nothing execution, enforced via Undo Logs); Consistency (preserving invariants and relational constraints); Isolation (preventing concurrency anomalies, enforced via MVCC and Lock Managers); and Durability (ensuring committed data survives system crashes, enforced via Write-Ahead Logging and Redo Logs flushed to non-volatile disk).",
    follow_up_questions: [
      "What is the difference between Write-Ahead Logging (WAL) and Shadow Paging?",
      "How does Two-Phase Locking (2PL) guarantee serializability?"
    ],
    estimated_minutes: 10
  });

  addQ({
    id: "cs-dbms-02",
    skill_slug: "dbms",
    skill_name: "DBMS Fundamentals",
    skill_category: "computer-science",
    topic: "Isolation levels and deadlocks",
    subtopic: "Concurrency Anomalies: Dirty, Non-Repeatable, and Phantom Reads",
    question_title: "Explain Dirty Reads, Non-Repeatable Reads, and Phantom Reads with concrete examples.",
    question_prompt: "Define the three classic ANSI SQL read phenomena. Describe a concrete multi-transaction timeline for each anomaly and which isolation level prevents it.",
    question_type: "conceptual",
    difficulty: "intermediate",
    priority: "critical",
    expected_answer_points: [
      "Dirty Read: Transaction 1 updates row without committing; Transaction 2 reads updated row; Transaction 1 rolls back. Tx2 acted on data that never existed. Prevented by Read Committed.",
      "Non-Repeatable Read (Fuzzy Read): Transaction 1 reads row; Transaction 2 updates or deletes row and commits; Transaction 1 re-reads row and sees altered values. Prevented by Repeatable Read.",
      "Phantom Read: Transaction 1 reads a range of rows (WHERE age > 30); Transaction 2 inserts a new row matching that range and commits; Transaction 1 re-reads the range and sees a new 'phantom' row. Prevented by Serializable (or Next-Key Locks in InnoDB)."
    ],
    sample_answer: "Dirty Reads occur when Tx2 reads uncommitted modifications from Tx1 that subsequently roll back (prevented by Read Committed). Non-Repeatable Reads happen when Tx1 re-reads an existing row and sees modified column values committed by Tx2 in between (prevented by Repeatable Read). Phantom Reads happen when Tx1 executes a range query, Tx2 inserts a new qualifying row and commits, and Tx1 re-runs the range query to find new 'phantom' rows (prevented by Serializable isolation).",
    follow_up_questions: [
      "What is the Lost Update anomaly and how does Optimistic Locking prevent it?",
      "Why does snapshot isolation sometimes permit Write Skew anomaly?"
    ],
    estimated_minutes: 12
  });

  addQ({
    id: "cs-dbms-03",
    skill_slug: "dbms",
    skill_name: "DBMS Fundamentals",
    skill_category: "computer-science",
    topic: "Indexes",
    subtopic: "B+ Tree vs B-Tree in Database Indexing",
    question_title: "Why do relational database engines use B+ Trees rather than B-Trees for indexes?",
    question_prompt: "Compare B-Trees and B+ Trees. Why do B+ Trees store data records/pointers ONLY in leaf nodes while internal nodes store keys only? How do linked leaf nodes accelerate range scans?",
    question_type: "conceptual",
    difficulty: "intermediate",
    priority: "critical",
    expected_answer_points: [
      "B-Tree: Stores keys AND satellite data (row pointers) in both internal and leaf nodes. Reduces fan-out because node memory must fit pointers.",
      "B+ Tree: Internal nodes store ONLY routing keys (no data records); leaf nodes store ALL keys and data/pointers.",
      "Benefit 1 (Higher Fan-out): Because internal nodes only store keys, a single 4KB/16KB disk page fits many more keys, creating a flatter, shallower tree (fewer disk I/O hops to reach leaves).",
      "Benefit 2 (Sequential Range Scans): Leaf nodes in a B+ Tree are connected as a doubly linked list. Range queries (WHERE id BETWEEN 10 AND 50) find the first key, then simply traverse leaf pointers sequentially without tree re-traversals.",
      "Benefit 3: All queries have predictable equal depth (balanced search path)."
    ],
    sample_answer: "B+ Trees outperform standard B-Trees in database storage for two reasons: First, internal nodes store only index keys without row payloads, maximizing node fan-out. This keeps the tree shallow (typically 3-4 levels for millions of rows), minimizing disk I/O seeks. Second, all data resides in leaf nodes that are connected in a doubly linked list, enabling O(1) sequential pointer traversal for range queries (BETWEEN x AND y) without traversing the tree repeatedly.",
    follow_up_questions: [
      "What is the average height of a B+ Tree with 10 million rows and a fan-out of 100?",
      "How do Hash Indexes compare to B+ Trees, and why are Hash Indexes unusable for range queries?"
    ],
    estimated_minutes: 12
  });

  addQ({
    id: "cs-dbms-04",
    skill_slug: "dbms",
    skill_name: "DBMS Fundamentals",
    skill_category: "computer-science",
    topic: "Normalization",
    subtopic: "Functional Dependencies & Boyce-Codd Normal Form (BCNF)",
    question_title: "Explain Functional Dependencies and Boyce-Codd Normal Form (BCNF).",
    question_prompt: "Define a Functional Dependency (X -> Y). When is a relational schema in 3NF but NOT in BCNF? Provide a classic example of an anomaly that survives 3NF.",
    question_type: "conceptual",
    difficulty: "advanced",
    priority: "high",
    expected_answer_points: [
      "Functional Dependency: Attribute Y is functionally dependent on X (X -> Y) if each value of X determines exactly one value of Y.",
      "3NF Rule: For every non-trivial dependency X -> Y, either X is a superkey OR Y is a prime attribute (part of a candidate key).",
      "BCNF Rule: Stricter than 3NF. For EVERY non-trivial dependency X -> Y, X MUST be a superkey (no exceptions for prime attributes).",
      "Classic BCNF violation: Schema with overlapping candidate keys. E.g. (Student, Course -> Advisor) and (Advisor -> Course). Here, Advisor determines Course, but Advisor is NOT a superkey on its own. It satisfies 3NF (Course is prime), but violates BCNF, causing update anomalies."
    ],
    sample_answer: "A functional dependency X -> Y means X uniquely determines Y. A table is in 3NF if for every dependency X -> Y, X is a superkey or Y is a prime attribute (part of a candidate key). BCNF removes the second exception: X MUST be a superkey for every dependency. A table with overlapping composite candidate keys (like Student, Course, and Advisor where Advisor -> Course) can be in 3NF but violate BCNF, resulting in redundancy and update anomalies.",
    follow_up_questions: [
      "Can every relational schema be decomposed into BCNF while preserving all functional dependencies?",
      "What is Fourth Normal Form (4NF) and Multi-Valued Dependencies?"
    ],
    estimated_minutes: 12
  });

  addQ({
    id: "cs-dbms-05",
    skill_slug: "dbms",
    skill_name: "DBMS Fundamentals",
    skill_category: "computer-science",
    topic: "Keys and constraints",
    subtopic: "Primary Key vs Candidate Key vs Super Key vs Foreign Key",
    question_title: "Compare Super Key, Candidate Key, Primary Key, and Foreign Key.",
    question_prompt: "Define and contrast Super Key, Candidate Key, Primary Key, Alternate Key, and Foreign Key. Why can a table have multiple candidate keys but only one primary key?",
    question_type: "conceptual",
    difficulty: "beginner",
    priority: "high",
    expected_answer_points: [
      "Super Key: Any set of one or more attributes that uniquely identifies a row in a table (can contain redundant columns).",
      "Candidate Key: A minimal super key (no proper subset is a super key). Has uniqueness and minimality.",
      "Primary Key: The specific candidate key chosen by the database architect as the primary identifier. Cannot contain NULL values. Used as the clustered index in many engines.",
      "Alternate Key: Candidate keys not selected as the primary key (typically enforced via UNIQUE NOT NULL constraints).",
      "Foreign Key: An attribute or collection of attributes that references the Primary/Candidate Key of another table, enforcing referential integrity."
    ],
    sample_answer: "A Super Key is any attribute combination that uniquely identifies a row. A Candidate Key is a minimal super key with no extraneous columns. An entity may have multiple candidate keys (e.g. ID, SSN, and Email). The database designer selects one candidate key as the Primary Key (which forbids NULLs and often serves as the clustered index). Remaining candidate keys are Alternate Keys. A Foreign Key is a field referencing a candidate/primary key in another table.",
    follow_up_questions: [
      "Can a Foreign Key reference a column that has a UNIQUE constraint instead of a PRIMARY KEY?",
      "Can a Foreign Key column contain NULL values?"
    ],
    estimated_minutes: 10
  });

  addQ({
    id: "cs-dbms-06",
    skill_slug: "dbms",
    skill_name: "DBMS Fundamentals",
    skill_category: "computer-science",
    topic: "Isolation levels and deadlocks",
    subtopic: "Two-Phase Locking (2PL) Protocol",
    question_title: "How does the Two-Phase Locking (2PL) protocol guarantee Conflict Serializability?",
    question_prompt: "Explain the Growing Phase and Shrinking Phase of 2PL. Compare Basic 2PL with Strict 2PL (S2PL) and Rigorous 2PL. How does Strict 2PL prevent cascading rollbacks?",
    question_type: "conceptual",
    difficulty: "advanced",
    priority: "high",
    expected_answer_points: [
      "2PL Rule: Once a transaction releases a lock, it can never acquire any subsequent locks.",
      "Phase 1 (Growing Phase): Transaction may acquire locks (Shared or Exclusive) but cannot release any.",
      "Phase 2 (Shrinking Phase): Transaction may release locks but cannot acquire any new locks.",
      "Cascading rollback risk in Basic 2PL: If Tx1 releases an exclusive lock during shrinking phase and rolls back later, Tx2 which read that data must also roll back.",
      "Strict 2PL (S2PL): All EXCLUSIVE locks must be held until the transaction explicitly commits or rolls back. Eliminates cascading aborts.",
      "Rigorous 2PL: ALL locks (both Shared and Exclusive) are held until transaction completion."
    ],
    sample_answer: "Two-Phase Locking guarantees conflict serializability by dividing locking into a Growing Phase (acquiring locks without releasing) and a Shrinking Phase (releasing locks without acquiring new ones). Basic 2PL can cause cascading aborts if a transaction releases a lock early and rolls back. Strict 2PL (used in production databases) mandates holding all Exclusive locks until final commit or rollback, completely eliminating cascading rollbacks.",
    follow_up_questions: [
      "Does Strict 2PL prevent deadlocks?",
      "What is Lock Escalation in relational database management systems?"
    ],
    estimated_minutes: 12
  });

  addQ({
    id: "cs-dbms-07",
    skill_slug: "dbms",
    skill_name: "DBMS Fundamentals",
    skill_category: "computer-science",
    topic: "Indexes",
    subtopic: "Clustered vs Secondary Indexes",
    question_title: "Explain the on-disk storage difference between Clustered and Secondary Indexes.",
    question_prompt: "How does the presence of a clustered index impact table insertion and fragmentation? Why does updating an indexed column require updating both the clustered and secondary indexes?",
    question_type: "conceptual",
    difficulty: "intermediate",
    priority: "high",
    expected_answer_points: [
      "Clustered index leaf pages contain the actual data rows; the table IS the clustered index.",
      "Insertion impact: New rows must be inserted into the specific leaf page matching their sorted key. Random key inserts (e.g. UUIDv4) cause Page Splits, fragmentation, and high disk I/O.",
      "Secondary index structure: Leaf nodes store the index key and the clustered key (or RID).",
      "Update impact: Updating a non-indexed column requires only updating the data page. Updating an indexed column requires deleting and re-inserting the secondary B-Tree node, plus page reorganization.",
      "Secondary index double lookup: Lookup traverses secondary index to find PK, then traverses clustered index to read table row."
    ],
    sample_answer: "In a clustered index, the leaf nodes ARE the actual physical table rows sorted by the key. Random key insertions cause page splitting when full pages must split to insert rows in sorted order, creating fragmentation. Secondary indexes store the secondary key and the clustered primary key. Updating an indexed column forces the engine to delete and re-insert nodes in the secondary index tree, which is why columns subject to frequent updates make poor index candidates.",
    follow_up_questions: [
      "What is an Index Page Split and how does it affect write throughput?",
      "What is Fill Factor and how does configuring it reduce page splits?"
    ],
    estimated_minutes: 12
  });

  addQ({
    id: "cs-dbms-08",
    skill_slug: "dbms",
    skill_name: "DBMS Fundamentals",
    skill_category: "computer-science",
    topic: "Transactions and ACID",
    subtopic: "Log-Structured Merge-Trees (LSM Trees)",
    question_title: "Compare LSM Trees (Log-Structured Merge-Trees) and B-Trees for database storage.",
    question_prompt: "Why do write-heavy databases (Cassandra, RocksDB) use LSM Trees instead of B-Trees? Explain MemTable (RAM), Commit Log (WAL), SSTables (immutable disk files), and Compaction.",
    question_type: "conceptual",
    difficulty: "advanced",
    priority: "high",
    expected_answer_points: [
      "B-Tree write penalty: In-place page updates require random I/O writes across disk, causing I/O bottlenecks under high write throughput.",
      "LSM Tree write optimization: Writes are appended sequentially to a WAL on disk and buffered in an in-memory sorted structure (MemTable e.g. SkipList). Ultra-fast O(1) writes.",
      "Flushing: When MemTable fills, it flushes to disk as an immutable, sorted SSTable (Sorted String Table). Zero random writes.",
      "Compaction: Background threads merge multiple overlapping SSTables into new sorted files (removing deleted tombstone records).",
      "Trade-off: LSM trades read performance and compaction CPU/disk overhead for massive write throughput."
    ],
    sample_answer: "B-Trees perform random in-place updates on disk pages, creating I/O bottlenecks under heavy writes. LSM Trees optimize writes by appending sequentially to a commit log and buffering into an in-memory MemTable. When full, MemTables flush to disk as immutable, sorted SSTables. Writes are strictly sequential, delivering incredible write throughput. To handle reads across multiple files, background compaction merges SSTables, trading read latency and compaction I/O for write speed.",
    follow_up_questions: [
      "How do Bloom Filters speed up read lookups in LSM Tree storage engines?",
      "What is Write Amplification in LSM Trees?"
    ],
    estimated_minutes: 15
  });

  addQ({
    id: "cs-dbms-09",
    skill_slug: "dbms",
    skill_name: "DBMS Fundamentals",
    skill_category: "computer-science",
    topic: "Transactions and ACID",
    subtopic: "Distributed Transactions: Two-Phase Commit (2PC)",
    question_title: "How does the Two-Phase Commit (2PC) protocol achieve atomicity across distributed databases?",
    question_prompt: "Explain Prepare Phase (voting) and Commit Phase in 2PC. What happens if the Coordinator crashes, and why does 2PC block resources during network partitions?",
    question_type: "conceptual",
    difficulty: "advanced",
    priority: "high",
    expected_answer_points: [
      "2PC achieves atomic commits across multiple autonomous database nodes managed by a Coordinator.",
      "Phase 1 (Prepare): Coordinator sends PREPARE message to all cohorts. Cohorts execute transaction locally, write undo/redo logs, acquire locks, and vote YES (ready to commit) or NO.",
      "Phase 2 (Commit/Abort): If ALL cohorts vote YES, coordinator logs COMMIT to its disk and sends GLOBAL_COMMIT to cohorts. If any cohort votes NO or times out, coordinator sends GLOBAL_ABORT.",
      "Flaw (Blocking Protocol): If the Coordinator crashes after cohorts vote YES but before sending GLOBAL_COMMIT, cohorts are left in doubt holding database locks indefinitely, blocking other traffic.",
      "Violates CAP theorem availability."
    ],
    sample_answer: "Two-Phase Commit coordinates atomic transactions across distributed databases. In Phase 1 (Prepare), the coordinator asks all nodes to prepare: nodes write undo/redo logs, acquire locks, and vote YES or NO. In Phase 2, if all voted YES, the coordinator broadcasts GLOBAL_COMMIT; otherwise it broadcasts GLOBAL_ABORT. The fatal flaw of 2PC is that it is a blocking protocol: if the coordinator crashes during Phase 2, cohorts must hold locks indefinitely, blocking the system.",
    follow_up_questions: [
      "What is Three-Phase Commit (3PC) and why is it rarely used in practice?",
      "Why has the Saga Pattern largely replaced 2PC in microservices architectures?"
    ],
    estimated_minutes: 12
  });

  addQ({
    id: "cs-dbms-10",
    skill_slug: "dbms",
    skill_name: "DBMS Fundamentals",
    skill_category: "computer-science",
    topic: "Indexes",
    subtopic: "Bitmap Indexes and Inverted Indexes",
    question_title: "When should you use Bitmap Indexes and Inverted Indexes instead of B-Trees?",
    question_prompt: "Compare Bitmap Indexes (low cardinality) and Inverted Indexes (full-text search / search engines). Why are Bitmap indexes ideal for OLAP data warehousing but terrible for OLTP write-heavy databases?",
    question_type: "conceptual",
    difficulty: "intermediate",
    priority: "medium",
    expected_answer_points: [
      "Bitmap Index: Creates a bit array (0s and 1s) for each distinct value in a column. E.g. gender: Male [1, 0, 1], Female [0, 1, 0].",
      "OLAP superpower: Complex multi-column boolean queries (WHERE gender = 'M' AND marital_status = 'S' AND state = 'CA') evaluate using ultra-fast hardware bitwise operations (AND, OR, NOT).",
      "OLTP disaster: Modifying a single row locks the ENTIRE bitmap segment, paralyzing concurrent writes.",
      "Inverted Index: Maps words/tokens to the list of document/row IDs containing them (used by Elasticsearch, Lucene, and PostgreSQL GIN)."
    ],
    sample_answer: "Bitmap indexes create a bit vector for each unique column value, making them exceptionally fast for OLAP data warehouses where queries combine low-cardinality filters using CPU bitwise operators (AND, OR). However, they are unusable in OLTP write-heavy systems because modifying a row requires locking the entire bitmap vector. Inverted indexes map tokens to matching document IDs, serving as the foundation for full-text search engines like Elasticsearch.",
    follow_up_questions: [
      "What is Roaring Bitmap compression?",
      "How does a PostgreSQL GIN index utilize inverted index concepts for array and JSONB queries?"
    ],
    estimated_minutes: 10
  });

  addQ({
    id: "cs-dbms-11",
    skill_slug: "dbms",
    skill_name: "DBMS Fundamentals",
    skill_category: "computer-science",
    topic: "Transactions and ACID",
    subtopic: "Database Sharding Architectures",
    question_title: "Compare Horizontal Sharding, Vertical Partitioning, and Directory-Based Sharding.",
    question_prompt: "Explain how databases scale horizontally past single-node limits. Compare Range-Based Sharding, Hash-Based Sharding, and Directory-Based Sharding. What are the challenges of cross-shard joins and distributed transactions?",
    question_type: "conceptual",
    difficulty: "advanced",
    priority: "high",
    expected_answer_points: [
      "Vertical Partitioning: Splitting columns into separate tables/databases (e.g. separating user profile from user billing).",
      "Horizontal Sharding: Partitioning rows across multiple database servers based on a Shard Key.",
      "Range-Based Sharding: Sharding by key ranges (A-F on Shard 1, G-M on Shard 2). Easy range queries, but creates write hotspots on popular ranges.",
      "Hash-Based Sharding: Hash(shard_key) % num_shards. Uniform write distribution, but range queries become scatter-gather operations across all shards.",
      "Challenges: Cross-shard joins are impossible or slow; cross-shard transactions require distributed 2PC; re-sharding requires migrating gigabytes of data (solved via Consistent Hashing)."
    ],
    sample_answer: "Horizontal sharding splits rows across multiple database nodes using a shard key. Range-based sharding divides by value ranges, simplifying range scans but creating hotspots on active ranges. Hash-based sharding applies a hash function (hash(id) % N) to distribute writes evenly, but forces range queries to execute scatter-gather scans across all nodes. The architectural challenges of sharding include loss of relational integrity, expensive cross-shard joins, and complex distributed re-balancing.",
    follow_up_questions: [
      "How does Consistent Hashing minimize data movement when adding or removing database shards?",
      "What is a Scatter-Gather query pattern in sharded systems?"
    ],
    estimated_minutes: 12
  });

  // --- OPERATING SYSTEMS (8) ---
  addQ({
    id: "cs-os-01",
    skill_slug: "operating-systems",
    skill_name: "Operating Systems",
    skill_category: "computer-science",
    topic: "Processes and threads",
    subtopic: "Process vs Thread Architecture",
    question_title: "Explain the fundamental differences between a Process and a Thread.",
    question_prompt: "Compare Processes and Threads in terms of memory address space, PCB (Process Control Block) vs TCB (Thread Control Block), context switching overhead, and IPC vs shared memory.",
    question_type: "conceptual",
    difficulty: "beginner",
    priority: "critical",
    expected_answer_points: [
      "Process: Independent program in execution with its own isolated virtual address space (Code, Data, Heap, Stack), file descriptors, and PCB.",
      "Thread: Lightweight unit of execution within a process. Threads of the same process SHARE the Code, Data, Heap, and file descriptors, but maintain PRIVATE Stacks, Registers, and PC (Program Counter).",
      "Context Switch Overhead: Process context switch is heavy (invalidates CPU MMU TLB cache, switches page tables). Thread context switch is lightweight (keeps same page directory, retains TLB cache).",
      "Communication: Processes require IPC (pipes, sockets, shared memory); threads communicate directly via shared heap memory (requiring synchronization primitives to avoid race conditions)."
    ],
    sample_answer: "A process is an isolated execution environment with its own private virtual address space and file descriptors. A thread is a lightweight execution unit inside a process; threads within the same process share the heap, global variables, and code, but keep private execution stacks and program counters. Process context switching is expensive because it swaps page tables and flushes the CPU TLB cache, whereas thread switching preserves the memory context, making it substantially faster.",
    follow_up_questions: [
      "What is the Translation Lookaside Buffer (TLB) and why does a process context switch invalidate it?",
      "What is a zombie process vs an orphan process in Linux?"
    ],
    estimated_minutes: 10
  });

  addQ({
    id: "cs-os-02",
    skill_slug: "operating-systems",
    skill_name: "Operating Systems",
    skill_category: "computer-science",
    topic: "Deadlocks",
    subtopic: "Coffman Conditions & Deadlock Prevention",
    question_title: "Explain the 4 Coffman Conditions for Deadlocks and how to prevent them.",
    question_prompt: "Detail Mutual Exclusion, Hold and Wait, No Preemption, and Circular Wait. How does eliminating any ONE condition guarantee deadlock prevention? What is Dijkstra's Banker's Algorithm?",
    question_type: "conceptual",
    difficulty: "intermediate",
    priority: "critical",
    expected_answer_points: [
      "Four mandatory Coffman Conditions: 1) Mutual Exclusion: Resource can be held by only one process at a time; 2) Hold and Wait: Process holds at least one resource while waiting to acquire others; 3) No Preemption: Resources cannot be forcibly taken from a process until released; 4) Circular Wait: Closed chain of processes where each waits for a resource held by the next.",
      "Deadlock Prevention breaks at least one condition: Break Circular Wait by enforcing a strict global numerical acquisition order for all locks; Break Hold and Wait by requesting all resources upfront.",
      "Banker's Algorithm: Deadlock avoidance algorithm that tests for safety by simulating allocation of predetermined maximum resources to prevent entering an unsafe state."
    ],
    sample_answer: "Deadlocks require four simultaneous Coffman conditions: Mutual Exclusion (non-shareable resources), Hold and Wait (holding resources while requesting more), No Preemption (resources cannot be confiscated), and Circular Wait (a circular dependency of threads waiting on each other). Breaking any one condition prevents deadlocks. In software engineering, the most practical defense is breaking Circular Wait by enforcing a strict global lock hierarchy (always acquiring Lock A before Lock B across the entire codebase).",
    follow_up_questions: [
      "What is the difference between Deadlock Prevention and Deadlock Avoidance?",
      "What is Livelock and how does it differ from Deadlock?"
    ],
    estimated_minutes: 12
  });

  addQ({
    id: "cs-os-03",
    skill_slug: "operating-systems",
    skill_name: "Operating Systems",
    skill_category: "computer-science",
    topic: "Memory management",
    subtopic: "Virtual Memory, Paging, and Page Faults",
    question_title: "How does Virtual Memory work with Paging and Page Faults?",
    question_prompt: "Explain how the Memory Management Unit (MMU) translates virtual addresses to physical addresses using Page Tables. What happens during a Page Fault, and what is Thrashing?",
    question_type: "conceptual",
    difficulty: "intermediate",
    priority: "high",
    expected_answer_points: [
      "Virtual Memory: Provides each process with the illusion of a contiguous, private memory space larger than physical RAM.",
      "Paging: Virtual address space split into fixed-size Pages (typically 4KB); physical RAM split into matching Page Frames.",
      "MMU translation: Uses multi-level Page Tables and TLB (hardware cache) to map Virtual Page Numbers to Physical Frame Numbers.",
      "Page Fault: Triggered when a process accesses a page marked invalid/not present in RAM. The OS trap suspends the process, fetches the page from swap disk into a free RAM frame, updates the page table present bit, and resumes instruction.",
      "Thrashing: Occurs when system RAM is exhausted and the OS spends more time swapping pages to/from disk than executing actual instructions (CPU utilization plummets)."
    ],
    sample_answer: "Virtual memory maps a process's virtual addresses to physical RAM frames through page tables managed by the MMU. When a process accesses a memory address whose page is not in physical RAM, the MMU triggers a Page Fault interrupt. The OS pauses the process, reads the missing page from swap disk into an available RAM frame, updates the page table, and resumes execution. Thrashing occurs when high memory pressure causes continuous page faults, starving the CPU with disk I/O.",
    follow_up_questions: [
      "Compare page replacement algorithms: LRU, FIFO, and Clock (Second Chance).",
      "What are HugePages (2MB/1GB) in Linux and why do databases (PostgreSQL/Oracle) use them?"
    ],
    estimated_minutes: 12
  });

  addQ({
    id: "cs-os-04",
    skill_slug: "operating-systems",
    skill_name: "Operating Systems",
    skill_category: "computer-science",
    topic: "Synchronization and race conditions",
    subtopic: "Mutex vs Semaphore vs Spinlock",
    question_title: "Compare Mutex, Counting Semaphore, and Spinlock synchronization primitives.",
    question_prompt: "When should you use a Mutex versus a Semaphore versus a Spinlock? Explain ownership (locking/unlocking thread constraints), busy-waiting vs sleeping, and Priority Inversion.",
    question_type: "conceptual",
    difficulty: "intermediate",
    priority: "critical",
    expected_answer_points: [
      "Mutex (Mutual Exclusion): Binary locking mechanism with OWNERSHIP. Only the thread that locked the mutex is allowed to unlock it. Put threads to sleep if unavailable.",
      "Semaphore: Signaling mechanism with a counter. Has NO ownership (Thread A can wait/decrement, Thread B can post/increment). Used for resource pools (e.g. max 10 DB connections) or producer-consumer signaling.",
      "Spinlock: Does not put waiting threads to sleep; repeatedly polls lock in a tight CPU loop (busy-waiting). Optimal ONLY when critical section is tiny (< few nanoseconds) where sleeping context-switch overhead exceeds spinning time.",
      "Priority Inversion: Low-priority thread holds a mutex needed by high-priority thread, while medium-priority thread starves both. Solved via Priority Inheritance."
    ],
    sample_answer: "A Mutex enforces strict exclusive ownership: only the thread that acquired the mutex can release it, putting waiting threads to sleep. A Semaphore is a signaling counter without ownership constraints, allowing any thread to signal; it is used to manage resource pools. A Spinlock busy-waits in a tight CPU loop instead of sleeping, making it efficient for very short critical sections where context switching would take longer than waiting. Priority Inheritance resolves Priority Inversion by temporarily elevating the low-priority thread's priority.",
    follow_up_questions: [
      "What is Priority Inheritance and how did it save the Mars Pathfinder mission?",
      "Why is using a spinlock on a single-core uniprocessor machine dangerous?"
    ],
    estimated_minutes: 12
  });

  addQ({
    id: "cs-os-05",
    skill_slug: "operating-systems",
    skill_name: "Operating Systems",
    skill_category: "computer-science",
    topic: "Scheduling",
    subtopic: "CPU Scheduling Algorithms: CFS vs Round Robin",
    question_title: "How do CPU Scheduling Algorithms work: Completely Fair Scheduler (CFS) vs Round Robin?",
    question_prompt: "Compare Preemptive vs Non-Preemptive scheduling. Explain Round Robin (time quantum) and Linux's default Completely Fair Scheduler (vruntime, Red-Black Tree).",
    question_type: "conceptual",
    difficulty: "intermediate",
    priority: "medium",
    expected_answer_points: [
      "Preemptive scheduling: OS scheduler can interrupt and suspend a running process to switch to another process (timer interrupts).",
      "Round Robin (RR): Preemptive scheduler where each ready process is allocated a fixed time slice (time quantum, e.g. 10ms). Fair, but too short quantum causes high context-switch overhead, while too long degrades to FCFS.",
      "Completely Fair Scheduler (CFS): Linux default CPU scheduler. Models an 'ideal multi-tasking CPU'.",
      "CFS mechanism: Tracks virtual runtime (vruntime) for each task. Higher nice value (lower priority) causes vruntime to accumulate faster. Tasks are stored in a Red-Black Tree keyed by vruntime; scheduler always picks the leftmost node (task with lowest vruntime)."
    ],
    sample_answer: "Preemptive schedulers can interrupt running tasks using timer interrupts. Round Robin assigns a fixed time quantum to each task in a circular queue. The Linux kernel uses the Completely Fair Scheduler (CFS): it tracks the virtual runtime (vruntime) of each thread, scaling it based on task priority (nice value). CFS stores runnable tasks in a Red-Black Tree sorted by vruntime and always picks the leftmost task (the one that has received the least CPU time), ensuring mathematically fair allocation.",
    follow_up_questions: [
      "What happens if the time quantum in Round Robin scheduling is set extremely small vs extremely large?",
      "How do multi-level feedback queues (MLFQ) balance I/O-bound interactive tasks and CPU-bound batch tasks?"
    ],
    estimated_minutes: 10
  });

  addQ({
    id: "cs-os-06",
    skill_slug: "operating-systems",
    skill_name: "Operating Systems",
    skill_category: "computer-science",
    topic: "Processes and threads",
    subtopic: "Inter-Process Communication (IPC)",
    question_title: "Compare Inter-Process Communication (IPC) mechanisms in Operating Systems.",
    question_prompt: "Compare Pipes, Named Pipes (FIFOs), Message Queues, Shared Memory, and Unix Domain Sockets. Which provides the highest throughput and why?",
    question_type: "conceptual",
    difficulty: "intermediate",
    priority: "high",
    expected_answer_points: [
      "Anonymous Pipes: Unidirectional byte stream between related parent-child processes (e.g. ls | grep).",
      "Named Pipes (FIFO): Bidirectional communication between unrelated processes via filesystem paths.",
      "Unix Domain Sockets: Bidirectional socket communication within the same host OS; avoids TCP/IP network stack overhead, checksums, and packet fragmentation.",
      "Message Queues: OS-managed structured message passing.",
      "Shared Memory: Fastest IPC mechanism. OS maps the same physical memory frame into the virtual address spaces of two different processes. Zero kernel copying (data written by Process A is instantly readable by Process B). Requires external synchronization (semaphores) to prevent race conditions."
    ],
    sample_answer: "IPC mechanisms enable isolated processes to communicate: Pipes transfer unidirectional byte streams between related processes; Unix Domain Sockets provide bidirectional communication within a single machine without TCP/IP network stack overhead. Shared Memory is by far the fastest IPC mechanism because the OS maps the same physical memory pages into both processes' address spaces, enabling direct read/write at RAM speeds with zero kernel copying, though it requires semaphores to coordinate access.",
    follow_up_questions: [
      "Why are Unix Domain Sockets faster than loopback TCP network sockets (127.0.0.1)?",
      "What system calls create and attach shared memory in Linux (shmget, shmat)?"
    ],
    estimated_minutes: 10
  });

  addQ({
    id: "cs-os-07",
    skill_slug: "operating-systems",
    skill_name: "Operating Systems",
    skill_category: "computer-science",
    topic: "Processes and threads",
    subtopic: "User Space vs Kernel Space & System Calls",
    question_title: "Explain User Space vs Kernel Space and the System Call transition mechanism.",
    question_prompt: "What is Dual-Mode Operation (Ring 3 User Mode vs Ring 0 Kernel Mode)? What happens during a System Call (trap / software interrupt, register swapping, context switch)?",
    question_type: "conceptual",
    difficulty: "intermediate",
    priority: "high",
    expected_answer_points: [
      "Dual-mode CPU protection: Hardware enforces privilege rings. Ring 3 (User Space) has restricted instruction set (cannot access hardware or memory of other processes); Ring 0 (Kernel Space) has full access to hardware and CPU registers.",
      "System Call (syscall): Controlled programmatic gateway allowing user programs to request privileged OS services (read, write, open, fork).",
      "Transition flow: 1) User application invokes library wrapper (e.g. glibc read()); 2) Stores syscall number and args in CPU registers; 3) Executes software interrupt/trap (syscall instruction); 4) CPU switches hardware mode from Ring 3 to Ring 0; 5) Kernel inspects System Call Table and executes driver code; 6) Switches back to Ring 3 and returns result."
    ],
    sample_answer: "CPUs use dual-mode operation for security: User Space (Ring 3) runs applications with restricted permissions, preventing direct hardware access. Kernel Space (Ring 0) runs the OS kernel with full hardware access. When an application needs hardware I/O (like reading a file), it executes a system call (syscall). This triggers a software interrupt/trap that switches CPU execution to Ring 0, where the kernel validates parameters and executes the driver routine before switching back to Ring 3.",
    follow_up_questions: [
      "What is the performance overhead of transitioning between User Mode and Kernel Mode?",
      "What is the Meltdown and Spectre CPU vulnerability regarding speculative execution and kernel memory?"
    ],
    estimated_minutes: 10
  });

  addQ({
    id: "cs-os-08",
    skill_slug: "operating-systems",
    skill_name: "Operating Systems",
    skill_category: "computer-science",
    topic: "Memory management",
    subtopic: "Zero-Copy I/O with sendfile() and DMA",
    question_title: "How does Zero-Copy I/O work using sendfile() and Direct Memory Access (DMA)?",
    question_prompt: "Explain how standard read/write cycles require 4 context switches and 4 memory copies. How does sendfile() achieve Zero-Copy, and how do Kafka and Netty leverage it for extreme throughput?",
    question_type: "conceptual",
    difficulty: "advanced",
    priority: "critical",
    expected_answer_points: [
      "Standard read/write cycle (4 copies, 4 context switches): 1) DMA copies data from disk to OS page cache; 2) CPU copies from page cache to user space buffer (switch to user); 3) CPU copies from user buffer to socket buffer (switch to kernel); 4) DMA copies from socket buffer to network card.",
      "Zero-Copy sendfile() (2 copies, 2 context switches): The application calls sendfile(out_fd, in_fd).",
      "DMA copies disk data to OS page cache. The kernel transfers file descriptors directly to socket buffer and DMA gathers data straight to the network interface card.",
      "Zero CPU copying into user space memory; zero user-kernel context switching during data transfer.",
      "Kafka application: Reads topic log files and streams them straight to consumer network sockets at line-rate."
    ],
    sample_answer: "A standard file transfer involves 4 context switches and 4 data copies (including copying data back and forth into user-space application memory). Zero-Copy using the Linux sendfile() system call eliminates user-space copying entirely: the kernel reads data from disk via DMA into the OS page cache, and with Scatter-Gather DMA, transfers bytes directly from page cache to the network card buffer. Systems like Kafka and Netty use sendfile() to saturate network interfaces at line rate with almost zero CPU load.",
    follow_up_questions: [
      "Can Zero-Copy sendfile() be used if the application must encrypt or modify the bytes before sending?",
      "What is mmap() (memory-mapped files) and how does it compare to sendfile()?"
    ],
    estimated_minutes: 12
  });

  // --- COMPUTER NETWORKS (8) ---
  addQ({
    id: "cs-net-01",
    skill_slug: "computer-networks",
    skill_name: "Computer Networks",
    skill_category: "computer-science",
    topic: "TCP versus UDP",
    subtopic: "TCP 3-Way Handshake & 4-Way Teardown",
    question_title: "Walk through the TCP Three-Way Handshake and Four-Way Teardown.",
    question_prompt: "Detail the sequence numbers and flags for connection setup (SYN, SYN-ACK, ACK) and connection termination (FIN, ACK, FIN, ACK). What is the TIME_WAIT state and why must it last 2MSL?",
    question_type: "conceptual",
    difficulty: "intermediate",
    priority: "critical",
    expected_answer_points: [
      "Three-Way Handshake: 1) Client -> Server: SYN (seq = x); 2) Server -> Client: SYN-ACK (seq = y, ack = x + 1); 3) Client -> Server: ACK (ack = y + 1). Establishes synchronized sequence numbers and window sizes.",
      "Four-Way Teardown: 1) Client -> Server: FIN; 2) Server -> Client: ACK (half-closed: server can still send data); 3) Server -> Client: FIN; 4) Client -> Server: ACK.",
      "TIME_WAIT state: The active closing party enters TIME_WAIT after sending the final ACK.",
      "Duration: Lasts 2 * MSL (Maximum Segment Lifetime, typically 60-120 seconds).",
      "Purpose 1: Guarantees the final ACK is received by the peer (if lost, peer re-sends FIN and client can re-ACK).",
      "Purpose 2: Allows lingering/delayed duplicate packets from the connection to expire in the network so they don't corrupt a new connection reusing the same port pair."
    ],
    sample_answer: "The TCP 3-way handshake establishes reliable connections: Client sends SYN, Server replies with SYN-ACK, and Client sends ACK. Connection teardown requires 4 steps: Client sends FIN, Server ACKs, Server sends its own FIN when done, and Client sends final ACK. The client then enters TIME_WAIT for 2MSL (Maximum Segment Lifetime, ~1-2 mins) to ensure the server received the final ACK and to allow all stray packets in the network to die before the IP/port tuple can be reused.",
    follow_up_questions: [
      "What is a SYN Flood DDoS attack and how do SYN Cookies mitigate it?",
      "What causes a TCP Reset (RST) packet to be sent?"
    ],
    estimated_minutes: 12
  });

  addQ({
    id: "cs-net-02",
    skill_slug: "computer-networks",
    skill_name: "Computer Networks",
    skill_category: "computer-science",
    topic: "TCP versus UDP",
    subtopic: "TCP vs UDP Comparison & Flow/Congestion Control",
    question_title: "Compare TCP and UDP: Reliability, Header Overhead, and Congestion Control.",
    question_prompt: "Why is TCP called connection-oriented and reliable, while UDP is connectionless? Explain TCP Flow Control (Sliding Window) vs Congestion Control (Slow Start, AIMD). When is UDP preferred (VoIP, DNS, QUIC/HTTP/3)?",
    question_type: "conceptual",
    difficulty: "intermediate",
    priority: "critical",
    expected_answer_points: [
      "TCP: Connection-oriented, guarantees in-order reliable delivery, retransmits lost packets, performs flow control and congestion control. Header size: 20-60 bytes.",
      "UDP: Connectionless, unreliable, best-effort delivery, no retransmissions, no ordering guarantees, zero congestion control. Lightweight header: 8 bytes.",
      "Flow Control: Sliding Window protocol. Receiver advertises receive window (rwnd) in headers so fast sender does not overwhelm slow receiver buffer.",
      "Congestion Control: Prevents overwhelming intermediate network routers. Employs Slow Start (exponential window growth), Congestion Avoidance (additive increase multiplicative decrease - AIMD), and Fast Retransmit/Recovery.",
      "UDP use cases: DNS (low latency single packet), video streaming / VoIP (dropping a frame is better than stalling video for retransmission), and HTTP/3 (QUIC uses UDP to avoid TCP head-of-line blocking)."
    ],
    sample_answer: "TCP is a connection-oriented, reliable protocol providing guaranteed in-order delivery via sequence numbers and retransmissions. It protects networks using Flow Control (receiver sliding window) and Congestion Control (Slow Start, AIMD). UDP is connectionless and lightweight (8-byte header vs 20+ for TCP) with no retransmissions or ordering. UDP is favored when low latency is critical and dropped packets are tolerable (VoIP, video calls, gaming) or for quick request-response queries like DNS.",
    follow_up_questions: [
      "What is Head-of-Line (HoL) blocking at the TCP layer?",
      "How does HTTP/3 implement reliability over UDP using QUIC?"
    ],
    estimated_minutes: 15
  });

  addQ({
    id: "cs-net-03",
    skill_slug: "computer-networks",
    skill_name: "Computer Networks",
    skill_category: "computer-science",
    topic: "HTTP/HTTPS and TLS",
    subtopic: "HTTPS and TLS 1.3 Handshake",
    question_title: "How does the TLS 1.3 Handshake establish an encrypted HTTPS connection?",
    question_prompt: "Walk through the TLS 1.3 cryptographic handshake (Client Hello with Key Share, Server Hello with Certificate, Finished). How does TLS 1.3 reduce handshake latency to 1 RTT compared to TLS 1.2's 2 RTTs? What is Forward Secrecy?",
    question_type: "conceptual",
    difficulty: "advanced",
    priority: "critical",
    expected_answer_points: [
      "Purpose: Provides Confidentiality (encryption), Integrity (HMAC), and Authentication (X.509 Certificates).",
      "TLS 1.2: Required 2 roundtrips (2 RTT) before application data could be sent.",
      "TLS 1.3 1-RTT Handshake: 1) Client Hello sends supported cipher suites AND client's ephemeral Diffie-Hellman key share; 2) Server Hello selects cipher, sends server key share, sends encrypted X.509 Certificate and Finished verification.",
      "Symmetric session key is derived immediately; encrypted HTTP application data flows on the very next packet.",
      "Forward Secrecy (PFS): Uses ephemeral Diffie-Hellman keys (ECDHE). Even if the server's private RSA key is compromised years later, past recorded network traffic cannot be decrypted."
    ],
    sample_answer: "HTTPS wraps HTTP inside TLS encryption. While TLS 1.2 required 2 round trips (2-RTT) to negotiate keys, TLS 1.3 completes the handshake in 1-RTT. The client sends its Diffie-Hellman key share in the very first ClientHello message. The server responds with its key share and encrypted certificate, allowing both sides to derive a shared symmetric session key immediately. TLS 1.3 mandates Perfect Forward Secrecy (using ephemeral ECDHE), ensuring that a future compromise of the server's private key cannot decrypt past recorded sessions.",
    follow_up_questions: [
      "What is TLS 0-RTT (Zero Round Trip Time) resumption and what replay attack risk does it introduce?",
      "What is the role of a Certificate Authority (CA) in validating the server's public key?"
    ],
    estimated_minutes: 15
  });

  addQ({
    id: "cs-net-04",
    skill_slug: "computer-networks",
    skill_name: "Computer Networks",
    skill_category: "computer-science",
    topic: "HTTP/HTTPS and TLS",
    subtopic: "HTTP/1.1 vs HTTP/2 vs HTTP/3",
    question_title: "Compare HTTP/1.1, HTTP/2, and HTTP/3 protocols.",
    question_prompt: "Explain how HTTP/2 solved HTTP/1.1 head-of-line blocking using binary framing, multiplexing, and HPACK header compression. Why did HTTP/2 still suffer from TCP-level head-of-line blocking, and how does HTTP/3 (QUIC) fix it?",
    question_type: "conceptual",
    difficulty: "advanced",
    priority: "critical",
    expected_answer_points: [
      "HTTP/1.1: Plain text protocol. Suffers from Application-layer Head-of-Line blocking (only 1 request per TCP connection at a time; browsers opened 6 concurrent TCP connections per domain to work around this).",
      "HTTP/2: Binary framing layer. Multiplexes multiple bidirectional streams over a SINGLE TCP connection. HPACK header compression reduces bandwidth. Server Push.",
      "HTTP/2 limitation: Because it runs over a single TCP connection, if 1 packet drops, TCP pauses ALL streams while waiting for the retransmitted packet (Transport-layer Head-of-Line blocking).",
      "HTTP/3: Replaces TCP with QUIC over UDP. Streams are independent at the transport layer: a dropped packet on Stream 1 does NOT stall Stream 2.",
      "0-RTT connection migration: QUIC connections survive mobile Wi-Fi to cellular switches without reconnecting."
    ],
    sample_answer: "HTTP/1.1 suffered from application head-of-line blocking, requiring separate TCP connections for concurrent requests. HTTP/2 introduced binary framing and multiplexing, allowing hundreds of concurrent requests over a single TCP connection with HPACK header compression. However, HTTP/2 suffered from TCP-level head-of-line blocking—a single lost packet halted all multiplexed streams. HTTP/3 solves this by replacing TCP with QUIC over UDP: individual streams are isolated, so packet loss on one stream does not block others.",
    follow_up_questions: [
      "What is HPACK compression in HTTP/2 and how does it prevent CRIME/BREACH attacks?",
      "What is Connection Migration in QUIC?"
    ],
    estimated_minutes: 12
  });

  addQ({
    id: "cs-net-05",
    skill_slug: "computer-networks",
    skill_name: "Computer Networks",
    skill_category: "computer-science",
    topic: "DNS",
    subtopic: "DNS Resolution Flow",
    question_title: "Walk through the complete DNS Resolution process for an address like www.google.com.",
    question_prompt: "Trace a DNS query from browser cache to OS cache, recursive resolver (ISP), Root nameservers (.), TLD nameservers (.com), and Authoritative nameservers. What are A, AAAA, CNAME, and MX records?",
    question_type: "conceptual",
    difficulty: "intermediate",
    priority: "high",
    expected_answer_points: [
      "1. Browser checks internal DNS cache -> OS hosts file / local DNS cache.",
      "2. Query sent to Recursive Resolver (ISP or 8.8.8.8).",
      "3. Resolver queries Root Nameserver (.) -> returns TLD nameserver IP (.com).",
      "4. Resolver queries TLD Nameserver (.com) -> returns Authoritative Nameserver IP (ns1.google.com).",
      "5. Resolver queries Authoritative Nameserver -> returns A record (IPv4) or AAAA record (IPv6).",
      "6. Resolver caches record for duration of TTL and returns IP to client browser.",
      "Record types: A (IPv4), AAAA (IPv6), CNAME (canonical alias), MX (mail exchange), TXT (SPF/DKIM/verification)."
    ],
    sample_answer: "DNS resolution translates hostnames to IPs. When a user requests a URL, the system checks browser and OS caches. If missing, it queries a Recursive Resolver, which performs iterative lookups: first querying the Root Nameserver (which refers to the .com TLD nameserver), then the TLD Nameserver (which refers to the domain's Authoritative Nameserver), and finally the Authoritative Nameserver, which returns the 'A' record IP address. The resolver caches the record according to its TTL and returns the IP to the browser.",
    follow_up_questions: [
      "What is DNS TTL (Time To Live) and what happens during DNS propagation delays?",
      "What is DNS Spoofing / Cache Poisoning and how does DNSSEC prevent it?"
    ],
    estimated_minutes: 10
  });

  addQ({
    id: "cs-net-06",
    skill_slug: "computer-networks",
    skill_name: "Computer Networks",
    skill_category: "computer-science",
    topic: "Load balancing basics",
    subtopic: "Layer 4 vs Layer 7 Load Balancing",
    question_title: "Compare Layer 4 (Transport) and Layer 7 (Application) Load Balancers.",
    question_prompt: "When should you use an L4 load balancer (AWS NLB, IPVS) vs an L7 load balancer (AWS ALB, Nginx, HAProxy)? Compare inspection depth, throughput, SSL termination, and routing capabilities.",
    question_type: "conceptual",
    difficulty: "intermediate",
    priority: "high",
    expected_answer_points: [
      "Layer 4 Load Balancer: Operates at TCP/UDP transport layer. Inspects only IP addresses and TCP/UDP ports. Does not parse HTTP headers, cookies, or URLs. Ultra-high throughput (millions of requests/sec) with minimal CPU overhead.",
      "Layer 7 Load Balancer: Operates at HTTP/HTTPS application layer. Decrypts TLS and parses HTTP methods, headers, cookies, and path URLs. Enables smart routing (e.g. /api -> backend, /images -> S3), sticky sessions via cookies, and rate limiting.",
      "Trade-off: L4 offers raw packet-level speed; L7 offers intelligent application routing and security at higher CPU cost."
    ],
    sample_answer: "Layer 4 load balancers operate at the transport layer (TCP/UDP), routing packets based purely on IP and port without inspecting application payloads. They achieve extreme throughput (millions of connections/sec) with minimal CPU overhead. Layer 7 load balancers operate at the application layer (HTTP/HTTPS), parsing request paths, headers, and cookies to enable intelligent routing (/api vs /static), SSL termination, and cookie-based sticky sessions at the cost of higher CPU consumption.",
    follow_up_questions: [
      "What is Direct Server Return (DSR) in Layer 4 load balancing?",
      "How do Sticky Sessions work and why do they hinder even load distribution?"
    ],
    estimated_minutes: 12
  });

  addQ({
    id: "cs-net-07",
    skill_slug: "computer-networks",
    skill_name: "Computer Networks",
    skill_category: "computer-science",
    topic: "Sockets and connection lifecycle",
    subtopic: "BSD Socket API & Blocking vs Non-Blocking I/O",
    question_title: "Explain the BSD Socket API and compare Blocking vs Non-Blocking I/O (epoll/kqueue).",
    question_prompt: "Walk through socket lifecycle system calls: socket(), bind(), listen(), accept(), connect(), send(), recv(). Why does the thread-per-connection blocking model fail to scale (C10K problem), and how does I/O multiplexing (epoll) solve it?",
    question_type: "conceptual",
    difficulty: "advanced",
    priority: "critical",
    expected_answer_points: [
      "Lifecycle: Server: socket() -> bind(IP, port) -> listen(backlog) -> accept() [blocks until client connects] -> read()/write() -> close(). Client: socket() -> connect() -> read()/write().",
      "C10K Problem: In thread-per-connection architectures, serving 10,000 concurrent sockets requires 10,000 OS threads. Thread stack memory (1MB per thread = 10GB RAM) and CPU context switching overhead collapse the server.",
      "I/O Multiplexing (epoll / kqueue): A single thread monitors thousands of file descriptors. The kernel notifies the thread only when descriptors are ready for read/write (event-driven).",
      "Forms the architectural foundation of Nginx, Node.js libuv, and Netty."
    ],
    sample_answer: "The socket API manages network connections: servers bind, listen, and accept client connections. The legacy thread-per-connection model fails to scale (the C10K problem) because allocating an OS thread per socket exhausts RAM (1MB stack per thread) and burns CPU cycles on context switches. I/O multiplexing using Linux `epoll` solves this: a single event loop thread monitors thousands of non-blocking sockets simultaneously, waking up only when the kernel signals that a socket has data ready to read.",
    follow_up_questions: [
      "What is the difference between Level-Triggered (LT) and Edge-Triggered (ET) epoll?",
      "What is the listen backlog queue in TCP sockets?"
    ],
    estimated_minutes: 15
  });

  addQ({
    id: "cs-net-08",
    skill_slug: "computer-networks",
    skill_name: "Computer Networks",
    skill_category: "computer-science",
    topic: "HTTP/HTTPS and TLS",
    subtopic: "Web Security: CORS, CSP, HSTS, and XSS",
    question_title: "Explain the web security triad: Same-Origin Policy (SOP), CORS, and Content-Security-Policy (CSP).",
    question_prompt: "What is the Same-Origin Policy (Protocol, Host, Port)? How does CORS relax SOP safely, and how does Content-Security-Policy (CSP) prevent Cross-Site Scripting (XSS)? What is HSTS?",
    question_type: "conceptual",
    difficulty: "intermediate",
    priority: "high",
    expected_answer_points: [
      "Same-Origin Policy (SOP): Browser security sandbox preventing scripts loaded from Origin A from reading DOM or network responses from Origin B unless both share identical Scheme, Host, and Port.",
      "CORS (Cross-Origin Resource Sharing): HTTP header protocol allowing servers to explicitly whitelist trusted origins (Access-Control-Allow-Origin).",
      "CSP (Content-Security-Policy): HTTP response header instructing browsers to restrict which domains can execute scripts, styles, images, and fonts, neutralizing XSS by blocking unauthorized inline scripts and external domains.",
      "HSTS (HTTP Strict Transport Security): Strict-Transport-Security: max-age=31536000; includeSubDomains enforces that browsers communicate with the domain ONLY over HTTPS, defeating SSL stripping attacks."
    ],
    sample_answer: "The Same-Origin Policy (SOP) prevents malicious websites from reading data from other origins unless scheme, host, and port match. CORS provides a mechanism for servers to relax SOP by sending Access-Control-Allow-Origin headers to permit cross-origin requests. Content-Security-Policy (CSP) prevents Cross-Site Scripting (XSS) by restricting where scripts can be loaded and executed from. HSTS forces browsers to connect exclusively via HTTPS, defending against man-in-the-middle SSL-stripping attacks.",
    follow_up_questions: [
      "What constitutes a pre-flight CORS OPTIONS request and what triggers it?",
      "Why is 'default-src 'self'' a recommended baseline for Content-Security-Policy?"
    ],
    estimated_minutes: 12
  });
};
