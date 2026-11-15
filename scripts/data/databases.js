// Databases questions: 45 total
// sql (14), mysql (10), mongodb (8), firebase (5), postgresql-pgvector (8)
module.exports = function(addQ) {
  // --- SQL (14) ---
  addQ({
    id: "sql-01",
    skill_slug: "sql",
    skill_name: "SQL",
    skill_category: "databases",
    topic: "ACID, isolation and transactions",
    subtopic: "ACID Properties & Transaction Isolation Levels",
    question_title: "Explain the ACID properties and the 4 ANSI SQL Transaction Isolation Levels.",
    question_prompt: "Define Atomicity, Consistency, Isolation, and Durability. Compare the 4 isolation levels: Read Uncommitted, Read Committed, Repeatable Read, and Serializable. Detail Dirty Reads, Non-Repeatable Reads, and Phantom Reads.",
    question_type: "conceptual",
    difficulty: "intermediate",
    priority: "critical",
    expected_answer_points: [
      "Atomicity: All-or-nothing execution (WAL/undo log).",
      "Consistency: State transitions preserve all database invariants and constraints.",
      "Isolation: Concurrent transactions execute without interfering with one another.",
      "Durability: Committed transactions survive power loss or system crashes (redo log).",
      "Read Uncommitted: Prone to Dirty Reads (reading uncommitted writes).",
      "Read Committed (default in Postgres, Oracle): Eliminates Dirty Reads. Prone to Non-Repeatable Reads (row re-read returns different values).",
      "Repeatable Read (default in MySQL InnoDB): Eliminates Dirty and Non-Repeatable Reads using snapshot MVCC. In pure standard SQL, prone to Phantom Reads (new rows matching range filter appear).",
      "Serializable: Eliminates all anomalies via two-phase locking or SSI."
    ],
    sample_answer: "ACID ensures reliable database operations: Atomicity (all-or-nothing), Consistency (invariants preserved), Isolation (concurrent safety), and Durability (committed writes persist on crash). The 4 isolation levels trade concurrency for consistency: Read Uncommitted allows Dirty Reads; Read Committed guarantees reading only committed data; Repeatable Read guarantees reading the same row values throughout a transaction using MVCC snapshots; and Serializable prevents all anomalies including Phantom Reads through strict range locks or serialization graph checking.",
    follow_up_questions: [
      "How does MySQL InnoDB prevent Phantom Reads under Repeatable Read isolation using Next-Key Locks?",
      "What is Write Skew anomaly and which isolation level prevents it?"
    ],
    estimated_minutes: 15
  });

  addQ({
    id: "sql-02",
    skill_slug: "sql",
    skill_name: "SQL",
    skill_category: "databases",
    topic: "Window functions",
    subtopic: "ROW_NUMBER, RANK, and DENSE_RANK",
    question_title: "Compare ROW_NUMBER(), RANK(), and DENSE_RANK() in SQL window functions.",
    question_prompt: "Explain how window functions operate over PARTITION BY and ORDER BY clauses without collapsing rows. Compare ROW_NUMBER(), RANK(), and DENSE_RANK() when values tie (e.g. salaries of 100, 100, 80).",
    question_type: "coding",
    difficulty: "intermediate",
    priority: "critical",
    expected_answer_points: [
      "Window functions perform calculations across a set of table rows related to the current row without grouping rows into a single output row (unlike GROUP BY).",
      "ROW_NUMBER(): Assigns a unique sequential integer (1, 2, 3...) regardless of ties.",
      "RANK(): Assigns identical rank to ties, but SKIPS subsequent ranks (e.g. 1, 1, 3).",
      "DENSE_RANK(): Assigns identical rank to ties, but DOES NOT skip subsequent ranks (e.g. 1, 1, 2).",
      "Common query: Finding the Nth highest salary or top N records per department using a CTE with DENSE_RANK()."
    ],
    sample_answer: "Window functions compute aggregates across partitions without collapsing rows. When duplicate values occur in ORDER BY: ROW_NUMBER() arbitrarily assigns consecutive numbers (1, 2, 3); RANK() gives tied rows the same rank and skips following ranks (1, 1, 3); DENSE_RANK() gives tied rows the same rank without skipping (1, 1, 2). For example, to find the 2nd highest salary per department, filter WHERE rank = 2 using DENSE_RANK() inside a CTE.",
    follow_up_questions: [
      "Write a query using DENSE_RANK() to find the 3rd highest paid employee in each department.",
      "What is the difference between LEAD() and LAG() window functions?"
    ],
    estimated_minutes: 12
  });

  addQ({
    id: "sql-03",
    skill_slug: "sql",
    skill_name: "SQL",
    skill_category: "databases",
    topic: "Subqueries and CTEs",
    subtopic: "Common Table Expressions (CTEs) & Recursive CTEs",
    question_title: "How do Common Table Expressions (CTEs) work, and how do you write a Recursive CTE?",
    question_prompt: "Explain WITH syntax for CTEs vs subqueries. Walk through writing a Recursive CTE (WITH RECURSIVE) for hierarchical data, such as traversing an organizational management hierarchy (employee -> manager).",
    question_type: "coding",
    difficulty: "intermediate",
    priority: "high",
    expected_answer_points: [
      "CTE: Named temporary result set defined within execution scope of a single SELECT, INSERT, UPDATE, or DELETE using 'WITH cte_name AS (...)'.",
      "Benefits: Readability, modularity, and ability to reference the CTE multiple times in the query.",
      "Recursive CTE structure: 1) Anchor member (base query executed once); 2) UNION ALL; 3) Recursive member (references the CTE itself until termination condition returns empty); 4) Outer query.",
      "Use cases: Hierarchical org charts, category trees, bill of materials, and graph traversal."
    ],
    sample_answer: "A CTE is a temporary named query defined with 'WITH cte_name AS (...)'. Recursive CTEs (WITH RECURSIVE) allow traversing hierarchical data like org charts. A recursive CTE consists of an Anchor Member (e.g. finding the CEO with manager_id IS NULL), a UNION ALL operator, and a Recursive Member that joins the table back to the CTE (ON e.manager_id = cte.employee_id). Recursion stops automatically when the recursive member yields zero rows.",
    follow_up_questions: [
      "How do you prevent infinite loops in recursive CTEs when cyclic graph data exists?",
      "Can a CTE be used inside an UPDATE statement in PostgreSQL?"
    ],
    estimated_minutes: 15
  });

  addQ({
    id: "sql-04",
    skill_slug: "sql",
    skill_name: "SQL",
    skill_category: "databases",
    topic: "Indexes and query plans",
    subtopic: "B-Tree Indexes & Composite Index Column Ordering",
    question_title: "How do B-Tree Indexes work, and what is the Leftmost Prefix Rule for composite indexes?",
    question_prompt: "Explain the B-Tree index structure (root, branch, leaf nodes with pointers). For a composite index ON users(last_name, first_name, age), why does WHERE first_name = 'John' fail to use the index?",
    question_type: "conceptual",
    difficulty: "intermediate",
    priority: "critical",
    expected_answer_points: [
      "B-Tree: Balanced search tree where all leaf nodes reside at identical depth and are connected via a doubly-linked list for fast range scans.",
      "Leaf nodes contain sorted index keys and pointers (row ID or clustered primary key) to table data.",
      "Composite index sorting: Data is sorted by column 1 first; ties are sorted by column 2; remaining ties by column 3.",
      "Leftmost Prefix Rule: Queries can use the composite index ONLY IF the query filters from the leftmost column in order.",
      "Index (A, B, C) accelerates queries on (A), (A, B), and (A, B, C), but CANNOT accelerate queries filtering on (B) or (C) alone because the index is not sorted by B or C first."
    ],
    sample_answer: "A B-Tree index stores sorted keys in a balanced tree where leaf nodes link together for fast range lookups (O(log n)). Composite indexes sort data by the first column first, and second column only within ties of the first. Because of this, the Leftmost Prefix Rule dictates that an index on (A, B, C) can only be used by queries that filter by A. A query filtering only on B or C cannot traverse the root of the B-Tree and results in a full table scan.",
    follow_up_questions: [
      "What is a Covering Index and how does it achieve an Index Only Scan?",
      "Why does applying a function to an indexed column (WHERE YEAR(created_at) = 2024) prevent index usage?"
    ],
    estimated_minutes: 15
  });

  addQ({
    id: "sql-05",
    skill_slug: "sql",
    skill_name: "SQL",
    skill_category: "databases",
    topic: "Joins and aggregations",
    subtopic: "SQL Joins: INNER, LEFT, RIGHT, FULL, and CROSS",
    question_title: "Explain the visual and logical behavior of SQL Joins.",
    question_prompt: "Compare INNER JOIN, LEFT OUTER JOIN, RIGHT OUTER JOIN, FULL OUTER JOIN, and CROSS JOIN. What happens when joining tables with duplicate keys on both sides?",
    question_type: "conceptual",
    difficulty: "beginner",
    priority: "critical",
    expected_answer_points: [
      "INNER JOIN: Returns rows where matching values exist in both tables.",
      "LEFT OUTER JOIN: Returns all rows from left table, plus matched rows from right; right table columns fill with NULL if no match.",
      "RIGHT OUTER JOIN: Returns all rows from right table, plus matched rows from left.",
      "FULL OUTER JOIN: Returns all rows when there is a match in either table; non-matching columns fill with NULL.",
      "CROSS JOIN: Cartesian product of both tables (N * M rows).",
      "Duplicate keys behavior: If table A has 3 matching rows and table B has 2 matching rows for key 'X', the join produces 3 * 2 = 6 rows (Cartesian explosion)."
    ],
    sample_answer: "INNER JOIN returns records where join predicates match in both tables. LEFT JOIN returns all rows from the left table with matching right rows (or NULLs where right rows are missing). FULL OUTER JOIN returns all rows from both tables, filling unmatched sides with NULL. CROSS JOIN produces a Cartesian product (table1 rows * table2 rows). If multiple rows match on both sides of a join key, SQL produces a Cartesian combination for that key.",
    follow_up_questions: [
      "How do you simulate a FULL OUTER JOIN in MySQL (which lacks native FULL JOIN)?",
      "What is a Self Join and what is an example of when it is needed?"
    ],
    estimated_minutes: 10
  });

  addQ({
    id: "sql-06",
    skill_slug: "sql",
    skill_name: "SQL",
    skill_category: "databases",
    topic: "Joins and aggregations",
    subtopic: "WHERE vs HAVING & Aggregations",
    question_title: "What is the difference between WHERE and HAVING in SQL?",
    question_prompt: "Explain how the SQL execution order dictates why WHERE cannot filter aggregate expressions (SUM, COUNT) while HAVING can. Walk through the execution sequence from FROM to SELECT.",
    question_type: "conceptual",
    difficulty: "beginner",
    priority: "high",
    expected_answer_points: [
      "Logical query processing sequence: 1) FROM, 2) ON / JOIN, 3) WHERE, 4) GROUP BY, 5) WITH CUBE/ROLLUP, 6) HAVING, 7) SELECT, 8) DISTINCT, 9) ORDER BY, 10) LIMIT / OFFSET.",
      "WHERE filters individual rows BEFORE grouping and aggregation occur.",
      "HAVING filters aggregated group rows AFTER GROUP BY has evaluated.",
      "Example: WHERE price > 100 filters cheap items before grouping; HAVING COUNT(*) > 5 filters categories having more than 5 qualifying products."
    ],
    sample_answer: "The difference stems from SQL logical execution order: FROM -> WHERE -> GROUP BY -> HAVING -> SELECT. The WHERE clause filters individual rows before aggregation occurs, which is why aggregate functions (COUNT, AVG) cannot be evaluated inside WHERE. The HAVING clause executes after GROUP BY, allowing filtering on aggregated summary metrics (e.g. HAVING COUNT(order_id) > 10).",
    follow_up_questions: [
      "Why can't column aliases created in SELECT be referenced in the WHERE clause?",
      "Can HAVING be used in a query that has no explicit GROUP BY clause?"
    ],
    estimated_minutes: 10
  });

  addQ({
    id: "sql-07",
    skill_slug: "sql",
    skill_name: "SQL",
    skill_category: "databases",
    topic: "Normalization and denormalization",
    subtopic: "Database Normalization Forms (1NF, 2NF, 3NF, BCNF)",
    question_title: "Explain 1NF, 2NF, 3NF, and BCNF Normalization forms with examples.",
    question_prompt: "Walk through the progression of database normalization forms: 1NF (atomic values, no repeating groups), 2NF (no partial dependencies on composite keys), 3NF (no transitive dependencies), and BCNF. When is denormalization justified?",
    question_type: "conceptual",
    difficulty: "intermediate",
    priority: "high",
    expected_answer_points: [
      "1NF: Atomic column values (no comma-separated lists), unique column names, primary key defined.",
      "2NF: Must be in 1NF AND have no partial dependency (every non-key attribute must depend on the whole composite primary key, not a subset).",
      "3NF: Must be in 2NF AND have no transitive dependency (non-key columns must not depend on other non-key columns: X -> Y -> Z).",
      "BCNF: Stricter 3NF where every determinant must be a candidate key.",
      "Denormalization: Intentionally introducing redundancy (e.g. caching user_name on orders table) in read-heavy reporting systems to eliminate expensive multi-table joins at the cost of update anomalies."
    ],
    sample_answer: "Normalization eliminates data redundancy and update anomalies: 1NF ensures all column values are atomic (no arrays/lists). 2NF removes partial dependencies on composite primary keys. 3NF removes transitive dependencies (non-key attributes depending on other non-key attributes, e.g. zip_code -> city). Denormalization is intentionally reintroducing redundancy (like storing customer_name on an orders table) to avoid slow joins in read-heavy analytics systems.",
    follow_up_questions: [
      "What are the three data anomalies prevented by 3NF (Insertion, Update, Deletion)?",
      "Why do data warehouses often use denormalized Star Schemas instead of 3NF?"
    ],
    estimated_minutes: 12
  });

  addQ({
    id: "sql-08",
    skill_slug: "sql",
    skill_name: "SQL",
    skill_category: "databases",
    topic: "Indexes and query plans",
    subtopic: "EXPLAIN and Query Execution Plans",
    question_title: "How do you read and interpret an EXPLAIN execution plan to optimize slow queries?",
    question_prompt: "Explain key fields in an EXPLAIN output: type (ALL, index, range, ref, eq_ref, const), rows, filtered, key, and Extra (Using index, Using filesort, Using temporary).",
    question_type: "debugging",
    difficulty: "advanced",
    priority: "critical",
    expected_answer_points: [
      "type access order (worst to best): ALL (full table scan) -> index (full index scan) -> range (index range scan) -> ref (non-unique index lookup) -> eq_ref (unique/PK join lookup) -> const (single row PK/unique lookup).",
      "rows: Estimated number of rows the database engine examines.",
      "key: The actual index selected by the cost-based optimizer (NULL = no index used).",
      "Extra warnings: 'Using filesort' (engine must perform an extra in-memory/disk sort pass; missing index on ORDER BY); 'Using temporary' (creates temporary table, common with complex GROUP BY); 'Using index' (covering index: query answered entirely from index tree without touching table rows)."
    ],
    sample_answer: "EXPLAIN reveals the query execution path chosen by the cost-based optimizer. The 'type' column indicates performance: 'ALL' means an expensive full table scan, whereas 'ref' or 'eq_ref' uses index lookups. 'key' shows which index was used. In the 'Extra' column, 'Using index' signifies a covering index (fastest, no table heap lookup), while 'Using filesort' or 'Using temporary' warns that sorting or grouping exceeded index capabilities and required extra memory/disk passes.",
    follow_up_questions: [
      "What is the difference between EXPLAIN and EXPLAIN ANALYZE?",
      "Why might the database optimizer choose a Full Table Scan (ALL) even when an index exists on the column?"
    ],
    estimated_minutes: 15
  });

  addQ({
    id: "sql-09",
    skill_slug: "sql",
    skill_name: "SQL",
    skill_category: "databases",
    topic: "Subqueries and CTEs",
    subtopic: "Correlated vs Non-Correlated Subqueries & EXISTS vs IN",
    question_title: "Compare Correlated vs Non-Correlated subqueries, and EXISTS vs IN.",
    question_prompt: "What is a correlated subquery and why does it have O(N * M) performance risks? Why is EXISTS preferred over IN when subquery results contain potential NULL values?",
    question_type: "conceptual",
    difficulty: "intermediate",
    priority: "high",
    expected_answer_points: [
      "Non-correlated subquery: Independent of outer query; evaluates once and passes results to outer query.",
      "Correlated subquery: References columns from the outer query; must re-evaluate once for EVERY candidate row processed by outer query (can become O(N * M) bottleneck).",
      "EXISTS vs IN: IN evaluates all matching values in subquery into a set. EXISTS short-circuits to true upon finding the FIRST matching row.",
      "NULL danger with NOT IN: If subquery contains even a single NULL value, 'val NOT IN (SELECT col ...)' evaluates to UNKNOWN for all rows, returning 0 results. NOT EXISTS handles NULLs safely."
    ],
    sample_answer: "Non-correlated subqueries execute once independently, while correlated subqueries reference outer query columns and re-evaluate for every outer row. EXISTS is generally faster than IN on large tables because it short-circuits as soon as the first matching row is found without loading the entire result set. Crucially, NOT IN fails completely if the subquery returns even a single NULL value (returning zero rows), whereas NOT EXISTS handles NULLs safely.",
    follow_up_questions: [
      "Why does NOT IN evaluate to empty result when the subquery contains a NULL?",
      "How can an anti-join (LEFT JOIN ... WHERE right.id IS NULL) replace NOT EXISTS?"
    ],
    estimated_minutes: 12
  });

  addQ({
    id: "sql-10",
    skill_slug: "sql",
    skill_name: "SQL",
    skill_category: "databases",
    topic: "SELECT, filtering and sorting",
    subtopic: "Pagination: Offset-based vs Keyset (Cursor) Pagination",
    question_title: "Why does OFFSET 1000000 kill database performance, and how does Keyset Pagination solve it?",
    question_prompt: "Explain why OFFSET pagination (LIMIT 20 OFFSET 1000000) causes high disk and CPU latency. How does Keyset/Cursor Pagination (WHERE id > last_seen_id ORDER BY id LIMIT 20) deliver O(1) performance?",
    question_type: "practical_scenario",
    difficulty: "intermediate",
    priority: "critical",
    expected_answer_points: [
      "OFFSET problem: To execute 'LIMIT 20 OFFSET 1000000', the database must scan and discard 1,000,000 rows before returning 20 rows. Latency degrades linearly O(N) as page numbers increase.",
      "Data drift: Adding/deleting rows during pagination shifts row offsets, causing users to see duplicate items or miss items across pages.",
      "Keyset Pagination (Cursor-based): Uses indexed sequential columns (e.g. id or (created_at, id)).",
      "Query: 'WHERE (created_at, id) < (:last_created_at, :last_id) ORDER BY created_at DESC, id DESC LIMIT 20'.",
      "Performance: Traverses B-Tree directly to the cursor key in O(log N) time, regardless of whether viewing page 1 or page 10,000."
    ],
    sample_answer: "OFFSET pagination degrades as page numbers grow because 'OFFSET 1,000,000' forces the database to scan, sort, and discard one million rows before returning the next 20. It also suffers from data drift (duplicated or skipped items when rows are inserted concurrently). Keyset (cursor) pagination uses an indexed unique column: WHERE id > last_seen_id ORDER BY id LIMIT 20. It traverses the B-Tree directly to the target record in O(log n) time, remaining equally fast on page 10,000.",
    follow_up_questions: [
      "How do you implement backward pagination (previous page) in keyset pagination?",
      "When is OFFSET pagination still acceptable or necessary (e.g. jumping to arbitrary page 50)?"
    ],
    estimated_minutes: 12
  });

  addQ({
    id: "sql-11",
    skill_slug: "sql",
    skill_name: "SQL",
    skill_category: "databases",
    topic: "Indexes and query plans",
    subtopic: "Clustered vs Non-Clustered Indexes",
    question_title: "What is the difference between a Clustered Index and a Non-Clustered Index?",
    question_prompt: "Compare Clustered Indexes (Primary Key in MySQL InnoDB) and Non-Clustered (Secondary) Indexes. How does secondary index lookup differ in MySQL vs PostgreSQL heap storage?",
    question_type: "conceptual",
    difficulty: "intermediate",
    priority: "high",
    expected_answer_points: [
      "Clustered Index: Determines the physical on-disk order of table rows. The leaf nodes of the B-Tree contain the actual data rows. A table can have only ONE clustered index (typically Primary Key).",
      "Non-Clustered Index: A separate B-Tree whose leaf nodes contain the index key and a pointer back to the actual row.",
      "MySQL InnoDB: Non-clustered index leaf nodes store the Primary Key value. Secondary index lookups require two traversals: secondary index -> primary key -> clustered index lookup (Double Lookup), unless using covering index.",
      "PostgreSQL: Does not use clustered primary key index by default. Uses Heap Files where non-clustered index leaf nodes point directly to the physical tuple ID (ctid: page + offset)."
    ],
    sample_answer: "A Clustered Index dictates the physical ordering of data on disk; its leaf nodes contain the actual row data (in MySQL InnoDB, the primary key is always the clustered index). A table can have only one clustered index. Non-clustered (secondary) indexes are auxiliary B-Trees whose leaf nodes store index keys and pointers to the row. In MySQL, secondary indexes store the primary key, requiring a secondary lookup into the clustered index unless satisfied by a covering index.",
    follow_up_questions: [
      "Why are sequential auto-incrementing integers or UUIDv7 preferred over random UUIDv4 as primary keys in clustered index tables?",
      "What is page splitting in B-Tree index insertions?"
    ],
    estimated_minutes: 12
  });

  addQ({
    id: "sql-12",
    skill_slug: "sql",
    skill_name: "SQL",
    skill_category: "databases",
    topic: "SELECT, filtering and sorting",
    subtopic: "NULL Semantics & Three-Valued Logic",
    question_title: "How does Three-Valued Logic (3VL) handle NULL in SQL comparisons?",
    question_prompt: "Explain Three-Valued Logic: TRUE, FALSE, and UNKNOWN. Why does 'col = NULL' or 'NULL = NULL' evaluate to UNKNOWN rather than TRUE, and why must IS NULL / IS NOT NULL be used?",
    question_type: "conceptual",
    difficulty: "beginner",
    priority: "medium",
    expected_answer_points: [
      "In SQL, NULL represents missing, unknown, or inapplicable information; it is NOT zero or empty string.",
      "Three-valued logic truth table: TRUE, FALSE, and UNKNOWN.",
      "Any equality or inequality comparison with NULL (x = NULL, x <> NULL, NULL = NULL) yields UNKNOWN.",
      "WHERE clause requirement: A row is returned ONLY if the WHERE predicate evaluates to TRUE. UNKNOWN is discarded just like FALSE.",
      "Syntax: To test for NULL presence, you must use 'IS NULL' or 'IS NOT NULL'.",
      "Functions: COALESCE(val, fallback) returns the first non-null argument."
    ],
    sample_answer: "SQL uses Three-Valued Logic with states TRUE, FALSE, and UNKNOWN. NULL represents an unknown value. Therefore, comparing anything to NULL (even NULL = NULL) cannot be determined and results in UNKNOWN. Because WHERE filters only keep rows where the condition evaluates to TRUE, conditions like 'status = NULL' return zero rows. To test for NULL, you must use 'IS NULL' or handle fallbacks using COALESCE().",
    follow_up_questions: [
      "How do aggregate functions like COUNT(*), COUNT(col), and AVG(col) handle NULL values?",
      "What does COALESCE(a, b, c) do and how does it differ from NULLIF(a, b)?"
    ],
    estimated_minutes: 10
  });

  addQ({
    id: "sql-13",
    skill_slug: "sql",
    skill_name: "SQL",
    skill_category: "databases",
    topic: "ACID, isolation and transactions",
    subtopic: "Database Deadlocks & Resolution",
    question_title: "How do database deadlocks occur, and how do database engines resolve them?",
    question_prompt: "What causes database deadlocks during concurrent transactions (e.g. Transaction 1 locks A then wants B; Transaction 2 locks B then wants A)? How does deadlock detection (Wait-For Graph) work?",
    question_type: "practical_scenario",
    difficulty: "advanced",
    priority: "high",
    expected_answer_points: [
      "Deadlock: Two or more transactions hold locks on resources the other transactions need, creating a circular dependency where neither can proceed.",
      "Wait-For Graph: The database engine maintains a directed graph where nodes are transactions and edges represent lock requests. Background deadlock detector checks for cycles.",
      "Deadlock resolution: The engine chooses a 'victim' transaction (typically the one that has written the least undo log) and rolls it back, releasing its locks and throwing a deadlock exception (error 1213 in MySQL).",
      "Prevention: 1) Consistent lock ordering across all application code; 2) Keep transactions short; 3) Use lower isolation levels if safe; 4) Retry rolled-back transactions with exponential backoff."
    ],
    sample_answer: "A database deadlock occurs when two transactions circularly wait for locks held by each other (e.g. Tx1 updates Row A then requests Row B; Tx2 updates Row B then requests Row A). The database deadlock detector monitors the Wait-For Graph: when a cycle is detected, it automatically picks a victim transaction, rolls it back to release its locks, and throws a deadlock exception. Application code must catch deadlock errors and retry the entire transaction.",
    follow_up_questions: [
      "How does establishing a global alphabetical/ID lock ordering prevent deadlocks?",
      "What is the difference between lock timeout (innodb_lock_wait_timeout) and deadlock detection?"
    ],
    estimated_minutes: 12
  });

  addQ({
    id: "sql-14",
    skill_slug: "sql",
    skill_name: "SQL",
    skill_category: "databases",
    topic: "ACID, isolation and transactions",
    subtopic: "Write-Ahead Logging (WAL) & Crash Recovery",
    question_title: "How does Write-Ahead Logging (WAL) guarantee Durability and Crash Recovery?",
    question_prompt: "Explain how WAL (redo log / commit log) enables fast in-memory writes. What is the ARIES recovery algorithm (Analysis, Redo, Undo) during database startup after an unexpected crash?",
    question_type: "conceptual",
    difficulty: "advanced",
    priority: "high",
    expected_answer_points: [
      "Write-Ahead Logging rule: No data page can be written to non-volatile disk storage until the corresponding log record describing the update has been flushed to disk (fsync).",
      "Why it's fast: Sequential append-only disk I/O to the WAL log file is orders of magnitude faster than random-access disk updates to scattered data pages.",
      "ARIES recovery phases: 1) Analysis: Scans log forward from last checkpoint to identify dirty pages in memory and active in-flight transactions at time of crash.",
      "2) Redo: Replays all logged changes forward to restore database to exact state at moment of crash (repeating history).",
      "3) Undo: Scans backward, rolling back all uncommitted transactions active during the crash to restore consistency."
    ],
    sample_answer: "Write-Ahead Logging dictates that changes must be appended to an on-disk sequential log before dirty data pages are flushed to table files. Sequential disk writes to WAL are fast, allowing transactions to commit immediately while dirty pages flush asynchronously. Upon crashing, the engine recovers using ARIES: Analysis scans from the last checkpoint; Redo replays all logged changes to bring pages up to crash state; and Undo rolls back in-flight uncommitted transactions using undo logs.",
    follow_up_questions: [
      "What is a Checkpoint in database logging and why does it truncate WAL size?",
      "What is the performance trade-off of innodb_flush_log_at_trx_commit = 1 vs 2?"
    ],
    estimated_minutes: 15
  });

  // --- MYSQL (10) ---
  addQ({
    id: "mysql-01",
    skill_slug: "mysql",
    skill_name: "MySQL",
    skill_category: "databases",
    topic: "InnoDB and indexes",
    subtopic: "InnoDB Storage Engine Architecture",
    question_title: "Explain the architecture of the MySQL InnoDB Storage Engine.",
    question_prompt: "Detail InnoDB internal memory structures (Buffer Pool, Change Buffer, Adaptive Hash Index, Log Buffer) and disk structures (System Tablespace, File-Per-Table, Redo Log, Undo Tablespace).",
    question_type: "conceptual",
    difficulty: "advanced",
    priority: "high",
    expected_answer_points: [
      "Buffer Pool: Crucial memory cache storing cached data pages and index pages (LRU eviction algorithm). Typically allocated 60-80% of server RAM.",
      "Redo Log (ib_logfile): Circular buffer and files guaranteeing Durability (WAL).",
      "Undo Log: Stores previous versions of rows for rollback and MVCC snapshots.",
      "Doublewrite Buffer: Writes pages to a contiguous doublewrite disk buffer before writing to data files, preventing torn-page corruption during power loss.",
      "Adaptive Hash Index: Automatically builds in-memory hash indexes on frequently accessed B-Tree pages."
    ],
    sample_answer: "InnoDB is MySQL's default transactional storage engine. In-memory structures include the Buffer Pool (caching data and index pages via an LRU list, typically 70% of RAM), Redo Log Buffer, and Undo Logs. On disk, it manages tablespaces (.ibd files), Redo Log files for durability, and the Doublewrite Buffer to protect against partial page writes on hardware power failure. It uses MVCC to deliver non-blocking consistent reads.",
    follow_up_questions: [
      "What is a torn-page write and how does the Doublewrite Buffer solve it?",
      "How is the InnoDB Buffer Pool sized in production (innodb_buffer_pool_size)?"
    ],
    estimated_minutes: 15
  });

  addQ({
    id: "mysql-02",
    skill_slug: "mysql",
    skill_name: "MySQL",
    skill_category: "databases",
    topic: "Transactions and isolation",
    subtopic: "MVCC & Undo Logs in MySQL",
    question_title: "How does Multi-Version Concurrency Control (MVCC) work in MySQL InnoDB?",
    question_prompt: "Explain how InnoDB reads without locking using MVCC: hidden columns (DB_TRX_ID, DB_ROLL_PTR), Undo Logs, Read Views, and consistent non-blocking reads.",
    question_type: "conceptual",
    difficulty: "advanced",
    priority: "critical",
    expected_answer_points: [
      "MVCC enables non-blocking reads: Readers do not block writers, and writers do not block readers.",
      "Hidden columns on each row: DB_TRX_ID (transaction ID that inserted/updated the row) and DB_ROLL_PTR (roll pointer pointing to the previous version in the Undo Log).",
      "Read View: Snapshot of active transactions when a query executes.",
      "Read Committed creates a fresh Read View before EVERY statement.",
      "Repeatable Read creates one Read View at the START of the transaction and reuses it throughout, ensuring identical row views.",
      "Old undo logs are cleaned up by background Purge Threads once no active Read View references them."
    ],
    sample_answer: "InnoDB MVCC uses hidden row columns: DB_TRX_ID (last modifying transaction) and DB_ROLL_PTR (pointer to previous row state in the Undo Log). When a SELECT runs, it creates a Read View listing active transactions. If a row was modified by an in-flight or newer transaction, InnoDB traverses the undo log chain backwards to reconstruct the row as it existed when the snapshot was taken. This allows consistent reads without acquiring locks.",
    follow_up_questions: [
      "Why do long-running transactions prevent Undo Log purging and cause tablespace bloat?",
      "What is the difference between a Consistent Non-locking Read and a Locking Read (SELECT ... FOR UPDATE)?"
    ],
    estimated_minutes: 15
  });

  addQ({
    id: "mysql-03",
    skill_slug: "mysql",
    skill_name: "MySQL",
    skill_category: "databases",
    topic: "Transactions and isolation",
    subtopic: "Record Locks, Gap Locks, and Next-Key Locks",
    question_title: "Explain Record Locks, Gap Locks, and Next-Key Locks in InnoDB.",
    question_prompt: "How does InnoDB eliminate Phantom Reads in Repeatable Read isolation? Define Record Lock, Gap Lock (locking space between records), and Next-Key Lock (Record + Gap).",
    question_type: "conceptual",
    difficulty: "advanced",
    priority: "critical",
    expected_answer_points: [
      "Record Lock: Locks the specific index record (e.g. WHERE id = 10).",
      "Gap Lock: Locks the gap between index records (e.g. between 10 and 20), preventing other transactions from inserting new rows into that gap.",
      "Next-Key Lock: Combination of a Record Lock on the index record plus a Gap Lock on the gap immediately preceding that record.",
      "Phantom Read prevention: When running SELECT ... FOR UPDATE with a range condition under Repeatable Read, Next-Key locking locks existing rows AND all gaps in the range, blocking concurrent INSERTs.",
      "Point queries on UNIQUE indexes with unique match degrade Next-Key locks to pure Record locks."
    ],
    sample_answer: "To prevent phantom reads under Repeatable Read, InnoDB uses Next-Key locking: a combination of a Record Lock (locking the index record) and a Gap Lock (locking the open space before the record). When a range query executes (e.g. WHERE age > 25 FOR UPDATE), InnoDB locks all existing qualifying rows and all gaps between them. Any concurrent transaction attempting to INSERT a new record into these locked gaps is blocked until commit.",
    follow_up_questions: [
      "Why are Gap Locks disabled under Read Committed isolation level?",
      "How do Gap Locks contribute to unexpected deadlock errors in concurrent INSERT statements?"
    ],
    estimated_minutes: 15
  });

  addQ({
    id: "mysql-04",
    skill_slug: "mysql",
    skill_name: "MySQL",
    skill_category: "databases",
    topic: "EXPLAIN and query optimization",
    subtopic: "MySQL Query Optimization & Index Condition Pushdown",
    question_title: "What is Index Condition Pushdown (ICP) in MySQL?",
    question_prompt: "Explain Index Condition Pushdown (Extra: Using index condition). How does evaluating WHERE filters at the storage engine index level reduce calls to the MySQL server layer and disk reads?",
    question_type: "conceptual",
    difficulty: "intermediate",
    priority: "medium",
    expected_answer_points: [
      "Pre-ICP: Storage engine retrieves index record -> reads full table row from disk -> passes row up to MySQL Server engine -> Server engine evaluates remaining WHERE filters.",
      "With ICP (MySQL 5.6+): MySQL pushes down parts of the WHERE clause that involve index columns directly to the storage engine layer.",
      "The storage engine evaluates the condition on the index entry first: if not met, it immediately skips reading the table row from disk.",
      "Benefit: Dramatically reduces disk I/O and communication overhead between engine and server layer.",
      "Indicated in EXPLAIN output as 'Using index condition'."
    ],
    sample_answer: "Without Index Condition Pushdown (ICP), the storage engine reads index pointers, fetches full table rows from disk, and sends them to the MySQL server layer to evaluate WHERE conditions. With ICP enabled, MySQL pushes conditions involving index columns directly into the storage engine: the engine filters candidate rows while inspecting the index tree and reads table rows from disk only if the condition passes, drastically reducing random disk I/O.",
    follow_up_questions: [
      "Can ICP be used on clustered primary key indexes?",
      "What is Multi-Range Read (MRR) optimization in MySQL?"
    ],
    estimated_minutes: 10
  });

  addQ({
    id: "mysql-05",
    skill_slug: "mysql",
    skill_name: "MySQL",
    skill_category: "databases",
    topic: "InnoDB and indexes",
    subtopic: "Replication: Asynchronous vs Semi-Synchronous",
    question_title: "How does MySQL Replication work: Asynchronous vs Semi-Synchronous?",
    question_prompt: "Explain MySQL Replication architecture: Binary Log (binlog), Relay Log, I/O thread, and SQL/Worker thread. Compare Asynchronous replication with Semi-Synchronous replication and GTID (Global Transaction Identifiers).",
    question_type: "conceptual",
    difficulty: "advanced",
    priority: "high",
    expected_answer_points: [
      "Components: Source writes events to binlog. Replica's I/O thread connects to source, reads binlog events, and writes them to local Relay Log. Replica's SQL thread applies relay log events to replica database.",
      "Asynchronous (default): Primary commits and returns to client without waiting for replicas. Highest throughput, but failover causes data loss (replication lag).",
      "Semi-Synchronous: Primary commits locally, but waits until at least ONE replica acknowledges receiving the event into its relay log before returning success to client.",
      "GTID (Global Transaction Identifier): Every transaction receives a unique cluster-wide ID (source_uuid:transaction_id). Simplifies failover and ensures replicas can reconnect to new primaries without manual binlog coordinates."
    ],
    sample_answer: "MySQL replication copies data from primary to replicas via logs: the primary writes changes to the Binary Log; the replica's I/O thread writes these to its Relay Log, and the SQL thread executes them. In asynchronous replication, the primary commits without waiting for replicas (fast, but risks data loss during primary crash). Semi-synchronous replication requires at least one replica to acknowledge receiving the event into its relay log before the client gets a commit success. GTID simplifies automated failover.",
    follow_up_questions: [
      "What is replication lag and how do you monitor Seconds_Behind_Master?",
      "What is Row-Based Replication (RBR) vs Statement-Based Replication (SBR) in binlog formats?"
    ],
    estimated_minutes: 15
  });

  addQ({
    id: "mysql-06",
    skill_slug: "mysql",
    skill_name: "MySQL",
    skill_category: "databases",
    topic: "InnoDB and indexes",
    subtopic: "Slow Query Log & pt-query-digest",
    question_title: "How do you identify and troubleshoot slow queries using the MySQL Slow Query Log?",
    question_prompt: "Explain slow_query_log, long_query_time, and log_queries_not_using_indexes. How do you analyze slow log files using mysqldumpslow and Percona pt-query-digest?",
    question_type: "practical_scenario",
    difficulty: "intermediate",
    priority: "high",
    expected_answer_points: [
      "Configuration: slow_query_log = 1, slow_query_log_file = /var/log/mysql/slow.log.",
      "long_query_time = 0.5 (logs queries taking longer than 500ms; supports microsecond granularity in modern MySQL).",
      "log_queries_not_using_indexes = 1 (logs all queries that perform full table scans regardless of execution duration).",
      "mysqldumpslow: Command-line utility to summarize and group similar query patterns by total time or count.",
      "pt-query-digest: Advanced Percona tool that produces detailed statistical distribution histograms (95th percentile latency, lock time, rows examined vs rows sent)."
    ],
    sample_answer: "Enable the slow query log by setting slow_query_log = 1 and long_query_time (e.g. 0.2s for 200ms). Setting log_queries_not_using_indexes captures queries executing full table scans. To parse large logs, use pt-query-digest from Percona Toolkit, which aggregates queries into fingerprints, sorting them by total response time, lock contention, and the ratio of rows examined versus rows returned to identify top optimization targets.",
    follow_up_questions: [
      "Why is a high ratio of 'Rows examined' to 'Rows sent' an indicator of a missing index?",
      "What is the performance overhead of enabling the slow query log in production?"
    ],
    estimated_minutes: 10
  });

  addQ({
    id: "mysql-07",
    skill_slug: "mysql",
    skill_name: "MySQL",
    skill_category: "databases",
    topic: "Constraints and relationships",
    subtopic: "Foreign Key Constraints & Locking Pitfalls",
    question_title: "What are the locking and performance implications of Foreign Keys in MySQL InnoDB?",
    question_prompt: "How does InnoDB enforce foreign key constraints (ON DELETE CASCADE, RESTRICT)? Why do foreign key checks acquire shared locks on parent rows, and why do large microservice teams avoid DB-level foreign keys?",
    question_type: "conceptual",
    difficulty: "intermediate",
    priority: "medium",
    expected_answer_points: [
      "Enforcement: When inserting a child row, InnoDB acquires a Shared (S) lock on the referenced parent row to ensure it cannot be deleted concurrently.",
      "Deadlock risk: Concurrent inserts into child tables referencing the same parent can cause deadlocks due to shared lock upgrades.",
      "Cascade overhead: ON DELETE CASCADE on large tables can lock thousands of child rows in a single transaction, blowing up the undo log and locking concurrent traffic.",
      "Enterprise/microservice trend: High-throughput teams often enforce referential integrity at the application service level to avoid cross-table locking and enable independent database sharding."
    ],
    sample_answer: "Foreign keys enforce referential integrity at the database level. However, inserting or updating a child row forces InnoDB to acquire a Shared (S) lock on the parent table record to prevent concurrent parent deletions, which introduces lock contention and deadlocks under high concurrency. ON DELETE CASCADE can lock thousands of child records in one transaction. In high-scale distributed systems, teams often enforce integrity in application code to avoid locking bottlenecks.",
    follow_up_questions: [
      "Why does MySQL require an index on both the parent and child columns involved in a foreign key?",
      "What is foreign_key_checks = 0 and when is it used during data migrations?"
    ],
    estimated_minutes: 10
  });

  addQ({
    id: "mysql-08",
    skill_slug: "mysql",
    skill_name: "MySQL",
    skill_category: "databases",
    topic: "InnoDB and indexes",
    subtopic: "Online DDL with pt-online-schema-change / gh-ost",
    question_title: "How do you perform zero-downtime schema migrations on massive MySQL tables?",
    question_prompt: "Why can ALTER TABLE lock large production tables? Compare MySQL native Online DDL (ALGORITHM=INPLACE) with trigger-based (pt-online-schema-change) and binlog-based (gh-ost) migration tools.",
    question_type: "practical_scenario",
    difficulty: "advanced",
    priority: "high",
    expected_answer_points: [
      "Risk of ALTER TABLE: Legacy schema changes lock the table against writes (metadata lock / table lock), causing connection queues to spike and taking the application down.",
      "MySQL Online DDL (ALGORITHM=INPLACE, LOCK=NONE): Supports adding non-null columns and indexes online, but requires brief exclusive metadata locks at start and end.",
      "pt-online-schema-change: Creates new shadow table -> applies triggers (AFTER INSERT/UPDATE/DELETE) on old table to replicate writes -> copies rows in chunks -> atomic RENAME.",
      "gh-ost: GitHub's triggerless online schema changer. Tails the MySQL binary log instead of using triggers, avoiding trigger overhead and deadlock contention."
    ],
    sample_answer: "Direct ALTER TABLE statements on multi-gigabyte tables can block writes due to metadata locks. While MySQL supports native Online DDL (ALGORITHM=INPLACE), complex migrations still pose operational risks. Tools like Percona's pt-online-schema-change create a shadow table, sync live writes via triggers, chunk-copy data, and swap tables atomically. Modern setups prefer gh-ost, which reads the binlog directly instead of using triggers, avoiding lock contention.",
    follow_up_questions: [
      "What is a Metadata Lock (MDL) and how can a slow SELECT block an ALTER TABLE indefinitely?",
      "What is the Liquibase / Flyway migration tool standard in Spring Boot?"
    ],
    estimated_minutes: 12
  });

  addQ({
    id: "mysql-09",
    skill_slug: "mysql",
    skill_name: "MySQL",
    skill_category: "databases",
    topic: "EXPLAIN and query optimization",
    subtopic: "Optimizing ORDER BY and GROUP BY",
    question_title: "How do you optimize ORDER BY and GROUP BY queries to avoid 'Using filesort'?",
    question_prompt: "Explain how B-Tree indexes satisfy ORDER BY requirements naturally. What conditions force MySQL to fall back to filesort (sort_buffer_size), and how do you design composite indexes to cover filtering and sorting simultaneously?",
    question_type: "coding",
    difficulty: "intermediate",
    priority: "high",
    expected_answer_points: [
      "Because B-Trees are pre-sorted, reading index leaf nodes in sequence satisfies ORDER BY without sorting.",
      "Golden rule: For query 'WHERE status = ? ORDER BY created_at DESC', create composite index ON (status, created_at). The equality filter narrows to one status, and the second column is already sorted.",
      "Filesort trigger: Filtering on a range condition (WHERE age > 20 ORDER BY created_at) breaks index ordering, forcing filesort.",
      "Mixing sort directions: 'ORDER BY a ASC, b DESC' requires an explicit descending index (INDEX(a ASC, b DESC)) introduced in MySQL 8.0.",
      "sort_buffer_size: In-memory buffer for filesort; exceeding it forces temp disk files (merge sorts)."
    ],
    sample_answer: "B-Tree indexes maintain keys in sorted order. If a query filters by equality on one column and sorts by another (WHERE status = 'ACTIVE' ORDER BY created_at), a composite index ON (status, created_at) satisfies both the filter and the sort directly from the index, eliminating filesort. However, if the filter is a range (age > 20) or if sort directions mix (colA ASC, colB DESC without a matching composite index), MySQL must fall back to filesort in memory or disk.",
    follow_up_questions: [
      "What is the difference between single-pass and two-pass filesort algorithms?",
      "How does MySQL 8.0 descending index support improve multi-column sorting?"
    ],
    estimated_minutes: 12
  });

  addQ({
    id: "mysql-10",
    skill_slug: "mysql",
    skill_name: "MySQL",
    skill_category: "databases",
    topic: "InnoDB and indexes",
    subtopic: "Partitioning: Range, List, Hash, and Key",
    question_title: "How does Table Partitioning work in MySQL, and what is Partition Pruning?",
    question_prompt: "Explain horizontal table partitioning (RANGE, LIST, HASH). What is Partition Pruning, and what restriction exists regarding primary and unique keys in partitioned tables?",
    question_type: "conceptual",
    difficulty: "intermediate",
    priority: "medium",
    expected_answer_points: [
      "Partitioning splits a single large logical table into multiple smaller physical tablespaces (.ibd files).",
      "RANGE partitioning: Segregates data by value ranges (e.g. PARTITION BY RANGE (YEAR(created_at))). Ideal for time-series data and fast purging (ALTER TABLE DROP PARTITION is instantaneous compared to slow DELETE).",
      "Partition Pruning: The optimizer skips reading partitions that cannot possibly contain matching data based on the WHERE clause.",
      "Key restriction: Every unique key (including Primary Key) on the table MUST include every column in the table's partitioning expression."
    ],
    sample_answer: "Table partitioning splits a large table into separate physical files based on a partition key (such as RANGE by year or month). Partition Pruning allows the query optimizer to scan only relevant partitions, ignoring the rest. A major operational benefit is instant data archiving: dropping an old partition (ALTER TABLE DROP PARTITION) frees disk space in milliseconds, avoiding heavy row-by-row DELETE queries. Every unique key on the table must include the partition key.",
    follow_up_questions: [
      "Why is DROP PARTITION so much faster and less resource-intensive than DELETE FROM table WHERE date < ...?",
      "What happens if a query on a partitioned table omits the partitioning key from its WHERE clause?"
    ],
    estimated_minutes: 10
  });

  // --- MONGODB (8) ---
  addQ({
    id: "mongo-01",
    skill_slug: "mongodb",
    skill_name: "MongoDB",
    skill_category: "databases",
    topic: "Document modeling",
    subtopic: "Embedding vs Referencing",
    question_title: "When should you Embed documents versus Reference documents in MongoDB?",
    question_prompt: "Explain data modeling in MongoDB: One-to-Few, One-to-Many, and One-to-Squillions. When is document embedding (denormalization) preferred over referencing (normalized ObjectId links)?",
    question_type: "conceptual",
    difficulty: "intermediate",
    priority: "high",
    expected_answer_points: [
      "Embedding (denormalization): Nested subdocuments inside parent. Advantages: single read retrieves entire document (no joins), atomic single-document updates. Disadvantages: 16MB BSON document size limit, data duplication on update.",
      "Referencing (normalization): Storing ObjectId references. Advantages: smaller documents, no duplication, mirrors relational models. Disadvantages: requires application-level lookups or $lookup aggregation joins.",
      "Rule: One-to-Few (e.g. user with 2-3 addresses) -> Embed.",
      "One-to-Many (e.g. order with 50 line items) -> Embed if accessed together.",
      "One-to-Squillions (e.g. IoT sensor logs) -> Reference parent ID on the child document."
    ],
    sample_answer: "In MongoDB, embed documents when data is viewed together and changes together (One-to-Few, like user shipping addresses), gaining single-query retrieval and atomic document updates. Use referencing (storing ObjectIds) when entities are shared across multiple parents (e.g. products in orders), when data grows unbounded (avoiding MongoDB's 16MB document size limit), or in One-to-Squillions relationships (e.g. server error logs referencing server ID).",
    follow_up_questions: [
      "What is the maximum BSON document size limit in MongoDB (16MB)?",
      "What is the Subset Pattern in MongoDB schema design?"
    ],
    estimated_minutes: 12
  });

  addQ({
    id: "mongo-02",
    skill_slug: "mongodb",
    skill_name: "MongoDB",
    skill_category: "databases",
    topic: "Aggregation pipeline",
    subtopic: "Aggregation Pipeline Stages",
    question_title: "Explain the MongoDB Aggregation Pipeline: $match, $group, $project, and $lookup.",
    question_prompt: "Walk through key aggregation pipeline stages. Why should $match and $sort be placed at the very beginning of the pipeline for index utilization? How does $lookup perform left outer joins?",
    question_type: "coding",
    difficulty: "intermediate",
    priority: "high",
    expected_answer_points: [
      "Aggregation pipeline: Array of transformation stages where documents flow through sequential operations.",
      "$match: Filters documents (uses indexes if placed as the first stage).",
      "$group: Groups documents by an accumulator key (_id) and calculates aggregates ($sum, $avg).",
      "$project: Reshapes documents, includes/excludes fields, computes derived fields.",
      "$lookup: Performs left outer join to an unsharded collection: { from, localField, foreignField, as }.",
      "$unwind: Deconstructs an array field from input documents to output a document for each element."
    ],
    sample_answer: "The aggregation pipeline processes documents through stages: $match filters documents, $project reshapes fields, $group aggregates metrics, $unwind flattens arrays, and $lookup performs left outer joins across collections. Placing $match and $sort at the start of the pipeline is essential because only the first stages can leverage indexes. Subsequent stages operate on in-memory BSON streams.",
    follow_up_questions: [
      "What is the in-memory RAM limit for aggregation stages (100MB) and how does allowDiskUse solve it?",
      "How does the $facet stage enable multi-faceted search (e.g. simultaneous results and category counts)?"
    ],
    estimated_minutes: 15
  });

  addQ({
    id: "mongo-03",
    skill_slug: "mongodb",
    skill_name: "MongoDB",
    skill_category: "databases",
    topic: "Indexes",
    subtopic: "MongoDB Index Types & Compound Indexes",
    question_title: "Explain MongoDB Index Types: Single Field, Compound, Multikey, and TTL.",
    question_prompt: "Compare Single Field indexes, Compound indexes (ESR rule: Equality, Sort, Range), Multikey indexes (indexing arrays), and TTL (Time-To-Live) indexes for automatic document expiration.",
    question_type: "conceptual",
    difficulty: "intermediate",
    priority: "high",
    expected_answer_points: [
      "Compound Index & ESR Rule: Index fields should follow Equality first, Sort second, Range third (Equality -> Sort -> Range).",
      "Multikey Index: Automatically created when an indexed field is an array; creates index entries for every element in the array.",
      "TTL Index: Created on date fields with expireAfterSeconds; a background thread automatically deletes expired documents (ideal for sessions or temporary verification tokens).",
      "Partial Index: Only indexes documents matching a specified filter expression (filter: { status: 'active' }), saving RAM.",
      "Text Index: Supports stemming and token search."
    ],
    sample_answer: "MongoDB indexes optimize queries: Compound indexes should follow the ESR rule (Equality fields first, Sort fields second, Range fields last) to eliminate in-memory sorting. Multikey indexes index array elements automatically. TTL indexes use an expireAfterSeconds parameter on a Date field, prompting background threads to delete expired records automatically (perfect for temporary auth tokens). Partial indexes save RAM by indexing only documents matching a filter.",
    follow_up_questions: [
      "What is a Covered Query in MongoDB?",
      "Can a compound index include more than one array field (multikey limitation)?"
    ],
    estimated_minutes: 12
  });

  addQ({
    id: "mongo-04",
    skill_slug: "mongodb",
    skill_name: "MongoDB",
    skill_category: "databases",
    topic: "Transactions and consistency",
    subtopic: "Replica Sets & Primary-Secondary Election",
    question_title: "How do MongoDB Replica Sets achieve High Availability and Automatic Failover?",
    question_prompt: "Explain Replica Set architecture: Primary, Secondaries, and Arbiters. How does Raft-like election handle primary node failures, and what are write concerns (w: 1 vs w: 'majority')?",
    question_type: "conceptual",
    difficulty: "intermediate",
    priority: "medium",
    expected_answer_points: [
      "Replica set: Cluster of MongoDB nodes maintaining identical data via oplog (operations log). Minimum 3 nodes recommended.",
      "Primary: Accepts all write operations. Secondaries replicate oplog asynchronously.",
      "Election: If primary stops heartbeating (10s timeout), secondaries hold an election to promote the secondary with the most up-to-date oplog.",
      "Write Concern: w: 1 acknowledges write once written to Primary memory/disk; w: 'majority' acknowledges write only after written to a majority of replica nodes (prevents rollback during failover).",
      "Read Preference: primary (default), primaryPreferred, secondary, secondaryPreferred, nearest."
    ],
    sample_answer: "A MongoDB Replica Set consists of a Primary and multiple Secondaries that replicate the primary's oplog. If the Primary becomes unreachable, remaining secondaries elect a new Primary based on who has the latest oplog. Write concerns dictate durability: w: 1 returns immediately after primary write (fast, but risks rollback on sudden crash), while w: 'majority' ensures a majority of replica nodes acknowledge the write before success is returned.",
    follow_up_questions: [
      "What is an Arbiter in MongoDB and why are they discouraged in production?",
      "What is Read Concern 'majority' and 'linearizable'?"
    ],
    estimated_minutes: 12
  });

  addQ({
    id: "mongo-05",
    skill_slug: "mongodb",
    skill_name: "MongoDB",
    skill_category: "databases",
    topic: "Transactions and consistency",
    subtopic: "Multi-Document ACID Transactions",
    question_title: "How do Multi-Document ACID Transactions work in MongoDB 4.0+?",
    question_prompt: "Explain how MongoDB implements multi-document transactions using session.startTransaction(). What are performance implications, and why should transactions not be used for single-document updates?",
    question_type: "coding",
    difficulty: "advanced",
    priority: "medium",
    expected_answer_points: [
      "Single-document atomicity: MongoDB has ALWAYS guaranteed atomicity for updates to a single document (including embedded arrays/subdocuments).",
      "Multi-document transactions: Introduced in MongoDB 4.0 (replica sets) and 4.2 (sharded clusters) using sessions.",
      "Syntax: const session = client.startSession(); session.startTransaction(); await collection.updateOne(..., { session }); await session.commitTransaction().",
      "Overhead: Uses WiredTiger snapshot isolation, acquires locks, increases memory pressure, and limits transaction duration (default 60s max).",
      "Rule: Model data using embedded documents so 99% of writes are single-document atomic, reserving multi-document transactions for rare relational workflows."
    ],
    sample_answer: "MongoDB natively provides atomic operations on single documents. For mutations spanning multiple documents or collections, MongoDB 4.0+ provides multi-document ACID transactions via client sessions (startSession -> startTransaction -> commitTransaction). These operate under snapshot isolation. However, multi-document transactions add lock contention and memory overhead; schemas should be modeled with embedding to keep operations single-document whenever possible.",
    follow_up_questions: [
      "What is the maximum transaction lifetime limit in MongoDB (60 seconds)?",
      "What happens if two concurrent transactions attempt to modify the same document (WriteConflictException)?"
    ],
    estimated_minutes: 12
  });

  addQ({
    id: "mongo-06",
    skill_slug: "mongodb",
    skill_name: "MongoDB",
    skill_category: "databases",
    topic: "Embedding versus referencing",
    subtopic: "Sharding & Shard Key Selection",
    question_title: "How does Horizontal Sharding work in MongoDB, and how do you choose a Shard Key?",
    question_prompt: "Explain MongoDB Sharding architecture: Routers (mongos), Config Servers, and Shard Pods. What are the consequences of choosing a bad shard key (monotonically increasing IDs vs low-cardinality keys)?",
    question_type: "conceptual",
    difficulty: "advanced",
    priority: "medium",
    expected_answer_points: [
      "Sharding distributes data horizontally across multiple clusters (shards).",
      "Components: mongos (stateless query router), Config Database (stores metadata and chunk routing tables), and Shards (each is an independent replica set).",
      "Bad shard key 1 (Monotonically increasing e.g. ObjectId, timestamp): All new writes target the same single shard (hotspotting), destroying horizontal write throughput.",
      "Bad shard key 2 (Low cardinality e.g. status: 'active'): Cannot split chunks across shards; leads to jumbo chunks that cannot move.",
      "Good shard key: High cardinality, high frequency of query filters, and even write distribution (often a compound key or Hashed Shard Key)."
    ],
    sample_answer: "Sharding distributes data across multiple replica sets. mongos routers inspect incoming queries and forward them to relevant shards using routing metadata stored on Config Servers. Choosing a poor shard key cripples performance: monotonically increasing keys (like timestamps) route all inserts to a single hot shard, while low-cardinality keys create un-splittable jumbo chunks. A good shard key combines high cardinality with even write distribution (or uses hashed sharding).",
    follow_up_questions: [
      "What is a Scatter-Gather query in a sharded cluster?",
      "What is Hashed Sharding and what is its trade-off for range queries?"
    ],
    estimated_minutes: 12
  });

  addQ({
    id: "mongo-07",
    skill_slug: "mongodb",
    skill_name: "MongoDB",
    skill_category: "databases",
    topic: "Document modeling",
    subtopic: "Atomic Updates: $set, $push, and arrayFilters",
    question_title: "How do you perform atomic array updates in MongoDB using $push, $pull, and arrayFilters?",
    question_prompt: "Show how to update a specific nested item inside an array atomically using arrayFilters ($[elem]). Why is atomic in-place mutation superior to fetching the document, modifying the array in JavaScript, and saving it back?",
    question_type: "coding",
    difficulty: "intermediate",
    priority: "high",
    expected_answer_points: [
      "Race condition problem: Read-modify-write in application code causes lost updates if two users modify different elements of the array concurrently.",
      "Atomic operators: $push (adds element), $pull (removes element), $addToSet (adds only if unique).",
      "arrayFilters: updateOne({ _id: orderId }, { $set: { 'items.$[elem].quantity': 5 } }, { arrayFilters: [{ 'elem.productId': prodId }] }).",
      "Executes atomically on the database server in a single operation without network roundtrips or optimistic lock retries."
    ],
    sample_answer: "Fetching a document into JavaScript memory, modifying an array, and saving it back introduces race conditions where concurrent updates overwrite each other. MongoDB provides atomic array operators like $push, $pull, and $addToSet. To update a nested object inside an array, use arrayFilters: updateOne({ _id: id }, { $set: { 'items.$[item].qty': 10 } }, { arrayFilters: [{ 'item.id': targetId }] }). This updates the specific array element atomically inside the database engine.",
    follow_up_questions: [
      "What is the positional operator ($) and how does it differ from the all-positional operator ($[]) and filtered operator ($[<identifier>])?",
      "How does findOneAndUpdate() guarantee atomic state transitions for reservation systems?"
    ],
    estimated_minutes: 12
  });

  addQ({
    id: "mongo-08",
    skill_slug: "mongodb",
    skill_name: "MongoDB",
    skill_category: "databases",
    topic: "Indexes",
    subtopic: "WiredTiger Storage Engine & Cache Eviction",
    question_title: "How does the WiredTiger Storage Engine handle concurrency and compression in MongoDB?",
    question_prompt: "Explain WiredTiger concurrency (document-level locking), internal cache sizing (50% RAM minus 1GB), and snappy/zlib compression for collections and indexes.",
    question_type: "conceptual",
    difficulty: "advanced",
    priority: "medium",
    expected_answer_points: [
      "Document-level concurrency: WiredTiger uses optimistic concurrency control and document-level locking for writes (unlike MMAPv1's collection/database locks).",
      "WiredTiger Cache: Configured by default to 50% of (total RAM - 1GB). Caches uncompressed pages in memory.",
      "Disk storage: Writes to disk are compressed using Snappy (fast, default) or zlib (higher compression ratio, higher CPU).",
      "Checkpoints: Every 60 seconds (or 2GB of data), WiredTiger writes a consistent checkpoint to disk."
    ],
    sample_answer: "WiredTiger is MongoDB's default storage engine, offering document-level locking and optimistic concurrency. It divides memory between the WiredTiger Cache (50% of available RAM minus 1GB, holding uncompressed data pages) and the OS page cache (holding compressed disk pages). Data is written to disk with Snappy compression by default. Periodic checkpoints flush in-memory changes to disk every 60 seconds to ensure consistent crash recovery alongside the journal.",
    follow_up_questions: [
      "What is the difference between WiredTiger Journaling and Checkpointing?",
      "Why does MongoDB memory usage as reported by the OS appear higher than the WiredTiger cache size?"
    ],
    estimated_minutes: 10
  });

  // --- FIREBASE (5) ---
  addQ({
    id: "fb-01",
    skill_slug: "firebase",
    skill_name: "Firebase",
    skill_category: "databases",
    topic: "Firestore data modeling",
    subtopic: "Firestore Collections vs Subcollections",
    question_title: "How does Firestore structure data: Collections, Documents, and Subcollections?",
    question_prompt: "Explain Firestore's document-collection model. Compare subcollections (users/{id}/orders/{id}) with root collections with foreign key references. What is a Collection Group query?",
    question_type: "conceptual",
    difficulty: "intermediate",
    priority: "low",
    expected_answer_points: [
      "Document-Collection model: Documents hold fields; collections hold documents. Documents cannot directly contain other documents; they contain subcollections.",
      "Queries are shallow: Querying a collection never retrieves data from its subcollections.",
      "Subcollections: Best for data logically scoped to a single parent document (e.g. user messages). Automatically partitioned by parent.",
      "Root collections with references: Best when data needs to be queried globally across all users without collection group indexes.",
      "Collection Group query: Queries all subcollections sharing the same name across the entire database (e.g. querying all 'orders' subcollections across all users)."
    ],
    sample_answer: "Firestore organizes data into collections of documents. Documents can contain subcollections, but queries are shallow—fetching a document never fetches its subcollections. Subcollections (users/{id}/reviews) are ideal for hierarchically owned data. To query across subcollections with the same name across all parents, Firestore provides Collection Group queries, which require creating a specialized collection group index in Firebase Console.",
    follow_up_questions: [
      "What is the 1MB document size limit in Cloud Firestore?",
      "Why does Firestore charge based on document reads, writes, and deletes rather than data bandwidth?"
    ],
    estimated_minutes: 10
  });

  addQ({
    id: "fb-02",
    skill_slug: "firebase",
    skill_name: "Firebase",
    skill_category: "databases",
    topic: "Security rules",
    subtopic: "Firestore Security Rules & Authorization",
    question_title: "How do Firestore Security Rules enforce authentication and authorization?",
    question_prompt: "Explain Firestore security rules syntax: match /databases/{database}/documents. How do you verify request.auth != null and check user ownership (request.auth.uid == resource.data.userId)?",
    question_type: "coding",
    difficulty: "intermediate",
    priority: "low",
    expected_answer_points: [
      "Rules evaluate on every client request; server SDKs (Admin SDK) bypass rules entirely.",
      "Authentication check: request.auth != null verifies user is signed in via Firebase Auth.",
      "User ownership: allow read, write: if request.auth.uid == resource.data.ownerId.",
      "Data validation: allow create: if request.resource.data.price > 0 && request.resource.data.name is string.",
      "Security rule rule-of-thumb: Rules are not filters. A query fails completely if it could potentially return even one document forbidden by security rules."
    ],
    sample_answer: "Firestore Security Rules run on the Google Cloud edge for all client SDK calls. Rules match collection paths and evaluate boolean expressions: checking 'request.auth != null' ensures authentication, while 'request.auth.uid == resource.data.authorId' enforces ownership. Rules also validate schema types on incoming data (request.resource.data). Crucially, rules do not filter query results: if a client executes a query that could return documents disallowed by rules, the entire query is rejected with permission-denied.",
    follow_up_questions: [
      "What is the difference between resource.data (existing document) and request.resource.data (incoming document)?",
      "How do custom claims in Firebase Auth tokens enable role-based security rules (request.auth.token.admin == true)?"
    ],
    estimated_minutes: 10
  });

  addQ({
    id: "fb-03",
    skill_slug: "firebase",
    skill_name: "Firebase",
    skill_category: "databases",
    topic: "Realtime/offline behavior",
    subtopic: "Realtime Listeners & Offline Persistence",
    question_title: "How do Realtime Listeners (onSnapshot) and Offline Persistence work in Firestore?",
    question_prompt: "Explain how onSnapshot streams live updates to clients over WebSockets/gRPC. How does local IndexedDB offline caching work, and what happens when the device reconnects?",
    question_type: "conceptual",
    difficulty: "intermediate",
    priority: "low",
    expected_answer_points: [
      "onSnapshot: Sets up a persistent streaming listener over gRPC. Any database modification immediately pushes snapshot deltas to subscribed clients.",
      "Snapshot metadata: doc.metadata.hasPendingWrites (true if write was executed locally but not yet committed on server) and doc.metadata.fromCache (true if read from offline IndexedDB).",
      "Offline persistence: Web SDK caches documents in browser IndexedDB. Mutations executed while offline are queued in local storage.",
      "Reconnection: When network restores, the SDK synchronizes queued writes to the server in chronological order and resolves conflicts using server timestamps."
    ],
    sample_answer: "Firestore's onSnapshot establishes a streaming gRPC connection that pushes real-time document deltas to the client. The client SDK enables offline persistence using IndexedDB in browsers or SQLite on mobile. When offline, writes execute locally immediately, and snapshot listeners emit local data with metadata.hasPendingWrites = true. Upon reconnecting, the SDK automatically flushes queued mutations to Cloud Firestore.",
    follow_up_questions: [
      "What causes offline synchronization conflicts and how does Firestore resolve concurrent writes?",
      "Why must real-time listeners be unsubscribed when React components unmount?"
    ],
    estimated_minutes: 10
  });

  addQ({
    id: "fb-04",
    skill_slug: "firebase",
    skill_name: "Firebase",
    skill_category: "databases",
    topic: "Cloud Functions concepts",
    subtopic: "Firebase Cloud Functions & Database Triggers",
    question_title: "How do Firebase Cloud Functions respond to Firestore database triggers?",
    question_prompt: "Explain Cloud Functions event triggers: onDocumentCreated, onDocumentUpdated, onDocumentDeleted, and onDocumentWritten. How do you implement background tasks like sending emails or updating aggregate counters?",
    question_type: "coding",
    difficulty: "intermediate",
    priority: "low",
    expected_answer_points: [
      "Cloud Functions for Firebase: Serverless Node.js functions triggered automatically by Firestore events, Auth events, or HTTPS requests.",
      "Database triggers: onDocumentCreated triggers when a new document is written; onDocumentUpdated provides before and after snapshots (event.data.before vs event.data.after).",
      "Admin SDK: Cloud Functions use firebase-admin, which bypasses security rules with service-role permissions.",
      "Idempotency: Triggers guarantee at-least-once delivery; functions must be idempotent to prevent duplicate side effects (e.g. sending two emails for one order) upon retry."
    ],
    sample_answer: "Cloud Functions respond serverlessly to database mutations: functions like onDocumentCreated('/orders/{orderId}') trigger whenever a document is added. In onDocumentUpdated, the function receives both before and after snapshots to detect specific field transitions (e.g. status changed from 'pending' to 'paid'). Because cloud events guarantee at-least-once execution, functions performing external side effects (like Stripe charges or email sending) must be designed idempotently.",
    follow_up_questions: [
      "What is the Distributed Counter pattern in Firestore to overcome the 1 write per second per document limit?",
      "How do scheduled functions (pubsub.schedule) work in Firebase?"
    ],
    estimated_minutes: 10
  });

  addQ({
    id: "fb-05",
    skill_slug: "firebase",
    skill_name: "Firebase",
    skill_category: "databases",
    topic: "Firebase Authentication",
    subtopic: "Firebase Auth Flow & Custom Claims",
    question_title: "How does Firebase Authentication work, and how do Custom Claims enable RBAC?",
    question_prompt: "Explain how Firebase Auth issues JWT ID tokens on the client. How does the backend verify ID tokens using the Firebase Admin SDK and assign custom claims for Role-Based Access Control?",
    question_type: "conceptual",
    difficulty: "intermediate",
    priority: "low",
    expected_answer_points: [
      "Client authentication: User signs in via email/password or OAuth (Google, GitHub); Firebase Auth returns a short-lived (1 hour) signed JWT ID token.",
      "Client sends token to backend via Authorization: Bearer <token> header.",
      "Backend verification: admin.auth().verifyIdToken(token) validates signature against Google public keys, checks expiry, and extracts uid.",
      "Custom Claims: admin.auth().setCustomUserClaims(uid, { role: 'admin' }) embeds role metadata directly into the user's JWT ID token, allowing zero-database-lookup authorization checks in both backend APIs and Firestore security rules."
    ],
    sample_answer: "Firebase Auth handles user sign-in and issues a signed JWT ID token (valid for 1 hour). The frontend passes this token to the backend, which verifies it using the Firebase Admin SDK (admin.auth().verifyIdToken()). To implement RBAC, administrators call setCustomUserClaims() to attach role attributes directly to the user's token. The client refreshes the token, and subsequent requests carry the role claim, enabling fast verification without database queries.",
    follow_up_questions: [
      "Why must the client call getIdToken(true) after custom claims are updated on the backend?",
      "What is the maximum payload size for custom claims in Firebase Auth (1000 bytes)?"
    ],
    estimated_minutes: 10
  });

  // --- POSTGRESQL / PGVECTOR (8) ---
  addQ({
    id: "pg-01",
    skill_slug: "postgresql-pgvector",
    skill_name: "PostgreSQL / pgvector (project experience)",
    skill_category: "databases",
    topic: "Vector embeddings and similarity search concepts",
    subtopic: "pgvector Vector Data Types & Distance Operators",
    question_title: "How does the pgvector extension store vector embeddings and calculate distances in PostgreSQL?",
    question_prompt: "Explain how pgvector adds the vector(N) data type to PostgreSQL. Compare the three similarity distance operators: Euclidean distance (<->), Cosine distance (<=>), and Negative Inner Product (<#>).",
    question_type: "conceptual",
    difficulty: "intermediate",
    priority: "medium",
    expected_answer_points: [
      "Extension installation: CREATE EXTENSION IF NOT EXISTS vector.",
      "Data type: vector(N) stores a fixed-dimension array of single-precision floating point numbers (e.g. vector(1536) for OpenAI text-embedding-3-small).",
      "Distance operators: 1) <-> : L2 Euclidean distance (geometric distance between points); 2) <=> : Cosine distance (1 - cosine similarity, measures angle between vectors regardless of magnitude); 3) <#> : Negative inner product (dot product, equivalent to cosine distance if vectors are normalized to unit length).",
      "Query: SELECT * FROM documents ORDER BY embedding <=> query_vector LIMIT 5."
    ],
    sample_answer: "The pgvector extension introduces the vector(N) data type for storing dense embeddings in PostgreSQL tables. It provides three distance operators: <-> for L2 Euclidean distance, <=> for Cosine distance (best for text embeddings where direction matters more than vector length), and <#> for Negative Inner Product (dot product). In a similarity query, you order by the operator (ORDER BY embedding <=> query_embedding LIMIT k) to retrieve the nearest semantic matches.",
    follow_up_questions: [
      "Why are normalized unit vectors faster to search using dot product than computing full cosine distance?",
      "What is the maximum dimension supported by pgvector in recent versions (up to 2000 dimensions for indexes)?"
    ],
    estimated_minutes: 12
  });

  addQ({
    id: "pg-02",
    skill_slug: "postgresql-pgvector",
    skill_name: "PostgreSQL / pgvector (project experience)",
    skill_category: "databases",
    topic: "Vector embeddings and similarity search concepts",
    subtopic: "HNSW vs IVFFlat Indexing in pgvector",
    question_title: "Compare HNSW and IVFFlat index types in pgvector: Build time, recall, and memory.",
    question_prompt: "When should you use HNSW (Hierarchical Navigable Small World) versus IVFFlat (Inverted File Flat) in pgvector? Compare index build speed, query search latency, recall accuracy, and RAM requirements.",
    question_type: "conceptual",
    difficulty: "advanced",
    priority: "high",
    expected_answer_points: [
      "IVFFlat (Inverted File with Flat compression): Partitions vectors into clusters/lists using k-means. Build time is fast, memory usage is low. Drawback: requires training data to build lists, recall is lower, and queries must inspect multiple lists (probes) to maintain accuracy.",
      "HNSW (Hierarchical Navigable Small World): Builds a multi-layer graph of vectors where upper layers enable fast routing and bottom layer contains all vectors. Build time is slower and memory footprint is higher. Advantage: Superior recall (>95%) and ultra-fast query latency under high QPS without requiring training data.",
      "Production standard: HNSW is the recommended default for production RAG systems."
    ],
    sample_answer: "IVFFlat partitions vector space into clusters using k-means; it builds quickly and uses minimal RAM, but requires existing training data before building and has lower recall. HNSW builds a hierarchical proximity graph: it takes longer to build and requires more RAM to hold the graph in memory, but delivers significantly faster query latency and much higher recall accuracy (>95%) without needing pre-existing training rows. HNSW is the enterprise standard for production RAG.",
    follow_up_questions: [
      "What are the m and ef_construction parameters in HNSW index creation?",
      "Why must IVFFlat indexes never be created on empty tables?"
    ],
    estimated_minutes: 15
  });

  addQ({
    id: "pg-03",
    skill_slug: "postgresql-pgvector",
    skill_name: "PostgreSQL / pgvector (project experience)",
    skill_category: "databases",
    topic: "pgvector use in RAG project",
    subtopic: "Hybrid Search: Vector Similarity + Full-Text Search",
    question_title: "How do you implement Hybrid Search combining pgvector and PostgreSQL Full-Text Search (tsvector)?",
    question_prompt: "Why is hybrid search superior to pure vector search? Explain combining semantic vector similarity (<=>) with keyword search (tsvector / tsquery @@) using Reciprocal Rank Fusion (RRF).",
    question_type: "practical_scenario",
    difficulty: "advanced",
    priority: "high",
    expected_answer_points: [
      "Weakness of pure vector search: Struggles with exact keyword matches, serial numbers, product codes, or acronyms.",
      "Weakness of keyword search: Cannot understand semantic meaning, synonyms, or conceptual context.",
      "Hybrid search: Executes both searches in parallel: 1) pgvector cosine distance for semantic relevance; 2) PostgreSQL tsvector GIN index for exact keyword matching.",
      "Reciprocal Rank Fusion (RRF): Combines ranks from both result sets using formula RRF_Score = 1 / (60 + rank_vector) + 1 / (60 + rank_keyword) to produce a balanced, superior top-k ranking."
    ],
    sample_answer: "Pure vector search excels at conceptual semantic similarity but often misses exact product codes, acronyms, or specific names. Hybrid search combines pgvector cosine similarity with PostgreSQL's native Full-Text Search (tsvector with GIN index). In a single SQL query using CTEs, you execute both searches, calculate rank positions for both sets, and merge the scores using Reciprocal Rank Fusion (RRF) to produce a combined result set with high precision and high semantic recall.",
    follow_up_questions: [
      "How do you create a GIN index on to_tsvector('english', content) in PostgreSQL?",
      "What is the mathematical constant (typically 60) used in Reciprocal Rank Fusion?"
    ],
    estimated_minutes: 15
  });

  addQ({
    id: "pg-04",
    skill_slug: "postgresql-pgvector",
    skill_name: "PostgreSQL / pgvector (project experience)",
    skill_category: "databases",
    topic: "pgvector use in RAG project",
    subtopic: "Multi-Tenant Vector Search with RLS",
    question_title: "How do you enforce Multi-Tenant Data Isolation in pgvector using Row-Level Security (RLS)?",
    question_prompt: "In a multi-tenant RAG application, how do you prevent users from retrieving another organization's vector embeddings? Explain combining pgvector similarity search with Supabase/Postgres RLS policies.",
    question_type: "coding",
    difficulty: "advanced",
    priority: "critical",
    expected_answer_points: [
      "Problem: A global vector index search without tenant filters can leak confidential documents across tenants.",
      "Row-Level Security (RLS): Enable on the embeddings table: ALTER TABLE documents ENABLE ROW LEVEL SECURITY.",
      "Policy definition: CREATE POLICY tenant_isolation_policy ON documents USING (tenant_id = current_setting('app.current_tenant_id')::uuid) (or auth.uid() in Supabase).",
      "Execution: PostgreSQL applies the RLS filter BEFORE evaluating the vector distance query, ensuring vector calculations only consider authorized records.",
      "Index consideration: HNSW index performs best when tenant_id is indexed or filtered efficiently."
    ],
    sample_answer: "In multi-tenant RAG applications, vector searches must strictly enforce isolation. By enabling Row-Level Security (RLS) on the documents table and defining a policy (e.g. USING (org_id = auth.jwt() ->> 'org_id')), PostgreSQL automatically injects tenant boundary filters into all queries. Even if a user asks a prompt that closely matches another tenant's vector embeddings, PostgreSQL's RLS engine filters out unauthorized rows at the database level before returning results.",
    follow_up_questions: [
      "What performance considerations arise when HNSW index searches are filtered by an RLS predicate?",
      "Why is security enforced at the database level superior to application-level WHERE filters?"
    ],
    estimated_minutes: 12
  });

  addQ({
    id: "pg-05",
    skill_slug: "postgresql-pgvector",
    skill_name: "PostgreSQL / pgvector (project experience)",
    skill_category: "databases",
    topic: "JSONB basics",
    subtopic: "JSONB Data Type & GIN Indexing",
    question_title: "How does the JSONB data type work in PostgreSQL, and how do GIN indexes accelerate queries?",
    question_prompt: "Compare JSON vs JSONB in PostgreSQL. Explain binary storage, existence operators (?, ?|, ?&), containment (@>), and GIN indexing on JSONB columns.",
    question_type: "conceptual",
    difficulty: "intermediate",
    priority: "medium",
    expected_answer_points: [
      "JSON vs JSONB: JSON stores exact text representation (preserves whitespace, re-parses on every read). JSONB stores decomposed binary format (faster to query, supports indexes, slight write overhead).",
      "Containment operator (@>): Checks if left JSONB contains right JSONB (WHERE metadata @> '{\"category\": \"tech\"}').",
      "GIN (Generalized Inverted Index): CREATE INDEX idx_meta ON documents USING GIN (metadata).",
      "A GIN index creates an inverted index entry for every key and value in the JSONB object, enabling sub-millisecond lookups on arbitrary nested keys."
    ],
    sample_answer: "JSONB stores JSON data in a decomposed binary format rather than plain text. While slightly slower to insert due to binary encoding, JSONB is much faster to query and supports indexing. A GIN (Generalized Inverted Index) on a JSONB column indexes every key and value within the document: queries using the containment operator (@>) or path operators (metadata ->> 'role') can execute fast index scans rather than full table scans.",
    follow_up_questions: [
      "What is the difference between -> and ->> operators when extracting JSONB fields?",
      "What is jsonb_path_ops in GIN indexing and when is it preferred?"
    ],
    estimated_minutes: 10
  });

  addQ({
    id: "pg-06",
    skill_slug: "postgresql-pgvector",
    skill_name: "PostgreSQL / pgvector (project experience)",
    skill_category: "databases",
    topic: "Transactions",
    subtopic: "VACUUM, Autovacuum, and Table Bloat in PostgreSQL",
    question_title: "Explain VACUUM, Autovacuum, and MVCC Table Bloat in PostgreSQL.",
    question_prompt: "How does PostgreSQL implement MVCC without undo logs (tuple versions in heap)? What is table bloat, why is dead tuple cleanup necessary, and what is the difference between VACUUM and VACUUM FULL?",
    question_type: "conceptual",
    difficulty: "advanced",
    priority: "high",
    expected_answer_points: [
      "PostgreSQL MVCC: Updates do NOT overwrite existing tuples; they insert a brand-new tuple with xmin/xmax headers and mark the old tuple as dead.",
      "Dead tuples: Accumulate over time with heavy UPDATE and DELETE traffic, causing table and index bloat (files grow, queries slow down).",
      "Standard VACUUM: Scans dead tuples and marks their space available for future inserts within the page. Does NOT lock the table and does NOT return free space to the operating system.",
      "VACUUM FULL: Rewrites the entire table into a new disk file, returning space to the OS. Requires an EXCLUSIVE table lock (blocks reads and writes).",
      "Autovacuum daemon: Background worker that automatically triggers VACUUM based on threshold formulas."
    ],
    sample_answer: "PostgreSQL implements MVCC by creating a new tuple version for every UPDATE and marking the old tuple dead. These dead tuples remain on disk until cleaned up. Autovacuum runs in the background to reclaim dead tuple space so new inserts can reuse those pages. Standard VACUUM runs online without table locks, but does not return free space to the OS. VACUUM FULL rewrites the table to reclaim disk space, but locks the table exclusively.",
    follow_up_questions: [
      "What causes Transaction ID Wraparound in PostgreSQL and how does aggressive autovacuum prevent it?",
      "How do you monitor dead tuple counts using pg_stat_user_tables?"
    ],
    estimated_minutes: 12
  });

  addQ({
    id: "pg-07",
    skill_slug: "postgresql-pgvector",
    skill_name: "PostgreSQL / pgvector (project experience)",
    skill_category: "databases",
    topic: "Relational modeling and indexes",
    subtopic: "Partial and Expression Indexes in PostgreSQL",
    question_title: "How do Partial Indexes and Expression Indexes optimize PostgreSQL performance?",
    question_prompt: "Explain how to create a Partial Index (using WHERE clause) and an Expression Index (using functions like LOWER). When should they be used to save disk space and improve query latency?",
    question_type: "coding",
    difficulty: "intermediate",
    priority: "medium",
    expected_answer_points: [
      "Partial Index: Indexes only a subset of rows matching a predicate: CREATE INDEX idx_unprocessed ON orders(created_at) WHERE status = 'PENDING'.",
      "Benefits: Dramatically smaller index size (fits entirely in RAM cache) and zero index maintenance overhead for rows where status != 'PENDING'.",
      "Expression Index: Indexes the result of a function: CREATE INDEX idx_lower_email ON users(LOWER(email)).",
      "Solves performance issue: Queries like WHERE LOWER(email) = 'test@example.com' use the index scan directly instead of evaluating the function on every row."
    ],
    sample_answer: "Partial indexes include only rows that satisfy a WHERE condition (e.g. indexing only orders WHERE status = 'PENDING'). This keeps the index tiny and fast, saving disk and RAM. Expression indexes index the result of a function (e.g. ON users(LOWER(email))), allowing queries filtering with that exact expression to perform an index lookup rather than scanning the table and computing the function on every row.",
    follow_up_questions: [
      "Why must the query WHERE clause exactly match the partial index predicate for the index to be used?",
      "Can a unique constraint be applied conditionally using a partial index?"
    ],
    estimated_minutes: 10
  });

  addQ({
    id: "pg-08",
    skill_slug: "postgresql-pgvector",
    skill_name: "PostgreSQL / pgvector (project experience)",
    skill_category: "databases",
    topic: "pgvector use in RAG project",
    subtopic: "Chunking Strategies & Vector Index Tuning",
    question_title: "How do document chunking strategies impact vector retrieval accuracy and index performance?",
    question_prompt: "Compare chunking strategies: Fixed-size character/token chunking with overlap vs Semantic/Paragraph chunking. How does chunk size (256 vs 512 vs 1024 tokens) affect cosine similarity retrieval precision and LLM context limits?",
    question_type: "practical_scenario",
    difficulty: "intermediate",
    priority: "medium",
    expected_answer_points: [
      "Chunking trade-off: Small chunks (128-256 tokens) provide high embedding precision for specific facts, but may lack surrounding context. Large chunks (1024+ tokens) provide rich context, but dilute vector specificity and consume more LLM token window.",
      "Standard sweet spot: 500-800 tokens with 10-20% overlap (e.g. 50-100 tokens).",
      "Overlap purpose: Prevents cutting critical sentences or thoughts in half across chunk boundaries.",
      "Semantic chunking: Splitting on natural markdown headers (#, ##), paragraphs, or sentence boundaries rather than arbitrary character counts.",
      "Metadata attachment: Each chunk should store source document title, page number, and section header in its metadata JSONB column."
    ],
    sample_answer: "Document chunking determines retrieval quality: small chunks (200 tokens) yield precise vector matches but risk losing broader context; large chunks (1000+ tokens) dilute semantic meaning and crowd prompt token limits. A standard baseline is 500 tokens with 50-token overlap to ensure ideas spanning chunk boundaries are preserved. Semantic chunking (splitting on markdown headings or paragraph breaks) outperforms fixed-character splitting by preserving coherent domain concepts.",
    follow_up_questions: [
      "What is Parent-Document Retrieval (storing small chunks for search but passing larger parent sections to the LLM)?",
      "How do recursive text splitters balance chunk size and natural text delimiters?"
    ],
    estimated_minutes: 12
  });
};
