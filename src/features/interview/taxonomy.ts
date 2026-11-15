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
    id: "programming_languages",
    name: "Programming Languages",
    description: "Core language runtime, memory model, semantics and syntax",
    skills: [
      { slug: "java", name: "Java", category: "programming_languages", priority: "critical" },
      { slug: "javascript", name: "JavaScript", category: "programming_languages", priority: "high" },
      { slug: "typescript", name: "TypeScript", category: "programming_languages", priority: "high" },
      { slug: "c", name: "C", category: "programming_languages", priority: "medium" },
      { slug: "cpp", name: "C++", category: "programming_languages", priority: "medium" },
    ],
  },
  {
    id: "java_backend",
    name: "Java Backend & Frameworks",
    description: "Enterprise Java ecosystem, dependency injection, ORM, security and messaging",
    skills: [
      { slug: "spring_core", name: "Spring Core", category: "java_backend", priority: "critical" },
      { slug: "spring_boot", name: "Spring Boot", category: "java_backend", priority: "critical" },
      { slug: "spring_security", name: "Spring Security", category: "java_backend", priority: "critical" },
      { slug: "hibernate_jpa", name: "Hibernate & JPA", category: "java_backend", priority: "critical" },
      { slug: "microservices", name: "Microservices", category: "java_backend", priority: "critical" },
      { slug: "kafka", name: "Apache Kafka", category: "java_backend", priority: "critical" },
      { slug: "spring_ai", name: "Spring AI", category: "java_backend", priority: "medium" },
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
    id: "node_ecosystem",
    name: "Node.js Ecosystem",
    description: "Asynchronous JavaScript runtime, event loop, and web services",
    skills: [
      { slug: "nodejs", name: "Node.js", category: "node_ecosystem", priority: "high" },
      { slug: "express", name: "Express.js", category: "node_ecosystem", priority: "medium" },
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
      { slug: "postgresql_pgvector", name: "PostgreSQL & pgvector", category: "databases", priority: "high" },
    ],
  },
  {
    id: "api_and_integration",
    name: "API & Integration",
    description: "RESTful architecture, authentication tokens, real-time streams and documentation",
    skills: [
      { slug: "rest_apis", name: "REST APIs", category: "api_and_integration", priority: "critical" },
      { slug: "websockets_sse", name: "WebSockets & SSE", category: "api_and_integration", priority: "medium" },
      { slug: "jwt", name: "JWT", category: "api_and_integration", priority: "high" },
      { slug: "postman", name: "Postman", category: "api_and_integration", priority: "medium" },
      { slug: "swagger", name: "Swagger / OpenAPI", category: "api_and_integration", priority: "medium" },
    ],
  },
  {
    id: "devops_tools",
    name: "DevOps & Build Tools",
    description: "Containerization, orchestration, version control, build tools and delivery",
    skills: [
      { slug: "docker", name: "Docker", category: "devops_tools", priority: "high" },
      { slug: "kubernetes", name: "Kubernetes", category: "devops_tools", priority: "high" },
      { slug: "git", name: "Git & GitHub", category: "devops_tools", priority: "high" },
      { slug: "maven", name: "Apache Maven", category: "devops_tools", priority: "high" },
      { slug: "ci_cd", name: "CI/CD", category: "devops_tools", priority: "medium" },
      { slug: "agile", name: "Agile & Scrum", category: "devops_tools", priority: "medium" },
    ],
  },
  {
    id: "computer_science",
    name: "Computer Science Fundamentals",
    description: "Database internals, operating system processes, concurrency and networking",
    skills: [
      { slug: "dbms", name: "DBMS", category: "computer_science", priority: "critical" },
      { slug: "os", name: "Operating Systems", category: "computer_science", priority: "high" },
      { slug: "networks", name: "Computer Networks", category: "computer_science", priority: "high" },
    ],
  },
  {
    id: "system_design",
    name: "System Design",
    description: "Low-level object-oriented design and high-level distributed architecture",
    skills: [
      { slug: "lld", name: "Low-Level Design (LLD)", category: "system_design", priority: "critical" },
      { slug: "hld", name: "High-Level Design (HLD)", category: "system_design", priority: "critical" },
    ],
  },
  {
    id: "cloud_ai",
    name: "Cloud & Applied AI",
    description: "Cloud compute/storage primitives and LLM integration patterns",
    skills: [
      { slug: "aws", name: "AWS Foundations", category: "cloud_ai", priority: "medium" },
    ],
  },
  {
    id: "career_and_projects",
    name: "Projects & Behavioral",
    description: "Enterprise work experience, side projects architecture and behavioral leadership",
    skills: [
      { slug: "tcs_project", name: "TCS Enterprise Experience", category: "career_and_projects", priority: "critical" },
      { slug: "lovable_ai_project", name: "Lovable AI Architecture", category: "career_and_projects", priority: "critical" },
      { slug: "behavioral", name: "Behavioral & Leadership", category: "career_and_projects", priority: "high" },
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
  return getAllSkills().find((s) => s.slug === slug);
}

export function getCategoryById(categoryId: string): CategoryInfo | undefined {
  return INTERVIEW_TAXONOMY.find((cat) => cat.id === categoryId);
}
