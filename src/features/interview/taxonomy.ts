export interface SkillInfo {
  slug: string;
  name: string;
  category: string;
  priority: "critical" | "high" | "medium" | "low";
}

export interface CategoryInfo {
  id: string;
  name: string;
  description: string;
  skills: SkillInfo[];
}

export const INTERVIEW_TAXONOMY: CategoryInfo[] = [
  {
    id: "programming-languages",
    name: "Programming Languages",
    description: "Core language runtime, memory model, semantics and syntax",
    skills: [
      { slug: "java", name: "Java", category: "programming-languages", priority: "critical" },
      { slug: "javascript", name: "JavaScript", category: "programming-languages", priority: "high" },
      { slug: "typescript", name: "TypeScript", category: "programming-languages", priority: "high" },
      { slug: "c", name: "C", category: "programming-languages", priority: "medium" },
      { slug: "cpp", name: "C++", category: "programming-languages", priority: "medium" },
    ],
  },
  {
    id: "java-backend",
    name: "Java Backend & Frameworks",
    description: "Enterprise Java ecosystem, dependency injection, ORM, security and messaging",
    skills: [
      { slug: "spring-framework", name: "Spring Core", category: "java-backend", priority: "critical" },
      { slug: "spring-boot", name: "Spring Boot", category: "java-backend", priority: "critical" },
      { slug: "spring-security", name: "Spring Security", category: "java-backend", priority: "critical" },
      { slug: "hibernate-jpa", name: "Hibernate & JPA", category: "java-backend", priority: "critical" },
      { slug: "microservices", name: "Microservices", category: "java-backend", priority: "critical" },
      { slug: "apache-kafka", name: "Apache Kafka", category: "java-backend", priority: "critical" },
      { slug: "spring-ai", name: "Spring AI", category: "java-backend", priority: "medium" },
    ],
  },
  {
    id: "frontend",
    name: "Frontend Development",
    description: "Modern UI engineering, component lifecycles, state management and SSR",
    skills: [
      { slug: "react", name: "React", category: "frontend", priority: "high" },
      { slug: "redux", name: "Redux Toolkit", category: "frontend", priority: "high" },
      { slug: "nextjs", name: "Next.js", category: "frontend", priority: "high" },
    ],
  },
  {
    id: "node-ecosystem",
    name: "Node.js Ecosystem",
    description: "Asynchronous JavaScript runtime, event loop, and web services",
    skills: [
      { slug: "nodejs", name: "Node.js", category: "node-ecosystem", priority: "high" },
      { slug: "expressjs", name: "Express.js", category: "node-ecosystem", priority: "medium" },
    ],
  },
  {
    id: "databases",
    name: "Databases & Storage",
    description: "Relational modeling, indexing, NoSQL, real-time databases and vector search",
    skills: [
      { slug: "sql", name: "SQL", category: "databases", priority: "critical" },
      { slug: "mysql", name: "MySQL", category: "databases", priority: "critical" },
      { slug: "mongodb", name: "MongoDB", category: "databases", priority: "high" },
      { slug: "firebase", name: "Firebase", category: "databases", priority: "medium" },
      { slug: "postgresql-pgvector", name: "PostgreSQL & pgvector", category: "databases", priority: "high" },
    ],
  },
  {
    id: "api-and-integration",
    name: "API & Integration",
    description: "RESTful architecture, authentication tokens, real-time streams and documentation",
    skills: [
      { slug: "rest-apis", name: "REST APIs", category: "api-and-integration", priority: "critical" },
      { slug: "websockets-sse", name: "WebSockets & SSE", category: "api-and-integration", priority: "medium" },
      { slug: "jwt", name: "JWT", category: "api-and-integration", priority: "high" },
      { slug: "postman", name: "Postman", category: "api-and-integration", priority: "medium" },
      { slug: "swagger-openapi", name: "Swagger / OpenAPI", category: "api-and-integration", priority: "medium" },
    ],
  },
  {
    id: "devops-tools",
    name: "DevOps & Build Tools",
    description: "Containerization, orchestration, version control, build tools and delivery",
    skills: [
      { slug: "docker", name: "Docker", category: "devops-tools", priority: "high" },
      { slug: "kubernetes", name: "Kubernetes", category: "devops-tools", priority: "high" },
      { slug: "git-github", name: "Git & GitHub", category: "devops-tools", priority: "high" },
      { slug: "maven", name: "Apache Maven", category: "devops-tools", priority: "high" },
      { slug: "cicd", name: "CI/CD", category: "devops-tools", priority: "medium" },
      { slug: "agile-scrum", name: "Agile & Scrum", category: "devops-tools", priority: "medium" },
    ],
  },
  {
    id: "computer-science",
    name: "Computer Science Fundamentals",
    description: "Database internals, operating system processes, concurrency and networking",
    skills: [
      { slug: "dbms", name: "DBMS", category: "computer-science", priority: "critical" },
      { slug: "operating-systems", name: "Operating Systems", category: "computer-science", priority: "high" },
      { slug: "computer-networks", name: "Computer Networks", category: "computer-science", priority: "high" },
    ],
  },
  {
    id: "system-design",
    name: "System Design",
    description: "Low-level object-oriented design and high-level distributed architecture",
    skills: [
      { slug: "lld", name: "Low-Level Design (LLD)", category: "system-design", priority: "critical" },
      { slug: "hld", name: "High-Level Design (HLD)", category: "system-design", priority: "critical" },
    ],
  },
  {
    id: "cloud-ai",
    name: "Cloud & Applied AI",
    description: "Cloud compute/storage primitives and LLM integration patterns",
    skills: [
      { slug: "aws-foundations", name: "AWS Foundations", category: "cloud-ai", priority: "medium" },
    ],
  },
  {
    id: "career-and-projects",
    name: "Projects & Behavioral",
    description: "Enterprise work experience, side projects architecture and behavioral leadership",
    skills: [
      { slug: "tcs-project-deep-dive", name: "TCS Enterprise Experience", category: "career-and-projects", priority: "critical" },
      { slug: "lovable-project-deep-dive", name: "Lovable AI Architecture", category: "career-and-projects", priority: "critical" },
      { slug: "behavioral", name: "Behavioral & Leadership", category: "career-and-projects", priority: "high" },
    ],
  },
];

export function getAllCategories(): CategoryInfo[] {
  return INTERVIEW_TAXONOMY;
}

export function getAllSkills(): SkillInfo[] {
  return INTERVIEW_TAXONOMY.flatMap((cat) => cat.skills);
}

export function getSkillBySlug(slug: string): SkillInfo | undefined {
  if (!slug) return undefined;
  const norm = slug.toLowerCase();
  const hyphenated = norm.replace(/_/g, "-");
  const underscored = norm.replace(/-/g, "_");
  return getAllSkills().find(
    (s) =>
      s.slug === norm ||
      s.slug === hyphenated ||
      s.slug === underscored ||
      s.slug.replace(/-/g, "_") === underscored
  );
}

export function getCategoryById(categoryId: string): CategoryInfo | undefined {
  if (!categoryId) return undefined;
  const norm = categoryId.toLowerCase();
  const hyphenated = norm.replace(/_/g, "-");
  const underscored = norm.replace(/-/g, "_");
  return INTERVIEW_TAXONOMY.find(
    (cat) =>
      cat.id === norm ||
      cat.id === hyphenated ||
      cat.id === underscored ||
      cat.id.replace(/-/g, "_") === underscored
  );
}
