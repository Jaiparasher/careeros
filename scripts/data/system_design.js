// System Design questions: 20 total
// lld (11), hld (9)
module.exports = function(addQ) {
  // --- LOW-LEVEL DESIGN (LLD) (11) ---
  addQ({
    id: "lld-01",
    skill_slug: "lld",
    skill_name: "Low-Level Design",
    skill_category: "system-design",
    topic: "OOP and SOLID application",
    subtopic: "SOLID Principles in Object-Oriented Design",
    question_title: "Explain all five SOLID principles with concrete real-world software design examples.",
    question_prompt: "Walk through SRP, OCP, LSP, ISP, and DIP. For each principle, provide a bad design that violates it and a refactored object-oriented design that adheres to it.",
    question_type: "conceptual",
    difficulty: "intermediate",
    priority: "critical",
    expected_answer_points: [
      "S - Single Responsibility Principle (SRP): A class should have one, and only one, reason to change. (Bad: OrderService computes taxes, saves to DB, and sends email. Refactor: Separate into TaxCalculator, OrderRepository, and NotificationService).",
      "O - Open/Closed Principle (OCP): Software entities should be open for extension, but closed for modification. (Refactor: Use Strategy pattern or polymorphic interfaces instead of huge if/switch chains for payment types).",
      "L - Liskov Substitution Principle (LSP): Subtypes must be substitutable for their base types without altering correctness. (Classic violation: Square extending Rectangle where setWidth alters height, breaking client assertions).",
      "I - Interface Segregation Principle (ISP): Clients should not be forced to depend upon interfaces they do not use. (Refactor: Split fat multi-method interfaces into smaller, cohesive role interfaces).",
      "D - Dependency Inversion Principle (DIP): High-level modules should not depend on low-level modules; both should depend on abstractions. (Refactor: Service depends on PaymentProcessor interface, not PayPalClient concrete class)."
    ],
    sample_answer: "The SOLID principles guide maintainable object-oriented architectures: Single Responsibility (classes have only one reason to change); Open/Closed (classes are open for extension via interfaces, but closed for modification); Liskov Substitution (subclasses can replace parent classes without breaking behavior); Interface Segregation (small, focused interfaces rather than bloated monolithic ones); and Dependency Inversion (high-level services depend on abstractions rather than concrete low-level implementations).",
    follow_up_questions: [
      "Why is the Rectangle-Square problem the classic violation of Liskov Substitution Principle?",
      "How does Dependency Injection relate to the Dependency Inversion Principle?"
    ],
    estimated_minutes: 15
  });

  addQ({
    id: "lld-02",
    skill_slug: "lld",
    skill_name: "Low-Level Design",
    skill_category: "system-design",
    topic: "Common design patterns",
    subtopic: "Design Patterns: Factory vs Abstract Factory vs Builder",
    question_title: "Compare Factory Method, Abstract Factory, and Builder design patterns.",
    question_prompt: "When should you use Factory Method vs Abstract Factory vs Builder? How does the Builder pattern handle complex objects with dozens of optional parameters and validate immutability?",
    question_type: "coding",
    difficulty: "intermediate",
    priority: "critical",
    expected_answer_points: [
      "Factory Method: Defines an interface for creating a single object, deferring instantiation to subclasses.",
      "Abstract Factory: Creates families of related or dependent objects without specifying their concrete classes (e.g. GUIFactory producing WindowsButton/WindowsCheckbox vs MacButton/MacCheckbox).",
      "Builder Pattern: Constructs a complex object step-by-step. Separates construction from representation.",
      "Builder benefits: Eliminates telescoping constructors with 10+ arguments, prevents parameter order bugs, allows step-by-step validation, and produces immutable objects with final fields and no setters."
    ],
    sample_answer: "Factory Method delegates creation of a single object to subclasses. Abstract Factory provides an interface to create families of related products (like cross-platform UI controls). The Builder pattern constructs complex objects with many optional parameters step-by-step. It eliminates telescoping constructors, improves code readability via fluent APIs, and ensures thread-safe object immutability by instantiating the target object only when build() is called.",
    follow_up_questions: [
      "How does Joshua Bloch's static nested Builder pattern work in Java?",
      "How does Lombok's @Builder annotation implement the builder pattern?"
    ],
    estimated_minutes: 12
  });

  addQ({
    id: "lld-03",
    skill_slug: "lld",
    skill_name: "Low-Level Design",
    skill_category: "system-design",
    topic: "Common design patterns",
    subtopic: "Strategy vs State Design Pattern",
    question_title: "Compare Strategy Pattern and State Pattern: Mechanics and Intent.",
    question_prompt: "Both Strategy and State patterns share similar UML class structures (composition with an interface). What is the difference in behavioral intent, client awareness, and dynamic transitions?",
    question_type: "conceptual",
    difficulty: "intermediate",
    priority: "high",
    expected_answer_points: [
      "UML similarity: Both patterns use a Context class holding a reference to an interface with polymorphic implementations.",
      "Strategy Pattern Intent: Swaps algorithms or behaviors. The client is typically aware of the available strategies and chooses which strategy to pass into the context (e.g. PaymentStrategy: CreditCard, PayPal, UPI).",
      "State Pattern Intent: Encapsulates state-dependent behavior. The context changes its behavior when its internal state changes (e.g. VendingMachineState: NoMoney, HasMoney, Dispensing).",
      "State transitions: In State pattern, state subclasses frequently know about each other and trigger transitions on the Context (e.g. HasMoneyState transitions context to DispensingState). In Strategy, strategies are independent and unaware of each other."
    ],
    sample_answer: "While Strategy and State patterns share similar UML structures, their intent differs. In the Strategy pattern, the client explicitly selects an interchangeable algorithm to pass into the context (like choosing a sorting algorithm or payment method). In the State pattern, the context automatically alters its behavior based on its internal state machine (like a Vending Machine transitioning from NoCoin to HasCoin to Sold), and state implementations frequently manage transitions between states themselves.",
    follow_up_questions: [
      "How do you implement a clean finite state machine (FSM) using the State pattern in Java?",
      "Can Strategy patterns be implemented using Java 8 Lambdas without creating explicit classes?"
    ],
    estimated_minutes: 12
  });

  addQ({
    id: "lld-04",
    skill_slug: "lld",
    skill_name: "Low-Level Design",
    skill_category: "system-design",
    topic: "Common design patterns",
    subtopic: "Observer vs Pub/Sub Pattern",
    question_title: "What is the difference between the Observer Pattern and the Publish-Subscribe (Pub/Sub) Pattern?",
    question_prompt: "Explain how Observer involves direct in-memory coupling between Subject and Observers, while Pub/Sub introduces an independent Message Broker / Event Bus. Compare synchronous vs asynchronous delivery and distributed architectures.",
    question_type: "conceptual",
    difficulty: "intermediate",
    priority: "critical",
    expected_answer_points: [
      "Observer Pattern: Subject maintains a direct in-memory list of Observer references (subject.registerObserver(obs)). When state changes, Subject iterates through observers and invokes notify(). Observers and Subject are in the same process/memory space and usually synchronous.",
      "Pub/Sub Pattern: Publishers and Subscribers NEVER know about each other (complete temporal and spatial decoupling). They communicate through an intermediary Message Broker (Kafka, RabbitMQ, EventBus).",
      "Decoupling: Publishers simply post messages to topics; subscribers subscribe to topics. Publishers do not care who, how many, or if anyone is listening.",
      "Distributed scale: Pub/Sub works across distributed microservices; Observer is an in-process design pattern."
    ],
    sample_answer: "In the Observer pattern, the Subject holds direct in-memory references to its Observers and notifies them synchronously within the same application process. In the Publish-Subscribe pattern, Publishers and Subscribers are completely decoupled and unaware of each other: they communicate via an intermediary Message Broker or Event Bus (like Kafka). Pub/Sub operates across distributed systems and independent processes, while Observer is an object-oriented in-process pattern.",
    follow_up_questions: [
      "What is the risk of memory leaks in the Observer pattern (Lapsed Listener problem)?",
      "How does RxJava / ReactiveX combine Observer and Iterator patterns?"
    ],
    estimated_minutes: 10
  });

  addQ({
    id: "lld-05",
    skill_slug: "lld",
    skill_name: "Low-Level Design",
    skill_category: "system-design",
    topic: "Common design patterns",
    subtopic: "Decorator vs Proxy vs Adapter",
    question_title: "Compare Decorator, Proxy, and Adapter structural design patterns.",
    question_prompt: "All three patterns wrap an underlying object. How do their architectural intents differ (adding behavior vs controlling access vs translating interfaces)?",
    question_type: "conceptual",
    difficulty: "intermediate",
    priority: "high",
    expected_answer_points: [
      "Adapter: Converts the interface of a class into another interface clients expect. Resolves incompatibility between two existing interfaces without altering functionality (e.g. converting third-party legacy XML API into JSON DTO).",
      "Decorator: Dynamically adds new responsibilities/behaviors to an object at runtime without altering its interface (e.g. Java I/O new BufferedReader(new InputStreamReader(System.in))). Enhances functionality.",
      "Proxy: Provides a surrogate or placeholder to CONTROL ACCESS to an object (e.g. Lazy initialization virtual proxy, Security proxy, Spring AOP @Transactional proxy, Remote RMI proxy). Keeps same interface; does not add business features, but controls execution."
    ],
    sample_answer: "All three wrap an object, but their intents differ: Adapter translates an incompatible interface into an interface the client expects (interface conversion). Decorator wraps an object to dynamically add new behaviors or enhancements at runtime while keeping the same interface (like BufferedReader wrapping InputStream). Proxy wraps an object to control access, manage lazy lifecycle instantiation, or inject cross-cutting security/transaction logic without changing functionality.",
    follow_up_questions: [
      "How does the Java I/O stream library exemplify the Decorator pattern?",
      "What is a Dynamic Proxy in Java (java.lang.reflect.Proxy)?"
    ],
    estimated_minutes: 12
  });

  addQ({
    id: "lld-06",
    skill_slug: "lld",
    skill_name: "Low-Level Design",
    skill_category: "system-design",
    topic: "Class and interface design",
    subtopic: "Design a Parking Lot (LLD)",
    question_title: "Design a Multi-Level Parking Lot System (Low-Level Design).",
    question_prompt: "Design an object-oriented class model for a Parking Lot: Vehicle hierarchy (Car, Truck, Motorcycle), ParkingSpot types (Compact, Large, Motorcycle), ParkingFloor, Ticket, and ParkingRateStrategy. How do you handle concurrency when finding free spots?",
    question_type: "coding",
    difficulty: "intermediate",
    priority: "critical",
    expected_answer_points: [
      "Core Entities: Vehicle (abstract, licensePlate, VehicleType), ParkingSpot (spotId, SpotType, isAvailable, assignVehicle, removeVehicle), ParkingFloor (floorId, Map<SpotType, List<ParkingSpot>>), ParkingLot (singleton managing floors and entrance/exit gates).",
      "Ticket & Payment: ParkingTicket (ticketNumber, entryTime, spotAssigned), PricingStrategy (Strategy pattern: HourlyRateStrategy, FlatRateStrategy).",
      "Allocation algorithm: Find nearest available spot matching vehicle type using priority queues or concurrent sets.",
      "Thread safety: Synchronized spot allocation or ConcurrentSkipListSet / ReentrantLock per floor to prevent two vehicles from being assigned the same spot simultaneously."
    ],
    sample_answer: "Model the system with a Vehicle hierarchy (Car, Truck, Bike) and matching ParkingSpots (Compact, Large, Motorcycle). A ParkingFloor aggregates spots, and a singleton ParkingLot coordinates floors and gates. When a vehicle enters, an entrance gate finds the nearest available spot matching the vehicle type and issues a ParkingTicket recording entry time and assigned spot. Calculate fees using a PricingStrategy on exit. Use ReentrantLocks per floor or atomic boolean flags on spots to prevent double-booking under concurrent entries.",
    follow_up_questions: [
      "How would you support electric vehicle (EV) charging spots in this design?",
      "How do you design for multiple simultaneous entrance and exit gates without global lock contention?"
    ],
    estimated_minutes: 15
  });

  addQ({
    id: "lld-07",
    skill_slug: "lld",
    skill_name: "Low-Level Design",
    skill_category: "system-design",
    topic: "Class and interface design",
    subtopic: "Design a Rate Limiter (LLD)",
    question_title: "Design an in-memory Rate Limiter using Token Bucket algorithm (Low-Level Design).",
    question_prompt: "Implement a thread-safe TokenBucketRateLimiter in Java: capacity, refillRate, tokens, lastRefillTimestamp. How do you refill tokens lazily without background timer threads?",
    question_type: "coding",
    difficulty: "advanced",
    priority: "critical",
    expected_answer_points: [
      "Class fields: private final long capacity; private final double refillRatePerSecond; private double currentTokens; private long lastRefillTimestamp.",
      "Lazy refill algorithm: Instead of running a background timer thread that wastes CPU, calculate tokens added lazily upon each incoming request: now = System.currentTimeMillis(); tokensToAdd = (now - lastRefillTimestamp) * refillRatePerSecond / 1000; currentTokens = min(capacity, currentTokens + tokensToAdd); lastRefillTimestamp = now.",
      "acquire(): If currentTokens >= 1, decrement currentTokens and return true; else return false.",
      "Concurrency: Synchronized method or ReentrantLock / AtomicReference with CAS to guarantee thread safety under concurrent requests."
    ],
    sample_answer: "Design a TokenBucketRateLimiter class storing capacity, refill rate, current tokens, and last refill timestamp. Rather than running an expensive background timer thread, refill tokens lazily whenever tryAcquire() is called: calculate elapsed time since last request, multiply by refill rate to add tokens (capped at capacity), and update the timestamp. If at least 1 token is available, decrement and allow the request. Protect token mutations with synchronized or atomic CAS operations for thread safety.",
    follow_up_questions: [
      "How would you adapt this in-memory design to work across distributed servers using Redis Lua scripts?",
      "How do you support burst capacity versus sustained rate limits in this implementation?"
    ],
    estimated_minutes: 15
  });

  addQ({
    id: "lld-08",
    skill_slug: "lld",
    skill_name: "Low-Level Design",
    skill_category: "system-design",
    topic: "Class and interface design",
    subtopic: "Design an LRU Cache (LLD)",
    question_title: "Design a thread-safe Least Recently Used (LRU) Cache in O(1) time.",
    question_prompt: "Implement an LRUCache: get(key) and put(key, value) in O(1) time complexity. Combine a HashMap with a Doubly Linked List, and explain how to make it thread-safe.",
    question_type: "coding",
    difficulty: "intermediate",
    priority: "critical",
    expected_answer_points: [
      "Data structure: HashMap<K, Node> provides O(1) key lookups; Doubly Linked List maintains access recency in O(1) time.",
      "Node structure: key, value, prev, next pointers. Dummy head and dummy tail nodes eliminate null pointer boundary checks.",
      "get(key): If missing return -1; if present, move node to head (most recently used) and return value.",
      "put(key, value): If key exists, update value and move to head. If new, create node, add to head, insert into map. If size > capacity, evict tail.prev (least recently used) from both list and map.",
      "Concurrency: Wrap operations in ReentrantReadWriteLock (read lock on get, write lock on put/reorder) or synchronized block."
    ],
    sample_answer: "Combine a HashMap for O(1) key lookups with a Doubly Linked List for O(1) removal and insertion of recency nodes. Use dummy head and tail sentinel nodes. When get(key) is called, locate the node in the map and move it to the head of the list. When put(key, val) is called, either update the existing node and move it to head, or add a new node to the head; if capacity is exceeded, evict the node immediately before the tail (LRU) from both the list and the map. Use a ReentrantLock for thread safety.",
    follow_up_questions: [
      "Why is a Doubly Linked List necessary instead of a Singly Linked List (O(1) deletion)?",
      "How does Java's LinkedHashMap support LRU eviction out of the box using removeEldestEntry?"
    ],
    estimated_minutes: 15
  });

  addQ({
    id: "lld-09",
    skill_slug: "lld",
    skill_name: "Low-Level Design",
    skill_category: "system-design",
    topic: "Common design patterns",
    subtopic: "Design a Notification System (LLD)",
    question_title: "Design an extensible Multi-Channel Notification Service (Low-Level Design).",
    question_prompt: "Design a notification service supporting Email, SMS, and Push Notifications: NotificationRequest, NotificationChannel strategy, TemplateEngine, Provider adapters (Twilio, SendGrid, FCM), and fallback handling.",
    question_type: "coding",
    difficulty: "intermediate",
    priority: "high",
    expected_answer_points: [
      "Core interface: NotificationChannel with send(NotificationMessage).",
      "Implementations: EmailNotificationChannel, SmsNotificationChannel, PushNotificationChannel.",
      "Provider Adapters: SmsNotificationChannel delegates to TwilioAdapter; if Twilio fails, falls back to AWS SNS adapter (Adapter + Strategy patterns).",
      "TemplateEngine: Resolves placeholders in templates (e.g. 'Hello {{name}}') before dispatch.",
      "NotificationManager / Service: Asynchronously receives requests, looks up user notification preferences, and routes to appropriate channels via a Factory.",
      "Rate Limiter & Priority Queue: Throttles outgoing SMS and prioritizes OTP verification codes over marketing blasts."
    ],
    sample_answer: "Structure the service using the Strategy and Adapter patterns. Define a NotificationChannel interface with implementations for Email, SMS, and Push. Each channel delegates to external vendor adapters (e.g. SendGrid, Twilio) implementing a common VendorAdapter interface, enabling seamless failover if a third-party provider fails. A NotificationService pulls templates from a TemplateEngine, checks user delivery preferences, and dispatches tasks asynchronously across thread pools.",
    follow_up_questions: [
      "How do you design deduplication so a user never receives the same notification twice?",
      "How do you prioritize OTP authentication messages over promotional marketing notifications?"
    ],
    estimated_minutes: 12
  });

  addQ({
    id: "lld-10",
    skill_slug: "lld",
    skill_name: "Low-Level Design",
    skill_category: "system-design",
    topic: "Common design patterns",
    subtopic: "Design a Snake and Ladder Game (LLD)",
    question_title: "Design a Snake and Ladder Board Game (Low-Level Design).",
    question_prompt: "Model Snake and Ladder using object-oriented principles: Board, Cell, Jumper (Snake/Ladder), Dice, Player, and Game controller. Walk through game loop and winning conditions.",
    question_type: "coding",
    difficulty: "beginner",
    priority: "medium",
    expected_answer_points: [
      "Entities: Board (size 100, Cell[]), Cell (has optional Jumper), Jumper (start, end — if start > end it's a Snake; if start < end it's a Ladder).",
      "Player: id, name, currentPosition.",
      "Dice: roll() returns random integer 1-6 (or configurable N dice).",
      "Game Controller: Queue<Player> handles turn rotation in FIFO order.",
      "Game loop: 1) Dequeue current player; 2) Roll dice; 3) newPosition = currentPosition + roll; 4) Check board bounds (if > 100, no move); 5) Check for Jumper at newPosition and apply slide/climb; 6) If newPosition == 100, declare winner; else enqueue player."
    ],
    sample_answer: "Model the game with Board, Cell, Jumper (encapsulating Snakes and Ladders where start > end is a snake and start < end is a ladder), Dice, and Player. The Game orchestrator maintains a FIFO Queue<Player> to manage turn order. On a turn, the player rolls the dice, updates position (staying in place if moving exceeds 100), applies any snake or ladder jump on that cell, and checks for the winning condition (reaching 100) before re-enqueuing the player.",
    follow_up_questions: [
      "How would you support custom rules (e.g. rolling a 6 grants another turn)?",
      "Can a snake head land on another ladder head, and how do you prevent circular jumps during board setup?"
    ],
    estimated_minutes: 12
  });

  addQ({
    id: "lld-11",
    skill_slug: "lld",
    skill_name: "Low-Level Design",
    skill_category: "system-design",
    topic: "Class and interface design",
    subtopic: "Design an In-Memory File System (LLD)",
    question_title: "Design an In-Memory File System (Low-Level Design).",
    question_prompt: "Design an in-memory hierarchical file system: ls(path), mkdir(path), addContentToFile(path, content), and readContentFromFile(path) using a Trie/Composite pattern.",
    question_type: "coding",
    difficulty: "intermediate",
    priority: "medium",
    expected_answer_points: [
      "Composite pattern / Trie structure: Abstract FileSystemNode with name, parent pointer.",
      "DirectoryNode extends FileSystemNode: Contains Map<String, FileSystemNode> children.",
      "FileNode extends FileSystemNode: Contains StringBuilder content.",
      "Path traversal: Split path by '/' and traverse children map step by step from root.",
      "mkdir(path): Traverses path, creating DirectoryNodes for missing intermediate directories.",
      "addContentToFile(path, content): Traverses to target, creates FileNode if absent, and appends content.",
      "ls(path): If target is a file, returns file name; if directory, returns sorted list of children names."
    ],
    sample_answer: "Use the Composite pattern where an abstract Node base class is extended by DirectoryNode (storing a Map<String, Node> of children) and FileNode (storing a StringBuilder of content). A root directory starts the tree. System methods split the input path by '/' and traverse the node map hierarchically from root. mkdir creates missing DirectoryNodes; addContentToFile appends bytes to target FileNodes; and ls() returns sorted names of directory children.",
    follow_up_questions: [
      "How do you implement file deletion (rm -rf) and symbolic links?",
      "How would you ensure thread-safety for concurrent reads and writes across directory subtrees?"
    ],
    estimated_minutes: 12
  });

  // --- HIGH-LEVEL DESIGN (HLD) (9) ---
  addQ({
    id: "hld-01",
    skill_slug: "hld",
    skill_name: "High-Level Design",
    skill_category: "system-design",
    topic: "Requirements and capacity estimation",
    subtopic: "CAP Theorem & PACELC Theorem",
    question_title: "Explain the CAP Theorem and the PACELC Theorem in distributed systems.",
    question_prompt: "Define Consistency, Availability, and Partition Tolerance. Why is CA impossible in distributed networks? Explain PACELC theorem: PC/EC vs PA/EL.",
    question_type: "conceptual",
    difficulty: "intermediate",
    priority: "critical",
    expected_answer_points: [
      "CAP Theorem: In the presence of a Network Partition (P), a distributed system must choose between Consistency (C: every read receives the most recent write or an error) and Availability (A: every non-failing node returns a response without guarantee it's the latest write).",
      "Network partitions are inevitable in real networks (cables cut, routers fail); therefore, all real distributed systems must be Partition Tolerant (CP or AP).",
      "PACELC Theorem (extends CAP): If there is a Partition (P), trade-off between Availability (A) and Consistency (C); ELSE (E), trade-off between Latency (L) and Consistency (C).",
      "Examples: MongoDB/HBase is PC/EC (consistent during partition, consistent in normal mode at cost of latency); DynamoDB/Cassandra is PA/EL (available during partition, low latency in normal mode with eventual consistency)."
    ],
    sample_answer: "The CAP theorem states that when a network partition occurs, a distributed system must choose between Consistency (every read returns the latest write or fails) and Availability (all requests receive responses, even if stale). Because physical network failures are inevitable, systems must be partition-tolerant (CP or AP). The PACELC theorem expands this: during Partitions, choose Availability or Consistency; ELSE, choose Latency or Consistency. Cassandra is PA/EL (eventually consistent for low latency); relational DBs are PC/EC.",
    follow_up_questions: [
      "What is Strong Consistency vs Eventual Consistency vs Causal Consistency?",
      "What is the Fallacy of Distributed Computing regarding reliable networks?"
    ],
    estimated_minutes: 12
  });

  addQ({
    id: "hld-02",
    skill_slug: "hld",
    skill_name: "High-Level Design",
    skill_category: "system-design",
    topic: "Caching and load balancing",
    subtopic: "Caching Strategies: Cache-Aside, Write-Through, Write-Behind",
    question_title: "Compare Caching Patterns: Cache-Aside, Write-Through, Write-Around, and Write-Behind.",
    question_prompt: "When should you use Cache-Aside (Lazy Loading) vs Write-Through vs Write-Behind (Write-Back)? How do you prevent Cache Stampede (Thundering Herd) and Cache Penetration?",
    question_type: "conceptual",
    difficulty: "intermediate",
    priority: "critical",
    expected_answer_points: [
      "Cache-Aside: App reads from cache; if miss, reads from DB and updates cache. Writes go straight to DB and invalidate cache key. Resilient to cache failure, only caches requested data.",
      "Write-Through: App writes to cache; cache synchronously writes to DB before returning success. Cache is always fresh, but write latency is higher.",
      "Write-Behind (Write-Back): App writes to cache; cache acknowledges immediately and batches writes to DB asynchronously. Extreme write performance, but risks data loss on cache crash.",
      "Cache Stampede (Thundering Herd): High-concurrency key expires, causing thousands of queries to hit the database simultaneously. Fix: Distributed lock (Mutex) on cache miss or probabilistic early expiration.",
      "Cache Penetration: Requests for non-existent keys bypass cache and hit DB. Fix: Cache null values with short TTL or use a Bloom Filter."
    ],
    sample_answer: "Cache-Aside reads from cache, fetches from DB on miss, and writes to DB while invalidating the cache key—best for general read-heavy systems. Write-Through writes to cache and DB synchronously, ensuring fresh cache data at the cost of higher write latency. Write-Behind updates cache and writes to DB asynchronously in batches, offering extreme write throughput at the risk of data loss on crash. Mitigate Cache Stampede using distributed locks on misses, and Cache Penetration using Bloom filters.",
    follow_up_questions: [
      "What is Cache Avalanche and how does adding jitter to TTLs prevent it?",
      "How does a Bloom Filter reject queries for non-existent keys before touching the database?"
    ],
    estimated_minutes: 15
  });

  addQ({
    id: "hld-03",
    skill_slug: "hld",
    skill_name: "High-Level Design",
    skill_category: "system-design",
    topic: "Database scaling and partitioning",
    subtopic: "Consistent Hashing Algorithm",
    question_title: "How does Consistent Hashing work in distributed caching and database sharding?",
    question_prompt: "Why does simple hash mod (hash(key) % N) fail when nodes are added or removed? Explain the Hash Ring, virtual nodes (vnodes), and how consistent hashing limits data redistribution to K/N keys.",
    question_type: "conceptual",
    difficulty: "advanced",
    priority: "critical",
    expected_answer_points: [
      "Problem with hash % N: If you have N=4 cache nodes and add 1 node (N=5), almost 100% of existing keys map to new nodes, causing catastrophic cache invalidation.",
      "Hash Ring: Both server nodes and data keys are hashed using the same hash function (e.g. SHA-256) onto a 360-degree circular integer range [0, 2^32 - 1].",
      "Lookup: Key maps to the first server node encountered moving clockwise around the ring.",
      "Adding/Removing nodes: Only keys between the added node and its predecessor need to move (K/N keys on average); all other keys remain unaffected.",
      "Virtual Nodes (vnodes): Each physical server is assigned multiple random positions on the ring (e.g. 100-200 vnodes per server), ensuring uniform data distribution and avoiding hot spots."
    ],
    sample_answer: "Simple modulo hashing (hash(key) % N) causes mass cache invalidation when N changes. Consistent Hashing maps both servers and keys onto a circular hash ring [0 to 2^32 - 1]. A key is assigned to the nearest server encountered clockwise. Adding or removing a node redistributes only a fraction (1/N) of the keys between neighboring nodes. Using virtual nodes (mapping each physical server to 100+ virtual points on the ring) guarantees balanced data distribution and avoids hot spot partitions.",
    follow_up_questions: [
      "How does DynamoDB / Apache Cassandra use consistent hashing for data placement?",
      "How do virtual nodes handle heterogeneous hardware servers with different RAM capacities?"
    ],
    estimated_minutes: 15
  });

  addQ({
    id: "hld-04",
    skill_slug: "hld",
    skill_name: "High-Level Design",
    skill_category: "system-design",
    topic: "API and data model design",
    subtopic: "Design a URL Shortener (TinyURL)",
    question_title: "Design a scalable URL Shortener service (like TinyURL or Bitly).",
    question_prompt: "Design TinyURL: Capacity estimation (100M URLs/month, 10:1 read ratio), Base62 encoding vs MD5 hash truncation, Key Generation Service (KGS), database schema, and handling high-read throughput with caching.",
    question_type: "practical_scenario",
    difficulty: "intermediate",
    priority: "critical",
    expected_answer_points: [
      "Capacity estimation: 100M writes/month (~40 writes/sec), 10:1 read ratio (~400 reads/sec). Storage over 5 years: ~300GB.",
      "Short link generation: Base62 encoding ([a-zA-Z0-9]). A 7-character string provides 62^7 = 3.5 trillion unique combinations.",
      "Approach 1 (Auto-increment ID -> Base62): Simple, but sequential numbers expose business volume and require distributed coordinate counters.",
      "Approach 2 (Key Generation Service - KGS): Standalone service pre-generates billions of unique random 7-character Base62 keys in a database, loads ranges into memory, and dispenses them instantly with zero collision risk.",
      "Database & Caching: NoSQL Key-Value store (Cassandra, DynamoDB, or Redis) with schema { short_key (PK), original_url, created_at, user_id }. Cache hot URLs in Redis with LRU eviction.",
      "Redirection: Return HTTP 301 (Permanent Redirect, browser caches redirection) vs 302 (Found, all clicks hit server to track analytics)."
    ],
    sample_answer: "TinyURL maps long URLs to short 7-character Base62 strings (yielding 3.5 trillion keys). A Key Generation Service (KGS) pre-generates random unique keys into a table and caches ranges in memory to hand out keys in O(1) time without collision checks. Data is stored in a key-value store (DynamoDB/Cassandra) partitioned on short_key. Hot URLs are cached in Redis to serve read traffic. Returning HTTP 302 allows tracking click analytics on every hit, while 301 reduces server load by having browsers cache the destination.",
    follow_up_questions: [
      "Why is HTTP 302 preferred over HTTP 301 if the business model depends on click analytics?",
      "How do you handle link expiration and periodic cleanup of inactive URLs?"
    ],
    estimated_minutes: 15
  });

  addQ({
    id: "hld-05",
    skill_slug: "hld",
    skill_name: "High-Level Design",
    skill_category: "system-design",
    topic: "Requirements and capacity estimation",
    subtopic: "Distributed Unique ID Generation (Snowflake)",
    question_title: "How do you generate distributed unique 64-bit IDs at scale (Twitter Snowflake)?",
    question_prompt: "Why are UUIDv4 and auto-increment DB IDs unsuitable for distributed systems? Explain Twitter Snowflake: 64-bit layout (timestamp, datacenter ID, worker ID, sequence number), chronological sorting, and clock drift handling.",
    question_type: "conceptual",
    difficulty: "advanced",
    priority: "critical",
    expected_answer_points: [
      "Why not UUIDv4: 128-bit size consumes double storage; completely non-sequential, destroying B-Tree index performance due to random disk page splits.",
      "Why not auto-increment DB: Single point of failure, centralized bottleneck across multi-region architectures.",
      "Snowflake 64-bit layout: 1) 1 sign bit (unused, 0); 2) 41 bits timestamp (milliseconds since custom epoch, gives ~69 years); 3) 5 bits datacenter ID (32 datacenters); 4) 5 bits worker/machine ID (32 workers per datacenter); 5) 12 bits sequence number (4,096 IDs per millisecond per machine).",
      "Throughput: Each worker can generate up to 4 million IDs per second without network coordination.",
      "Clock drift: If NTP synchronizes clock backwards, reject ID generation until physical time catches up."
    ],
    sample_answer: "UUIDv4 is 128 bits and non-sequential, degrading database B-Tree index performance. Auto-increment IDs require centralized database coordination. Twitter Snowflake generates roughly time-sorted 64-bit integers locally without network coordination. The 64 bits consist of 41 bits of millisecond timestamp (69 years), 10 bits of datacenter and machine IDs (1,024 nodes), and 12 bits of local sequence counter (4,096 IDs/ms per node). Because timestamp is the highest-order component, IDs sort chronologically naturally.",
    follow_up_questions: [
      "What happens if NTP server synchronizes clock backward on a Snowflake generator worker?",
      "How does UUIDv7 incorporate timestamps to solve UUIDv4 B-Tree fragmentation?"
    ],
    estimated_minutes: 15
  });

  addQ({
    id: "hld-06",
    skill_slug: "hld",
    skill_name: "High-Level Design",
    skill_category: "system-design",
    topic: "Messaging and asynchronous processing",
    subtopic: "Design a Distributed Message Broker (Kafka Clone)",
    question_title: "Design a High-Throughput Distributed Message Queue.",
    question_prompt: "Architect a distributed message broker: Topic partitioning, Producer batching, Append-only commit log on disk, Consumer group offset tracking, and High Availability replication.",
    question_type: "practical_scenario",
    difficulty: "advanced",
    priority: "high",
    expected_answer_points: [
      "Core components: Broker cluster, Topics split into Partitions, Producers, Consumer Groups.",
      "High write speed: Writes append sequentially to an immutable on-disk commit log (O(1) sequential I/O), leveraging OS page cache and bypassing random disk seeks.",
      "High read speed: Consumers stream messages sequentially using the Zero-Copy sendfile() system call.",
      "Scalability: Partitions are distributed across multiple brokers. Each partition has 1 Leader and N Follower replicas managed by a consensus controller (KRaft).",
      "Offset tracking: Consumers periodically commit processed offsets to an internal topic (__consumer_offsets)."
    ],
    sample_answer: "Design a broker based on partitioned append-only commit logs. Topics are split into partitions across a broker cluster to allow horizontal scaling. Producers batch messages and write sequentially to the partition leader, which leverages OS page cache and sequential disk writes for extreme throughput. High availability is maintained by replicating partitions to follower brokers. Consumers in a consumer group read independently in order, committing their progress offsets to an internal coordinator topic.",
    follow_up_questions: [
      "How do In-Sync Replicas (ISR) and Leader Election work when a broker crashes?",
      "What is the difference between RabbitMQ AMQP architecture and Kafka's pull-based consumer model?"
    ],
    estimated_minutes: 15
  });

  addQ({
    id: "hld-07",
    skill_slug: "hld",
    skill_name: "High-Level Design",
    skill_category: "system-design",
    topic: "API and data model design",
    subtopic: "Design a Web Crawler",
    question_title: "Design a Scalable Distributed Web Crawler.",
    question_prompt: "Design a distributed crawler parsing billions of web pages: URL Frontier (FIFO vs Priority queue), Politeness policies (avoiding DDoS on target domains), Duplicate detection with Bloom Filters, and distributed workers.",
    question_type: "practical_scenario",
    difficulty: "advanced",
    priority: "medium",
    expected_answer_points: [
      "Components: URL Frontier, Fetcher workers, DNS Resolver cache, Content Parser, Duplicate Content Detector, Document Storage (S3/HDFS).",
      "URL Frontier: Manages URLs to crawl. Prioritizes important pages (PageRank) and enforces Politeness (never overload a single host domain; queues URLs per host with delay intervals).",
      "Deduplication: Web has massive duplicate links and circular loops. Use a distributed Bloom Filter or SHA-256 fingerprint hash store to check if URL/content was already crawled in O(1) time.",
      "Robots.txt: Crawlers must parse and cache robots.txt before fetching.",
      "Distributed scaling: Partition URLs by domain hash across a pool of stateless crawler worker pods."
    ],
    sample_answer: "A distributed web crawler fetches and indexes billions of pages. The core component is the URL Frontier, which balances Priority (PageRank) with Politeness (queuing URLs per domain and throttling fetch rates to prevent DDoS). Crawler workers download pages using cached DNS lookups, parse out new links, and pass HTML to storage. A distributed Bloom filter checks URLs and content hashes in O(1) time to eliminate duplicate crawling and cycles.",
    follow_up_questions: [
      "How do you detect duplicate content when URLs differ but HTML is identical (SimHash)?",
      "What is a Spider Trap and how do crawlers defend against infinite dynamically generated URLs?"
    ],
    estimated_minutes: 15
  });

  addQ({
    id: "hld-08",
    skill_slug: "hld",
    skill_name: "High-Level Design",
    skill_category: "system-design",
    topic: "Availability and failure handling",
    subtopic: "Disaster Recovery: RTO, RPO, and Multi-Region Replication",
    question_title: "Explain Disaster Recovery planning: RTO, RPO, and Multi-Region architectures.",
    question_prompt: "Define Recovery Time Objective (RTO) and Recovery Point Objective (RPO). Compare Multi-Region architectures: Active-Passive (Cold/Warm/Hot Standby) vs Active-Active. How is cross-region data replication handled?",
    question_type: "conceptual",
    difficulty: "advanced",
    priority: "high",
    expected_answer_points: [
      "RTO (Recovery Time Objective): Maximum acceptable duration of system downtime before service is restored.",
      "RPO (Recovery Point Objective): Maximum acceptable data loss measured in time (e.g. RPO of 5 mins means at most 5 mins of committed data can be lost in a disaster).",
      "Active-Passive Standby: Primary region serves all traffic. Secondary region is Cold (spin up from backups), Warm (smaller capacity running), or Hot (full capacity mirroring live data). Failover requires DNS update (Route 53).",
      "Active-Active Multi-Region: Both regions actively serve user traffic simultaneously (geo-DNS routing). Highest availability and zero RTO/RPO, but requires handling complex bi-directional cross-region database conflict resolution (CRDTs or Last-Write-Wins)."
    ],
    sample_answer: "Disaster recovery is defined by RTO (how long you can afford to be down) and RPO (how much data loss in time is acceptable). In Active-Passive, primary region serves traffic while secondary acts as a standby; failover is triggered via DNS rerouting. In Active-Active, both regions process live user requests simultaneously via Geo-DNS. While Active-Active offers near-zero RTO and lowest latency, it introduces distributed database replication lag and requires conflict resolution mechanisms for concurrent writes.",
    follow_up_questions: [
      "What is Split-Brain scenario during cross-region network partitions and how is quorum used to prevent it?",
      "How does AWS Aurora Global Database achieve sub-second cross-region replication?"
    ],
    estimated_minutes: 12
  });

  addQ({
    id: "hld-09",
    skill_slug: "hld",
    skill_name: "High-Level Design",
    skill_category: "system-design",
    topic: "API and data model design",
    subtopic: "Design a News Feed System (Twitter / Instagram)",
    question_title: "Design a Scalable Social Media News Feed (like Twitter or Instagram).",
    question_prompt: "Compare Fan-out on Write (Push model) vs Fan-out on Read (Pull model). How do you handle the 'Celebrity / Hotspot' problem when users like Elon Musk have 100M+ followers?",
    question_type: "practical_scenario",
    difficulty: "advanced",
    priority: "critical",
    expected_answer_points: [
      "Fan-out on Write (Push): When user posts, write post ID to the pre-computed news feed cache (Redis list) of ALL their followers. Reads are ultra-fast O(1) from Redis list. Disadvantage: Celebrity posting causes write explosion (1 post to 100M followers requires 100M cache updates).",
      "Fan-out on Read (Pull): When user opens feed, pull recent posts from all followees and merge in memory. Writes are fast O(1), but reads are slow and complex for users following thousands of people.",
      "Hybrid Model: Standard users use Fan-out on Write. Celebrities (>50k followers) use Fan-out on Read (do NOT push to followers' feeds). When a normal user opens their feed, fetch their pre-computed Redis feed and merge in recent posts from any celebrities they follow on the fly.",
      "Feed storage: Redis Sorted Sets (ZSET) where score is post timestamp, keeping top 800 feed items in RAM."
    ],
    sample_answer: "A News Feed system balances write and read fan-out. In Fan-out on Write (Push), a user's post is pushed into the pre-computed Redis feed of all followers, making reads instantaneous. However, this causes write bottlenecks when celebrities with 50M followers post. Production systems use a Hybrid approach: regular users push posts to followers' feeds; high-follower celebrities do not push. When a user requests their feed, the system reads their pre-computed feed and merges in recent posts from any celebrities they follow on the fly.",
    follow_up_questions: [
      "Why is Redis Sorted Set (ZSET) the ideal data structure for storing user timeline feeds?",
      "How does media (image/video) upload flow asynchronously using pre-signed S3 URLs and background transcoding queues?"
    ],
    estimated_minutes: 15
  });
};
