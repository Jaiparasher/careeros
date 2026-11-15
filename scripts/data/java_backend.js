// Java Backend Ecosystem questions: 79 total
// spring-framework (12), spring-boot (14), spring-security (11), hibernate-jpa (12), microservices (11), apache-kafka (11), spring-ai (8)
module.exports = function(addQ) {
  // --- SPRING FRAMEWORK / SPRING CORE (12) ---
  addQ({
    id: "spring-core-01",
    skill_slug: "spring-framework",
    skill_name: "Spring Framework / Spring Core",
    skill_category: "java-backend",
    topic: "IoC and dependency injection",
    subtopic: "Inversion of Control & DI Types",
    question_title: "Explain Inversion of Control (IoC) and compare Constructor vs Setter vs Field Injection.",
    question_prompt: "What problem does IoC solve? Compare Constructor Injection, Setter Injection, and Field Injection (@Autowired on private fields). Why does the Spring team officially discourage field injection?",
    question_type: "conceptual",
    difficulty: "intermediate",
    priority: "critical",
    expected_answer_points: [
      "IoC transfers control of object instantiation and dependency lifecycle from the application code to the Spring IoC container.",
      "Constructor injection: Dependencies are provided via the class constructor. Guarantees immutability (final fields), prevents NullPointerExceptions during unit tests, and fails fast on circular dependencies.",
      "Setter injection: Dependencies provided via setter methods. Useful for optional dependencies or re-configuration.",
      "Field injection (@Autowired on fields): Uses reflection to inject private fields. Disadvantages: hides dependencies, prevents immutability, complicates unit testing without Spring context, and can mask circular dependencies until runtime."
    ],
    sample_answer: "Inversion of Control delegates object creation and lifecycle management to the Spring container. Constructor injection is the recommended standard because it allows fields to be marked final (immutable), guarantees that an object cannot be constructed in an incomplete state, and makes pure POJO unit testing straightforward without reflection. Field injection is discouraged because it hides dependencies, breaks immutability, and tightly couples code to the Spring container.",
    follow_up_questions: [
      "How does Spring handle single-constructor classes in Spring 4.3+ without explicit @Autowired?",
      "How can circular dependencies be resolved if two beans require each other?"
    ],
    estimated_minutes: 12
  });

  addQ({
    id: "spring-core-02",
    skill_slug: "spring-framework",
    skill_name: "Spring Framework / Spring Core",
    skill_category: "java-backend",
    topic: "Bean lifecycle and scopes",
    subtopic: "Spring Bean Lifecycle Stages",
    question_title: "Walk through the entire Spring Bean Lifecycle from instantiation to destruction.",
    question_prompt: "Detail all stages of a Spring bean lifecycle: BeanDefinition, Instantiation, Populating properties, Aware interfaces, BeanPostProcessor (before/after initialization), @PostConstruct / InitializingBean, and @PreDestroy / DisposableBean.",
    question_type: "conceptual",
    difficulty: "advanced",
    priority: "critical",
    expected_answer_points: [
      "1. Bean definition loading from annotations (@Component/@Bean) or XML into BeanDefinitionRegistry.",
      "2. Instantiation: JVM creates object instance via constructor.",
      "3. Populate Properties: Dependency injection of fields and setters.",
      "4. Aware interfaces: Injects BeanNameAware, BeanFactoryAware, ApplicationContextAware.",
      "5. BeanPostProcessor.postProcessBeforeInitialization().",
      "6. Initialization callbacks: @PostConstruct method -> InitializingBean.afterPropertiesSet() -> custom init-method.",
      "7. BeanPostProcessor.postProcessAfterInitialization() (where AOP proxies are created).",
      "8. Destruction callbacks: @PreDestroy method -> DisposableBean.destroy() -> custom destroy-method."
    ],
    sample_answer: "The lifecycle begins when Spring reads BeanDefinitions, instantiates the bean via reflection, and populates dependencies. Next, Aware callbacks inject framework contexts. Then, BeanPostProcessor.postProcessBeforeInitialization runs, followed by @PostConstruct and InitializingBean.afterPropertiesSet(). Crucially, BeanPostProcessor.postProcessAfterInitialization runs next—this is where Spring wraps beans with dynamic CGLIB or JDK AOP proxies. On shutdown, @PreDestroy and DisposableBean run cleanups.",
    follow_up_questions: [
      "Why are AOP proxies generated in postProcessAfterInitialization rather than before?",
      "What is the difference between @PostConstruct and InitializingBean?"
    ],
    estimated_minutes: 15
  });

  addQ({
    id: "spring-core-03",
    skill_slug: "spring-framework",
    skill_name: "Spring Framework / Spring Core",
    skill_category: "java-backend",
    topic: "Bean lifecycle and scopes",
    subtopic: "Bean Scopes & Prototype in Singleton",
    question_title: "What are Spring Bean Scopes, and how do you inject a Prototype bean into a Singleton bean?",
    question_prompt: "Explain singleton, prototype, request, session, and application scopes. What happens if a prototype bean is injected into a singleton bean via @Autowired, and how do you solve the stale instance problem?",
    question_type: "practical_scenario",
    difficulty: "intermediate",
    priority: "critical",
    expected_answer_points: [
      "Scopes: singleton (default, 1 instance per ApplicationContext), prototype (new instance every request), request (per HTTP request), session (per HTTP session).",
      "Problem: A singleton bean is initialized once; injecting a prototype bean via standard @Autowired binds only that single prototype instance forever.",
      "Solution 1: @Lookup method injection (Spring overrides method at runtime via CGLIB subclass to fetch from ApplicationContext).",
      "Solution 2: ObjectProvider<MyPrototypeBean> or Provider<T> (JSR-330) called on demand.",
      "Solution 3: Scoped proxy (proxyMode = ScopedProxyMode.TARGET_CLASS)."
    ],
    sample_answer: "Spring defaults to singleton scope (one instance per container), while prototype creates a new instance on every lookup. If you inject a prototype bean into a singleton, the injection happens only once at startup, so the singleton holds a stale instance forever. To fix this, use @Lookup on a getter method so Spring generates a CGLIB subclass that dynamically retrieves a fresh prototype instance from the context, or inject ObjectProvider<T> and call getObject() whenever a fresh instance is needed.",
    follow_up_questions: [
      "Why is injecting ApplicationContext directly into a service to call getBean() considered an anti-pattern?",
      "How does ScopedProxyMode.TARGET_CLASS work for request-scoped beans in a singleton controller?"
    ],
    estimated_minutes: 12
  });

  addQ({
    id: "spring-core-04",
    skill_slug: "spring-framework",
    skill_name: "Spring Framework / Spring Core",
    skill_category: "java-backend",
    topic: "AOP fundamentals",
    subtopic: "AOP Concepts & Proxies",
    question_title: "Explain Aspect-Oriented Programming (AOP): Pointcuts, Advice, Join Points, and Dynamic Proxies.",
    question_prompt: "Define Pointcut, JoinPoint, and Advice types (@Before, @AfterReturning, @AfterThrowing, @Around). Explain how Spring AOP uses JDK Dynamic Proxies vs CGLIB, and why self-invocation breaks AOP.",
    question_type: "conceptual",
    difficulty: "advanced",
    priority: "critical",
    expected_answer_points: [
      "Join Point: Any point in program execution (Spring AOP only supports method execution).",
      "Pointcut: A predicate expression (e.g. execution(* com.example.service.*.*(..))) matching join points.",
      "Advice: Action taken at a join point (@Around wraps method with ProceedingJoinPoint, controlling execution).",
      "JDK Dynamic Proxy (interface-based via java.lang.reflect.Proxy) vs CGLIB (subclassing via bytecode generation). Spring Boot 2+ defaults to CGLIB.",
      "Self-invocation issue: When methodA() calls methodB() within the same class, the call bypasses the proxy and invokes the raw target instance directly, causing @Transactional and @Async on methodB() to be silently ignored."
    ],
    sample_answer: "Spring AOP separates cross-cutting concerns (transactions, logging, security). Pointcuts define where advice applies, and Advice defines what to run (@Before, @Around, etc.). Spring implements AOP via runtime proxies (JDK proxies for interfaces, CGLIB for class subclasses). Crucially, if a method calls another annotated method within the same bean (this.methodB()), the call bypasses the Spring proxy; therefore, annotations like @Transactional or @Async will NOT execute.",
    follow_up_questions: [
      "How can you invoke another method on the same bean while preserving AOP proxy behavior?",
      "What is the difference between Spring AOP (runtime proxy) and AspectJ (compile/load-time weaving)?"
    ],
    estimated_minutes: 15
  });

  addQ({
    id: "spring-core-05",
    skill_slug: "spring-framework",
    skill_name: "Spring Framework / Spring Core",
    skill_category: "java-backend",
    topic: "IoC and dependency injection",
    subtopic: "Circular Dependencies Resolution",
    question_title: "How does Spring resolve Circular Dependencies, and why are they forbidden by default in Spring Boot 2.6+?",
    question_prompt: "Explain Spring's Three-Level Cache mechanism (singletonObjects, earlySingletonObjects, singletonFactories) for resolving setter-based circular dependencies. Why did Spring disable circular dependencies by default in Boot 2.6+?",
    question_type: "conceptual",
    difficulty: "advanced",
    priority: "high",
    expected_answer_points: [
      "Level 1: singletonObjects (fully initialized beans).",
      "Level 2: earlySingletonObjects (instantiated, unpopulated beans or early proxies).",
      "Level 3: singletonFactories (ObjectFactory lambdas capable of exposing early bean references, needed for AOP proxies).",
      "Constructor circular dependencies cannot be resolved by caches because instantiation cannot complete.",
      "In Spring Boot 2.6+, circular references are disallowed by default (throw BeanCurrentlyInCreationException) because they signal poor architectural separation of concerns and tight coupling."
    ],
    sample_answer: "Spring resolves circular dependencies in setter/field injection using a 3-level cache. When Bean A instantiates, it puts an ObjectFactory into singletonFactories. When A injects Bean B, B looks for A, retrieves an early reference from singletonFactories, and caches it in earlySingletonObjects. However, constructor circular dependencies cannot be resolved because neither can instantiate. Spring Boot 2.6+ disallows circular references by default because they indicate architectural smell.",
    follow_up_questions: [
      "What is the purpose of @Lazy in breaking circular dependencies?",
      "What property in application.properties temporarily re-enables circular references in Spring Boot?"
    ],
    estimated_minutes: 12
  });

  addQ({
    id: "spring-core-06",
    skill_slug: "spring-framework",
    skill_name: "Spring Framework / Spring Core",
    skill_category: "java-backend",
    topic: "Configuration and profiles",
    subtopic: "@Configuration vs @Component & Lite Mode",
    question_title: "What is the difference between @Configuration and @Component when defining @Bean methods?",
    question_prompt: "Explain what happens when @Bean methods are declared inside a @Configuration class vs a plain @Component class. What is CGLIB proxying (proxyBeanMethods = true) and how does it guarantee singleton bean references?",
    question_type: "conceptual",
    difficulty: "intermediate",
    priority: "high",
    expected_answer_points: [
      "@Configuration classes are proxied with CGLIB by default (proxyBeanMethods = true).",
      "When a @Bean method calls another @Bean method inside @Configuration, the CGLIB interceptor checks if the bean exists in context before executing, guaranteeing the exact same singleton instance.",
      "In a @Component class ('lite' mode), calling another @Bean method directly is a standard Java method call that creates a brand new instance outside the Spring context.",
      "Setting proxyBeanMethods = false improves startup time when bean methods are never called inter-dependently."
    ],
    sample_answer: "In a @Configuration class, Spring wraps the configuration class with a CGLIB proxy (proxyBeanMethods = true). If one @Bean method calls another @Bean method directly, the proxy intercepts the call and returns the existing singleton from the ApplicationContext. In contrast, in a plain @Component class (lite mode), calling another bean method is just a regular Java call that executes the constructor again and creates an unmanaged duplicate instance.",
    follow_up_questions: [
      "Why does Spring Boot 2.2+ default internal auto-configurations to proxyBeanMethods = false?",
      "Can a @Configuration class be marked final?"
    ],
    estimated_minutes: 10
  });

  addQ({
    id: "spring-core-07",
    skill_slug: "spring-framework",
    skill_name: "Spring Framework / Spring Core",
    skill_category: "java-backend",
    topic: "Configuration and profiles",
    subtopic: "Spring Profiles & Dynamic Activation",
    question_title: "How do Spring Profiles work, and how do you activate them across dev, test, and prod?",
    question_prompt: "Explain @Profile, spring.profiles.active, multi-document application.yml files (using '---'), and profile-specific properties files (application-{profile}.properties). How are profiles overridden via OS environment variables?",
    question_type: "practical_scenario",
    difficulty: "beginner",
    priority: "medium",
    expected_answer_points: [
      "@Profile('dev') restricts components or configuration classes to load only when specified profiles are active.",
      "Profiles are activated via spring.profiles.active property in application.yml, JVM flag (-Dspring.profiles.active=prod), or environment variable (SPRING_PROFILES_ACTIVE=prod).",
      "Spring loads application-{profile}.properties/yml on top of application.yml, overriding common keys with profile-specific values.",
      "Modern Spring Boot allows profile group configuration (spring.profiles.group.prod=prod,db-prod,monitoring)."
    ],
    sample_answer: "Spring Profiles segregate application configuration for different environments (e.g. dev, staging, prod). Components and @Configuration classes can be annotated with @Profile('prod'). Profile files like application-prod.yml override default application.yml settings. Profiles are activated at runtime using the environment variable SPRING_PROFILES_ACTIVE=prod or JVM option -Dspring.profiles.active=prod, allowing immutable Docker containers to adapt to deployment targets.",
    follow_up_questions: [
      "What is the precedence order between command-line arguments, environment variables, and application.properties?",
      "How do you define default profiles when no active profile is supplied?"
    ],
    estimated_minutes: 10
  });

  addQ({
    id: "spring-core-08",
    skill_slug: "spring-framework",
    skill_name: "Spring Framework / Spring Core",
    skill_category: "java-backend",
    topic: "IoC and dependency injection",
    subtopic: "@Primary vs @Qualifier",
    question_title: "How do you resolve NoUniqueBeanDefinitionException using @Primary and @Qualifier?",
    question_prompt: "When multiple beans implement the same interface, Spring throws NoUniqueBeanDefinitionException. Explain how @Primary sets a default bean and how @Qualifier provides explicit target resolution at the injection point.",
    question_type: "coding",
    difficulty: "beginner",
    priority: "high",
    expected_answer_points: [
      "NoUniqueBeanDefinitionException occurs when Spring finds more than one bean matching an autowired injection type.",
      "@Primary marks one bean candidate as the default when no specific qualifier is given.",
      "@Qualifier('beanName') specifies the exact bean name to inject at the injection site (constructor or parameter).",
      "@Qualifier takes precedence over @Primary if both are present.",
      "Custom qualifier annotations can be created using @Qualifier to avoid magic strings."
    ],
    sample_answer: "When multiple candidate beans exist for an interface, Spring cannot decide which to inject and throws NoUniqueBeanDefinitionException. Annotating one implementation with @Primary gives it default precedence for un-qualified injection points. Annotating the injection point with @Qualifier('specificBeanName') explicitly picks that exact implementation. @Qualifier always overrides @Primary.",
    follow_up_questions: [
      "Can you inject a List<MyInterface> to collect all implementations of an interface in Spring?",
      "How can you use a Map<String, MyInterface> to create a dynamic strategy pattern dispatch?"
    ],
    estimated_minutes: 10
  });

  addQ({
    id: "spring-core-09",
    skill_slug: "spring-framework",
    skill_name: "Spring Framework / Spring Core",
    skill_category: "java-backend",
    topic: "Bean lifecycle and scopes",
    subtopic: "BeanFactoryPostProcessor vs BeanPostProcessor",
    question_title: "Compare BeanFactoryPostProcessor and BeanPostProcessor in Spring.",
    question_prompt: "Explain the difference in responsibility and execution order between BeanFactoryPostProcessor and BeanPostProcessor. Provide real examples like PropertySourcesPlaceholderConfigurer.",
    question_type: "conceptual",
    difficulty: "advanced",
    priority: "high",
    expected_answer_points: [
      "BeanFactoryPostProcessor (BFPP): Operates on bean definitions (metadata) BEFORE any bean instances are created. Can modify property values or bean definitions. Example: PropertySourcesPlaceholderConfigurer (resolves ${...} placeholders).",
      "BeanPostProcessor (BPP): Operates on actual instantiated bean instances during the initialization phase (before and after init callbacks). Example: AutowiredAnnotationBeanPostProcessor, CommonAnnotationBeanPostProcessor, AsyncAnnotationBeanPostProcessor.",
      "BFPP runs early during context refresh; BPP runs later during bean instantiation."
    ],
    sample_answer: "BeanFactoryPostProcessor operates on bean definitions before any bean instances are created, allowing modification of bean configuration metadata (e.g. PropertySourcesPlaceholderConfigurer resolving ${db.url} properties). In contrast, BeanPostProcessor operates on instantiated bean objects during the initialization phase (before and after @PostConstruct), allowing modification, wrapping, or proxy creation (e.g. creating transactional proxies).",
    follow_up_questions: [
      "Why must methods returning BeanFactoryPostProcessor inside @Configuration classes be declared static?",
      "What happens if a BeanPostProcessor has an @Autowired dependency that triggers early bean initialization?"
    ],
    estimated_minutes: 12
  });

  addQ({
    id: "spring-core-10",
    skill_slug: "spring-framework",
    skill_name: "Spring Framework / Spring Core",
    skill_category: "java-backend",
    topic: "IoC and dependency injection",
    subtopic: "ApplicationContext vs BeanFactory",
    question_title: "What is the difference between BeanFactory and ApplicationContext?",
    question_prompt: "Compare BeanFactory and ApplicationContext. Which one supports eager singleton pre-instantiation, event publication, i18n, and AOP integration out of the box?",
    question_type: "conceptual",
    difficulty: "beginner",
    priority: "medium",
    expected_answer_points: [
      "BeanFactory: Root interface providing basic IoC and dependency injection. Lazy-loads singletons upon first getBean() request. Lightweight for constrained devices.",
      "ApplicationContext: Extends BeanFactory and adds enterprise features.",
      "Key ApplicationContext additions: Eager pre-instantiation of singletons at startup (fails fast on configuration errors); Event publication (ApplicationEventPublisher); Internationalization (MessageSource); Automatic BeanPostProcessor / BeanFactoryPostProcessor registration.",
      "Standard modern web apps use ApplicationContext (e.g. AnnotationConfigServletWebServerApplicationContext)."
    ],
    sample_answer: "BeanFactory is the lightweight base interface that lazy-loads beans only when requested. ApplicationContext extends BeanFactory and is the enterprise standard: it eagerly instantiates singletons on startup (allowing fail-fast validation of misconfigured beans), supports internationalization (MessageSource), publishes application events, and automatically detects and registers all post-processors.",
    follow_up_questions: [
      "What are ApplicationListener and @EventListener in Spring?",
      "Why is eager instantiation beneficial in production web applications?"
    ],
    estimated_minutes: 10
  });

  addQ({
    id: "spring-core-11",
    skill_slug: "spring-framework",
    skill_name: "Spring Framework / Spring Core",
    skill_category: "java-backend",
    topic: "AOP fundamentals",
    subtopic: "Custom Annotations with Spring AOP",
    question_title: "How do you implement a custom logging or execution timer annotation using Spring AOP?",
    question_prompt: "Write or describe the components required to build a custom @TrackExecutionTime annotation: defining the annotation, creating the @Aspect class, defining the @Around advice with ProceedingJoinPoint, and logging the elapsed milliseconds.",
    question_type: "coding",
    difficulty: "intermediate",
    priority: "high",
    expected_answer_points: [
      "1. Define @Target(ElementType.METHOD) and @Retention(RetentionPolicy.RUNTIME) annotation @TrackTime.",
      "2. Create an @Aspect and @Component class.",
      "3. Define @Around('@annotation(trackTime)') advice accepting ProceedingJoinPoint and trackTime parameter.",
      "4. Measure start time: long start = System.currentTimeMillis();",
      "5. Invoke join point: Object result = joinPoint.proceed();",
      "6. Measure end time, log duration with joinPoint.getSignature().toShortString(), and return result."
    ],
    sample_answer: "To implement @TrackExecutionTime, define a runtime retention annotation. Then create a @Component annotated with @Aspect. In that class, create an @Around advice pointing to '@annotation(com.example.TrackExecutionTime)'. The advice accepts ProceedingJoinPoint, records System.currentTimeMillis(), calls joinPoint.proceed(), calculates elapsed time in a finally block, logs the method signature and duration, and returns the result.",
    follow_up_questions: [
      "What happens if joinPoint.proceed() throws an exception?",
      "Why must @Retention be RetentionPolicy.RUNTIME for Spring AOP?"
    ],
    estimated_minutes: 12
  });

  addQ({
    id: "spring-core-12",
    skill_slug: "spring-framework",
    skill_name: "Spring Framework / Spring Core",
    skill_category: "java-backend",
    topic: "Configuration and profiles",
    subtopic: "Spring Events & TransactionalEventListener",
    question_title: "How do Spring Application Events work, and what is @TransactionalEventListener?",
    question_prompt: "Explain how to publish and listen to custom events with ApplicationEventPublisher and @EventListener. How does @TransactionalEventListener(phase = AFTER_COMMIT) ensure messages are only published after the database transaction commits?",
    question_type: "practical_scenario",
    difficulty: "advanced",
    priority: "high",
    expected_answer_points: [
      "Event publisher: Inject ApplicationEventPublisher and call publishEvent(new OrderCreatedEvent(orderId)).",
      "Synchronous listener: @EventListener executes within the same thread and transaction by default.",
      "@TransactionalEventListener binds event execution to the outcome of the active database transaction.",
      "Phases: AFTER_COMMIT (default, runs only if transaction succeeds), AFTER_ROLLBACK, AFTER_COMPLETION, BEFORE_COMMIT.",
      "Critical use case: Publishing a message to Kafka or sending an email receipt only AFTER the order is successfully committed to the database."
    ],
    sample_answer: "Spring events decouple modules: a service publishes an event using ApplicationEventPublisher, and listeners handle it with @EventListener. Standard @EventListener runs synchronously within the publisher's transaction. @TransactionalEventListener lets you specify a transaction phase like AFTER_COMMIT. This prevents phantom operations—such as sending a Kafka notification or email for an order that ended up rolling back in the database.",
    follow_up_questions: [
      "What happens if an @TransactionalEventListener(phase = AFTER_COMMIT) attempts to perform a database write?",
      "How do you make an event listener execute asynchronously in a separate thread?"
    ],
    estimated_minutes: 12
  });

  // --- SPRING BOOT (14) ---
  addQ({
    id: "spring-boot-01",
    skill_slug: "spring-boot",
    skill_name: "Spring Boot",
    skill_category: "java-backend",
    topic: "Auto-configuration and starters",
    subtopic: "Auto-Configuration Mechanics",
    question_title: "How does Spring Boot Auto-Configuration work under the hood?",
    question_prompt: "Explain how @SpringBootApplication combines @EnableAutoConfiguration, @ComponentScan, and @Configuration. Explain META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports, @ConditionalOnClass, and @ConditionalOnMissingBean.",
    question_type: "conceptual",
    difficulty: "advanced",
    priority: "critical",
    expected_answer_points: [
      "@SpringBootApplication meta-annotation combines @SpringBootConfiguration, @EnableAutoConfiguration, and @ComponentScan.",
      "@EnableAutoConfiguration imports AutoConfigurationImportSelector.",
      "In Spring Boot 3+, auto-configuration classes are listed in META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports (formerly spring.factories).",
      "Conditional annotations evaluate at runtime: @ConditionalOnClass (checks if library is on classpath), @ConditionalOnMissingBean (backs off if user defined their own bean), @ConditionalOnProperty.",
      "Enables convention over configuration: sensible defaults that gracefully yield to user customizations."
    ],
    sample_answer: "Auto-configuration evaluates classes declared in AutoConfiguration.imports. The AutoConfigurationImportSelector scans these classes and evaluates conditional annotations such as @ConditionalOnClass (e.g. DataSource.class present) and @ConditionalOnMissingBean. If conditions pass, Spring automatically registers default beans. If the developer declares their own custom bean, @ConditionalOnMissingBean causes the auto-configuration to back off seamlessly.",
    follow_up_questions: [
      "How can you inspect why an auto-configuration class was or was not applied?",
      "How do you exclude a specific auto-configuration class?"
    ],
    estimated_minutes: 15
  });

  addQ({
    id: "spring-boot-02",
    skill_slug: "spring-boot",
    skill_name: "Spring Boot",
    skill_category: "java-backend",
    topic: "Application lifecycle and configuration",
    subtopic: "SpringApplication.run() Lifecycle",
    question_title: "What happens during SpringApplication.run()? Walk through the startup sequence.",
    question_prompt: "Detail the steps that execute when SpringApplication.run(Main.class, args) is invoked: Environment preparation, Banner printing, ApplicationContext creation, Refresh context, ApplicationRunner / CommandLineRunner execution.",
    question_type: "conceptual",
    difficulty: "advanced",
    priority: "critical",
    expected_answer_points: [
      "1. Create SpringApplication instance: deduce web application type (Servlet vs Reactive vs None), load initializers and listeners from imports.",
      "2. Start SpringApplicationRunListeners.",
      "3. Prepare Environment: load application.properties/yml, command-line arguments, system properties.",
      "4. Create ApplicationContext matching the web type (AnnotationConfigServletWebServerApplicationContext).",
      "5. Prepare context: register spring Boot beans, apply Initializers.",
      "6. Refresh Context: create embedded Tomcat/Jetty web server, instantiate singletons, run post-processors.",
      "7. Execute ApplicationRunner and CommandLineRunner beans.",
      "8. Return running ConfigurableApplicationContext."
    ],
    sample_answer: "SpringApplication.run() first determines application type (Servlet or Reactive), initializes listeners, and prepares the ConfigurableEnvironment. It then instantiates the appropriate ApplicationContext. During context.refresh(), it starts the embedded web server (Tomcat), registers beans, runs BeanPostProcessors, and eagerly creates singletons. Finally, it executes CommandLineRunner and ApplicationRunner beans before signaling ready.",
    follow_up_questions: [
      "What is the difference between CommandLineRunner and ApplicationRunner?",
      "How does Spring Boot embed Tomcat without requiring a standalone WAR deployment?"
    ],
    estimated_minutes: 15
  });

  addQ({
    id: "spring-boot-03",
    skill_slug: "spring-boot",
    skill_name: "Spring Boot",
    skill_category: "java-backend",
    topic: "REST controllers and request lifecycle",
    subtopic: "DispatcherServlet & Request Lifecycle",
    question_title: "Explain the complete Spring MVC Request Lifecycle through DispatcherServlet.",
    question_prompt: "Trace an incoming HTTP request step-by-step: Filter chain, DispatcherServlet, HandlerMapping, HandlerAdapter, Controller execution, HandlerMethodArgumentResolver, HttpMessageConverter, and ViewResolver / ResponseEntity.",
    question_type: "conceptual",
    difficulty: "intermediate",
    priority: "critical",
    expected_answer_points: [
      "1. Request enters Servlet Container and passes through Servlet Filters (Security, CORS, Logging).",
      "2. DispatcherServlet (Front Controller) receives request in doDispatch().",
      "3. HandlerMapping locates the matching Controller HandlerExecutionChain (controller method + interceptors).",
      "4. Interceptor.preHandle() executes.",
      "5. HandlerAdapter (RequestMappingHandlerAdapter) invokes the handler method.",
      "6. HandlerMethodArgumentResolver resolves method parameters (@RequestBody uses Jackson HttpMessageConverter).",
      "7. Controller method executes and returns DTO / ResponseEntity.",
      "8. RequestResponseBodyMethodProcessor serializes return object via HttpMessageConverter (Jackson ObjectMapper).",
      "9. Interceptor.postHandle() and afterCompletion() run, and response streams to client."
    ],
    sample_answer: "The request passes through servlet filters to DispatcherServlet (the Front Controller). DispatcherServlet asks HandlerMapping for the matching HandlerExecutionChain. HandlerAdapter executes the method: ArgumentResolvers deserialize the request body via HttpMessageConverters (Jackson), interceptor preHandle runs, and the controller executes. If returning @ResponseBody/ResponseEntity, Jackson serializes the return object directly to HTTP JSON, interceptors finish, and the response is returned.",
    follow_up_questions: [
      "What is the difference between a Servlet Filter and a HandlerInterceptor?",
      "How does Content Negotiation work in Spring MVC?"
    ],
    estimated_minutes: 15
  });

  addQ({
    id: "spring-boot-04",
    skill_slug: "spring-boot",
    skill_name: "Spring Boot",
    skill_category: "java-backend",
    topic: "Validation and exception handling",
    subtopic: "Global Exception Handling & RFC 7807",
    question_title: "How do you implement robust Global Exception Handling with @RestControllerAdvice and RFC 7807?",
    question_prompt: "Explain how to build a centralized error handling strategy using @RestControllerAdvice and @ExceptionHandler. How does Spring Boot 3 support RFC 7807 ProblemDetail?",
    question_type: "coding",
    difficulty: "intermediate",
    priority: "critical",
    expected_answer_points: [
      "@RestControllerAdvice combines @ControllerAdvice and @ResponseBody to intercept exceptions thrown by controllers globally.",
      "@ExceptionHandler(MethodArgumentNotValidException.class) captures validation failures and formats clean field-error arrays.",
      "@ExceptionHandler(ResourceNotFoundException.class) maps domain errors to HTTP 404.",
      "Generic @ExceptionHandler(Exception.class) catches unhandled errors, logs stack traces securely, and returns 500 without leaking internal secrets.",
      "Spring Boot 3 introduces ProblemDetail (RFC 7807): standardized JSON response with type, title, status, detail, instance, and custom properties."
    ],
    sample_answer: "Create a class annotated with @RestControllerAdvice. Define methods with @ExceptionHandler for specific exceptions: MethodArgumentNotValidException to return field-level validation errors (HTTP 400), custom business exceptions (e.g. EntityNotFoundException -> HTTP 404), and a fallback Exception handler returning HTTP 500. In Spring Boot 3, return ProblemDetail (RFC 7807) to provide a standardized, machine-readable error format including status, detail, and timestamp.",
    follow_up_questions: [
      "What property in Spring Boot 3 enables automatic RFC 7807 ProblemDetail responses?",
      "Why should you never expose internal exception messages or stack traces in HTTP 500 responses to clients?"
    ],
    estimated_minutes: 12
  });

  addQ({
    id: "spring-boot-05",
    skill_slug: "spring-boot",
    skill_name: "Spring Boot",
    skill_category: "java-backend",
    topic: "Validation and exception handling",
    subtopic: "Bean Validation with Hibernate Validator",
    question_title: "How does Bean Validation (@Valid, @Validated) work in Spring Boot?",
    question_prompt: "Explain how @Valid and @Validated trigger JSR-380 validation. Compare common constraints (@NotNull, @NotEmpty, @NotBlank, @Size, @Pattern) and explain validation groups.",
    question_type: "coding",
    difficulty: "intermediate",
    priority: "high",
    expected_answer_points: [
      "@Valid (standard JSR-380) vs @Validated (Spring variant supporting validation groups).",
      "@NotNull: Value must not be null (permits empty string '').",
      "@NotEmpty: Not null and length/size > 0 (permits whitespace '   ').",
      "@NotBlank: Not null, length > 0, and contains at least one non-whitespace character (strictly for CharSequences).",
      "Validation groups allow applying different validation rules to the same DTO (e.g. CreateGroup vs UpdateGroup where ID is mandatory on update but omitted on create).",
      "Custom validators: implement ConstraintValidator<MyAnnotation, TargetType>."
    ],
    sample_answer: "Spring Boot Starter Validation brings Hibernate Validator. In controllers, annotate DTO parameters with @Valid or @Validated. @NotNull checks for null; @NotEmpty checks non-null and non-empty; @NotBlank checks non-null, non-empty, and non-whitespace. @Validated supports validation groups, allowing the same DTO to enforce required fields during POST /create while relaxing them for PATCH /update. Failures throw MethodArgumentNotValidException.",
    follow_up_questions: [
      "How do you validate path variables and query parameters on a @RestController?",
      "How do you implement a custom cross-field validator (e.g. password matches confirmPassword)?"
    ],
    estimated_minutes: 12
  });

  addQ({
    id: "spring-boot-06",
    skill_slug: "spring-boot",
    skill_name: "Spring Boot",
    skill_category: "java-backend",
    topic: "Actuator and production readiness",
    subtopic: "Spring Boot Actuator & Metrics",
    question_title: "What is Spring Boot Actuator, and how do you secure its production endpoints?",
    question_prompt: "Explain Actuator endpoints (/health, /info, /metrics, /env, /prometheus). How do you customize health indicators (HealthIndicator), configure liveness/readiness probes for Kubernetes, and secure sensitive actuator paths?",
    question_type: "practical_scenario",
    difficulty: "intermediate",
    priority: "high",
    expected_answer_points: [
      "Actuator provides production monitoring endpoints: /health, /metrics, /env, /threaddump, /heapdump, /prometheus.",
      "Kubernetes probes: management.endpoint.health.probes.enabled=true exposes /health/liveness (app running) and /health/readiness (ready to receive traffic).",
      "Custom HealthIndicator: Implement HealthIndicator and override health() returning Health.up() or Health.down().withDetail().",
      "Security: By default only /health is exposed over web. Never expose sensitive endpoints (/env, /beans) publicly; secure via Spring Security role (ADMIN) or bind management port to an internal private port (management.server.port=8081)."
    ],
    sample_answer: "Actuator exposes operational endpoints for monitoring application health and metrics. In Kubernetes, it provides dedicated /health/liveness and /health/readiness probes. You can add custom health checks by implementing HealthIndicator (e.g. checking 3rd party API connectivity). In production, sensitive endpoints like /env or /heapdump should never be exposed publicly: either restrict management.endpoints.web.exposure.include to health,info, or place actuator on an internal port protected by Spring Security.",
    follow_up_questions: [
      "How does Micrometer integrate with Spring Boot Actuator to export metrics to Prometheus?",
      "What is the difference between a Liveness failure and a Readiness failure in Kubernetes?"
    ],
    estimated_minutes: 12
  });

  addQ({
    id: "spring-boot-07",
    skill_slug: "spring-boot",
    skill_name: "Spring Boot",
    skill_category: "java-backend",
    topic: "Testing with JUnit and Mockito",
    subtopic: "@SpringBootTest vs @WebMvcTest vs @DataJpaTest",
    question_title: "Compare @SpringBootTest, @WebMvcTest, and @DataJpaTest in Spring Boot testing.",
    question_prompt: "Explain test slice annotations in Spring Boot. Why should you prefer sliced tests (@WebMvcTest, @DataJpaTest) over full @SpringBootTest for unit and integration testing?",
    question_type: "conceptual",
    difficulty: "intermediate",
    priority: "high",
    expected_answer_points: [
      "@SpringBootTest: Loads the entire ApplicationContext and all beans. Heavy and slow; ideal for end-to-end integration tests.",
      "@WebMvcTest: Slices the web layer only (controllers, filters, HandlerInterceptors). Mocks the service/repository layer using @MockBean. Fast controller testing with MockMvc.",
      "@DataJpaTest: Slices the persistence layer only (entities, Spring Data repositories, TestEntityManager). Configures an embedded or test database, runs tests in transactions that roll back automatically.",
      "@MockBean / @MockitoBean: Injects a Mockito mock directly into the Spring ApplicationContext for sliced testing."
    ],
    sample_answer: "@SpringBootTest starts the entire application context, making tests thorough but slow. Test slicing allows testing isolated layers: @WebMvcTest boots only MVC components (controllers, validation, filters) while mocking services with @MockBean, enabling fast API contract tests. @DataJpaTest boots only JPA entities and repositories with an in-memory/test database and automatic transaction rollback after every test method.",
    follow_up_questions: [
      "What is Testcontainers and why is it preferred over H2 for @DataJpaTest integration tests?",
      "What replaces @MockBean in Spring Boot 3.4+ (@MockitoBean)?"
    ],
    estimated_minutes: 12
  });

  addQ({
    id: "spring-boot-08",
    skill_slug: "spring-boot",
    skill_name: "Spring Boot",
    skill_category: "java-backend",
    topic: "Application lifecycle and configuration",
    subtopic: "@ConfigurationProperties vs @Value",
    question_title: "Compare @Value and @ConfigurationProperties for external configuration binding.",
    question_prompt: "Why is type-safe @ConfigurationProperties preferred over @Value for complex application settings? Discuss validation, relaxed binding, and constructor binding with records.",
    question_type: "conceptual",
    difficulty: "beginner",
    priority: "medium",
    expected_answer_points: [
      "@Value injects individual property values using SpEL (${app.timeout:5000}). Drawbacks: error-prone strings, no type hierarchy, difficult to validate grouped configurations.",
      "@ConfigurationProperties binds a hierarchical group of properties (e.g. prefix = 'app.security') to a strongly-typed Java POJO or Java Record.",
      "Relaxed binding: accepts kebab-case (max-retry), camelCase (maxRetry), or UPPER_SNAKE_CASE (MAX_RETRY) interchangeably.",
      "Supports JSR-380 validation (@Validated on the class with @Min, @NotBlank).",
      "Constructor binding with Java 17+ Records enables immutable configuration classes."
    ],
    sample_answer: "@Value injects single values with SpEL expressions, but lacks structure, grouping, and compile-time validation. @ConfigurationProperties provides type-safe hierarchical binding to POJOs or Java 17 Records. It supports relaxed binding (kebab-case in YAML matches camelCase in Java), enables validation via @Validated annotations, and generates IDE autocompletion metadata via spring-boot-configuration-processor.",
    follow_up_questions: [
      "How do you bind a List or Map of objects using @ConfigurationProperties?",
      "What dependency generates IDE metadata for custom @ConfigurationProperties?"
    ],
    estimated_minutes: 10
  });

  addQ({
    id: "spring-boot-09",
    skill_slug: "spring-boot",
    skill_name: "Spring Boot",
    skill_category: "java-backend",
    topic: "Logging and observability",
    subtopic: "MDC & Distributed Tracing",
    question_title: "How do you implement Distributed Tracing and MDC logging in Spring Boot microservices?",
    question_prompt: "Explain Mapped Diagnostic Context (MDC) in SLF4J/Logback. How do Micrometer Tracing and OpenTelemetry propagate traceId and spanId across HTTP and Kafka calls?",
    question_type: "practical_scenario",
    difficulty: "advanced",
    priority: "high",
    expected_answer_points: [
      "MDC (Mapped Diagnostic Context) is a thread-local map provided by SLF4J that attaches contextual key-values (e.g. userId, traceId) to all log lines generated by that thread.",
      "TraceId uniquely identifies an entire user request lifecycle across distributed microservices; SpanId identifies work within a single service.",
      "Micrometer Tracing (replacing Spring Cloud Sleuth in Boot 3) automatically generates traceId/spanId and injects them into MDC.",
      "Propagation: HTTP headers (W3C traceparent or B3 headers) and Kafka message headers transmit trace context between services.",
      "Async thread issue: Because MDC is ThreadLocal, trace context is lost when offloading to @Async thread pools unless using a TaskDecorator to copy MDC context."
    ],
    sample_answer: "MDC stores key-value pairs (like traceId, userId) in thread-local storage so Logback prints them in every log pattern. In microservices, Micrometer Tracing generates a unique traceId and injects it into MDC. When invoking another service, it propagates the traceId via HTTP headers (traceparent) or Kafka headers. Downstream services read the header and populate their own MDC, allowing all logs across distributed systems to be correlated in tools like Grafana Loki or ELK.",
    follow_up_questions: [
      "How do you propagate MDC context into @Async executor worker threads?",
      "What is the difference between Micrometer Tracing and Spring Cloud Sleuth?"
    ],
    estimated_minutes: 12
  });

  addQ({
    id: "spring-boot-10",
    skill_slug: "spring-boot",
    skill_name: "Spring Boot",
    skill_category: "java-backend",
    topic: "REST controllers and request lifecycle",
    subtopic: "Async Requests with DeferredResult & CompletableFuture",
    question_title: "How do you handle long-running asynchronous HTTP requests in Spring Boot?",
    question_prompt: "Compare DeferredResult, CompletableFuture, and Server-Sent Events (SseEmitter) in Spring MVC controllers. How do they release Tomcat container threads while waiting for long I/O?",
    question_type: "coding",
    difficulty: "intermediate",
    priority: "medium",
    expected_answer_points: [
      "Synchronous blocking: A Tomcat worker thread is occupied for the entire duration of the request, exhausting the connection pool during slow third-party calls.",
      "CompletableFuture<ResponseEntity<T>>: Controller returns future immediately; Tomcat thread is returned to the pool while worker pool computes the result.",
      "DeferredResult<T>: Managed asynchronous result. Any external event or thread can complete the DeferredResult by calling .setResult(), unblocking the client response.",
      "SseEmitter: Keeps HTTP connection open for one-way streaming of events from server to client over a single connection.",
      "Async support requires configuring WebMvcConfigurer.configureAsyncSupport()."
    ],
    sample_answer: "Returning CompletableFuture<T> or DeferredResult<T> releases the Tomcat container thread immediately back to the pool while the long-running operation executes on a separate background thread pool. Once the future completes or deferredResult.setResult() is called, the servlet container dispatches the response to the client. This prevents Tomcat worker thread exhaustion during slow I/O or external API calls.",
    follow_up_questions: [
      "What timeout configuration is required when using DeferredResult?",
      "What is the difference between SseEmitter and WebSockets for real-time data?"
    ],
    estimated_minutes: 12
  });

  addQ({
    id: "spring-boot-11",
    skill_slug: "spring-boot",
    skill_name: "Spring Boot",
    skill_category: "java-backend",
    topic: "Application lifecycle and configuration",
    subtopic: "Graceful Shutdown in Spring Boot",
    question_title: "How does Graceful Shutdown work in Spring Boot?",
    question_prompt: "Explain server.shutdown=graceful. What happens to active in-flight requests and incoming requests when a SIGTERM signal is received in containerized environments?",
    question_type: "practical_scenario",
    difficulty: "intermediate",
    priority: "medium",
    expected_answer_points: [
      "Configured via server.shutdown=graceful in application.properties.",
      "Upon receiving SIGTERM, the embedded web server stops accepting new connections immediately.",
      "Existing in-flight requests are allowed a grace period (spring.lifecycle.timeout-per-shutdown-phase, default 30s) to complete.",
      "If requests complete within grace period, JVM terminates cleanly; if timeout expires, active requests are forcefully terminated.",
      "In Kubernetes, paired with preStop sleep hooks to allow ingress load balancers to remove the pod before shutdown begins."
    ],
    sample_answer: "Setting server.shutdown=graceful ensures that when Kubernetes sends a SIGTERM, the embedded web server (Tomcat) stops accepting new incoming traffic while giving active in-flight requests up to 30 seconds (configurable via timeout-per-shutdown-phase) to finish processing cleanly. This prevents dropped HTTP requests and incomplete database writes during rolling deployments.",
    follow_up_questions: [
      "Why is a preStop sleep hook recommended in Kubernetes pod spec alongside graceful shutdown?",
      "How are background @Scheduled tasks and ThreadPoolExecutors gracefully terminated?"
    ],
    estimated_minutes: 10
  });

  addQ({
    id: "spring-boot-12",
    skill_slug: "spring-boot",
    skill_name: "Spring Boot",
    skill_category: "java-backend",
    topic: "Auto-configuration and starters",
    subtopic: "Custom Spring Boot Starter Development",
    question_title: "How do you create a custom Spring Boot Starter library?",
    question_prompt: "Walk through creating a custom reusable Spring Boot Starter: naming conventions, pom.xml structure, AutoConfiguration class, @ConfigurationProperties, and registering in AutoConfiguration.imports.",
    question_type: "conceptual",
    difficulty: "advanced",
    priority: "medium",
    expected_answer_points: [
      "Naming rule: Third-party starters must NOT start with spring-boot-starter-*; use myfeature-spring-boot-starter.",
      "Module structure: typically split into myfeature-spring-boot-autoconfigure (code) and myfeature-spring-boot-starter (empty dependency aggregator).",
      "Define @ConfigurationProperties class for customizable properties.",
      "Define @AutoConfiguration class with conditional checks (@ConditionalOnClass, @ConditionalOnMissingBean).",
      "Register the auto-configuration class in META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports."
    ],
    sample_answer: "To build a custom starter, create an autoconfigure module with an @AutoConfiguration class annotated with @ConditionalOnClass and @ConditionalOnMissingBean, backed by an @ConfigurationProperties class. Register the class in META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports. Package it under a name like myproject-spring-boot-starter so consuming applications can simply include the dependency and have beans automatically configured.",
    follow_up_questions: [
      "Why shouldn't third-party starters use the spring-boot-starter-* prefix?",
      "How do you write unit tests for custom auto-configurations using ApplicationContextRunner?"
    ],
    estimated_minutes: 12
  });

  addQ({
    id: "spring-boot-13",
    skill_slug: "spring-boot",
    skill_name: "Spring Boot",
    skill_category: "java-backend",
    topic: "Validation and exception handling",
    subtopic: "CORS Configuration in Spring Boot",
    question_title: "How do you configure Cross-Origin Resource Sharing (CORS) in Spring Boot?",
    question_prompt: "Compare @CrossOrigin annotation at controller level with global WebMvcConfigurer.addCorsMappings() and CorsFilter. Why does Spring Security sometimes block CORS pre-flight OPTIONS requests before Spring MVC handles them?",
    question_type: "practical_scenario",
    difficulty: "intermediate",
    priority: "high",
    expected_answer_points: [
      "@CrossOrigin: Fine-grained, declared on controller class or method. Hard to maintain globally across enterprise APIs.",
      "WebMvcConfigurer.addCorsMappings(): Global configuration across URL patterns.",
      "Spring Security conflict: Spring Security filter chain runs BEFORE Spring MVC DispatcherServlet. If Security does not explicitly allow OPTIONS preflight requests or configure cors(), the preflight fails with 401/403.",
      "Proper security fix: http.cors(Customizer.withDefaults()) in SecurityFilterChain, backed by a CorsConfigurationSource bean defining allowed origins, methods, and headers."
    ],
    sample_answer: "CORS can be configured per-controller with @CrossOrigin or globally via WebMvcConfigurer.addCorsMappings(). However, in applications using Spring Security, browser pre-flight OPTIONS requests hit the Security filter chain before Spring MVC is reached. If not configured, Spring Security rejects OPTIONS requests with 401/403. The correct solution is configuring http.cors() in SecurityFilterChain with a dedicated CorsConfigurationSource bean specifying allowed origins, headers, and HTTP methods.",
    follow_up_questions: [
      "What headers does a browser send during an HTTP OPTIONS pre-flight request?",
      "Why is allowCredentials(true) incompatible with allowedOrigins('*')?"
    ],
    estimated_minutes: 10
  });

  addQ({
    id: "spring-boot-14",
    skill_slug: "spring-boot",
    skill_name: "Spring Boot",
    skill_category: "java-backend",
    topic: "Application lifecycle and configuration",
    subtopic: "Spring Boot Docker Layering & Native Images",
    question_title: "How do layered JARs and GraalVM Native Images optimize container deployments in Spring Boot 3?",
    question_prompt: "Explain how Spring Boot's layered JAR feature speeds up Docker container builds. What are GraalVM Native Images (Ahead-of-Time compilation) and their benefits/trade-offs?",
    question_type: "conceptual",
    difficulty: "advanced",
    priority: "medium",
    expected_answer_points: [
      "Layered JARs: Separates fat JAR into 4 layers: dependencies, spring-boot-loader, snapshot-dependencies, and application code.",
      "Docker caching: In Dockerfiles, copying dependencies first and application code last ensures dependency layers are cached when only business code changes, reducing image build/push time from minutes to seconds.",
      "GraalVM Native Image: Compiles Java bytecode directly into a standalone platform-native machine binary via Ahead-Of-Time (AOT) compilation.",
      "Benefits: Instant startup (milliseconds) and tiny memory footprint (tens of MBs).",
      "Trade-offs: Long compilation times, closed-world assumption (reflection, dynamic proxies, and JNI require AOT reachability metadata hints)."
    ],
    sample_answer: "Spring Boot layered JARs split a fat JAR into dependencies, loader, snapshots, and application layers. In a multi-stage Docker build, copying dependencies before application code leverages Docker layer caching so re-building an image only pushes changed application classes. In Spring Boot 3, GraalVM AOT compilation builds standalone native binaries that start in milliseconds with minimal RAM, ideal for serverless or scale-to-zero workloads, at the cost of longer build times and requiring AOT hints for dynamic reflection.",
    follow_up_questions: [
      "How does the Spring AOT engine generate reflection configuration for GraalVM?",
      "Why is dynamic class loading unsupported in GraalVM native images?"
    ],
    estimated_minutes: 12
  });

  // --- SPRING SECURITY (11) ---
  addQ({
    id: "spring-sec-01",
    skill_slug: "spring-security",
    skill_name: "Spring Security",
    skill_category: "java-backend",
    topic: "Security filter chain",
    subtopic: "SecurityFilterChain Architecture",
    question_title: "How does the Spring Security Filter Chain work internally?",
    question_prompt: "Explain DelegatingFilterProxy, FilterChainProxy, SecurityFilterChain, and the sequence of key security filters (SecurityContextPersistenceFilter/SecurityContextHolderFilter, UsernamePasswordAuthenticationFilter, ExceptionTranslationFilter, AuthorizationFilter).",
    question_type: "conceptual",
    difficulty: "advanced",
    priority: "critical",
    expected_answer_points: [
      "DelegatingFilterProxy: Standard Servlet Filter registered in web.xml / servlet container that delegates doFilter calls to a Spring-managed bean named 'springSecurityFilterChain'.",
      "FilterChainProxy: Master filter that contains one or more SecurityFilterChain instances matched by request matchers.",
      "SecurityFilterChain: List of security filters executed in defined order.",
      "SecurityContextHolderFilter: Restores SecurityContext from SecurityContextRepository into SecurityContextHolder.",
      "Authentication filters (e.g. UsernamePasswordAuthenticationFilter, BearerTokenAuthenticationFilter): Extract credentials and invoke AuthenticationManager.",
      "ExceptionTranslationFilter: Catches AuthenticationException (triggers AuthenticationEntryPoint / 401) and AccessDeniedException (triggers AccessDeniedHandler / 403).",
      "AuthorizationFilter (formerly FilterSecurityInterceptor): Enforces authorization rules using AuthorizationManager."
    ],
    sample_answer: "Servlet requests enter DelegatingFilterProxy, which delegates to FilterChainProxy. FilterChainProxy matches the request to a SecurityFilterChain. SecurityContextHolderFilter restores existing authentication. Custom or built-in authentication filters validate credentials and populate SecurityContextHolder. Next, ExceptionTranslationFilter acts as an exception barrier. Finally, AuthorizationFilter checks whether the authenticated user has permissions; if rejected, ExceptionTranslationFilter catches the error and invokes AuthenticationEntryPoint (401) or AccessDeniedHandler (403).",
    follow_up_questions: [
      "Why was SecurityContextPersistenceFilter replaced by SecurityContextHolderFilter in Spring Security 6?",
      "How do you inspect the exact list and order of filters running in your SecurityFilterChain?"
    ],
    estimated_minutes: 15
  });

  addQ({
    id: "spring-sec-02",
    skill_slug: "spring-security",
    skill_name: "Spring Security",
    skill_category: "java-backend",
    topic: "Authentication versus authorization",
    subtopic: "Authentication Architecture",
    question_title: "Explain the roles of AuthenticationManager, AuthenticationProvider, and UserDetailsService.",
    question_prompt: "Walk through how Spring Security processes an authentication attempt: UsernamePasswordAuthenticationToken, AuthenticationManager (ProviderManager), DaoAuthenticationProvider, UserDetailsService, and PasswordEncoder.",
    question_type: "conceptual",
    difficulty: "intermediate",
    priority: "critical",
    expected_answer_points: [
      "Authentication object: Represents the user; holds principal, credentials, authorities, and isAuthenticated boolean.",
      "AuthenticationManager: Primary API for authentication. The standard implementation is ProviderManager.",
      "ProviderManager delegates to a list of AuthenticationProviders: each provider checks if it supports the specific Authentication token type.",
      "DaoAuthenticationProvider: Standard provider that calls UserDetailsService.loadUserByUsername() to fetch stored UserDetails.",
      "PasswordEncoder.matches(): Compares plain-text submitted password against stored BCrypt hash.",
      "If matched, creates a fully authenticated Authentication token (with credentials cleared) stored in SecurityContextHolder."
    ],
    sample_answer: "A login filter constructs an unauthenticated UsernamePasswordAuthenticationToken and passes it to AuthenticationManager (ProviderManager). ProviderManager iterates registered AuthenticationProviders. DaoAuthenticationProvider handles it by calling UserDetailsService.loadUserByUsername() to retrieve user details from the database. It then uses PasswordEncoder.matches() to verify the submitted password against the BCrypt hash. If valid, an authenticated token populated with GrantedAuthorities is returned and stored in SecurityContextHolder.",
    follow_up_questions: [
      "What happens if multiple AuthenticationProviders are configured in ProviderManager?",
      "Why should you never write your own raw password comparison and always use PasswordEncoder.matches()?"
    ],
    estimated_minutes: 12
  });

  addQ({
    id: "spring-sec-03",
    skill_slug: "spring-security",
    skill_name: "Spring Security",
    skill_category: "java-backend",
    topic: "JWT integration",
    subtopic: "Stateless JWT Authentication Filter",
    question_title: "How do you implement a stateless JWT Authentication Filter in Spring Security 6?",
    question_prompt: "Describe building a custom OncePerRequestFilter for JWT validation: extracting the Bearer token, parsing and verifying signature, setting up SecurityContext, and configuring SessionCreationPolicy.STATELESS in SecurityFilterChain.",
    question_type: "coding",
    difficulty: "advanced",
    priority: "critical",
    expected_answer_points: [
      "Create a filter extending OncePerRequestFilter (guarantees execution once per request dispatch).",
      "Extract Authorization header: check for 'Bearer ' prefix.",
      "Validate JWT: verify HMAC or RSA signature, verify expiration date, extract username and roles/claims.",
      "If valid and SecurityContextHolder.getContext().getAuthentication() is null, construct UsernamePasswordAuthenticationToken with principal and authorities.",
      "Set details via WebAuthenticationDetailsSource and update SecurityContextHolder.getContext().setAuthentication(authToken).",
      "FilterChain configuration: http.sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS)) and addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)."
    ],
    sample_answer: "Extend OncePerRequestFilter to intercept requests before UsernamePasswordAuthenticationFilter. Extract the 'Bearer ' token from the Authorization header. Verify the cryptographic signature and expiration with a JWT parser. Extract the username and authorities, construct a UsernamePasswordAuthenticationToken, and store it in SecurityContextHolder. In the SecurityFilterChain bean, set SessionCreationPolicy.STATELESS so Spring Security creates no HTTP sessions, and disable CSRF.",
    follow_up_questions: [
      "Why must CSRF protection be disabled when using pure stateless Bearer JWT authentication?",
      "What happens if the JWT is expired, and how should the filter respond?"
    ],
    estimated_minutes: 15
  });

  addQ({
    id: "spring-sec-04",
    skill_slug: "spring-security",
    skill_name: "Spring Security",
    skill_category: "java-backend",
    topic: "Password encoding and session security",
    subtopic: "BCrypt & Password Storage",
    question_title: "How does BCryptPasswordEncoder work, and why is salt generation built-in?",
    question_prompt: "Explain how BCrypt hashes passwords. What is the salt, what is the work factor (strength), and why does hashing the exact same password twice produce two completely different hash strings?",
    question_type: "conceptual",
    difficulty: "intermediate",
    priority: "high",
    expected_answer_points: [
      "BCrypt is an adaptive cryptographic hash function based on the Blowfish cipher.",
      "Built-in Salt: BCrypt generates a random 16-byte salt for every hash and encodes it directly into the output string ($2a$10$...).",
      "Because each hash uses a fresh random salt, hashing the same password twice yields different strings, defeating rainbow table attacks.",
      "Work factor (cost, default 10): Defines 2^cost hashing rounds. It is computationally expensive by design to resist brute-force hardware/GPU cracking.",
      "PasswordEncoder.matches(raw, hash) extracts the embedded salt from the stored hash, hashes the raw password with that salt, and compares results using constant-time comparison to prevent timing attacks."
    ],
    sample_answer: "BCrypt is an adaptive slow hash designed to thwart GPU brute-force cracking. It generates a unique random 16-byte salt for every password and embeds the algorithm version, work factor (cost), and salt directly inside the resulting string. Because the salt is randomized on each hash, the same password produces different hashes every time. When checking matches(), BCrypt extracts the salt from the stored hash, applies the same rounds to the candidate password, and verifies them in constant time.",
    follow_up_questions: [
      "What is Argon2 and how does it compare with BCrypt?",
      "What is a timing attack and how does MessageDigest.isEqual prevent it?"
    ],
    estimated_minutes: 10
  });

  addQ({
    id: "spring-sec-05",
    skill_slug: "spring-security",
    skill_name: "Spring Security",
    skill_category: "java-backend",
    topic: "Method-level security",
    subtopic: "@PreAuthorize & SpEL Expressions",
    question_title: "How does Method-Level Security work with @PreAuthorize and @EnableMethodSecurity?",
    question_prompt: "Explain @PreAuthorize, @PostAuthorize, @PreFilter, and @PostFilter. How does SpEL allow fine-grained access control such as checking #id against authentication.name?",
    question_type: "coding",
    difficulty: "intermediate",
    priority: "high",
    expected_answer_points: [
      "Enabled via @EnableMethodSecurity (replaces legacy @EnableGlobalMethodSecurity in Spring Security 6).",
      "@PreAuthorize: Evaluates SpEL expression BEFORE method invocation (e.g. @PreAuthorize('hasRole(\"ADMIN\") or #userId == authentication.principal.id')). If false, throws AccessDeniedException without executing method.",
      "@PostAuthorize: Evaluates expression AFTER method completes; can inspect returnObject (e.g. returnObject.owner == authentication.name).",
      "@PreFilter and @PostFilter: Filter collection arguments or returned collections based on ownership rules.",
      "Operates via Spring AOP proxies around annotated service methods."
    ],
    sample_answer: "Annotating a configuration class with @EnableMethodSecurity enables AOP proxies on service methods. @PreAuthorize evaluates a SpEL expression before execution; for example, @PreAuthorize(\"hasRole('ADMIN') or #id == authentication.principal.id\") ensures only administrators or the resource owner can invoke the method. @PostAuthorize checks the returned object (returnObject) after execution, aborting with AccessDeniedException if the rule fails.",
    follow_up_questions: [
      "What is the difference between hasRole('ADMIN') and hasAuthority('ROLE_ADMIN')?",
      "Why doesn't @PreAuthorize work when calling another method within the same service bean?"
    ],
    estimated_minutes: 12
  });

  addQ({
    id: "spring-sec-06",
    skill_slug: "spring-security",
    skill_name: "Spring Security",
    skill_category: "java-backend",
    topic: "CORS and CSRF",
    subtopic: "CSRF Protection Mechanics",
    question_title: "What is Cross-Site Request Forgery (CSRF), and how does Spring Security defend against it?",
    question_prompt: "Explain how CSRF attacks exploit ambient browser credentials (cookies). How does the Synchronizer Token Pattern (CsrfFilter) work, and when is it safe to disable CSRF?",
    question_type: "conceptual",
    difficulty: "intermediate",
    priority: "critical",
    expected_answer_points: [
      "CSRF attack: A malicious site tricks a victim's browser into executing an unwanted action on an authenticated application where the user has an active session cookie (browsers automatically attach session cookies to cross-origin requests).",
      "Defense: Synchronizer Token Pattern. The server generates a random, cryptographically secure token tied to the session. Mutating requests (POST, PUT, DELETE) must provide this token via header (X-XSRF-TOKEN) or hidden form parameter.",
      "CsrfFilter: Validates token on mutating methods; rejects mismatches with 403 Forbidden.",
      "Safe to disable: Only when building stateless REST APIs authenticated purely via Bearer tokens in headers (not stored in cookies), because browsers do not automatically attach Authorization headers across origins."
    ],
    sample_answer: "CSRF occurs when a malicious website tricks a user's browser into submitting requests to another site where the user is logged in, exploiting automatic browser cookie transmission. Spring Security defends against this with CsrfFilter using the Synchronizer Token Pattern: every mutating request must include a random CSRF token generated by the server. CSRF can only be safely disabled in stateless REST APIs where authentication uses custom headers (like Authorization: Bearer) rather than ambient browser session cookies.",
    follow_up_questions: [
      "What is the SameSite cookie attribute (Strict/Lax/None) and does it eliminate the need for CSRF tokens?",
      "How do Single Page Applications (React/Angular) handle CookieCsrfTokenRepository.withHttpOnlyFalse()?"
    ],
    estimated_minutes: 12
  });

  addQ({
    id: "spring-sec-07",
    skill_slug: "spring-security",
    skill_name: "Spring Security",
    skill_category: "java-backend",
    topic: "Authentication versus authorization",
    subtopic: "SecurityContext & ThreadLocal Concurrency",
    question_title: "How is SecurityContext stored, and what happens in multi-threaded asynchronous tasks?",
    question_prompt: "Explain SecurityContextHolder strategy: MODE_THREADLOCAL vs MODE_INHERITABLETHREADLOCAL vs MODE_GLOBAL. How do you propagate security context to @Async methods or custom thread pools?",
    question_type: "conceptual",
    difficulty: "advanced",
    priority: "high",
    expected_answer_points: [
      "Default strategy: SecurityContextHolder.MODE_THREADLOCAL (each thread maintains its own isolated SecurityContext).",
      "Problem: Worker threads created by custom ExecutorService or @Async do not inherit the calling thread's SecurityContext.",
      "MODE_INHERITABLETHREADLOCAL: Automatically copies context to child threads when spawned, but fails in thread-pooling scenarios where threads are reused.",
      "Solution in Spring: DelegatingSecurityContextAsyncTaskExecutor / DelegatingSecurityContextExecutorService wraps executors and propagates context per task.",
      "SecurityContextHolder.clearContext(): Mandatory cleanup in finally blocks to avoid memory leaks or context bleeding in pooled server threads."
    ],
    sample_answer: "SecurityContextHolder defaults to MODE_THREADLOCAL, storing authentication in the current thread. In asynchronous workflows (@Async or thread pools), worker threads do not share this thread-local context. While MODE_INHERITABLETHREADLOCAL copies context to newly spawned threads, it breaks with pooled worker threads. The production solution is wrapping thread pools in DelegatingSecurityContextExecutorService, which captures the caller's SecurityContext and attaches it to the worker thread for the duration of the task.",
    follow_up_questions: [
      "Why must SecurityContextHolder.clearContext() be called when a request completes?",
      "How does DelegatingSecurityContextRunnable propagate credentials?"
    ],
    estimated_minutes: 12
  });

  addQ({
    id: "spring-sec-08",
    skill_slug: "spring-security",
    skill_name: "Spring Security",
    skill_category: "java-backend",
    topic: "JWT integration",
    subtopic: "Refresh Token Rotation & Revocation",
    question_title: "How do you implement secure Refresh Token Rotation and Revocation?",
    question_prompt: "Design a secure token architecture using short-lived Access Tokens and long-lived Refresh Tokens. Explain Refresh Token Rotation and how to detect refresh token reuse attacks.",
    question_type: "practical_scenario",
    difficulty: "advanced",
    priority: "high",
    expected_answer_points: [
      "Access Token: Short lifespan (15 minutes); stateless JWT; used on every API call.",
      "Refresh Token: Longer lifespan (7 days); stored in database with family ID and hashed token value; transmitted in secure httpOnly, SameSite=Strict cookie.",
      "Rotation mechanism: When the client calls /auth/refresh, the server invalidates the used refresh token and issues both a new access token and a brand-new refresh token.",
      "Reuse detection: If a revoked refresh token is presented, it indicates token theft. The server immediately revokes the ENTIRE token family for that user session, forcing re-authentication.",
      "Revocation: Logout deletes the refresh token record from database or marks it revoked in Redis blacklist."
    ],
    sample_answer: "Issue short-lived access tokens (15m) for API calls and long-lived refresh tokens (7d) stored securely in HttpOnly cookies and tracked in a database. With Refresh Token Rotation, each refresh request consumes the old refresh token and issues a new pair. If a client attempts to refresh using an already-consumed token, the system detects a token reuse attack (theft) and immediately revokes all tokens in that user session family, forcing the user to re-login.",
    follow_up_questions: [
      "Where should the refresh token be stored on the client side to prevent XSS attacks?",
      "How do you handle race conditions when two concurrent frontend requests attempt to rotate the same refresh token?"
    ],
    estimated_minutes: 15
  });

  addQ({
    id: "spring-sec-09",
    skill_slug: "spring-security",
    skill_name: "Spring Security",
    skill_category: "java-backend",
    topic: "Security filter chain",
    subtopic: "AuthenticationEntryPoint vs AccessDeniedHandler",
    question_title: "What is the difference between AuthenticationEntryPoint and AccessDeniedHandler?",
    question_prompt: "Explain how Spring Security distinguishes unauthenticated requests (HTTP 401) from unauthorized requests (HTTP 403). How do you customize AuthenticationEntryPoint and AccessDeniedHandler in Spring Security 6?",
    question_type: "coding",
    difficulty: "intermediate",
    priority: "medium",
    expected_answer_points: [
      "AuthenticationEntryPoint handles AuthenticationException (user is NOT logged in or token is invalid/missing). Returns HTTP 401 Unauthorized.",
      "AccessDeniedHandler handles AccessDeniedException (user IS logged in, but lacks required role/authority). Returns HTTP 403 Forbidden.",
      "Both are configured on ExceptionHandlingConfigurer: http.exceptionHandling(e -> e.authenticationEntryPoint(customEntryPoint).accessDeniedHandler(customDeniedHandler)).",
      "Custom implementations write JSON error DTO directly to HttpServletResponse using Jackson ObjectMapper."
    ],
    sample_answer: "AuthenticationEntryPoint is triggered when an unauthenticated user attempts to access a protected resource, returning HTTP 401 Unauthorized (e.g. invalid or missing JWT). AccessDeniedHandler is triggered when an authenticated user attempts an action for which they lack permissions, returning HTTP 403 Forbidden. Both are customized by implementing their respective interfaces and configuring them in http.exceptionHandling() to return clean JSON error payloads.",
    follow_up_questions: [
      "Why doesn't @RestControllerAdvice catch AuthenticationException thrown inside security filters?",
      "How do you delegate security filter exceptions to HandlerExceptionResolver?"
    ],
    estimated_minutes: 10
  });

  addQ({
    id: "spring-sec-10",
    skill_slug: "spring-security",
    skill_name: "Spring Security",
    skill_category: "java-backend",
    topic: "JWT integration",
    subtopic: "OAuth2 Resource Server with JWT",
    question_title: "How do you configure Spring Security as an OAuth2 Resource Server with JWT?",
    question_prompt: "Explain how to configure an application as an OAuth2 Resource Server using spring-boot-starter-oauth2-resource-server and jwk-set-uri. How does JwtAuthenticationConverter map custom claims to GrantedAuthorities?",
    question_type: "conceptual",
    difficulty: "intermediate",
    priority: "high",
    expected_answer_points: [
      "Include dependency: spring-boot-starter-oauth2-resource-server.",
      "Configuration: spring.security.oauth2.resourceserver.jwt.jwk-set-uri=https://auth-server/.well-known/jwks.json.",
      "SecurityFilterChain: http.oauth2ResourceServer(oauth2 -> oauth2.jwt(Customizer.withDefaults())).",
      "Spring automatically verifies incoming bearer tokens against the public keys fetched from the JWKS endpoint.",
      "Custom claims mapping: By default Spring maps 'scope'/'scp' claims to 'SCOPE_' authorities. Custom JwtAuthenticationConverter extracts custom 'roles' claims and prepends 'ROLE_' prefix."
    ],
    sample_answer: "Using spring-boot-starter-oauth2-resource-server, point spring.security.oauth2.resourceserver.jwt.jwk-set-uri to the identity provider's JWKS endpoint (e.g. Keycloak or Auth0). In SecurityFilterChain, call http.oauth2ResourceServer(oauth -> oauth.jwt()). Spring automatically fetches and caches public keys to verify signatures. Use a custom JwtAuthenticationConverter to map specific token claims (such as realm_access.roles) into Spring Security's GrantedAuthority objects with the 'ROLE_' prefix.",
    follow_up_questions: [
      "What is the difference between symmetric (HMAC) and asymmetric (RSA/ECDSA) JWT signing in enterprise architectures?",
      "How does JWKS caching and key rotation work?"
    ],
    estimated_minutes: 12
  });

  addQ({
    id: "spring-sec-11",
    skill_slug: "spring-security",
    skill_name: "Spring Security",
    skill_category: "java-backend",
    topic: "Password encoding and session security",
    subtopic: "Session Fixation & Concurrent Session Control",
    question_title: "How does Spring Security prevent Session Fixation and enforce Concurrent Session Control?",
    question_prompt: "What is a Session Fixation attack? Explain how Spring Security's session fixation protection (changeSessionId) works and how to limit a user to at most 1 active concurrent session.",
    question_type: "conceptual",
    difficulty: "intermediate",
    priority: "medium",
    expected_answer_points: [
      "Session fixation: An attacker acquires a valid session ID, tricks the victim into logging in with that ID, and hijacks the authenticated session.",
      "Protection: Upon successful authentication, Spring creates a new session ID while preserving attributes (sessionManagement.sessionFixation().changeSessionId()).",
      "Concurrent session control: sessionManagement.maximumSessions(1).maxSessionsPreventsLogin(true or false).",
      "Requires registering HttpSessionEventPublisher bean in Spring context so Spring Security tracks session destruction events.",
      "If maxSessionsPreventsLogin=false, the previous session is invalidated (expired); if true, new login attempts are rejected."
    ],
    sample_answer: "Session fixation occurs when an attacker forces a victim to use an attacker-known session ID that becomes authenticated. Spring Security defends against this by calling changeSessionId() upon authentication, issuing a brand-new session identifier while keeping user attributes. To restrict users to one concurrent session, configure maximumSessions(1) and register an HttpSessionEventPublisher bean so Spring tracks active sessions across logins and expirations.",
    follow_up_questions: [
      "Why must HttpSessionEventPublisher be registered in the Spring context for session limits to work?",
      "How do distributed session stores like Spring Session with Redis handle concurrent session tracking?"
    ],
    estimated_minutes: 10
  });

  // --- HIBERNATE AND JPA (12) ---
  addQ({
    id: "hib-01",
    skill_slug: "hibernate-jpa",
    skill_name: "Hibernate and JPA",
    skill_category: "java-backend",
    topic: "Entity lifecycle and persistence context",
    subtopic: "Entity States & Persistence Context",
    question_title: "Explain the four Entity Lifecycle States in JPA: Transient, Persistent, Detached, and Removed.",
    question_prompt: "Walk through the four JPA entity states. What operations transition entities between them (persist, find, merge, remove, detach, clear)? What is the Persistence Context (First-Level Cache)?",
    question_type: "conceptual",
    difficulty: "intermediate",
    priority: "critical",
    expected_answer_points: [
      "1. Transient (New): Instantiated with 'new'; has no database identifier (@Id) and is not associated with any persistence context.",
      "2. Persistent (Managed): Associated with an active Persistence Context and has a database identity. Any field changes are automatically tracked (Dirty Checking) and synchronized on flush.",
      "3. Detached: Has a database identity, but its Persistence Context closed or it was detached via em.detach() or em.clear(). Field modifications are not tracked unless merged.",
      "4. Removed: Scheduled for deletion; DELETE statement will execute on flush.",
      "Persistence Context acts as First-Level Cache: guarantees repeatable reads of entity instances within a transaction."
    ],
    sample_answer: "JPA entities have 4 states: Transient (newly created in memory, not in DB or session), Persistent/Managed (tracked by the Persistence Context with a DB ID, where changes trigger automatic dirty checking), Detached (previously managed but the session closed; changes are untracked), and Removed (marked for SQL DELETE on transaction flush). Transitions occur via persist() [Transient->Managed], detach()/clear() [Managed->Detached], merge() [Detached->Managed], and remove() [Managed->Removed].",
    follow_up_questions: [
      "What is the difference between em.persist() and em.merge()?",
      "Why doesn't calling a setter on a Managed entity require an explicit repository.save() call?"
    ],
    estimated_minutes: 12
  });

  addQ({
    id: "hib-02",
    skill_slug: "hibernate-jpa",
    skill_name: "Hibernate and JPA",
    skill_category: "java-backend",
    topic: "N+1 query problem",
    subtopic: "N+1 Problem & Resolution Strategies",
    question_title: "What is the N+1 Query Problem in Hibernate, and what are 4 ways to resolve it?",
    question_prompt: "Explain how the N+1 query problem occurs with @OneToMany and @ManyToOne relationships. Detail 4 distinct solutions: JOIN FETCH, @EntityGraph, Batch Size (@BatchSize), and DTO projections.",
    question_type: "practical_scenario",
    difficulty: "intermediate",
    priority: "critical",
    expected_answer_points: [
      "Occurrence: Loading N parent entities causes 1 query for parents, then accessing a lazy association on each triggers N additional queries, resulting in 1 + N total queries.",
      "Solution 1: JOIN FETCH in JPQL (SELECT p FROM Parent p JOIN FETCH p.children) loads parents and children in a single SQL query.",
      "Solution 2: @EntityGraph(attributePaths = {'children'}) dynamically specifies fetch graphs without modifying JPQL.",
      "Solution 3: @BatchSize(size = 50) or default_batch_fetch_size: Hibernate batches lazy queries using SQL IN (...), reducing N queries to N/50.",
      "Solution 4: DTO projection: Select only required fields directly into a constructor expression (new com.dto.OrderSummary(...)), bypassing entity loading entirely."
    ],
    sample_answer: "The N+1 problem occurs when fetching a collection of N parent entities triggers 1 initial query, and traversing a lazy association on each child generates N additional SQL queries (1+N total). Solutions include: 1) JPQL JOIN FETCH to join and fetch relations in a single query; 2) @EntityGraph to override fetching dynamically; 3) @BatchSize or default_batch_fetch_size to load lazy relationships in batches using SQL WHERE IN (...); and 4) Constructor DTO projections to select only necessary columns directly.",
    follow_up_questions: [
      "Why does using JOIN FETCH with multiple @OneToMany child collections cause MultipleBagFetchException?",
      "How does pagination behave when combined with JOIN FETCH on a @OneToMany relationship?"
    ],
    estimated_minutes: 15
  });

  addQ({
    id: "hib-03",
    skill_slug: "hibernate-jpa",
    skill_name: "Hibernate and JPA",
    skill_category: "java-backend",
    topic: "Lazy versus eager loading",
    subtopic: "Lazy Loading & LazyInitializationException",
    question_title: "Why does LazyInitializationException happen, and how do you prevent it?",
    question_prompt: "Explain how Hibernate implements lazy loading using CGLIB/ByteBuddy dynamic proxies. What causes LazyInitializationException: 'could not initialize proxy - no Session', and why is Open Session in View (OSIV) an anti-pattern?",
    question_type: "conceptual",
    difficulty: "intermediate",
    priority: "critical",
    expected_answer_points: [
      "Hibernate creates dynamic bytecode proxies for lazy associations.",
      "The proxy intercepts getter calls and queries the database using the active Persistence Context / Session.",
      "If the transaction / Session commits and closes in the service layer, accessing an uninitialized lazy property in the controller or serialization layer throws LazyInitializationException.",
      "Why Open Session in View (OSIV) is bad: It keeps database connections held open through the entire HTTP request rendering phase, exhausting connection pools and hiding N+1 queries.",
      "Proper fix: Fetch required relationships within the transactional boundary using JOIN FETCH, @EntityGraph, or DTO projections."
    ],
    sample_answer: "Lazy relationships are represented by Hibernate proxies. When a getter is called outside an active transaction (such as in a controller or Jackson serializer after the service method returned), the session is already closed and Hibernate throws LazyInitializationException. Open Session in View (OSIV) keeps the DB connection open across the entire web request, which masks lazy queries and starves connection pools. The proper solution is fetching required data inside the service transaction using JOIN FETCH or DTO projections.",
    follow_up_questions: [
      "Why is FetchType.EAGER considered an anti-pattern for @ManyToOne and @OneToMany mappings?",
      "What property disables Open Session in View in Spring Boot?"
    ],
    estimated_minutes: 12
  });

  addQ({
    id: "hib-04",
    skill_slug: "hibernate-jpa",
    skill_name: "Hibernate and JPA",
    skill_category: "java-backend",
    topic: "Transactions and propagation",
    subtopic: "@Transactional & Propagation Types",
    question_title: "Explain @Transactional: Propagation levels, rollback rules, and readOnly optimization.",
    question_prompt: "Compare REQUIRED, REQUIRES_NEW, and NESTED transaction propagation. Why does @Transactional not roll back by default on checked exceptions, and what does readOnly = true do at the JDBC/Hibernate level?",
    question_type: "conceptual",
    difficulty: "advanced",
    priority: "critical",
    expected_answer_points: [
      "REQUIRED (default): Joins existing transaction or creates a new one if none exists.",
      "REQUIRES_NEW: Suspends existing transaction and starts an independent physical transaction. Errors in the new transaction do not roll back the outer transaction if caught.",
      "NESTED: Executes within a nested transaction using database savepoints.",
      "Rollback rule: By default, Spring rolls back ONLY on unchecked exceptions (RuntimeException and Error). To roll back on checked exceptions, declare @Transactional(rollbackFor = Exception.class).",
      "readOnly = true: Sets FlushMode.MANUAL in Hibernate (disables dirty checking, saving CPU and memory) and sets connection read-only on JDBC driver."
    ],
    sample_answer: "Propagation defines transactional boundaries: REQUIRED joins an active transaction or creates one; REQUIRES_NEW suspends the current transaction to run an independent transaction (useful for audit logging). By default, Spring only rolls back on RuntimeException; checked exceptions must be explicitly specified with rollbackFor = Exception.class. Setting readOnly = true optimizes performance by disabling Hibernate dirty checking and allowing read-replica database routing.",
    follow_up_questions: [
      "What happens if a method annotated with @Transactional(propagation = REQUIRES_NEW) is called from another method within the same bean?",
      "What is the difference between NESTED propagation and REQUIRES_NEW?"
    ],
    estimated_minutes: 15
  });

  addQ({
    id: "hib-05",
    skill_slug: "hibernate-jpa",
    skill_name: "Hibernate and JPA",
    skill_category: "java-backend",
    topic: "Optimistic and pessimistic locking",
    subtopic: "Optimistic vs Pessimistic Locking",
    question_title: "Compare Optimistic Locking and Pessimistic Locking in JPA with real-world scenarios.",
    question_prompt: "When should you use @Version (Optimistic Locking) vs LockModeType.PESSIMISTIC_WRITE (Pessimistic Locking)? What SQL is generated, and how do you handle OptimisticLockException?",
    question_type: "practical_scenario",
    difficulty: "intermediate",
    priority: "critical",
    expected_answer_points: [
      "Optimistic Locking: Assumes low conflict. Uses a @Version column (integer or timestamp). SQL: UPDATE tbl SET ..., version = version + 1 WHERE id = ? AND version = ?.",
      "If rows updated is 0 (someone else modified it first), JPA throws OptimisticLockException. Best for read-heavy workflows; handle by retrying transaction.",
      "Pessimistic Locking: Assumes high contention. Uses database-level row locks: SELECT ... FOR UPDATE (LockModeType.PESSIMISTIC_WRITE).",
      "Blocks concurrent transactions until the current transaction commits or rolls back.",
      "Best for critical financial debits or inventory reservations with high concurrent updates, but risks database deadlocks if not ordered carefully."
    ],
    sample_answer: "Optimistic locking (@Version) does not lock database rows; on update, it verifies that the version in the DB matches the version read into memory. If another transaction updated the row in between, it throws OptimisticLockException, which can be retried. It is best for low-contention web apps. Pessimistic locking (LockModeType.PESSIMISTIC_WRITE) issues SELECT ... FOR UPDATE, acquiring a physical row lock in the database. It prevents race conditions during high-contention operations like banking debits, but reduces concurrency.",
    follow_up_questions: [
      "What is the difference between PESSIMISTIC_READ and PESSIMISTIC_WRITE?",
      "How do you configure a lock timeout for pessimistic queries to avoid hanging transactions?"
    ],
    estimated_minutes: 15
  });

  addQ({
    id: "hib-06",
    skill_slug: "hibernate-jpa",
    skill_name: "Hibernate and JPA",
    skill_category: "java-backend",
    topic: "Entity relationships and mappings",
    subtopic: "Bidirectional @OneToMany & mappedBy",
    question_title: "How do you properly map a bidirectional @OneToMany / @ManyToOne relationship in JPA?",
    question_prompt: "Explain the role of mappedBy, cascade types (CascadeType.ALL), orphanRemoval = true, and helper synchronization methods (addChild/removeChild). Why is @ManyToOne the owning side?",
    question_type: "coding",
    difficulty: "intermediate",
    priority: "critical",
    expected_answer_points: [
      "The side containing the foreign key in the database table is ALWAYS the owning side (@ManyToOne).",
      "mappedBy belongs on the inverse side (@OneToMany) and references the field name on the owning entity.",
      "CascadeType.ALL propagates persistence operations (persist, merge, remove) from parent to children.",
      "orphanRemoval = true: Deleting a child from the parent's collection issues a DELETE statement for that child in the DB.",
      "Helper methods: Must synchronize both sides in memory (e.g. this.items.add(item); item.setOrder(this);) to avoid inconsistent cache states."
    ],
    sample_answer: "The @ManyToOne entity holds the foreign key and is the owning side. The @OneToMany side is the inverse side and must declare mappedBy pointing to the parent field. Use CascadeType.ALL to propagate lifecycle events and orphanRemoval = true to delete children removed from the parent list. Always write defensive helper methods on the parent entity (addChild/removeChild) to set both sides of the relationship in memory, preventing inconsistent persistence states.",
    follow_up_questions: [
      "What happens if you omit mappedBy on a @OneToMany relationship?",
      "Why should you avoid using @ManyToMany with CascadeType.REMOVE?"
    ],
    estimated_minutes: 12
  });

  addQ({
    id: "hib-07",
    skill_slug: "hibernate-jpa",
    skill_name: "Hibernate and JPA",
    skill_category: "java-backend",
    topic: "Entity lifecycle and persistence context",
    subtopic: "Dirty Checking & Session Flush",
    question_title: "How does Hibernate Dirty Checking work, and when is the Session flushed?",
    question_prompt: "Explain how Hibernate tracks entity changes between snapshot copies. What triggers a session flush (commit, query execution, explicit flush), and what is the difference between flush() and commit()?",
    question_type: "conceptual",
    difficulty: "intermediate",
    priority: "high",
    expected_answer_points: [
      "Snapshot creation: When an entity is loaded into the Persistence Context, Hibernate creates a deep-copy snapshot of its state.",
      "Dirty checking: During flush, Hibernate compares the current state of managed entities against their snapshot. If different, it generates an UPDATE SQL statement.",
      "Flush triggers: 1) Transaction commit; 2) Before executing a JPQL/native query that accesses the table (FlushModeType.AUTO); 3) Explicit em.flush().",
      "Flush vs Commit: flush() synchronizes in-memory SQL statements to the database transaction log, but does NOT commit. commit() flushes and makes changes permanent and visible to other transactions."
    ],
    sample_answer: "When an entity becomes managed, Hibernate saves a snapshot of its fields. At flush time, it compares each managed entity against its snapshot. If fields changed, Hibernate automatically issues SQL UPDATE statements without needing repository.save(). Flushing synchronizes SQL to the database connection buffer and occurs before queries (FlushModeType.AUTO) or at transaction commit. Unlike commit(), a flush can still be rolled back.",
    follow_up_questions: [
      "How does bytecode enhancement optimize dirty checking in large entities?",
      "Why does executing a native SQL query trigger a flush of all pending entity changes?"
    ],
    estimated_minutes: 12
  });

  addQ({
    id: "hib-08",
    skill_slug: "hibernate-jpa",
    skill_name: "Hibernate and JPA",
    skill_category: "java-backend",
    topic: "JPQL, native queries and pagination",
    subtopic: "JPQL vs Criteria API vs Native Queries",
    question_title: "Compare JPQL, Spring Data Specifications (Criteria API), and Native SQL queries.",
    question_prompt: "When should you use JPQL vs Criteria API / Specifications vs Native SQL? Discuss portability, type safety, dynamic filtering, and database-specific feature utilization.",
    question_type: "conceptual",
    difficulty: "intermediate",
    priority: "high",
    expected_answer_points: [
      "JPQL (Java Persistence Query Language): Operates on entity objects and relationships rather than database tables. Portable across databases. Checked at application startup.",
      "Criteria API / Specifications: Programmatic, type-safe query construction. Best for dynamic search filters (e.g. e-commerce search with optional price, category, rating).",
      "Native SQL: Raw SQL executed directly on DB (@Query(value = '...', nativeQuery = true)). Best for database-specific optimizations, window functions, CTEs, or bulk updates.",
      "Native query drawback: Couples application to a specific database engine and does not support automatic pagination counting in complex joins without countQuery."
    ],
    sample_answer: "JPQL queries entity objects rather than tables, making queries database-agnostic. Spring Data Specifications (built on Criteria API) provide type-safe dynamic query building, ideal for multi-criteria search forms with optional filters. Native SQL is reserved for database-specific features like recursive CTEs, window functions, or specialized performance indexing, but sacrifices database portability and entity lifecycle management.",
    follow_up_questions: [
      "Why must you specify a separate countQuery in Spring Data when using native queries with Pageable?",
      "What is the difference between Class-based DTO projections and Interface-based projections in Spring Data JPA?"
    ],
    estimated_minutes: 12
  });

  addQ({
    id: "hib-09",
    skill_slug: "hibernate-jpa",
    skill_name: "Hibernate and JPA",
    skill_category: "java-backend",
    topic: "Entity lifecycle and persistence context",
    subtopic: "First-Level vs Second-Level Cache",
    question_title: "Explain First-Level Cache and Second-Level Cache in Hibernate.",
    question_prompt: "Compare Session-scoped First-Level Cache and SessionFactory-scoped Second-Level Cache (Ehcache, Redis, Hazelcast). How does query caching work, and what are cache invalidation risks?",
    question_type: "conceptual",
    difficulty: "advanced",
    priority: "high",
    expected_answer_points: [
      "First-Level Cache: Bound to the active Session/EntityManager. Mandatory and cannot be disabled. Guarantees that multiple find() calls for the same ID in one transaction return the same Java reference.",
      "Second-Level Cache (L2C): Bound to SessionFactory / ApplicationContext. Shared across all sessions and transactions. Pluggable (Ehcache, Infinispan, Redis).",
      "Entity caching vs Query caching: L2C stores entity state dehydrated as arrays. Query cache stores query parameter keys and resulting entity ID lists.",
      "Invalidation: Frequent updates to a cached table invalidate the query cache, causing performance degradation.",
      "Best for: Static or read-mostly master data (e.g. countries, product categories, tax rates)."
    ],
    sample_answer: "The First-Level Cache is session-scoped, mandatory, and caches managed entities within a single transaction. The Second-Level Cache is shared across all sessions and survives transactions, using distributed providers like Redis or Ehcache. It caches read-heavy, rarely-changing reference data (like country codes). Query caching stores lists of entity IDs matching specific query parameters, but must be used cautiously because any write to the underlying table invalidates cached query results.",
    follow_up_questions: [
      "What are the concurrency strategies available for Hibernate Second-Level Cache (read-only, read-write, nonstrict-read-write, transactional)?",
      "Why is caching volatile write-heavy entities in L2C an anti-pattern?"
    ],
    estimated_minutes: 12
  });

  addQ({
    id: "hib-10",
    skill_slug: "hibernate-jpa",
    skill_name: "Hibernate and JPA",
    skill_category: "java-backend",
    topic: "Entity relationships and mappings",
    subtopic: "equals and hashCode in JPA Entities",
    question_title: "How should equals() and hashCode() be implemented on JPA Entities?",
    question_prompt: "Why is using database generated ID (@GeneratedValue) or IDE default field generation inside equals/hashCode dangerous for JPA entities? What is the recommended business key approach?",
    question_type: "conceptual",
    difficulty: "advanced",
    priority: "critical",
    expected_answer_points: [
      "Problem with @Id: Before persist(), the ID is null. If an entity is added to a HashSet while transient (hashCode calculated from null ID), and then persisted, its ID changes. hashSet.contains(entity) will return false!",
      "Problem with getter/field access: Hibernate proxies return null when accessing private fields directly; getters must be used (getId() instead of this.id).",
      "Problem with getClass(): Hibernate proxies use subclasses (Entity$HibernateProxy$xyz). equals() must check 'other instanceof MyEntity' rather than getClass() == other.getClass().",
      "Best practice: Use a unique natural business key (e.g. UUID, email, ISBN) if available. If none exists, return a constant hashCode (e.g. return getClass().hashCode()) and compare IDs in equals() only if both are non-null."
    ],
    sample_answer: "Using a generated @Id in equals/hashCode is dangerous because before persisting, the ID is null. If inserted into a HashSet while transient, its hash code changes upon persistence, corrupting the Set. Furthermore, comparing fields directly fails on Hibernate proxies because uninitialized proxy fields are null (getters must be used), and checking getClass() fails against proxy subclasses. The best approach is using a natural business key (like UUID), or using instanceof with getter comparisons.",
    follow_up_questions: [
      "Why does returning a constant hashCode (e.g. return 31) for an entity satisfy the hash contract while avoiding ID mutation bugs?",
      "Why should collections (e.g. items in Order) never be included in an entity's equals() or hashCode()?"
    ],
    estimated_minutes: 12
  });

  addQ({
    id: "hib-11",
    skill_slug: "hibernate-jpa",
    skill_name: "Hibernate and JPA",
    skill_category: "java-backend",
    topic: "Entity relationships and mappings",
    subtopic: "Inheritance Mapping Strategies",
    question_title: "Compare JPA Inheritance Strategies: SINGLE_TABLE, JOINED, and TABLE_PER_CLASS.",
    question_prompt: "Explain the trade-offs of SINGLE_TABLE, JOINED, and TABLE_PER_CLASS. Which provides the best query performance, which enforces NOT NULL constraints, and which uses a discriminator column (@DiscriminatorColumn)?",
    question_type: "conceptual",
    difficulty: "intermediate",
    priority: "medium",
    expected_answer_points: [
      "SINGLE_TABLE (default): All classes in hierarchy mapped to 1 table with a @DiscriminatorColumn. Fastest queries (no joins required), but subclass columns must be nullable (cannot enforce NOT NULL at DB level).",
      "JOINED: Base class and each subclass have their own tables; subclass table holds only specific fields + foreign key to base table. Enforces NOT NULL constraints and normalization, but polymorphic queries require expensive multi-table SQL JOINs.",
      "TABLE_PER_CLASS: Each concrete subclass has its own independent table containing all base and subclass fields. Eliminates joins for single subclass queries, but polymorphic queries (SELECT from Base) require slow SQL UNIONs."
    ],
    sample_answer: "SINGLE_TABLE maps the entire inheritance hierarchy to a single table with a discriminator column. It gives the fastest polymorphic queries (zero joins) but cannot enforce database-level NOT NULL constraints on subclass columns. JOINED normalizes data into separate tables linked by foreign keys, supporting NOT NULL constraints, but requires SQL JOINs on polymorphic queries. TABLE_PER_CLASS duplicates base columns into separate tables per subclass, requiring expensive SQL UNIONs for polymorphic queries.",
    follow_up_questions: [
      "What is @MappedSuperclass and how does it differ from JPA entity inheritance?",
      "When is @DiscriminatorValue needed in SINGLE_TABLE and JOINED inheritance?"
    ],
    estimated_minutes: 10
  });

  addQ({
    id: "hib-12",
    skill_slug: "hibernate-jpa",
    skill_name: "Hibernate and JPA",
    skill_category: "java-backend",
    topic: "JPQL, native queries and pagination",
    subtopic: "Bulk Updates & Persistence Context Invalidation",
    question_title: "How do bulk updates with @Modifying affect the JPA Persistence Context?",
    question_prompt: "Why must @Modifying accompany UPDATE/DELETE JPQL queries? What happens to entities already in the First-Level Cache when a bulk update runs, and why is clearAutomatically = true needed?",
    question_type: "coding",
    difficulty: "intermediate",
    priority: "high",
    expected_answer_points: [
      "@Modifying instructs Spring Data that the @Query is a DML write statement (executeNonQuery) rather than a SELECT.",
      "Bypasses Persistence Context: Bulk UPDATE/DELETE queries translate directly into SQL executed on the database, completely bypassing Hibernate's First-Level Cache and dirty checking.",
      "Stale Data Risk: Entities already loaded into the current EntityManager retain their pre-update values in memory.",
      "clearAutomatically = true: Automatically clears the persistence context (em.clear()) after executing the bulk query, ensuring subsequent queries reload fresh state from the DB.",
      "flushAutomatically = true: Flushes any pending entity modifications before executing the bulk query."
    ],
    sample_answer: "@Modifying tells Spring Data that a JPQL query is an UPDATE or DELETE statement. Because bulk queries execute directly against the database, they bypass the Persistence Context. If entities were already loaded in memory, they become stale. Setting @Modifying(clearAutomatically = true) forces Hibernate to clear the first-level cache immediately after the update so subsequent operations fetch updated values from the database.",
    follow_up_questions: [
      "What happens if you omit @Modifying on an @Query with an UPDATE statement?",
      "Why don't bulk updates trigger entity lifecycle callbacks (@PreUpdate, @PostUpdate)?"
    ],
    estimated_minutes: 10
  });

  // --- MICROSERVICES (11) ---
  addQ({
    id: "micro-01",
    skill_slug: "microservices",
    skill_name: "Microservices",
    skill_category: "java-backend",
    topic: "Distributed transactions and eventual consistency",
    subtopic: "Saga Pattern: Choreography vs Orchestration",
    question_title: "How do you handle Distributed Transactions in Microservices using the Saga Pattern?",
    question_prompt: "Why is Two-Phase Commit (2PC) unsuitable for distributed microservices? Compare Choreography-based Sagas and Orchestration-based Sagas, and explain how compensating transactions handle failures.",
    question_type: "conceptual",
    difficulty: "advanced",
    priority: "critical",
    expected_answer_points: [
      "Why not 2PC: Two-Phase Commit is blocking, creates tight coupling, and suffers from single coordinator failure and poor latency across network boundaries (violates CAP availability).",
      "Saga Pattern: A sequence of local database transactions where each service updates its own database and publishes an event/message triggering the next step.",
      "Compensating Transactions: If a step fails, the saga executes backward compensating transactions to undo preceding changes (eventual consistency).",
      "Choreography: Services listen to domain events and decide when to act (decentralized, good for simple flows; hard to trace as complexity grows).",
      "Orchestration: A central Saga Orchestrator tells participants what local transactions to execute (centralized, easy to monitor, handles complex state machines)."
    ],
    sample_answer: "Two-Phase Commit is a blocking coordinator protocol that reduces availability and throughput across distributed systems. The Saga pattern breaks distributed transactions into a sequence of local ACID transactions. If a step fails (e.g. payment rejected), the Saga triggers compensating transactions in reverse order to semantically undo earlier actions (e.g. un-reserving inventory). In Choreography, services react to Kafka events independently; in Orchestration, a dedicated coordinator (like Temporal or Camunda) manages the state machine.",
    follow_up_questions: [
      "What is the difference between a compensating transaction and a database rollback?",
      "How do you handle a failure inside a compensating transaction itself?"
    ],
    estimated_minutes: 15
  });

  addQ({
    id: "micro-02",
    skill_slug: "microservices",
    skill_name: "Microservices",
    skill_category: "java-backend",
    topic: "Resilience, retries and circuit breakers",
    subtopic: "Circuit Breaker Pattern with Resilience4j",
    question_title: "How does the Circuit Breaker Pattern work with Resilience4j?",
    question_prompt: "Explain the three states of a Circuit Breaker: CLOSED, OPEN, and HALF-OPEN. How do sliding window metrics, failure rate thresholds, wait duration in open state, and fallback mechanisms prevent cascading failures?",
    question_type: "conceptual",
    difficulty: "intermediate",
    priority: "critical",
    expected_answer_points: [
      "Problem: A slow or failing downstream service causes thread exhaustion across calling services, leading to cascading failures throughout the system.",
      "CLOSED state: Normal operation; requests pass through. Tracks failure rate in a sliding window (count-based or time-based).",
      "OPEN state: When failure rate exceeds threshold (e.g. > 50%), the circuit trips OPEN. All calls immediately fail-fast or execute fallbacks without calling the downstream service.",
      "HALF-OPEN state: After waitDurationInOpenState expires, circuit enters HALF-OPEN. It permits a limited number of trial calls; if they succeed, it returns to CLOSED; if any fail, it trips back to OPEN.",
      "Fallback method: Returns cached data, default values, or queues the action for background retry."
    ],
    sample_answer: "A circuit breaker prevents cascading failures by stopping calls to failing downstream services. In CLOSED state, requests flow normally while monitoring failure rates. If failures exceed the threshold (e.g. 50%), the circuit flips to OPEN, immediately short-circuiting calls to fallback methods and saving threads. After a configured wait duration, it enters HALF-OPEN to send probe requests: if healthy, it resets to CLOSED; if failures persist, it re-opens.",
    follow_up_questions: [
      "What is the difference between a count-based sliding window and a time-based sliding window in Resilience4j?",
      "Why must fallback methods have the exact same method signature plus an additional Throwable parameter?"
    ],
    estimated_minutes: 15
  });

  addQ({
    id: "micro-03",
    skill_slug: "microservices",
    skill_name: "Microservices",
    skill_category: "java-backend",
    topic: "API gateway and service discovery",
    subtopic: "API Gateway Responsibilities",
    question_title: "What are the core responsibilities of an API Gateway (Spring Cloud Gateway)?",
    question_prompt: "Explain the role of an API Gateway in microservices architectures: Routing, SSL termination, Authentication/Authorization, Rate Limiting (Token Bucket with Redis), Request/Response transformation, and Cross-Cutting Metrics.",
    question_type: "conceptual",
    difficulty: "intermediate",
    priority: "critical",
    expected_answer_points: [
      "Single entry point for all external clients, insulating internal service topologies.",
      "Routing & Load Balancing: Dynamically routes incoming requests to downstream microservice instances.",
      "Authentication & Token Validation: Centralizes JWT verification at the edge so internal services can trust authenticated claims.",
      "Rate Limiting: Uses Redis-backed Token Bucket algorithm (RequestRateLimiter) to protect backends from DDoS and abuse.",
      "Cross-cutting concerns: SSL termination, CORS handling, unified access logging, and tracing header injection.",
      "Spring Cloud Gateway uses reactive Netty and non-blocking filters (GatewayFilter, GlobalFilter)."
    ],
    sample_answer: "An API Gateway acts as the single reverse-proxy entry point for client applications. It centralizes edge concerns: validating authentication tokens (JWT), routing requests to internal services, terminating SSL, enforcing rate limits via Redis token-bucket filters, and providing observability. By handling cross-cutting concerns at the gateway, downstream microservices can focus purely on domain business logic without duplicating boilerplate security and CORS checks.",
    follow_up_questions: [
      "Why did Spring Cloud Gateway replace Netflix Zuul 1.x (blocking I/O vs non-blocking Netty)?",
      "What is the 'Backends for Frontends' (BFF) pattern?"
    ],
    estimated_minutes: 12
  });

  addQ({
    id: "micro-04",
    skill_slug: "microservices",
    skill_name: "Microservices",
    skill_category: "java-backend",
    topic: "API gateway and service discovery",
    subtopic: "Service Discovery: Eureka vs Kubernetes DNS",
    question_title: "Compare Eureka Service Discovery with Kubernetes Native DNS Discovery.",
    question_prompt: "Explain how client-side load balancing with Eureka and Spring Cloud LoadBalancer works. Why are teams moving away from Eureka in favor of Kubernetes Services and CoreDNS?",
    question_type: "conceptual",
    difficulty: "intermediate",
    priority: "high",
    expected_answer_points: [
      "Eureka: Application-level registry. Microservices register host/port with Eureka server via periodic heartbeats. Clients fetch the registry and use Spring Cloud LoadBalancer to select an instance.",
      "Kubernetes DNS: Platform-level discovery. Every Kubernetes Service receives a stable DNS name (e.g. order-service.default.svc.cluster.local) and ClusterIP. Kube-proxy / iptables handle load balancing to healthy pods.",
      "Why K8s is preferred: Language-agnostic, built into the container orchestrator, eliminates maintaining dedicated Eureka server clusters, and handles liveness/readiness probes natively."
    ],
    sample_answer: "Eureka is an application-level service registry where microservices self-register and clients query Eureka to perform client-side load balancing. In containerized environments, Kubernetes native DNS replaces Eureka: Kubernetes assigns a stable internal DNS name and virtual IP to each Service, and kube-proxy handles load balancing transparently to healthy pods. This eliminates managing separate Eureka infrastructure and works across any programming language.",
    follow_up_questions: [
      "What is Eureka Self-Preservation Mode and when does it trigger?",
      "How does client-side load balancing compare with server-side load balancing?"
    ],
    estimated_minutes: 12
  });

  addQ({
    id: "micro-05",
    skill_slug: "microservices",
    skill_name: "Microservices",
    skill_category: "java-backend",
    topic: "Distributed transactions and eventual consistency",
    subtopic: "Transactional Outbox Pattern",
    question_title: "How does the Transactional Outbox Pattern solve dual-write data inconsistencies?",
    question_prompt: "What is the dual-write problem when updating a database and publishing an event to Kafka in the same HTTP request? How does the Transactional Outbox pattern with Debezium (CDC) solve it?",
    question_type: "practical_scenario",
    difficulty: "advanced",
    priority: "critical",
    expected_answer_points: [
      "Dual-write problem: If a service saves an entity to SQL DB and publishes to Kafka, one can succeed while the other fails (e.g. DB commits but Kafka network drops, or Kafka succeeds but DB transaction rolls back).",
      "Transactional Outbox solution: Write the business entity AND an outbox message record into the SAME relational database within a SINGLE local ACID transaction.",
      "Message relay: A separate process reads the outbox table and publishes events to Kafka.",
      "Debezium / CDC (Change Data Capture): Tails the database transaction log (Postgres WAL or MySQL binlog) and publishes outbox rows to Kafka with zero polling overhead and exactly-once delivery guarantees at DB level."
    ],
    sample_answer: "The dual-write problem occurs when updating a database and publishing to a message broker in the same action: network failures can cause the DB to commit while Kafka fails (or vice versa), leading to data inconsistency. The Transactional Outbox pattern solves this by writing the event into an 'outbox' table in the same local ACID transaction as the business entity. A Change Data Capture (CDC) tool like Debezium streams outbox table changes from the database commit log directly into Kafka reliably.",
    follow_up_questions: [
      "What is the difference between polling publisher and transaction log tailing for the Outbox pattern?",
      "How do downstream consumers guarantee idempotent processing of outbox events?"
    ],
    estimated_minutes: 15
  });

  addQ({
    id: "micro-06",
    skill_slug: "microservices",
    skill_name: "Microservices",
    skill_category: "java-backend",
    topic: "Inter-service communication",
    subtopic: "Synchronous vs Asynchronous Communication",
    question_title: "Compare Synchronous REST/gRPC vs Asynchronous Event-Driven Communication in Microservices.",
    question_prompt: "When should microservices communicate synchronously via REST/OpenFeign or gRPC versus asynchronously via message brokers (Kafka/RabbitMQ)? Discuss coupling, latency, availability, and failure isolation.",
    question_type: "conceptual",
    difficulty: "intermediate",
    priority: "high",
    expected_answer_points: [
      "Synchronous (REST/gRPC): Immediate response needed (e.g. querying current user profile or checking live fraud risk). Drawbacks: temporal coupling, cascading latency, decreased system availability (availability = A_1 * A_2 * A_3).",
      "gRPC advantages over REST: Protocol Buffers binary serialization (smaller payloads, faster parsing), HTTP/2 multiplexing, strongly-typed contract.",
      "Asynchronous (Kafka/RabbitMQ): Fire-and-forget or event notification (e.g. OrderCreated, SendNotification). Benefits: temporal decoupling, producer does not block on consumer availability, natural load leveling/buffering.",
      "Best practice: Use synchronous for immediate read queries; use asynchronous event-driven for mutations and cross-service state propagation."
    ],
    sample_answer: "Synchronous communication (REST, gRPC) is suitable when the caller requires immediate data to proceed. However, it creates temporal coupling and reduces availability because failure in any downstream service immediately impacts the caller. Asynchronous event-driven communication (Kafka, RabbitMQ) decouples services: producers publish events and continue immediately without waiting for consumers, providing resilience against downstream outages and smoothing traffic spikes.",
    follow_up_questions: [
      "How does HTTP/2 multiplexing in gRPC overcome HTTP/1.1 head-of-line blocking?",
      "What is the Request-Reply pattern over asynchronous message brokers?"
    ],
    estimated_minutes: 12
  });

  addQ({
    id: "micro-07",
    skill_slug: "microservices",
    skill_name: "Microservices",
    skill_category: "java-backend",
    topic: "Distributed transactions and eventual consistency",
    subtopic: "CQRS Pattern & Read Projections",
    question_title: "Explain the CQRS (Command Query Responsibility Segregation) pattern.",
    question_prompt: "Why separate write models (Commands) from read models (Queries) in microservices? How are read models kept up to date using event sourcing or domain events, and what is eventual consistency lag?",
    question_type: "conceptual",
    difficulty: "advanced",
    priority: "high",
    expected_answer_points: [
      "CQRS separates data mutation operations (Commands) from data retrieval operations (Queries) into distinct models.",
      "Problem solved: Relational schemas optimized for normalized transactional writes (3NF) perform poorly for complex multi-table joins and reporting queries.",
      "Architecture: Write model updates the write DB (e.g. PostgreSQL). Domain events are published to Kafka. Event consumers update read-optimized materialized views (e.g. Elasticsearch for full-text search, Redis for caching, MongoDB for denormalized documents).",
      "Trade-off: Eventual consistency — there is a brief replication lag between command acceptance and read model update."
    ],
    sample_answer: "CQRS separates the write model (commands) from the read model (queries). Writing uses a normalized relational database optimized for ACID compliance and validation, while reading uses denormalized read stores (such as Elasticsearch or MongoDB) optimized for fast queries. When a write completes, an event is emitted to update the read models asynchronously. The system accepts eventual consistency in exchange for massive read scalability and query flexibility.",
    follow_up_questions: [
      "How do user interfaces handle eventual consistency lag when a user creates a record and is immediately redirected to a list view?",
      "How does Event Sourcing complement CQRS?"
    ],
    estimated_minutes: 15
  });

  addQ({
    id: "micro-08",
    skill_slug: "microservices",
    skill_name: "Microservices",
    skill_category: "java-backend",
    topic: "Observability and configuration",
    subtopic: "Externalized Configuration & Spring Cloud Config",
    question_title: "How is configuration externalized and dynamically refreshed in microservices?",
    question_prompt: "Explain the 12-Factor App principle for configuration. Compare Spring Cloud Config Server with Kubernetes ConfigMaps and Secrets. How does @RefreshScope enable dynamic property updates without restarting services?",
    question_type: "practical_scenario",
    difficulty: "intermediate",
    priority: "medium",
    expected_answer_points: [
      "12-Factor App rule: Strict separation of config from code; store config in environment or external store.",
      "Spring Cloud Config: Central Git-backed configuration server providing versioned property files over HTTP.",
      "@RefreshScope: Spring Cloud annotation that recreates beans when /actuator/refresh is called or Spring Cloud Bus emits a refresh event, reloading property values without restarting JVM.",
      "Kubernetes approach: ConfigMaps (non-sensitive properties) and Secrets (base64-encoded/vault-mounted credentials) mounted as environment variables or filesystem volumes. Standard in modern cloud deployments."
    ],
    sample_answer: "Externalized configuration separates code from environment settings (12-Factor App). Spring Cloud Config centralizes configuration in a Git repository and serves properties over HTTP. Beans annotated with @RefreshScope can be re-instantiated at runtime when an actuator refresh event occurs. In modern cloud-native architectures, Kubernetes ConfigMaps and Secrets are preferred, mounting configuration as environment variables or volume files directly into pods.",
    follow_up_questions: [
      "What are the security risks of mounting sensitive credentials via plain environment variables in Kubernetes?",
      "How does HashiCorp Vault integrate with Spring Cloud Vault for dynamic secret rotation?"
    ],
    estimated_minutes: 12
  });

  addQ({
    id: "micro-09",
    skill_slug: "microservices",
    skill_name: "Microservices",
    skill_category: "java-backend",
    topic: "Resilience, retries and circuit breakers",
    subtopic: "Rate Limiting & Bulkhead Patterns",
    question_title: "Explain the Bulkhead and Rate Limiter resilience patterns in Resilience4j.",
    question_prompt: "How does the Bulkhead pattern (Semaphore vs ThreadPool) prevent one failing component from consuming all server resources? How does the Token Bucket rate limiter protect services from overload?",
    question_type: "conceptual",
    difficulty: "intermediate",
    priority: "high",
    expected_answer_points: [
      "Bulkhead origin: Watertight compartments in ships that prevent the entire vessel from sinking if one section breaches.",
      "ThreadPool Bulkhead: Isolates operations into dedicated thread pools with bounded queues. If service A becomes slow, only its thread pool exhausts, leaving threads available for service B.",
      "Semaphore Bulkhead: Limits the number of concurrent executions using a semaphore without creating separate thread pools (low overhead).",
      "Rate Limiter: Limits request invocations per time window (e.g. 100 requests per second) to prevent resource starvation or comply with external API quotas."
    ],
    sample_answer: "The Bulkhead pattern partitions system resources so that failures in one component cannot exhaust the entire application. Resilience4j offers ThreadPool bulkheads (isolating tasks into separate thread pools with bounded queues) and Semaphore bulkheads (capping concurrent executions on the current thread). The Rate Limiter restricts the number of calls per time period, protecting downstream dependencies from sudden traffic spikes.",
    follow_up_questions: [
      "When would you choose a Semaphore Bulkhead over a ThreadPool Bulkhead?",
      "How does Resilience4j TimeLimiter differ from standard connection timeouts?"
    ],
    estimated_minutes: 12
  });

  addQ({
    id: "micro-10",
    skill_slug: "microservices",
    skill_name: "Microservices",
    skill_category: "java-backend",
    topic: "Service boundaries and decomposition",
    subtopic: "Domain-Driven Design (DDD) Service Boundaries",
    question_title: "How do you decompose a Monolith into Microservices using Domain-Driven Design (DDD)?",
    question_prompt: "Explain Bounded Contexts, Ubiquitous Language, Aggregate Roots, and the Strangler Fig pattern for migrating legacy monoliths to microservices.",
    question_type: "conceptual",
    difficulty: "advanced",
    priority: "high",
    expected_answer_points: [
      "Bounded Context: Explicit boundary within which a domain model applies. The term 'Account' may mean a billing profile in the Billing context, but user login credentials in the Identity context.",
      "Aggregate Root: Cluster of domain objects treated as a single unit for data changes (e.g. Order and OrderItems). External objects only hold references to the Aggregate Root.",
      "Database per Service: Each microservice must own its private database; direct cross-database queries are forbidden.",
      "Strangler Fig pattern: Incrementally replace pieces of the monolith by placing an API Gateway in front and routing new or migrated endpoints to microservices until the monolith is retired."
    ],
    sample_answer: "Domain-Driven Design identifies microservice boundaries by finding Bounded Contexts, where terms have specific business meanings (e.g. Customer in Sales vs Support). Each microservice owns its domain aggregates and private database. Rather than a risky rewrite, teams use the Strangler Fig pattern: placing an API Gateway in front of the monolith and intercepting specific functionality (e.g. Notification or Order Service) into new microservices incrementally until the monolith is shrunk.",
    follow_up_questions: [
      "What is the anti-pattern known as a 'Distributed Monolith'?",
      "Why must microservices never share a common relational database schema?"
    ],
    estimated_minutes: 15
  });

  addQ({
    id: "micro-11",
    skill_slug: "microservices",
    skill_name: "Microservices",
    skill_category: "java-backend",
    topic: "Inter-service communication",
    subtopic: "OpenFeign Declarative REST Client",
    question_title: "How does Spring Cloud OpenFeign simplify HTTP inter-service communication?",
    question_prompt: "Explain how Spring Cloud OpenFeign creates declarative REST clients from Java interfaces. How do you configure timeouts, custom ErrorDecoder, RequestInterceptor (for JWT forwarding), and Fallbacks?",
    question_type: "coding",
    difficulty: "intermediate",
    priority: "high",
    expected_answer_points: [
      "Declarative: Define a Java interface with Spring MVC annotations (@GetMapping, @PathVariable) and annotate with @FeignClient(name = 'payment-service'). Spring generates the dynamic proxy implementation.",
      "Timeouts: Configure connectTimeout and readTimeout per client in application.yml.",
      "RequestInterceptor: Intercepts outgoing requests to copy authentication headers (e.g. Bearer token from incoming request) into the downstream Feign call.",
      "ErrorDecoder: Maps HTTP 4xx/5xx responses from the downstream service into specific Java domain exceptions instead of generic FeignException.",
      "Resilience: Integrates with Resilience4j for circuit breakers and fallback factory implementations."
    ],
    sample_answer: "Spring Cloud OpenFeign allows writing declarative HTTP clients: you define an interface with Spring MVC annotations, and Feign generates the proxy implementation at runtime. Use RequestInterceptor to copy authorization tokens from the current SecurityContext into outgoing Feign requests. Custom ErrorDecoder implementations translate downstream HTTP errors into application exceptions. Pairing Feign with Resilience4j provides circuit breakers and fallback handling.",
    follow_up_questions: [
      "Why must you use a FallbackFactory instead of a simple fallback class if you need access to the root cause exception?",
      "What HTTP client does Feign use by default, and why should it be replaced with Apache HttpClient or OkHttp?"
    ],
    estimated_minutes: 12
  });

  // --- APACHE KAFKA (11) ---
  addQ({
    id: "kafka-01",
    skill_slug: "apache-kafka",
    skill_name: "Apache Kafka",
    skill_category: "java-backend",
    topic: "Topics, partitions and offsets",
    subtopic: "Kafka Architecture & Partitions",
    question_title: "Explain the internal architecture of Apache Kafka: Brokers, Topics, Partitions, and Offsets.",
    question_prompt: "How does Kafka organize data? Explain how partitions provide horizontal scalability, how record keys determine partition assignment, and how sequential append-only logs enable high write throughput.",
    question_type: "conceptual",
    difficulty: "intermediate",
    priority: "critical",
    expected_answer_points: [
      "Topic: Logical stream of records. Split into one or more Partitions.",
      "Partition: An ordered, immutable commit log of records. Unit of parallelism and horizontal scale in Kafka.",
      "Offset: Unique, monotonically increasing integer assigned to each message within a partition.",
      "Key partitioning: Records with the same non-null key are hashed (murmur2) and guaranteed to land on the exact same partition, preserving strict ordering.",
      "High throughput: Kafka writes to disk sequentially (O(1) append), relies on OS page cache, and uses the zero-copy sendfile system call to transmit bytes directly from page cache to network socket."
    ],
    sample_answer: "Kafka organizes data into Topics, which are split across multiple Partitions for parallel processing. A partition is an immutable append-only commit log on disk where each record receives a sequential Offset. If a message has a key, Kafka hashes it to assign it to a specific partition, guaranteeing strict per-key ordering. Kafka achieves high throughput by leveraging sequential disk I/O, heavy use of OS page cache, and zero-copy network transfer.",
    follow_up_questions: [
      "What happens to message ordering if a topic has multiple partitions and messages have null keys?",
      "Can Kafka partition count be decreased on an existing topic?"
    ],
    estimated_minutes: 15
  });

  addQ({
    id: "kafka-02",
    skill_slug: "apache-kafka",
    skill_name: "Apache Kafka",
    skill_category: "java-backend",
    topic: "Consumer groups and rebalancing",
    subtopic: "Consumer Groups & Rebalance Protocol",
    question_title: "How do Consumer Groups work, and what triggers a Consumer Rebalance?",
    question_prompt: "Explain how partitions are assigned across consumers in a consumer group. What happens when consumer count > partition count? What causes consumer rebalances, and how do Cooperative Sticky Assignors reduce rebalance stop-the-world pauses?",
    question_type: "conceptual",
    difficulty: "advanced",
    priority: "critical",
    expected_answer_points: [
      "Consumer Group: A group of consumers cooperating to consume a topic. Each partition is assigned to exactly one consumer within the group at any time.",
      "Sizing rule: If consumers > partitions, surplus consumers sit idle with 0 partitions assigned.",
      "Rebalance triggers: 1) Consumer joins or leaves (clean shutdown or crash); 2) Consumer heartbeat failure (max.poll.interval.ms exceeded or heartbeat.interval.ms timeout); 3) New partitions added to topic.",
      "Eager rebalancing: All consumers revoke all partitions and stop consuming until reassignment finishes (stop-the-world).",
      "Cooperative Sticky Rebalance: Only revokes and reassigns partitions that actually need to move, allowing unaffected consumers to continue processing without interruption."
    ],
    sample_answer: "A Consumer Group allows multiple consumers to parallelize reading a topic: each partition is consumed by only one worker in the group. If consumers exceed partitions, extra consumers remain idle. A rebalance occurs when consumers join, crash, or fail to send heartbeats (or exceed max.poll.interval.ms). Modern Kafka uses Cooperative Sticky Assignors, which migrate only reassigned partitions instead of stopping all consumption, drastically reducing rebalance pause times.",
    follow_up_questions: [
      "What is the difference between session.timeout.ms and max.poll.interval.ms?",
      "What causes a consumer to get kicked out of a group for taking too long to process a batch?"
    ],
    estimated_minutes: 15
  });

  addQ({
    id: "kafka-03",
    skill_slug: "apache-kafka",
    skill_name: "Apache Kafka",
    skill_category: "java-backend",
    topic: "Delivery semantics and idempotency",
    subtopic: "Delivery Semantics & Idempotent Producers",
    question_title: "Compare At-least-once, At-most-once, and Exactly-once Delivery in Kafka.",
    question_prompt: "Explain the three message delivery semantics in Kafka. How does enabling enable.idempotence=true on the producer prevent duplicate writes during network retries?",
    question_type: "conceptual",
    difficulty: "intermediate",
    priority: "critical",
    expected_answer_points: [
      "At-most-once: Offsets committed before processing message. If processing crashes, message is lost. Zero duplicates, but potential data loss.",
      "At-least-once (default): Offsets committed after message processing. If crash occurs during processing, message is re-consumed. No data loss, but duplicate processing possible.",
      "Exactly-once (EOS): End-to-end guarantee that each message is processed effectively once using transactional producer and read_committed isolation.",
      "Idempotent Producer: Set enable.idempotence=true (default in Kafka 3+). Broker assigns Producer ID (PID) and tracks sequence numbers per partition. If a network ack drops and producer retries, broker detects duplicate sequence number and commits write only once."
    ],
    sample_answer: "At-most-once commits offsets before processing, risking data loss on failure. At-least-once commits offsets after successful processing, preventing loss but requiring consumers to handle duplicates. With enable.idempotence=true, Kafka assigns a Producer ID and sequence numbers: if a producer retries a message due to a dropped network ack, the broker recognizes the duplicate sequence number and logs it only once without error, preventing producer-side duplicates.",
    follow_up_questions: [
      "What settings are automatically enforced when enable.idempotence=true (acks=all, retries=MAX)?",
      "Why must consumers implement their own business-level idempotency even with Kafka's idempotent producer?"
    ],
    estimated_minutes: 15
  });

  addQ({
    id: "kafka-04",
    skill_slug: "apache-kafka",
    skill_name: "Apache Kafka",
    skill_category: "java-backend",
    topic: "Producers and consumers",
    subtopic: "Producer ACKs and In-Sync Replicas",
    question_title: "How do Producer acks (0, 1, all) and min.insync.replicas prevent data loss?",
    question_prompt: "Explain acks=0, acks=1, and acks=all (-1). How does pairing acks=all with min.insync.replicas=2 guarantee zero data loss when a Kafka broker crashes?",
    question_type: "conceptual",
    difficulty: "intermediate",
    priority: "critical",
    expected_answer_points: [
      "acks=0: Producer does not wait for broker response. Lowest latency, highest data loss risk.",
      "acks=1: Producer waits until the partition leader broker writes message to its local log. Data is lost if leader crashes before replicas fetch.",
      "acks=all (-1): Producer waits until the leader and ALL In-Sync Replicas (ISR) acknowledge the write.",
      "min.insync.replicas: Minimum number of replicas that must acknowledge a write when acks=all. If replication factor is 3 and min.insync.replicas is 2, the write succeeds as long as at least 2 brokers are in sync. If only 1 broker is up, the producer throws NotEnoughReplicasException."
    ],
    sample_answer: "acks=0 sends without waiting; acks=1 waits only for the leader broker (risking data loss if leader dies before replication). acks=all requires acknowledgment from all In-Sync Replicas (ISR). Combined with min.insync.replicas=2 on a topic with replication factor 3, a message is guaranteed committed to at least two independent broker disks before success is returned. This guarantees zero data loss even if the partition leader experiences a sudden hardware crash.",
    follow_up_questions: [
      "What happens if available in-sync brokers drop below min.insync.replicas?",
      "What is unclean.leader.election.enable and why should it be set to false in production?"
    ],
    estimated_minutes: 12
  });

  addQ({
    id: "kafka-05",
    skill_slug: "apache-kafka",
    skill_name: "Apache Kafka",
    skill_category: "java-backend",
    topic: "Retries, dead-letter topics and ordering",
    subtopic: "Dead-Letter Topics & Non-Blocking Retries",
    question_title: "How do you implement Non-Blocking Retries and Dead-Letter Topics (DLT) in Spring Kafka?",
    question_prompt: "Why is blocking retry (Thread.sleep) an anti-pattern in Kafka consumers? Explain how @RetryableTopic creates retry topics (e.g. order-retry-1000, order-retry-5000) and a Dead-Letter Topic (order-dlt).",
    question_type: "practical_scenario",
    difficulty: "advanced",
    priority: "critical",
    expected_answer_points: [
      "Blocking retry issue: Sleeping the consumer thread pauses partition consumption, increases latency for subsequent valid messages, and risks max.poll.interval.ms timeout (causing consumer group rebalances).",
      "Non-blocking retry: Forward failed message to a dedicated retry topic with backoff delay, acknowledge the original offset, and continue processing new partition records.",
      "@RetryableTopic in Spring Kafka: Automatically configures a series of retry topics with exponential backoff and a final Dead-Letter Topic (topic-dlt).",
      "@DltHandler: Method annotated to handle terminal failures, logging alerts or saving poisoned pills for manual operator investigation."
    ],
    sample_answer: "Blocking consumer retries with Thread.sleep blocks the entire partition and can trigger rebalances by exceeding max.poll.interval.ms. Instead, Spring Kafka's @RetryableTopic provides non-blocking retries: when an error occurs, the message is routed to an intermediate retry topic (e.g. topic-retry-1000) with a timestamp header while the main topic continues consuming. If retries exhaust, it forwards to a Dead-Letter Topic (DLT) handled by a @DltHandler method for alerting.",
    follow_up_questions: [
      "What happens to message ordering when non-blocking retry topics are used?",
      "Which exceptions should be configured as non-retryable (e.g. DeserializationException) to route directly to DLT?"
    ],
    estimated_minutes: 15
  });

  addQ({
    id: "kafka-06",
    skill_slug: "apache-kafka",
    skill_name: "Apache Kafka",
    skill_category: "java-backend",
    topic: "Spring Kafka integration",
    subtopic: "@KafkaListener & Manual Ack Modes",
    question_title: "How does @KafkaListener handle offset commits across different AckModes?",
    question_prompt: "Explain AckMode.BATCH, AckMode.RECORD, and AckMode.MANUAL_IMMEDIATE in Spring Kafka. How do you inject Acknowledgment and ensure offsets are committed only after database transaction commits?",
    question_type: "coding",
    difficulty: "intermediate",
    priority: "high",
    expected_answer_points: [
      "Spring Kafka ContainerProperties.AckMode controls when consumer commits offsets to the __consumer_offsets topic.",
      "BATCH (default): Commits offsets for all records returned by poll() once the listener finishes processing the entire batch.",
      "RECORD: Commits offset after each individual record is processed by the listener.",
      "MANUAL / MANUAL_IMMEDIATE: Listener method accepts Acknowledgment ack parameter; developer explicitly calls ack.acknowledge() after business logic and DB transactions complete.",
      "Sync with DB: Calling ack.acknowledge() inside a local transaction or using ChainedKafkaTransactionManager ensures offsets are committed only if DB write succeeds."
    ],
    sample_answer: "Spring Kafka provides AckModes to control offset commits. AckMode.BATCH commits after all records in a poll batch execute; AckMode.RECORD commits after each message. For zero-data-loss guarantees, use AckMode.MANUAL_IMMEDIATE: inject Acknowledgment into @KafkaListener(topics = 'orders') and call ack.acknowledge() only after the local database transaction has committed successfully, ensuring uncommitted messages will be re-processed if a crash occurs.",
    follow_up_questions: [
      "What happens if an exception is thrown in @KafkaListener before ack.acknowledge() is called?",
      "How do you configure batch consumption using List<ConsumerRecord<K,V>> in @KafkaListener?"
    ],
    estimated_minutes: 12
  });

  addQ({
    id: "kafka-07",
    skill_slug: "apache-kafka",
    skill_name: "Apache Kafka",
    skill_category: "java-backend",
    topic: "Producers and consumers",
    subtopic: "Consumer Lag Monitoring",
    question_title: "What is Consumer Lag, why does it accumulate, and how do you monitor it?",
    question_prompt: "Define Consumer Lag (Log End Offset minus Current Offset). What causes lag to spike in production, and how do you monitor it using Kafka Exporter, Prometheus, and Burrow?",
    question_type: "practical_scenario",
    difficulty: "intermediate",
    priority: "high",
    expected_answer_points: [
      "Consumer Lag = (Log End Offset of partition) - (Current Committed Offset of consumer group). Represents unprocessed messages in the pipeline.",
      "Causes of lag spikes: 1) Downstream bottleneck (slow database queries, external API rate limits); 2) Insufficient consumer concurrency (consumer threads < partition count); 3) Frequent rebalances; 4) Heavy processing logic per record.",
      "Monitoring: Use kafka-consumer-groups.sh --describe, Prometheus Kafka Exporter, or LinkedIn Burrow.",
      "Remediation: Scale consumer instances (up to partition count), optimize record processing time, enable batch processing, or increase partition count."
    ],
    sample_answer: "Consumer Lag is the delta between the latest offset written by producers (Log End Offset) and the latest offset committed by consumers. A growing lag indicates consumers cannot keep pace with producer throughput—often due to slow database I/O, downstream API bottlenecks, or insufficient consumer threads. Monitor lag using Prometheus Kafka Exporter or Burrow, and resolve it by scaling consumers up to partition count, tuning batch sizes, or optimizing database persistence.",
    follow_up_questions: [
      "Can adding more consumers reduce lag if the consumer count already equals the partition count?",
      "How can thread-pool parallelization inside a single consumer be achieved safely while maintaining per-key ordering?"
    ],
    estimated_minutes: 12
  });

  addQ({
    id: "kafka-08",
    skill_slug: "apache-kafka",
    skill_name: "Apache Kafka",
    skill_category: "java-backend",
    topic: "Topics, partitions and offsets",
    subtopic: "Log Compaction in Kafka",
    question_title: "How does Log Compaction work in Kafka, and what are its primary use cases?",
    question_prompt: "Explain the difference between log deletion (cleanup.policy=delete) and log compaction (cleanup.policy=compact). How does compaction retain the latest value for each key?",
    question_type: "conceptual",
    difficulty: "advanced",
    priority: "medium",
    expected_answer_points: [
      "cleanup.policy=delete: Deletes log segments after time retention (retention.ms) or size retention (retention.bytes).",
      "cleanup.policy=compact: Retains at least the latest record for each message key within the partition, discarding older records with the same key.",
      "Tombstone record: A message with a key and a null payload indicates deletion; compaction cleans up previous values and eventually purges the tombstone.",
      "Use cases: Restoring in-memory state stores (KTable), user profile snapshots, database CDC streams, or configuration caches.",
      "Log Cleaner thread: Runs in background, scanning segments and deduplicating keys into compacted segments."
    ],
    sample_answer: "Log compaction (cleanup.policy=compact) retains the most recent message for every key in a partition rather than deleting records by time. When the background cleaner runs, older records with identical keys are discarded. A record with a null payload acts as a 'tombstone' to delete the key. Compaction allows Kafka topics to serve as durable changelog stores for restoring state stores (such as Kafka Streams KTables or local service caches) upon restart.",
    follow_up_questions: [
      "What is the role of delete.retention.ms for tombstone records in compacted topics?",
      "Why does a compacted topic still require active segment roll over?"
    ],
    estimated_minutes: 12
  });

  addQ({
    id: "kafka-09",
    skill_slug: "apache-kafka",
    skill_name: "Apache Kafka",
    skill_category: "java-backend",
    topic: "Retries, dead-letter topics and ordering",
    subtopic: "Strict Message Ordering Guarantees",
    question_title: "How do you guarantee strict FIFO message ordering in Apache Kafka?",
    question_prompt: "Explain how Kafka achieves strict message ordering. Why is ordering only guaranteed within a single partition? What producer configuration (max.in.flight.requests.per.connection) is critical to prevent out-of-order retries?",
    question_type: "conceptual",
    difficulty: "intermediate",
    priority: "high",
    expected_answer_points: [
      "Partition-level guarantee: Kafka guarantees order ONLY within a single partition, never across multiple partitions of a topic.",
      "Key hashing: All records requiring strict ordering (e.g. order lifecycle events: Created, Paid, Shipped) must share the exact same key (orderId).",
      "Producer in-flight setting: If retries occur with max.in.flight.requests.per.connection > 1 without idempotence, batch 1 can fail, batch 2 can succeed, and batch 1 retry arrives second, reordering data.",
      "With enable.idempotence=true: max.in.flight.requests.per.connection can be set up to 5 while maintaining strict ordering because broker enforces sequence numbers.",
      "Consumer concurrency: Consumer must process partition sequentially (single thread per partition)."
    ],
    sample_answer: "Kafka guarantees strict FIFO ordering only within a single partition. To guarantee order for a domain entity, publish all its events using the same message key (e.g. orderId). On the producer side, enable enable.idempotence=true and set max.in.flight.requests.per.connection <= 5 to prevent retries from reordering batches. On the consumer side, ensure records from a partition are processed sequentially rather than dispatched out of order across thread pools.",
    follow_up_questions: [
      "What happens to ordering if a topic's partition count is increased while producing messages with keys?",
      "How does Kafka handle message ordering when a consumer encounters a deserialization error?"
    ],
    estimated_minutes: 12
  });

  addQ({
    id: "kafka-10",
    skill_slug: "apache-kafka",
    skill_name: "Apache Kafka",
    skill_category: "java-backend",
    topic: "Topics, partitions and offsets",
    subtopic: "KRaft vs Apache ZooKeeper",
    question_title: "What is KRaft (Kafka Raft Metadata Mode), and why was ZooKeeper removed?",
    question_prompt: "Explain the transition from ZooKeeper to KRaft in Kafka 3.x+. How does having an internal Raft metadata quorum improve metadata propagation, partition limits, and broker recovery?",
    question_type: "conceptual",
    difficulty: "intermediate",
    priority: "medium",
    expected_answer_points: [
      "ZooKeeper role: Previously stored cluster metadata, broker registrations, topic configurations, and partition leader elections.",
      "ZooKeeper bottlenecks: External cluster dependency, slow metadata synchronization across brokers, limits cluster capacity to ~200k partitions.",
      "KRaft: Event-driven Raft consensus algorithm built directly inside Kafka brokers as an internal quorum of controllers.",
      "Benefits: Supports millions of partitions, instant broker recovery (metadata already loaded in memory), single unified system to manage, and faster controller failover."
    ],
    sample_answer: "ZooKeeper was an external dependency that synchronized cluster state; it created a separate operational cluster, suffered from synchronization bottlenecks, and limited topics to ~200,000 partitions. KRaft (Kafka Raft) replaces ZooKeeper by embedding a native Raft consensus quorum directly within designated Kafka broker controllers. This enables faster failover, scales to millions of partitions, and simplifies deployments by eliminating the separate ZooKeeper cluster.",
    follow_up_questions: [
      "What is the difference between a broker and a controller in a KRaft cluster?",
      "How is metadata stored in a KRaft cluster (__cluster_metadata topic)?"
    ],
    estimated_minutes: 10
  });

  addQ({
    id: "kafka-11",
    skill_slug: "apache-kafka",
    skill_name: "Apache Kafka",
    skill_category: "java-backend",
    topic: "Producers and consumers",
    subtopic: "Schema Registry & Avro Serialization",
    question_title: "How does Confluent Schema Registry with Apache Avro enforce backward compatibility?",
    question_prompt: "Why use Schema Registry with binary Avro/Protobuf instead of plain JSON in enterprise Kafka? Explain BACKWARD, FORWARD, and FULL schema compatibility modes.",
    question_type: "conceptual",
    difficulty: "advanced",
    priority: "high",
    expected_answer_points: [
      "Plain JSON problems: Verbose payloads (large network overhead), no compile-time contract, breaking schema changes go undetected until consumers crash at runtime.",
      "Schema Registry + Avro: Messages are serialized to compact binary without field names; the message carries only a 4-byte Schema ID in its header.",
      "Consumers fetch schema from Schema Registry once and cache it, validating types at runtime.",
      "BACKWARD compatibility (default): New consumer can read data written by old producer (new schema can add optional fields with defaults or delete fields).",
      "FULL compatibility: Old and new schemas can read data written by each other, enabling zero-downtime rolling upgrades."
    ],
    sample_answer: "Using plain JSON wastes bandwidth and risks runtime consumer deserialization crashes when producers change fields. Confluent Schema Registry enforces central schema governance: producers register schemas and send compact binary Avro payloads containing only a 4-byte schema ID. The registry validates schema evolution rules (e.g. BACKWARD or FULL compatibility) to guarantee that new producers cannot publish breaking changes that crash existing consumers.",
    follow_up_questions: [
      "What is a poison pill message in Kafka and how does ErrorHandlingDeserializer handle it?",
      "How does Protobuf compare with Avro when used with Schema Registry?"
    ],
    estimated_minutes: 12
  });

  // --- SPRING AI, RAG AND TOOL CALLING (8) ---
  addQ({
    id: "spring-ai-01",
    skill_slug: "spring-ai",
    skill_name: "Spring AI, RAG and Tool Calling",
    skill_category: "java-backend",
    topic: "Model/provider abstraction",
    subtopic: "ChatClient & ChatModel Abstraction",
    question_title: "How does Spring AI abstract LLM providers using ChatModel and ChatClient?",
    question_prompt: "Explain how Spring AI provides a unified interface across OpenAI, Anthropic, Ollama, and Azure OpenAI using ChatModel and ChatClient. Fluent API building and provider swapping.",
    question_type: "conceptual",
    difficulty: "intermediate",
    priority: "medium",
    expected_answer_points: [
      "ChatModel: Core low-level abstraction that sends Prompt and receives ChatResponse.",
      "ChatClient: Fluent, high-level API introduced in Spring AI for assembling prompts, system instructions, advisors, and parameters (chatClient.prompt().system(...).user(...).call().content()).",
      "Portability: Application code programs against ChatClient; swapping from OpenAI to Ollama or Anthropic is a configuration change in application.yml without refactoring business logic.",
      "Streaming: Supports non-blocking reactive streaming responses via Flux<String> (.stream().content())."
    ],
    sample_answer: "Spring AI abstracts LLM providers through ChatModel and the fluent ChatClient API. Developers interact with a uniform API (chatClient.prompt().user(prompt).call().content()) rather than vendor-specific SDKs. By changing dependencies and application.properties (e.g. switching spring.ai.openai to spring.ai.ollama), the underlying provider can be swapped between OpenAI, Anthropic, or local Ollama without modifying application code.",
    follow_up_questions: [
      "How do you implement streaming LLM responses in Spring Boot using Server-Sent Events (SSE)?",
      "What is the role of CallResponseSpec in ChatClient?"
    ],
    estimated_minutes: 12
  });

  addQ({
    id: "spring-ai-02",
    skill_slug: "spring-ai",
    skill_name: "Spring AI, RAG and Tool Calling",
    skill_category: "java-backend",
    topic: "Prompt templates and structured output",
    subtopic: "Structured Output with BeanOutputConverter",
    question_title: "How do you enforce Structured Output (JSON to Java DTO) in Spring AI?",
    question_prompt: "Explain how BeanOutputConverter<T> formats prompt instructions to guarantee that the LLM responds in valid JSON adhering to a specific Java Record or Class schema.",
    question_type: "coding",
    difficulty: "intermediate",
    priority: "medium",
    expected_answer_points: [
      "LLMs generate unstructured text by default; enterprise applications require strongly-typed DTOs.",
      "BeanOutputConverter<MyDto>: Automatically generates JSON schema prompt instructions (format instructions) instructing the LLM to output valid JSON matching the DTO fields.",
      "The format string is injected into the PromptTemplate: template.create(Map.of('format', converter.getFormat())).",
      "converter.convert(response.getContent()) parses the LLM JSON string directly into a strongly-typed Java Record.",
      "Spring AI also supports native LLM Structured Outputs (JSON Schema mode) when supported by provider (OpenAI)."
    ],
    sample_answer: "Spring AI provides BeanOutputConverter<T> to guarantee structured output. It inspects a target Java record and generates JSON schema format instructions appended to the prompt template. When the LLM responds, the converter parses the raw JSON string into the strongly-typed Java DTO. On modern OpenAI models, Spring AI also supports native structured outputs (response_format: json_schema) to guarantee 100% schema compliance at the token generation level.",
    follow_up_questions: [
      "What happens if the LLM output is truncated due to max_tokens during JSON generation?",
      "How do MapOutputConverter and ListOutputConverter differ from BeanOutputConverter?"
    ],
    estimated_minutes: 12
  });

  addQ({
    id: "spring-ai-03",
    skill_slug: "spring-ai",
    skill_name: "Spring AI, RAG and Tool Calling",
    skill_category: "java-backend",
    topic: "Embeddings and vector retrieval concepts",
    subtopic: "EmbeddingModel & VectorStore Interface",
    question_title: "How do EmbeddingModel and VectorStore work in Spring AI?",
    question_prompt: "Explain how text is converted to dense vector embeddings using EmbeddingModel. Explain the VectorStore interface and how similarity search (cosine similarity) retrieves relevant documents.",
    question_type: "conceptual",
    difficulty: "intermediate",
    priority: "medium",
    expected_answer_points: [
      "EmbeddingModel: Transforms text into a high-dimensional vector of floating-point numbers (e.g. 1536 dimensions) capturing semantic meaning.",
      "VectorStore: Database abstraction (PgVectorStore, Milvus, Pinecone, Chroma) storing Document objects (text, metadata, vector embedding).",
      "Similarity Search: Given a user query, generate query embedding and compute distance (Cosine Similarity, Euclidean Distance, or Dot Product).",
      "SearchRequest: Encapsulates query, top-k results, similarity threshold (minScore), and metadata filter expressions."
    ],
    sample_answer: "An EmbeddingModel converts text into a high-dimensional floating-point vector representing semantic meaning. The VectorStore abstraction stores Document objects alongside their embeddings. When searching, Spring AI embeds the user's question and executes a similarity search (typically cosine similarity) in the vector store, returning the top-k most semantically relevant documents matching the query and metadata filters.",
    follow_up_questions: [
      "What is the mathematical difference between Cosine Similarity and Dot Product?",
      "Why must the same embedding model be used for both indexing documents and querying the vector store?"
    ],
    estimated_minutes: 12
  });

  addQ({
    id: "spring-ai-04",
    skill_slug: "spring-ai",
    skill_name: "Spring AI, RAG and Tool Calling",
    skill_category: "java-backend",
    topic: "RAG flow and grounding",
    subtopic: "RAG Pipeline Architecture",
    question_title: "Walk through an end-to-end Retrieval-Augmented Generation (RAG) pipeline in Spring AI.",
    question_prompt: "Trace the RAG workflow from document ingestion (DocumentReader, TokenTextSplitter, VectorStore) to runtime retrieval (QuestionAnswerAdvisor) and grounded prompt generation.",
    question_type: "conceptual",
    difficulty: "advanced",
    priority: "medium",
    expected_answer_points: [
      "1. Ingestion Phase: DocumentReader (PDF/Markdown) loads raw files. TokenTextSplitter chunks text into overlapping segments (e.g. 500 tokens with 50-token overlap). EmbeddingModel embeds chunks, and VectorStore saves them.",
      "2. Retrieval Phase: User query is embedded; VectorStore similarity search retrieves top-k chunks.",
      "3. Augmentation Phase: Retrieved chunks are injected as contextual grounding into a PromptTemplate alongside the user question.",
      "4. Generation Phase: ChatModel generates answer strictly grounded in the provided context, preventing hallucinations.",
      "5. Spring AI QuestionAnswerAdvisor: Automates retrieval and prompt augmentation transparently in ChatClient."
    ],
    sample_answer: "In the ingestion phase, documents are parsed by a DocumentReader, chunked into overlapping windows by a TokenTextSplitter, embedded by an EmbeddingModel, and stored in a VectorStore. At runtime, the QuestionAnswerAdvisor intercepts the user prompt, performs similarity search in the VectorStore, and injects the retrieved context chunks into the prompt. The LLM generates a response strictly grounded on that retrieved context, eliminating hallucinations.",
    follow_up_questions: [
      "Why is chunk overlap (e.g. 50-100 tokens) essential when splitting documents?",
      "How do metadata filters in VectorStore prevent users from retrieving documents belonging to another tenant?"
    ],
    estimated_minutes: 15
  });

  addQ({
    id: "spring-ai-05",
    skill_slug: "spring-ai",
    skill_name: "Spring AI, RAG and Tool Calling",
    skill_category: "java-backend",
    topic: "Tool/function calling",
    subtopic: "Function/Tool Calling Mechanics",
    question_title: "How does Function Calling (Tool Calling) work in Spring AI?",
    question_prompt: "Explain how LLMs execute external tools: exposing a standard Java @Bean Function<Request, Response>, registering with ChatClient, and handling the multi-turn tool execution loop.",
    question_type: "coding",
    difficulty: "advanced",
    priority: "high",
    expected_answer_points: [
      "LLMs cannot execute code directly; tool calling allows the LLM to output a structured request to call an external API or database.",
      "In Spring AI, any standard Java java.util.function.Function<Request, Response> annotated with @Description can serve as a tool.",
      "Registration: Exposed via @Bean and referenced in chatClient.prompt().tools('weatherFunction').",
      "Execution loop: 1) LLM inspects tool schema and decides to call the function with arguments; 2) Spring AI executes the local Java function; 3) Spring AI feeds function return value back to the LLM; 4) LLM generates the final natural language answer."
    ],
    sample_answer: "Tool calling connects LLMs to external systems. In Spring AI, define a standard java.util.function.Function<Request, Response> with a @Description explaining what the tool does and when to call it. Register the bean with ChatClient. When the user asks a question requiring real-time data, the LLM requests a tool call with generated parameters. Spring AI executes the Java function locally, returns the result to the LLM, and the LLM formats the final response for the user.",
    follow_up_questions: [
      "Why is the @Description annotation on the Function bean critical for the LLM?",
      "What security protections should be placed on tools that perform mutating database operations?"
    ],
    estimated_minutes: 15
  });

  addQ({
    id: "spring-ai-06",
    skill_slug: "spring-ai",
    skill_name: "Spring AI, RAG and Tool Calling",
    skill_category: "java-backend",
    topic: "RAG flow and grounding",
    subtopic: "Evaluating Hallucinations & Groundedness",
    question_title: "How do you detect and mitigate Hallucinations in LLM applications?",
    question_prompt: "Explain strategies to minimize hallucinations: system prompt constraints ('answer only from context'), temperature tuning, retrieval confidence thresholds, and evaluation frameworks (RAGAS / Trulens).",
    question_type: "practical_scenario",
    difficulty: "intermediate",
    priority: "medium",
    expected_answer_points: [
      "Hallucination: When an LLM generates factually incorrect or ungrounded assertions with high confidence.",
      "Mitigation 1: Prompt engineering — explicit system directives: 'Answer using only the provided context. If the answer cannot be found, respond with \"I do not know\"'.",
      "Mitigation 2: Hyperparameter tuning — reduce temperature to 0.0 or 0.2 for deterministic retrieval answers.",
      "Mitigation 3: Retrieval filtering — enforce a minimum cosine similarity score threshold (e.g. 0.75); do not call LLM if no chunks qualify.",
      "Evaluation: Frameworks evaluate Context Relevance, Groundedness (Faithfulness), and Answer Relevance."
    ],
    sample_answer: "Hallucinations occur when an LLM invents facts when context is missing. Mitigations include: 1) Setting temperature to near 0.0 to minimize stochastic randomness; 2) Enforcing strict system instructions mandating the model admit when context is insufficient; 3) Setting minimum vector similarity thresholds so irrelevant context is discarded; and 4) Automated evaluation pipelines (like RAGAS) measuring faithfulness and context relevance against test ground truth.",
    follow_up_questions: [
      "What is the difference between Faithfulness and Answer Relevance in RAG evaluation?",
      "What is Prompt Injection and how can input guardrails protect RAG applications?"
    ],
    estimated_minutes: 12
  });

  addQ({
    id: "spring-ai-07",
    skill_slug: "spring-ai",
    skill_name: "Spring AI, RAG and Tool Calling",
    skill_category: "java-backend",
    topic: "Safety, evaluation and cost control",
    subtopic: "Token Usage, Caching & Cost Control",
    question_title: "How do you monitor token usage and manage costs in enterprise LLM systems?",
    question_prompt: "Explain how to track token usage (prompt tokens, completion tokens) with Spring AI advisors and Micrometer metrics. How do semantic caching and prompt optimization control costs?",
    question_type: "practical_scenario",
    difficulty: "intermediate",
    priority: "medium",
    expected_answer_points: [
      "Cost structure: Cloud LLM providers bill per 1,000 / 1,000,000 prompt tokens and completion tokens.",
      "Observability: Spring AI emits Micrometer metrics capturing token counts (spring.ai.chat.client.tokens.prompt, tokens.completion) and execution latency.",
      "Semantic caching: Storing previous query embeddings and answers in Redis vector cache; if a new query has >95% similarity, return cached answer without calling the LLM.",
      "Prompt optimization: Trim superfluous documentation chunks, summarize conversation history, and use smaller models (e.g. GPT-4o-mini or Claude Haiku) for triage tasks."
    ],
    sample_answer: "LLM costs depend on input and output token volumes. Spring AI exports token metrics through Micrometer to Prometheus, tracking prompt and completion tokens per request. Costs are controlled by implementing Semantic Caching (checking Redis for near-identical query vectors before invoking LLMs), limiting vector chunk sizes, pruning chat history memory, and routing simple classification tasks to smaller, cost-effective models.",
    follow_up_questions: [
      "How does prompt caching (provider-level prefix caching) reduce LLM latency and cost?",
      "What is the difference between Exact Caching and Semantic Caching?"
    ],
    estimated_minutes: 12
  });

  addQ({
    id: "spring-ai-08",
    skill_slug: "spring-ai",
    skill_name: "Spring AI, RAG and Tool Calling",
    skill_category: "java-backend",
    topic: "Embeddings and vector retrieval concepts",
    subtopic: "pgvector with PostgreSQL in Spring AI",
    question_title: "How do you configure pgvector in PostgreSQL with Spring AI?",
    question_prompt: "Explain using PostgreSQL with the pgvector extension as a VectorStore in Spring Boot: vector column types, HNSW vs IVFFlat index types, and distance operators (<=> cosine).",
    question_type: "practical_scenario",
    difficulty: "intermediate",
    priority: "medium",
    expected_answer_points: [
      "pgvector extension: Adds 'vector' data type and similarity search operators to standard PostgreSQL.",
      "Spring AI integration: spring-ai-starter-model-pgvector auto-configures PgVectorStore backed by a JdbcTemplate / DataSource.",
      "Index types: IVFFlat (inverted file index, requires training data, faster build) vs HNSW (Hierarchical Navigable Small World: graph-based, superior recall and query speed at the cost of higher memory and build time).",
      "Distance operators: <=> (cosine distance), <-> (L2 Euclidean distance), <#> (negative inner product).",
      "Advantage: Eliminates dedicated vector database; allows joining vector embeddings with relational user and transaction tables in a single SQL query."
    ],
    sample_answer: "The pgvector extension equips PostgreSQL with a native vector data type and similarity index operators. Spring AI's PgVectorStore manages schema creation and embedding storage automatically. In production, use an HNSW index on the vector column with cosine distance (<=>), which provides superior query recall and performance under load compared to IVFFlat. The key architectural advantage is querying embeddings alongside relational data in a single ACID-compliant database.",
    follow_up_questions: [
      "What are the parameters m and ef_construction when tuning an HNSW index in pgvector?",
      "Why must the vector dimensions in the database schema strictly match the output dimension of the chosen EmbeddingModel?"
    ],
    estimated_minutes: 12
  });
};
